import { Page, Locator, Download, Response } from '@playwright/test';
import { ENV } from '../configs/env.config';

export class BasePage {
  constructor(protected page: Page) {}

  /** Swap the underlying page (e.g. after a popup opens). */
  switchToPage(newPage: Page): void {
    this.page = newPage;
  }

  // --- Locator helpers -------------------------------------------------------

  /** Returns the first matching Locator. */
  protected locate(selector: string): Locator {
    return this.page.locator(selector).first();
  }

  /** Returns ALL matching Locators (useful to count or iterate). */
  protected locateAll(selector: string): Locator {
    return this.page.locator(selector);
  }

  /** Count how many elements match a selector. */
  protected async count(selector: string): Promise<number> {
    return this.page.locator(selector).count();
  }

  // --- Mouse actions ---------------------------------------------------------

  /** Single left-click. */
  protected async click(selector: string): Promise<void> {
    await this.locate(selector).click();
  }

  /** Click with force � bypasses actionability checks (hidden / overlapping elements). */
  protected async forceClick(selector: string): Promise<void> {
    await this.locate(selector).click({ force: true });
  }

  /** Double-click. */
  protected async doubleClick(selector: string): Promise<void> {
    await this.locate(selector).dblclick();
  }

  /** Right-click (opens context menu). */
  protected async rightClick(selector: string): Promise<void> {
    await this.locate(selector).click({ button: 'right' });
  }

  /** Click the Nth matched element (0-based index). */
  protected async clickNth(selector: string, index: number): Promise<void> {
    await this.page.locator(selector).nth(index).click();
  }

  /** Ctrl+Click (multi-select, open link in new tab, etc.). */
  protected async ctrlClick(selector: string): Promise<void> {
    await this.locate(selector).click({ modifiers: ['Control'] });
  }

  /** Shift+Click. */
  protected async shiftClick(selector: string): Promise<void> {
    await this.locate(selector).click({ modifiers: ['Shift'] });
  }

  /** Hover the mouse over an element. */
  protected async hover(selector: string): Promise<void> {
    await this.locate(selector).hover();
  }

  /** Drag source element onto target element. */
  protected async dragAndDrop(sourceSelector: string, targetSelector: string): Promise<void> {
    await this.locate(sourceSelector).dragTo(this.locate(targetSelector));
  }

  // --- Keyboard / input actions ----------------------------------------------

  /** Clear the field and type a new value (fastest; fires change events). */
  protected async fill(selector: string, value: string): Promise<void> {
    await this.locate(selector).fill(value);
  }

  /** Type value character by character � triggers keypress events (use for autocomplete). */
  protected async type(selector: string, value: string): Promise<void> {
    await this.locate(selector).pressSequentially(value);
  }

  /** Clear an input field. */
  protected async clear(selector: string): Promise<void> {
    await this.locate(selector).clear();
  }

  /** Press a keyboard key on an element (e.g. 'Enter', 'Tab', 'Escape', 'ArrowDown'). */
  protected async pressKey(selector: string, key: string): Promise<void> {
    await this.locate(selector).press(key);
  }

  /** Press a global keyboard shortcut without targeting a specific element. */
  protected async pressGlobalKey(key: string): Promise<void> {
    await this.page.keyboard.press(key);
  }

  /** Select all text inside an element (equivalent to Ctrl+A). */
  protected async selectAllText(selector: string): Promise<void> {
    await this.locate(selector).selectText();
  }

  /** Select an option in a <select> dropdown by visible label text. */
  protected async selectByLabel(selector: string, label: string): Promise<void> {
    await this.locate(selector).selectOption({ label });
  }

  /** Select an option in a <select> dropdown by its value attribute. */
  protected async selectByValue(selector: string, value: string): Promise<void> {
    await this.locate(selector).selectOption({ value });
  }

  /** Check a checkbox or radio button. */
  protected async check(selector: string): Promise<void> {
    await this.locate(selector).check();
  }

