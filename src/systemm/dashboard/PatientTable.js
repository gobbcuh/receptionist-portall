import { cn } from "../../iconsss/utils";
import { icons } from "../../iconsss/icons";

const statusConfig = {
    waiting: {
        label: "Waiting",
        className: "bg-warning/15 text-warning border-warning/30 font-medium",
        dotColor: "bg-warning",
    },
    "checked-in": {
        label: "Checked In",
        className: "bg-primary/15 text-primary border-primary/30 font-medium",
        dotColor: "bg-primary",
    },
    completed: {
        label: "Completed",
        className: "bg-success/15 text-success border-success/30 font-medium",
        dotColor: "bg-success",
    },
};

export class PatientTable {
    constructor(config) {
        this.config = config;
    }

    render() {
        const { patients, onCheckIn, onViewPatient, onEditPatient, onDeletePatient, showCheckIn = false, viewOnly = false } = this.config;

        const container = document.createElement("div");
        container.className = "overflow-hidden rounded-xl border border-border bg-card shadow-sm";

        if (patients.length === 0) {
            container.innerHTML = `
        <div class="flex flex-col items-center justify-center py-16 text-muted-foreground bg-muted/20">
          <div class="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4" id="empty-icon"></div>
          <p class="text-sm font-medium">No patients found</p>
          <p class="text-xs text-muted-foreground mt-1">Try adjusting your search or filters</p>
        </div>
      `;
            const emptyIcon = container.querySelector("#empty-icon");
            if (emptyIcon) emptyIcon.appendChild(icons.search("h-6 w-6 opacity-50"));
            return container;
        }

        const tableWrapper = document.createElement("div");
        tableWrapper.className = "overflow-x-auto";

        const table = document.createElement("table");
        table.className = "w-full";

        // Header
        table.innerHTML = `
      <thead>
        <tr class="border-b bg-muted/40">
          <th class="px-5 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Patient</th>
          <th class="px-5 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Age / Gender</th>
          <th class="px-5 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Assigned Doctor</th>
          <th class="px-5 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Registered</th>
          <th class="px-5 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
          <th class="px-5 py-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
        </tr>
      </thead>
    `;

        const tbody = document.createElement("tbody");
        tbody.className = "divide-y divide-border/50";

        patients.forEach((patient) => {
            const status = statusConfig[patient.status];
            const initials = patient.name.split(" ").map(n => n[0]).join("").slice(0, 2);

            const tr = document.createElement("tr");
            tr.className = cn(
                "transition-all duration-150 hover:bg-muted/40 group",
                patient.status === "waiting" && "bg-warning/[0.02]"
            );

            tr.innerHTML = `
        <td class="px-5 py-4">
          <div class="flex items-center gap-3">
            <div class="${cn(
                "flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                patient.status === "waiting"
                    ? "bg-warning/10 text-warning"
                    : patient.status === "checked-in"
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
            )}">${initials}</div>
            <div class="min-w-0">
              <p class="font-medium text-foreground text-sm truncate">${patient.name}</p>
              <div class="flex items-center gap-1.5 mt-0.5">
                <span class="phone-icon"></span>
                <p class="text-xs text-muted-foreground">${patient.phone}</p>
              </div>
            </div>
          </div>
        </td>
        <td class="px-5 py-4">
          <div class="text-sm">
            <span class="text-foreground font-medium">${patient.age}</span>
            <span class="text-muted-foreground"> yrs</span>
            <span class="text-muted-foreground/50 mx-1.5">•</span>
            <span class="text-muted-foreground">${patient.gender}</span>
          </div>
        </td>
        <td class="px-5 py-4">
          ${patient.assignedDoctor ? `
            <div class="flex items-center gap-2">
              <div class="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center doctor-icon"></div>
              <span class="text-sm text-foreground">${patient.assignedDoctor}</span>
            </div>
          ` : '<span class="text-sm text-muted-foreground italic">Unassigned</span>'}
        </td>
        <td class="px-5 py-4">
          <div class="flex flex-col gap-1">
            <span class="text-sm font-medium text-foreground">${patient.registrationTime}</span>
            ${patient.hasFollowUp ? `
              <div class="relative group/tooltip">
                <div class="flex items-center gap-1 text-xs text-primary cursor-help">
                  <span class="calendar-icon"></span>
                  <span>Follow-up</span>
                </div>
                <div class="absolute bottom-full left-0 mb-1 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-lg opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 whitespace-nowrap z-50">
                  Follow-up: ${patient.followUpDate}
                </div>
              </div>
            ` : ''}
          </div>
        </td>
        <td class="px-5 py-4">
          <span class="${cn("inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border", status.className)}">
            <span class="${cn("h-1.5 w-1.5 rounded-full animate-pulse", status.dotColor)}"></span>
            ${status.label}
          </span>
        </td>
        <td class="px-5 py-4">
          <div class="flex items-center justify-center gap-1 actions-container"></div>
        </td>
      `;

            // Add icons
            const phoneIcon = tr.querySelector(".phone-icon");
            if (phoneIcon) phoneIcon.appendChild(icons.phone("h-3 w-3 text-muted-foreground"));

            const doctorIcon = tr.querySelector(".doctor-icon");
            if (doctorIcon) doctorIcon.appendChild(icons.user("h-3 w-3 text-primary"));

            const calendarIcon = tr.querySelector(".calendar-icon");
            if (calendarIcon) calendarIcon.appendChild(icons.calendar("h-3 w-3"));

            // Add action buttons
            const actionsContainer = tr.querySelector(".actions-container");
            if (actionsContainer) {
                // View button (ALWAYS shown)
                const viewBtn = this.createActionButton(icons.eye("h-4 w-4"), "View patient details", () => {
                    onViewPatient?.(patient);
                });
                actionsContainer.appendChild(viewBtn);

                // Edit and Delete buttons (ONLY if not viewOnly)
                if (!viewOnly) {
                    // Edit button
                    const editBtn = this.createActionButton(icons.pencil("h-4 w-4"), "Edit patient info", () => {
                        onEditPatient?.(patient);
                    });
                    actionsContainer.appendChild(editBtn);

                    // Delete button
                    const deleteBtn = this.createActionButton(icons.trash("h-4 w-4"), "Delete patient", () => {
                        onDeletePatient?.(patient);
                    }, true);
                    actionsContainer.appendChild(deleteBtn);
                }

                // Check-in button
                if (showCheckIn && patient.status === "waiting") {
                    const checkInBtn = document.createElement("button");
                    checkInBtn.className = "h-8 ml-1 px-3 flex items-center gap-1 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors";
                    checkInBtn.appendChild(icons.userCheck("h-3.5 w-3.5"));
                    checkInBtn.appendChild(document.createTextNode(" Check In"));
                    checkInBtn.addEventListener("click", () => onCheckIn?.(patient.id));
                    actionsContainer.appendChild(checkInBtn);
                }
            }

            tbody.appendChild(tr);
        });

        table.appendChild(tbody);
        tableWrapper.appendChild(table);
        container.appendChild(tableWrapper);

        return container;
    }

    createActionButton(icon, tooltip, onClick, isDestructive = false) {
        const wrapper = document.createElement("div");
        wrapper.className = "relative group/action";

        const button = document.createElement("button");
        button.className = isDestructive
            ? "h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            : "h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors";
        button.appendChild(icon);
        button.addEventListener("click", onClick);

        const tooltipEl = document.createElement("div");
        tooltipEl.className = "absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-lg opacity-0 invisible group-hover/action:opacity-100 group-hover/action:visible transition-all duration-200 whitespace-nowrap z-50";
        tooltipEl.textContent = tooltip;

        wrapper.appendChild(button);
        wrapper.appendChild(tooltipEl);

        return wrapper;
    }
}
