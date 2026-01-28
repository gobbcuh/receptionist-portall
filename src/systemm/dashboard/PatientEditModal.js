import { cn } from "../../iconsss/utils";
import { icons } from "../../iconsss/icons";

export class PatientEditModal {
    constructor(onSave, onClose, onDelete) {
        this.patient = null;
        this.formData = {};
        this.container = null;
        this.onSave = onSave;
        this.onClose = onClose;
        this.onDelete = onDelete;
    }

    async show(patient) {
        this.patient = patient;
        this.formData = { ...patient };

        // Load doctors from API
        try {
            const { ReferenceAPI } = await import('../../services/api.js');
            this.doctors = await ReferenceAPI.getDoctors();
        } catch (error) {
            console.error('Error loading doctors:', error);
            const { doctors } = await import('../../data/patients.js');
            this.doctors = doctors;
        }

        this.render();
        document.body.appendChild(this.container);
    }

    hide() {
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
        this.patient = null;
        this.formData = {};
        this.onClose();
    }

    render() {
        if (!this.patient) return;

        this.container = document.createElement("div");
        this.container.id = "patient-edit-modal";

        // Backdrop
        const backdrop = document.createElement("div");
        backdrop.className = "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm animate-in fade-in-0";
        backdrop.addEventListener("click", () => this.hide());

        // Modal
        const modal = document.createElement("div");
        modal.className = "fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 animate-in fade-in-0 zoom-in-95";
        modal.addEventListener("click", (e) => e.stopPropagation());

        modal.innerHTML = `
      <div class="bg-card border border-border rounded-xl shadow-lg p-6 max-h-[90vh] overflow-y-auto">
        <!-- Header -->
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-foreground">Edit Patient</h2>
          <button id="close-modal-btn" class="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"></button>
        </div>

        <form id="edit-form" class="space-y-4">
          <!-- Name and basic info -->
          <div class="grid gap-4 sm:grid-cols-2">
            <div class="space-y-1.5">
              <label class="text-sm font-medium text-foreground">Name</label>
              <input id="name" value="${this.formData.name || ''}" class="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div class="space-y-1.5">
              <label class="text-sm font-medium text-foreground">Phone</label>
              <input id="phone" value="${this.formData.phone || ''}" class="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div class="space-y-1.5">
                <label class="text-sm font-medium text-foreground">Age</label>
                <input id="age" type="number" value="${this.formData.age || ''}" class="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div class="space-y-1.5">
                <label class="text-sm font-medium text-foreground">Sex Assigned at Birth</label>
                <select id="sex" class="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="Male" ${this.formData.sex === 'Male' ? 'selected' : ''}>Male</option>
                    <option value="Female" ${this.formData.sex === 'Female' ? 'selected' : ''}>Female</option>
                </select>
            </div>
          </div>

        <div class="space-y-1.5">
            <label class="text-sm font-medium text-foreground">Gender Identity</label>
            <select id="gender" class="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="Male" ${this.formData.gender === 'Male' ? 'selected' : ''}>Male</option>
                <option value="Female" ${this.formData.gender === 'Female' ? 'selected' : ''}>Female</option>
                <option value="Non-binary" ${this.formData.gender === 'Non-binary' ? 'selected' : ''}>Non-binary</option>
                <option value="Prefer not to say" ${this.formData.gender === 'Prefer not to say' ? 'selected' : ''}>Prefer not to say</option>
                <option value="Other" ${this.formData.gender === 'Other' ? 'selected' : ''}>Other</option>
            </select>
        </div>

          <!-- Doctor Assignment -->
          <div class="space-y-1.5">
                <label class="text-sm font-medium text-foreground">Assigned Doctor</label>
                <select id="assignedDoctor" class="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="">Select doctor...</option>
                    ${(this.doctors || []).map(doc => {
                        const doctorName = typeof doc === 'string' ? doc : doc.full_name || `${doc.first_name} ${doc.last_name}`;
                        return `<option value="${doctorName}" ${this.formData.assignedDoctor === doctorName ? 'selected' : ''}>${doctorName}</option>`;
                    }).join('')}
                </select>
          </div>

          <!-- Emergency Contact -->
          <div class="grid gap-4 sm:grid-cols-2">
            <div class="space-y-1.5">
              <label class="text-sm font-medium text-foreground">Contact Name</label>
              <input id="emergencyContact" value="${this.formData.emergencyContact || ''}" class="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div class="space-y-1.5">
              <label class="text-sm font-medium text-foreground">Contact Phone</label>
              <input id="emergencyPhone" value="${this.formData.emergencyPhone || ''}" class="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="text-sm font-medium text-foreground">Relationship</label>
            <select id="emergencyContactRelationship" class="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">Select relationship...</option>
              <option value="Spouse" ${this.formData.emergencyContactRelationship === 'Spouse' ? 'selected' : ''}>Spouse</option>
              <option value="Parent" ${this.formData.emergencyContactRelationship === 'Parent' ? 'selected' : ''}>Parent</option>
              <option value="Child" ${this.formData.emergencyContactRelationship === 'Child' ? 'selected' : ''}>Child</option>
              <option value="Sibling" ${this.formData.emergencyContactRelationship === 'Sibling' ? 'selected' : ''}>Sibling</option>
              <option value="Partner" ${this.formData.emergencyContactRelationship === 'Partner' ? 'selected' : ''}>Partner</option>
              <option value="Friend" ${this.formData.emergencyContactRelationship === 'Friend' ? 'selected' : ''}>Friend</option>
              <option value="Guardian" ${this.formData.emergencyContactRelationship === 'Guardian' ? 'selected' : ''}>Guardian</option>
              <option value="Other" ${this.formData.emergencyContactRelationship === 'Other' ? 'selected' : ''}>Other</option>
            </select>
          </div>

          <!-- Follow-up -->
          <div class="space-y-3">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" id="hasFollowUp" ${this.formData.hasFollowUp ? 'checked' : ''} class="h-4 w-4 rounded border-primary text-primary focus:ring-primary" />
              <span class="text-sm text-foreground">Has follow-up checkup</span>
            </label>

            <div id="followUpDateContainer" class="space-y-1.5 ${this.formData.hasFollowUp ? '' : 'hidden'}">
              <label class="text-sm font-medium text-foreground">Follow-up Date</label>
              <input id="followUpDate" type="date" value="${this.formData.followUpDate || ''}" class="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>

          <!-- Status -->
          <div class="space-y-1.5">
            <label class="text-sm font-medium text-foreground">Status</label>
            <select id="status" class="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="waiting" ${this.formData.status === 'waiting' ? 'selected' : ''}>Waiting</option>
              <option value="checked-in" ${this.formData.status === 'checked-in' ? 'selected' : ''}>Checked In</option>
              <option value="completed" ${this.formData.status === 'completed' ? 'selected' : ''}>Completed</option>
            </select>
          </div>

          <!-- Medical Notes -->
          <div class="space-y-1.5">
            <label class="text-sm font-medium text-foreground">Medical Notes</label>
            <textarea id="medicalNotes" placeholder="Allergies, conditions, notes..." rows="3" class="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none">${this.formData.medicalNotes || ''}</textarea>
          </div>

          <!-- Actions -->
          <div class="flex flex-col gap-3 pt-2">
            <div class="flex justify-end gap-2">
              <button type="button" id="cancel-btn" class="px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm font-medium hover:bg-muted transition-colors">
                Cancel
              </button>
              <button type="submit" class="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2">
                <span id="save-icon"></span>
                Save Changes
              </button>
            </div>
            
            <!-- Delete Button -->
            <div class="pt-2 border-t border-border">
              <button type="button" id="delete-btn" class="w-full px-4 py-2.5 rounded-lg border border-destructive/30 text-destructive text-sm font-medium hover:bg-destructive/10 transition-colors flex items-center justify-center gap-2">
                <span id="delete-icon"></span>
                Delete Patient
              </button>
            </div>
          </div>
        </form>
      </div>
    `;

        // Add icons
        const closeBtn = modal.querySelector("#close-modal-btn");
        if (closeBtn) {
            closeBtn.appendChild(icons.x("h-4 w-4"));
            closeBtn.addEventListener("click", () => this.hide());
        }

        const saveIcon = modal.querySelector("#save-icon");
        if (saveIcon) saveIcon.appendChild(icons.save("h-4 w-4"));

        const cancelBtn = modal.querySelector("#cancel-btn");
        if (cancelBtn) {
            cancelBtn.addEventListener("click", () => this.hide());
        }

        const deleteIcon = modal.querySelector("#delete-icon");
        if (deleteIcon) deleteIcon.appendChild(icons.trash("h-4 w-4"));

        const deleteBtn = modal.querySelector("#delete-btn");
        if (deleteBtn) {
            deleteBtn.addEventListener("click", () => {
                this.hide();
                this.onDelete?.(this.patient);
            });
        }

        // Handle follow-up toggle
        const hasFollowUpCheckbox = modal.querySelector("#hasFollowUp");
        const followUpDateContainer = modal.querySelector("#followUpDateContainer");
        if (hasFollowUpCheckbox && followUpDateContainer) {
            hasFollowUpCheckbox.addEventListener("change", () => {
                followUpDateContainer.classList.toggle("hidden", !hasFollowUpCheckbox.checked);
            });
        }

        // Form submission
        const form = modal.querySelector("#edit-form");
        if (form) {
            form.addEventListener("submit", (e) => {
                e.preventDefault();
                this.handleSubmit(modal);
            });
        }

        this.container.appendChild(backdrop);
        this.container.appendChild(modal);
    }

    handleSubmit(modal) {
        const name = modal.querySelector("#name").value;
        const phone = modal.querySelector("#phone").value;
        const age = parseInt(modal.querySelector("#age").value);
        const sex = modal.querySelector("#sex").value;
        const gender = modal.querySelector("#gender").value;
        const assignedDoctor = modal.querySelector("#assignedDoctor").value;
        const hasFollowUp = modal.querySelector("#hasFollowUp").checked;
        const followUpDate = modal.querySelector("#followUpDate").value;
        const status = modal.querySelector("#status").value;
        const medicalNotes = modal.querySelector("#medicalNotes").value;

        const updatedPatient = {
            ...this.patient,
            name,
            phone,
            age,
            sex,
            gender,
            assignedDoctor: assignedDoctor || undefined,
            hasFollowUp,
            followUpDate: hasFollowUp ? followUpDate : undefined,
            status,
            medicalNotes: medicalNotes || undefined,
        };

        this.onSave(updatedPatient);
        this.hide();
    }
}
