// Yjs provider for the NestJS gateway in backend/src/realtime/realtime.gateway.ts.
//
// Wire format (NestJS WsAdapter): JSON frames { event, data }.
//   client -> server  join      { documentId, yjsClientId }
//                     update    { documentId, update: number[], id }  (Yjs update; id is echoed in ack)
//                     awareness { documentId, update: number[] }      (y-protocols awareness update)
//   server -> client  sync      { documentId, state: number[], role } (full state, sent after join)
//                     update    { documentId, update: number[] }
//                     awareness { documentId, update: number[] }
//                     ack       { documentId, id }   the update is stored in the database
//                     role      { documentId, role } my role changed while the document is open
//                     meta      { documentId, title }
//                     error     { message, id? }  'ReadOnly' | 'PersistFailed' | ...
//   close(1008, 'Forbidden' | 'Unauthorized')
import * as Y from 'yjs';
import { Awareness, applyAwarenessUpdate, encodeAwarenessUpdate, removeAwarenessStates } from 'y-protocols/awareness';
import { WS_URL } from '../config.js';
import { freshToken, refreshAccessToken } from './api.js';

const REMOTE = Symbol('remote');

export class GatewayProvider {
  /**
   * @param {string} documentId
   * @param {Y.Doc} doc
   * @param {{ readOnly?: boolean, onStatus?: (s: Status) => void, onFatal?: (reason: 'forbidden'|'unauthorized') => void,
   *           onRole?: (role: string) => void, onTitle?: (title: string) => void }} opts
   * Status: { state: 'connecting'|'synced'|'sending'|'offline'|'error', pending: number }
   */
  constructor(documentId, doc, opts = {}) {
    this.documentId = documentId;
    this.doc = doc;
    this.awareness = new Awareness(doc);
    this.readOnly = !!opts.readOnly;
    this.onStatus = opts.onStatus || (() => {});
    this.onFatal = opts.onFatal || (() => {});
    this.onRole = opts.onRole || (() => {});
    this.onTitle = opts.onTitle || (() => {});
    this.seq = 0;
    this.unacked = new Set();  // update ids sent but not yet stored by the server
    this.saveFailed = false;
    this.ws = null;
    this.synced = false;
    this.pending = 0;          // local updates made while not connected
    this.retry = 0;
    this.closedByUs = false;
    this.authRetried = false;

    this._onDocUpdate = (update, origin) => {
      if (origin === REMOTE || this.readOnly) return;
      if (this.synced && this.ws?.readyState === WebSocket.OPEN) {
        this._sendUpdate(update);
        this._emit();
      } else {
        this.pending++;
        this._emit();
      }
    };
    this._onAwareness = ({ added, updated, removed }, origin) => {
      if (origin === REMOTE) return;
      const changed = added.concat(updated, removed);
      if (this.synced && this.ws?.readyState === WebSocket.OPEN) {
        this._send('awareness', { update: Array.from(encodeAwarenessUpdate(this.awareness, changed)) });
      }
    };
    this._onOnline = () => { if (!this.ws) this.connect(); };
    this._onOffline = () => this.ws?.close();
    this._onUnload = () => removeAwarenessStates(this.awareness, [doc.clientID], 'window unload');

    doc.on('update', this._onDocUpdate);
    this.awareness.on('update', this._onAwareness);
    addEventListener('online', this._onOnline);
    addEventListener('offline', this._onOffline);
    addEventListener('beforeunload', this._onUnload);
    this.connect();
  }

  status() {
    const open = this.ws?.readyState === WebSocket.OPEN;
    if (!open && !navigator.onLine) return { state: 'offline', pending: this.pending };
    if (!open || !this.synced) return { state: this.retry > 0 ? 'offline' : 'connecting', pending: this.pending };
    if (this.saveFailed) return { state: 'error', pending: this.unacked.size };
    // "Saved" means the server confirmed it wrote every update to the database.
    return { state: this.unacked.size > 0 ? 'sending' : 'synced', pending: 0 };
  }

  _sendUpdate(update) {
    const id = ++this.seq;
    this.unacked.add(id);
    this._send('update', { update: Array.from(update), id });
  }

