import { samplePatients, doctors } from "./patients";
import { billingStore } from "./billingStore";

class PatientStore {
  constructor() {
    this.patients = [...samplePatients];
    this.listeners = [];
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(listener => listener(this.patients));
  }

  getPatients() {
    return this.patients;
  }

  getPatientById(id) {
    return this.patients.find(p => p.id === id);
  }

  // Get patients by status
  getPatientsByStatus(status) {
    return this.patients.filter(p => p.status === status);
  }

  // Get queue patients (waiting + checked-in)
  getQueuePatients() {
    return this.patients.filter(p => p.status === "waiting" || p.status === "checked-in");
  }

  // Get today's stats
  getStats() {
    const today = this.patients; // In a real app, filter by today's date
    return {
      total: today.length,
      checkedIn: today.filter(p => p.status === "checked-in").length,
      waiting: today.filter(p => p.status === "waiting").length,
      completed: today.filter(p => p.status === "completed").length,
      newToday: today.filter(p => p.isNew).length,
    };
  }

  // Add new patient from registration
  addPatient(patientData) {
    const patientId = `P${String(Date.now()).slice(-6)}`;
    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    
    const newPatient = {
      id: patientId,
      name: `${patientData.firstName} ${patientData.lastName}`,
      age: patientData.dateOfBirth ? this.calculateAge(patientData.dateOfBirth) : null,
      gender: patientData.gender ? patientData.gender.charAt(0).toUpperCase() + patientData.gender.slice(1) : "",
      phone: patientData.phone || "",
      email: patientData.email || "",
      address: patientData.address || "",
      emergencyContact: patientData.emergencyContact || "",
      emergencyPhone: patientData.emergencyPhone || "",
      registrationTime: timeStr,
      registrationDate: now.toISOString(),
      status: "waiting", // New patients start as waiting
      assignedDoctor: patientData.assignedDoctor || "",
      hasFollowUp: patientData.hasFollowUp || false,
      followUpDate: patientData.followUpDate || "",
      medicalNotes: patientData.medicalNotes || "",
      isNew: true, // Mark as newly registered today
    };

    this.patients.unshift(newPatient);
    this.notify();

    // Also create billing invoice
    const invoice = billingStore.createInvoiceFromPatient({
      ...patientData,
      patientId: patientId,
    });

    return { patient: newPatient, invoice };
  }

  // Update patient status
  updatePatientStatus(id, status) {
    const index = this.patients.findIndex(p => p.id === id);
    if (index !== -1) {
      this.patients[index] = { ...this.patients[index], status };
      this.notify();
      return this.patients[index];
    }
    return null;
  }

  // Update patient data
  updatePatient(id, updates) {
    const index = this.patients.findIndex(p => p.id === id);
    if (index !== -1) {
      this.patients[index] = { ...this.patients[index], ...updates };
      this.notify();
      return this.patients[index];
    }
    return null;
  }

  // Delete patient
  deletePatient(id) {
    const index = this.patients.findIndex(p => p.id === id);
    if (index !== -1) {
      const deleted = this.patients.splice(index, 1)[0];
      this.notify();
      return deleted;
    }
    return null;
  }

  calculateAge(dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
}

// Singleton instance
export const patientStore = new PatientStore();
