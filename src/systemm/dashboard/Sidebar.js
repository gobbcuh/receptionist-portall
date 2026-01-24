import { cn } from "../../iconsss/utils";
import { icons } from "../../iconsss/icons";

const navItems = [
  { icon: "layoutDashboard", label: "Dashboard", path: "/dashboard" },
  { icon: "userPlus", label: "Register Patient", path: "/dashboard/register" },
  { icon: "users", label: "Patient List", path: "/dashboard/patients" },
  { icon: "clipboardCheck", label: "Check-in Queue", path: "/dashboard/queue" },
  { icon: "receipt", label: "Billing", path: "/dashboard/billing" },
];

export class Sidebar {
  constructor(isCollapsed, onCollapsedChange) {
    this.isCollapsed = isCollapsed;
    this.isMobileOpen = false;
    this.onCollapsedChange = onCollapsedChange;
    this.container = null;
  }

  render() {
    const fragment = document.createElement("div");
    
    // Mobile Menu Button
    const mobileBtn = document.createElement("button");
    mobileBtn.className = "fixed left-4 top-4 z-50 lg:hidden p-2 rounded-lg hover:bg-muted transition-colors";
    mobileBtn.id = "mobile-menu-btn";
    mobileBtn.addEventListener("click", () => this.toggleMobile());

    // Overlay
    const overlay = document.createElement("div");
    overlay.className = cn(
      "fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden",
      this.isMobileOpen ? "" : "hidden"
    );
    overlay.id = "mobile-overlay";
    overlay.addEventListener("click", () => this.toggleMobile());

    // Sidebar
    const aside = document.createElement("aside");
    aside.id = "sidebar";
    aside.className = cn(
      "fixed left-0 top-0 z-40 h-screen gradient-sidebar transition-all duration-300 ease-in-out lg:translate-x-0",
      this.isCollapsed ? "lg:w-20" : "lg:w-64",
      this.isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full"
    );

    this.container = fragment;
    this.updateContent(mobileBtn, aside);

    fragment.appendChild(mobileBtn);
    fragment.appendChild(overlay);
    fragment.appendChild(aside);

    return fragment;
  }

  updateContent(mobileBtn, aside) {
    const currentPath = window.location.pathname;

    // Mobile button icon
    mobileBtn.innerHTML = "";
    mobileBtn.appendChild(this.isMobileOpen ? icons.x("h-6 w-6") : icons.menu("h-6 w-6"));

    aside.innerHTML = `
      <div class="flex h-full flex-col">
        <!-- Logo -->
        <div class="${cn(
          "flex items-center gap-3 px-6 py-6 transition-all duration-300",
          this.isCollapsed && "lg:justify-center lg:px-4"
        )}">
          <img src="/src/assets/mc (5).png" alt="MedCare Logo" class="h-10 w-10 shrink-0 object-contain" />
          <div class="${cn(
            "transition-all duration-300 overflow-hidden",
            this.isCollapsed ? "lg:w-0 lg:opacity-0" : "w-auto opacity-100"
          )}">
            <h1 class="font-bold text-primary-foreground whitespace-nowrap">MedCare</h1>
            <p class="text-xs text-primary-foreground/70 whitespace-nowrap">Reception Portal</p>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 px-4 py-4">
          <ul class="space-y-2" id="nav-list"></ul>
        </nav>

        <!-- Collapse Toggle (Desktop only) -->
        <div class="hidden lg:flex px-4 py-2 justify-end">
          <button id="collapse-btn" class="h-8 w-8 flex items-center justify-center rounded-lg text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-colors"></button>
        </div>

        <!-- Logout -->
        <div class="px-4 py-6 relative group">
          <a href="/" class="${cn(
            "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-primary-foreground/70 transition-all duration-200 hover:bg-primary-foreground/10 hover:text-primary-foreground",
            this.isCollapsed && "lg:justify-center lg:px-3"
          )}">
            <span id="logout-icon"></span>
            <span class="${cn(
              "transition-all duration-300 overflow-hidden whitespace-nowrap",
              this.isCollapsed ? "lg:w-0 lg:opacity-0" : "w-auto opacity-100"
            )}">
              Logout
            </span>
          </a>
        </div>
      </div>
    `;

    // Add icons

    const logoutIcon = aside.querySelector("#logout-icon");
    if (logoutIcon) logoutIcon.appendChild(icons.logOut("h-5 w-5 shrink-0"));

    const collapseBtn = aside.querySelector("#collapse-btn");
    if (collapseBtn) {
      collapseBtn.appendChild(this.isCollapsed ? icons.chevronRight("h-4 w-4") : icons.chevronLeft("h-4 w-4"));
      collapseBtn.addEventListener("click", () => this.toggleCollapsed());
    }

    // Add navigation items
    const navList = aside.querySelector("#nav-list");
    if (navList) {
      navItems.forEach((item) => {
        const isActive = currentPath === item.path;
        const li = document.createElement("li");
        li.className = "relative group";
        
        const link = document.createElement("a");
        link.href = item.path;
        link.className = cn(
          "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200",
          this.isCollapsed && "lg:justify-center lg:px-3",
          isActive
            ? "bg-primary-foreground/20 text-primary-foreground"
            : "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
        );

        const iconSpan = document.createElement("span");
        iconSpan.appendChild(icons[item.icon]("h-5 w-5 shrink-0"));
        link.appendChild(iconSpan);

        const labelSpan = document.createElement("span");
        labelSpan.className = cn(
          "transition-all duration-300 overflow-hidden whitespace-nowrap",
          this.isCollapsed ? "lg:w-0 lg:opacity-0" : "w-auto opacity-100"
        );
        labelSpan.textContent = item.label;
        link.appendChild(labelSpan);

        link.addEventListener("click", () => this.isMobileOpen = false);

        li.appendChild(link);

        // Tooltip for collapsed state
        if (this.isCollapsed) {
          const tooltip = document.createElement("div");
          tooltip.className = "absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 hidden lg:block";
          tooltip.textContent = item.label;
          li.appendChild(tooltip);
        }

        navList.appendChild(li);
      });
    }
  }

  toggleMobile() {
    this.isMobileOpen = !this.isMobileOpen;
    const overlay = document.querySelector("#mobile-overlay");
    const sidebar = document.querySelector("#sidebar");
    const mobileBtn = document.querySelector("#mobile-menu-btn");

    if (overlay) {
      overlay.classList.toggle("hidden", !this.isMobileOpen);
    }
    if (sidebar) {
      sidebar.classList.toggle("-translate-x-full", !this.isMobileOpen);
      sidebar.classList.toggle("translate-x-0", this.isMobileOpen);
    }
    if (mobileBtn) {
      mobileBtn.innerHTML = "";
      mobileBtn.appendChild(this.isMobileOpen ? icons.x("h-6 w-6") : icons.menu("h-6 w-6"));
    }
  }

  toggleCollapsed() {
    this.isCollapsed = !this.isCollapsed;
    localStorage.setItem("sidebar-collapsed", JSON.stringify(this.isCollapsed));
    this.onCollapsedChange(this.isCollapsed);

    // Re-render sidebar
    const sidebar = document.querySelector("#sidebar");
    const mobileBtn = document.querySelector("#mobile-menu-btn");
    if (sidebar && mobileBtn) {
      sidebar.className = cn(
        "fixed left-0 top-0 z-40 h-screen gradient-sidebar transition-all duration-300 ease-in-out lg:translate-x-0",
        this.isCollapsed ? "lg:w-20" : "lg:w-64",
        this.isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full"
      );
      this.updateContent(mobileBtn, sidebar);
    }
  }
}
