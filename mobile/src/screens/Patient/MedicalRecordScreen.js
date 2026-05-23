import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Modal, Alert } from 'react-native';
import { FileText, ChevronRight, Clock, Stethoscope, Pill, QrCode, X, Check, AlertTriangle } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { medicalService, userService } from '../../services/api';
import QRCode from 'react-native-qrcode-svg';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

export default function MedicalRecordScreen() {
  const { t } = useTranslation();
  const { isDarkMode, colors } = useTheme();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedItems, setSelectedItems] = useState(null);
  const [treatmentLogs, setTreatmentLogs] = useState(null);
  const [loadingTreatment, setLoadingTreatment] = useState(false);
  const navigation = useNavigation();

  const loadTreatmentLogs = async (consultationId) => {
    setLoadingTreatment(true);
    try {
      const logs = await medicalService.getConsultationTreatmentLogs(consultationId);
      setTreatmentLogs(Array.isArray(logs) ? logs : []);
    } catch { setTreatmentLogs([]); }
    setLoadingTreatment(false);
  };

  const handleTakeDose = async (logId, status) => {
    try {
      await medicalService.updateTreatmentLogStatus(logId, status);
      if (selectedRecord) loadTreatmentLogs(selectedRecord.id);
    } catch (err) {
      Alert.alert(t('erreur'), t('impossible_maj_statut'));
    }
  };

  const handleGenerateTreatment = async () => {
    if (!selectedRecord?.id || !selectedItems?.length) return;
    setLoadingTreatment(true);
    try {
      await medicalService.generateTreatmentLogs(selectedRecord.id);
      await loadTreatmentLogs(selectedRecord.id);
    } catch (err) {
      Alert.alert(t('erreur'), t('impossible_generer_suivi'));
    }
    setLoadingTreatment(false);
  };

  const closeModal = () => {
    setSelectedRecord(null);
    setSelectedItems(null);
    setTreatmentLogs(null);
  };

  const loadData = async () => {
    try {
      const data = await medicalService.getHistory();
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      if (__DEV__) console.error("Error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  const consultations = history;
  const vaccinations = history.flatMap(c => c.vaccinations || []);

  return (
    <ScrollView style={[s.container, {backgroundColor: '#f8fafc'}]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={s.header}>
        <Stethoscope size={28} color="#0d6e3f" />
        <View>
          <Text style={s.title}>{t('dossier_medical')}</Text>
          <Text style={s.subtitle}>{t('burkina_faso')}</Text>
        </View>
      </View>

      {/* Stats rapides */}
      <View style={s.statsRow}>
        <View style={s.statCard}>
          <FileText size={22} color="#0d6e3f" />
          <Text style={s.statValue}>{consultations.length}</Text>
          <Text style={s.statLabel}>{t('consultations')}</Text>
        </View>
        <View style={s.statCard}>
          <Pill size={22} color="#2563eb" />
          <Text style={s.statValue}>{consultations.filter(c => c.qr_token).length}</Text>
          <Text style={s.statLabel}>{t('ordonnances')}</Text>
        </View>
        <View style={s.statCard}>
          <Clock size={22} color="#7c3aed" />
          <Text style={s.statValue}>{vaccinations.length}</Text>
          <Text style={s.statLabel}>{t('vaccins')}</Text>
        </View>
      </View>

      {/* Consultations */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>{t('consultations')}</Text>
        {loading ? <ActivityIndicator color="#0d6e3f" style={{marginVertical: 20}} /> :
         consultations.length === 0 ? (
          <View style={s.emptyBox}>
            <FileText size={36} color="#cbd5e1" />
            <Text style={s.emptyText}>{t('aucune_consultation')}</Text>
            <Text style={s.emptySub}>{t('consulter_medecin_suivi')}</Text>
          </View>
        ) : consultations.map((item) => (
          <TouchableOpacity key={item.id} style={s.recordItem}
            onPress={async () => {
              setSelectedRecord(item);
              if (item.id) {
                try {
                  const its = await medicalService.getConsultationItemsById(item.id);
                  setSelectedItems(Array.isArray(its) ? its : []);
                } catch { setSelectedItems([]); }
                loadTreatmentLogs(item.id);
              }
            }}
          >
            <View style={s.recordLeft}>
              <View style={[s.recordDot, {backgroundColor: item.qr_token ? '#0d6e3f' : '#94a3b8'}]} />
              <View style={{flex: 1}}>
                <Text style={s.recordTitle}>{item.diagnosis || t('consultation')}</Text>
                <Text style={s.recordDate}>{new Date(item.createdAt).toLocaleDateString('fr-FR')}</Text>
                {item.doctor?.name && <Text style={s.recordDoctor}>Dr. {item.doctor.name}</Text>}
              </View>
              {item.isDispensed && (
                <View style={[s.qrBadge, {backgroundColor: '#d1fae5'}]}>
                  <Text style={{fontSize: 10, fontWeight: '900', color: '#059669'}}>{t('delivree')}</Text>
                </View>
              )}
              {item.qr_token && (
                <View style={s.qrBadge}>
                  <QrCode size={14} color="#0d6e3f" />
                  <Text style={s.qrBadgeText}>QR</Text>
                </View>
              )}
            </View>
            <ChevronRight size={18} color="#94a3b8" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Modal Ordonnance QR */}
      <Modal visible={!!selectedRecord} transparent animationType="slide">
        <View style={s.overlay}>
          <ScrollView style={s.modalScroll} contentContainerStyle={s.modalScrollContent}>
            <View style={s.modalContent}>
              {/* Top close button */}
              <TouchableOpacity style={s.closeTop} onPress={closeModal}>
                <X size={22} color="#1e293b" />
              </TouchableOpacity>

              <Text style={s.modalTitle}>{t('ordonnance_numérique')}</Text>
              <View style={s.qrBox}>
                <QRCode value={selectedRecord?.qr_token || ""} size={200} color="#0f172a" backgroundColor="#fff" />
              </View>
              <Text style={s.qrToken}>{selectedRecord?.qr_token}</Text>
              <View style={s.consultInfo}>
                <Text style={s.consultInfoLabel}>{t('diagnosis_label')}</Text>
                <Text style={s.consultInfoValue}>{selectedRecord?.diagnosis || t('non_specifie')}</Text>
                <Text style={[s.consultInfoLabel, {marginTop: 10}]}>{t('prescrit_par')}</Text>
                <Text style={s.consultInfoValue}>Dr. {selectedRecord?.doctor?.name || t('medecin')}</Text>
                <Text style={[s.consultInfoLabel, {marginTop: 10}]}>{t('date_label')}</Text>
                <Text style={s.consultInfoValue}>{new Date(selectedRecord?.createdAt).toLocaleDateString('fr-FR')}</Text>

                {selectedRecord?.prescription && (
                  <View style={{marginTop: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 12}}>
                    <Text style={[s.consultInfoLabel, {marginBottom: 8}]}>{t('ordonnances')}</Text>
                    {selectedRecord?.isDispensed && (
                      <Text style={{fontSize: 12, fontWeight: 'bold', color: '#059669', backgroundColor: '#d1fae5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 8}}>
                        {t('delivree_le')} {selectedRecord.dispensedAt ? new Date(selectedRecord.dispensedAt).toLocaleDateString('fr-FR') : ''}
                      </Text>
                    )}

                    {selectedItems && selectedItems.length > 0 ? selectedItems.map(item => {
                      const cachet = item.cachet;
                      return (
                      <View key={item.id} style={{paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f8fafc'}}>
                        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                          <View style={{flex: 1}}>
                            <Text style={{fontSize: 14, fontWeight: '600', color: '#1e293b'}}>{item.medicineName}</Text>
                            {item.dosage ? <Text style={{fontSize: 11, color: '#64748b'}}>{item.dosage}</Text> : null}
                            <Text style={{fontSize: 11, color: '#94a3b8'}}>{t('quantite')}: {item.quantity}</Text>
                            {item.timeOfDay ? <Text style={{fontSize: 11, color: '#d97706', fontWeight: '600'}}>🕐 {item.timeOfDay}</Text> : null}
                            {cachet && (
                              <View style={{marginTop: 4, backgroundColor: '#f0fdf4', padding: 6, borderRadius: 6}}>
                                <Text style={{fontSize: 11, fontWeight: 'bold', color: '#059669'}}>🏥 {cachet.pharmacyName}</Text>
                                <Text style={{fontSize: 10, color: '#64748b'}}>👨‍⚕️ {cachet.pharmacistName} {cachet.pharmacistLicense ? `(Lic. ${cachet.pharmacistLicense})` : ''}</Text>
                                <Text style={{fontSize: 10, color: '#94a3b8'}}>🕐 {new Date(cachet.dispensedAt).toLocaleString('fr-FR')}</Text>
                              </View>
                            )}
                          </View>
                          <Text style={{
                            fontSize: 11, fontWeight: 'bold',
                            color: item.status === 'DISPENSED' ? '#059669' : item.status === 'UNAVAILABLE' ? '#dc2626' : '#d97706',
                            backgroundColor: item.status === 'DISPENSED' ? '#d1fae5' : item.status === 'UNAVAILABLE' ? '#fee2e2' : '#fef3c7',
                            paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
                          }}>
                            {item.status === 'DISPENSED' ? t('reçu') : item.status === 'UNAVAILABLE' ? t('indisponible') : t('en_attente')}
                          </Text>
                        </View>
                      </View>
                    )}) : selectedRecord?.prescription && (
                      <Text style={{fontSize: 13, color: '#64748b', fontStyle: 'italic'}}>
                        {typeof selectedRecord.prescription === 'string' ? selectedRecord.prescription : JSON.stringify(selectedRecord.prescription)}
                      </Text>
                    )}
                  </View>
                )}
              </View>

              {/* Suivi du Traitement — uniquement après délivrance en pharmacie */}
              {selectedRecord?.isDispensed && selectedItems && selectedItems.length > 0 && (
                <View style={s.treatmentSection}>
                  <Text style={s.treatmentSectionTitle}>{t('suivi_traitement')}</Text>
                  {treatmentLogs && treatmentLogs.length > 0 ? (
                    <>
                      <Text style={s.treatmentSubtitle}>{t('marquer_prise')}</Text>
                      {treatmentLogs.map((log) => {
                        const item = selectedItems.find(i => i.id === log.item?.id);
                        return (
                        <View key={log.id} style={s.treatmentItem}>
                          <View style={{flex: 1}}>
                            <Text style={s.medName}>{log.item?.medicineName || item?.medicineName || t('medicament')}</Text>
                            <Text style={s.logTime}>
                              🕐 {log.scheduledTime} {item?.dosage ? `— ${item.dosage}` : ''}
                            </Text>
                            <Text style={{fontSize: 10, color: '#92400e', fontWeight: '600'}}>
                              {t('prescrit')}: {item?.quantity || 1}x {item?.timeOfDay || t('temps_matin')}
                            </Text>
                          </View>
                          <View style={{flexDirection: 'row', gap: 8}}>
                            {log.status === 'TAKEN' || log.status === 'CONFIRMED' ? (
                              <View style={[s.statusPill, {backgroundColor: '#d1fae5'}]}>
                                <Check size={14} color="#059669" />
                                <Text style={{color: '#059669', fontWeight: '700', fontSize: 11}}>{t('prise')}</Text>
                              </View>
                            ) : log.status === 'SKIPPED' ? (
                              <View style={[s.statusPill, {backgroundColor: '#fee2e2'}]}>
                                <AlertTriangle size={14} color="#dc2626" />
                                <Text style={{color: '#dc2626', fontWeight: '700', fontSize: 11}}>{t('sautee')}</Text>
                              </View>
                            ) : (
                              <>
                                <TouchableOpacity style={[s.actionBtn, {backgroundColor: '#d1fae5'}]} onPress={() => handleTakeDose(log.id, 'TAKEN')}>
                                  <Check size={16} color="#059669" />
                                </TouchableOpacity>
                                <TouchableOpacity style={[s.actionBtn, {backgroundColor: '#fee2e2'}]} onPress={() => handleTakeDose(log.id, 'SKIPPED')}>
                                  <X size={16} color="#dc2626" />
                                </TouchableOpacity>
                              </>
                            )}
                          </View>
                        </View>
                      )})}
                    </>
                  ) : (
                    <>
                      <Text style={s.treatmentSubtitle}>{t('suivre_traitement')}</Text>
                      {loadingTreatment ? (
                        <ActivityIndicator color="#d97706" style={{marginVertical: 12}} />
                      ) : (
                        <TouchableOpacity style={s.btnStart} onPress={handleGenerateTreatment}>
                          <Text style={s.btnStartText}>{t('lancer_suivi')}</Text>
                        </TouchableOpacity>
                      )}
                    </>
                  )}
                </View>
              )}

              <TouchableOpacity style={s.btn} onPress={closeModal}>
                <Text style={s.btnText}>{t('fermer')}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      <View style={{height: 40}} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 20, paddingTop: 50, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  title: { fontSize: 22, fontWeight: '900', color: '#1e293b' },
  subtitle: { fontSize: 12, color: '#0d6e3f', fontWeight: '700', marginTop: 2 },
  statsRow: { flexDirection: 'row', padding: 20, gap: 12 },
  statCard: { flex: 1, backgroundColor: '#fff', padding: 16, borderRadius: 16, alignItems: 'center', gap: 6, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
  statValue: { fontSize: 24, fontWeight: '900', color: '#1e293b' },
  statLabel: { fontSize: 11, color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' },
  section: { paddingHorizontal: 20, marginTop: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#1e293b', marginBottom: 12 },
  recordItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 8, borderWidth: 1, borderColor: '#f1f5f9', justifyContent: 'space-between' },
  recordLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  recordDot: { width: 10, height: 10, borderRadius: 5 },
  recordTitle: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  recordDate: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  recordDoctor: { fontSize: 12, color: '#0d6e3f', fontWeight: '600', marginTop: 2 },
  qrBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#f0fdf4', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  qrBadgeText: { fontSize: 10, fontWeight: '900', color: '#0d6e3f' },
  emptyBox: { alignItems: 'center', padding: 30, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#f1f5f9', borderStyle: 'dashed' },
  emptyText: { color: '#94a3b8', marginTop: 8, fontSize: 15, fontWeight: '600' },
  emptySub: { color: '#cbd5e1', fontSize: 12, marginTop: 4 },
  overlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.85)', justifyContent: 'center', alignItems: 'center' },
  modalScroll: { flex: 1, width: '100%' },
  modalScrollContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 30 },
  modalContent: { backgroundColor: '#fff', width: '85%', padding: 24, borderRadius: 24, alignItems: 'center' },
  closeTop: { position: 'absolute', top: 12, right: 12, zIndex: 10, padding: 8, backgroundColor: '#f1f5f9', borderRadius: 20 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#1e293b', marginBottom: 20 },
  qrBox: { padding: 16, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  qrToken: { fontSize: 10, color: '#94a3b8', marginTop: 10, fontWeight: '700', letterSpacing: 1 },
  consultInfo: { width: '100%', marginTop: 16, padding: 16, backgroundColor: '#f8fafc', borderRadius: 12 },
  consultInfoLabel: { fontSize: 11, color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' },
  consultInfoValue: { fontSize: 14, color: '#1e293b', fontWeight: '600', marginTop: 2 },
  treatmentSection: { width: '100%', marginTop: 16, padding: 16, backgroundColor: '#fffbeb', borderRadius: 12, borderWidth: 1, borderColor: '#fef3c7' },
  treatmentSectionTitle: { fontSize: 16, fontWeight: '900', color: '#92400e', marginBottom: 4 },
  treatmentSubtitle: { fontSize: 11, color: '#d97706', marginBottom: 12 },
  treatmentItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#fef3c7' },
  medName: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
  logTime: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  actionBtn: { padding: 8, borderRadius: 10 },
  btn: { marginTop: 20, paddingHorizontal: 50, paddingVertical: 14, backgroundColor: '#0d6e3f', borderRadius: 14 },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 13 },
  btnStart: { marginTop: 8, padding: 12, backgroundColor: '#d97706', borderRadius: 12, alignItems: 'center' },
  btnStartText: { color: '#fff', fontWeight: '900', fontSize: 14 },
});
