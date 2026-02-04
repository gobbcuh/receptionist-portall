import { icons } from "../../iconsss/icons";
import { patientStore } from "../../data/patientStore";

export class CreateInvoiceModal {
    constructor(onSave, onClose) {
        this.onSave = onSave;
        this.onClose = onClose;
        this.container = null;
        this.items = [{ serviceId: "", quantity: 1, unitPrice: 0, description: "" }];
        this.selectedPatient = "";
        this.patients = [];
        this.availableServices = [];
    }

    async show() {
        this.items = [{ serviceId: "", quantity: 1, unitPrice: 0, description: "" }];
        this.selectedPatient = "";

        try {
            await patientStore.getPatients();
            this.patients = patientStore.patients;
            
            const response = await fetch('http://localhost:5000/api/services', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            
            if (response.ok) {
                const services = await response.json();
                
                this.availableServices = services;
                
                console.log('Loaded services (excluding consultation):', this.availableServices.length);
            } else {
                console.error('Failed to load services');
                this.availableServices = [];
            }
            
        } catch (error) {
            console.error('Error loading data:', error);
            this.patients = [];
            this.availableServices = [];
            this.hasPendingConsultation = false;
        }

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

    calculateTotals() {
        const subtotal = this.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
        const tax = subtotal * 0.1;
        const total = subtotal + tax;
        return { subtotal, tax, total };
    }

    render() {
        this.container = document.createElement("div");
        this.container.className = "fixed inset-0 z-50 flex items-center justify-center p-4";

        const { subtotal, tax, total } = this.calculateTotals();

        this.container.innerHTML = `
      <div class="absolute inset-0 bg-foreground/50 backdrop-blur-sm" id="backdrop"></div>
      <div class="relative bg-card rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div class="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 class="text-lg font-semibold text-foreground">Add Services to Invoice</h2>
          <button id="close-btn" class="p-1 rounded-md hover:bg-muted transition-colors"></button>
        </div>
        
        <div class="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <form id="invoice-form" class="space-y-6">
            <!-- Patient Selection -->
            <div>
              <label class="block text-sm font-medium text-foreground mb-2">Patient</label>
              <select id="patient-select" class="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" required>
                <option value="">Select a patient...</option>
                ${this.patients.map(p => `<option value="${p.id}">${p.name}</option>`).join("")}
              </select>
            </div>
            
            <!-- Line Items -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="block text-sm font-medium text-foreground">Services</label>
                <button type="button" id="add-item-btn" class="text-sm text-primary hover:underline">+ Add Item</button>
              </div>
              <div id="items-container" class="space-y-3"></div>
            </div>
            
            <!-- Totals -->
            <div class="bg-muted/50 rounded-lg p-4 space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-muted-foreground">Subtotal</span>
                <span class="text-foreground" id="subtotal">₱${subtotal.toFixed(2)}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-muted-foreground">Tax (10%)</span>
                <span class="text-foreground" id="tax">₱${tax.toFixed(2)}</span>
              </div>
              <div class="flex justify-between text-base font-semibold border-t border-border pt-2">
                <span class="text-foreground">Total</span>
                <span class="text-primary" id="total">₱${total.toFixed(2)}</span>
              </div>
            </div>
          </form>
        </div>
        
        <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/30">
          <button type="button" id="cancel-btn" class="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
          <button type="submit" form="invoice-form" class="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">Create Invoice</button>
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

        // Add item button
        const addItemBtn = this.container.querySelector("#add-item-btn");
        addItemBtn.addEventListener("click", () => {
            this.items.push({ serviceId: "", quantity: 1, unitPrice: 0, description: "" });
            this.renderItems();
        });

        // Patient select
        const patientSelect = this.container.querySelector("#patient-select");
        patientSelect.addEventListener("change", async (e) => {
            this.selectedPatient = e.target.value;

            if (this.selectedPatient) {
                try {
                    const response = await fetch(`http://localhost:5000/api/patients/${this.selectedPatient}/consultation-status`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                        }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        this.hasPendingConsultation = data.has_pending_consultation;
                        console.log(`Patient consultation status: has_pending=${this.hasPendingConsultation}`);
                    }
                } catch (error) {
                    console.error('Error checking consultation status:', error);
                    this.hasPendingConsultation = false;
                }
            } else {
                this.hasPendingConsultation = false;
            }

