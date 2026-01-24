import { cn } from "../iconsss/utils";
import { Sidebar } from "../systemm/dashboard/Sidebar";

export class DashboardLayout {
  constructor(pageComponent) {
    this.pageComponent = pageComponent;
    const saved = localStorage.getItem("sidebar-collapsed");
    this.isCollapsed = saved ? JSON.parse(saved) : false;
    this.container = null;
  }

  render() {
    this.container = document.createElement("div");
    this.container.className = "min-h-screen bg-secondary/30";


    const sidebar = new Sidebar(this.isCollapsed, (collapsed) => {
      this.isCollapsed = collapsed;
      this.updateMainContent();
    });


    const main = document.createElement("main");
    main.id = "main-content";
    main.className = cn(
      "transition-all duration-300 ease-in-out",
      this.isCollapsed ? "lg:ml-20" : "lg:ml-64"
    );

    const innerDiv = document.createElement("div");
    innerDiv.className = "container mx-auto px-6 py-8 pt-20 lg:pt-8";
    innerDiv.appendChild(this.pageComponent.render());

    main.appendChild(innerDiv);
    this.container.appendChild(sidebar.render());
    this.container.appendChild(main);

    return this.container;
  }

  updateMainContent() {
    const main = this.container?.querySelector("#main-content");
    if (main) {
      main.className = cn(
        "transition-all duration-300 ease-in-out",
        this.isCollapsed ? "lg:ml-20" : "lg:ml-64"
      );
    }
  }
}
