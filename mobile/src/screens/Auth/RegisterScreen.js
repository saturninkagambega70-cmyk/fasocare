import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Phone, Lock, User, ChevronRight, Stethoscope, Activity, Baby } from 'lucide-react-native';
import { authService } from '../../services/api';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/useAuthStore';

const ROLES = [
  { id: 'PATIENT', key: 'citoyen', icon: User },
  { id: 'DOCTOR', key: 'medecin', icon: Stethoscope },
  { id: 'PHARMACIST', key: 'pharmacie_role', icon: Activity },
  { id: 'PARENT', key: 'tuteur_legal', icon: Baby },
];

export default function RegisterScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { setUser, setToken, setRefreshToken } = useAuthStore();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('PATIENT');
  const [gender, setGender] = useState('M');

  const BF_PHONE_REGEX = /^(\+226)?[0-9]{8}$/;
  const MIN_PASSWORD_LENGTH = 8;

  const validateForm = () => {
    const errors = [];
    if (!name || name.trim().length < 2) {
      errors.push(t('nom_2_caracteres'));
    }
    if (!phone || !BF_PHONE_REGEX.test(phone.replace(/\s/g, ''))) {
      errors.push(t('numero_invalide'));
    }
    if (!password || password.length < MIN_PASSWORD_LENGTH) {
      errors.push(`${t('mdp_8_caracteres')} (${MIN_PASSWORD_LENGTH}).`);
    }
    return errors;
  };

  const handleRegister = async () => {
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      alert(validationErrors.join('\n'));
      return;
    }

    try {
      const data = await authService.register({ name, phone, password, roles: [role], gender });

      if (data.access_token) {
        setToken(data.access_token);
        if (data.refresh_token) setRefreshToken(data.refresh_token);
        setUser(data.user);
        alert(t('bienvenue_fasocare_inscription'));
      }
    } catch (error) {
      let errorMsg = error.response?.data?.message || error.message;
      if (error.message === 'Network Error' || errorMsg.includes('Network Error')) {
        errorMsg = t('probleme_reseau_message');
      }
      alert(t('erreur_connexion_message') + " " + errorMsg);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>{t('create_account')}</Text>
          <Text style={styles.subtitle}>{t('register_subtitle')}</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>{t('je_suis_un')}</Text>
          <View style={styles.roleGrid}>
            {ROLES.map((r) => {
              const Icon = r.icon;
              return (
                <TouchableOpacity 
                  key={r.id} 
                  style={[styles.roleBtn, role === r.id && styles.roleBtnActive]} 
                  onPress={() => setRole(r.id)}
                >
                  <Icon size={20} color={role === r.id ? '#FFF' : '#64748b'} />
                  <Text style={[styles.roleBtnText, role === r.id && styles.roleBtnTextActive]}>{t(r.key)}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

        <View style={styles.inputContainer}>
          <User size={20} color="#666" />
          <TextInput style={styles.input} placeholder={t('name_placeholder')} value={name} onChangeText={setName} />
        </View>

        <View style={styles.genderRow}>
          <TouchableOpacity 
            style={[styles.genderBtn, gender === 'M' && styles.genderBtnActive]} 
            onPress={() => setGender('M')}
          >
            <Text style={[styles.genderBtnText, gender === 'M' && styles.genderBtnTextActive]}>{t('homme_m')}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.genderBtn, gender === 'F' && styles.genderBtnActive]} 
            onPress={() => setGender('F')}
          >
            <Text style={[styles.genderBtnText, gender === 'F' && styles.genderBtnTextActive]}>{t('femme_f')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Phone size={20} color="#666" />
          <TextInput style={styles.input} placeholder={t('phone')} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        </View>

        <View style={styles.inputContainer}>
          <Lock size={20} color="#666" />
          <TextInput style={styles.input} placeholder={t('password')} value={password} onChangeText={setPassword} secureTextEntry />
        </View>

        <TouchableOpacity style={styles.btn} onPress={handleRegister}>
          <Text style={styles.btnText}>{t('create_account')}</Text>
          <ChevronRight color="white" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{marginTop: 20}}>
          <Text style={{textAlign: 'center', color: '#009E49', fontWeight:'bold'}}>{t('already_registered')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#F8F9FA', padding: 20, justifyContent: 'center' },
  header: { marginBottom: 30 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#1e293b' },
  subtitle: { fontSize: 16, color: '#64748b', marginTop: 5 },
  form: { width: '100%' },
  label: { fontSize: 14, fontWeight: 'bold', color: '#64748b', marginBottom: 10, marginLeft: 5 },
  roleGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  roleBtn: { 
    width: '48%', backgroundColor: 'white', padding: 12, borderRadius: 12, 
    flexDirection: 'row', alignItems: 'center', marginBottom: 10,
    borderWidth: 1, borderColor: '#e2e8f0'
  },
  roleBtnActive: { backgroundColor: '#009E49', borderColor: '#009E49' },
  roleBtnText: { marginLeft: 8, fontSize: 13, fontWeight: '600', color: '#64748b' },
  roleBtnTextActive: { color: 'white' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 15, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#EEE' },
  input: { flex: 1, marginLeft: 10, fontSize: 16 },
  btn: { backgroundColor: '#009E49', padding: 18, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  btnText: { color: 'white', fontSize: 16, fontWeight: 'bold', marginRight: 5 },
  genderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, gap: 10 },
  genderBtn: { flex: 1, backgroundColor: 'white', padding: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  genderBtnActive: { backgroundColor: '#1e293b', borderColor: '#1e293b' },
  genderBtnText: { fontSize: 13, fontWeight: 'bold', color: '#64748b' },
  genderBtnTextActive: { color: 'white' }
});
