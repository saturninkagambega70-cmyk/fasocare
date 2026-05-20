import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { useTranslation } from 'react-i18next';
import { medicalService } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { FileText, ChevronRight, X } from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { FasoCareIcon } from '../../components/FasoCareIcon';

export default function PrescriptionListScreen() {
  const { t } = useTranslation();
  const { isDarkMode, colors } = useTheme();
  const navigation = useNavigation();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useFocusEffect(
    useCallback(() => {
      const fetchPrescriptions = async () => {
        setLoading(true);
        try {
          const data = await medicalService.getHistory();
          setPrescriptions(Array.isArray(data) ? data.filter(item => item.qr_token) : []);
        } catch (err) {
          if (__DEV__) console.error("Fetch Prescriptions Error:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchPrescriptions();
    }, [])
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.title}>Mes Ordonnances</Text>
      </View>

      <ScrollView style={styles.content}>
        {loading ? (
          <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 20 }} />
        ) : prescriptions.length === 0 ? (
          <Text style={{ textAlign: 'center', color: colors.textSecondary, marginTop: 40 }}>
            Vous n'avez aucune ordonnance.
          </Text>
        ) : (
          prescriptions.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.recordItem, {backgroundColor: colors.card, borderColor: colors.border}]} 
              onPress={() => setSelectedRecord(item)}
            >
              <View style={[styles.recordIcon, {backgroundColor: isDarkMode ? '#064e3b' : '#f0fdf4'}]}>
                 <FileText color={isDarkMode ? '#34d399' : '#16a34a'} size={24} />
              </View>
              <View style={styles.recordInfo}>
                <Text style={[styles.recordTitle, {color: colors.text}]}>{item.diagnosis || "Ordonnance"}</Text>
                <Text style={[styles.recordDate, {color: colors.textSecondary}]}>
                  Le {new Date(item.createdAt).toLocaleDateString()}
                </Text>
                <Text style={[styles.recordDoctor, {color: colors.textSecondary}]}>
                   Dr. {item.doctor?.name || "FasoCare"}
                </Text>
                {item.isDispensed && (
                  <View style={{flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4}}>
                    <Text style={{fontSize: 11, fontWeight: 'bold', color: '#059669', backgroundColor: '#d1fae5', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6}}>
                      ✓ Délivrée
                    </Text>
                    {item.dispensedAt && (
                      <Text style={{fontSize: 10, color: '#94a3b8'}}>
                        le {new Date(item.dispensedAt).toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                )}
              </View>
              <ChevronRight color={colors.textSecondary} />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <TouchableOpacity 
        style={[styles.backBtn, { backgroundColor: colors.primary }]} 
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backBtnText}>Retour au dossier</Text>
      </TouchableOpacity>

       {/* Modal Détails Ordonnance */}
      <Modal visible={!!selectedRecord} transparent animationType="slide">
        <View style={[styles.modalOverlay, {backgroundColor: isDarkMode ? 'rgba(0,0,0,0.85)' : 'rgba(15, 23, 42, 0.8)'}]}>
          <ScrollView style={[styles.modalContent, {backgroundColor: colors.card}]} contentContainerStyle={{alignItems: 'center'}}>
             <TouchableOpacity style={styles.closeTopBtn} onPress={() => setSelectedRecord(null)}>
               <X size={22} color={isDarkMode ? '#fff' : '#1e293b'} />
             </TouchableOpacity>
             <FasoCareIcon size={48} />
             <Text style={[styles.modalTitle, {color: colors.text, marginTop: 15}]}>Détails Ordonnance</Text>

             <View style={[styles.infoBox, {backgroundColor: isDarkMode ? '#1e293b' : '#f8fafc'}]}>
               <Text style={[styles.infoLabel, {color: colors.textSecondary}]}>Diagnostic</Text>
               <Text style={[styles.infoValue, {color: colors.text}]}>{selectedRecord?.diagnosis || "Non spécifié"}</Text>
               <Text style={[styles.infoLabel, {marginTop: 10, color: colors.textSecondary}]}>Prescrit par</Text>
               <Text style={[styles.infoValue, {color: colors.text}]}>Dr. {selectedRecord?.doctor?.name || "FasoCare"}</Text>
               <Text style={[styles.infoLabel, {marginTop: 10, color: colors.textSecondary}]}>Date</Text>
               <Text style={[styles.infoValue, {color: colors.text}]}>{new Date(selectedRecord?.createdAt).toLocaleDateString('fr-FR')}</Text>
               {selectedRecord?.isDispensed && (
                 <Text style={[styles.dispensedBadge, {marginTop: 10}]}>
                   ✓ Délivrée le {selectedRecord.dispensedAt ? new Date(selectedRecord.dispensedAt).toLocaleDateString('fr-FR') : ''}
                 </Text>
               )}
             </View>

             <View style={[styles.qrBox, {backgroundColor: '#fff', borderColor: colors.border}]}>
                <QRCode value={selectedRecord?.qr_token || ""} size={160} />
                <Text style={styles.qrToken}>{selectedRecord?.qr_token}</Text>
             </View>

             {selectedRecord?.items && selectedRecord.items.length > 0 && (
               <View style={[styles.itemsSection, {borderColor: colors.border}]}>
                 <Text style={[styles.itemsTitle, {color: colors.text}]}>💊 Produits à prendre</Text>
                 {selectedRecord.items.map((med) => {
                   const cachet = med.cachet;
                   return (
                     <View key={med.id} style={[styles.itemCard, {backgroundColor: isDarkMode ? '#1e293b' : '#f8fafc'}]}>
                       <View style={styles.itemRow}>
                         <View style={{flex: 1}}>
                           <Text style={[styles.medName, {color: colors.text}]}>{med.medicineName}</Text>
                            {med.dosage ? <Text style={[styles.medDosage, {color: colors.textSecondary}]}>{med.dosage}</Text> : null}
                            <Text style={[styles.medQty, {color: colors.textSecondary}]}>Qté: {med.quantity}</Text>
                            {med.timeOfDay && <Text style={[styles.medQty, {color: '#d97706', fontWeight: '600'}]}>🕐 {med.timeOfDay}</Text>}
                         </View>
                         <Text style={[styles.statusBadge, {
                           color: med.status === 'DISPENSED' ? '#059669' : med.status === 'UNAVAILABLE' ? '#dc2626' : '#d97706',
                           backgroundColor: med.status === 'DISPENSED' ? '#d1fae5' : med.status === 'UNAVAILABLE' ? '#fee2e2' : '#fef3c7',
                         }]}>
                           {med.status === 'DISPENSED' ? '✓ Reçu' : med.status === 'UNAVAILABLE' ? '✗ Indisponible' : 'En attente'}
                         </Text>
                       </View>
                       {cachet && (
                         <View style={styles.cachetBox}>
                           <Text style={{fontSize: 10, fontWeight: '700', color: '#059669', marginBottom: 2}}>🏪 {cachet.pharmacyName}</Text>
                           <Text style={{fontSize: 10, color: '#64748b'}}>Pharmacien: {cachet.pharmacistName} {cachet.pharmacistLicense ? `(Lic. ${cachet.pharmacistLicense})` : ''}</Text>
                           <Text style={{fontSize: 10, color: '#94a3b8'}}>Délivré le: {new Date(cachet.dispensedAt).toLocaleString('fr-FR')}</Text>
                         </View>
                       )}
                     </View>
                   );
                 })}
               </View>
             )}

             <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedRecord(null)}>
                <Text style={styles.closeBtnText}>Fermer</Text>
             </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 25, paddingTop: 60, alignItems: 'center' },
  title: { color: '#fff', fontSize: 24, fontWeight: '900' },
  content: { padding: 20 },
  recordItem: { flexDirection: 'row', padding: 20, borderRadius: 24, alignItems: 'center', gap: 15, marginBottom: 15, borderWidth: 1, elevation: 1 },
  recordIcon: { padding: 15, borderRadius: 20 },
  recordInfo: { flex: 1 },
  recordTitle: { fontSize: 16, fontWeight: 'bold' },
  recordDate: { fontSize: 13, marginTop: 4, fontWeight: '500' },
  recordDoctor: { fontSize: 13, marginTop: 4, fontWeight: '900' },
  backBtn: { margin: 20, padding: 18, borderRadius: 15, alignItems: 'center', marginBottom: 30 },
  backBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalContent: { padding: 35, borderRadius: 40, alignItems: 'center', width: '85%' },
  modalTitle: { fontSize: 22, fontWeight: '900', letterSpacing: -0.5, marginBottom: 20 },

  qrBox: { padding: 25, borderRadius: 32, alignItems: 'center', borderWidth: 1 },
  qrToken: { marginTop: 12, fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  infoBox: { alignSelf: 'stretch', padding: 16, borderRadius: 16, marginBottom: 20 },
  infoLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  infoValue: { fontSize: 14, fontWeight: '600', marginTop: 2 },
  dispensedBadge: { fontSize: 12, fontWeight: '700', color: '#059669', backgroundColor: '#d1fae5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
  itemsSection: { alignSelf: 'stretch', borderTopWidth: 1, marginTop: 20, paddingTop: 16 },
  itemsTitle: { fontSize: 16, fontWeight: '800', marginBottom: 12 },
  itemCard: { padding: 12, borderRadius: 12, marginBottom: 10 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  medName: { fontSize: 15, fontWeight: '700' },
  medDosage: { fontSize: 12, marginTop: 2 },
  medQty: { fontSize: 11, marginTop: 2 },
  statusBadge: { fontSize: 11, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  cachetBox: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#bbf7d0' },
  closeTopBtn: { position: 'absolute', top: 12, right: 12, zIndex: 10, padding: 8, backgroundColor: '#f1f5f9', borderRadius: 20 },
  closeBtn: { marginTop: 25, paddingHorizontal: 50, paddingVertical: 18, borderRadius: 20, backgroundColor: '#0f172a' },
  closeBtnText: { color: 'white', fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1, fontSize: 12 }
});
