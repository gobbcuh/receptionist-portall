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
    constructor(onClose) {
        this.patient = null;
        this.container = null;
        this.onClose = onClose;
        this.visitHistory = [];
        this.isLoadingHistory = false;
    }

    async show(patient) {
        this.patient = patient;
        this.visitHistory = [];
        this.isLoadingHistory = true;
        
        // Render modal first (with loading state)
        this.render();
        document.body.appendChild(this.container);
        
        // Then load visit history
        await this.loadVisitHistory();
    }

    async loadVisitHistory() {
        try {
            const response = await fetch(`http://localhost:5000/api/patients/${this.patient.id}/visits`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            
            if (response.ok) {
                this.visitHistory = await response.json();
                console.log('✅ Loaded visit history:', this.visitHistory.length, 'visits');
            } else {
                console.error('Failed to load visit history');
                this.visitHistory = [];
            }
        } catch (error) {
            console.error('Error loading visit history:', error);
            this.visitHistory = [];
        } finally {
            this.isLoadingHistory = false;
            this.renderVisitHistory();
        }
    }

    hide() {
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
        this.patient = null;
        this.visitHistory = [];
        this.onClose();
    }

    getVisitStatusConfig(statusName) {
        const normalizedStatus = statusName?.toLowerCase().replace(/[\s-]/g, '-');
        return statusConfig[normalizedStatus] || {
            label: statusName || "Unknown",
            className: "bg-muted/10 text-muted-foreground border-muted/20",
            icon: "helpCircle"
        };
    }

    renderVisitHistory() {
        const historyContainer = this.container?.querySelector('#visit-history-container');
        if (!historyContainer) return;

        if (this.isLoadingHistory) {
            historyContainer.innerHTML = `
                <div class="flex items-center justify-center py-8">
                    <div class="text-sm text-muted-foreground">Loading visit history...</div>
                </div>
            `;
            return;
        }

        if (this.visitHistory.length === 0) {
            historyContainer.innerHTML = `
                <div class="flex items-center justify-center py-8">
                    <div class="text-sm text-muted-foreground">No visit history found</div>
                </div>
            `;
            return;
        }

        historyContainer.innerHTML = `
            <div class="space-y-3 max-h-64 overflow-y-auto pr-2">
                ${this.visitHistory.map(visit => {
                    const statusConfig = this.getVisitStatusConfig(visit.statusName);
                    const isCompleted = visit.statusId === 3;
                    const isPaid = visit.billStatus?.toLowerCase() === 'paid';
                    
                    return `
                        <div class="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
                            <!-- Visit Header -->
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-2">
                                    <span id="calendar-icon-${visit.visitId}"></span>
                                    <span class="text-sm font-medium text-foreground">${visit.visitDate}</span>
                                </div>
                                <span class="${cn("inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border", statusConfig.className)}">
                                    <span id="status-icon-${visit.visitId}"></span>
                                    ${statusConfig.label}
                                </span>
                            </div>
                            
                            <!-- Visit Details -->
                            <div class="grid gap-1.5 text-sm">
                                <div class="flex items-center gap-2">
                                    <span id="dept-icon-${visit.visitId}"></span>
                                    <span class="text-muted-foreground">Department:</span>
                                    <span class="text-foreground font-medium">${visit.departmentName}</span>
                                </div>
                                
                                <div class="flex items-center gap-2">
                                    <span id="doctor-icon-${visit.visitId}"></span>
                                    <span class="text-muted-foreground">Doctor:</span>
                                    <span class="text-foreground">${visit.doctorName}</span>
                                </div>
                                
                                <div class="flex items-start gap-2">
                                    <span id="complaint-icon-${visit.visitId}" class="mt-0.5"></span>
                                    <span class="text-muted-foreground">Reason:</span>
                                    <span class="text-foreground flex-1">${visit.chiefComplaint}</span>
                                </div>
                                
                                ${isCompleted ? `
                                    <div class="flex items-center gap-2 mt-1 pt-2 border-t border-border/50">
                                        <span id="bill-icon-${visit.visitId}"></span>
                                        <span class="text-muted-foreground">Bill:</span>
                                        <span class="text-foreground font-medium">₱${visit.billTotal.toFixed(2)}</span>
                                        <span class="${isPaid ? 'text-success' : 'text-warning'} text-xs ml-auto">
                                            ${isPaid ? 'Paid' : 'Pending'}
                                        </span>
                                    </div>
                                ` : ''}
                                
                                ${visit.checkInDate ? `
                                    <div class="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span id="checkin-icon-${visit.visitId}"></span>
                                        Checked in: ${visit.checkInDate}
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        // Add icons for each visit
        this.visitHistory.forEach(visit => {
            const statusConfig = this.getVisitStatusConfig(visit.statusName);
            const isCompleted = visit.statusId === 3;
            
            const calendarIcon = historyContainer.querySelector(`#calendar-icon-${visit.visitId}`);
            if (calendarIcon) calendarIcon.appendChild(icons.calendar("h-4 w-4 text-muted-foreground"));
            
            const statusIcon = historyContainer.querySelector(`#status-icon-${visit.visitId}`);
            if (statusIcon) statusIcon.appendChild(icons[statusConfig.icon]("h-3 w-3"));
            
            const deptIcon = historyContainer.querySelector(`#dept-icon-${visit.visitId}`);
            if (deptIcon) deptIcon.appendChild(icons.building("h-3.5 w-3.5 text-muted-foreground"));
            
            const doctorIcon = historyContainer.querySelector(`#doctor-icon-${visit.visitId}`);
            if (doctorIcon) doctorIcon.appendChild(icons.stethoscope("h-3.5 w-3.5 text-muted-foreground"));
            
            const complaintIcon = historyContainer.querySelector(`#complaint-icon-${visit.visitId}`);
            if (complaintIcon) complaintIcon.appendChild(icons.fileText("h-3.5 w-3.5 text-muted-foreground"));
            
            if (isCompleted) {
                const billIcon = historyContainer.querySelector(`#bill-icon-${visit.visitId}`);
                if (billIcon) billIcon.appendChild(icons.dollarSign("h-3.5 w-3.5 text-muted-foreground"));
            }
            
            if (visit.checkInDate) {
                const checkinIcon = historyContainer.querySelector(`#checkin-icon-${visit.visitId}`);
                if (checkinIcon) checkinIcon.appendChild(icons.clock("h-3 w-3"));
            }
        });
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
        modal.className = "fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 animate-in fade-in-0 zoom-in-95";
        modal.addEventListener("click", (e) => e.stopPropagation());

        modal.innerHTML = `
      <div class="bg-card border border-border rounded-xl shadow-lg p-6 max-h-[90vh] overflow-y-auto">
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
                <p class="text-sm text-muted-foreground">${this.patient.age} years old</p>
            </div>
          </div>

          <!-- Current Status -->
          <div class="flex items-center gap-2">
            <span class="text-sm text-muted-foreground">Current Status:</span>
            <span class="${cn("inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border", status.className)}">
              <span id="status-icon"></span>
              ${status.label}
            </span>
          </div>

          <!-- Info grid -->
          <div class="grid gap-4">
            <div class="flex items-center gap-3 text-sm">
                <span id="phone-icon"></span>
                <span class="text-muted-foreground">Phone:</span>
                <span class="text-foreground">${this.patient.phone || "Not provided"}</span>
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

            <div class="flex items-center gap-3 text-sm">
              <span id="sex-icon"></span>
              <span class="text-muted-foreground">Sex:</span>
              <span class="text-foreground">${this.patient.sex || "Not specified"}</span>
            </div>

            <div class="flex items-center gap-3 text-sm">
              <span id="gender-icon"></span>
              <span class="text-muted-foreground">Gender Identity:</span>
              <span class="text-foreground">${this.patient.gender || "Not specified"}</span>
            </div>

            <div class="flex items-center gap-3 text-sm">
              <span id="emergency-icon"></span>
              <span class="text-muted-foreground">Emergency Contact:</span>
              <span class="text-foreground">${this.patient.emergencyContact || "Not provided"}</span>
            </div>

            ${this.patient.emergencyContactRelationship ? `
              <div class="flex items-center gap-3 text-sm">
                <span id="relationship-icon"></span>
                <span class="text-muted-foreground">Relationship:</span>
                <span class="text-foreground">${this.patient.emergencyContactRelationship}</span>
              </div>
            ` : ''}

            <div class="flex items-center gap-3 text-sm">
                <span id="emergency-phone-icon"></span>
                <span class="text-muted-foreground">Contact Phone:</span>
                <span class="text-foreground">${this.patient.emergencyPhone || "Not provided"}</span>
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
          
          <!-- Visit History Section -->
          <div class="space-y-3 pt-4 border-t border-border">
            <div class="flex items-center gap-2">
              <span id="history-icon"></span>
              <h3 class="text-sm font-semibold text-foreground">Visit History</h3>
              <span class="text-xs text-muted-foreground ml-auto">${this.visitHistory.length} visit${this.visitHistory.length !== 1 ? 's' : ''}</span>
            </div>
            <div id="visit-history-container">
              <!-- Visit history will be loaded here -->
            </div>
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

        const sexIcon = modal.querySelector("#sex-icon");
        if (sexIcon) sexIcon.appendChild(icons.user("h-4 w-4 text-muted-foreground"));

        const genderIcon = modal.querySelector("#gender-icon");
        if (genderIcon) genderIcon.appendChild(icons.heart("h-4 w-4 text-muted-foreground"));

        const emergencyIcon = modal.querySelector("#emergency-icon");
        if (emergencyIcon) emergencyIcon.appendChild(icons.user("h-4 w-4 text-muted-foreground"));

        const relationshipIcon = modal.querySelector("#relationship-icon");
        if (relationshipIcon) relationshipIcon.appendChild(icons.user("h-4 w-4 text-muted-foreground"));

        const emergencyPhoneIcon = modal.querySelector("#emergency-phone-icon");
        if (emergencyPhoneIcon) emergencyPhoneIcon.appendChild(icons.phone("h-4 w-4 text-muted-foreground"));

        const notesIcon = modal.querySelector("#notes-icon");
        if (notesIcon) notesIcon.appendChild(icons.fileText("h-4 w-4 text-muted-foreground"));

        const historyIcon = modal.querySelector("#history-icon");
        if (historyIcon) historyIcon.appendChild(icons.fileText("h-4 w-4 text-foreground"));

        this.container.appendChild(backdrop);
        this.container.appendChild(modal);
        
        // Render initial visit history (loading state)
        this.renderVisitHistory();
    }
}