  /** Uncheck a checkbox. */
  protected async uncheck(selector: string): Promise<void> {
    await this.locate(selector).uncheck();
  }

  /** Upload one or more files to a file-input element. */
  protected async uploadFile(selector: string, filePaths: string | string[]): Promise<void> {
    await this.locate(selector).setInputFiles(filePaths);
  }

  /** Clear a previously selected file from a file-input. */
  protected async clearFile(selector: string): Promise<void> {
    await this.locate(selector).setInputFiles([]);
  }

  /** Paste text into an element via clipboard (useful when fill() is blocked by the app). */
  protected async pasteText(selector: string, value: string): Promise<void> {
    await this.locate(selector).click();
    await this.page.evaluate((text) => navigator.clipboard.writeText(text), value);
    await this.locate(selector).press('Control+v');
  }

  // --- Navigation ------------------------------------------------------------

  /** Navigate to a URL. */
  protected async goto(url: string): Promise<void> {
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
  }

  /** Get the current page URL. */
  protected async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  /** Get the current page title. */
  protected async getPageTitle(): Promise<string> {
    return this.page.title();
  }

  /** Reload the current page. */
  protected async reload(): Promise<void> {
    await this.page.reload({ waitUntil: 'domcontentloaded' });
  }

  /** Navigate back in browser history. */
  protected async goBack(): Promise<void> {
    await this.page.goBack();
  }

  /** Navigate forward in browser history. */
  protected async goForward(): Promise<void> {
    await this.page.goForward();
  }

  /** Open a new browser tab and return its Page. */
  protected async openNewTab(url?: string): Promise<Page> {
    const newPage = await this.page.context().newPage();
    if (url) await newPage.goto(url, { waitUntil: 'domcontentloaded' });
    return newPage;
  }

  /** Close the current page / tab. */
  protected async closePage(): Promise<void> {
    await this.page.close();
  }

  // --- Waits ----------------------------------------------------------------

  /** Wait until the element is visible. */
  protected async waitForVisible(selector: string, timeoutMs = 15000): Promise<void> {
    await this.locate(selector).waitFor({ state: 'visible', timeout: timeoutMs });
  }

  /** Wait until the element is hidden / removed from view. */
  protected async waitForHidden(selector: string, timeoutMs = 15000): Promise<void> {
    await this.locate(selector).waitFor({ state: 'hidden', timeout: timeoutMs });
  }

  /** Wait until the element exists in the DOM (even if not visible). */
  protected async waitForAttached(selector: string, timeoutMs = 15000): Promise<void> {
    await this.locate(selector).waitFor({ state: 'attached', timeout: timeoutMs });
  }

  /** Wait until the element is removed from the DOM entirely. */
  protected async waitForDetached(selector: string, timeoutMs = 15000): Promise<void> {
    await this.locate(selector).waitFor({ state: 'detached', timeout: timeoutMs });
  }

  /** Wait for the page URL to contain a substring. */
  protected async waitForUrl(urlSubstring: string, timeoutMs = 15000): Promise<void> {
    await this.page.waitForURL(`**${urlSubstring}**`, { timeout: timeoutMs });
  }

  /** Wait for the network to become idle (no requests for 500 ms). */
  protected async waitForNetworkIdle(timeoutMs = 30000): Promise<void> {
    await this.page.waitForLoadState('networkidle', { timeout: timeoutMs });
  }

  /** Wait for a specific API response matching a URL pattern. */
  protected async waitForApiResponse(urlPattern: string | RegExp, timeoutMs = 30000): Promise<Response> {
    return this.page.waitForResponse(urlPattern, { timeout: timeoutMs });
  }

  /** Pause execution for a fixed number of milliseconds (use sparingly). */
  protected async sleep(ms: number): Promise<void> {
    await this.page.waitForTimeout(ms);
  }

  // --- Reading values --------------------------------------------------------

  /** Get the visible inner text of the first matching element. */
  protected async getText(selector: string): Promise<string> {
    return (await this.locate(selector).innerText()).trim();
  }

