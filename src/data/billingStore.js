import { BillingAPI } from '../services/api.js';

class BillingStore {
  constructor() {
    this.invoices = [];
    this.listeners = [];
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(listener => listener(this.invoices));
  }

  // Get all invoices
  async getInvoices(filters = {}) {
    try {
      this.invoices = await BillingAPI.getAll(filters);
      this.notify();
      return this.invoices;
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
      return [];
    }
  }

  // Add invoice (manual creation)
  async addInvoice(invoiceData) {
    try {
      const invoice = await BillingAPI.create(invoiceData);
      this.invoices.unshift(invoice);
      this.notify();
      return invoice;
    } catch (error) {
      console.error('Failed to create invoice:', error);
      throw error;
    }
  }

  // Update invoice (mark as paid)
  async updateInvoice(invoiceId, paymentMethod) {
    try {
      const updatedInvoice = await BillingAPI.markAsPaid(invoiceId, paymentMethod);
      
      // Update in local array
      const index = this.invoices.findIndex(inv => inv.id === invoiceId);
      if (index !== -1) {
        this.invoices[index] = updatedInvoice;
        this.notify();
      }
      
      return updatedInvoice;
    } catch (error) {
      console.error('Failed to update invoice:', error);
      throw error;
    }
  }
}

// Singleton instance
export const billingStore = new BillingStore();