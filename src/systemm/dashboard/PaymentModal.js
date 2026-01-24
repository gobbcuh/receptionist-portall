import { icons } from "../../iconsss/icons";
import { paymentMethods } from "../../data/billing";

export class PaymentModal {
  constructor(onSave, onClose) {
    this.onSave = onSave;
    this.onClose = onClose;
    this.container = null;
    this.invoice = null;
    this.selectedMethod = "";
  }

  show(invoice) {
    this.invoice = invoice;
    this.selectedMethod = "";
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

    this.container = document.createElement("div");
    this.container.className = "fixed inset-0 z-50 flex items-center justify-center p-4";

    this.container.innerHTML = `
      <div class="absolute inset-0 bg-foreground/50 backdrop-blur-sm" id="backdrop"></div>
      <div class="relative bg-card rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div class="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 class="text-lg font-semibold text-foreground">Record Payment</h2>
          <button id="close-btn" class="p-1 rounded-md hover:bg-muted transition-colors"></button>
        </div>
        
        <div class="p-6 space-y-6">
          <!-- Invoice Summary -->
          <div class="bg-muted/50 rounded-lg p-4">
            <div class="flex justify-between items-center">
              <div>
                <p class="text-sm text-muted-foreground">${this.invoice.id}</p>
                <p class="font-medium text-foreground">${this.invoice.patientName}</p>
              </div>
              <p class="text-xl font-bold text-primary">₱${this.invoice.total.toFixed(2)}</p>
            </div>
          </div>
          
          <!-- Payment Method -->
          <div>
            <label class="block text-sm font-medium text-foreground mb-3">Payment Method</label>
            <div class="grid grid-cols-2 gap-2" id="payment-methods"></div>
          </div>
        </div>
        
        <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/30">
          <button type="button" id="cancel-btn" class="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
          <button type="button" id="confirm-btn" class="px-4 py-2 text-sm font-medium bg-success text-white rounded-lg hover:bg-success/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled>Confirm Payment</button>
        </div>
      </div>
    `;

    // Add close icon
    const closeBtn = this.container.querySelector("#close-btn");
    closeBtn.appendChild(icons.x("h-5 w-5 text-muted-foreground"));
    closeBtn.addEventListener("click", () => this.hide());

    // Backdrop click
    const backdrop = this.container.querySelector("#backdrop");
    backdrop.addEventListener("click", () => this.hide());

    // Cancel button
    const cancelBtn = this.container.querySelector("#cancel-btn");
    cancelBtn.addEventListener("click", () => this.hide());

    // Payment methods
    const methodsContainer = this.container.querySelector("#payment-methods");
    paymentMethods.forEach(method => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "px-4 py-3 text-sm font-medium rounded-lg border-2 border-border hover:border-primary hover:bg-primary/5 transition-all text-foreground";
      btn.textContent = method;
      btn.addEventListener("click", () => {
        this.selectedMethod = method;
        // Update visual state
        methodsContainer.querySelectorAll("button").forEach(b => {
          b.classList.remove("border-primary", "bg-primary/10");
          b.classList.add("border-border");
        });
        btn.classList.remove("border-border");
        btn.classList.add("border-primary", "bg-primary/10");
        // Enable confirm button
        const confirmBtn = this.container.querySelector("#confirm-btn");
        confirmBtn.disabled = false;
      });
      methodsContainer.appendChild(btn);
    });

    // Confirm button
    const confirmBtn = this.container.querySelector("#confirm-btn");
    confirmBtn.addEventListener("click", () => {
      if (this.selectedMethod) {
        const updatedInvoice = {
          ...this.invoice,
          status: "paid",
          paymentMethod: this.selectedMethod,
          paidDate: new Date().toISOString(),
        };
        this.onSave?.(updatedInvoice);
        this.hide();
      }
    });
  }
}
