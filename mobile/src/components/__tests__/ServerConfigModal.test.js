import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { ServerConfigModal } from '../ServerConfigModal';

// Mock API service
jest.mock('../../services/api', () => ({
  __esModule: true,
  getServerURL: jest.fn(() => 'http://192.168.100.241:3001'),
  setServerURL: jest.fn(),
  systemService: {
    checkHealth: jest.fn(),
  },
}));

// Mock icons
jest.mock('lucide-react-native', () => ({
  Globe: 'Globe',
  X: 'X',
  Check: 'Check',
  RotateCcw: 'RotateCcw',
}));

describe('ServerConfigModal', () => {
  beforeEach(() => {
    const api = require('../../services/api');
    api.systemService.checkHealth.mockReset();
  });

  it('renders correctly when visible', () => {
    const { getByText, getByPlaceholderText } = render(
      <ServerConfigModal visible={true} onClose={jest.fn()} />
    );
    expect(getByText('Configuration Serveur')).toBeTruthy();
    expect(getByPlaceholderText('http://192.168.x.x:3001')).toBeTruthy();
  });

  it('tests connection successfully', async () => {
    const api = require('../../services/api');
    api.systemService.checkHealth.mockResolvedValueOnce({ status: 'ready' });

    const { getByText, findByText } = render(
      <ServerConfigModal visible={true} onClose={jest.fn()} />
    );

    fireEvent.press(getByText('Tester la connexion'));

    expect(await findByText('Serveur accessible !')).toBeTruthy();
  });

  it('shows error when connection fails', async () => {
    const api = require('../../services/api');
    api.systemService.checkHealth.mockRejectedValueOnce(new Error('Network Error'));

    const { getByText, findByText } = render(
      <ServerConfigModal visible={true} onClose={jest.fn()} />
    );

    fireEvent.press(getByText('Tester la connexion'));

    expect(await findByText('Serveur injoignable.')).toBeTruthy();
  });
});
