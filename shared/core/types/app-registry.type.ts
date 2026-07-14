export type LaunchMode =
  /** Login to iAdaptive first, then click a tile that opens the app in a popup. */
  | 'iadaptive'
  /** Standalone app with its own URL + credentials (no iAdaptive). */
  | 'standalone';
