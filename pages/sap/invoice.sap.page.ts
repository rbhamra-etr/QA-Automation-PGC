import { BasePage } from '../../core/shared/base.page';

export class SapInvoicePage extends BasePage {
  // Selectors
  private readonly invoiceList = this.page.locator('[data-testid="invoice-list"]');
  private readonly newPaymentButton = this.page.locator('[data-testid="new-payment"]');

  async navigateToInvoices(): Promise<void> {
    // TODO: update with actual SAP invoice processing URL path
    await super.navigate('/sap/invoices');
  }

  async navigateToPayments(): Promise<void> {
    // TODO: update with actual SAP payment processing URL path
    await super.navigate('/sap/payments');
  }

  async isInvoiceListVisible(): Promise<boolean> {
    // TODO: update with actual invoice list selector
    return this.invoiceList.isVisible();
  }

  async isNewPaymentAvailable(): Promise<boolean> {
    // TODO: update with actual new payment button selector
    return this.newPaymentButton.isVisible();
  }
}
