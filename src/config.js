// Backend addresses come from build-time env (see .env.example).
// Default: the NestJS backend running locally on port 3000.
const api = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');

export const API_URL = api;
// The gateway listens on the same host under /realtime (realtime.gateway.ts).
export const WS_URL = (import.meta.env.VITE_WS_URL || api.replace(/^http/, 'ws')).replace(/\/$/, '') + '/realtime';

// Features the UI can show only once the backend exposes an API for them.
// Each one is marked TODO(api) where it is used; see API_GAPS.md.
export const FEATURES = {
  history: false,       // TODO(api): GET /documents/:id/versions, POST .../restore
  comments: false,      // TODO(api): Comment model + /documents/:id/comments
  activity: false,      // TODO(api): who changed what (DocumentEvent has no user_id yet)
  shareByEmail: false,  // TODO(api): share by email, or GET /users/lookup?email=
  removeAccess: false,  // TODO(api): DELETE /documents/:id/access/:userId
  displayNames: false,  // TODO(api): User has no name field; we show the email's local part
};
