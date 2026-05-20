import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, ActivityIndicator, TouchableOpacity, TextInput, Alert, Modal, FlatList } from 'react-native';
import { AlertTriangle, MapPin, Plus, Store, Navigation, CheckCircle, ChevronDown } from 'lucide-react-native';
import * as Location from 'expo-location';
import { useAuthStore } from '../../store/useAuthStore';
import { useTranslation } from 'react-i18next';
import { pharmacyService } from '../../services/api';

const BURKINA_CITIES = [
  { name: 'Ouagadougou', lat: 12.3714, lng: -1.5197 },
  { name: 'Bobo-Dioulasso', lat: 11.1772, lng: -4.2969 },
  { name: 'Koudougou', lat: 12.2513, lng: -2.3627 },
  { name: 'Kaya', lat: 13.0917, lng: -1.0844 },
  { name: "Fada N'Gourma", lat: 12.0588, lng: 0.3556 },
  { name: 'Banfora', lat: 10.6333, lng: -4.7667 },
  { name: 'Dédougou', lat: 12.4667, lng: -3.4667 },
  { name: 'Ouahigouya', lat: 13.5833, lng: -2.4167 },
  { name: 'Dori', lat: 14.0333, lng: -0.0333 },
  { name: 'Gaoua', lat: 10.3333, lng: -3.1833 },
  { name: 'Tenkodogo', lat: 11.7833, lng: -0.3667 },
  { name: 'Ziniaré', lat: 12.5833, lng: -1.3000 },
  { name: 'Manga', lat: 11.6667, lng: -1.0667 },
];

