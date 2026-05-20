import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/useAuthStore';
import { Clock, ChevronRight, AlertCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { authService } from '../../services/api';
import { FasoCareIcon } from '../../components/FasoCareIcon';
import { useNavigation } from '@react-navigation/native';

const OtpVerificationScreen = ({ route }) => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { setUser, setToken, setRefreshToken } = useAuthStore();
  
  const { phoneNumber, purpose = 'PHONE_VERIFICATION', isLogin = false } = route.params || {};
  
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [otpSent, setOtpSent] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(5);
  const inputRef = useRef(null);

  // Timer for OTP expiry
  useEffect(() => {
    if (!otpSent) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setError(t('otp_expired') || 'OTP expiré');
          setOtpSent(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [otpSent]);

  // Send OTP on component mount
  useEffect(() => {
    sendOtp();
  }, []);

  const sendOtp = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (isLogin) {
        await authService.requestLoginOtp(phoneNumber);
      } else {
        await authService.requestOtp(phoneNumber);
      }
      
      setOtpSent(true);
      setTimeLeft(600);
      setOtp('');
      setAttemptsLeft(5);
      
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Focus input after sending
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      setError(errorMsg);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setError(t('otp_length_error') || 'Le code OTP doit contenir 6 chiffres');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Light);

      let response;
      if (isLogin) {
        response = await authService.loginWithOtp(phoneNumber, otp);
      } else {
        response = await authService.verifyOtp(phoneNumber, otp);
      }

      // Store tokens and user info
      if (response.access_token) {
        setToken(response.access_token);
        if (response.refresh_token) {
          setRefreshToken(response.refresh_token);
        }
        if (response.user) {
          setUser(response.user);
        }
      }

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Redirect based on app state
      navigation.replace('MainTabs');
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      
      // Extract attempts remaining if available
      const match = errorMsg.match(/(\d+) tentatives restantes/);
      if (match) {
        setAttemptsLeft(parseInt(match[1]));
      }
      
      setError(errorMsg);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      // Reset OTP input for next attempt
      setOtp('');
      inputRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const canResend = timeLeft <= 0;

  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <ScrollView
        contentContainerStyle={[styles.container, { maxWidth: 600, alignSelf: 'center', width: '100%' }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <FasoCareIcon size={64} />
          <Text style={styles.title}>Vérification OTP</Text>
          <Text style={styles.subtitle}>Nous avons envoyé un code à {phoneNumber}</Text>
        </View>

        {/* OTP Input */}
        {otpSent && (
          <View style={styles.otpContainer}>
            <View style={[styles.otpInput, error && { borderColor: '#ef4444' }]}>
              <TextInput
                ref={inputRef}
                style={styles.otpInputField}
                placeholder="000000"
                value={otp}
                onChangeText={(text) => {
                  const cleaned = text.replace(/\D/g, '').slice(0, 6);
                  setOtp(cleaned);
                  if (cleaned.length === 6) {
                    // Auto-submit when 6 digits entered
                    setTimeout(() => {
                      handleVerifyOtp();
                    }, 100);
                  }
                }}
                keyboardType="number-pad"
                maxLength={6}
                editable={!loading && otpSent}
                selectTextOnFocus
                textAlign="center"
              />
            </View>

            {/* Status Messages */}
            {error && (
              <View style={styles.errorContainer}>
                <AlertCircle size={20} color="#ef4444" style={{ marginRight: 10 }} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Timer and Attempts */}
            <View style={styles.infoContainer}>
              <View style={styles.infoBadge}>
                <Clock size={16} color="#3b82f6" />
                <Text style={styles.infoBadgeText}>
                  Expire dans {formatTime(timeLeft)}
                </Text>
              </View>

              {attemptsLeft < 5 && (
                <View style={styles.infoBadge}>
                  <AlertCircle size={16} color="#f59e0b" />
                  <Text style={styles.infoBadgeText}>
                    {attemptsLeft} tentative{attemptsLeft > 1 ? 's' : ''} restante{attemptsLeft > 1 ? 's' : ''}
                  </Text>
                </View>
              )}
            </View>

            {/* Resend Button */}
            {canResend && !loading && (
              <TouchableOpacity
                style={styles.resendButton}
                onPress={sendOtp}
              >
                <Text style={styles.resendButtonText}>
                  Renvoyer le code
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Loading State */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#009E49" />
            <Text style={styles.loadingText}>Vérification en cours...</Text>
          </View>
        )}

        {/* Verify Button */}
        <TouchableOpacity
          style={[
            styles.verifyButton,
            (otp.length !== 6 || loading || !otpSent) && styles.verifyButtonDisabled
          ]}
          onPress={handleVerifyOtp}
          disabled={otp.length !== 6 || loading || !otpSent}
        >
          <Text style={styles.verifyButtonText}>
            {loading ? 'Vérification...' : 'Vérifier le code'}
          </Text>
          {!loading && <ChevronRight size={20} color="#ffffff" />}
        </TouchableOpacity>

        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>

        {/* Help Text */}
        <View style={styles.helpContainer}>
          <Text style={styles.helpTitle}>Conseils:</Text>
          <Text style={styles.helpText}>• Vérifiez vos SMS et spam</Text>
          <Text style={styles.helpText}>• Le code expire dans 10 minutes</Text>
          <Text style={styles.helpText}>• Vous avez 5 tentatives</Text>
          <Text style={styles.helpText}>• Contactez l'équipe d'aide après</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  otpContainer: {
    marginBottom: 30,
  },
  otpInput: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  otpInputField: {
    fontSize: 36,
    fontWeight: '600',
    height: 60,
    textAlign: 'center',
    color: '#1a1a1a',
    letterSpacing: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    backgroundColor: '#fee2e2',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 13,
    flex: 1,
  },
  infoContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  infoBadge: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  infoBadgeText: {
    fontSize: 12,
    color: '#1e40af',
    marginLeft: 6,
    fontWeight: '500',
  },
  resendButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginBottom: 20,
  },
  resendButtonText: {
    fontSize: 13,
    color: '#4b5563',
    textAlign: 'center',
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  verifyButton: {
    backgroundColor: '#009E49',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  verifyButtonDisabled: {
    backgroundColor: '#d1d5db',
    opacity: 0.6,
  },
  verifyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginBottom: 30,
  },
  backButtonText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  helpContainer: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  helpTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    marginVertical: 4,
  },
});

export default OtpVerificationScreen;
