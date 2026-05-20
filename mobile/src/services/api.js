import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../store/useAuthStore';

const STORAGE_KEY = 'FASOCARE_SERVER_URL';

// Utiliser la variable d'environnement avec fallback
const ENV_URL = process.env.EXPO_PUBLIC_API_URL || process.env.REACT_NATIVE_API_URL || '';
const DEFAULT_LOCAL_URL = ENV_URL || 'http://localhost:3001';

const normalizeApiBase = (baseUrl) => {
  const trimmed = (baseUrl || '').trim().replace(/\/$/, '');
  if (!trimmed) return '';
  return trimmed.endsWith('/api/v1') ? trimmed : `${trimmed}/api/v1`;
};

let CURRENT_URL = ENV_URL || DEFAULT_LOCAL_URL;
let API_URL = normalizeApiBase(CURRENT_URL);
let IS_OFFLINE = false;

const LOG = {
  info: (...args) => { if (__DEV__) console.info(...args); },
  warn: (...args) => { if (__DEV__) console.warn(...args); },
  error: (...args) => { if (__DEV__) console.error(...args); },
};

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const isOffline = () => IS_OFFLINE;
export const setOffline = (val) => { IS_OFFLINE = val; };

// URLs d'auto-détection — basées sur l'environnement
const getAutoDiscoveryURLs = () => {
  const urls = [];
  if (ENV_URL) urls.push(ENV_URL);
  // Tunnel URLs injectées par auto-tunnel.js via .env.server
  try {
    const tunnelUrl = process.env.EXPO_PUBLIC_TUNNEL_URL;
    if (tunnelUrl) urls.push(tunnelUrl);
  } catch {}
  urls.push(
    'http://localhost:3001',
    'http://127.0.0.1:3001',
    'http://10.0.2.2:3001',
    'http://10.0.2.2:3000',
    'http://192.168.1.100:3001',
    'http://192.168.1.101:3001',
    'http://192.168.1.102:3001',
    'http://192.168.1.103:3001',
    'http://192.168.1.104:3001',
    'http://192.168.1.105:3001',
    'http://192.168.1.1:3001',
    'http://192.168.0.100:3001',
    'http://192.168.0.101:3001',
    'http://192.168.0.102:3001',
    'http://192.168.0.103:3001',
    'http://192.168.0.104:3001',
    'http://192.168.0.105:3001',
    'http://192.168.0.1:3001',
    'http://192.168.100.241:3001',
    'http://192.168.100.1:3001',
    'http://192.168.43.100:3001',
    'http://192.168.43.1:3001',
  );
  return urls;
};

const autoDetectServer = async () => {
  for (const url of getAutoDiscoveryURLs()) {
    try {
      const testApi = axios.create({ baseURL: normalizeApiBase(url), timeout: 3000 });
      await testApi.get('/health');
      CURRENT_URL = url;
      API_URL = normalizeApiBase(url);
      api.defaults.baseURL = API_URL;
      await AsyncStorage.setItem(STORAGE_KEY, url).catch(() => {});
      LOG.info(`✅ Serveur auto-détecté: ${url}`);
      return true;
    } catch { /* try next */ }
  }
  return false;
};

const initURL = async () => {
  try {
    const savedURL = await AsyncStorage.getItem(STORAGE_KEY);
    if (savedURL && savedURL.trim()) {
      CURRENT_URL = savedURL;
      API_URL = normalizeApiBase(savedURL);
      api.defaults.baseURL = API_URL;
      try {
        const testApi = axios.create({ baseURL: API_URL, timeout: 5000 });
        await testApi.get('/health');
        LOG.info('✅ URL persistée:', CURRENT_URL);
        return;
      } catch {
        LOG.warn('URL persistée injoignable, réinitialisation...');
        await AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
      }
    }
  } catch (e) {
    LOG.warn('Erreur chargement URL', e);
  }
  // Auto-détection sur toutes les URLs disponibles
  const found = await autoDetectServer();
  if (!found) {
    LOG.warn('Aucun serveur detecté, utilisation du défaut local');
    CURRENT_URL = DEFAULT_LOCAL_URL;
    API_URL = normalizeApiBase(DEFAULT_LOCAL_URL);
    api.defaults.baseURL = API_URL;
  }
};

initURL();