  /** Get the raw textContent (includes text in hidden nodes). */
  protected async getTextContent(selector: string): Promise<string> {
    return ((await this.locate(selector).textContent()) ?? '').trim();
  }

  /** Get a specific attribute value. */
  protected async getAttribute(selector: string, attribute: string): Promise<string | null> {
    return this.locate(selector).getAttribute(attribute);
  }

  /** Get the current value of an input / textarea field. */
  protected async getInputValue(selector: string): Promise<string> {
    return this.locate(selector).inputValue();
  }

  /** Get inner HTML of an element. */
  protected async getInnerHTML(selector: string): Promise<string> {
    return this.locate(selector).innerHTML();
  }

  /** Get the visible text from every matched element as an array. */
  protected async getAllTexts(selector: string): Promise<string[]> {
    return this.page.locator(selector).allInnerTexts();
  }

  /** Returns true if the element is visible right now. */
  protected async isVisible(selector: string): Promise<boolean> {
    return this.locate(selector).isVisible();
  }

  /** Returns true if the element is enabled (not disabled). */
  protected async isEnabled(selector: string): Promise<boolean> {
    return this.locate(selector).isEnabled();
  }

  /** Returns true if the element is disabled. */
  protected async isDisabled(selector: string): Promise<boolean> {
    return this.locate(selector).isDisabled();
  }

  /** Returns true if a checkbox / radio is currently checked. */
  protected async isChecked(selector: string): Promise<boolean> {
    return this.locate(selector).isChecked();
  }

  /** Returns true if the element exists in the DOM (may not be visible). */
  protected async isPresent(selector: string): Promise<boolean> {
    return (await this.page.locator(selector).count()) > 0;
  }

  // --- Screenshots & visual -------------------------------------------------

  /** Take a full-page screenshot. Saved to test-results/screenshots/<fileName>.png */
  protected async screenshot(fileName: string): Promise<void> {
    await this.page.screenshot({
      path: `test-results/screenshots/${fileName}.png`,
      fullPage: true,
    });
  }

  /** Take a screenshot of a single element only. */
  protected async screenshotElement(selector: string, fileName: string): Promise<void> {
    await this.locate(selector).screenshot({
      path: `test-results/screenshots/${fileName}.png`,
    });
  }

  // --- Scroll ----------------------------------------------------------------

  /** Scroll the element into the viewport. */
  protected async scrollIntoView(selector: string): Promise<void> {
    await this.locate(selector).scrollIntoViewIfNeeded();
  }

  /** Scroll the entire page to the very bottom. */
  protected async scrollToBottom(): Promise<void> {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  }

  /** Scroll the entire page to the very top. */
  protected async scrollToTop(): Promise<void> {
    await this.page.evaluate(() => window.scrollTo(0, 0));
  }

  /** Scroll by a pixel offset from the current scroll position. */
  protected async scrollBy(x: number, y: number): Promise<void> {
    await this.page.evaluate(([dx, dy]) => window.scrollBy(dx, dy), [x, y] as [number, number]);
  }

  // --- Dialogs ---------------------------------------------------------------

  /** Accept the next browser alert / confirm dialog. */
  protected acceptDialog(): void {
    this.page.once('dialog', (dialog) => dialog.accept());
  }

  /** Dismiss the next browser confirm / prompt dialog. */
  protected dismissDialog(): void {
    this.page.once('dialog', (dialog) => dialog.dismiss());
  }

  /** Accept the next dialog and type a value (for prompt dialogs). */
  protected acceptDialogWithValue(value: string): void {
    this.page.once('dialog', (dialog) => dialog.accept(value));
  }

  // --- iFrames ---------------------------------------------------------------

  /** Get a FrameLocator to interact with elements inside an iframe. */
  protected frameLocator(iframeSelector: string) {
    return this.page.frameLocator(iframeSelector);
  }

  // --- Downloads ------------------------------------------------------------

