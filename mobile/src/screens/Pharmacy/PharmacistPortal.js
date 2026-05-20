import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Package, Scan, ShoppingCart, AlertTriangle } from 'lucide-react-native';
import { pharmacyService } from '../../services/api';
import { useTranslation } from 'react-i18next';

const PharmacistPortal = ({ navigation }) => {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lowStockItems, setLowStockItems] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsData, alertsData] = await Promise.all([
        pharmacyService.getStats().catch(() => null),
        pharmacyService.getStockAlerts().catch(() => []),
      ]);
      setStats(statsData);
      setLowStockItems(Array.isArray(alertsData) ? alertsData : []);
    } catch (err) {
      if (__DEV__) console.warn('Failed to load pharmacy data', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#009E49" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {lowStockItems.length > 0 && lowStockItems.slice(0, 3).map((item, idx) => (
        <View key={idx} style={styles.warningCard}>
          <AlertTriangle color="#EF2B2D" />
          <View style={styles.warningText}>
            <Text style={styles.warningTitle}>{t('alerte_rupture')}</Text>
            <Text style={styles.warningSub}>
              {t('stock_bas_format', { name: item.medicationName || t('medicament_default'), quantity: item.quantity || 0 })}
            </Text>
          </View>
        </View>
      ))}

      <TouchableOpacity style={styles.scanBtn} onPress={() => navigation?.navigate('Scanner')}>
        <Scan size={40} color="white" />
        <Text style={styles.scanBtnText}>{t('scanner_ordonnance').toUpperCase()}</Text>
      </TouchableOpacity>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Package color="#2C3E50" />
          <Text style={styles.statNum}>{stats?.totalMedications ?? '—'}</Text>
          <Text style={styles.statLabel}>{t('medicaments')}</Text>
        </View>
        <View style={styles.statBox}>
          <ShoppingCart color="#009E49" />
          <Text style={styles.statNum}>{stats?.weeklySales ?? '—'}</Text>
          <Text style={styles.statLabel}>{t('ventes_sem')}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>{t('gestion_stock_title')}</Text>
      {(stats?.categories || ['Antibiotiques', 'Antipaludéens', 'Vitamines']).map((cat) => (
        <TouchableOpacity key={typeof cat === 'string' ? cat : cat.name} style={styles.categoryItem}>
          <Text style={styles.categoryName}>{typeof cat === 'string' ? cat : cat.name}</Text>
          <Text style={styles.categoryCount}>{t('voir_tout')}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1 },
  warningCard: { 
    flexDirection: 'row', 
    backgroundColor: '#FFEBEE', 
    padding: 15, 
    borderRadius: 12, 
    borderLeftWidth: 5, 
    borderLeftColor: '#EF2B2D',
    alignItems: 'center',
    marginBottom: 20
  },
  warningText: { marginLeft: 15 },
  warningTitle: { fontWeight: 'bold', color: '#EF2B2D' },
  warningSub: { fontSize: 12, color: '#444' },
  scanBtn: { 
    backgroundColor: '#2C3E50', 
    padding: 30, 
    borderRadius: 15, 
    alignItems: 'center',
    marginBottom: 20
  },
  scanBtnText: { color: 'white', fontWeight: 'bold', marginTop: 10, fontSize: 16 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statBox: { backgroundColor: 'white', padding: 15, borderRadius: 12, width: '48%', alignItems: 'center' },
  statNum: { fontSize: 20, fontWeight: 'bold', marginTop: 5 },
  statLabel: { fontSize: 12, color: '#666' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#2C3E50', marginBottom: 15 },
  categoryItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    backgroundColor: 'white', 
    padding: 18, 
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center'
  },
  categoryName: { fontWeight: '500' },
  categoryCount: { color: '#009E49', fontSize: 12 }
});

export default PharmacistPortal;
