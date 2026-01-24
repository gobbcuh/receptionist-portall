import { icons } from "../../iconsss/icons";

export class DeleteConfirmModal {
  constructor(onConfirm, onClose) {
    this.patient = null;
    this.container = null;
    this.onConfirm = onConfirm;
    this.onClose = onClose;
  }

  show(patient) {
    this.patient = patient;
    this.render();
    document.body.appendChild(this.container);
  }

  hide() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    this.patient = null;
    this.onClose?.();
  }

  render() {
    if (!this.patient) return;

    this.container = document.createElement("div");
    this.container.id = "delete-confirm-modal";

    // Backdrop
    const backdrop = document.createElement("div");
    backdrop.className = "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm animate-in fade-in-0";
    backdrop.addEventListener("click", () => this.hide());

    // Modal
    const modal = document.createElement("div");
    modal.className = "fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 animate-in fade-in-0 zoom-in-95";
    modal.addEventListener("click", (e) => e.stopPropagation());

    modal.innerHTML = `
      <div class="bg-card border border-border rounded-xl shadow-lg p-6">
        <!-- Warning Icon -->
        <div class="flex items-center justify-center mb-4">
          <div class="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center" id="warning-icon"></div>
        </div>

        <!-- Title -->
        <h2 class="text-lg font-semibold text-foreground text-center mb-2">Delete Patient</h2>
        
        <!-- Message -->
        <p class="text-sm text-muted-foreground text-center mb-6">
          Are you sure you want to delete <span class="font-medium text-foreground">${this.patient.name}</span>? This action cannot be undone.
        </p>

        <!-- Actions -->
        <div class="flex gap-3">
          <button id="cancel-btn" class="flex-1 px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm font-medium hover:bg-muted transition-colors">
            Cancel
          </button>
          <button id="delete-btn" class="flex-1 px-4 py-2.5 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90 transition-colors flex items-center justify-center gap-2">
            <span id="delete-icon"></span>
            Delete
          </button>
        </div>
      </div>
    `;

    // Add icons
    const warningIcon = modal.querySelector("#warning-icon");
    if (warningIcon) warningIcon.appendChild(icons.alertTriangle("h-6 w-6 text-destructive"));

    const deleteIcon = modal.querySelector("#delete-icon");
    if (deleteIcon) deleteIcon.appendChild(icons.trash("h-4 w-4"));

    // Event listeners
    const cancelBtn = modal.querySelector("#cancel-btn");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => this.hide());
    }

    const deleteBtn = modal.querySelector("#delete-btn");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", () => {
        this.onConfirm?.(this.patient);
        this.hide();
      });
    }

    this.container.appendChild(backdrop);
    this.container.appendChild(modal);
  }
}