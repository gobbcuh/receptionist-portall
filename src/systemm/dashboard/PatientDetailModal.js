import { cn } from "../../iconsss/utils";
import { icons } from "../../iconsss/icons";

const statusConfig = {
  waiting: {
    label: "Waiting",
    className: "bg-warning/10 text-warning border-warning/20",
    icon: "clock",
  },
  "checked-in": {
    label: "Checked In",
    className: "bg-primary/10 text-primary border-primary/20",
    icon: "user",
  },
  completed: {
    label: "Completed",
    className: "bg-success/10 text-success border-success/20",
    icon: "checkCircle",
  },
};

export class PatientDetailModal {
  constructor(onClose, onDelete) {
    this.patient = null;
    this.container = null;
    this.onClose = onClose;
    this.onDelete = onDelete;
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
    this.onClose();
  }

  render() {
    if (!this.patient) return;

    const status = statusConfig[this.patient.status];

    this.container = document.createElement("div");
    this.container.id = "patient-detail-modal";

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
        <!-- Header -->
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-foreground">Patient Information</h2>
          <button id="close-modal-btn" class="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"></button>
        </div>
        
        <div class="space-y-5">
          <!-- Patient header -->
          <div class="flex items-center gap-4">
            <div class="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-foreground text-xl font-semibold">
              ${this.patient.name.charAt(0)}
            </div>
            <div>
              <h3 class="font-semibold text-foreground">${this.patient.name}</h3>
              <p class="text-sm text-muted-foreground">${this.patient.age} years old, ${this.patient.gender}</p>
            </div>
          </div>

          <!-- Status -->
          <div class="flex items-center gap-2">
            <span class="text-sm text-muted-foreground">Status:</span>
            <span class="${cn("inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border", status.className)}">
              <span id="status-icon"></span>
              ${status.label}
            </span>
          </div>

          <!-- Info grid -->
          <div class="grid gap-4">
            <div class="flex items-center gap-3 text-sm">
              <span id="phone-icon"></span>
              <span class="text-foreground">${this.patient.phone}</span>
            </div>
            
            <div class="flex items-center gap-3 text-sm">
              <span id="clock-icon"></span>
              <span class="text-muted-foreground">Registered:</span>
              <span class="text-foreground">${this.patient.registrationTime}</span>
            </div>

            <div class="flex items-center gap-3 text-sm">
              <span id="doctor-icon"></span>
              <span class="text-muted-foreground">Assigned Doctor:</span>
              <span class="text-foreground">${this.patient.assignedDoctor || "Not assigned"}</span>
            </div>

            <div class="flex items-center gap-3 text-sm">
              <span id="calendar-icon"></span>
              <span class="text-muted-foreground">Follow-up:</span>
              <span class="text-foreground">
                ${this.patient.hasFollowUp ? this.patient.followUpDate : "None scheduled"}
              </span>
            </div>
          </div>

          ${this.patient.medicalNotes ? `
            <!-- Medical Notes -->
            <div class="space-y-2">
              <div class="flex items-center gap-2 text-sm">
                <span id="notes-icon"></span>
                <span class="text-muted-foreground font-medium">Medical Notes</span>
              </div>
              <div class="rounded-md bg-muted/50 p-3">
                <p class="text-sm text-foreground">${this.patient.medicalNotes}</p>
              </div>
            </div>
          ` : ''}

          <!-- Delete Button -->
          <div class="pt-2 border-t border-border">
            <button id="delete-btn" class="w-full px-4 py-2.5 rounded-lg border border-destructive/30 text-destructive text-sm font-medium hover:bg-destructive/10 transition-colors flex items-center justify-center gap-2">
              <span id="delete-icon"></span>
              Delete Patient
            </button>
          </div>
        </div>
      </div>
    `;

    // Add icons
    const closeBtn = modal.querySelector("#close-modal-btn");
    if (closeBtn) {
      closeBtn.appendChild(icons.x("h-4 w-4"));
      closeBtn.addEventListener("click", () => this.hide());
    }

    const statusIcon = modal.querySelector("#status-icon");
    if (statusIcon) statusIcon.appendChild(icons[status.icon]("h-3 w-3"));

    const phoneIcon = modal.querySelector("#phone-icon");
    if (phoneIcon) phoneIcon.appendChild(icons.phone("h-4 w-4 text-muted-foreground"));

    const clockIcon = modal.querySelector("#clock-icon");
    if (clockIcon) clockIcon.appendChild(icons.clock("h-4 w-4 text-muted-foreground"));

    const doctorIcon = modal.querySelector("#doctor-icon");
    if (doctorIcon) doctorIcon.appendChild(icons.stethoscope("h-4 w-4 text-muted-foreground"));

    const calendarIcon = modal.querySelector("#calendar-icon");
    if (calendarIcon) calendarIcon.appendChild(icons.calendar("h-4 w-4 text-muted-foreground"));

    const notesIcon = modal.querySelector("#notes-icon");
    if (notesIcon) notesIcon.appendChild(icons.fileText("h-4 w-4 text-muted-foreground"));

    const deleteIcon = modal.querySelector("#delete-icon");
    if (deleteIcon) deleteIcon.appendChild(icons.trash("h-4 w-4"));

    const deleteBtn = modal.querySelector("#delete-btn");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", () => {
        this.hide();
        this.onDelete?.(this.patient);
      });
    }

    this.container.appendChild(backdrop);
    this.container.appendChild(modal);
  }
}
