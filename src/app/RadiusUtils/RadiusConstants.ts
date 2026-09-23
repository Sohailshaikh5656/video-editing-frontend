import { HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

// ───────────────────── 1. URL LOGIC ─────────────────────

const hostname = window.location.hostname;
const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
const protocol = window.location.protocol;

// CUT_SHORT_COMMON_IP_PORT is injected at runtime via env.js:
// - localhost           -> "192.168.25.23:9090" (dev machine)
// - any other hostname  -> "<hostname>:3300"
const targetHostAndPort = environment.CUT_SHORT_COMMON_IP_PORT;

export const COMMON_BASE_URL = `${protocol}//${targetHostAndPort}`;

// ───────────────────── 2. HTTP HEADER LOGIC ─────────────────────

export const HEADER = new HttpHeaders()
  .set('content-type', 'application/json')
  .set('x-api-key', environment.CUT_SHORT_API_KEY)
  .set('Access-Control-Allow-Origin', '*')
  .set('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');

export const getHeaders = { headers: HEADER };

// ───────────────────── 3. APP CONSTANTS ─────────────────────

export const DELETE_CONFIRM_MESSAGE = (str: string) =>
  `Are you sure you want to delete this ${str}?`;

export const CONFIRM_DIALOG_TITLE = 'Record Delete Confirmation';

export const ACTIVE = 'Active';
export const IN_ACTIVE = 'Inactive';
export const statusList = [{ value: 'Active' }, { value: 'Inactive' }];