  /**
   * Click an element that triggers a file download and return the Download object.
   *   const dl = await this.clickAndDownload(MyLocators.downloadBtn);
   *   await dl.saveAs('test-results/downloads/' + dl.suggestedFilename());
   */
  protected async clickAndDownload(selector: string): Promise<Download> {
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.locate(selector).click(),
    ]);
    return download;
  }

  // --- JavaScript execution -------------------------------------------------

  /** Execute arbitrary JavaScript in the browser context and return the result. */
  protected async executeScript<T>(script: string | ((...args: unknown[]) => T), ...args: unknown[]): Promise<T> {
    return this.page.evaluate(script as (...args: unknown[]) => T, ...args);
  }

  /** Use JavaScript to smoothly scroll an element into the center of the viewport. */
  protected async jsScrollIntoView(selector: string): Promise<void> {
    await this.page.evaluate(
      (sel) => document.querySelector(sel)?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
      selector,
    );
  }

  // --- Cookies & storage ----------------------------------------------------

  /** Clear all cookies for the current browser context. */
  protected async clearCookies(): Promise<void> {
    await this.page.context().clearCookies();
  }

  /** Clear localStorage in the current page. */
  protected async clearLocalStorage(): Promise<void> {
    await this.page.evaluate(() => localStorage.clear());
  }

  /** Clear sessionStorage in the current page. */
  protected async clearSessionStorage(): Promise<void> {
    await this.page.evaluate(() => sessionStorage.clear());
  }

  /** Get a value from localStorage by key. */
  protected async getLocalStorageItem(key: string): Promise<string | null> {
    return this.page.evaluate((k) => localStorage.getItem(k), key);
  }

  /** Set a value in localStorage. */
  protected async setLocalStorageItem(key: string, value: string): Promise<void> {
    await this.page.evaluate(([k, v]) => localStorage.setItem(k, v), [key, value] as [string, string]);
  }

  // --- Clipboard ------------------------------------------------------------

  /** Read the current clipboard text. */
  protected async getClipboardText(): Promise<string> {
    return this.page.evaluate(() => navigator.clipboard.readText());
  }

  // --- Focus & blur ---------------------------------------------------------

  /** Focus an element (triggers focus event). */
  protected async focus(selector: string): Promise<void> {
    await this.locate(selector).focus();
  }

  /** Remove focus from an element (triggers blur event). */
  protected async blur(selector: string): Promise<void> {
    await this.locate(selector).blur();
  }

  // --- Visibility / position info -------------------------------------------

  /** Get the bounding box (x, y, width, height) of an element in pixels. */
  protected async getBoundingBox(selector: string) {
    return this.locate(selector).boundingBox();
  }

  // --- Timeout / retry helpers -----------------------------------------------

  protected resolveTimeout(timeoutMs?: number, appDefaultTimeoutMs?: number): number {
    return timeoutMs ?? appDefaultTimeoutMs ?? ENV.DEFAULT_TIMEOUT_MS;
  }

  protected resolveRetries(retries?: number, appDefaultRetries?: number): number {
    return retries ?? appDefaultRetries ?? ENV.DEFAULT_RETRY_COUNT;
  }

  protected async retryAction(
    actionName: string,
    action: () => Promise<void>,
    retries: number,
    delayMs: number = 300,
  ): Promise<void> {
    let lastError: unknown;
    for (let attempt = 1; attempt <= retries; attempt += 1) {
      try {
        await action();
        return;
      } catch (error) {
        lastError = error;
        if (attempt === retries) break;
        await this.page.waitForTimeout(delayMs);
      }
    }
    const details = lastError instanceof Error ? lastError.message : String(lastError);
    throw new Error(`${actionName} failed after ${retries} attempts. Last error: ${details}`);
  }

  async navigate(path: string = ''): Promise<void> {
    await this.page.goto(path || ENV.WEB_BASE_URL);
  }

  async getTitle(): Promise<string> {
    return this.page.title();
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }
}
