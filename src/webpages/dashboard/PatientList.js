import { icons } from "../../iconsss/icons";
import { patientStore } from "../../data/patientStore";
import { doctors } from "../../data/patients";
import { PatientTable } from "../../systemm/dashboard/PatientTable";
import { PatientDetailModal } from "../../systemm/dashboard/PatientDetailModal";
import { PatientEditModal } from "../../systemm/dashboard/PatientEditModal";
import { DeleteConfirmModal } from "../../systemm/dashboard/DeleteConfirmModal";
export class PatientList {
  constructor() {
    this.searchQuery = "";
    this.statusFilter = "all";
    this.doctorFilter = "all";
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

    // Detail modal with delete callback
    this.detailModal = new PatientDetailModal(
      () => {},
      (patient) => this.deleteModal.show(patient)
    );

    // Edit modal with delete callback
    this.editModal = new PatientEditModal(
      (patient) => {
        patientStore.updatePatient(patient.id, patient);
        this.message = { type: "success", text: `${patient.name}'s information saved.` };
        this.updateContent();
        setTimeout(() => { this.message = null; this.updateContent(); }, 3000);
      },
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

  getFilteredPatients() {
    const patients = patientStore.getPatients();
    return patients.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(this.searchQuery.toLowerCase()) || p.phone.includes(this.searchQuery);
      const matchesStatus = this.statusFilter === "all" || p.status === this.statusFilter;
      const matchesDoctor = this.doctorFilter === "all" || p.assignedDoctor === this.doctorFilter;
      return matchesSearch && matchesStatus && matchesDoctor;
    });
  }

  updateContent() {
    if (!this.container) return;
    const patients = patientStore.getPatients();
    const filtered = this.getFilteredPatients();
    const counts = { 
      total: patients.length, 
      waiting: patients.filter(p => p.status === "waiting").length, 
      checkedIn: patients.filter(p => p.status === "checked-in").length, 
      completed: patients.filter(p => p.status === "completed").length 
    };
    const uniqueDoctors = [...new Set(patients.map(p => p.assignedDoctor).filter(Boolean))];

    this.container.innerHTML = `
      ${this.message ? `<div class="p-3 rounded-lg text-sm ${this.message.type === "success" ? "bg-success/10 text-success border border-success/20" : "bg-destructive/10 text-destructive border border-destructive/20"}">${this.message.text}</div>` : ''}
      <div><h1 class="text-2xl font-semibold text-foreground tracking-tight">Patient List</h1><p class="text-sm text-muted-foreground mt-1">Manage and monitor patient records</p></div>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3" id="status-cards"></div>
      <div class="flex flex-col gap-3 p-4 rounded-xl bg-muted/30 border border-border">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div class="relative flex-1"><span id="search-icon" class="absolute left-3 top-1/2 -translate-y-1/2"></span><input id="search-input" placeholder="Search..." value="${this.searchQuery}" class="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
          <div class="flex gap-2">
            <select id="status-filter" class="w-[140px] h-10 px-3 rounded-lg border border-input bg-background text-foreground text-sm"><option value="all">All Status</option><option value="waiting">Waiting</option><option value="checked-in">Checked In</option><option value="completed">Completed</option></select>
            <select id="doctor-filter" class="w-[160px] h-10 px-3 rounded-lg border border-input bg-background text-foreground text-sm"><option value="all">All Doctors</option>${uniqueDoctors.map(d => `<option value="${d}">${d}</option>`).join('')}</select>
          </div>
        </div>
      </div>
      <p class="text-sm text-muted-foreground">Showing <span class="font-medium text-foreground">${filtered.length}</span> of ${patients.length} patients</p>
      <div id="table-container"></div>
    `;

    const searchIcon = this.container.querySelector("#search-icon");
    if (searchIcon) searchIcon.appendChild(icons.search("h-4 w-4 text-muted-foreground"));

    // Status cards
    const cardsContainer = this.container.querySelector("#status-cards");
    [{ label: "Total", value: counts.total, filter: "all" }, { label: "Waiting", value: counts.waiting, filter: "waiting" }, { label: "Checked In", value: counts.checkedIn, filter: "checked-in" }, { label: "Completed", value: counts.completed, filter: "completed" }].forEach(stat => {
      const btn = document.createElement("button");
      btn.className = `flex items-center gap-3 p-3 rounded-xl border transition-all ${this.statusFilter === stat.filter ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/30"}`;
      btn.innerHTML = `<div class="text-left"><p class="text-xl font-semibold text-foreground">${stat.value}</p><p class="text-xs text-muted-foreground">${stat.label}</p></div>`;
      btn.addEventListener("click", () => { this.statusFilter = stat.filter; this.updateContent(); });
      cardsContainer?.appendChild(btn);
    });

    // Table
    const tableContainer = this.container.querySelector("#table-container");
    tableContainer?.appendChild(new PatientTable({ 
      patients: filtered, 
      onViewPatient: (p) => this.detailModal.show(p), 
      onEditPatient: (p) => this.editModal.show(p),
      onDeletePatient: (p) => this.deleteModal.show(p)
    }).render());

    // Filters
    this.container.querySelector("#search-input")?.addEventListener("input", (e) => { this.searchQuery = e.target.value; this.updateContent(); });
    this.container.querySelector("#status-filter")?.addEventListener("change", (e) => { this.statusFilter = e.target.value; this.updateContent(); });
    this.container.querySelector("#doctor-filter")?.addEventListener("change", (e) => { this.doctorFilter = e.target.value; this.updateContent(); });
  }

  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}