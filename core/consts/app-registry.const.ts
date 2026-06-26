import type { UiAppConfig, ApiServiceConfig } from '../models/app-registry.model';

// ── UI applications under test ───────────────────────────────────────────────
// iAdaptive is intentionally NOT listed here — it is the shared login gateway
// (a platform capability), not an application under test.
export const UI_APPS: UiAppConfig[] = [
  {
    key: 'SFDC',
    label: 'Salesforce',
    launch: 'iadaptive',
    tile: 'Salesforce',
    tileEnvVar: 'SFDC_LINK_TEXT',
  },
  {
    key: 'SAP',
    label: 'SAP',
    launch: 'iadaptive',
    tile: 'SAP',
    tileEnvVar: 'SAP_LINK_TEXT',
  },
  {
    key: 'Fiori',
    label: 'SAP Fiori',
    launch: 'iadaptive',
    tile: 'SAP NetWeaver Fiori DEV',
    tileEnvVar: 'FIORI_LINK_TEXT',
  },
  {
    key: 'Appian',
    label: 'Appian',
    launch: 'iadaptive',
    tile: 'Appian',
    tileEnvVar: 'APPIAN_LINK_TEXT',
  },
  {
    key: 'Web',
    label: 'Web',
    launch: 'standalone',
    urlEnvVar: 'WEB_BASE_URL',
  },
];

// ── Company APIs under test ──────────────────────────────────────────────────
// Toll is just the first one; add more services here as the company grows.
export const API_SERVICES: ApiServiceConfig[] = [
  {
    key: 'Toll',
    label: 'Toll Rate API',
    baseUrlEnvVar: 'TOLL_API_BASE_URL',
  },
];
