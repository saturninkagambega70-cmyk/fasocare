import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, FileText, Activity, ShieldPlus, Pill, User, Syringe, Video, MessageSquare } from 'lucide-react-native';
import { useAuthStore } from '../store/useAuthStore';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

// Patient Dashboard is the only screen fully created for now
import PatientDashboard from '../screens/Home/PatientDashboard';
import DoctorDashboard from '../screens/Doctor/DoctorDashboard';
import ConsultationScreen from '../screens/Doctor/ConsultationScreen';
import PrescriptionScreen from '../screens/Doctor/PrescriptionScreen';
import DoctorMessagingScreen from '../screens/Doctor/DoctorMessagingScreen';
import PatientMessagingScreen from '../screens/Doctor/DoctorMessagingScreen';
import MedicalRecordScreen from '../screens/Patient/MedicalRecordScreen';
import EmergencyScreen from '../screens/Patient/EmergencyScreen';
import ParentDashboard from '../screens/Home/ParentDashboard';
import VaccineBookScreen from '../screens/Parent/VaccineBookScreen';
import PharmacyScannerScreen from '../screens/Pharmacist/PharmacyScannerScreen';
import InventoryScreen from '../screens/Pharmacist/InventoryScreen';

// Placeholder Component for incomplete screens
const PlaceholderScreen = ({ route }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' }}>
    <Text style={{ fontSize: 18, color: '#1a4a2e', fontWeight: 'bold' }}>{route.name}</Text>
    <Text style={{ color: '#64748b', marginTop: 10 }}>Cet espace est en cours de construction 🚧</Text>
  </View>
);

const Tab = createBottomTabNavigator();

export default function RoleTabNavigator() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const rawRole = user?.activeRole || (Array.isArray(user?.roles) ? user?.roles?.[0] : user?.roles) || 'PATIENT';
  const role = ['PATIENT', 'DOCTOR', 'PHARMACIST', 'PARENT'].includes(rawRole) ? rawRole : 'PATIENT'; 

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let IconComp = Home;
          if (route.name === 'Mon QR') IconComp = User;
          if (route.name === 'Dossier') IconComp = FileText;
          if (route.name === 'Urgences') IconComp = Activity;
          if (route.name === 'Clinique') IconComp = Home;
          if (route.name === 'Téléconsult.') IconComp = Video;
          if (route.name === 'Ordonnances') IconComp = FileText;
          if (route.name === 'Scanner') IconComp = ShieldPlus;
          if (route.name === 'Stocks') IconComp = Pill;
          if (route.name === 'Enfants') IconComp = Home;
          if (route.name === 'Vaccins') IconComp = Syringe;
          if (route.name === 'Messagerie') IconComp = MessageSquare;
          
          return <IconComp size={size} color={color} strokeWidth={focused ? 2.5 : 2} />;
        },
        tabBarActiveTintColor: '#009E49',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarLabelStyle: { fontWeight: '600', fontSize: 11, marginBottom: 4 }
      })}
    >
      {role === 'PATIENT' && (
        <>
          <Tab.Screen name="Mon QR" component={PatientDashboard} options={{ tabBarLabel: t('tab_home') }} />
          <Tab.Screen name="Dossier" component={MedicalRecordScreen} options={{ tabBarLabel: t('tab_record') }} />
          <Tab.Screen name="Messagerie" component={PatientMessagingScreen} options={{ tabBarLabel: 'Messagerie' }} />
          <Tab.Screen name="Urgences" component={EmergencyScreen} options={{ tabBarLabel: t('tab_emergency') }} />
        </>
      )}
      
      {role === 'DOCTOR' && (
        <>
          <Tab.Screen name="Clinique" component={DoctorDashboard} options={{ tabBarLabel: t('tab_clinic') }} />
          <Tab.Screen name="Téléconsult." component={ConsultationScreen} options={{ tabBarLabel: t('tab_consultation') }} />
          <Tab.Screen name="Messagerie" component={DoctorMessagingScreen} options={{ tabBarLabel: 'Messagerie' }} />
          <Tab.Screen name="Ordonnances" component={PrescriptionScreen} options={{ tabBarLabel: t('tab_prescriptions') }} />
        </>
      )}
      
      {role === 'PHARMACIST' && (
        <>
          <Tab.Screen name="Scanner" component={PharmacyScannerScreen} options={{ tabBarLabel: t('tab_scanner') }} />
          <Tab.Screen name="Stocks" component={InventoryScreen} options={{ tabBarLabel: t('tab_stocks') }} />
        </>
      )}
      
      {role === 'PARENT' && (
        <>
          <Tab.Screen name="Enfants" component={ParentDashboard} options={{ tabBarLabel: t('tab_home') }} />
          <Tab.Screen name="Vaccins" component={VaccineBookScreen} options={{ tabBarLabel: 'Vaccins' }} />
        </>
      )}
    </Tab.Navigator>
  );
}
