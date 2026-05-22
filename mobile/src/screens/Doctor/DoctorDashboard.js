import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, ScrollView } from 'react-native';
import { Search, User, Plus, Video as VideoIcon, LogOut, Bell, AlertCircle, FileText } from 'lucide-react-native';

const safeDate = (d) => {
  if (!d) return '';
  try {
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? '' : dt.toLocaleDateString('fr-FR');
  } catch { return ''; }
};
import { FasoCareIcon } from '../../components/FasoCareIcon';
import SkeletonLoader from '../../components/SkeletonLoader';
import { medicalService, appointmentService } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';

export default function DoctorDashboard() {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const navigation = useNavigation();
  const { isDarkMode, colors } = useTheme();
  const [search, setSearch] = useState('');
  const [patients, setPatients] = useState([]);
  const [doctorStats, setDoctorStats] = useState({ consultations: 0, prescriptions: 0 });
  const [loading, setLoading] = useState(true);
  const [showAlerts, setShowAlerts] = useState(false);
  const [clinicalAlerts, setClinicalAlerts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [appointments, setAppointments] = useState([]);

  const loadDashboardData = useCallback(async () => {
    try {
      setError(null);
      const [queueData, notifData, doctorConsults, apts] = await Promise.all([
        medicalService.getLatestPatients(),
        medicalService.getNotifications(),
        medicalService.getDoctorConsultations(user?.id),
        appointmentService.getDoctorAppointments().catch(e => {
          const status = e?.response?.status;
          let msg = t('impossible_charger_donnees');
          if (status === 401) {
            msg = t('impossible_charger_donnees');
          } else if (status === 403) {
            msg = 'Rendez-vous non disponibles — votre rôle ne permet pas d\'accéder aux rendez-vous. Complétez votre inscription avec le rôle Médecin.';
          }
          console.warn('Échec chargement rendez-vous:', status, e?.message);
          setError(msg);
          return [];
        }),
      ]);
      setAppointments(Array.isArray(apts) ? apts : []);
      const queueArray = Array.isArray(queueData) ? queueData : queueData?.data || [];
      setPatients(queueArray);
      setDoctorStats({
        consultations: Array.isArray(doctorConsults) ? doctorConsults.length : 0,
        prescriptions: Array.isArray(doctorConsults) ? doctorConsults.filter(c => c.qr_token).length : 0,
      });
      setNotifications(notifData || []);

      const triageAlerts = queueArray.filter(p => p && (
          p.urgencyLevel === 'URGENT' || parseInt(p?.bloodPressure?.split('/')[0] || '0') > 160 || (p?.pulse || 0) > 120
      )).map(p => ({
          id: p?.id,
          type: 'TRIAGE',
          title: `${t('alerte_triage')}: ${p?.patient?.name || t('anonyme')}`,
          message: `${t('parametres_critiques')}: BP ${p?.bloodPressure}, ${t('pouls')} ${p?.pulse}.`
      }));
      setClinicalAlerts([...triageAlerts]);
    } catch (err) {
      if (__DEV__) console.warn('Failed to load dashboard data', err);
      setError(t('impossible_charger_donnees'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDashboardData();
  }, [loadDashboardData]);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    loadDashboardData();
  }, [loadDashboardData]));

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Modal visible={showAlerts} transparent animationType="fade">
        <View style={styles.modalOverlay}>
           <View style={[styles.modalContent, {backgroundColor: colors.card}]}>
               <Text style={[styles.modalTitle, {color: colors.text}]}>{t('alertes_cliniques')}</Text>
              
              {clinicalAlerts.length === 0 && notifications.length === 0 ? (
                 <Text style={{color: colors.textSecondary, textAlign: 'center', marginVertical: 20}}>{t('aucune_alerte_critique')}</Text>
              ) : (
                <ScrollView style={{maxHeight: 400, width: '100%'}}>
                  {clinicalAlerts.map((alert, idx) => (
                    <View key={`triage-${idx}`} style={[styles.alertItem, {borderLeftColor: colors.accent}]}>
                       <Text style={{color: colors.accent, fontWeight: '900', fontSize: 10, textTransform: 'uppercase'}}>{t('triage')}</Text>
                      <Text style={{color: colors.text, fontSize: 13, fontWeight: '700', marginTop: 4}}>{alert.message}</Text>
                    </View>
                  ))}
                  {notifications.map((n, idx) => (
                    <View key={`system-${idx}`} style={[styles.alertItem, {borderLeftColor: colors.primary}]}>
                       <Text style={{color: colors.primary, fontWeight: '900', fontSize: 10, textTransform: 'uppercase'}}>{t('systeme')}</Text>
                      <Text style={{color: colors.text, fontSize: 13, fontWeight: '700', marginTop: 4}}>{String(n.title || '')}: {String(n.content || '')}</Text>
                    </View>
                  ))}
                </ScrollView>
              )}

              <TouchableOpacity style={[styles.closeBtn, {backgroundColor: colors.primary}]} onPress={() => setShowAlerts(false)}>
                 <Text style={{color: 'white', fontWeight: '900'}}>{t('fermer')}</Text>
              </TouchableOpacity>
           </View>
        </View>
      </Modal>

      {user?.roles?.[0] === 'DOCTOR' && user?.isVerified === false && (
        <View style={{ backgroundColor: '#fef3c7', padding: 12, marginHorizontal: 20, borderRadius: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#fcd34d' }}>
          <AlertCircle color="#d97706" size={18} />
          <Text style={{ color: '#92400e', fontSize: 12, fontWeight: '600', flex: 1 }}>
            {t('compte_verification_msg')}
          </Text>
        </View>
      )}

      <View style={{ maxWidth: 800, alignSelf: 'center', width: '100%', flex: 1 }}>
        <View style={[styles.header, {paddingTop: 60}]}>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
            <FasoCareIcon size={40} />
            <View>
              <Text style={[styles.welcome, {color: colors.text}]}>{t('poste_clinique')}</Text>
              <Text style={[styles.subWelcome, {color: colors.textSecondary}]}>
                {user?.gender === 'F' ? 'Mme. ' : (user?.gender === 'M' ? 'M. ' : 'Dr. ')}
                {user?.name || user?.phone}
              </Text>
            </View>
          </View>
          <View style={{flexDirection: 'row', gap: 10}}>
            <TouchableOpacity onPress={() => setShowAlerts(true)} style={[styles.iconButton, {backgroundColor: colors.card, borderColor: colors.border}]}>
              <Bell color={colors.primary} size={22} />
              {(clinicalAlerts.length > 0 || notifications.length > 0) && <View style={styles.badge} />}
            </TouchableOpacity>
            <TouchableOpacity onPress={logout} style={[styles.iconButton, {backgroundColor: colors.card, borderColor: colors.border}]}>
              <LogOut color={colors.accent} size={22} />
            </TouchableOpacity>
          </View>
        </View>

        {error && (
          <View style={{ marginHorizontal: 20, marginBottom: 15, padding: 12, backgroundColor: '#fef2f2', borderRadius: 12, borderWidth: 1, borderColor: '#fecaca' }}>
            <Text style={{ color: '#dc2626', fontSize: 13, fontWeight: '600' }}>{error}</Text>
          </View>
        )}

        {/* KPI Grid Professionnel */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, {backgroundColor: colors.card, borderColor: colors.border}]}>
            <User color={colors.primary} size={20} />
            <Text style={[styles.statValue, {color: colors.text}]}>{doctorStats.consultations}</Text>
            <Text style={styles.statLabel}>{t('consultations')}</Text>
          </View>
          <View style={[styles.statCard, {backgroundColor: colors.card, borderColor: colors.border}]}>
            <FileText color="#0284c7" size={20} />
            <Text style={[styles.statValue, {color: colors.text}]}>{doctorStats.prescriptions}</Text>
            <Text style={styles.statLabel}>{t('ordonnances')}</Text>
          </View>
          <View style={[styles.statCard, {backgroundColor: colors.card, borderColor: colors.border}]}>
            <VideoIcon color="#7c3aed" size={20} />
            <Text style={[styles.statValue, {color: colors.text}]}>{patients.filter(p => p.urgencyLevel === 'URGENT').length}</Text>
            <Text style={styles.statLabel}>{t('file_attente')}</Text>
          </View>
          <TouchableOpacity 
            onPress={() => navigation.navigate('EpidemicReport')}
            style={[styles.statCard, {backgroundColor: isDarkMode ? '#450a0a' : '#fef2f2', borderColor: '#ef4444'}]}
          >
            <AlertCircle color="#ef4444" size={20} />
            <Text style={[styles.statValue, {color: colors.text}]}>{clinicalAlerts.length}</Text>
            <Text style={[styles.statLabel, {color: '#ef4444'}]}>{t('alertes')}</Text>
          </TouchableOpacity>
        </View>

        {appointments.filter(a => a.status === 'PENDING' || a.status === 'CONFIRMED').length > 0 && (
          <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
            <Text style={[styles.sectionTitle, {color: colors.text}]}>
              {t('rendez_vous_patients')}
              <Text style={{color: colors.accent, fontSize: 14}}>{' '}({appointments.filter(a => a.status === 'PENDING').length} {t('en_attente_label')})</Text>
            </Text>
            {appointments
              .filter(a => a.status === 'PENDING' || a.status === 'CONFIRMED')
              .slice(0, 5)
              .map((item) => (
                <View key={item.id} style={[styles.patientCard, {backgroundColor: colors.card, borderColor: colors.border}]}>
                  <View style={[styles.patientIcon, {backgroundColor: item.status === 'CONFIRMED' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)'}]}>
                    <User color={item.status === 'CONFIRMED' ? '#10b981' : '#f59e0b'} size={22} />
                  </View>
                  <View style={styles.patientInfo}>
                    <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                      <Text style={[styles.patientName, {color: colors.text}]}>
                        {item.patient?.gender === 'F' ? 'Mme. ' : (item.patient?.gender === 'M' ? 'M. ' : '')}
                        {item.patient?.name || t('patient_fallback')}
                      </Text>
                      <View style={[styles.urgencyBadge, {backgroundColor: item.status === 'CONFIRMED' ? '#10b981' : '#f59e0b'}]}>
                        <Text style={styles.urgencyText}>{item.status === 'CONFIRMED' ? t('confirme') : t('attente')}</Text>
                      </View>
                    </View>
                    <Text style={[styles.patientDetail, {color: colors.textSecondary}]}>
                      {safeDate(item.date)} · {item.time || ''}{item.reason ? ` · ${item.reason}` : ''}
                    </Text>
                    <View style={{flexDirection: 'row', gap: 8, marginTop: 10}}>
                      {item.status === 'PENDING' && (
                        <>
                          <TouchableOpacity
                            style={{backgroundColor: '#10b981', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10}}
                            onPress={async () => {
                              try {
                                await appointmentService.confirm(item.id);
                                loadDashboardData();
                              } catch (e) {
                                if (__DEV__) console.warn('Confirm failed', e?.message);
                              }
                            }}
                          >
                            <Text style={{color: 'white', fontWeight: '900', fontSize: 12}}>{t('confirmer_rdv')}</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={{backgroundColor: '#ef4444', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10}}
                            onPress={async () => {
                              try {
                                await appointmentService.cancel(item.id);
                                loadDashboardData();
                              } catch (e) {
                                if (__DEV__) console.warn('Cancel failed', e?.message);
                              }
                            }}
                          >
                            <Text style={{color: 'white', fontWeight: '900', fontSize: 12}}>{t('refuser_rdv')}</Text>
                          </TouchableOpacity>
                        </>
                      )}
                      {item.status === 'CONFIRMED' && (
                        <TouchableOpacity
                          style={{backgroundColor: '#6366f1', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10}}
                          onPress={async () => {
                            try {
                              await appointmentService.complete(item.id);
                              loadDashboardData();
                            } catch (e) {
                              if (__DEV__) console.warn('Complete failed', e?.message);
                            }
                          }}
                        >
                          <Text style={{color: 'white', fontWeight: '900', fontSize: 12}}>{t('completer_rdv')}</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              ))}
          </View>
        )}

        <View style={[styles.searchBox, {backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1}]}>
          <Search color={colors.textSecondary} size={20} style={styles.searchIcon} />
          <TextInput 
            style={[styles.searchInput, {color: colors.text}]} 
            placeholder={t('search_patient')}
            placeholderTextColor={colors.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <Text style={[styles.sectionTitle, {color: colors.text, paddingHorizontal: 25}]}>{t('file_attente_jour')}</Text>
        
        {loading ? (
          <SkeletonLoader />
        ) : (
          <FlatList
            data={patients.filter(p => (p.patient?.name || p.patient?.phone || '').toLowerCase().includes(search.toLowerCase()))}
            contentContainerStyle={{paddingHorizontal: 20}}
            keyExtractor={(item) => item.id}
            refreshing={refreshing}
            onRefresh={onRefresh}
            ListEmptyComponent={() => (
              <View style={{ alignItems: 'center', padding: 40, marginTop: 20 }}>
                <Text style={{ color: colors.textSecondary, fontSize: 16, fontWeight: '600' }}>{search ? t('aucun_patient_recherche') : t('aucun_patient_file')}</Text>
              </View>
            )}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={[styles.patientCard, {backgroundColor: colors.card, borderColor: colors.border}]}
                onPress={() => navigation.navigate('PatientRecord', { 
                  patient: item.patient,
                  patientName: item.patient?.name || t('patient_fallback'), 
                  patientPhone: item.patient?.phone 
                })}
              >
                <View style={[styles.patientIcon, {backgroundColor: item.urgencyLevel === 'URGENT' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)'}]}>
                  <User color={item.urgencyLevel === 'URGENT' ? colors.accent : colors.primary} size={22} />
                </View>
                <View style={styles.patientInfo}>
                  <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                    <Text style={[styles.patientName, {color: colors.text}]}>
                        {item.patient?.gender === 'F' ? 'Mme. ' : (item.patient?.gender === 'M' ? 'M. ' : '')}
                        {item.patient?.name || t('anonyme')}
                    </Text>
                    <View style={[styles.urgencyBadge, {backgroundColor: item.urgencyLevel === 'URGENT' ? colors.accent : colors.success}]}>
                       <Text style={styles.urgencyText}>{item.urgencyLevel || 'NORMAL'}</Text>
                    </View>
                  </View>
                   <Text style={[styles.patientDetail, {color: colors.textSecondary}]}>{String(item.diagnosis || t('motif_non_specifie'))} · {safeDate(item.createdAt)}</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('Meeting', { patientName: item.patient?.name || item.patient?.phone })} style={styles.actionBtn}>
                  <VideoIcon color={colors.primary} size={22} />
                </TouchableOpacity>
              </TouchableOpacity>
            )}
              ListFooterComponent={() => (
                <View style={{ paddingBottom: 120 }} />
              )}
            />
          )}

        <TouchableOpacity style={[styles.fab, {backgroundColor: colors.primary}]} onPress={() => navigation.navigate('Ordonnances')}>
          <Plus color="#fff" size={32} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, marginBottom: 30 },
  welcome: { fontSize: 24, fontWeight: '900', letterSpacing: -1 },
  subWelcome: { fontSize: 13, fontWeight: 'bold', marginTop: 2 },
  iconButton: { padding: 12, borderRadius: 16, borderWidth: 1, position: 'relative' },
  badge: { position: 'absolute', top: 10, right: 10, width: 10, height: 10, backgroundColor: '#ef4444', borderRadius: 5, borderWidth: 2, borderColor: '#fff' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 20, marginBottom: 30 },
  statCard: { width: '47.5%', padding: 20, borderRadius: 28, borderWidth: 1, alignItems: 'flex-start' },
  statValue: { fontSize: 28, fontWeight: '900', marginTop: 10 },
  statLabel: { fontSize: 11, color: '#94a3b8', fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 },
  searchBox: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, borderRadius: 20, paddingHorizontal: 16, marginBottom: 30, height: 60 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 15, fontWeight: 'bold' },
  sectionTitle: { fontSize: 20, fontWeight: '900', marginBottom: 20, letterSpacing: -0.5 },
  patientCard: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 28, marginHorizontal: 20, marginBottom: 15, borderWidth: 1 },
  patientIcon: { padding: 14, borderRadius: 18, marginRight: 16 },
  patientInfo: { flex: 1 },
  patientName: { fontSize: 17, fontWeight: '900' },
  patientDetail: { fontSize: 13, marginTop: 4, fontWeight: '500' },
  urgencyBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  urgencyText: { color: 'white', fontSize: 9, fontWeight: '900' },
  actionBtn: { padding: 10, marginLeft: 10 },
  fab: { position: 'absolute', bottom: 35, right: 25, width: 70, height: 70, borderRadius: 35, justifyContent: 'center', alignItems: 'center', elevation: 10, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 15 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.8)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', padding: 30, borderRadius: 32, alignItems: 'center' },
  modalTitle: { fontSize: 22, fontWeight: '900', marginBottom: 20, letterSpacing: -0.5 },
  alertItem: { alignSelf: 'stretch', padding: 15, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.03)', marginBottom: 12, borderLeftWidth: 4 },
  closeBtn: { marginTop: 20, paddingHorizontal: 40, paddingVertical: 15, borderRadius: 15 }
});
