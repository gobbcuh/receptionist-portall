
import { sampleInvoices, billingServices } from "./billing";

class BillingStore {
  constructor() {
    this.invoices = [...sampleInvoices];
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

  getInvoices() {
    return this.invoices;
  }

  addInvoice(invoice) {
    this.invoices.unshift(invoice);
    this.notify();
  }

  updateInvoice(updatedInvoice) {
    const index = this.invoices.findIndex(inv => inv.id === updatedInvoice.id);
    if (index !== -1) {
      this.invoices[index] = updatedInvoice;
      this.notify();
    }
  }

  // Create invoice from patient registration
  createInvoiceFromPatient(patientData) {
    const invoiceId = `INV-${String(this.invoices.length + 1).padStart(3, "0")}`;
    const patientId = `P${String(Date.now()).slice(-6)}`;
    
    // Default consultation fee for new patients
    const consultationService = billingServices.find(s => s.id === "consultation");
    
    const newInvoice = {
      id: invoiceId,
      patientId: patientId,
      patientName: `${patientData.firstName} ${patientData.lastName}`,
      phone: patientData.phone || "",
      email: patientData.email || "",
      assignedDoctor: patientData.assignedDoctor || "",
      date: new Date().toISOString(),
      items: [
        {
          description: consultationService?.name || "Consultation Fee",
          quantity: 1,
          unitPrice: consultationService?.price || 150,
        },
      ],
      subtotal: consultationService?.price || 150,
      tax: (consultationService?.price || 150) * 0.1,
      total: (consultationService?.price || 150) * 1.1,
      status: "pending",
      paymentMethod: null,
      paidDate: null,
    };

    this.addInvoice(newInvoice);
    return newInvoice;
  }
}

// Singleton instance
export const billingStore = new BillingStore();
