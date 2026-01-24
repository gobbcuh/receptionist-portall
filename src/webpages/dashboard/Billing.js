import { icons } from "../../iconsss/icons";
import { billingStore } from "../../data/billingStore";
import { StatsCard } from "../../systemm/dashboard/StatsCard";
import { BillingTable } from "../../systemm/dashboard/BillingTable";
import { CreateInvoiceModal } from "../../systemm/dashboard/CreateInvoiceModal";
import { InvoiceDetailModal } from "../../systemm/dashboard/InvoiceDetailModal";
import { PaymentModal } from "../../systemm/dashboard/PaymentModal";

export class Billing {
  constructor() {
    this.searchQuery = "";
    this.statusFilter = "all";
    this.container = null;
    this.message = null;
    this.unsubscribe = null;

    this.unsubscribe = billingStore.subscribe(() => {
      this.updateContent();
    });

    this.createModal = new CreateInvoiceModal(
      (invoice) => {
        billingStore.addInvoice(invoice);
        this.showMessage("Invoice created successfully!", "success");
      },
      () => {}
    );

    this.detailModal = new InvoiceDetailModal(() => {});

    this.paymentModal = new PaymentModal(
      (updatedInvoice) => {
        billingStore.updateInvoice(updatedInvoice);
        this.showMessage("Payment recorded successfully!", "success");
      },
      () => {}
    );
  }

  get invoices() {
    return billingStore.getInvoices();
  }

  showMessage(text, type) {
    this.message = { text, type };
    setTimeout(() => {
      this.message = null;
      this.updateContent();
    }, 3000);
  }

  getFilteredInvoices() {
    return this.invoices.filter((invoice) => {
      const matchesSearch = 
        invoice.id.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        invoice.patientName.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesStatus = this.statusFilter === "all" || invoice.status === this.statusFilter;
      return matchesSearch && matchesStatus;
    });
  }

  getStats() {
    const totalRevenue = this.invoices
      .filter(inv => inv.status === "paid")
      .reduce((sum, inv) => sum + inv.total, 0);
    
    const pendingAmount = this.invoices
      .filter(inv => inv.status === "pending" || inv.status === "overdue")
      .reduce((sum, inv) => sum + inv.total, 0);

    return {
      totalInvoices: this.invoices.length,
      paidInvoices: this.invoices.filter(inv => inv.status === "paid").length,
      pendingInvoices: this.invoices.filter(inv => inv.status === "pending").length,
      overdueInvoices: this.invoices.filter(inv => inv.status === "overdue").length,
      totalRevenue,
      pendingAmount,
    };
  }

  render() {
    this.container = document.createElement("div");
    this.container.className = "space-y-6";
    this.updateContent();
    return this.container;
  }

  updateContent() {
    if (!this.container) return;

    const stats = this.getStats();
    const filteredInvoices = this.getFilteredInvoices();

    this.container.innerHTML = `
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-xl font-semibold text-foreground">Billing</h1>
          <p class="text-sm text-muted-foreground">Manage invoices and payments</p>
        </div>
        <button id="create-invoice-btn" class="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
          <span id="plus-icon"></span>
          New Invoice
        </button>
      </div>
      
      <div id="message-container"></div>
      
      <!-- Stats -->
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" id="stats-grid"></div>
      
      <!-- Filters -->
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="relative flex-1">
          <span id="search-icon" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"></span>
          <input 
            type="text" 
            id="search-input"
            placeholder="Search invoices..." 
            value="${this.searchQuery}"
            class="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
        </div>
        <select id="status-filter" class="px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
          <option value="all" ${this.statusFilter === "all" ? "selected" : ""}>All Status</option>
          <option value="paid" ${this.statusFilter === "paid" ? "selected" : ""}>Paid</option>
          <option value="pending" ${this.statusFilter === "pending" ? "selected" : ""}>Pending</option>
          <option value="overdue" ${this.statusFilter === "overdue" ? "selected" : ""}>Overdue</option>
        </select>
      </div>
      
      <!-- Results count -->
      <p class="text-sm text-muted-foreground">${filteredInvoices.length} invoice${filteredInvoices.length !== 1 ? "s" : ""} found</p>
      
      <!-- Table -->
      <div id="table-container"></div>
    `;

    // Add icons
    const plusIcon = this.container.querySelector("#plus-icon");
    plusIcon.appendChild(icons.userPlus("h-4 w-4"));

    const searchIcon = this.container.querySelector("#search-icon");
    searchIcon.appendChild(icons.search("h-4 w-4"));

    // Create invoice button
    const createBtn = this.container.querySelector("#create-invoice-btn");
    createBtn.addEventListener("click", () => this.createModal.show());

    // Message
    if (this.message) {
      const messageContainer = this.container.querySelector("#message-container");
      messageContainer.innerHTML = `
        <div class="p-3 rounded-lg ${this.message.type === "success" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"} text-sm">
          ${this.message.text}
        </div>
      `;
    }

    // Stats
    const statsGrid = this.container.querySelector("#stats-grid");
    const statsData = [
      { title: "Total Revenue", value: `₱${stats.totalRevenue.toFixed(0)}`, variant: "primary" },
      { title: "Paid Invoices", value: stats.paidInvoices, variant: "success" },
      { title: "Pending", value: stats.pendingInvoices, variant: "warning" },
      { title: "Overdue", value: stats.overdueInvoices, variant: "default" },
    ];
    statsData.forEach(stat => {
      statsGrid.appendChild(new StatsCard(stat).render());
    });

    // Search input
    const searchInput = this.container.querySelector("#search-input");
    searchInput.addEventListener("input", (e) => {
      this.searchQuery = e.target.value;
      this.updateContent();
    });

    // Status filter
    const statusFilter = this.container.querySelector("#status-filter");
    statusFilter.addEventListener("change", (e) => {
      this.statusFilter = e.target.value;
      this.updateContent();
    });

    // Table
    const tableContainer = this.container.querySelector("#table-container");
    const table = new BillingTable({
      invoices: filteredInvoices,
      onViewInvoice: (invoice) => this.detailModal.show(invoice),
      onMarkPaid: (invoice) => this.paymentModal.show(invoice),
      onPrintInvoice: (invoice) => this.printInvoice(invoice),
    });
    tableContainer.appendChild(table.render());
  }

  printInvoice(invoice) {
    // Simple print functionality
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice ${invoice.id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            h1 { color: #333; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
            .total { font-weight: bold; font-size: 18px; }
          </style>
        </head>
        <body>
          <h1>Invoice ${invoice.id}</h1>
          <p><strong>Patient:</strong> ${invoice.patientName}</p>
          <p><strong>Date:</strong> ${new Date(invoice.date).toLocaleDateString()}</p>
          <p><strong>Status:</strong> ${invoice.status.toUpperCase()}</p>
          <table>
            <tr><th>Service</th><th>Qty</th><th>Price</th><th>Total</th></tr>
            ${invoice.items.map(item => `
              <tr>
                <td>${item.description}</td>
                <td>${item.quantity}</td>
                <td>₱${item.unitPrice.toFixed(2)}</td>
                <td>₱${(item.quantity * item.unitPrice).toFixed(2)}</td>
              </tr>
            `).join("")}
          </table>
          <p>Subtotal: ₱${invoice.subtotal.toFixed(2)}</p>
          <p>Tax: ₱${invoice.tax.toFixed(2)}</p>
          <p class="total">Total: ₱${invoice.total.toFixed(2)}</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }
}
