import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import RoleTabNavigator from './RoleTabNavigator';
import VideoCallScreen from '../screens/Medical/VideoCallScreen';
import PatientRecordScreen from '../screens/Doctor/PatientRecordScreen';
import EpidemicReportScreen from '../screens/Doctor/EpidemicReportScreen';

import ProfileScreen from '../screens/Home/ProfileScreen';
import PrescriptionListScreen from '../screens/Patient/PrescriptionListScreen';
import PharmacyDiscoveryScreen from '../screens/Patient/PharmacyDiscoveryScreen';
import TriageScreen from '../screens/Patient/TriageScreen';
import ChatScreen from '../screens/Medical/ChatScreen';
import BookAppointmentScreen from '../screens/Patient/BookAppointmentScreen';
import AppointmentScreen from '../screens/Patient/AppointmentScreen';

const Stack = createStackNavigator();

export const AppNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="MainTabs" 
        component={RoleTabNavigator} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="PrescriptionList" 
        component={PrescriptionListScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="PharmacyDiscovery" 
        component={PharmacyDiscoveryScreen} 
        options={{ title: 'Pharmacies de garde' }} 
      />
      <Stack.Screen 
        name="Meeting" 
        component={VideoCallScreen} 
        options={{ title: 'Téléconsultation Vidéo', headerTransparent: true, headerTintColor: '#fff' }} 
      />
      <Stack.Screen 
        name="PatientRecord" 
        component={PatientRecordScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="EpidemicReport" 
        component={EpidemicReportScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="Triage" 
        component={TriageScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="Chat" 
        component={ChatScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="Appointments" 
        component={AppointmentScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="BookAppointment" 
        component={BookAppointmentScreen} 
        options={{ headerShown: false }} 
      />
    </Stack.Navigator>
  );
};
