/**
 * API Service - Centralized backend communication
 * Base URL: http://localhost:5000
 */

const API_BASE_URL = 'http://localhost:5000';

export class ApiService {
  /**
   * request handler
   */
  static async request(endpoint, options = {}) {
    const token = localStorage.getItem('auth_token');
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
      // handling non-JSON responses
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }
      
      const data = await response.json();
      
      // handling error responses
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // HTTP Methods
  static get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  static post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  static delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}


// ============================================================================
// AUTHENTICATION APIs

export class AuthAPI {
  static async login(email, password) {
    const response = await ApiService.post('/api/auth/login', { email, password });
    
    if (response.token) {
      localStorage.setItem('auth_token', response.token);
    }
    
    return response;
  }

  static async verify() {
    return ApiService.get('/api/auth/verify');
  }

  static logout() {
    localStorage.removeItem('auth_token');
  }
}


// ============================================================================
// PATIENT APIs

export class PatientAPI {
  static async getAll(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.doctor) params.append('doctor', filters.doctor);
    if (filters.search) params.append('search', filters.search);
    
    const queryString = params.toString();
    return ApiService.get(`/api/patients${queryString ? '?' + queryString : ''}`);
  }

  static async getById(id) {
    return ApiService.get(`/api/patients/${id}`);
  }

  static async create(patientData) {
    return ApiService.post('/api/patients', patientData);
  }

  static async update(id, updates) {
    return ApiService.patch(`/api/patients/${id}`, updates);
  }

  static async updateStatus(id, status) {
    return ApiService.patch(`/api/patients/${id}/status`, { status });
  }

  static async delete(id) {
    return ApiService.delete(`/api/patients/${id}`);
  }

  static async getQueue() {
    return ApiService.get('/api/patients/queue');
  }
}


// ============================================================================
// DASHBOARD APIs

export class DashboardAPI {
  static async getStats() {
    return ApiService.get('/api/dashboard/stats');
  }
}


// ============================================================================
// BILLING APIs

export class BillingAPI {
  static async getAll(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    
    const queryString = params.toString();
    return ApiService.get(`/api/invoices${queryString ? '?' + queryString : ''}`);
  }

  static async getById(id) {
    return ApiService.get(`/api/invoices/${id}`);
  }

  static async create(invoiceData) {
    return ApiService.post('/api/invoices', invoiceData);
  }

  static async markAsPaid(id, paymentMethod) {
    return ApiService.patch(`/api/invoices/${id}`, {
      status: 'Paid',
      paymentMethod: paymentMethod,
    });
  }
}


// ============================================================================
// REFERENCE DATA APIs

export class ReferenceAPI {
  static async getDoctors() {
    return ApiService.get('/api/doctors');
  }

  static async getDoctorsByDepartment(departmentId) {
    return ApiService.get(`/api/doctors/by-department/${departmentId}`);
  }

  static async getDepartments() {
    return ApiService.get('/api/departments');
  }

  static async getServices() {
    return ApiService.get('/api/services');
  }

  static async getPaymentMethods() {
    return ApiService.get('/api/payment-methods');
  }
}