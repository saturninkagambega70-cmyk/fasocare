import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { Video, User, ChevronRight } from 'lucide-react-native';
import { medicalService } from '../../services/api';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

export default function ConsultationScreen() {
  const { t } = useTranslation();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const loadQueue = async () => {
    try {
      const data = await medicalService.getLatestPatients();
      setPatients(data || []);
    } catch (err) {
      if (__DEV__) console.warn("Queue Error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const startMeeting = (item) => {
    const name = item.patient?.name || item.patient?.phone || 'Patient';
    navigation.navigate('Meeting', { patientName: name });
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadQueue(); }} colors={['#009E49']} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{t('teleconsultation')}</Text>
        <Text style={styles.subtitle}>FasoCare 🇧🇫</Text>
      </View>

      <View style={styles.queueContainer}>
        <Text style={styles.sectionTitle}>{t('waiting_patients')}</Text>
        
        {loading && !refreshing ? (
          <ActivityIndicator color="#009E49" size="large" style={{ marginTop: 30 }} />
        ) : patients.length === 0 ? (
          <View style={styles.emptyState}>
             <Video size={40} color="#cbd5e1" />
             <Text style={styles.emptyText}>{t('empty_queue')}</Text>
          </View>
        ) : (
          patients.map((item) => (
            <TouchableOpacity key={item.id} style={styles.queueCard} onPress={() => startMeeting(item)}>
               <View style={styles.patientIcon}>
                  <User size={20} color="#0d6e3f" />
               </View>
               <View style={styles.patientInfo}>
                 <Text style={styles.name}>{item.patient?.name || item.patient?.phone || "Inconnu"}</Text>
                 <Text style={styles.motif}>{item.diagnosis || "Consultation Routine"} · {item.urgencyLevel || 'NORMAL'}</Text>
               </View>
               <View style={styles.actionRow}>
                 <Video size={20} color="#009E49" />
                 <ChevronRight size={18} color="#cbd5e1" />
               </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      <TouchableOpacity style={[styles.startCallBtn, patients.length === 0 && {opacity: 0.5}]} onPress={() => patients[0] && startMeeting(patients[0])}>
        <Video size={24} color="white" />
        <Text style={styles.startCallText}>{t('start_queue')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 25, paddingTop: 60, backgroundColor: '#1a4a2e' },
  title: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  subtitle: { color: '#e8ede9', fontSize: 14, marginTop: 4 },
  queueContainer: { padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#334155', marginBottom: 15 },
  queueCard: { flexDirection: 'row', backgroundColor: 'white', padding: 20, borderRadius: 16, alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, shadowColor:'#000', shadowOpacity:0.04, shadowRadius:10, elevation:2 },
  patientInfo: { flex: 1 },
  patientIcon: { backgroundColor: '#f0fdf4', padding: 8, borderRadius: 10, marginRight: 15 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
  motif: { fontSize: 13, color: '#64748b', marginTop: 2 },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  startCallBtn: { backgroundColor: '#009E49', flexDirection: 'row', margin: 20, padding: 18, borderRadius: 16, justifyContent: 'center', alignItems: 'center', gap: 10, shadowColor:'#000', shadowOpacity:0.1, shadowRadius:8, elevation:5 },
  startCallText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  emptyState: { alignItems: 'center', padding: 40, backgroundColor: 'white', borderRadius: 20, marginTop: 10 },
  emptyText: { color: '#64748b', marginTop: 10, fontSize: 14 }
});
