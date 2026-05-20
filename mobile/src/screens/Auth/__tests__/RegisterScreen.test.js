import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import RegisterScreen from '../RegisterScreen';

beforeAll(() => {
  global.alert = jest.fn();
});

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: key => key }),
}));

jest.mock('../../../services/api', () => ({
  authService: { register: jest.fn() },
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
  })),
}));

describe('RegisterScreen', () => {
  it('renders registration form', () => {
    const { getByPlaceholderText, getByText } = render(<RegisterScreen />);
    expect(getByPlaceholderText('name_placeholder')).toBeTruthy();
    expect(getByPlaceholderText('phone')).toBeTruthy();
    expect(getByText('Citoyen')).toBeTruthy();
  });

  it('shows validation errors for empty form', () => {
    const { getAllByText } = render(<RegisterScreen />);
    fireEvent.press(getAllByText('create_account')[1]);
    expect(global.alert).toHaveBeenCalled();
  });
});
