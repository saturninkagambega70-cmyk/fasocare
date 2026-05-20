import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { Calendar, Clock, User, CheckCircle, XCircle, Plus } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { appointmentService } from '../../services/api';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

export default function AppointmentScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadAppointments = useCallback(async (isRefresh = false) => {
    try {
      setError(null);
      if (isRefresh) setRefreshing(true);
      const data = await appointmentService.getMyAppointments();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(t('impossible_charger_rdv'));
      if (__DEV__) console.warn('Failed to load appointments', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    loadAppointments();
  }, [loadAppointments]));

  const handleCancel = async (id) => {
    try {
      await appointmentService.cancel(id);
      loadAppointments();
    } catch (err) {
      Alert.alert(t('erreur'), t('impossible_annuler_rdv'));
    }
  };

  const statusColor = (status) => {
    switch (status) {
      case 'PENDING': return '#f59e0b';
      case 'CONFIRMED': return '#10b981';
      case 'COMPLETED': return '#3b82f6';
      case 'CANCELLED': return '#ef4444';
      default: return '#94a3b8';
    }
  };

  const statusLabel = (status) => {
    switch (status) {
      case 'PENDING': return t('en_attente_label');
      case 'CONFIRMED': return t('confirme');
      case 'COMPLETED': return t('terminer');
      case 'CANCELLED': return t('annule');
      default: return status;
    }
  };

  if (error && !loading && appointments.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <Text style={styles.title}>{t('mes_rendez_vous')}</Text>
          <Text style={styles.subtitle}>{t('planifier_consultations')}</Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
          <Calendar color={colors.accent} size={48} />
          <Text style={{ color: colors.accent, marginTop: 12, fontSize: 16, textAlign: 'center', fontWeight: '600' }}>
            {error}
          </Text>
          <TouchableOpacity 
            style={{ marginTop: 20, backgroundColor: colors.primary, paddingHorizontal: 30, paddingVertical: 12, borderRadius: 12 }}
            onPress={() => { setLoading(true); loadAppointments(); }}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>{t('reessayer')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.title}>{t('mes_rendez_vous')}</Text>
        <Text style={styles.subtitle}>{t('planifier_consultations')}</Text>
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 50 }} />
      ) : appointments.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
          <Calendar color={colors.textSecondary} size={48} />
          <Text style={{ color: colors.textSecondary, marginTop: 12, fontSize: 16, textAlign: 'center' }}>
            {t('aucun_rdv')}
          </Text>
          <TouchableOpacity 
            style={{ marginTop: 20, paddingHorizontal: 24, paddingVertical: 10, backgroundColor: colors.primary, borderRadius: 12 }}
            onPress={() => navigation.navigate('BookAppointment')}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>{t('prendre_rdv_action')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView 
          style={{ padding: 20 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => loadAppointments(true)} colors={['#009E49']} />
          }
        >
          {appointments.map((item) => (
            <View key={item.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.cardHeader}>
                <View style={[styles.statusDot, { backgroundColor: statusColor(item.status) }]} />
                <Text style={[styles.statusLabel, { color: statusColor(item.status) }]}>
                  {statusLabel(item.status)}
                </Text>
              </View>
              <View style={styles.cardBody}>
                <View style={styles.row}>
                  <Calendar size={16} color={colors.primary} />
                  <Text style={[styles.rowText, { color: colors.text }]}>{new Date(item.date).toLocaleDateString('fr-FR')}</Text>
                </View>
                <View style={styles.row}>
                  <Clock size={16} color={colors.primary} />
                  <Text style={[styles.rowText, { color: colors.text }]}>{item.time}</Text>
                </View>
                <View style={styles.row}>
                  <User size={16} color={colors.primary} />
                  <Text style={[styles.rowText, { color: colors.text }]}>Dr. {item.doctor?.name || t('medecin')}</Text>
                </View>
                {item.reason && (
                  <Text style={[styles.reason, { color: colors.textSecondary }]}>{item.reason}</Text>
                )}
              </View>
              {item.status === 'PENDING' && (
                <TouchableOpacity style={styles.cancelBtn} onPress={() => handleCancel(item.id)}>
                  <XCircle color="#ef4444" size={18} />
                  <Text style={styles.cancelText}>{t('annuler')}</Text>
                </TouchableOpacity>
              )}
              {item.status === 'CONFIRMED' && (
                <View style={[styles.confirmedBadge, { backgroundColor: '#d1fae5' }]}>
                  <CheckCircle color="#10b981" size={16} />
                  <Text style={{ color: '#065f46', fontWeight: '700', fontSize: 12 }}>{t('rdv_confirme')}</Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      )}

      <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate('BookAppointment')}>
        <Plus color="#fff" size={28} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { padding: 25, paddingTop: 60, alignItems: 'center' },
  title: { color: '#fff', fontSize: 24, fontWeight: '900' },
  subtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4 },
  card: { padding: 18, borderRadius: 20, borderWidth: 1, marginBottom: 15, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusLabel: { fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  cardBody: { gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowText: { fontSize: 14, fontWeight: '600' },
  reason: { fontSize: 13, marginTop: 4, fontStyle: 'italic' },
  cancelBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, padding: 8, borderRadius: 10, backgroundColor: '#fef2f2', alignSelf: 'flex-start' },
  cancelText: { color: '#ef4444', fontWeight: '700', fontSize: 12 },
  confirmedBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, padding: 8, borderRadius: 10, alignSelf: 'flex-start' },
  fab: { position: 'absolute', bottom: 30, right: 20, width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10, zIndex: 100 },
});
