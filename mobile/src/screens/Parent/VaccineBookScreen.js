import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { Syringe, CheckCircle, Calendar, LineChart, ArrowLeft } from 'lucide-react-native'; 
import { vaccinationService } from '../../services/api';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function VaccineBookScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { childId, childName } = route.params || {};
  
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      if (!childId) return;
      const data = await vaccinationService.getRecords(childId);
      setRecords(data || []);
    } catch (err) {
      if (__DEV__) console.error("Fetch Vaccines Error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [childId]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [childId]);

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0284c7']} />}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
           <ArrowLeft color="white" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>{t('digital_vaccine_book')}</Text>
        <Text style={styles.subtitle}>{childName || "Profil Enfant"} 🇧🇫</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('administered_vaccines')}</Text>
        
        {loading && !refreshing ? (
          <ActivityIndicator color="#0284c7" size="large" style={{ marginTop: 20 }} />
        ) : records.length === 0 ? (
          <View style={styles.placeholderBox}>
             <Syringe color="#94a3b8" size={40} />
             <Text style={{ color: '#64748b', marginTop: 10 }}>{t('no_vaccines')}.</Text>
          </View>
        ) : (
          records.map((item) => (
            <View key={item.id} style={styles.vaccineCard}>
              <View style={styles.vaccineIcon}>
                <CheckCircle color="#0ea5e9" size={24} />
              </View>
              <View style={styles.vaccineInfo}>
                <Text style={styles.vaccineName}>{item.vaccineName}</Text>
                <Text style={styles.vaccineDate}>{t('done_on')} {new Date(item.dateAdministered).toLocaleDateString()}</Text>
              </View>
              {item.nextDoseDate && (
                <View style={styles.nextDose}>
                  <Calendar color="#f97316" size={14} />
                  <Text style={styles.nextDoseText}>{t('next_dose')}: {new Date(item.nextDoseDate).toLocaleDateString()}</Text>
                </View>
              )}
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
         <Text style={styles.sectionTitle}>{t('growth_charts')}</Text>
         <View style={styles.placeholderBox}>
             <LineChart color="#0ea5e9" size={50} strokeWidth={1} />
            <Text style={styles.comingSoon}>{t('biometric_deploy')}</Text>
         </View>
      </View>
      <View style={{height: 40}} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 25, paddingTop: 60, backgroundColor: '#0284c7' },
  backBtn: { marginBottom: 15 },
  title: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  subtitle: { color: '#e0f2fe', fontSize: 16, marginTop: 4, fontWeight: '900' },
  section: { padding: 20 },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', color: '#334155', marginBottom: 15 },
  vaccineCard: { flexDirection: 'row', backgroundColor: 'white', padding: 18, borderRadius: 20, alignItems: 'center', marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  vaccineIcon: { backgroundColor: '#f0f9ff', padding: 10, borderRadius: 12, marginRight: 15 },
  vaccineInfo: { flex: 1 },
  vaccineName: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
  vaccineDate: { fontSize: 13, color: '#64748b', marginTop: 2 },
  nextDose: { backgroundColor: '#fff7ed', padding: 6, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 4 },
  nextDoseText: { fontSize: 10, color: '#c2410c', fontWeight: 'bold' },
  placeholderBox: { padding: 40, backgroundColor: 'white', borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#e0f2fe' },
  comingSoon: { fontSize: 14, color: '#64748b', textAlign: 'center', marginTop: 15 }
});
