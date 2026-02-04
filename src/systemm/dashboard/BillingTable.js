import { cn } from "../../iconsss/utils";
import { icons } from "../../iconsss/icons";
import { format } from "date-fns";

const statusConfig = {
    paid: {
        label: "Paid",
        className: "bg-success/10 text-success",
        dotColor: "bg-success",
    },
    pending: {
        label: "Pending",
        className: "bg-warning/10 text-warning",
        dotColor: "bg-warning",
    },
    overdue: {
        label: "Overdue",
        className: "bg-destructive/10 text-destructive",
        dotColor: "bg-destructive",
    },
};

export class BillingTable {
    constructor(config) {
        this.config = config;
    }

    render() {
        const { invoices, onViewInvoice, onMarkPaid, onPrintInvoice } = this.config;

        if (!invoices || invoices.length === 0) {
            const empty = document.createElement("div");
            empty.className = "flex flex-col items-center justify-center py-12 text-muted-foreground";
            empty.innerHTML = `<div id="empty-icon" class="mb-2"></div><p>No invoices found</p>`;
            const iconContainer = empty.querySelector("#empty-icon");
            if (iconContainer) iconContainer.appendChild(icons.fileText("h-12 w-12 opacity-50"));
            return empty;
        }

        const tableWrapper = document.createElement("div");
        tableWrapper.className = "overflow-x-auto rounded-lg border border-border";

        const table = document.createElement("table");
        table.className = "w-full text-sm";

        // header
        table.innerHTML = `
      <thead class="bg-muted/50">
        <tr>
          <th class="px-4 py-3 text-left font-medium text-muted-foreground">Invoice #</th>
          <th class="px-4 py-3 text-left font-medium text-muted-foreground">Patient</th>
          <th class="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Date</th>
          <th class="px-4 py-3 text-right font-medium text-muted-foreground">Amount</th>
          <th class="px-4 py-3 text-center font-medium text-muted-foreground">Status</th>
          <th class="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
        </tr>
      </thead>
      <tbody id="invoice-body"></tbody>
    `;

        const tbody = table.querySelector("#invoice-body");

        invoices.forEach((invoice) => {
            const status = statusConfig[invoice.status];
            const tr = document.createElement("tr");
            tr.className = "border-t border-border hover:bg-muted/30 transition-colors";

            tr.innerHTML = `
        <td class="px-4 py-3">
          <span class="font-medium text-foreground">${invoice.id}</span>
        </td>
        <td class="px-4 py-3">
          <span class="text-foreground">${invoice.patientName}</span>
        </td>
        <td class="px-4 py-3 hidden sm:table-cell text-muted-foreground">
          ${format(new Date(invoice.date), "MMM d, yyyy")}
        </td>
        <td class="px-4 py-3 text-right">
          <span class="font-medium text-foreground">₱${invoice.total.toFixed(2)}</span>
        </td>
        <td class="px-4 py-3">
          <div class="flex justify-center">
            <span class="${cn("inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium", status.className)}">
              <span class="${cn("h-1.5 w-1.5 rounded-full", status.dotColor)}"></span>
              ${status.label}
            </span>
          </div>
        </td>
        <td class="px-4 py-3">
          <div class="flex items-center justify-end gap-1" id="actions-${invoice.id}"></div>
        </td>
      `;

            const actionsContainer = tr.querySelector(`#actions-${invoice.id}`);

            // view button
            const viewBtn = this.createActionButton(icons.eye, "View Invoice", () => onViewInvoice?.(invoice));
            actionsContainer.appendChild(viewBtn);

            // print button
            const printBtn = this.createActionButton(icons.printer, "Print Invoice", () => onPrintInvoice?.(invoice));
            actionsContainer.appendChild(printBtn);

            // paid button
            if (invoice.status !== "paid") {
                const canPay = invoice.visitStatus === "completed";
                const tooltip = canPay 
                    ? "Mark as Paid" 
                    : "Complete consultation first";
                
                const paidBtn = this.createActionButton(
                    icons.dollarSign, 
                    tooltip, 
                    canPay ? () => onMarkPaid?.(invoice) : null
                );
                
                if (canPay) {
                    paidBtn.classList.add("text-success", "hover:text-success");
                } else {
                    paidBtn.classList.add("opacity-40", "cursor-not-allowed");
                    paidBtn.disabled = true;
                }
                
                actionsContainer.appendChild(paidBtn);
            }

            tbody.appendChild(tr);
        });

        tableWrapper.appendChild(table);
        return tableWrapper;
    }

    createActionButton(iconFn, tooltip, onClick) {
        const btn = document.createElement("button");
        btn.className = "relative group p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors";
        btn.appendChild(iconFn("h-4 w-4"));

        const tooltipEl = document.createElement("span");
        tooltipEl.className = "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-popover text-popover-foreground rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-10";
        tooltipEl.textContent = tooltip;
        btn.appendChild(tooltipEl);

        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            onClick?.();
        });

        return btn;
    }
}
