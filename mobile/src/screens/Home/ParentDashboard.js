import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Modal, TextInput } from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { Bell, QrCode, PlusCircle, Baby, User, ChevronRight } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { userService, medicalService } from '../../services/api';
import { useNavigation } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import QRCode from 'react-native-qrcode-svg';

export default function ParentDashboard() {
  const { t } = useTranslation();
  const { logout, user } = useAuthStore();
  const navigation = useNavigation();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [childPhone, setChildPhone] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedChild, setSelectedChild] = useState(null);
  const [childPrescriptions, setChildPrescriptions] = useState([]);
  const [showPrescriptions, setShowPrescriptions] = useState(false);
  const [loadingPrescriptions, setLoadingPrescriptions] = useState(false);
  const [showChildQR, setShowChildQR] = useState(false);
  const [selectedChildForQR, setSelectedChildForQR] = useState(null);

  const fetchChildren = async () => {
    try {
      const data = await userService.getChildren();
      setChildren(data || []);
      const notifs = await medicalService.getNotifications();
      setNotifications(notifs || []);
    } catch (err) {
      if (__DEV__) console.error("Fetch children error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  const startScanner = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert("Permission", "L'accès à la caméra est requis pour scanner le code QR.");
        return;
      }
    }
    setShowScanner(true);
  };

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);
    setShowScanner(false);
    setIsAdding(true);
    try {
      if (data.startsWith('FASOCARE_ID:')) {
        const childId = data.replace('FASOCARE_ID:', '');
        const child = await userService.findById(childId);
        await userService.addChild(child?.phone || childId);
      } else {
        await userService.addChild(data);
      }
      Alert.alert("Succès", "L'enfant a été lié à votre compte par validation physique.");
      fetchChildren();
    } catch (err) {
      Alert.alert("Erreur", "L'enfant n'a pas pu être lié. Assurez-vous d'être devant son profil FasoCare.");
    } finally {
      setIsAdding(false);
      setScanned(false);
    }
  };

  const viewChildPrescriptions = async (child) => {
    setSelectedChild(child);
    setShowPrescriptions(true);
    setLoadingPrescriptions(true);
    try {
      const data = await medicalService.getPatientHistory(child.id);
      const records = Array.isArray(data) ? data.filter(item => item.qr_token) : [];
      setChildPrescriptions(records);
    } catch {
      setChildPrescriptions([]);
    } finally {
      setLoadingPrescriptions(false);
    }
  };

  const showChildIdentityQR = (child) => {
    setSelectedChildForQR(child);
    setShowChildQR(true);
  };

  const handleAddChildManual = async () => {
    if (!childPhone) return Alert.alert("Erreur", "Veuillez saisir un numéro de téléphone");
    setIsAdding(true);
    try {
      await userService.addChild(childPhone);
      Alert.alert("Succès", "L'enfant a été lié à votre compte");
      setIsAddModalVisible(false);
      setChildPhone('');
      fetchChildren();
    } catch (err) {
      Alert.alert("Erreur", err.response?.data?.message || "Impossible de trouver l'enfant");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{t('parent_space')} 👶</Text>
            <Text style={styles.childName}>{user?.name || 'Parent'}</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn} onPress={() => setShowNotifications(!showNotifications)}>
            <Bell color="#1e293b" size={20} />
            {notifications.some(n => !n.isRead) && <View style={styles.notifDot} />}
          </TouchableOpacity>
        </View>

        {showNotifications && (
            <View style={styles.notifTray}>
                <Text style={styles.notifTrayTitle}>Centre de Notifications 📬</Text>
                {notifications.length === 0 ? (
                    <Text style={styles.notifEmpty}>Aucune nouvelle notification.</Text>
                ) : (
                    notifications.map(n => (
                        <View key={n.id} style={styles.notifItem}>
                            <Text style={styles.notifItemTitle}>{n.title}</Text>
                            <Text style={styles.notifItemContent}>{n.content}</Text>
                        </View>
                    ))
                )}
            </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('child_profiles')} 📂</Text>
          <View style={{flexDirection: 'row', gap: 10}}>
             <TouchableOpacity onPress={startScanner} style={{backgroundColor: '#ecfdf5', padding: 5, borderRadius: 8}}>
                <QrCode color="#0d6e3f" size={24} />
             </TouchableOpacity>
             <TouchableOpacity onPress={() => setIsAddModalVisible(true)}>
                <PlusCircle color="#0d6e3f" size={24} />
             </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#0d6e3f" style={{ marginTop: 20 }} />
        ) : children.length === 0 ? (
          <View style={styles.emptyState}>
            <Baby color="#94a3b8" size={60} strokeWidth={1} />
            <Text style={styles.emptyText}>Aucun enfant lié. Ajoutez un enfant pour suivre ses vaccinations.</Text>
            <TouchableOpacity style={styles.addBtnLarge} onPress={() => setIsAddModalVisible(true)}>
               <Text style={styles.addBtnText}>Ajouter un enfant</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.childList}>
            {children.map((child) => (
              <View key={child.id} style={styles.childCard}>
                <TouchableOpacity 
                  style={{flexDirection: 'row', alignItems: 'center', gap: 15}}
                  onPress={() => navigation.navigate('PatientRecord', { patient: child, patientName: child.name, patientPhone: child.phone, patientId: child.id })}
                >
                  <View style={styles.avatar}>
                     <User color="#0d6e3f" size={24} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardName}>{child.name || child.phone}</Text>
                    <Text style={styles.cardSub}>Dossier médical complet</Text>
                  </View>
                  <ChevronRight color="#cbd5e1" size={20} />
                </TouchableOpacity>
                <View style={{flexDirection: 'row', gap: 6, marginTop: 10}}>
                  <TouchableOpacity 
                    style={styles.ordoBadge}
                    onPress={() => viewChildPrescriptions(child)}
                  >
                    <Text style={styles.ordoBadgeText}>📋 Ordo.</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.qrBadge}
                    onPress={() => showChildIdentityQR(child)}
                  >
                    <Text style={styles.qrBadgeText}>🆔 QR</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.vaccinBadge}
                    onPress={() => navigation.navigate('Vaccins', { childId: child.id, childName: child.name })}
                  >
                    <Text style={styles.vaccinBadgeText}>💉 Vaccins</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.qrSection}>
          <View style={styles.qrInfo}>
            <Text style={styles.qrTitle}>{t('vaccine_qr')}</Text>
            <Text style={styles.qrDesc}>{t('qr_share_desc')}</Text>
          </View>
          <QrCode color="#0d6e3f" size={40} />
        </TouchableOpacity>

        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>{t('logout')}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Prescriptions QR Modal */}
      <Modal visible={showPrescriptions} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Ordonnances de {selectedChild?.name || "l'enfant"} 📋
            </Text>
            {loadingPrescriptions ? (
              <ActivityIndicator size="large" color="#0d6e3f" style={{ marginVertical: 30 }} />
            ) : childPrescriptions.length === 0 ? (
              <Text style={{ color: '#64748b', textAlign: 'center', marginVertical: 20 }}>
                Aucune ordonnance disponible pour cet enfant.
              </Text>
            ) : (
              <ScrollView style={{ maxHeight: 400 }}>
                {childPrescriptions.map((item) => (
                  <View key={item.id} style={{ marginBottom: 20, backgroundColor: '#f8fafc', padding: 20, borderRadius: 20 }}>
                    <Text style={{ fontWeight: 'bold', color: '#1e293b', marginBottom: 5, textAlign: 'center' }}>
                      {item.diagnosis || "Ordonnance"}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#64748b', marginBottom: 12, textAlign: 'center' }}>
                      Dr. {item.doctor?.name || "FasoCare"} · {new Date(item.createdAt).toLocaleDateString()}
                    </Text>

                    <View style={{ alignItems: 'center', marginBottom: 12 }}>
                      <QRCode value={item.qr_token || ""} size={160} />
                      <Text style={{ marginTop: 6, fontSize: 9, fontWeight: '900', letterSpacing: 2, color: '#64748b' }}>
                        {item.qr_token}
                      </Text>
                    </View>

                    {item.items && item.items.length > 0 && (
                      <View style={{ borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 12, marginTop: 4 }}>
                        <Text style={{ fontSize: 12, fontWeight: '700', color: '#1e293b', marginBottom: 8 }}>💊 Médicaments prescrits :</Text>
                        {item.items.map((med) => {
                          const dispensed = med.status === 'DISPENSED';
                          const cachet = med.cachet;
                          return (
                            <View key={med.id} style={{ marginBottom: 10, backgroundColor: dispensed ? '#f0fdf4' : '#fef2f2', padding: 10, borderRadius: 10 }}>
                              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={{ fontSize: 13, fontWeight: '600', color: '#1e293b', flex: 1 }}>
                                  {med.medicineName}
                                  {med.dosage ? ` - ${med.dosage}` : ''}
                                </Text>
                                <Text style={{ fontSize: 11, fontWeight: '700', color: dispensed ? '#059669' : '#dc2626' }}>
                                  {dispensed ? '✓ Délivré' : med.status === 'UNAVAILABLE' ? '✗ Indisponible' : '⏳ En attente'}
                                </Text>
                              </View>
                              {med.quantity > 1 && (
                                <Text style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Qté: {med.quantity}</Text>
                              )}
                              {cachet && (
                                <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#bbf7d0' }}>
                                  <Text style={{ fontSize: 10, fontWeight: '600', color: '#166534' }}>🏪 Cachet légal</Text>
                                  <Text style={{ fontSize: 10, color: '#166534' }}>Pharmacie: {cachet.pharmacyName}</Text>
                                  <Text style={{ fontSize: 10, color: '#166534' }}>Pharmacien: {cachet.pharmacistName} {cachet.pharmacistLicense ? `(Lic. ${cachet.pharmacistLicense})` : ''}</Text>
                                  <Text style={{ fontSize: 10, color: '#166534' }}>Délivré le: {new Date(cachet.dispensedAt).toLocaleString()}</Text>
                                </View>
                              )}
                            </View>
                          );
                        })}
                      </View>
                    )}

                    {!item.isDispensed && (
                      <Text style={{ fontSize: 11, color: '#059669', marginTop: 8, fontWeight: '600', textAlign: 'center' }}>
                        Présentez ce QR code à votre pharmacien
                      </Text>
                    )}
                  </View>
                ))}
              </ScrollView>
            )}
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowPrescriptions(false)}>
                <Text style={styles.cancelBtnText}>Fermer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showScanner} animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'black' }}>
          <CameraView
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeSettings={{
              barcodeTypes: ["qr"],
            }}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.scannerOverlay}>
            <Text style={styles.scannerText}>Scannez le code du dossier de l'enfant pour la liaison sécurisée</Text>
            <TouchableOpacity style={styles.scannerCancel} onPress={() => setShowScanner(false)}>
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Child Identity QR Modal */}
      <Modal visible={showChildQR} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Identité de {selectedChildForQR?.name || "l'enfant"} 🆔
            </Text>
            <Text style={styles.modalSub}>
              Présentez ce QR code au personnel de santé pour identifier l'enfant.
            </Text>
            {selectedChildForQR && (
              <View style={{ alignItems: 'center', marginVertical: 20 }}>
                <QRCode 
                  value={`FASOCARE_ID:${selectedChildForQR.id}`} 
                  size={200} 
                />
                <View style={{ backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginTop: 16 }}>
                  <Text style={{ fontSize: 10, fontWeight: '900', letterSpacing: 2, color: '#64748b', textAlign: 'center' }}>
                    FASOCARE_ID:{selectedChildForQR.id}
                  </Text>
                </View>
              </View>
            )}
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowChildQR(false)}>
                <Text style={styles.cancelBtnText}>Fermer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={isAddModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ajouter un enfant 👶</Text>
            <Text style={styles.modalSub}>Saisissez le numéro de téléphone associé au compte de l'enfant.</Text>
            <TextInput 
              style={styles.input}
              placeholder="Numéro de l'enfant (ex: 70000001)"
              keyboardType="phone-pad"
              value={childPhone}
              onChangeText={setChildPhone}
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsAddModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.confirmBtn, isAdding && { opacity: 0.7 }]} 
                onPress={handleAddChildManual}
                disabled={isAdding}
              >
                {isAdding ? <ActivityIndicator color="white" /> : <Text style={styles.confirmBtnText}>Lier l'enfant</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scroll: { flex: 1 },
  header: { paddingHorizontal: 25, paddingTop: 60, paddingBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
  childName: { fontSize: 13, color: '#64748b' },
  notifBtn: { width: 40, height: 40, backgroundColor: '#f1f5f9', borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  notifDot: { position: 'absolute', top: 10, right: 10, width: 8, height: 8, backgroundColor: '#ef4444', borderRadius: 4, borderWidth: 2, borderColor: '#fff' },
  notifTray: { backgroundColor: '#fff', margin: 20, padding: 15, borderRadius: 15, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  notifTrayTitle: { fontSize: 14, fontWeight: 'bold', color: '#1e293b', marginBottom: 10 },
  notifEmpty: { color: '#94a3b8', fontSize: 12, fontStyle: 'italic' },
  notifItem: { marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 8 },
  notifItemTitle: { fontSize: 13, fontWeight: '700', color: '#1e293b' },
  notifItemContent: { fontSize: 12, color: '#64748b' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 25, marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  childList: { paddingHorizontal: 20 },
  childCard: { backgroundColor: 'white', padding: 15, borderRadius: 20, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  avatar: { width: 48, height: 48, backgroundColor: '#ecfdf5', borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  cardName: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
  cardSub: { fontSize: 12, color: '#64748b', marginTop: 2 },
  vaccinBadge: { backgroundColor: '#dbeafe', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  vaccinBadgeText: { color: '#1e40af', fontSize: 12, fontWeight: '700' },
  ordoBadge: { backgroundColor: '#fef3c7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  ordoBadgeText: { color: '#92400e', fontSize: 12, fontWeight: '700' },
  qrBadge: { backgroundColor: '#e0e7ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  qrBadgeText: { color: '#4338ca', fontSize: 12, fontWeight: '700' },
  emptyState: { alignItems: 'center', padding: 40, marginTop: 20 },
  emptyText: { textAlign: 'center', color: '#64748b', marginTop: 15, fontSize: 14, lineHeight: 20, paddingHorizontal: 20 },
  addBtnLarge: { backgroundColor: '#0d6e3f', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 12, marginTop: 20 },
  addBtnText: { color: 'white', fontWeight: 'bold' },
  qrSection: { margin: 20, padding: 20, backgroundColor: '#ecfdf5', borderRadius: 24, flexDirection: 'row', alignItems: 'center', gap: 15, borderWidth: 1, borderColor: '#d1fae5' },
  qrInfo: { flex: 1 },
  qrTitle: { fontSize: 16, fontWeight: 'bold', color: '#065f46' },
  qrDesc: { fontSize: 11, color: '#059669', marginTop: 4 },
  logoutBtn: { marginHorizontal: 20, marginBottom: 40, padding: 15, alignItems: 'center' },
  logoutText: { color: '#94a3b8', fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: 'white', borderRadius: 24, padding: 25 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b', marginBottom: 10 },
  modalSub: { fontSize: 14, color: '#64748b', marginBottom: 20 },
  input: { backgroundColor: '#f1f5f9', padding: 15, borderRadius: 12, fontSize: 16, marginBottom: 20 },
  modalBtns: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, padding: 15, alignItems: 'center', borderRadius: 12, backgroundColor: '#f1f5f9' },
  cancelBtnText: { color: '#64748b', fontWeight: 'bold' },
  confirmBtn: { flex: 2, padding: 15, alignItems: 'center', borderRadius: 12, backgroundColor: '#0d6e3f' },
  confirmBtnText: { color: 'white', fontWeight: 'bold' },
  scannerOverlay: { position: 'absolute', bottom: 50, left: 20, right: 20, alignItems: 'center' },
  scannerText: { color: 'white', textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 10, marginBottom: 20 },
  scannerCancel: { backgroundColor: '#ef4444', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 12 },
});

