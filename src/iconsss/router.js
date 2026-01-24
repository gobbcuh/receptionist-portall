export class Router {
  constructor() {
    this.routes = [];
    this.root = null;
    this.currentPath = "";
  }

  addRoute(path, handler) {
    this.routes.push({ path, handler });
  }

  init(root) {
    this.root = root;
    
    this.handleRoute();
    window.addEventListener("popstate", () => this.handleRoute());
    document.addEventListener("click", (e) => {
      const target = e.target;
      const anchor = target.closest("a");
      
      if (anchor && anchor.href && anchor.href.startsWith(window.location.origin)) {
        e.preventDefault();
        this.navigate(anchor.pathname);
      }
    });
  }

  navigate(path) {
    if (path !== this.currentPath) {
      window.history.pushState({}, "", path);
      this.handleRoute();
    }
  }

  handleRoute() {
    const path = window.location.pathname;
    this.currentPath = path;

    let matchedRoute = this.routes.find((route) => route.path === path);


    if (!matchedRoute) {
      matchedRoute = this.routes.find((route) => route.path === "*");
    }

    if (matchedRoute && this.root) {

      this.root.innerHTML = "";
      

      const content = matchedRoute.handler();
      this.root.appendChild(content);
    }
  }

  getCurrentPath() {
    return this.currentPath;
  }
}


export const router = new Router();

export function navigateTo(path) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}
