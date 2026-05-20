import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { authService } from '../../services/api';
import { Lock, Hash, ShieldCheck } from 'lucide-react-native';

export default function ResetPasswordScreen({ route, navigation }) {
  const { t } = useTranslation();
  const { phone } = route.params;
  const [otp, setOtp] = useState('');
  const [newPass, setNewPass] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!otp || !newPass) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs.");
      return;
    }
    setLoading(true);
    try {
      await authService.resetPassword(phone, otp, newPass);
      Alert.alert("Succès", "Votre mot de passe a été réinitialisé !");
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert("Erreur", "Code invalide ou expiré.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('reset_password')}</Text>
      <Text style={styles.subtitle}>Saisissez le code à 6 chiffres reçu par SMS pour {phone}.</Text>

      <View style={styles.inputContainer}>
        <Hash color="#64748b" size={20} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder={t('otp_label')}
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
          maxLength={6}
        />
      </View>

      <View style={styles.inputContainer}>
        <Lock color="#64748b" size={20} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder={t('new_password_placeholder')}
          value={newPass}
          onChangeText={setNewPass}
          secureTextEntry
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleReset} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <>
            <Text style={styles.buttonText}>{t('confirm')}</Text>
            <ShieldCheck color="white" size={20} />
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
  title: { fontSize: 26, fontWeight: 'bold', color: '#1a4a2e', marginBottom: 10 },
  subtitle: { fontSize: 13, color: '#64748b', marginBottom: 30 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 12, paddingHorizontal: 15, marginBottom: 15 },
  icon: { marginRight: 10 },
  input: { flex: 1, height: 55, fontSize: 16, color: '#1e293b' },
  button: { backgroundColor: '#009E49', height: 55, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 15 },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  backBtn: { marginTop: 20, alignSelf: 'center' },
  backText: { color: '#64748b', fontWeight: 'bold' }
});
