import { icons } from "../../iconsss/icons";

export class DeleteConfirmModal {
    constructor(onConfirm, onClose) {
        this.patient = null;
        this.container = null;
        this.onConfirm = onConfirm;
        this.onClose = onClose;
        this.selectedReason = "";
        this.customReason = "";
        this.canDelete = false;
        this.deleteCheckMessage = "";
    }

    async show(patient) {
        this.patient = patient;
        this.selectedReason = "";
        this.customReason = "";
        this.canDelete = false;
        this.deleteCheckMessage = "Checking...";
        
        // Render modal first
        this.render();
        document.body.appendChild(this.container);
        
        // Check if patient can be deleted
        await this.checkCanDelete();
    }

    async checkCanDelete() {
        try {
            const response = await fetch(`http://localhost:5000/api/patients/${this.patient.id}/can-delete`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            
            const data = await response.json();
            
            this.canDelete = data.can_delete;
            this.deleteCheckMessage = data.reason || "";
            
            // Re-render with updated state
            this.updateContent();
            
        } catch (error) {
            console.error('Error checking delete permission:', error);
            this.canDelete = false;
            this.deleteCheckMessage = "Error checking permissions";
            this.updateContent();
        }
    }

    hide() {
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
        this.patient = null;
        this.onClose?.();
    }

    updateContent() {
        const contentArea = this.container?.querySelector("#modal-content");
        if (!contentArea) return;
        
        if (!this.canDelete) {
            // CANNOT DELETE - Show error message
            contentArea.innerHTML = `
                <div class="flex items-center justify-center mb-4">
                    <div class="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center" id="warning-icon"></div>
                </div>
                
                <h2 class="text-lg font-semibold text-foreground text-center mb-2">Cannot Delete Patient</h2>
                
                <div class="p-3 rounded-lg bg-muted border border-border mb-4">
                    <p class="text-sm text-foreground text-center">${this.deleteCheckMessage}</p>
                </div>
                
                <p class="text-xs text-muted-foreground text-center mb-6">
                    Patient records with medical history or payment records cannot be deleted due to legal retention requirements.
                </p>
                
                <button id="close-btn" class="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm font-medium hover:bg-muted transition-colors">
                    Close
                </button>
            `;
            
            const warningIcon = contentArea.querySelector("#warning-icon");
            if (warningIcon) warningIcon.appendChild(icons.alertTriangle("h-6 w-6 text-destructive"));
            
            const closeBtn = contentArea.querySelector("#close-btn");
            if (closeBtn) closeBtn.addEventListener("click", () => this.hide());
            
        } else {
            // CAN DELETE - Show deactivation form
            contentArea.innerHTML = `
                <div class="flex items-center justify-center mb-4">
                    <div class="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center" id="warning-icon"></div>
                </div>

                <h2 class="text-lg font-semibold text-foreground text-center mb-2">Deactivate Patient Record</h2>
                
                <p class="text-sm text-muted-foreground text-center mb-4">
                    Deactivating <span class="font-medium text-foreground">${this.patient.name}</span> will mark the record as inactive. The data will be preserved for audit purposes.
                </p>
                
                <div class="mb-6">
                    <label class="block text-sm font-medium text-foreground mb-2">
                        Reason for deactivation <span class="text-destructive">*</span>
                    </label>
                    
                    <div class="space-y-2">
                        <label class="flex items-center gap-2 p-2 rounded-lg border border-input hover:bg-muted/50 cursor-pointer transition-colors">
                            <input type="radio" name="reason" value="Duplicate entry" class="reason-radio">
                            <span class="text-sm text-foreground">Duplicate entry</span>
                        </label>
                        
                        <label class="flex items-center gap-2 p-2 rounded-lg border border-input hover:bg-muted/50 cursor-pointer transition-colors">
                            <input type="radio" name="reason" value="Wrong information" class="reason-radio">
                            <span class="text-sm text-foreground">Wrong information</span>
                        </label>
                        
                        <label class="flex items-center gap-2 p-2 rounded-lg border border-input hover:bg-muted/50 cursor-pointer transition-colors">
                            <input type="radio" name="reason" value="Test/demo data" class="reason-radio">
                            <span class="text-sm text-foreground">Test/demo data</span>
                        </label>
                        
                        <label class="flex items-center gap-2 p-2 rounded-lg border border-input hover:bg-muted/50 cursor-pointer transition-colors">
                            <input type="radio" name="reason" value="other" class="reason-radio">
                            <span class="text-sm text-foreground">Other</span>
                        </label>
                    </div>
                    
                    <div id="custom-reason-container" style="display: none;" class="mt-2">
                        <input 
                            type="text" 
                            id="custom-reason" 
                            placeholder="Please specify reason..." 
                            class="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                    </div>
                </div>

                <div class="flex gap-3">
                    <button id="cancel-btn" class="flex-1 px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm font-medium hover:bg-muted transition-colors">
                        Cancel
                    </button>
                    <button id="deactivate-btn" disabled class="flex-1 px-4 py-2.5 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                        <span id="delete-icon"></span>
                        Deactivate
                    </button>
                </div>
            `;
            
            const warningIcon = contentArea.querySelector("#warning-icon");
            if (warningIcon) warningIcon.appendChild(icons.alertTriangle("h-6 w-6 text-warning"));
            
            const deleteIcon = contentArea.querySelector("#delete-icon");
            if (deleteIcon) deleteIcon.appendChild(icons.trash("h-4 w-4"));
            
            // Event listeners for reason selection
            const radioButtons = contentArea.querySelectorAll('.reason-radio');
            const customReasonContainer = contentArea.querySelector('#custom-reason-container');
            const customReasonInput = contentArea.querySelector('#custom-reason');
            const deactivateBtn = contentArea.querySelector('#deactivate-btn');
            
            radioButtons.forEach(radio => {
                radio.addEventListener('change', (e) => {
                    this.selectedReason = e.target.value;
                    
                    if (e.target.value === 'other') {
                        customReasonContainer.style.display = 'block';
                        customReasonInput.focus();
                    } else {
                        customReasonContainer.style.display = 'none';
                        this.customReason = '';
                    }
                    
                    this.updateDeactivateButton();
                });
            });
            
            if (customReasonInput) {
                customReasonInput.addEventListener('input', (e) => {
                    this.customReason = e.target.value;
                    this.updateDeactivateButton();
                });
            }
            
            const cancelBtn = contentArea.querySelector("#cancel-btn");
            if (cancelBtn) {
                cancelBtn.addEventListener("click", () => this.hide());
            }
            
            if (deactivateBtn) {
                deactivateBtn.addEventListener("click", () => this.handleDeactivate());
            }
        }
    }

    updateDeactivateButton() {
        const deactivateBtn = this.container?.querySelector('#deactivate-btn');
        if (!deactivateBtn) return;
        
        const hasReason = this.selectedReason && 
                         (this.selectedReason !== 'other' || this.customReason.trim() !== '');
        
        deactivateBtn.disabled = !hasReason;
    }

    async handleDeactivate() {
        const reason = this.selectedReason === 'other' 
            ? `Other: ${this.customReason}` 
            : this.selectedReason;
        
        try {
            const response = await fetch(`http://localhost:5000/api/patients/${this.patient.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reason })
            });
            
            if (response.ok) {
                this.onConfirm?.({ ...this.patient, deactivationReason: reason });
                this.hide();
            } else {
                const error = await response.json();
                alert(`Error: ${error.error || 'Failed to deactivate patient'}`);
            }
        } catch (error) {
            console.error('Error deactivating patient:', error);
            alert('Failed to deactivate patient. Please try again.');
        }
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
        modal.className = "fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 animate-in fade-in-0 zoom-in-95";
        modal.addEventListener("click", (e) => e.stopPropagation());

        modal.innerHTML = `
            <div class="bg-card border border-border rounded-xl shadow-lg p-6">
                <div id="modal-content">
                    <div class="flex items-center justify-center py-8">
                        <div class="text-sm text-muted-foreground">Checking permissions...</div>
                    </div>
                </div>
            </div>
        `;

        this.container.appendChild(backdrop);
        this.container.appendChild(modal);
    }
}