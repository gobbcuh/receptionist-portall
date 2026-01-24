import { icons } from "../../iconsss/icons";
import { patientStore } from "../../data/patientStore";
import { StatsCard } from "../../systemm/dashboard/StatsCard";
import { PatientTable } from "../../systemm/dashboard/PatientTable";
import { PatientDetailModal } from "../../systemm/dashboard/PatientDetailModal";

export class DashboardHome {
  constructor() {
    this.detailModal = new PatientDetailModal(() => {});
    this.container = null;
    this.unsubscribe = null;
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

  updateContent() {
    if (!this.container) return;
    
    const patients = patientStore.getPatients();
    const stats = patientStore.getStats();
    const recentPatients = patients.slice(0, 5);

    this.container.innerHTML = `
      <div>
        <h1 class="text-xl font-semibold text-foreground">Dashboard</h1>
        <p class="text-sm text-muted-foreground">Today's overview</p>
      </div>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" id="stats-grid"></div>
      <div>
        <h2 class="mb-3 text-base font-medium text-foreground">Recent Patients</h2>
        <div id="recent-table"></div>
      </div>
    `;

    // Stats Grid
    const statsGrid = this.container.querySelector("#stats-grid");
    const statsData = [
      { title: "Total Patients", value: stats.total, variant: "primary" },
      { title: "Checked In", value: stats.checkedIn, variant: "success" },
      { title: "Waiting", value: stats.waiting, variant: "warning" },
      { title: "New Today", value: stats.newToday, variant: "default" },
    ];

    statsData.forEach(stat => {
      statsGrid?.appendChild(new StatsCard(stat).render());
    });

    // Recent Patients Table
    const tableContainer = this.container.querySelector("#recent-table");
    const table = new PatientTable({
      patients: recentPatients,
      onViewPatient: (patient) => this.detailModal.show(patient),
    });
    tableContainer?.appendChild(table.render());
  }

  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}