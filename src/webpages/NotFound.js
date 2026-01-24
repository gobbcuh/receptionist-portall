import { cn } from "../iconsss/utils";

export class NotFound {
  render() {
    const container = document.createElement("div");
    container.className = "flex min-h-screen items-center justify-center bg-muted";
    
    container.innerHTML = `
      <div class="text-center">
        <h1 class="mb-4 text-4xl font-bold">404</h1>
        <p class="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
        <a href="/" class="text-primary underline hover:text-primary/90">
          Return to Home
        </a>
      </div>
    `;

    return container;
  }
}