export const setServerURL = (newURL) => {
  if (!newURL) {
    CURRENT_URL = DEFAULT_LOCAL_URL;
    API_URL = normalizeApiBase(DEFAULT_LOCAL_URL);
  } else {
    CURRENT_URL = newURL;
    API_URL = normalizeApiBase(newURL);
  }
  api.defaults.baseURL = API_URL;
  AsyncStorage.setItem(STORAGE_KEY, CURRENT_URL).catch(e => 
    LOG.warn('Échec de sauvegarde de l\'URL serveur', e)
  );
  return API_URL;
};

export const getServerURL = () => CURRENT_URL;

export const resetServerURL = async () => {
  CURRENT_URL = DEFAULT_LOCAL_URL;
  API_URL = normalizeApiBase(DEFAULT_LOCAL_URL);
  api.defaults.baseURL = API_URL;
  await AsyncStorage.removeItem(STORAGE_KEY);
  // Lancer l'auto-détection en arrière-plan
  autoDetectServer();
};

export const testConnection = async (url) => {
  try {
    const testApi = axios.create({
      baseURL: normalizeApiBase(url),
      timeout: 5000,
    });
    const response = await testApi.get('/health');
    return { success: true, message: 'Connexion réussie' };
  } catch (error) {
    return { 
      success: false, 
      message: error.response?.status === 404 
        ? 'Serveur reachable mais endpoint /health non trouvé' 
        : `Échec de connexion: ${error.message}` 
    };
  }
};

export const triggerAutoDetect = async () => {
  const found = await autoDetectServer();
  return { found, url: found ? CURRENT_URL : null };
};

export const systemService = {
  checkHealth: async () => {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (e) {
      // Tentative d'auto-détection avant d'échouer
      const found = await autoDetectServer();
      if (found) {
        const response = await api.get('/health');
        return response.data;
      }
      throw new Error(`Serveur injoignable. Vérifiez votre connexion et votre réseau.\nURL testée: ${API_URL}\n\n💡 Appui long sur le logo pour configurer`);
    }
  }
};

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const delay = ms => new Promise(res => setTimeout(res, ms));

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(undefined, async error => {
  const { config, response } = error;

  if (response?.status === 401 && !config._retry) {
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(token => {
        config.headers.Authorization = `Bearer ${token}`;
        return api(config);
      });
    }

    config._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = useAuthStore.getState().refreshToken;
      if (!refreshToken) throw new Error('No refresh token');

      const refreshResponse = await authService.refreshToken(refreshToken);
      const { access_token, refresh_token } = refreshResponse;

      useAuthStore.getState().setToken(access_token);
      useAuthStore.getState().setRefreshToken(refresh_token);

      processQueue(null, access_token);
      config.headers.Authorization = `Bearer ${access_token}`;
      return api(config);
    } catch (refreshError) {
      processQueue(refreshError, null);
      useAuthStore.getState().logout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }

  if (response?.status === 503) {
    config.__retryCount = config.__retryCount || 0;
    if (config.__retryCount < 3) {
      config.__retryCount += 1;
      await delay(Math.pow(2, config.__retryCount) * 1000);
      return api(config);
    }
  }

  // Auto-détection du serveur en cas d'erreur réseau (serveur injoignable)
  if (!response && !config._autoDetectAttempted) {
    config._autoDetectAttempted = true;
    try {
      const found = await autoDetectServer();
      if (found) {
        config.baseURL = api.defaults.baseURL;
        return api(config);
      }
    } catch {}
  }

  return Promise.reject(error);
});

