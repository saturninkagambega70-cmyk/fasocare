/**
 * API Client Configuration
 * Handles all HTTP requests to the backend with authentication
 */

import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Request Interceptor: Add authentication token to requests
 */
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage (or cookie in production)
    let token = null
    if (typeof window !== 'undefined') {
      token = sessionStorage.getItem('fasocare_admin_token') || localStorage.getItem('access_token')
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

/**
 * Response Interceptor: Handle errors and token refresh
 */
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }
    const status = error.response?.status

    // Handle 401 Unauthorized
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = typeof window !== 'undefined'
          ? sessionStorage.getItem('fasocare_refresh_token') || localStorage.getItem('refresh_token')
          : null
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          })

          const { access_token, refresh_token } = response.data
          sessionStorage.setItem('fasocare_admin_token', access_token)
          if (refresh_token) {
            sessionStorage.setItem('fasocare_refresh_token', refresh_token)
          }

          // Retry original request
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${access_token}`
          }
          return api(originalRequest)
        }
      } catch (refreshError) {
        // Redirect to login
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('fasocare_admin_token')
          sessionStorage.removeItem('fasocare_admin_user')
          sessionStorage.removeItem('fasocare_refresh_token')
          window.location.href = '/login'
        }
      }
    }

    // Handle 403 Forbidden
    if (status === 403) {
      if (typeof window !== 'undefined') {
        window.location.href = '/unauthorized'
      }
    }

    return Promise.reject(error)
  }
)

/**
 * Type definitions for API responses
 */
export interface ApiResponse<T> {
  data?: T
  message?: string
  statusCode: number
  success: boolean
}

export interface DashboardStats {
  citizens: number
  vaccinationRate: number
  consultations: number
  stockAlerts: number
  trends: {
    citizens: string
    vaccination: string
    consultations: string
    alerts: string
  }
}

export interface User {
  id: string
  name: string
  email: string
  phone: string
  role: 'ADMIN' | 'DOCTOR' | 'PHARMACIST' | 'PATIENT' | 'LAB_TECH' | 'NURSE'
  roles?: string[]
  status: 'active' | 'inactive' | 'suspended'
  establishment: string
  createdAt: string
}

export interface Consultation {
  id: string
  patientId: string
  patientName: string
  doctorId: string
  doctorName: string
  date: string
  reason: string
  diagnosis: string
  prescription: string
  status: 'pending' | 'completed' | 'cancelled'
  createdAt: string
}

export interface Notification {
  id: string
  type: 'alert' | 'validation' | 'stock_alert' | 'PRESCRIPTION' | 'VACCINATION' | 'MESSAGE' | 'SYSTEM'
  title: string
  message?: string
  content?: string
  timestamp: string
  read?: boolean
  isRead?: boolean
}

export interface AuditLog {
  id: string
  action: string
  userId: string
  userName: string
  userRole: string
  resource: string
  details: string
  ipAddress: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  timestamp: string
}

/**
 * API Service Methods
 */

// ============ STATS ============
export const statsAPI = {
  getDashboard: () => api.get<ApiResponse<DashboardStats>>('/stats/dashboard'),
  getCitizenCount: () => api.get<ApiResponse<{ count: number }>>('/stats/citizens'),
  getVaccinationRate: () => api.get<ApiResponse<{ rate: number }>>('/stats/vaccination'),
  getConsultationCount: () => api.get<ApiResponse<{ count: number }>>('/stats/consultations'),
  getStockAlerts: () => api.get<ApiResponse<{ count: number }>>('/stats/stock-alerts'),
  getMapData: () => api.get<ApiResponse<any>>('/stats/map'),
  getHeatmapData: () => api.get<ApiResponse<any>>('/stats/heatmap'),
  exportReports: () => api.get('/stats/export', { responseType: 'blob' }),
  exportReportsPdf: () => api.get('/stats/export-pdf', { responseType: 'blob' }),
}

// ============ USERS ============
export const usersAPI = {
  list: (params?: { search?: string; limit?: number; offset?: number; role?: string }) =>
    api.get<ApiResponse<{ users: User[]; total: number }>>('/users', { params }),
  get: (id: string) => api.get<ApiResponse<User>>(`/users/${id}`),
  create: (data: Partial<User>) => api.post<ApiResponse<User>>('/users', data),
  update: (id: string, data: Partial<User>) => api.patch<ApiResponse<User>>(`/users/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse<null>>(`/users/${id}`),
  validate: (id: string) => api.post<ApiResponse<User>>(`/users/${id}/validate`, {}),
  suspend: (id: string) => api.post<ApiResponse<User>>(`/users/${id}/suspend`, {}),
}

// ============ MEDICAL ============
export const medicalAPI = {
  listConsultations: (params?: { patientId?: string; doctorId?: string; limit?: number }) =>
    api.get<ApiResponse<{ consultations: Consultation[]; total: number }>>('/medical/consultations', {
      params,
    }),
  getConsultation: (id: string) => api.get<ApiResponse<Consultation>>(`/medical/consultations/${id}`),
  createConsultation: (data: Partial<Consultation>) =>
    api.post<ApiResponse<Consultation>>('/medical/consultations', data),
  patientHistory: (patientId: string) =>
    api.get<ApiResponse<Consultation[]>>(`/medical/patients/${patientId}/history`),
  validatePrescription: (consultationId: string, qrToken: string) =>
    api.post<ApiResponse<{ valid: boolean }>>('/medical/validate-prescription', {
      consultationId,
      qrToken,
    }),
  dispenseMedicine: (consultationId: string) =>
    api.post<ApiResponse<{ dispensed: boolean }>>(`/medical/consultations/${consultationId}/dispense`, {}),
}

// ============ NOTIFICATIONS ============
export const notificationsAPI = {
  list: (params?: { limit?: number; unreadOnly?: boolean }) =>
    api.get<ApiResponse<{ notifications: Notification[]; total: number }>>('/notifications', {
      params,
    }),
  markAsRead: (id: string) => api.post<ApiResponse<Notification>>(`/notifications/${id}/read`, {}),
  markAllAsRead: () => api.post<ApiResponse<null>>('/notifications/read-all', {}),
}

// ============ PHARMACY ============
export const pharmacyAPI = {
  getStock: (params?: { pharmacyId?: string; medicineId?: string }) =>
    api.get<ApiResponse<any>>('/pharmacies/stock', { params }),
  getLowStockAlerts: () => api.get<ApiResponse<any>>('/pharmacies/low-stock-alerts'),
  getStats: () => api.get<ApiResponse<any>>('/pharmacies/stats'),
}

// ============ VACCINATION ============
export const vaccinationAPI = {
  getByPatient: (patientId: string) =>
    api.get<ApiResponse<any>>(`/vaccination/patients/${patientId}`),
  getLatest: (patientId: string) =>
    api.get<ApiResponse<any>>(`/vaccination/patients/${patientId}/latest`),
}

// ============ AUDIT ============
export const auditAPI = {
  list: (params?: { limit?: number; offset?: number; severity?: string }) =>
    api.get<ApiResponse<{ logs: AuditLog[]; total: number }>>('/monitoring/audit', { params }),
}

export default api
