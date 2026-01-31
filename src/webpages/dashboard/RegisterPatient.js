import { icons } from "../../iconsss/icons";
import { doctors } from "../../data/patients";
import { patientStore } from "../../data/patientStore";

export class RegisterPatient {
    constructor() {
        this.formData = {
            firstName: "", lastName: "", dateOfBirth: "", gender: "", phone: "", email: "",
            address: "", emergencyContact: "", emergencyPhone: "", assignedDoctor: "",
            medicalNotes: "",
        };
        this.isLoading = false;
        this.message = null;
        this.container = null;
        this.doctors = [];
        this.departments = [];
        this.selectedDepartment = "";
    }

    render() {
        this.container = document.createElement("div");
        this.container.className = "space-y-6";
        this.loadDoctors();
        this.updateContent();
        return this.container;
    }

    async loadDoctors() {
        try {
            const { ReferenceAPI } = await import('../../services/api.js');
            
            // Fetch departments and all doctors from backend
            this.departments = await ReferenceAPI.getDepartments();
            const allDoctors = await ReferenceAPI.getDoctors();
            this.allDoctors = allDoctors;
            
            this.updateContent();
        } catch (error) {
            console.error('Error loading data:', error);
            this.updateContent();
        }
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
                        <div class="space-y-1.5"><label class="text-sm font-medium text-foreground">Sex Assigned at Birth *</label><select id="sex" required class="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"><option value="">Select</option><option value="male">Male</option><option value="female">Female</option></select></div>
                    </div>
                    <div class="grid gap-4 sm:grid-cols-2">
                        <div class="space-y-1.5"><label class="text-sm font-medium text-foreground">Gender Identity *</label><select id="gender" required class="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"><option value="">Select</option><option value="male">Male</option><option value="female">Female</option><option value="non-binary">Non-binary</option><option value="prefer not to say">Prefer not to say</option><option value="other">Other</option></select></div>
                        <div class="space-y-1.5"><label class="text-sm font-medium text-foreground">Phone *</label><input id="phone" type="tel" required class="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
                    </div>
                    <div class="grid gap-4 sm:grid-cols-2">
                        <div class="space-y-1.5"><label class="text-sm font-medium text-foreground">Email</label><input id="email" type="email" class="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
                        <div class="space-y-1.5"><label class="text-sm font-medium text-foreground">Address</label><input id="address" class="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
                    </div>
                    </div>
                </div>
                <div class="space-y-6">
                    <div class="rounded-xl border border-border bg-card p-6">
                        <h2 class="text-base font-medium text-foreground mb-4">Doctor Assignment</h2>
                        <div class="space-y-4">
                            <!-- Department Selection -->
                            <div class="space-y-1.5">
                                <label class="text-sm font-medium text-foreground">Department *</label>
                                <select id="department" required class="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                                    <option value="">Select department...</option>
                                    ${this.departments.map(dept => `<option value="${dept.department_id}">${dept.name} (${dept.code})</option>`).join('')}
                                </select>
                            </div>
                            
                            <!-- Doctor Selection (hidden until department is selected) -->
                            <div id="doctorContainer" class="space-y-1.5 ${this.selectedDepartment ? '' : 'hidden'}">
                                <label class="text-sm font-medium text-foreground">Assigned Doctor *</label>
                                <select id="assignedDoctor" required class="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                                    <option value="">Select doctor...</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="rounded-xl border border-border bg-card p-6">
                    <h2 class="text-base font-medium text-foreground mb-4">Emergency Contact</h2>
                    <div class="space-y-4">
                        <div class="space-y-1.5"><label class="text-sm font-medium text-foreground">Contact Name *</label><input id="emergencyContact" required class="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
                        <div class="space-y-1.5"><label class="text-sm font-medium text-foreground">Relationship *</label><select id="emergencyContactRelationship" required class="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"><option value="">Select relationship...</option><option value="Spouse">Spouse</option><option value="Parent">Parent</option><option value="Child">Child</option><option value="Sibling">Sibling</option><option value="Partner">Partner</option><option value="Friend">Friend</option><option value="Guardian">Guardian</option><option value="Other">Other</option></select></div>
                        <div class="space-y-1.5"><label class="text-sm font-medium text-foreground">Contact Phone *</label><input id="emergencyPhone" type="tel" required class="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
                    </div>
                    </div>
                    <div class="rounded-xl border border-border bg-card p-6">
                        <h2 class="text-base font-medium text-foreground mb-4">Chief Complaint *</h2>
                        <textarea id="medicalNotes" required placeholder="e.g., Chest pain, fever, skin rash, broken arm..." rows="4" class="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"></textarea>
                    </div>
                    <button type="submit" id="submit-btn" class="w-full h-10 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50" ${this.isLoading ? 'disabled' : ''}>${this.isLoading ? '<span class="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></span> Registering...' : '<span id="save-icon"></span> Register Patient'}</button>
                </div>
                </div>
            </form>
            `;

        const saveIcon = this.container.querySelector("#save-icon");
        if (saveIcon) saveIcon.appendChild(icons.save("h-4 w-4"));

        // Department selection handler
        const departmentSelect = this.container.querySelector("#department");
        const doctorSelect = this.container.querySelector("#assignedDoctor");
        const doctorContainer = this.container.querySelector("#doctorContainer");

        departmentSelect?.addEventListener("change", async (e) => {
            this.selectedDepartment = e.target.value;
            
            if (this.selectedDepartment) {
                // Show doctor dropdown
                doctorContainer.classList.remove('hidden');
                
                // Load doctors for selected department
                doctorSelect.innerHTML = '<option value="">Loading doctors...</option>';
                
                try {
                    // Import ReferenceAPI
                    const { ReferenceAPI } = await import('../../services/api.js');
                    
                    // Fetch doctors for selected department
                    const doctors = await ReferenceAPI.getDoctorsByDepartment(this.selectedDepartment);
                    
                    // Populate doctor dropdown
                    doctorSelect.innerHTML = `
                        <option value="">Select doctor...</option>
                        ${doctors.map(d => `<option value="${d}">${d}</option>`).join('')}
                    `;
                } catch (error) {
                    console.error('Error loading doctors:', error);
                    doctorSelect.innerHTML = '<option value="">Error loading doctors</option>';
                }
            } else {
                // Hide doctor dropdown if no department selected
                doctorContainer.classList.add('hidden');
                doctorSelect.innerHTML = '<option value="">Select doctor...</option>';
            }
        });

        this.container.querySelector("#register-form")?.addEventListener("submit", (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
    }

    async handleSubmit() {

        const firstName = this.container?.querySelector("#firstName")?.value.trim() || "";
        const lastName = this.container?.querySelector("#lastName")?.value.trim() || "";
        const dateOfBirth = this.container?.querySelector("#dateOfBirth")?.value || "";
        const sex = this.container?.querySelector("#sex")?.value || "";
        const gender = this.container?.querySelector("#gender")?.value || "";
        const phone = this.container?.querySelector("#phone")?.value.trim() || "";
        const email = this.container?.querySelector("#email")?.value.trim() || "";
        const address = this.container?.querySelector("#address")?.value.trim() || "";
        const emergencyContact = this.container?.querySelector("#emergencyContact")?.value.trim() || "";
        const emergencyContactRelationship = this.container?.querySelector("#emergencyContactRelationship")?.value || "";
        const emergencyPhone = this.container?.querySelector("#emergencyPhone")?.value.trim() || "";
        const assignedDoctor = this.container?.querySelector("#assignedDoctor")?.value || "";
        const department = this.container?.querySelector("#department")?.value || "";
        const medicalNotes = this.container?.querySelector("#medicalNotes")?.value.trim() || "";

        // ============================================================================
        // VALIDATION: Check all required fields
        // ============================================================================
        const errors = [];
        
        if (!firstName) errors.push("First Name is required");
        if (!lastName) errors.push("Last Name is required");
        if (!dateOfBirth) errors.push("Date of Birth is required");
        if (!sex) errors.push("Sex Assigned at Birth is required");
        if (!gender) errors.push("Gender Identity is required");
        if (!phone) errors.push("Phone is required");
        if (!emergencyContact) errors.push("Emergency Contact Name is required");
        if (!emergencyContactRelationship) errors.push("Emergency Contact Relationship is required");
        if (!emergencyPhone) errors.push("Emergency Contact Phone is required");
        if (!department) errors.push("Department is required");
        if (!assignedDoctor) errors.push("Assigned Doctor is required");
        if (!medicalNotes) errors.push("Chief Complaint is required");
        
        if (errors.length > 0) {
            alert("Please fill in all required fields:\n\n• " + errors.join("\n• "));
            return;
        }

        // ============================================================================
        // PROCEED WITH REGISTRATION (only if validation passed)
        // ============================================================================
        this.isLoading = true;
        this.message = null;
        this.updateContent();

        try {
            // Call backend API to register patient
            const { patient, invoice } = await patientStore.addPatient({
                firstName,
                lastName,
                dateOfBirth,
                sex,
                gender,
                phone,
                email,
                address,
                emergencyContact,
                emergencyContactRelationship,
                emergencyPhone,
                assignedDoctor,
                medicalNotes,
            });

            this.message = {
                type: "success",
                text: `${firstName} ${lastName} has been registered and added to the queue. Invoice ${invoice.id} created.`
            };
            this.isLoading = false;
            this.updateContent();

            const form = this.container?.querySelector("#register-form");
            if (form) form.reset();

            setTimeout(() => { this.message = null; this.updateContent(); }, 5000);
        } catch (error) {
            this.message = {
                type: "error",
                text: error.message || "Failed to register patient"
            };
            this.isLoading = false;
            this.updateContent();
        }
    }
}