import { cn } from "../iconsss/utils";
import { icons } from "../iconsss/icons";
import { navigateTo } from "../iconsss/router";
import medicalBg from "../assets/medical-pattern-bg.jpg";

export class LoginPage {
    constructor() {
        this.email = "";
        this.password = "";
        this.showPassword = false;
        this.isLoading = false;
        this.message = null;
        this.container = null;
    }

    render() {
        this.container = document.createElement("div");
        this.container.className = "min-h-screen relative flex items-center justify-center p-4 overflow-hidden";
        this.updateContent();
        return this.container;
    }

    updateContent() {
        if (!this.container) return;

        this.container.innerHTML = `
            <!-- Background Image with Blur -->
            <div class="absolute inset-0 bg-cover bg-center bg-no-repeat blur-md scale-110" style="background-image: url(${medicalBg})"></div>

            <!-- Gradient Overlay -->
            <div class="absolute inset-0 bg-gradient-to-br from-primary/30 via-background/10 to-primary/20"></div>
            
            <!-- Login Card -->
            <div class="w-full max-w-sm relative z-10 animate-fade-in">
                <div class="bg-card/95 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-border/20">

                    <!-- Header -->
                    <div class="text-center mb-8">
                        <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
                            <div class="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
                                <span class="text-primary-foreground font-bold text-sm">M</span>

                            </div>
                        </div>
                        <h1 class="text-2xl font-semibold text-foreground">Sign In</h1>
                        <p class="text-muted-foreground mt-1 text-sm">Access your MedCare account</p>
                    </div>

                    <!-- Message -->
                    <div id="message-container"></div>

                    <!-- Login Form -->
                    <form id="login-form" class="space-y-4">
                        <div class="relative group">
                            <div class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" id="mail-icon"></div>
                            <input
                                id="email"
                                type="email"
                                placeholder="Email address"
                                value="${this.email}"
                                class="w-full h-11 pl-10 pr-4 bg-muted/50 border-0 rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                                required
                            />
                        </div>
                        
                        <div class="relative group">
                            <div class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" id="lock-icon"></div>
                            <input
                                id="password"
                                type="${this.showPassword ? "text" : "password"}"
                                placeholder="Password"
                                value="${this.password}"
                                class="w-full h-11 pl-10 pr-10 bg-muted/50 border-0 rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                                required
                            />
                            <button
                                type="button"
                                id="toggle-password"
                                class="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <span id="eye-icon"></span>
                            </button>
                        </div>

                        <div class="flex justify-end">
                            <button type="button" class="text-xs text-primary hover:text-primary/80 transition-colors">
                                Forgot password?
                            </button>
                        </div>

                        <button
                            type="submit"
                            id="submit-btn"
                            class="w-full h-11 rounded-xl font-medium bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 hover:shadow-primary/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            ${this.isLoading ? "disabled" : ""}
                        >
                            ${this.isLoading ? `
                                <span class="flex items-center justify-center gap-2">
                                    <span class="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></span>
                                    Signing in...
                                </span>
                            ` : "Sign In"}
                        </button>
                    </form>
                </div>

                <p class="mt-6 text-center text-xs text-foreground/60">
                    © 2026 MedCare Hospital. All rights reserved.
                </p>
            </div>
        `;

        // ad icons
        const mailIconContainer = this.container.querySelector("#mail-icon");
        const lockIconContainer = this.container.querySelector("#lock-icon");
        const eyeIconContainer = this.container.querySelector("#eye-icon");
        
        if (mailIconContainer) mailIconContainer.appendChild(icons.mail("h-4 w-4"));
        if (lockIconContainer) lockIconContainer.appendChild(icons.lock("h-4 w-4"));
        if (eyeIconContainer) {
            eyeIconContainer.appendChild(this.showPassword ? icons.eyeOff("h-4 w-4") : icons.eye("h-4 w-4"));
        }

        // upd message
        const messageContainer = this.container.querySelector("#message-container");
        if (messageContainer && this.message) {
            messageContainer.innerHTML = `
                <div class="mb-4 p-3 rounded-lg text-sm ${
                    this.message.type === "success" 
                        ? "bg-success/10 text-success border border-success/20" 
                        : "bg-destructive/10 text-destructive border border-destructive/20"
                }">
                    ${this.message.text}
                </div>
            `;
        }

        // event listeners
        const form = this.container.querySelector("#login-form");
        const emailInput = this.container.querySelector("#email");
        const passwordInput = this.container.querySelector("#password");
        const togglePassword = this.container.querySelector("#toggle-password");

        emailInput?.addEventListener("input", (e) => {
            this.email = e.target.value;
        });

        passwordInput?.addEventListener("input", (e) => {
            this.password = e.target.value;
        });

        togglePassword?.addEventListener("click", () => {
            this.showPassword = !this.showPassword;
            this.updateContent();
        });

        form?.addEventListener("submit", (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
    }

    async handleSubmit() {
        this.isLoading = true;
        this.message = null;
        this.updateContent();

        try {
            const { AuthAPI } = await import('../services/api.js');
            
            // calling backend login API
            const response = await AuthAPI.login(this.email, this.password);
            
            this.message = { 
            type: "success", 
            text: `Welcome back, ${response.user.name}!` 
            };
            this.isLoading = false;
            this.updateContent();
            
            setTimeout(() => navigateTo("/dashboard"), 500);
            
        } catch (error) {
            this.message = { 
            type: "error", 
            text: error.message || "Invalid email or password" 
            };
            this.isLoading = false;
            this.updateContent();
        }
    }
}