export const medicalService = {
  getHistory: async () => {
    const response = await api.get('/medical/consultations/patient/me');
    return response.data?.data || response.data;
  },
  getPatientHistory: async (patientId) => {
    const response = await api.get(`/medical/patients/${patientId}/history`);
    return response.data?.data || response.data;
  },
  validatePrescription: async (token) => {
    const response = await api.get(`/medical/validate-prescription/${token}`);
    return response.data?.data || response.data;
  },
  dispense: async (token) => {
    const response = await api.post(`/medical/dispense/${token}`);
    return response.data?.data || response.data;
  },
  getConsultationItems: async (token, pharmacyId) => {
    const params = pharmacyId ? `?pharmacyId=${pharmacyId}` : '';
    const response = await api.get(`/medical/consultation-items/${token}${params}`);
    return response.data?.data || response.data;
  },
  getConsultationItemsById: async (consultationId) => {
    const response = await api.get(`/medical/consultations/${consultationId}/items`);
    return response.data?.data || response.data;
  },
  dispenseItems: async (token, items, pharmacyId) => {
    const response = await api.post(`/medical/dispense-items/${token}`, { items, pharmacyId });
    return response.data?.data || response.data;
  },
  createConsultation: async (patientId, diagnosis, treatment, vitals) => {
    const response = await api.post('/medical/consultations', {
      patient: { id: patientId },
      diagnosis,
      treatmentPlan: treatment,
      temperature: vitals.temperature,
      weight: vitals.weight,
      pulse: vitals.pulse,
      bloodPressure: vitals.bloodPressure,
      hospital: vitals.hospital,
      prescription: vitals.prescription,
    });
    return response.data?.data || response.data;
  },
  addPrescriptionItems: async (consultationId, items) => {
    const response = await api.post(`/medical/consultations/${consultationId}/items`, items);
    return response.data?.data || response.data;
  },
  getVideoToken: async (roomName) => {
    const response = await api.post('/telecom/video-token', { room: roomName });
    return response.data;
  },
  getLatestPatients: async () => {
    try {
      const response = await api.get('/medical/patients/latest');
      return response.data;
    } catch {
      return [];
    }
  },
  getMyConsultations: async () => {
    try {
      const response = await api.get('/medical/consultations/patient/me');
      return response.data?.data || response.data;
    } catch {
      return [];
    }
  },
  getDoctorConsultations: async (doctorId) => {
    try {
      const response = await api.get(`/medical/consultations?doctorId=${doctorId}`);
      return response.data?.data?.consultations || response.data || [];
    } catch {
      return [];
    }
  },
  reportEpidemic: async (reportData) => {
    const response = await api.post('/medical/epidemic-report', reportData);
    return response.data;
  },
  getEpidemicReports: async () => {
    const response = await api.get('/medical/epidemic-reports');
    return response.data;
  },
  sendMessage: async (receiverId, content) => {
    const response = await api.post('/medical/messages', { receiverId, content });
    return response.data;
  },
  getMessages: async () => {
    const response = await api.get('/medical/messages');
    return response.data;
  },
  getNotifications: async () => {
    try {
      const response = await api.get('/medical/notifications');
      return response.data;
    } catch {
      return [];
    }
  },
  markNotificationAsRead: async (id) => {
    const response = await api.post(`/medical/notifications/${id}/read`);
    return response.data;
  },
  sendSOS: async (payload) => {
    const response = await api.post('/medical/emergency', payload);
    return response.data;
  },
  getEmergencies: async () => {
    const response = await api.get('/medical/emergency');
    return response.data;
  },
  getTreatmentProgress: async () => {
    const response = await api.get('/medical/treatment-progress');
    return response.data?.data || response.data;
  },
  getPatientTreatmentProgress: async (patientId) => {
    const response = await api.get(`/medical/patients/${patientId}/treatment-progress`);
    return response.data?.data || response.data;
  },
  getConsultationTreatmentLogs: async (consultationId) => {
    const response = await api.get(`/medical/consultations/${consultationId}/treatment-logs`);
    return response.data?.data || response.data;
  },
  createTreatmentLog: async (consultationId, itemId, scheduledTime, status) => {
    const response = await api.post('/medical/treatment-logs', { consultationId, itemId, scheduledTime, status });
    return response.data?.data || response.data;
  },
  updateTreatmentLogStatus: async (logId, status) => {
    const response = await api.patch(`/medical/treatment-logs/${logId}/status`, { status });
    return response.data?.data || response.data;
  },
  generateTreatmentLogs: async (consultationId) => {
    const response = await api.post(`/medical/consultations/${consultationId}/generate-treatment-logs`);
    return response.data?.data || response.data;
  },
  triage: async (symptoms) => {
    const response = await api.post('/ai/triage', { symptoms });
    return response.data;
  },
  chat: async (message) => {
    const response = await api.post('/ai/chat', { prompt: message }, { timeout: 30000 });
    return response.data;
  },
  chatWithRetry: async (message, retries = 2) => {
    for (let i = 0; i <= retries; i++) {
      try {
        const response = await api.post('/ai/chat', { prompt: message }, { timeout: 30000 });
        return response.data;
      } catch (err) {
        if (i === retries) throw err;
        await new Promise(r => setTimeout(r, 1000 * (i + 1)));
      }
    }
  }
};

