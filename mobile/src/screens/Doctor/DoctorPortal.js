import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { UserPlus, QrCode, ClipboardList, History } from 'lucide-react-native';
import { medicalService } from '../../services/api';
import { useNavigation } from '@react-navigation/native';

const DoctorPortal = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
       try {
         const data = await medicalService.getLatestPatients();
         setPatients(data || []);
       } catch (err) {
          if (__DEV__) console.warn(err);
       } finally {
         setLoading(false);
       }
    };
    fetchPatients();
  }, []);

  const MenuBtn = ({ icon: Icon, title, sub, color, onPress }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={[styles.iconBox, { backgroundColor: color + '22' }]}>
        <Icon size={24} color={color} />
      </View>
      <View style={styles.menuText}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuSub}>{sub}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>Actions Médicales</Text>
      <MenuBtn 
        icon={UserPlus} 
        title="Nouveau Patient" 
        sub="Démarrer une consultation" 
        color="#009E49" 
        onPress={() => navigation.navigate('MainTabs', { screen: 'Clinique' })}
      />
      <MenuBtn 
        icon={QrCode} 
        title="Scanner QR Patient" 
        sub="Accès rapide au dossier" 
        color="#2C3E50" 
        onPress={() => navigation.navigate('Triage')}
      />
      <MenuBtn 
        icon={ClipboardList} 
        title="Prescription" 
        sub="Générer ordonnance QR" 
        color="#FCD116" 
        onPress={() => navigation.navigate('MainTabs', { screen: 'Ordonnances' })}
      />
      
      <Text style={styles.sectionHeader}>Derniers Patients</Text>
      <FlatList
        data={patients}
        refreshing={loading}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.patientItem}>
            <View style={styles.patientInfo}>
              <Text style={styles.patientName}>{item.patient?.name || 'Patient'}</Text>
              <Text style={styles.patientTime}>{item.createdAt ? new Date(item.createdAt).toLocaleTimeString() : ''}</Text>
            </View>
            <History size={20} color="#666" />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  sectionHeader: { fontSize: 18, fontWeight: 'bold', color: '#2C3E50', marginVertical: 15 },
  menuItem: { 
    flexDirection: 'row', 
    backgroundColor: 'white', 
    padding: 15, 
    borderRadius: 12, 
    marginBottom: 10,
    alignItems: 'center'
  },
  iconBox: { padding: 10, borderRadius: 10 },
  menuText: { marginLeft: 15 },
  menuTitle: { fontWeight: 'bold', color: '#444' },
  menuSub: { fontSize: 12, color: '#999' },
  patientItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: '#EEE', 
    padding: 15, 
    borderRadius: 10,
    marginBottom: 5
  },
  patientName: { fontWeight: 'bold' },
  patientTime: { fontSize: 12, color: '#666' }
});

export default DoctorPortal;
