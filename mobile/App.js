import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import './src/i18n/config';
import WelcomeScreen from './src/screens/Auth/WelcomeScreen';
import LoginScreen from './src/screens/Auth/LoginScreen';
import RegisterScreen from './src/screens/Auth/RegisterScreen';
import ForgotPasswordScreen from './src/screens/Auth/ForgotPasswordScreen';
import ResetPasswordScreen from './src/screens/Auth/ResetPasswordScreen';
import OtpVerificationScreen from './src/screens/Auth/OtpVerificationScreen';
import { useAuthStore } from './src/store/useAuthStore';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { initSentry } from './src/services/sentry';
import { startNetworkMonitoring } from './src/services/SyncService';
import { initDatabase } from './src/database/db';

initSentry();

const Stack = createStackNavigator();

import { AppNavigator } from './src/navigation/AppNavigator';
import { ThemeProvider } from './src/context/ThemeContext';

export default function App() {
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    initDatabase();
    startNetworkMonitoring();
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <SafeAreaProvider>
          <NavigationContainer>
          {!isAuthenticated ? (
            <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Welcome">
              <Stack.Screen name="Welcome" component={WelcomeScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
              <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
              <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
              <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
            </Stack.Navigator>
          ) : (
            <AppNavigator />
          )}
        </NavigationContainer>
      </SafeAreaProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

