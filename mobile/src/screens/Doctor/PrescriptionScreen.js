import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, ScrollView, Modal, FlatList, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { QrCode, FileCheck2, User, Search, CheckCircle, WifiOff, Plus, X, Clock } from 'lucide-react-native';
import { medicalService, userService } from '../../services/api';
import QRCode from 'react-native-qrcode-svg';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { savePendingAction, initDatabase } from '../../database/db';
import { COMMON_MEDICINES, COMMON_DIAGNOSES } from '../../constants/medicines';

export default function PrescriptionScreen() {
  const { t } = useTranslation();
  const route = useRoute();
  const { colors } = useTheme();
  const [phone, setPhone] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [temperature, setTemperature] = useState('');
  const [weight, setWeight] = useState('');
  const [bloodPressure, setBloodPressure] = useState('');
  const [pulse, setPulse] = useState('');
  const [spo2, setSpo2] = useState('');
  const [hospital, setHospital] = useState('Hôpital National Yalgado');
  const [searching, setSearching] = useState(false);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generatedQR, setGeneratedQR] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [isOfflineSave, setIsOfflineSave] = useState(false);
  const [medicines, setMedicines] = useState([]);
  const [showMedicineModal, setShowMedicineModal] = useState(false);
  const [medicineSearch, setMedicineSearch] = useState('');
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [selectedDosage, setSelectedDosage] = useState('');
  const [customDosage, setCustomDosage] = useState('');
  const [itemQuantity, setItemQuantity] = useState(1);
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState('Matin');
  const TIME_OPTIONS = ['Matin', 'Midi', 'Soir', 'Matin et Soir', 'Matin, Midi et Soir', 'Toutes les 8h'];

  useEffect(() => {
    if (route.params?.patient) {
      setPatient(route.params.patient);
      setPhone(route.params.patient.phone || '');
    } else if (route.params?.phone) {
      setPhone(route.params.phone);
      searchPatient();
    }
  }, [route.params]);

  const handleBarcodeScanned = async ({ data }) => {
    setShowScanner(false);
    const rawValue = data.replace('FASOCARE_ID:', '');
    setPhone(rawValue);
    setSearching(true);
    try {
      const isId = /^[0-9a-fA-F-]{36,}$/.test(rawValue);
      const userData = isId ? await userService.findById(rawValue) : await userService.findPatient(rawValue);
      setPatient(userData);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      Alert.alert(t('erreur'), t('patient_introuvable'));
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    if (patient && phone !== patient.phone) {
      setPatient(null);
    }
  }, [phone]);

  const searchPatient = async () => {
    if (!phone) return;
    const cleanPhone = phone.replace(/\s+/g, '').replace('+226', '');
    setSearching(true);
    try {
      const data = await userService.findPatient(cleanPhone);
      setPatient(data);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      Alert.alert(t('patient_non_trouve'), t('aucun_patient_numero'));
      setPatient(null);
    } finally {
      setSearching(false);
    }
  };

  const openMedicineSelector = () => {
    setMedicineSearch('');
    setSelectedMedicine(null);
    setSelectedDosage('');
    setCustomDosage('');
    setItemQuantity(1);
    setSelectedTimeOfDay('Matin');
    setShowMedicineModal(true);
  };

  const selectMedicine = (med) => {
    setSelectedMedicine(med);
    setSelectedDosage('');
    setCustomDosage('');
    setItemQuantity(1);
    setSelectedTimeOfDay('Matin');
  };

  const confirmMedicine = () => {
    const dosage = selectedDosage || customDosage || 'Selon prescription';
    setMedicines(prev => [...prev, {
      id: Date.now().toString(),
      medicineName: selectedMedicine.name,
      dosage,
      quantity: itemQuantity,
      timeOfDay: selectedTimeOfDay,
    }]);
    setShowMedicineModal(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const removeMedicine = (id) => {
    setMedicines(prev => prev.filter(m => m.id !== id));
  };

  const generateTreatmentText = () => {
    if (medicines.length === 0) return '';
    return medicines.map(m => `- ${m.medicineName}${m.dosage ? ` (${m.dosage})` : ''}${m.quantity > 1 ? ` x${m.quantity}` : ''}`).join('\n');
  };

  const handleGenerate = async () => {
    if (!patient) {
      Alert.alert(t('attention'), t('valider_patient'));
      return;
    }
    if (!diagnosis) {
      Alert.alert(t('attention'), t('saisir_diagnostic'));
      return;
    }
    if (medicines.length === 0) {
      Alert.alert(t('attention'), t('ajouter_medicament'));
      return;
    }
    setLoading(true);
    const treatmentText = generateTreatmentText();
    const vitals = {
      temperature: parseFloat(temperature),
      weight: parseFloat(weight),
      bloodPressure,
      pulse: parseInt(pulse),
      spo2,
      hospital,
      prescription: { treatment: treatmentText, generatedAt: new Date() }
    };

    try {
      const result = await medicalService.createConsultation(patient.id, diagnosis, treatmentText, vitals);
      if (result.id) {
        try {
          await medicalService.addPrescriptionItems(result.id, medicines.map(m => ({
            medicineName: m.medicineName,
            dosage: m.dosage,
            quantity: m.quantity,
            timeOfDay: m.timeOfDay || 'Matin',
          })));
        } catch (itemsErr) {
          if (__DEV__) console.log("Items save warning:", itemsErr.message);
        }
      }
      if (result.qr_token) {
        setGeneratedQR(result.qr_token);
        setIsOfflineSave(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (err) {
      if (__DEV__) console.log("Network error, saving offline...", err.message);
      try {
        const db = await initDatabase();
        await savePendingAction(db, 'CREATE_CONSULTATION', {
          patientId: patient.id,
          diagnosis,
          treatmentPlan: treatmentText,
          vitals,
            medicines: medicines.map(m => ({
              medicineName: m.medicineName,
              dosage: m.dosage,
              quantity: m.quantity,
              timeOfDay: m.timeOfDay || 'Matin',
            })),
        });
        setIsOfflineSave(true);
        setGeneratedQR(`OFFLINE_MODE_${Date.now()}`);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch (dbErr) {
        Alert.alert(t('erreur_critique'), t('impossible_sauvegarde'));
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setPatient(null);
    setPhone('');
    setDiagnosis('');
    setMedicines([]);
    setTemperature('');
    setWeight('');
    setBloodPressure('');
    setPulse('');
    setSpo2('');
    setGeneratedQR(null);
  };

  const filteredMedicines = COMMON_MEDICINES.filter(m =>
    m.name.toLowerCase().includes(medicineSearch.toLowerCase())
  );

  if (generatedQR) {
    return (
      <View style={styles.successContainer}>
        <CheckCircle color={isOfflineSave ? "#f59e0b" : "#009E49"} size={80} />
        <Text style={styles.successTitle}>{isOfflineSave ? t('sauvegarde_hors_ligne') : t('ordonnance_enregistree')}</Text>
        <Text style={styles.successSub}>
          {isOfflineSave
            ? t('hors_ligne_desc')
            : t('en_ligne_desc')}
        </Text>
        <View style={styles.qrPreview}>
          {isOfflineSave ? (
            <View style={{alignItems: 'center', padding: 20}}>
              <WifiOff size={60} color="#cbd5e1" />
              <Text style={{color: '#64748b', marginTop: 10, textAlign: 'center'}}>{t('qr_apres_sync')}</Text>
            </View>
          ) : (
            <QRCode value={generatedQR} size={200} color="#1a4a2e" backgroundColor="white" />
          )}
          {!isOfflineSave && <Text style={styles.tokenText}>{generatedQR}</Text>}
        </View>
        <TouchableOpacity style={styles.resetBtn} onPress={resetForm}>
          <Text style={styles.resetText}>{t('nouvelle_consultation')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('prescriptions')}</Text>
        <Text style={styles.subtitle}>{t('fasocare_bf')}</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('patient_search_label')} 🇧🇫</Text>
          <View style={styles.rowInput}>
            <View style={{flex: 1, position: 'relative'}}>
               <TextInput
                 style={[styles.input, patient && styles.inputValidated]}
                 placeholder="+226 XX XX XX XX"
                 value={phone}
                 onChangeText={setPhone}
                 keyboardType="phone-pad"
               />
               {searching && <ActivityIndicator style={styles.inputSpinner} color="#1a4a2e" />}
            </View>
            <TouchableOpacity
              style={[styles.scanBtn, patient && styles.scanBtnValidated]}
              onPress={searchPatient}
              accessibilityRole="button"
              accessibilityLabel={t('search_patient')}
            >
              <Search color="white" size={20} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.scanBtn, {backgroundColor: '#0d6e3f'}]}
              onPress={() => setShowScanner(true)}
              accessibilityRole="button"
              accessibilityLabel={t('scan_patient')}
            >
              <QrCode color="white" size={20} />
            </TouchableOpacity>
          </View>
          {patient ? (
            <View style={styles.patientBadge}>
              <CheckCircle size={14} color="#065f46" />
              <Text style={styles.patientBadgeText}>{t('confirm')}: {patient.name || patient.phone}</Text>
            </View>
          ) : (
            <Text style={styles.helperText}>{t('search_placeholder')} 🔍</Text>
          )}
        </View>

        <Modal visible={showScanner} animationType="slide">
          <View style={{flex: 1, backgroundColor: 'black'}}>
            {permission?.granted ? (
              <CameraView
                style={StyleSheet.absoluteFillObject}
                onBarcodeScanned={handleBarcodeScanned}
              />
            ) : (
              <View style={styles.permissionBox}>
                <Text style={styles.permissionText}>{t('permission_camera')}</Text>
                <TouchableOpacity style={styles.resetBtn} onPress={requestPermission}>
                   <Text style={styles.resetText}>{t('autoriser_camera')}</Text>
                </TouchableOpacity>
              </View>
            )}
            <TouchableOpacity style={styles.closeScanner} onPress={() => setShowScanner(false)}>
              <Text style={{color: 'white', fontWeight: 'bold'}}>{t('annuler')}</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('hospital')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('hospital_label')}
            value={hospital}
            onChangeText={setHospital}
          />
        </View>

        <View style={styles.vitalsGrid}>
          <View style={styles.vitalInput}>
            <Text style={[styles.label, {color: colors.text}]}>{t('temperature')} (°C)</Text>
            <TextInput
              style={[styles.input, {backgroundColor: colors.card, color: colors.text, borderColor: colors.border}]}
              placeholder="37.5"
              keyboardType="numeric"
              value={temperature}
              onChangeText={setTemperature}
            />
          </View>
          <View style={styles.vitalInput}>
            <Text style={[styles.label, {color: colors.text}]}>{t('weight')} (kg)</Text>
            <TextInput
              style={[styles.input, {backgroundColor: colors.card, color: colors.text, borderColor: colors.border}]}
              placeholder="70"
              keyboardType="numeric"
              value={weight}
              onChangeText={setWeight}
            />
          </View>
          <View style={styles.vitalInput}>
            <Text style={[styles.label, {color: colors.text}]}>{t('tension')}</Text>
            <TextInput
              style={[styles.input, {backgroundColor: colors.card, color: colors.text, borderColor: colors.border}]}
              placeholder="12/8"
              value={bloodPressure}
              onChangeText={setBloodPressure}
            />
          </View>
          <View style={styles.vitalInput}>
            <Text style={[styles.label, {color: colors.text}]}>{t('pouls')}</Text>
            <TextInput
              style={[styles.input, {backgroundColor: colors.card, color: colors.text, borderColor: colors.border}]}
              placeholder="75"
              keyboardType="numeric"
              value={pulse}
              onChangeText={setPulse}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('diagnosis_label')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('diagnosis_form_label')}
            value={diagnosis}
            onChangeText={setDiagnosis}
          />
          <View style={styles.chipsRow}>
            {COMMON_DIAGNOSES.map(d => (
              <TouchableOpacity
                key={d}
                style={[styles.chip, diagnosis === d && styles.chipActive]}
                onPress={() => setDiagnosis(d)}
              >
                <Text style={[styles.chipText, diagnosis === d && styles.chipTextActive]}>
                  {d}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('medicaments_prescrits')}</Text>
          {medicines.length > 0 && (
            <View style={styles.medicinesList}>
              {medicines.map(med => (
                  <View key={med.id} style={styles.medicineItem}>
                    <View style={{flex: 1}}>
                      <Text style={styles.medicineName}>{med.medicineName}</Text>
                      <Text style={styles.medicineDetail}>
                        {med.dosage}{med.quantity > 1 ? ` — ${t('quantite')}: ${med.quantity}` : ''}
                      </Text>
                      <Text style={{fontSize: 11, color: '#d97706', fontWeight: '600', marginTop: 2}}>
                        🕐 {med.timeOfDay || t('temps_matin')}
                      </Text>
                    </View>
                  <TouchableOpacity onPress={() => removeMedicine(med.id)} style={styles.removeBtn}>
                    <X size={16} color="#dc2626" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
          <TouchableOpacity style={styles.addMedicineBtn} onPress={openMedicineSelector}>
            <Plus size={18} color="white" />
            <Text style={styles.addMedicineBtnText}>{t('ajouter_medicament_btn')}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.generateBtn, (!patient || loading || medicines.length === 0) && styles.btnDisabled]}
          onPress={handleGenerate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <FileCheck2 color="white" size={24} />
              <Text style={styles.generateBtnText}>{t('generate_btn')}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <Modal visible={showMedicineModal} animationType="slide" transparent>
        <View style={styles.medModalOverlay}>
          <View style={styles.medModalContent}>
            {!selectedMedicine ? (
              <>
                <Text style={styles.medModalTitle}>{t('choisir_medicament')}</Text>
                <TextInput
                  style={styles.medSearchInput}
                  placeholder={t('rechercher_medicament')}
                  value={medicineSearch}
                  onChangeText={setMedicineSearch}
                  autoFocus
                />
                <FlatList
                  data={filteredMedicines}
                  keyExtractor={(item) => item.name}
                  style={{maxHeight: 400}}
                  renderItem={({item}) => (
                    <TouchableOpacity style={styles.medOption} onPress={() => selectMedicine(item)}>
                      <Text style={styles.medOptionName}>{item.name}</Text>
                      <Text style={styles.medOptionArrow}>→</Text>
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={
                    <Text style={{textAlign: 'center', color: '#94a3b8', padding: 20, fontStyle: 'italic'}}>
                      {t('aucun_medicament_trouve')}
                    </Text>
                  }
                />
                <TouchableOpacity style={styles.medModalCancel} onPress={() => setShowMedicineModal(false)}>
                  <Text style={{color: '#64748b', fontWeight: '600'}}>{t('annuler')}</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.medModalTitle}>{selectedMedicine.name}</Text>

                <Text style={styles.medSectionLabel}>{t('posologie')}</Text>
                <View style={styles.dosageChipsRow}>
                  {selectedMedicine.dosages.map(d => (
                    <TouchableOpacity
                      key={d}
                      style={[styles.dosageChip, selectedDosage === d && styles.dosageChipActive]}
                      onPress={() => { setSelectedDosage(d); setCustomDosage(''); }}
                    >
                      <Text style={[styles.dosageChipText, selectedDosage === d && styles.dosageChipTextActive]}>
                        {d}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput
                  style={[styles.input, {marginTop: 8}]}
                  placeholder={t('posologie_perso')}
                  value={customDosage}
                  onChangeText={(v) => { setCustomDosage(v); setSelectedDosage(''); }}
                />

                <Text style={[styles.medSectionLabel, {marginTop: 16}]}>{t('quantite')}</Text>
                <View style={styles.quantityRow}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => setItemQuantity(Math.max(1, itemQuantity - 1))}
                  >
                    <Text style={styles.qtyBtnText}>−</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={styles.qtyInput}
                    value={String(itemQuantity)}
                    onChangeText={(v) => setItemQuantity(Math.max(1, parseInt(v) || 1))}
                    keyboardType="numeric"
                  />
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => setItemQuantity(itemQuantity + 1)}
                  >
                    <Text style={styles.qtyBtnText}>+</Text>
                  </TouchableOpacity>
                </View>

                <Text style={[styles.medSectionLabel, {marginTop: 16}]}>{t('quand_prendre')}</Text>
                <View style={styles.dosageChipsRow}>
                  {TIME_OPTIONS.map(t => (
                    <TouchableOpacity
                      key={t}
                      style={[styles.dosageChip, selectedTimeOfDay === t && styles.dosageChipActive]}
                      onPress={() => setSelectedTimeOfDay(t)}
                    >
                      <Text style={[styles.dosageChipText, selectedTimeOfDay === t && styles.dosageChipTextActive]}>{t}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.medModalActions}>
                  <TouchableOpacity style={styles.medModalBack} onPress={() => setSelectedMedicine(null)}>
                    <Text style={{color: '#64748b', fontWeight: '600'}}>{t('retour')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.medModalConfirm} onPress={confirmMedicine}>
                    <CheckCircle size={18} color="white" />
                    <Text style={styles.medModalConfirmText}>{t('ajouter')}</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 25, paddingTop: 60, backgroundColor: '#1a4a2e' },
  title: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  subtitle: { color: '#e8ede9', fontSize: 14, marginTop: 4 },
  form: { padding: 20 },
  inputGroup: { marginBottom: 20 },
  vitalsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  vitalInput: { width: '48%' },
  label: { fontSize: 13, fontWeight: 'bold', color: '#1e293b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  rowInput: { flexDirection: 'row', gap: 10 },
  input: { flex: 1, backgroundColor: 'white', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', fontSize: 15 },
  scanBtn: { backgroundColor: '#1a4a2e', padding: 15, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  generateBtn: { backgroundColor: '#009E49', flexDirection: 'row', padding: 18, borderRadius: 16, justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 10 },
  generateBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  inputValidated: { borderColor: '#10b981', backgroundColor: '#f0fdf4' },
  scanBtnValidated: { backgroundColor: '#10b981' },
  helperText: { fontSize: 12, color: '#64748b', marginTop: 8, fontStyle: 'italic' },
  btnDisabled: { opacity: 0.5 },
  inputSpinner: { position: 'absolute', right: 10, top: 15 },
  patientBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, backgroundColor: '#d1fae5', padding: 10, borderRadius: 12 },
  patientBadgeText: { fontSize: 13, color: '#065f46', fontWeight: 'bold' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  chip: { backgroundColor: 'white', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0' },
  chipActive: { backgroundColor: '#1a4a2e', borderColor: '#1a4a2e' },
  chipText: { fontSize: 12, color: '#475569', fontWeight: '600' },
  chipTextActive: { color: 'white' },
  medicinesList: { marginBottom: 10 },
  medicineItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 14, borderRadius: 12, marginBottom: 6, borderWidth: 1, borderColor: '#e2e8f0' },
  medicineName: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  medicineDetail: { fontSize: 12, color: '#64748b', marginTop: 2 },
  removeBtn: { padding: 6, borderRadius: 8, backgroundColor: '#fef2f2' },
  addMedicineBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#0d6e3f', padding: 14, borderRadius: 12, borderStyle: 'dashed', borderWidth: 2, borderColor: '#0d6e3f' },
  addMedicineBtnText: { color: 'white', fontSize: 14, fontWeight: '700' },
  medModalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.85)', justifyContent: 'flex-end' },
  medModalContent: { backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' },
  medModalTitle: { fontSize: 20, fontWeight: '900', color: '#1e293b', marginBottom: 16 },
  medSearchInput: { backgroundColor: '#f1f5f9', padding: 14, borderRadius: 12, fontSize: 15, marginBottom: 12 },
  medOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  medOptionName: { fontSize: 15, fontWeight: '600', color: '#1e293b', flex: 1 },
  medOptionArrow: { fontSize: 16, color: '#94a3b8' },
  medModalCancel: { alignItems: 'center', paddingVertical: 16, marginTop: 8 },
  medSectionLabel: { fontSize: 13, fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  dosageChipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dosageChip: { backgroundColor: '#f1f5f9', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0' },
  dosageChipActive: { backgroundColor: '#1a4a2e', borderColor: '#1a4a2e' },
  dosageChipText: { fontSize: 13, color: '#475569', fontWeight: '600' },
  dosageChipTextActive: { color: 'white' },
  quantityRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  qtyBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  qtyBtnText: { fontSize: 22, fontWeight: '700', color: '#1e293b' },
  qtyInput: { flex: 1, backgroundColor: 'white', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', fontSize: 18, fontWeight: '700', textAlign: 'center' },
  medModalActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 },
  medModalBack: { padding: 12 },
  medModalConfirm: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#0d6e3f', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14 },
  medModalConfirmText: { color: 'white', fontWeight: '800', fontSize: 15 },
  successContainer: { flex: 1, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', padding: 30 },
  successTitle: { fontSize: 24, fontWeight: 'bold', color: '#1e293b', marginTop: 20 },
  successSub: { textAlign: 'center', color: '#64748b', marginTop: 10, lineHeight: 20 },
  qrPreview: { marginTop: 30, padding: 20, backgroundColor: '#f8fafc', borderRadius: 24, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  tokenText: { marginTop: 15, fontSize: 12, fontWeight: 'bold', color: '#334155', letterSpacing: 1 },
  resetBtn: { marginTop: 40, backgroundColor: '#1a4a2e', paddingVertical: 15, paddingHorizontal: 30, borderRadius: 12 },
  resetText: { color: 'white', fontWeight: 'bold' },
  closeScanner: { position: 'absolute', bottom: 50, alignSelf: 'center', backgroundColor: 'rgba(255,255,255,0.2)', padding: 15, borderRadius: 12 },
  permissionBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  permissionText: { color: 'white', textAlign: 'center', fontSize: 16, marginBottom: 20 },
});
