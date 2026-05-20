import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, ScrollView } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { ShieldAlert, AlertCircle } from 'lucide-react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { medicalService } from '../../services/api';
import * as Location from 'expo-location';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';

export default function EmergencyScreen() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [sendingSos, setSendingSos] = useState(false);
  const [sosSent, setSosSent] = useState(false);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [emergencies, setEmergencies] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      try {
        let loc = await Location.getCurrentPositionAsync({});
        setLocation(loc.coords);
      } catch (err) {
        setErrorMsg('Unable to get current location');
      }
    })();

    loadEmergencyHistory();
  }, []);

  const loadEmergencyHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const data = await medicalService.getEmergencies();
      setEmergencies(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      if (__DEV__) console.warn('Failed to load emergencies:', err);
    } finally {
      setLoadingHistory(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadEmergencyHistory();
  }, [loadEmergencyHistory]);

  const triggerSos = async () => {
    setSendingSos(true);
    try {
      // Haptic feedback for SOS button
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

      // Fetch fresh location for accuracy
      const loc = await Location.getCurrentPositionAsync({});
      const payload = {
        description: `Urgence SOS de ${user?.name || user?.phone}`,
        latitude: String(loc.coords.latitude),
        longitude: String(loc.coords.longitude),
        priority: 'CRITICAL',
        serviceType: 'MEDICAL'
      };
      
      // Real API call to SOS endpoint
      const response = await medicalService.sendSOS(payload);
      if (__DEV__) console.log('SOS Response:', response);
      
      setSosSent(true);
      Alert.alert(
        t('succes_sos_title'),
        t('succes_sos_message'),
        [{ text: t('ok'), onPress: () => setSosSent(false) }]
      );
    } catch (err) {
      if (__DEV__) console.error("SOS Error:", err);
      Alert.alert(
        t('erreur_sos_title'),
        t('erreur_sos_message'),
        [{ text: t('reessayer'), onPress: triggerSos }, { text: t('annuler') }]
      );
    } finally {
      setSendingSos(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ShieldAlert color="white" size={28} />
        <View style={{marginLeft: 10}}>
           <Text style={styles.title}>{t('emergency_title')}</Text>
           <Text style={styles.subtitle}>{t('emergency_subtitle')}</Text>
        </View>
      </View>

      <MapView 
        style={styles.map}
        region={location ? {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.0121,
        } : {
          latitude: 12.2383, 
          longitude: -1.5616, // Ouagadougou
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
        showsUserLocation={true}
      >
        {location && (
          <Marker
            coordinate={location}
            title={t('ma_position')}
            description={t('alerte_sos_cours')}
            pinColor="red"
          />
        )}
      </MapView>

      <View style={styles.sosContainer}>
        <TouchableOpacity 
          style={[styles.sosButton, sendingSos && styles.sosButtonActive, sosSent && styles.sosButtonSent]} 
          onPress={triggerSos}
          disabled={sendingSos || sosSent}
        >
          <Text style={styles.sosText}>
            {sendingSos ? t('signal_sos_cours') : (sosSent ? t('secours_alertes') : t('bouton_sos'))}
          </Text>
          {!sendingSos && !sosSent && <Text style={styles.sosSub}>{t('danger_vital')}</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.floatingCard} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1e40af" />}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <AlertCircle size={18} color="#1e40af" />
          <Text style={styles.historyTitle}>{t('historique_alertes')}</Text>
        </View>
        
        {loadingHistory ? (
          <ActivityIndicator color="#1e40af" />
        ) : emergencies.length > 0 ? (
          <View style={styles.emergencyList}>
            {emergencies.slice(0, 3).map((emergency) => (
              <View key={emergency.id} style={styles.emergencyItem}>
                <Text style={styles.emergencyStatus}>{emergency.status}</Text>
                <Text style={styles.emergencyDate}>
                  {emergency.createdAt ? new Date(emergency.createdAt).toLocaleString('fr-FR') : t('date_inconnue')}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.noEmergencies}>{t('aucune_alerte')}</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 25, paddingTop: 60, backgroundColor: '#ef4444', flexDirection: 'row', alignItems: 'center' },
  title: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  subtitle: { color: '#fee2e2', fontSize: 13, marginTop: 4 },
  map: { width: Dimensions.get('window').width, flex: 1 },
  sosContainer: { position: 'absolute', top: 150, left: 20, right: 20, alignItems: 'center' },
  sosButton: { backgroundColor: '#ef4444', padding: 20, borderRadius: 50, width: '100%', alignItems: 'center', shadowColor: '#ef4444', shadowOpacity: 0.5, shadowRadius: 15, elevation: 10, borderWidth: 4, borderColor: '#fee2e2' },
  sosButtonActive: { backgroundColor: '#b91c1c', borderColor: '#ef4444' },
  sosButtonSent: { backgroundColor: '#10b981', borderColor: '#d1fae5', shadowColor: '#10b981' },
  sosText: { color: 'white', fontWeight: '900', fontSize: 18, letterSpacing: 1 },
  sosSub: { color: 'white', fontSize: 11, marginTop: 5, opacity: 0.8, fontWeight: 'bold' },
  floatingCard: { position: 'absolute', bottom: 40, left: 20, right: 20, backgroundColor: 'white', padding: 20, borderRadius: 16, elevation: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  historyTitle: { fontSize: 14, color: '#1e3a8a', fontWeight: 'bold' },
  emergencyList: { gap: 8 },
  emergencyItem: { padding: 10, backgroundColor: '#f0f9ff', borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#ef4444' },
  emergencyStatus: { fontSize: 12, color: '#1e40af', fontWeight: 'bold', textTransform: 'uppercase' },
  emergencyDate: { fontSize: 11, color: '#64748b', marginTop: 4 },
  noEmergencies: { fontSize: 13, color: '#94a3b8', fontStyle: 'italic' }
});