            this.renderItems();
        });

        // Form submit
        const form = this.container.querySelector("#invoice-form");
        form.addEventListener("submit", (e) => this.handleSubmit(e));

        // Render items
        this.renderItems();
    }

    renderItems() {
        const container = this.container.querySelector("#items-container");
        container.innerHTML = "";

        this.items.forEach((item, index) => {
            const itemDiv = document.createElement("div");
            itemDiv.className = "flex gap-2 items-start";

            itemDiv.innerHTML = `
        <div class="flex-1">
          <select class="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" data-index="${index}" data-field="service">
            <option value="">Select service...</option>
            ${this.availableServices.map(s => {
                const isDisabled = (s.id === 'consultation' && this.hasPendingConsultation);
                return `<option value="${s.id}" ${item.serviceId === s.id ? "selected" : ""} ${isDisabled ? 'disabled' : ''}>${s.name} - ₱${parseFloat(s.price).toFixed(2)}${isDisabled ? ' (already charged)' : ''}</option>`;
            }).join("")}
          </select>
        </div>
        <div class="w-20">
          <input type="number" min="1" value="${item.quantity}" class="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" data-index="${index}" data-field="quantity" placeholder="Qty">
        </div>
        <div class="w-24">
          <input type="number" step="0.01" min="0" value="${item.unitPrice}" class="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" data-index="${index}" data-field="price" placeholder="Price">
        </div>
        <button type="button" class="p-2 text-muted-foreground hover:text-destructive transition-colors" data-remove="${index}"></button>
      `;

            // Remove button icon
            const removeBtn = itemDiv.querySelector(`[data-remove="${index}"]`);
            removeBtn.appendChild(icons.x("h-4 w-4"));
            removeBtn.addEventListener("click", () => {
                if (this.items.length > 1) {
                    this.items.splice(index, 1);
                    this.renderItems();
                }
            });

            // Service select
            const serviceSelect = itemDiv.querySelector(`[data-field="service"]`);
            serviceSelect.addEventListener("change", (e) => {
                const serviceId = e.target.value;
                const service = this.availableServices.find(s => s.id === serviceId);
                this.items[index].serviceId = serviceId;
                this.items[index].description = service?.name || "";
                this.items[index].unitPrice = parseFloat(service?.price) || 0;
                this.renderItems();
                this.updateTotals();
            });

            // Quantity input
            const qtyInput = itemDiv.querySelector(`[data-field="quantity"]`);
            qtyInput.addEventListener("input", (e) => {
                this.items[index].quantity = parseInt(e.target.value) || 1;
                this.updateTotals();
            });

            // Price input
            const priceInput = itemDiv.querySelector(`[data-field="price"]`);
            priceInput.addEventListener("input", (e) => {
                this.items[index].unitPrice = parseFloat(e.target.value) || 0;
                this.updateTotals();
            });

            container.appendChild(itemDiv);
        });
    }

    updateTotals() {
        const { subtotal, tax, total } = this.calculateTotals();
        const subtotalEl = this.container.querySelector("#subtotal");
        const taxEl = this.container.querySelector("#tax");
        const totalEl = this.container.querySelector("#total");

        if (subtotalEl) subtotalEl.textContent = `₱${subtotal.toFixed(2)}`;
        if (taxEl) taxEl.textContent = `₱${tax.toFixed(2)}`;
        if (totalEl) totalEl.textContent = `₱${total.toFixed(2)}`;
    }

    handleSubmit(e) {
        e.preventDefault();

        const patient = this.patients.find(p => p.id === this.selectedPatient);
        if (!patient) {
            alert("Please select a patient");
            return;
        }

        const validItems = this.items.filter(item => item.serviceId && item.quantity > 0);
        if (validItems.length === 0) {
            alert("Please add at least one service");
            return;
        }

        const { subtotal, tax, total } = this.calculateTotals();

        const invoice = {
            id: `INV-${String(Date.now()).slice(-6)}`,
            patientId: patient.id,
            patientName: patient.name,
            date: new Date().toISOString(),
            items: validItems.map(item => ({
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
            })),
            subtotal,
            tax,
            total,
            status: "pending",
            paymentMethod: null,
            paidDate: null,
        };

        this.onSave?.(invoice);
        this.hide();
    }
}
