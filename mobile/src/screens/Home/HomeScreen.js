import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/useAuthStore';
import { Syringe, Pill, Calendar, QrCode, LogOut } from 'lucide-react-native';
import DoctorPortal from '../Doctor/DoctorPortal';
import PharmacistPortal from '../Pharmacy/PharmacistPortal';

const HomeScreen = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();

  const ActionCard = ({ icon: Icon, title, color, onPress }) => (
    <TouchableOpacity style={[styles.card, { borderLeftColor: color }]} onPress={onPress}>
      <Icon size={32} color={color} />
      <Text style={styles.cardTitle}>{title}</Text>
    </TouchableOpacity>
  );

  const renderContent = () => {
    switch (user?.activeRole || user?.roles?.[0]) {
      case 'DOCTOR':
        return <DoctorPortal />;
      case 'PHARMACIST':
        return <PharmacistPortal />;
      case 'PATIENT':
      case 'PARENT':
      default:
        return (
          <>
            <View style={styles.grid}>
              <ActionCard 
                icon={Syringe} 
                title={t('mon_carnet_vaccination')} 
                color="#009E49" 
              />
              <ActionCard 
                icon={Calendar} 
                title={t('prendre_rdv_action')} 
                color="#FCD116" 
              />
              <ActionCard 
                icon={Pill} 
                title={t('mes_ordonnances')} 
                color="#2C3E50" 
              />
              <ActionCard 
                icon={QrCode} 
                title={t('partager_dossier')} 
                color="#666" 
              />
            </View>

            <View style={styles.alertCard}>
              <Text style={styles.alertTitle}>{t('prochain_rappel')}</Text>
              <Text style={styles.alertText}>Vaccin Polio J-3 pour Moussa Jr.</Text>
            </View>
          </>
        );
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{t('bonjour')}</Text>
          <Text style={styles.userName}>{user?.name || t('utilisateur')}</Text>
          <Text style={styles.roleLabel}>{user?.activeRole || user?.roles?.[0] || ''}</Text>
        </View>
        <TouchableOpacity onPress={logout}>
          <LogOut color="#EF2B2D" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statusBadge}>
          <View style={[styles.statusDot, { backgroundColor: '#009E49' }]} />
          <Text style={styles.statusText}>{t('connecte_offline')}</Text>
        </View>
      </View>

      {renderContent()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 30, 
    paddingTop: 60,
    backgroundColor: 'white' 
  },
  greeting: { fontSize: 16, color: '#666' },
  userName: { fontSize: 24, fontWeight: 'bold', color: '#2C3E50' },
  statsContainer: { padding: 20 },
  statusBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#E8F5E9', 
    padding: 10, 
    borderRadius: 20,
    alignSelf: 'flex-start'
  },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  statusText: { fontSize: 12, color: '#009E49', fontWeight: 'bold' },
  grid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    padding: 10, 
    justifyContent: 'space-between' 
  },
  card: {
    backgroundColor: 'white',
    width: '46%',
    padding: 20,
    margin: '2%',
    borderRadius: 15,
    alignItems: 'center',
    borderLeftWidth: 5,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Elevation for Android
    elevation: 3
  },
  cardTitle: { marginTop: 15, textAlign: 'center', fontWeight: 'bold', color: '#2C3E50' },
  alertCard: {
    margin: 20,
    padding: 20,
    backgroundColor: '#FFF9C4',
    borderRadius: 15,
    borderLeftWidth: 5,
    borderLeftColor: '#FCD116'
  },
  alertTitle: { fontWeight: 'bold', fontSize: 16, color: '#444' },
  alertText: { marginTop: 5, color: '#666' }
});

export default HomeScreen;
