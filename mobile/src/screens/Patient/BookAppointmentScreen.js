import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { User, ChevronLeft, CheckCircle } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { appointmentService, userService } from '../../services/api';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

export default function BookAppointmentScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [doctorPhone, setDoctorPhone] = useState('');
  const [doctor, setDoctor] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('09:00');
  const [reason, setReason] = useState('');
  const [facility, setFacility] = useState('');
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [success, setSuccess] = useState(false);

  const searchDoctor = async () => {
    if (!doctorPhone.trim()) return;
    setSearching(true);
    try {
      let cleanPhone = doctorPhone.replace(/\s+/g, '');
      if (!cleanPhone.startsWith('+')) cleanPhone = '+226' + cleanPhone.replace(/^226/, '');
      const doctorResult = await userService.findPatient(cleanPhone);
      if (doctorResult) {
        setDoctor(doctorResult);
      } else {
        Alert.alert(t('non_trouve'), t('utilisateur_non_trouve'));
      }
    } catch (err) {
      if (__DEV__) console.warn('Search doctor error:', err);
      Alert.alert(t('erreur'), t('utilisateur_non_trouve_verifiez'));
    } finally {
      setSearching(false);
    }
  };

  const handleBook = async () => {
    if (!doctor) { Alert.alert(t('erreur'), t('veuillez_rechercher_medecin')); return; }
    if (!date || !time) { Alert.alert(t('erreur'), t('veuillez_choisir_date_heure')); return; }
    setLoading(true);
    try {
      await appointmentService.create({
        doctorId: doctor.id,
        date,
        time,
        reason,
        facility,
      });
      setSuccess(true);
    } catch (err) {
      Alert.alert(t('erreur'), t('impossible_creer_rdv'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: 30 }}>
        <CheckCircle color="#10b981" size={80} />
        <Text style={{ fontSize: 24, fontWeight: '900', color: colors.text, marginTop: 20 }}>{t('rdv_envoye')}</Text>
        <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 10, lineHeight: 22 }}>
          {t('demande_transmise', { name: doctor?.name })}
        </Text>
        <TouchableOpacity
          style={{ marginTop: 30, backgroundColor: colors.primary, padding: 18, borderRadius: 16, paddingHorizontal: 50 }}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ color: '#fff', fontWeight: '900', fontSize: 15 }}>{t('retour')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>{t('nouveau_rendez_vous')}</Text>
      </View>

      <View style={styles.form}>
        <Text style={[styles.label, { color: colors.text }]}>{t('medecin_label')}</Text>
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
          <TextInput
            style={[styles.input, { flex: 1, backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            placeholder={t('numero_medecin')}
            placeholderTextColor={colors.textSecondary}
            value={doctorPhone}
            onChangeText={(v) => { setDoctorPhone(v); setDoctor(null); }}
            keyboardType="phone-pad"
          />
          <TouchableOpacity style={[styles.searchBtn, { backgroundColor: colors.primary }]} onPress={searchDoctor} disabled={searching}>
            {searching ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '900', fontSize: 13 }}>{t('chercher')}</Text>}
          </TouchableOpacity>
        </View>
        {doctor && (
          <View style={[styles.doctorBadge, { backgroundColor: '#f0fdf4', borderColor: '#86efac' }]}>
            <User color="#10b981" size={16} />
            <Text style={{ color: '#065f46', fontWeight: '700' }}>Dr. {doctor.name}</Text>
          </View>
        )}

        <Text style={[styles.label, { color: colors.text, marginTop: 20 }]}>{t('date_label')}</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
          value={date}
          onChangeText={setDate}
          placeholder="YYYY-MM-DD"
        />

        <Text style={[styles.label, { color: colors.text, marginTop: 20 }]}>{t('heure_label')}</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
          value={time}
          onChangeText={setTime}
          placeholder="HH:MM"
        />

        <Text style={[styles.label, { color: colors.text, marginTop: 20 }]}>{t('motif_optionnel')}</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border, height: 80, textAlignVertical: 'top' }]}
          value={reason}
          onChangeText={setReason}
          placeholder={t('raison_consultation')}
          multiline
        />

        <Text style={[styles.label, { color: colors.text, marginTop: 20 }]}>{t('etablissement_optionnel')}</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
          value={facility}
          onChangeText={setFacility}
          placeholder={t('csps_cma_chu')}
        />

        <TouchableOpacity
          style={[styles.bookBtn, { backgroundColor: colors.primary, opacity: loading ? 0.6 : 1 }]}
          onPress={handleBook}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.bookBtnText}>{t('prendre_rdv')}</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { padding: 25, paddingTop: 60, flexDirection: 'row', alignItems: 'center', gap: 16 },
  backBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12 },
  title: { color: '#fff', fontSize: 20, fontWeight: '900' },
  form: { padding: 20 },
  label: { fontSize: 13, fontWeight: '900', marginBottom: 8, textTransform: 'uppercase' },
  input: { padding: 16, borderRadius: 14, borderWidth: 1, fontSize: 15, fontWeight: '600' },
  searchBtn: { padding: 16, borderRadius: 14 },
  doctorBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10, padding: 12, borderRadius: 12, borderWidth: 1 },
  bookBtn: { marginTop: 30, padding: 18, borderRadius: 16, alignItems: 'center' },
  bookBtnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
});
