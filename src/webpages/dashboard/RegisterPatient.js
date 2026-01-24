import { icons } from "../../iconsss/icons";
import { doctors } from "../../data/patients";
import { patientStore } from "../../data/patientStore";

export class RegisterPatient {
  constructor() {
    this.formData = {
      firstName: "", lastName: "", dateOfBirth: "", gender: "", phone: "", email: "",
      address: "", emergencyContact: "", emergencyPhone: "", assignedDoctor: "",
      hasFollowUp: false, followUpDate: "", medicalNotes: "",
    };
    this.isLoading = false;
    this.message = null;
    this.container = null;
  }

  render() {
    this.container = document.createElement("div");
    this.container.className = "space-y-6";
    this.updateContent();
    return this.container;
  }

  updateContent() {
    if (!this.container) return;
    
    this.container.innerHTML = `
      <div>
        <h1 class="text-xl font-semibold text-foreground">Register Patient</h1>
        <p class="text-sm text-muted-foreground">Add a new patient to the system</p>
      </div>
      ${this.message ? `<div class="p-3 rounded-lg text-sm ${this.message.type === "success" ? "bg-success/10 text-success border border-success/20" : "bg-destructive/10 text-destructive border border-destructive/20"}">${this.message.text}</div>` : ''}
      <form id="register-form">
        <div class="grid gap-6 lg:grid-cols-2">
          <div class="rounded-xl border border-border bg-card p-6">
            <h2 class="text-base font-medium text-foreground mb-4">Personal Information</h2>
            <div class="space-y-4">
              <div class="grid gap-4 sm:grid-cols-2">
                <div class="space-y-1.5"><label class="text-sm font-medium text-foreground">First Name *</label><input id="firstName" required class="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
                <div class="space-y-1.5"><label class="text-sm font-medium text-foreground">Last Name *</label><input id="lastName" required class="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
              </div>
              <div class="grid gap-4 sm:grid-cols-2">
                <div class="space-y-1.5"><label class="text-sm font-medium text-foreground">Date of Birth *</label><input id="dateOfBirth" type="date" required class="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
                <div class="space-y-1.5"><label class="text-sm font-medium text-foreground">Gender *</label><select id="gender" required class="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"><option value="">Select</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></div>
              </div>
              <div class="grid gap-4 sm:grid-cols-2">
                <div class="space-y-1.5"><label class="text-sm font-medium text-foreground">Phone *</label><input id="phone" type="tel" required class="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
                <div class="space-y-1.5"><label class="text-sm font-medium text-foreground">Email</label><input id="email" type="email" class="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
              </div>
              <div class="space-y-1.5"><label class="text-sm font-medium text-foreground">Address</label><input id="address" class="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
            </div>
          </div>
          <div class="space-y-6">
            <div class="rounded-xl border border-border bg-card p-6">
              <h2 class="text-base font-medium text-foreground mb-4">Doctor Assignment</h2>
              <div class="space-y-4">
                <div class="space-y-1.5"><label class="text-sm font-medium text-foreground">Assigned Doctor</label><select id="assignedDoctor" class="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"><option value="">Select doctor</option>${doctors.map(d => `<option value="${d}">${d}</option>`).join('')}</select></div>
                <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="hasFollowUp" class="h-4 w-4 rounded border-primary text-primary focus:ring-primary" /><span class="text-sm text-foreground">Schedule follow-up</span></label>
                <div id="followUpContainer" class="space-y-1.5 hidden"><label class="text-sm font-medium text-foreground">Follow-up Date</label><input id="followUpDate" type="date" class="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
              </div>
            </div>
            <div class="rounded-xl border border-border bg-card p-6">
              <h2 class="text-base font-medium text-foreground mb-4">Emergency Contact</h2>
              <div class="space-y-4">
                <div class="space-y-1.5"><label class="text-sm font-medium text-foreground">Contact Name</label><input id="emergencyContact" class="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
                <div class="space-y-1.5"><label class="text-sm font-medium text-foreground">Contact Phone</label><input id="emergencyPhone" type="tel" class="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
              </div>
            </div>
            <div class="rounded-xl border border-border bg-card p-6">
              <h2 class="text-base font-medium text-foreground mb-4">Medical Notes</h2>
              <textarea id="medicalNotes" rows="4" class="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"></textarea>
            </div>
            <button type="submit" id="submit-btn" class="w-full h-10 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50" ${this.isLoading ? 'disabled' : ''}>${this.isLoading ? '<span class="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></span> Registering...' : '<span id="save-icon"></span> Register Patient'}</button>
          </div>
        </div>
      </form>
    `;

    const saveIcon = this.container.querySelector("#save-icon");
    if (saveIcon) saveIcon.appendChild(icons.save("h-4 w-4"));

    const hasFollowUp = this.container.querySelector("#hasFollowUp");
    const followUpContainer = this.container.querySelector("#followUpContainer");
    hasFollowUp?.addEventListener("change", () => followUpContainer?.classList.toggle("hidden", !hasFollowUp.checked));

    this.container.querySelector("#register-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleSubmit();
    });
  }

  handleSubmit() {
    const firstName = this.container?.querySelector("#firstName")?.value || "";
    const lastName = this.container?.querySelector("#lastName")?.value || "";
    const dateOfBirth = this.container?.querySelector("#dateOfBirth")?.value || "";
    const gender = this.container?.querySelector("#gender")?.value || "";
    const phone = this.container?.querySelector("#phone")?.value || "";
    const email = this.container?.querySelector("#email")?.value || "";
    const address = this.container?.querySelector("#address")?.value || "";
    const emergencyContact = this.container?.querySelector("#emergencyContact")?.value || "";
    const emergencyPhone = this.container?.querySelector("#emergencyPhone")?.value || "";
    const assignedDoctor = this.container?.querySelector("#assignedDoctor")?.value || "";
    const hasFollowUp = this.container?.querySelector("#hasFollowUp")?.checked || false;
    const followUpDate = this.container?.querySelector("#followUpDate")?.value || "";
    const medicalNotes = this.container?.querySelector("#medicalNotes")?.value || "";
    
    this.isLoading = true;
    this.message = null;
    this.updateContent();

    setTimeout(() => {
      // Add patient via patientStore (this also creates billing invoice)
      const { patient, invoice } = patientStore.addPatient({
        firstName,
        lastName,
        dateOfBirth,
        gender,
        phone,
        email,
        address,
        emergencyContact,
        emergencyPhone,
        assignedDoctor,
        hasFollowUp,
        followUpDate,
        medicalNotes,
      });
      
      this.message = { 
        type: "success", 
        text: `${firstName} ${lastName} has been registered and added to the queue. Invoice ${invoice.id} created.` 
      };
      this.isLoading = false;
      this.updateContent();
      
      // Reset form
      const form = this.container?.querySelector("#register-form");
      if (form) form.reset();
      
      setTimeout(() => { this.message = null; this.updateContent(); }, 5000);
    }, 1000);
  }
}
