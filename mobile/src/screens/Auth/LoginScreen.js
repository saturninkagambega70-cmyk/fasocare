import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/useAuthStore';
import { Phone, Lock, ChevronRight, Fingerprint, MessageSquare, Key } from 'lucide-react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Haptics from 'expo-haptics';
import * as SecureStore from 'expo-secure-store';
import { authService, userService } from '../../services/api';
import { FasoCareIcon } from '../../components/FasoCareIcon';
import { ServerConfigModal } from '../../components/ServerConfigModal';
import { useNavigation } from '@react-navigation/native';

const LoginScreen = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const { setUser, setToken, setRefreshToken } = useAuthStore();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loginMode, setLoginMode] = useState('password'); // 'password' or 'otp'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [configVisible, setConfigVisible] = useState(false);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const handleApiLogin = async () => {
    if (!phone || !password) {
      setError(t('veuillez_saisir_numero_mdp'));
      return;
    }
    try {
      setLoading(true);
      setError('');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Light);
      const res = await authService.login(phone, password);
      setToken(res.access_token);
      if (res.refresh_token) {
        setRefreshToken(res.refresh_token);
      }
      setUser(res.user);
      // Sauvegarder les credentials pour la connexion biométrique
      try {
        await SecureStore.setItemAsync('fasocare_biometric_credentials', JSON.stringify({ phone, password }));
      } catch {}
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      const errorMsg = error.message || "Erreur lors du démarrage de la connexion OTP";
      setError(errorMsg);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpLogin = async () => {
    if (!phone) {
      setError(t('veuillez_saisir_numero'));
      return;
    }
    try {
      setLoading(true);
      setError('');
      await authService.requestLoginOtp(phone);
      navigation.navigate('OtpVerification', { phoneNumber: phone });
    } catch (error) {
      const errorMsg = error.message || "Erreur lors de l'envoi du code OTP";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricAuth = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        setError(t('biometrie_non_config'));
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: t('connexion_biometrique_fasocare'),
        fallbackLabel: t('utiliser_mdp'),
        cancelLabel: t('annuler'),
        disableDeviceFallback: false,
      });

      if (!result.success) {
        setError(t('auth_biometrique_echouee'));
        return;
      }

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      const store = useAuthStore.getState();
      const storedToken = store.token;

      if (storedToken) {
        try {
          await userService.getProfile();
          setToken(storedToken);
          setUser(store.user);
          return;
        } catch {
          useAuthStore.getState().logout();
        }
      }

      const credentials = await SecureStore.getItemAsync('fasocare_biometric_credentials');
      if (credentials) {
        const { phone: savedPhone, password: savedPassword } = JSON.parse(credentials);
        setPhone(savedPhone);
        setPassword(savedPassword);
        await handleApiLogin();
        return;
      }

      setError(t('aucun_compte_biometrie'));
    } catch (err) {
      setError(t('erreur_auth_biometrique'));
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <ScrollView contentContainerStyle={[styles.container, { maxWidth: 600, alignSelf: 'center', width: '100%' }]} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <FasoCareIcon size={72} />
          <Text style={styles.logo}>FasoCare</Text>
          <Text style={styles.tagline}>{t('info_sante')}</Text>
        </View>

        <View style={styles.langContainer}>
          {['fr', 'mo', 'di', 'fu'].map((lng) => (
            <TouchableOpacity 
              key={lng} 
              onPress={() => changeLanguage(lng)}
              style={[styles.langBtn, i18n.language === lng && styles.langBtnActive]}
              accessibilityRole="button"
              accessibilityLabel={t('changer_langue')}
            >
              <Text style={styles.langText}>{lng.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Login Mode Toggle */}
        <View style={styles.modeToggleContainer}>
          <TouchableOpacity
            style={[styles.modeToggleBtn, loginMode === 'password' && styles.modeToggleBtnActive]}
            onPress={() => {
              setLoginMode('password');
              setError('');
            }}
            accessibilityRole="button"
            accessibilityLabel={t('connexion_mot_de_passe')}
          >
            <Key size={16} color={loginMode === 'password' ? '#ffffff' : '#666'} />
            <Text style={[styles.modeToggleText, loginMode === 'password' && styles.modeToggleTextActive]}>
              {t('connexion_mot_de_passe')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeToggleBtn, loginMode === 'otp' && styles.modeToggleBtnActive]}
            onPress={() => {
              setLoginMode('otp');
              setError('');
              setPassword('');
            }}
            accessibilityRole="button"
            accessibilityLabel={t('connexion_code_otp')}
          >
            <MessageSquare size={16} color={loginMode === 'otp' ? '#ffffff' : '#666'} />
            <Text style={[styles.modeToggleText, loginMode === 'otp' && styles.modeToggleTextActive]}>
              {t('connexion_code_otp')}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Phone size={20} color="#666" />
            <TextInput
              style={styles.input}
              placeholder={t('phone')}
              value={phone}
              onChangeText={(text) => {
                setPhone(text);
                setError('');
              }}
              keyboardType="phone-pad"
              editable={!loading}
            />
          </View>

          {loginMode === 'password' && (
            <View style={styles.inputContainer}>
              <Lock size={20} color="#666" />
              <TextInput
                style={styles.input}
                placeholder={t('password')}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setError('');
                }}
                secureTextEntry
                editable={!loading}
              />
            </View>
          )}

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity 
                onPress={() => setConfigVisible(true)}
                style={{marginTop: 8, backgroundColor: '#0d6e3f', padding: 10, borderRadius: 10, alignItems: 'center'}}
              >
                <Text style={{color: 'white', fontWeight: 'bold', fontSize: 12}}>
                  {t('configurer_serveur')}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity 
            onPress={() => navigation.navigate('Register')} 
            style={{marginBottom: 15, alignItems: 'center'}}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel={t('create_account')}
          >
             <Text style={{color: '#0d6e3f', fontWeight: 'bold'}}>{t('create_account') || "Créer un compte"}</Text>
          </TouchableOpacity>

          <ServerConfigModal visible={configVisible} onClose={() => setConfigVisible(false)} />

          <TouchableOpacity 
            style={[styles.apiBtn, loading && styles.apiBtnDisabled]} 
            onPress={loginMode === 'password' ? handleApiLogin : handleOtpLogin}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel={loginMode === 'password' ? t('connexion_securisee') : t('recevoir_otp')}
          >
            {loading ? (
              <>
                <ActivityIndicator size="small" color="white" style={{marginRight: 8}} />
                <Text style={styles.loginBtnText}>
                  {loginMode === 'password' ? t('connexion_cours') : t('envoi_code_cours')}
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.loginBtnText}>
                  {loginMode === 'password' ? t('connexion_securisee') : t('recevoir_otp')}
                </Text>
                <ChevronRight color="white" size={18} />
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => navigation.navigate('ForgotPassword')} 
            style={{marginTop: 15, alignSelf: 'center'}}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel={t('forgot_password')}
          >
            <Text style={{color: '#64748b', fontSize: 13}}>{t('forgot_password')}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.bioBtn} 
            onPress={handleBiometricAuth} 
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel={t('acces_biometrique')}
          >
            <Fingerprint color="#0d6e3f" size={24} />
            <Text style={styles.bioBtnText}>{t('acces_biometrique')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#ffffff', padding: 25, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 45 },
  logo: { fontSize: 42, fontWeight: 'bold', color: '#0d6e3f', letterSpacing: -2 },
  tagline: { fontSize: 16, color: '#64748b', fontWeight: 'bold', marginTop: 10, textTransform: 'uppercase', letterSpacing: 1 },
  langContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 40, gap: 10 },
  langBtn: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0' },
  langBtnActive: { backgroundColor: '#facc15', borderColor: '#eab308' },
  langText: { fontWeight: 'black', fontSize: 11, color: '#1e293b' },
  modeToggleContainer: { flexDirection: 'row', gap: 12, marginBottom: 30, backgroundColor: '#f9fafb', padding: 4, borderRadius: 12 },
  modeToggleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10 },
  modeToggleBtnActive: { backgroundColor: '#0d6e3f' },
  modeToggleText: { fontSize: 13, color: '#666', marginLeft: 6, fontWeight: '600' },
  modeToggleTextActive: { color: '#ffffff' },
  form: { width: '100%' },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#f8fafc', 
    padding: 18, 
    borderRadius: 20, 
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#f1f5f9'
  },
  input: { flex: 1, marginLeft: 12, fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
  errorContainer: { backgroundColor: '#fee2e2', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, marginBottom: 16 },
  errorText: { color: '#dc2626', fontSize: 13, fontWeight: '500' },
  demoGrid: { flexDirection: 'row', gap: 12, marginTop: 12 },
  loginBtn: { 
    padding: 18, 
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5
  },
  apiBtn: {
    backgroundColor: '#0d6e3f',
    padding: 22,
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#0d6e3f', shadowOpacity: 0.4, shadowRadius: 20, elevation: 15
  },
  apiBtnDisabled: {
    opacity: 0.6,
  },
  loginBtnText: { color: 'white', fontSize: 14, fontWeight: 'black', textTransform: 'uppercase', letterSpacing: 1 },
  bioBtn: {
    backgroundColor: '#f0fdf4',
    padding: 20,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 2,
    borderColor: '#0d6e3f',
    borderStyle: 'dashed'
  },
  bioBtnText: { color: '#0d6e3f', fontSize: 15, fontWeight: 'black', marginLeft: 12, textTransform: 'uppercase', letterSpacing: 0.5 }
});

export default LoginScreen;
