import { icons } from "../../iconsss/icons";
import { format } from "date-fns";
import { cn } from "../../iconsss/utils";

const statusConfig = {
    paid: {
        label: "Paid",
        className: "bg-success/10 text-success",
    },
    pending: {
        label: "Pending",
        className: "bg-warning/10 text-warning",
    },
    overdue: {
        label: "Overdue",
        className: "bg-destructive/10 text-destructive",
    },
};

export class InvoiceDetailModal {
    constructor(onClose) {
        this.onClose = onClose;
        this.container = null;
        this.invoice = null;
    }

    show(invoice) {
        this.invoice = invoice;
        this.render();
        document.body.appendChild(this.container);
    }

    hide() {
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
        this.container = null;
        this.onClose?.();
    }

    render() {
        if (!this.invoice) return;

        const status = statusConfig[this.invoice.status];

        this.container = document.createElement("div");
        this.container.className = "fixed inset-0 z-50 flex items-center justify-center p-4";

        this.container.innerHTML = `
      <div class="absolute inset-0 bg-foreground/50 backdrop-blur-sm" id="backdrop"></div>
      <div class="relative bg-card rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div class="flex items-center justify-between px-6 py-4 border-b border-border">
          <div class="flex items-center gap-3">
            <h2 class="text-lg font-semibold text-foreground">${this.invoice.id}</h2>
            <span class="${cn("inline-flex items-center rounded-full px-2 py-1 text-xs font-medium", status.className)}">${status.label}</span>
          </div>
          <button id="close-btn" class="p-1 rounded-md hover:bg-muted transition-colors"></button>
        </div>
        
        <div class="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-6">
          <!-- Patient Info -->
          <div class="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <div class="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center" id="patient-icon"></div>
            <div>
              <p class="font-medium text-foreground">${this.invoice.patientName}</p>
              <p class="text-sm text-muted-foreground">Patient ID: ${this.invoice.patientId}</p>
            </div>
          </div>
          
          <!-- Invoice Details -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-xs text-muted-foreground uppercase tracking-wide">Invoice Date</p>
              <p class="text-sm font-medium text-foreground mt-1">${format(new Date(this.invoice.date), "MMM d, yyyy")}</p>
            </div>
            ${this.invoice.paidDate ? `
            <div>
              <p class="text-xs text-muted-foreground uppercase tracking-wide">Paid Date</p>
              <p class="text-sm font-medium text-foreground mt-1">${format(new Date(this.invoice.paidDate), "MMM d, yyyy")}</p>
            </div>
            ` : ""}
            ${this.invoice.paymentMethod ? `
            <div>
              <p class="text-xs text-muted-foreground uppercase tracking-wide">Payment Method</p>
              <p class="text-sm font-medium text-foreground mt-1">${this.invoice.paymentMethod}</p>
            </div>
            ` : ""}
          </div>
          
          <!-- Line Items -->
          <div>
            <p class="text-xs text-muted-foreground uppercase tracking-wide mb-3">Services</p>
            <div class="space-y-2">
              ${this.invoice.items.map(item => `
                <div class="flex justify-between items-center py-2 border-b border-border last:border-0">
                  <div>
                    <p class="text-sm font-medium text-foreground">${item.description}</p>
                    <p class="text-xs text-muted-foreground">${item.quantity} x ₱${item.unitPrice.toFixed(2)}</p>
                  </div>
                  <p class="text-sm font-medium text-foreground">₱${(item.quantity * item.unitPrice).toFixed(2)}</p>
                </div>
              `).join("")}
            </div>
          </div>
          
          <!-- Totals -->
          <div class="bg-muted/50 rounded-lg p-4 space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-muted-foreground">Subtotal</span>
              <span class="text-foreground">₱${this.invoice.subtotal.toFixed(2)}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-muted-foreground">Tax (10%)</span>
              <span class="text-foreground">₱${this.invoice.tax.toFixed(2)}</span>
            </div>
            <div class="flex justify-between text-base font-semibold border-t border-border pt-2">
              <span class="text-foreground">Total</span>
              <span class="text-primary">₱${this.invoice.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    `;

        // Add icons
        const closeBtn = this.container.querySelector("#close-btn");
        closeBtn.appendChild(icons.x("h-5 w-5 text-muted-foreground"));
        closeBtn.addEventListener("click", () => this.hide());

        const patientIcon = this.container.querySelector("#patient-icon");
        patientIcon.appendChild(icons.user("h-6 w-6 text-primary"));

        // Backdrop click
        const backdrop = this.container.querySelector("#backdrop");
        backdrop.addEventListener("click", () => this.hide());
    }
}
