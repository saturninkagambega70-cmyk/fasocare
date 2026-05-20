import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import WelcomeScreen from '../WelcomeScreen';

// Mock dependencies
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: key => key }),
}));
jest.mock('lucide-react-native', () => ({
  ChevronRight: 'ChevronRight',
}));
jest.mock('../../../components/FasoCareIcon', () => ({
  FasoCareIcon: 'FasoCareIcon',
}));
jest.mock('../../../store/useAuthStore', () => ({
  useAuthStore: () => ({}),
}));
jest.mock('../../../components/ServerConfigModal', () => ({
  ServerConfigModal: 'ServerConfigModal',
}));

describe('WelcomeScreen', () => {
  it('renders correctly', () => {
    const { getByText } = render(<WelcomeScreen navigation={{ navigate: jest.fn() }} />);
    expect(getByText('FasoCare')).toBeTruthy();
    expect(getByText('Votre santé, enfin dans vos mains.')).toBeTruthy();
    expect(getByText("Commencer l'expérience")).toBeTruthy();
  });

  it('navigates to Login when primary button is pressed', () => {
    const mockNavigate = jest.fn();
    const { getByText } = render(<WelcomeScreen navigation={{ navigate: mockNavigate }} />);
    
    fireEvent.press(getByText("Commencer l'expérience"));
    expect(mockNavigate).toHaveBeenCalledWith('Login');
  });
});
