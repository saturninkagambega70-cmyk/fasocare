import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { authService } from '../../services/api';
import { Phone, ArrowRight } from 'lucide-react-native';

export default function ForgotPasswordScreen({ navigation }) {
  const { t } = useTranslation();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestOTP = async () => {
    if (!phone) {
      Alert.alert("Erreur", "Veuillez entrer votre numéro de téléphone");
      return;
    }
    setLoading(true);
    try {
      await authService.forgotPassword(phone);
      Alert.alert(t('otp_sent'), "Vérifiez vos messages.");
      navigation.navigate('ResetPassword', { phone });
    } catch (error) {
      Alert.alert("Erreur", "Impossible d'envoyer le code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('forgot_password')}</Text>
      <Text style={styles.subtitle}>Entrez votre numéro pour recevoir un code de réinitialisation.</Text>

      <View style={styles.inputContainer}>
        <Phone color="#64748b" size={20} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder={t('phone')}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleRequestOTP} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <>
            <Text style={styles.buttonText}>{t('confirm')}</Text>
            <ArrowRight color="white" size={20} />
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Text style={styles.backText}>{t('cancel')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 30, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1a4a2e', marginBottom: 10 },
  subtitle: { fontSize: 15, color: '#64748b', marginBottom: 30 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 12, paddingHorizontal: 15, marginBottom: 20 },
  icon: { marginRight: 10 },
  input: { flex: 1, height: 55, fontSize: 16, color: '#1e293b' },
  button: { backgroundColor: '#009E49', height: 55, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 10 },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  backBtn: { marginTop: 20, alignSelf: 'center' },
  backText: { color: '#64748b', fontWeight: 'bold' }
});
