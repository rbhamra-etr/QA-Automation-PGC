import { Page } from '@playwright/test';
import { BasePage } from '../shared/base.page';
import { getUiApp } from '../configs/app-registry.config';

// Page object imports — register one line per system here.
import { SfdcPage } from '../shared/sfdc.page';
import { WebPage } from '../shared/web.page';
import { AppianPage } from '../shared/appian.page';
import { FioriPage } from '../shared/fiori.page';
import { SapPage } from '../shared/sap.page';

/**
 * Factory map: app key → how to construct its page object.
 *
 * ── This is the ONLY place to register a new UI system's page object. ────────
 * Add the import above and one entry here, keyed by the app's registry key.
 * Fixtures and steps never change when you add a system.
 */
const PAGE_FACTORIES: Record<string, (page: Page) => BasePage> = {
  SFDC: (page) => new SfdcPage(page),
  Web: (page) => new WebPage(page),
  Appian: (page) => new AppianPage(page),
  Fiori: (page) => new FioriPage(page),
  SAP: (page) => new SapPage(page),
};

/**
 * PageProvider — lazily creates and caches page objects per scenario, and binds
 * each one to the real Page that gets opened at login time (portal popup or
 * standalone tab).
 *
 * Steps that need a specific app's page object call the typed accessor, e.g.
 * `pages.sfdc` or `pages.web`. Adding a new accessor is a one-liner.
 */
export class PageProvider {
  private readonly instances = new Map<string, BasePage>();

  constructor(private readonly portalPage: Page) {}

  // ── Typed accessors (one getter per system) ───────────────────────────────
  get sfdc(): SfdcPage {
    return this.ensure('SFDC') as SfdcPage;
  }
  get web(): WebPage {
    return this.ensure('Web') as WebPage;
  }
  get appian(): AppianPage {
    return this.ensure('Appian') as AppianPage;
  }
  get fiori(): FioriPage {
    return this.ensure('Fiori') as FioriPage;
  }
  get sap(): SapPage {
    return this.ensure('SAP') as SapPage;
  }

  /** Lazily create (and cache) the page object for an app via its factory. */
  private ensure(appKey: string): BasePage {
    const key = getUiApp(appKey).key; // validates + canonical casing
    let instance = this.instances.get(key);
    if (!instance) {
      const factory = PAGE_FACTORIES[key];
      if (!factory) {
        throw new Error(
          `No page object registered for app '${appKey}'. ` +
            `Add it to PAGE_FACTORIES in src/fixtures/page-provider.ts.`,
        );
      }
      instance = factory(this.portalPage);
      this.instances.set(key, instance);
    }
    return instance;
  }

  /**
   * Bind an app's page object to the real Page opened at login (portal popup for
   * iAdaptive apps, or the standalone tab for apps like Web).
   */
  bind(appKey: string, page: Page): void {
    this.ensure(appKey).switchToPage(page);
  }

  /**
   * Open a standalone app (no iAdaptive). Drives the app's own login flow through
   * its page object, then returns the bound Page.
   */
  async openStandalone(
    appKey: string,
    baseUrl: string,
    username: string,
    password: string,
  ): Promise<Page> {
    const instance = this.ensure(appKey);

    if (instance instanceof WebPage) {
      await instance.loginAt(baseUrl, username, password);
      return this.portalPage;
    }

    throw new Error(
      `Standalone login is not implemented for app '${appKey}'. ` +
        `Add a login flow to its page object and a branch in PageProvider.openStandalone().`,
    );
  }
}
