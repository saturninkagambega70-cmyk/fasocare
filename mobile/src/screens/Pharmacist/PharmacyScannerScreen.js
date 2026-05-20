import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView, Button } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Pill, User, ClipboardCheck, AlertTriangle, MapPin } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '../../store/useAuthStore';
import { medicalService } from '../../services/api';
import { useTranslation } from 'react-i18next';

export default function PharmacyScannerScreen() {
  const { t } = useTranslation();
  const { logout } = useAuthStore();
  const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);
  const [prescription, setPrescription] = useState(null);
  const [itemsData, setItemsData] = useState(null);
  const [choices, setChoices] = useState({});
  const [dispensing, setDispensing] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const scanningRef = useRef(false);

  if (!permission) return <View style={styles.container} />;
  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Nous avons besoin de la caméra pour valider les ordonnances FasoCare.</Text>
        <Button onPress={requestPermission} title="Autoriser la caméra" color="#1e3a8a" />
      </View>
    );
  }

  const handleBarcodeScanned = async ({ data }) => {
    if (scanningRef.current || dispensing || prescription) return;
    scanningRef.current = true;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setLoading(true);
    try {
      const dataFound = await medicalService.validatePrescription(data);
      setPrescription({ ...dataFound, token: data });

      setLoadingItems(true);
      try {
        const itemsResp = await medicalService.getConsultationItems(data);
        if (itemsResp?.items?.length > 0) {
          setItemsData(itemsResp);
          const initial = {};
          itemsResp.items.forEach(item => {
            if (item.status === 'PENDING') {
              initial[item.id] = item.disponible ? 'DISPENSED' : 'UNAVAILABLE';
            } else {
              initial[item.id] = item.status;
            }
          });
          setChoices(initial);
        }
      } catch {
        setItemsData(null);
      }
      setLoadingItems(false);
    } catch (err) {
      const status = err?.response?.status;
      let msg = "Ordonnance non reconnue.";
      if (status === 410) msg = "Cette ordonnance a expiré (validité 24h).";
      else if (status === 409) msg = "Cette ordonnance a déjà été délivrée.";
      else if (status === 404) msg = "QR code invalide. Scannez un QR d'ordonnance FasoCare.";
      Alert.alert("Erreur", msg);
      setPrescription(null);
      setItemsData(null);
    } finally {
      setLoading(false);
      scanningRef.current = false;
    }
  };

  const toggleItem = (itemId, currentStatus) => {
    if (currentStatus !== 'PENDING') return;
    setChoices(prev => ({
      ...prev,
      [itemId]: prev[itemId] === 'DISPENSED' ? 'UNAVAILABLE' : 'DISPENSED',
    }));
  };

  const handleDispenseItems = async () => {
    if (!prescription || !itemsData) return;
    setDispensing(true);
    try {
      const itemsPayload = Object.entries(choices)
        .filter(([id, status]) => status === 'DISPENSED' || status === 'UNAVAILABLE')
        .map(([id, status]) => ({ id, status }));

      const result = await medicalService.dispenseItems(prescription.token, itemsPayload);
      setItemsData(result);

      const dispensed = itemsPayload.filter(i => i.status === 'DISPENSED').length;
      const unavailable = itemsPayload.filter(i => i.status === 'UNAVAILABLE').length;
      Alert.alert(
        "Délivrance enregistrée",
        `${dispensed} produit(s) délivré(s).${unavailable > 0 ? `\n${unavailable} produit(s) indisponible(s) signalé(s).` : ''}`,
        [{ text: "OK", onPress: () => { setPrescription(null); setItemsData(null); setChoices({}); } }]
      );
    } catch (err) {
      Alert.alert("Erreur", "Impossible de valider la délivrance.");
    } finally {
      setDispensing(false);
    }
  };

  const handleLegacyDispense = async () => {
    if (!prescription) return;
    setDispensing(true);
    try {
      await medicalService.dispense(prescription.token);
      Alert.alert("Succès", "Délivrance enregistrée avec succès ✅", [
        { text: "OK", onPress: () => setPrescription(null) }
      ]);
    } catch (err) {
      Alert.alert("Erreur", "Impossible de valider la délivrance.");
    } finally {
      setDispensing(false);
    }
  };

  const renderItemRow = (item) => {
    const isPending = item.status === 'PENDING';
    const choice = choices[item.id];

    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.itemRow, !isPending && styles.itemRowDone]}
        onPress={() => toggleItem(item.id, item.status)}
        disabled={!isPending}
      >
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.medicineName}</Text>
          {item.dosage ? <Text style={styles.itemDetail}>{item.dosage}</Text> : null}
          <Text style={styles.itemDetail}>Qté: {item.quantity} | Stock: {item.stockDispo}</Text>
        </View>

        <View style={styles.itemStatus}>
          {!isPending ? (
            <Text style={item.status === 'DISPENSED' ? styles.badgeGreen : styles.badgeRed}>
              {item.status === 'DISPENSED' ? '✓ Délivré' : '✗ Indispo'}
            </Text>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.choiceBtn, choice === 'DISPENSED' && styles.choiceBtnGreen]}
                onPress={() => setChoices(prev => ({ ...prev, [item.id]: 'DISPENSED' }))}
              >
                <Text style={[styles.choiceText, choice === 'DISPENSED' && styles.choiceTextActive]}>Dispo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.choiceBtn, choice === 'UNAVAILABLE' && styles.choiceBtnRed]}
                onPress={() => setChoices(prev => ({ ...prev, [item.id]: 'UNAVAILABLE' }))}
              >
                <Text style={[styles.choiceText, choice === 'UNAVAILABLE' && styles.choiceTextActive]}>Indispo</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
         <TouchableOpacity onPress={logout} style={styles.logoutBtnPharma}>
            <Text style={styles.logoutTextPharma}>Quitter</Text>
         </TouchableOpacity>
      </View>

      {prescription ? (
        <View style={styles.detailsContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.detailsHeader}>
              <ClipboardCheck color="#10b981" size={50} />
              <Text style={styles.detailsTitle}>{t('confirm')}</Text>
              <Text style={styles.tokenText}>{prescription.token}</Text>
            </View>

            <View style={styles.infoBox}>
               <View style={styles.infoRow}>
                 <User size={18} color="#64748b" />
                 <Text style={styles.infoLabel}>{t('patient')}:</Text>
                 <Text style={styles.infoVal}>{prescription.patient?.phone || "Patient FasoCare"}</Text>
               </View>
               <View style={styles.infoRow}>
                 <User size={18} color="#0d6e3f" />
                 <Text style={styles.infoLabel}>{t('doctor')}:</Text>
                 <Text style={styles.infoVal}>Dr. {prescription.doctor?.phone || "FasoCare"}</Text>
               </View>
               <View style={styles.infoRow}>
                 <MapPin size={18} color="#1e3a8a" />
                 <Text style={styles.infoLabel}>{t('hospital')}:</Text>
                 <Text style={styles.infoVal}>{prescription.hospital || "Centre de Santé"}</Text>
               </View>
               <View style={styles.infoRow}>
                 <AlertTriangle size={15} color="#ef4444" />
                 <Text style={styles.infoLabel}>Diagnostic:</Text>
                 <Text style={styles.infoVal}>{prescription.diagnosis}</Text>
               </View>
            </View>

            {/* Prescription Items or Legacy treatmentPlan */}
            {loadingItems ? (
              <View style={{ padding: 30, alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#10b981" />
                <Text style={{ marginTop: 10, color: '#64748b' }}>Vérification du stock...</Text>
              </View>
            ) : itemsData?.items?.length > 0 ? (
              <View style={styles.itemsCard}>
                <View style={styles.itemsHeader}>
                  <Pill color="#1e3a8a" size={20} />
                  <Text style={styles.itemsTitle}>Produits prescrits</Text>
                  {itemsData.isDispensed && <Text style={styles.badgeGreen}>Terminée</Text>}
                </View>
                {itemsData.items.map(renderItemRow)}

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryText}>
                    {Object.values(choices).filter(v => v === 'DISPENSED').length}/{itemsData.items.filter(i => i.status === 'PENDING').length} disponibles
                  </Text>
                </View>

                {itemsData.items.some(i => i.status === 'PENDING') && (
                  <TouchableOpacity
                    style={[styles.dispenseBtn, dispensing && {opacity: 0.7}]}
                    onPress={handleDispenseItems}
                    disabled={dispensing}
                  >
                    {dispensing ? <ActivityIndicator color="white" /> : <Text style={styles.dispenseText}>Valider la délivrance</Text>}
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              /* Legacy fallback: no items */
              <View style={styles.treatmentCard}>
                 <View style={styles.treatmentHeader}>
                    <Pill color="#1e3a8a" size={20} />
                    <Text style={styles.treatmentTitle}>{t('prescriptions')}</Text>
                 </View>
                 <Text style={styles.treatmentContent}>{prescription.treatmentPlan}</Text>
                 <TouchableOpacity
                   style={[styles.dispenseBtn, dispensing && {opacity: 0.7}]}
                   onPress={handleLegacyDispense}
                   disabled={dispensing}
                 >
                   {dispensing ? <ActivityIndicator color="white" /> : <Text style={styles.dispenseText}>{t('dispense')} 📦</Text>}
                 </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity style={styles.cancelLink} onPress={() => { setPrescription(null); setItemsData(null); setChoices({}); }}>
              <Text style={styles.cancelText}>Annuler le scan</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      ) : (
        <>
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            onBarcodeScanned={handleBarcodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ["qr"],
            }}
          />
          <View pointerEvents="none" style={styles.overlay}>
             <View style={styles.scanTarget}>
                {loading && <ActivityIndicator color="#10b981" size="large" />}
             </View>
             <Text style={styles.scanInstruction}>
               {loading ? "Vérification..." : "Alignez le QR d'Ordonnance"}
             </Text>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  permissionContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30, backgroundColor: '#f8fafc' },
  permissionText: { textAlign: 'center', marginBottom: 20, fontSize: 16, color: '#334155', lineHeight: 24 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  scanTarget: { width: 250, height: 250, borderWidth: 3, borderColor: '#10b981', backgroundColor: 'transparent', borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  scanInstruction: { color: 'white', marginTop: 30, fontSize: 16, fontWeight: 'bold' },
  detailsContainer: { flex: 1, backgroundColor: '#f1f5f9', padding: 25, paddingTop: 60 },
  detailsHeader: { alignItems: 'center', marginBottom: 30 },
  detailsTitle: { fontSize: 24, fontWeight: 'bold', color: '#1e293b', marginTop: 15 },
  tokenText: { fontSize: 13, color: '#64748b', fontWeight: 'bold', letterSpacing: 1, marginTop: 5 },
  infoBox: { backgroundColor: 'white', padding: 20, borderRadius: 20, marginBottom: 20 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  infoLabel: { fontSize: 14, color: '#64748b', width: 80 },
  infoVal: { fontSize: 14, fontWeight: 'bold', color: '#1e293b', flex: 1 },
  itemsCard: { backgroundColor: 'white', padding: 20, borderRadius: 20, marginBottom: 20 },
  itemsHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 15 },
  itemsTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b', flex: 1 },
  itemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  itemRowDone: { opacity: 0.6 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: 'bold', color: '#1e293b' },
  itemDetail: { fontSize: 12, color: '#64748b', marginTop: 2 },
  itemStatus: { flexDirection: 'row', gap: 6 },
  choiceBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1.5, borderColor: '#e2e8f0' },
  choiceBtnGreen: { backgroundColor: '#d1fae5', borderColor: '#10b981' },
  choiceBtnRed: { backgroundColor: '#fee2e2', borderColor: '#ef4444' },
  choiceText: { fontSize: 12, fontWeight: 'bold', color: '#64748b' },
  choiceTextActive: { color: '#1e293b' },
  badgeGreen: { fontSize: 12, fontWeight: 'bold', color: '#059669', backgroundColor: '#d1fae5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeRed: { fontSize: 12, fontWeight: 'bold', color: '#dc2626', backgroundColor: '#fee2e2', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  summaryRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 10, marginBottom: 5 },
  summaryText: { fontSize: 13, color: '#64748b', fontWeight: '600' },
  treatmentCard: { backgroundColor: '#eef2ff', padding: 20, borderRadius: 24, marginBottom: 30, borderWidth: 1, borderColor: '#dee1ff' },
  treatmentHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 15 },
  treatmentTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e3a8a' },
  treatmentContent: { fontSize: 15, color: '#312e81', lineHeight: 22, fontStyle: 'italic', marginBottom: 20 },
  dispenseBtn: { backgroundColor: '#10b981', padding: 20, borderRadius: 16, alignItems: 'center', shadowColor: '#10b981', shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  dispenseText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  cancelLink: { marginTop: 20, alignItems: 'center', padding: 10 },
  cancelText: { color: '#64748b', fontSize: 14 },
  headerRow: { position: 'absolute', top: 50, right: 20, zIndex: 100 },
  logoutBtnPharma: { backgroundColor: 'rgba(239, 68, 68, 0.9)', padding: 12, borderRadius: 10 },
  logoutTextPharma: { color: 'white', fontWeight: 'bold', fontSize: 13 }
});
