/**
 * app-registry.ts — the single source of truth for every system this framework tests.
 *
 * ── Why this file exists ─────────────────────────────────────────────────────
 * Adding a new system (UI app or API) should mean adding ONE entry here, not
 * editing fixtures, steps, or config scattered across the codebase. Steps look
 * apps up by name; the registry tells them HOW to launch and authenticate.
 *
 * ── How to add a new UI system ───────────────────────────────────────────────
 *   1. Add an entry to UI_APPS below (set `launch` and, if portal-based, `tile`).
 *   2. Create src/modules/<system>/ with pages/ steps/ data/.
 *   3. Register its page object in src/fixtures/page-provider.ts.
 *   That's it — the generic login step works automatically.
 *
 * ── How to add a new API ─────────────────────────────────────────────────────
 *   1. Add an entry to API_SERVICES below (set the env var holding its base URL).
 *   2. Create src/api/<service>/ for its data + service-specific steps.
 *   The generic API steps (request/status/json assertions) work automatically.
 */

import type { UiAppConfig, ApiServiceConfig } from '../models/app-registry.model';
import { UI_APPS, API_SERVICES } from '../consts/app-registry.const';

export type { LaunchMode } from '../types/app-registry.type';
export type { UiAppConfig, ApiServiceConfig } from '../models/app-registry.model';

function normalizeKey(value: string): string {
  return value.trim().toLowerCase();
}

const UI_APP_INDEX = new Map<string, UiAppConfig>(
  UI_APPS.map((app) => [normalizeKey(app.key), app]),
);
const API_SERVICE_INDEX = new Map<string, ApiServiceConfig>(
  API_SERVICES.map((svc) => [normalizeKey(svc.key), svc]),
);

/** All registered UI app keys (for error messages / discovery). */
export function getUiAppKeys(): string[] {
  return UI_APPS.map((app) => app.key);
}

/** All registered API service keys (for error messages / discovery). */
export function getApiServiceKeys(): string[] {
  return API_SERVICES.map((svc) => svc.key);
}

/** Look up a UI app by its Gherkin key (case-insensitive). Throws if unknown. */
export function getUiApp(key: string): UiAppConfig {
  const app = UI_APP_INDEX.get(normalizeKey(key));
  if (!app) {
    throw new Error(
      `Unknown UI app '${key}'. Registered apps: ${getUiAppKeys().join(', ')}.\n` +
        `Add it to UI_APPS in src/config/app-registry.ts.`,
    );
  }
  return app;
}

/** Look up an API service by its Gherkin key (case-insensitive). Throws if unknown. */
export function getApiService(key: string): ApiServiceConfig {
  const svc = API_SERVICE_INDEX.get(normalizeKey(key));
  if (!svc) {
    throw new Error(
      `Unknown API service '${key}'. Registered services: ${getApiServiceKeys().join(', ')}.\n` +
        `Add it to API_SERVICES in src/config/app-registry.ts.`,
    );
  }
  return svc;
}

/** Resolve the portal tile text for an iAdaptive app (env override wins). */
export function resolveTile(app: UiAppConfig): string {
  const override = app.tileEnvVar ? process.env[app.tileEnvVar]?.trim() : undefined;
  return override || app.tile || app.label;
}

/** Resolve the base URL for a standalone app from its env var. Throws if missing. */
export function resolveStandaloneUrl(app: UiAppConfig): string {
  if (!app.urlEnvVar) {
    throw new Error(`App '${app.key}' is not standalone (no urlEnvVar configured).`);
  }
  const url = process.env[app.urlEnvVar]?.trim();
  if (!url) {
    throw new Error(
      `Missing base URL for '${app.label}'. Set ${app.urlEnvVar} in your .env.qa or .env.uat file.`,
    );
  }
  return url;
}

/** Resolve the base URL for an API service from its env var. Throws if missing. */
export function resolveApiBaseUrl(service: ApiServiceConfig): string {
  const url = process.env[service.baseUrlEnvVar]?.trim();
  if (!url) {
    throw new Error(
      `Missing base URL for '${service.label}'. Set ${service.baseUrlEnvVar} in your .env.qa or .env.uat file.`,
    );
  }
  return url;
}
