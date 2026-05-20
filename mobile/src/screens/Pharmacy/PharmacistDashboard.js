import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { pharmacyService } from '../../services/api';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';


export default function PharmacistDashboard() {
  const { t } = useTranslation();
  const [validating, setValidating] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({ prescriptions: 0, shortages: 0 });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [alertsData, statsData] = await Promise.all([
        pharmacyService.getStockAlerts(),
        pharmacyService.getStats()
      ]);
      setAlerts(alertsData || []);
      setStats(statsData || { prescriptions: 0, shortages: 0 });
    } catch (e) {
      setAlerts([]);
      setStats({ prescriptions: 0, shortages: 0 });
    } finally {
      setLoading(false);
    }
  };

  const navigation = useNavigation();

  React.useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleScan = () => {
    navigation.navigate('Scanner');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('gestion_stock')}</Text>
        <Text style={styles.subtitle}>{t('pharmacie_centre')}</Text>
      </View>

      <View style={styles.scanSection}>
        <TouchableOpacity style={styles.scanButton} onPress={handleScan} disabled={validating}>
          {validating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.scanButtonText}>{t('scanner_ordonnance')}</Text>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>{t('alertes_rupture')}</Text>
      <FlatList
        data={alerts}
        refreshing={loading}
        onRefresh={fetchDashboardData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.alertCard}>
            <View style={styles.alertInfo}>
              <Text style={styles.medName}>{item.medicineName}</Text>
              <Text style={[styles.medQty, { color: item.quantity <= 5 ? '#e11d48' : '#eab308' }]}>
                {t('stock_format', { quantity: item.quantity, threshold: item.thresholdAlert || 10 })}
              </Text>
            </View>
            <AlertTriangle color={item.quantity <= 5 ? '#e11d48' : '#eab308'} size={24} />
          </View>
        )}
      />

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.prescriptions}</Text>
          <Text style={styles.statLabel}>{t('ordonnances_label')}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.shortages}</Text>
          <Text style={styles.statLabel}>{t('ruptures')}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.refreshBtn} onPress={fetchDashboardData}>
        <Text style={styles.refreshText}>{t('mettre_a_jour_stocks')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 20, paddingTop: 60 },
  header: { marginBottom: 25 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0f172a' },
  subtitle: { fontSize: 14, color: '#64748b' },
  scanSection: { marginBottom: 30 },
  scanButton: { backgroundColor: '#0d6e3f', padding: 18, borderRadius: 12, alignItems: 'center' },
  scanButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#475569', marginBottom: 15 },
  alertCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  alertInfo: { flex: 1 },
  medName: { fontSize: 16, fontWeight: 'semibold', color: '#1e293b' },
  medQty: { fontSize: 12, color: '#ef4444' },
  statsRow: { flexDirection: 'row', gap: 15, marginTop: 20 },
  statBox: { flex: 1, backgroundColor: '#fff', padding: 15, borderRadius: 12, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#0d6e3f' },
  statLabel: { fontSize: 10, color: '#64748b', textTransform: 'uppercase' },
});
