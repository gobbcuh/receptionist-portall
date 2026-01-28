import { PatientAPI, DashboardAPI } from '../services/api.js';

class PatientStore {
    constructor() {
        this.patients = [];
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

    // getting all patients
    async getPatients(filters = {}) {
        try {
            this.patients = await PatientAPI.getAll(filters);
            this.notify();
            return this.patients;
        } catch (error) {
            console.error('Failed to fetch patients:', error);
            return [];
        }
    }

    // getting patient by ID
    async getPatientById(id) {
        try {
            return await PatientAPI.getById(id);
        } catch (error) {
            console.error('Failed to fetch patient:', error);
            return null;
        }
    }

    // getting patients by status
    async getPatientsByStatus(status) {
        try {
            const patients = await PatientAPI.getAll({ status });
            return patients;
        } catch (error) {
            console.error('Failed to fetch patients by status:', error);
            return [];
        }
    }

    // getting queue patients (waiting + checked-in)
    async getQueuePatients() {
        try {
            const patients = await PatientAPI.getQueue();
            return patients;
        } catch (error) {
            console.error('Failed to fetch queue patients:', error);
            return [];
        }
    }

    // getting today's stats
    async getStats() {
        try {
            const stats = await DashboardAPI.getStats();
            return stats;
        } catch (error) {
            console.error('Failed to fetch stats:', error);
            return {
                total: 0,
                checkedIn: 0,
                waiting: 0,
                completed: 0,
                newToday: 0,
            };
        }
    }

    // adding new patient from registration
    async addPatient(patientData) {
        try {
            const result = await PatientAPI.create(patientData);

            if (result.patient) {
                this.patients.unshift(result.patient);
                this.notify();
            }

            return result;
        } catch (error) {
            console.error('Failed to add patient:', error);
            throw error;
        }
    }

    // updating patient status
    async updatePatientStatus(id, status) {
        try {
            const updatedPatient = await PatientAPI.updateStatus(id, status);
            
            const index = this.patients.findIndex(p => p.id === id);
            if (index !== -1) {
            this.patients[index] = updatedPatient;
            this.notify();
            }
            
            return updatedPatient;
        } catch (error) {
            console.error('Failed to update patient status:', error);
            throw error;
        }
    }

    // updating patient data
    async updatePatient(id, updates) {
        try {
            const updatedPatient = await PatientAPI.update(id, updates);
            
            const index = this.patients.findIndex(p => p.id === id);
            if (index !== -1) {
            this.patients[index] = updatedPatient;
            this.notify();
            }
            
            return updatedPatient;
        } catch (error) {
            console.error('Failed to update patient:', error);
            throw error;
        }
    }

    // deleting patient
    async deletePatient(id) {
        try {
            await PatientAPI.delete(id);
            
            const index = this.patients.findIndex(p => p.id === id);
            if (index !== -1) {
            const deleted = this.patients.splice(index, 1)[0];
            this.notify();  // notifies ALL subscribed pages
            return deleted;
            }
            
            return null;
        } catch (error) {
            console.error('Failed to delete patient:', error);
            throw error;
        }
    }
}

// Singleton instance
export const patientStore = new PatientStore();