import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Modal, Alert } from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { useTranslation } from 'react-i18next';
import { Shield, FileText, Bell, Activity, Pill, Brain, User, LogOut, QrCode, ChevronRight, Calendar, Video } from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import { medicalService } from '../../services/api';
import { useNavigation } from '@react-navigation/native';

export default function PatientDashboard() {
  const { user, logout } = useAuthStore();
  const navigation = useNavigation();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    (async () => {
      try {
        const [histData, notifData] = await Promise.all([
          medicalService.getHistory(),
          medicalService.getNotifications()
        ]);
        setHistory(Array.isArray(histData) ? histData : histData?.data || []);
        setNotifications(Array.isArray(notifData) ? notifData : notifData?.data || []);
      } catch (err) {
        if (__DEV__) console.warn("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const idQrValue = `FASOCARE_ID:${user?.id || user?.sub || 'ANONYME'}`;
  const userRole = user?.activeRole || user?.roles?.[0] || 'PATIENT';
  const roleLabels = { PATIENT: 'citoyen', DOCTOR: 'medecin', PHARMACIST: 'pharmacien', PARENT: 'tuteur_legal' };

  return (
    <ScrollView style={[s.container, {backgroundColor: '#f8fafc'}]}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.appName}>FasoCare</Text>
          <Text style={s.subtitle}>{t('burkina_faso')} 🇧🇫</Text>
        </View>
        <View style={{flexDirection: 'row', gap: 8}}>
          <TouchableOpacity onPress={() => setShowNotif(true)} style={s.iconBtn}>
            <Bell size={20} color="#fff" />
            {notifications.length > 0 && <View style={s.badge} />}
          </TouchableOpacity>
          <TouchableOpacity onPress={logout} style={s.iconBtn}>
            <LogOut size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* User Info Card */}
      <View style={s.userCard}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{(user?.name || 'U')[0]}</Text>
        </View>
        <View style={{flex: 1}}>
          <Text style={s.userName}>{user?.name || t('citoyen')}</Text>
          <Text style={s.userRole}>{t(roleLabels[userRole]) || userRole}</Text>
          <Text style={s.userPhone}>{user?.phone || ''}</Text>
        </View>
      </View>

      {/* QR Code */}
      <View style={s.qrCard}>
        <View style={s.qrInner}>
          {loading ? <ActivityIndicator color="#0d6e3f" /> : (
            <QRCode value={idQrValue} size={160} color="#0f172a" backgroundColor="#fff" />
          )}
        </View>
        <View style={s.qrInfo}>
          <QrCode size={16} color="#0d6e3f" />
          <Text style={s.qrText}>{t('qr_identite')}</Text>
        </View>
      </View>

      {/* Notifications Modal */}
      <Modal visible={showNotif} transparent animationType="fade">
        <View style={s.overlay}>
          <View style={[s.modal, {backgroundColor: '#fff'}]}>
            <Text style={s.modalTitle}>{t('notifications')}</Text>
            {notifications.length === 0 ? (
              <Text style={{color: '#94a3b8', textAlign: 'center', marginVertical: 20}}>{t('aucune_notification')}</Text>
            ) : notifications.map(n => (
              <View key={n.id} style={s.notifItem}>
                <Text style={{fontWeight: '700', color: '#1e293b'}}>{n.title}</Text>
                <Text style={{color: '#64748b', fontSize: 12}}>{n.content}</Text>
              </View>
            ))}
            <TouchableOpacity style={s.btn} onPress={() => setShowNotif(false)}>
              <Text style={s.btnText}>{t('fermer')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Services Grid */}
      <Text style={s.sectionTitle}>{t('services')}</Text>
      <View style={s.grid}>
        <ServiceCard icon={User} label={t('mon_profil')} color="#f0fdf4" iconColor="#0d6e3f" onPress={() => navigation.navigate('Profile')} />
        <ServiceCard icon={FileText} label={t('dossier_medical')} color="#eff6ff" iconColor="#2563eb" onPress={() => navigation.navigate('MainTabs', { screen: 'Dossier' })} />
        <ServiceCard icon={Brain} label={t('ia_triage')} color="#faf5ff" iconColor="#7c3aed" onPress={() => navigation.navigate('Triage')} />
        <ServiceCard icon={Pill} label={t('pharmacies')} color="#eef2ff" iconColor="#3730a3" onPress={() => navigation.navigate('PharmacyDiscovery')} />
        <ServiceCard icon={Calendar} label={t('rendez_vous')} color="#fff7ed" iconColor="#ea580c" onPress={() => navigation.navigate('Appointments')} />
        <ServiceCard icon={Video} label={t('teleconsultation_label')} color="#f0fdf4" iconColor="#059669" onPress={() => {
          Alert.alert(
            t('teleconsultation_join_title'),
            t('teleconsultation_join_msg'),
            [
              { text: t('annuler'), style: "cancel" },
              { text: t('rejoindre'), onPress: () => navigation.navigate('Meeting', { patientName: user?.name || 'Patient' }) }
            ]
          );
        }} />
        <ServiceCard icon={Activity} label={t('urgences_menu')} color="#fef2f2" iconColor="#dc2626" onPress={() => navigation.navigate('MainTabs', { screen: 'Urgences' })} />
        <ServiceCard icon={Shield} label={t('mes_droits')} color="#f1f5f9" iconColor="#475569" onPress={() => {
          Alert.alert(t('mes_droits_titre'), t('mes_droits_contenu'));
        }} />
      </View>

      {/* Consultations */}
      <View style={{paddingHorizontal: 20}}>
        <Text style={s.sectionTitle}>{t('consultations')}</Text>
        {loading ? (
          <ActivityIndicator color="#0d6e3f" style={{marginVertical: 20}} />
        ) : history.length === 0 ? (
          <View style={s.emptyBox}>
            <FileText size={32} color="#cbd5e1" />
            <Text style={s.emptyText}>{t('aucune_consultation_rec')}</Text>
          </View>
        ) : history.map((item, idx) => (
          <View key={idx} style={s.consultItem}>
            <View style={s.consultLeft}>
              <Text style={s.consultDate}>{new Date(item.createdAt || item.date).toLocaleDateString('fr-FR')}</Text>
              <Text style={s.consultDoctor}>{item.doctor?.name || t('medecin')}</Text>
              {item.diagnosis && <Text style={s.consultDiag}>{item.diagnosis}</Text>}
              {item.qr_token && (
                <Text style={{
                  fontSize: 11, fontWeight: 'bold', marginTop: 4, alignSelf: 'flex-start',
                  color: item.isDispensed ? '#059669' : '#d97706',
                  backgroundColor: item.isDispensed ? '#d1fae5' : '#fef3c7',
                  paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, overflow: 'hidden',
                }}>
                  {item.isDispensed ? t('ordonnance_delivree') : t('ordonnance_attente')}
                </Text>
              )}
            </View>
            {item.qr_token && <ChevronRight size={20} color="#94a3b8" />}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const ServiceCard = ({ icon: Icon, label, color, iconColor, onPress }) => (
  <TouchableOpacity style={[s.card, {backgroundColor: color}]} onPress={onPress}>
    <Icon size={28} color={iconColor} />
    <Text style={[s.cardLabel, {color: iconColor}]}>{label}</Text>
  </TouchableOpacity>
);

const s = StyleSheet.create({
  container: { flex: 1 },
  header: { backgroundColor: '#0d6e3f', padding: 20, paddingTop: 60, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  appName: { color: '#fff', fontSize: 22, fontWeight: '900', letterSpacing: 1 },
  subtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 },
  iconBtn: { padding: 10, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12 },
  badge: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: '#ef4444' },
  userCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', margin: 20, marginBottom: 0, padding: 20, borderRadius: 24, gap: 16, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
  avatar: { width: 56, height: 56, borderRadius: 20, backgroundColor: '#0d6e3f', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 24, fontWeight: '900' },
  userName: { fontSize: 18, fontWeight: '900', color: '#1e293b' },
  userRole: { fontSize: 12, color: '#0d6e3f', fontWeight: '700', textTransform: 'uppercase' },
  userPhone: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  qrCard: { alignItems: 'center', backgroundColor: '#fff', margin: 20, marginBottom: 0, padding: 20, borderRadius: 24, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
  qrInner: { padding: 10, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#f1f5f9' },
  qrInfo: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  qrText: { fontSize: 11, color: '#0d6e3f', fontWeight: '700' },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#1e293b', paddingHorizontal: 20, marginTop: 20, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 12 },
  card: { width: '47%', padding: 20, borderRadius: 20, alignItems: 'center', gap: 10 },
  cardLabel: { fontSize: 13, fontWeight: '900' },
  overlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.8)', justifyContent: 'center', alignItems: 'center' },
  modal: { width: '85%', padding: 24, borderRadius: 24, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#1e293b', marginBottom: 16 },
  notifItem: { padding: 12, borderRadius: 12, backgroundColor: '#f8fafc', marginBottom: 8, width: '100%' },
  btn: { marginTop: 16, paddingHorizontal: 40, paddingVertical: 12, backgroundColor: '#0d6e3f', borderRadius: 12 },
  btnText: { color: '#fff', fontWeight: '900' },
  consultItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 8, borderWidth: 1, borderColor: '#f1f5f9' },
  consultLeft: { flex: 1 },
  consultDate: { fontSize: 12, color: '#94a3b8', fontWeight: '700' },
  consultDoctor: { fontSize: 15, fontWeight: '900', color: '#1e293b', marginTop: 2 },
  consultDiag: { fontSize: 13, color: '#0d6e3f', fontWeight: '600', marginTop: 4 },
  emptyBox: { alignItems: 'center', padding: 30, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#f1f5f9', borderStyle: 'dashed' },
  emptyText: { color: '#94a3b8', marginTop: 8, fontWeight: '500' },
});
