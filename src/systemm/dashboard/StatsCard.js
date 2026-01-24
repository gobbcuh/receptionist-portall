import { cn } from "../../iconsss/utils";
import { icons } from "../../iconsss/icons";

const variantStyles = {
  default: "text-muted-foreground",
  primary: "text-primary",
  success: "text-success",
  warning: "text-warning",
};

export class StatsCard {
  constructor(config) {
    this.config = config;
  }

  render() {
    const { title, value, icon, variant = "default" } = this.config;
    
    const card = document.createElement("div");
    card.className = "rounded-lg border border-border bg-card p-4";
    
    card.innerHTML = `
      <div class="flex items-center justify-between">
        <div>
          <p class="text-xs text-muted-foreground uppercase tracking-wide">${title}</p>
          <p class="${cn("text-2xl font-semibold mt-1", variantStyles[variant])}">${value}</p>
        </div>
        <div class="${cn("p-2 rounded-md bg-muted/50", variantStyles[variant])}" id="icon-container"></div>
      </div>
    `;

    const iconContainer = card.querySelector("#icon-container");
    if (iconContainer && icons[icon]) {
      iconContainer.appendChild(icons[icon]("h-5 w-5"));
    }

    return card;
  }
}
