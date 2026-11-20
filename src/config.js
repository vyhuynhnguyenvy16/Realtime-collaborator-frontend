// Backend addresses come from build-time env (see .env.example).
// Default: the NestJS backend running locally on port 3000.
const api = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');

export const API_URL = api;
// The gateway listens on the same host under /realtime (realtime.gateway.ts).
export const WS_URL = (import.meta.env.VITE_WS_URL || api.replace(/^http/, 'ws')).replace(/\/$/, '') + '/realtime';

// Features waiting for a backend API. See API_GAPS.md.
export const FEATURES = {
  comments: false,      // TODO(api): Comment model + /documents/:id/comments
  activity: false,      // TODO(api): who changed what (DocumentEvent has no user_id yet)
};
