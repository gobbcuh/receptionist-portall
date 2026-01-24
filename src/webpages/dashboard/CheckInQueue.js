import { icons } from "../../iconsss/icons";
import { patientStore } from "../../data/patientStore";
import { StatsCard } from "../../systemm/dashboard/StatsCard";
import { PatientTable } from "../../systemm/dashboard/PatientTable";
import { PatientDetailModal } from "../../systemm/dashboard/PatientDetailModal";
import { DeleteConfirmModal } from "../../systemm/dashboard/DeleteConfirmModal";

export class CheckInQueue {
  constructor() {
    this.container = null;
    this.message = null;
    this.unsubscribe = null;

    // Delete confirmation modal
    this.deleteModal = new DeleteConfirmModal(
      (patient) => {
        patientStore.deletePatient(patient.id);
        this.message = { type: "success", text: `${patient.name} has been deleted.` };
        this.updateContent();
        setTimeout(() => { this.message = null; this.updateContent(); }, 3000);
      },
      () => {}
    );

    this.detailModal = new PatientDetailModal(
      () => {},
      (patient) => this.deleteModal.show(patient)
    );
  }

  render() {
    this.container = document.createElement("div");
    this.container.className = "space-y-6";
    
    // Subscribe to patient store updates
    this.unsubscribe = patientStore.subscribe(() => {
      this.updateContent();
    });
    
    this.updateContent();
    return this.container;
  }

  getQueue() {
    return patientStore.getQueuePatients();
  }

  updateContent() {
    if (!this.container) return;
    
    const queue = this.getQueue();
    const waiting = queue.filter(p => p.status === "waiting");
    const checkedIn = queue.filter(p => p.status === "checked-in");

    this.container.innerHTML = `
      <div><h1 class="text-xl font-semibold text-foreground">Check-in Queue</h1><p class="text-sm text-muted-foreground">Manage patient check-ins</p></div>
      ${this.message ? `<div class="p-3 rounded-lg text-sm bg-success/10 text-success border border-success/20">${this.message.text}</div>` : ''}
      <div class="grid gap-4 sm:grid-cols-3" id="stats-container"></div>
      <div><h2 class="mb-3 text-base font-medium text-foreground flex items-center gap-2"><span id="waiting-icon"></span>Waiting <span class="text-sm text-muted-foreground">(${waiting.length})</span></h2><div id="waiting-table"></div></div>
      <div><h2 class="mb-3 text-base font-medium text-foreground flex items-center gap-2"><span id="checked-icon"></span>Checked In <span class="text-sm text-muted-foreground">(${checkedIn.length})</span></h2><div id="checked-table"></div></div>
    `;

    // Stats
    const statsContainer = this.container.querySelector("#stats-container");
    [{ title: "Total in Queue", value: queue.length, variant: "primary" },
     { title: "Waiting", value: waiting.length, variant: "warning" },
     { title: "Checked In", value: checkedIn.length, variant: "success" }
    ].forEach(s => statsContainer?.appendChild(new StatsCard(s).render()));

    // Icons
    this.container.querySelector("#waiting-icon")?.appendChild(icons.clock("h-4 w-4 text-warning"));
    this.container.querySelector("#checked-icon")?.appendChild(icons.checkCircle("h-4 w-4 text-success"));

    // Tables
    this.container.querySelector("#waiting-table")?.appendChild(new PatientTable({
      patients: waiting,
      showCheckIn: true,
      onCheckIn: (id) => {
        const patient = patientStore.getPatientById(id);
        patientStore.updatePatientStatus(id, "checked-in");
        this.message = { type: "success", text: `${patient?.name} has been checked in.` };
        this.updateContent();
        setTimeout(() => { this.message = null; this.updateContent(); }, 3000);
      },
      onViewPatient: (p) => this.detailModal.show(p),
      onDeletePatient: (p) => this.deleteModal.show(p),
    }).render());

    this.container.querySelector("#checked-table")?.appendChild(new PatientTable({
      patients: checkedIn,
      onViewPatient: (p) => this.detailModal.show(p),
      onDeletePatient: (p) => this.deleteModal.show(p),
    }).render());
  }

  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}