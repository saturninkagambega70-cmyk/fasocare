import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../LoginScreen';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: key => key, i18n: { language: 'fr', changeLanguage: jest.fn() } }),
}));

jest.mock('../../../services/api', () => ({
  authService: {
    login: jest.fn(),
  },
  userService: {
    getProfile: jest.fn(),
  },
  getServerURL: jest.fn(() => 'http://localhost:3001'),
  setServerURL: jest.fn(),
  systemService: {
    checkHealth: jest.fn(),
  },
}));

jest.mock('../../../store/useAuthStore', () => ({
  useAuthStore: jest.fn(() => ({
    setUser: jest.fn(),
    setToken: jest.fn(),
    setRefreshToken: jest.fn(),
    getState: jest.fn(() => ({ token: null, user: null, logout: jest.fn() })),
  })),
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
}));

jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  NotificationFeedbackType: { Light: 1, Success: 2, Error: 3, Warning: 4 },
}));

jest.mock('expo-local-authentication', () => ({
  hasHardwareAsync: jest.fn().mockResolvedValue(false),
  isEnrolledAsync: jest.fn().mockResolvedValue(false),
  authenticateAsync: jest.fn(),
}));

describe('LoginScreen', () => {
  it('renders phone and password inputs', () => {
    const { getByPlaceholderText } = render(<LoginScreen />);
    expect(getByPlaceholderText('phone')).toBeTruthy();
    expect(getByPlaceholderText('password')).toBeTruthy();
  });

  it('shows error when fields are empty and login is pressed', async () => {
    const { getByText } = render(<LoginScreen />);
    const loginBtn = getByText('Connexion Sécurisée');
    fireEvent.press(loginBtn);
    await waitFor(() => {
      expect(getByText('Veuillez saisir votre numéro et mot de passe.')).toBeTruthy();
    });
  });

  it('toggles between password and OTP modes', () => {
    const { getByText, queryByPlaceholderText } = render(<LoginScreen />);
    const otpBtn = getByText('Code OTP');
    fireEvent.press(otpBtn);
    expect(queryByPlaceholderText('password')).toBeNull();
  });
});