export const pharmacyService = {
  getPublicPharmacies: async () => {
    const response = await api.get('/pharmacies/public');
    return response.data;
  },
  verifyCachet: async (token) => {
    const response = await api.get(`/pharmacies/verify-cachet/${token}`);
    return response.data;
  },
  getStockAlerts: async () => {
    const response = await api.get('/pharmacies/low-stock-alerts');
    return response.data;
  },
  getStats: async () => {
    const response = await api.get('/pharmacies/stats');
    return response.data;
  },
  getStock: async (pharmacyId) => {
    const response = await api.get(`/pharmacies/${pharmacyId}/stock`);
    return response.data;
  },
  updateStock: async (stockId, quantity) => {
    const response = await api.put(`/pharmacies/stock/${stockId}`, { quantity });
    return response.data;
  },
  getMyPharmacies: async () => {
    const response = await api.get('/pharmacies/my-pharmacies');
    return response.data;
  },
  createPharmacy: async (pharmacyData) => {
    const response = await api.post('/pharmacies', pharmacyData);
    return response.data;
  }
};

export const vaccinationService = {
  getRecords: async (patientId) => {
    const response = await api.get(`/vaccination/child/${patientId}`);
    return response.data;
  },
  getChildRecords: async (childId) => {
    const response = await api.get(`/vaccination/child/${childId}`);
    return response.data;
  },
  addRecord: async (record) => {
    const response = await api.post('/vaccination/record', record);
    return response.data;
  }
};

export const authService = {
  login: async (phone, password) => {
    const response = await api.post('/auth/login', { phone, password });
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  forgotPassword: async (phone) => {
    const response = await api.post('/auth/forgot-password', { phone });
    return response.data;
  },
  resetPassword: async (phone, otp, newPass) => {
    const response = await api.post('/auth/reset-password', { phone, otp, newPass });
    return response.data;
  },
  verifyOtp: async (phoneNumber, code) => {
    const response = await api.post('/auth/verify-otp', { phoneNumber, code });
    return response.data;
  },
  requestOtp: async (phoneNumber) => {
    const response = await api.post('/auth/request-otp', { phoneNumber });
    return response.data;
  },
  requestLoginOtp: async (phoneNumber) => {
    const response = await api.post('/auth/request-login-otp', { phoneNumber });
    return response.data;
  },
  loginWithOtp: async (phoneNumber, code) => {
    const response = await api.post('/auth/login-otp', { phoneNumber, code });
    return response.data;
  },
  refreshToken: async (refreshToken) => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  }
};

export const userService = {
  getProfile: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },
  updateProfile: async (data) => {
    const response = await api.put('/users/me', data);
    return response.data;
  },
  findPatient: async (phone) => {
    const response = await api.get(`/users/find/${phone}`);
    return response.data;
  },
  findById: async (id) => {
    const response = await api.get(`/users/id/${id}`);
    return response.data;
  },
  getChildren: async () => {
    const response = await api.get('/users/children');
    return response.data;
  },
  addChild: async (childPhone) => {
    const response = await api.post('/users/children/add', { childPhone });
    return response.data;
  }
};

export const statsService = {
  getDashboard: async () => {
    const response = await api.get('/stats/dashboard');
    return response.data;
  }
};

export const appointmentService = {
  create: async (data) => {
    const response = await api.post('/appointments', data);
    return response.data?.data || response.data;
  },
  getMyAppointments: async () => {
    const response = await api.get('/appointments/my-appointments');
    return response.data?.data || response.data;
  },
  getDoctorAppointments: async () => {
    const response = await api.get('/appointments/doctor-appointments');
    return response.data?.data || response.data;
  },
  confirm: async (id) => {
    const response = await api.patch(`/appointments/${id}/confirm`);
    return response.data?.data || response.data;
  },
  complete: async (id) => {
    const response = await api.patch(`/appointments/${id}/complete`);
    return response.data?.data || response.data;
  },
  cancel: async (id) => {
    const response = await api.patch(`/appointments/${id}/cancel`);
    return response.data?.data || response.data;
  },
};

export default api;