export default function InventoryScreen() {
  const { t } = useTranslation();
  const { isPharmacyOpen, togglePharmacy } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [pharmacies, setPharmacies] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState(null);
  
  // States for new pharmacy setup
  const [showSetup, setShowSetup] = useState(false);
  const [newName, setNewName] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newHours, setNewHours] = useState('07:00-20:00');
  const [isCreating, setIsCreating] = useState(false);
  const [selectedCity, setSelectedCity] = useState('');
  const [showCityPicker, setShowCityPicker] = useState(false);

  const loadData = async () => {
    try {
      const myPharms = await pharmacyService.getMyPharmacies();
      setPharmacies(myPharms || []);
      
      if (myPharms && myPharms.length > 0) {
        const [myAlerts, myStats] = await Promise.all([
          pharmacyService.getStockAlerts(),
          pharmacyService.getStats()
        ]);
        setAlerts(myAlerts || []);
        setStats(myStats);
      }
    } catch (err) {
      if (__DEV__) console.error("Inventory Load Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreatePharmacy = async () => {
    if (!newName || !newPhone) return Alert.alert(t('champs_requis'), t('veuillez_donner_nom_numero'));
    setIsCreating(true);
    try {
      const openingHours = {
        monday: newHours,
        tuesday: newHours,
        wednesday: newHours,
        thursday: newHours,
        friday: newHours,
        saturday: newHours,
        sunday: '10:00-18:00'
      };
      await pharmacyService.createPharmacy({ 
        name: newName, 
        location: newLocation, 
        phone: newPhone,
        openingHours: JSON.stringify(openingHours)
      });
      Alert.alert("Félicitations !", "Votre pharmacie est maintenant enregistrée sur FasoCare.");
      setShowSetup(false);
      loadData();
    } catch (err) {
      Alert.alert("Erreur", "Impossible d'enregistrer la pharmacie.");
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1e3a8a" />
      </View>
    );
  }

  if (pharmacies.length === 0 || showSetup) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Configuration Officine 🏥</Text>
          <Text style={styles.subtitle}>Enregistrez votre pharmacie pour commencer</Text>
        </View>
        
        <View style={styles.setupCard}>
          <Store color="#1e3a8a" size={40} style={{ alignSelf: 'center', marginBottom: 20 }} />
          <Text style={styles.setupLabel}>Nom de la Pharmacie</Text>
          <TextInput 
            style={styles.input} 
            placeholder="ex: Pharmacie du Progrès" 
            value={newName}
            onChangeText={setNewName}
          />
          
<Text style={styles.setupLabel}>Ville</Text>
          <TouchableOpacity style={styles.citySelector} onPress={() => setShowCityPicker(true)}>
            <MapPin size={16} color="#1e3a8a" />
            <Text style={{ flex: 1, color: selectedCity ? '#1e293b' : '#94a3b8', fontSize: 16, fontWeight: '600' }}>
              {selectedCity || 'Sélectionnez une ville'}
            </Text>
            <ChevronDown size={18} color="#64748b" />
          </TouchableOpacity>

          <Text style={styles.setupLabel}>Coordonnées GPS (lat,long)</Text>
          <TextInput 
            style={styles.input} 
            placeholder="ex: 12.251,-2.365" 
            value={newLocation}
            onChangeText={setNewLocation}
          />
          <TouchableOpacity 
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}
            onPress={async () => {
              const loc = await Location.getCurrentPositionAsync({});
              setNewLocation(`${loc.coords.latitude.toFixed(6)},${loc.coords.longitude.toFixed(6)}`);
            }}
          >
            <Navigation size={14} color="#1e3a8a" />
            <Text style={{ color: '#1e3a8a', fontSize: 12, fontWeight: '700' }}>Utiliser ma position actuelle</Text>
          </TouchableOpacity>

          <Modal visible={showCityPicker} transparent animationType="slide">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Choisir une ville</Text>
                <FlatList
                  data={BURKINA_CITIES}
                  keyExtractor={(item) => item.name}
                  style={{ width: '100%', maxHeight: 400 }}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[styles.cityItem, selectedCity === item.name && styles.cityItemActive]}
                      onPress={() => {
                        setSelectedCity(item.name);
                        setNewLocation(`${item.lat},${item.lng}`);
                        setShowCityPicker(false);
                      }}
                    >
                      <Text style={[styles.cityItemText, selectedCity === item.name && styles.cityItemTextActive]}>
                        {item.name}
                      </Text>
                      <Text style={styles.cityCoords}>{item.lat}, {item.lng}</Text>
                    </TouchableOpacity>
                  )}
                />
                <TouchableOpacity style={styles.closeBtn} onPress={() => setShowCityPicker(false)}>
                  <Text style={styles.closeBtnText}>FERMER</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
          
          <Text style={styles.setupLabel}>Numéro de téléphone de l'officine</Text>
          <TextInput 
            style={styles.input} 
            placeholder="ex: 25 30 00 00" 
            keyboardType="phone-pad"
            value={newPhone}
            onChangeText={setNewPhone}
          />
          
          <Text style={styles.setupLabel}>Horaire (format: HH:MM-HH:MM)</Text>
          <TextInput 
            style={styles.input} 
            placeholder="ex: 07:00-20:00" 
            value={newHours}
            onChangeText={setNewHours}
          />
          <Text style={{ fontSize: 11, color: '#64748b', marginBottom: 10 }}>Exemple: 07:00-20:00 (8h-20h)</Text>

          <TouchableOpacity 
            style={[styles.createBtn, isCreating && { opacity: 0.7 }]} 
            onPress={handleCreatePharmacy}
            disabled={isCreating}
          >
            {isCreating ? <ActivityIndicator color="white" /> : <Text style={styles.createBtnText}>ACTIVER MON OFFICINE</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  const activePharmacy = pharmacies[0];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('stock_alerts')}</Text>
        <Text style={styles.subtitle}>{t('logistic_supervision')}</Text>
      </View>

      <View style={styles.broadcastCard}>
        <View style={styles.broadcastInfo}>
          <Text style={styles.broadcastTitle}>{activePharmacy.name}</Text>
          <Text style={styles.broadcastSub}>{activePharmacy.location || "Burkina Faso"}</Text>
        </View>
        <View style={styles.switchRow}>
          <Text style={[styles.statusText, isPharmacyOpen ? styles.statusOpen : styles.statusClosed]}>
            {isPharmacyOpen ? t('pharmacy_open') : t('pharmacy_closed')}
          </Text>
          <Switch 
            value={isPharmacyOpen} 
            onValueChange={togglePharmacy} 
            trackColor={{false: '#cbd5e1', true: '#34d399'}}
            thumbColor={isPharmacyOpen ? '#10b981' : '#f8fafc'}
          />
        </View>
      </View>

      {alerts.length > 0 ? (
        alerts.map((alert, idx) => (
          <View key={idx} style={styles.alertCard}>
            <AlertTriangle color="#f97316" size={28} />
            <View style={styles.alertInfo}>
              <Text style={styles.alertTitle}>{t('imminent_rupture')}</Text>
              <Text style={styles.alertSub}>{alert.medicineName} - {t('stock_low')} ({alert.quantity} restants)</Text>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.noAlertBox}>
           <CheckCircle color="#10b981" size={24} />
           <Text style={styles.noAlertText}>Aucune rupture critique détectée</Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>{t('high_rotation')}</Text>
      <View style={styles.statsGrid}>
         <StatBox label="Consultations" value={stats?.prescriptions || 0} />
         <StatBox label="Alertes" value={stats?.shortages || 0} color="#ef4444" />
      </View>

      <TouchableOpacity style={styles.addStockBtn}>
         <Plus color="#1e3a8a" size={20} />
         <Text style={styles.addStockText}>Mettre à jour l'inventaire</Text>
      </TouchableOpacity>
      
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const StatBox = ({ label, value, color = '#1e3a8a' }) => (
  <View style={styles.statBox}>
     <Text style={[styles.statValue, { color }]}>{value}</Text>
     <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 25, paddingTop: 60, backgroundColor: '#1e3a8a' },
  title: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  subtitle: { color: '#dbeafe', fontSize: 14, marginTop: 4 },
  broadcastCard: { backgroundColor: '#fff', margin: 20, marginBottom: 0, padding: 20, borderRadius: 16, borderColor: '#e2e8f0', borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  broadcastInfo: { marginBottom: 15 },
  broadcastTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  broadcastSub: { fontSize: 13, color: '#64748b', marginTop: 2 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', padding: 15, borderRadius: 12 },
  statusText: { fontSize: 14, fontWeight: 'bold' },
  statusOpen: { color: '#10b981' },
  statusClosed: { color: '#ef4444' },
  alertCard: { flexDirection: 'row', backgroundColor: '#fff7ed', padding: 20, margin: 20, borderRadius: 16, alignItems: 'center', gap: 15, borderWidth: 1, borderColor: '#fed7aa' },
  alertInfo: { flex: 1 },
  alertTitle: { fontSize: 16, fontWeight: 'bold', color: '#9a3412' },
  alertSub: { fontSize: 13, color: '#c2410c', marginTop: 4 },
  noAlertBox: { flexDirection: 'row', alignItems: 'center', gap: 10, margin: 20, padding: 15, backgroundColor: '#f0fdf4', borderRadius: 12, borderWidth: 1, borderColor: '#dcfce7' },
  noAlertText: { color: '#166534', fontWeight: 'bold', fontSize: 13 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginHorizontal: 20, marginBottom: 15, color: '#1e293b', marginTop: 10 },
  statsGrid: { flexDirection: 'row', gap: 15, paddingHorizontal: 20, marginBottom: 20 },
  statBox: { flex: 1, backgroundColor: 'white', padding: 20, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#f1f5f9' },
  statValue: { fontSize: 24, fontWeight: 'bold' },
  statLabel: { fontSize: 12, color: '#64748b', marginTop: 4 },
  addStockBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#eff6ff', marginHorizontal: 20, padding: 18, borderRadius: 16, borderWidth: 1, borderColor: '#dbeafe' },
  addStockText: { color: '#1e3a8a', fontWeight: 'bold' },
  setupCard: { margin: 20, backgroundColor: 'white', padding: 25, borderRadius: 24, elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  setupLabel: { fontSize: 14, fontWeight: 'bold', color: '#334155', marginBottom: 8 },
  input: { backgroundColor: '#f1f5f9', padding: 15, borderRadius: 12, fontSize: 16, marginBottom: 20, color: '#1e293b' },
  createBtn: { backgroundColor: '#1e3a8a', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  createBtnText: { color: 'white', fontWeight: 'bold', letterSpacing: 1 },
  citySelector: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', padding: 15, borderRadius: 12, marginBottom: 20, gap: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.8)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: 'white', padding: 25, borderRadius: 24, alignItems: 'center', maxHeight: '70%' },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#1e293b', marginBottom: 20 },
  cityItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  cityItemActive: { backgroundColor: '#eff6ff', borderRadius: 12 },
  cityItemText: { fontSize: 16, fontWeight: '600', color: '#334155' },
  cityItemTextActive: { color: '#1e3a8a', fontWeight: '900' },
  cityCoords: { fontSize: 12, color: '#94a3b8' },
  closeBtn: { marginTop: 15, paddingVertical: 14, paddingHorizontal: 40, backgroundColor: '#1e3a8a', borderRadius: 12 },
  closeBtnText: { color: 'white', fontWeight: '900', fontSize: 14 }
});