  // The server already applies the new role to this socket; no reconnect needed.
  setReadOnly(readOnly) { this.readOnly = readOnly; }
  _emit() { this.onStatus(this.status()); }

  _send(event, data) {
    this.ws?.send(JSON.stringify({ event, data: { documentId: this.documentId, ...data } }));
  }

  async connect() {
    if (this.closedByUs) return;
    this._emit();
    let token;
    try { token = await freshToken(); }
    catch { this.onFatal('unauthorized'); return; }

    const ws = new WebSocket(`${WS_URL}?token=${encodeURIComponent(token)}`);
    this.ws = ws;
    ws.onopen = () => {
      this._send('join', { yjsClientId: this.doc.clientID });
    };
    ws.onmessage = (e) => {
      let msg;
      try { msg = JSON.parse(e.data); } catch { return; }
      const { event, data } = msg;
      if (!data || (data.documentId && data.documentId !== this.documentId)) return;
      if (event === 'sync') {
        const state = new Uint8Array(data.state);
        if (data.role) { this.readOnly = data.role === 'VIEWER'; this.onRole(data.role); }
        Y.applyUpdate(this.doc, state, REMOTE);
        this.unacked.clear(); this.saveFailed = false;
        // Send whatever we have that the server does not (edits made while offline).
        if (!this.readOnly) {
          const diff = Y.encodeStateAsUpdate(this.doc, Y.encodeStateVectorFromUpdate(state));
          if (diff.byteLength > 2) this._sendUpdate(diff);
        }
        this.synced = true; this.retry = 0; this.pending = 0; this.authRetried = false;
        this._send('awareness', { update: Array.from(encodeAwarenessUpdate(this.awareness, [this.doc.clientID])) });
        this._emit();
        this._tick ??= setInterval(() => this._emit(), 800);
      } else if (event === 'update') {
        Y.applyUpdate(this.doc, new Uint8Array(data.update), REMOTE);
      } else if (event === 'awareness') {
        applyAwarenessUpdate(this.awareness, new Uint8Array(data.update), REMOTE);
      } else if (event === 'ack') {
        this.unacked.delete(data.id);
        this._emit();
      } else if (event === 'role') {
        this.onRole(data.role);
        this.setReadOnly(data.role === 'VIEWER');
      } else if (event === 'meta') {
        if (data.title) this.onTitle(data.title);
      } else if (event === 'error') {
        if (data.id !== undefined) this.unacked.delete(data.id);
        if (data.message === 'PersistFailed') this.saveFailed = true;
        this._emit();
      }
    };
    ws.onclose = async (e) => {
      if (this.ws === ws) this.ws = null;
      this.synced = false;
      // Drop everyone else's presence: we will get a fresh copy on the next sync.
      const others = [...this.awareness.getStates().keys()].filter((id) => id !== this.doc.clientID);
      removeAwarenessStates(this.awareness, others, REMOTE);
      this._emit();
      if (this.closedByUs) return;
      if (e.code === 1008 && e.reason === 'Forbidden') { this.onFatal('forbidden'); return; }
      if (e.code === 1008 && e.reason === 'Unauthorized') {
        if (this.authRetried) { this.onFatal('unauthorized'); return; }
        this.authRetried = true;
        try { await refreshAccessToken(); } catch { this.onFatal('unauthorized'); return; }
      }
      if (!navigator.onLine) return;               // 'online' event reconnects
      const wait = Math.min(10_000, 500 * 2 ** this.retry++) + Math.random() * 300;
      setTimeout(() => this.connect(), wait);
    };
  }

  setLocalUser(user) { this.awareness.setLocalStateField('user', user); }

  destroy() {
    this.closedByUs = true;
    clearInterval(this._tick);
    removeAwarenessStates(this.awareness, [this.doc.clientID], 'destroy');
    this.doc.off('update', this._onDocUpdate);
    this.awareness.off('update', this._onAwareness);
    removeEventListener('online', this._onOnline);
    removeEventListener('offline', this._onOffline);
    removeEventListener('beforeunload', this._onUnload);
    this.ws?.close();
    this.awareness.destroy();
  }
}
