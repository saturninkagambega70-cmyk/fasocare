import axios from 'axios';

jest.mock('axios');

describe('API Service', () => {
  let authService, medicalService, pharmacyService;

  beforeEach(() => {
    jest.clearAllMocks();
    axios.create.mockReturnValue(axios);
    axios.interceptors = {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    };
    axios.defaults = { baseURL: '' };
  });

  it('authService.login calls POST /auth/login', async () => {
    axios.post.mockResolvedValue({ data: { access_token: 'token', user: { id: '1' } } });
    const api = require('../api');
    authService = api.authService;

    const result = await authService.login('70000000', 'password');

    expect(axios.post).toHaveBeenCalledWith('/auth/login', { phone: '70000000', password: 'password' });
    expect(result.access_token).toBe('token');
  });

  it('medicalService.getHistory calls GET /medical/consultations/patient/me', async () => {
    axios.get.mockResolvedValue({ data: { data: [{ id: '1', diagnosis: 'Test' }] } });
    const api = require('../api');
    medicalService = api.medicalService;

    const result = await medicalService.getHistory();

    expect(axios.get).toHaveBeenCalledWith('/medical/consultations/patient/me');
    expect(result).toHaveLength(1);
  });

  it('medicalService.sendMessage calls POST /medical/messages', async () => {
    axios.post.mockResolvedValue({ data: { id: '1' } });
    const api = require('../api');
    medicalService = api.medicalService;

    await medicalService.sendMessage('receiver-1', 'Hello');

    expect(axios.post).toHaveBeenCalledWith('/medical/messages', { receiverId: 'receiver-1', content: 'Hello' });
  });

  it('pharmacyService.getPublicPharmacies calls GET /pharmacies/public', async () => {
    axios.get.mockResolvedValue({ data: [{ id: '1', name: 'Pharmacie Centrale' }] });
    const api = require('../api');
    pharmacyService = api.pharmacyService;

    const result = await pharmacyService.getPublicPharmacies();

    expect(axios.get).toHaveBeenCalledWith('/pharmacies/public');
    expect(result).toHaveLength(1);
  });

  it('authService.forgotPassword calls POST /auth/forgot-password', async () => {
    axios.post.mockResolvedValue({ data: { message: 'OTP sent' } });
    const api = require('../api');
    authService = api.authService;

    const result = await authService.forgotPassword('70000000');

    expect(axios.post).toHaveBeenCalledWith('/auth/forgot-password', { phone: '70000000' });
    expect(result.message).toBe('OTP sent');
  });
});
