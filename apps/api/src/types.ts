import { D1Database, KVNamespace } from '@cloudflare/workers-types';

export interface Env {
  DB?: D1Database;
  CACHE_KV?: KVNamespace;
  ENVIRONMENT?: string;
  ALLOWED_ORIGIN?: string;
}

export interface ClientGeoInfo {
  country?: string;
  city?: string;
  asn?: number;
  asOrganization?: string;
}
