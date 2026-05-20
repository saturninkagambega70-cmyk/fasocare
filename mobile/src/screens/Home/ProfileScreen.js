import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert } from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { useTheme } from '../../context/ThemeContext';
import { User, Phone, Shield, Droplets, Globe } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { userService } from '../../services/api';
import { useTranslation } from 'react-i18next';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function ProfileScreen() {
  const { user, setUser } = useAuthStore();
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const [showPicker, setShowPicker] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(user?.bloodGroup || '');

  const updateBloodGroup = async (group) => {
    try {
      const updated = await userService.updateProfile({ bloodGroup: group });
      setSelectedGroup(group);
      if (updated) {
        setUser({ ...user, bloodGroup: group });
      }
      setShowPicker(false);
    } catch (err) {
      Alert.alert('Erreur', 'Impossible de mettre à jour le groupe sanguin');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.title}>Mon Profil</Text>
      </View>

      <View style={styles.content}>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.row}>
            <User color={colors.primary} size={24} />
            <View style={styles.info}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Nom</Text>
              <Text style={[styles.value, { color: colors.text }]}>{user?.name || "Non renseigné"}</Text>
            </View>
          </View>
          
          <View style={styles.row}>
            <Phone color={colors.primary} size={24} />
            <View style={styles.info}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Téléphone</Text>
              <Text style={[styles.value, { color: colors.text }]}>{user?.phone || "Non renseigné"}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <Shield color={colors.primary} size={24} />
            <View style={styles.info}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Rôle</Text>
              <Text style={[styles.value, { color: colors.text }]}>{user?.activeRole || user?.roles?.[0] || "PATIENT"}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.row} onPress={() => setShowPicker(true)}>
            <Droplets color="#db2777" size={24} />
            <View style={styles.info}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Groupe Sanguin</Text>
              <Text style={[styles.value, { color: colors.text }]}>{selectedGroup || "Appuyez pour définir"}</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.row}>
            <Globe color="#0891b2" size={24} />
            <View style={styles.info}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>{t('language')}</Text>
              <View style={{flexDirection: 'row', gap: 8, marginTop: 4}}>
                {['fr', 'mo', 'di', 'fu'].map((lng) => (
                  <TouchableOpacity
                    key={lng}
                    onPress={() => i18n.changeLanguage(lng)}
                    style={[styles.langPill, i18n.language === lng && styles.langPillActive]}
                  >
                    <Text style={[styles.langPillText, i18n.language === lng && styles.langPillTextActive]}>
                      {lng === 'fr' ? 'FR' : lng === 'mo' ? 'MO' : lng === 'di' ? 'DI' : 'FU'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        <Modal visible={showPicker} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Sélectionner le groupe sanguin</Text>
              <View style={styles.bloodGrid}>
                {BLOOD_GROUPS.map(group => (
                  <TouchableOpacity
                    key={group}
                    style={[
                      styles.bloodOption,
                      { borderColor: colors.border },
                      selectedGroup === group && { backgroundColor: colors.primary }
                    ]}
                    onPress={() => updateBloodGroup(group)}
                  >
                    <Text style={[
                      styles.bloodText,
                      { color: colors.text },
                      selectedGroup === group && { color: '#fff' }
                    ]}>{group}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowPicker(false)}>
                <Text style={styles.cancelText}>Annuler</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <TouchableOpacity 
          style={[styles.backBtn, { backgroundColor: colors.primary }]} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backBtnText}>Retour au tableau de bord</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 25, paddingTop: 60, alignItems: 'center' },
  title: { color: '#fff', fontSize: 24, fontWeight: '900' },
  content: { padding: 20 },
  card: { padding: 20, borderRadius: 24, borderWidth: 1, elevation: 2, gap: 20 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  info: { flex: 1 },
  label: { fontSize: 13, fontWeight: '700', marginBottom: 4 },
  value: { fontSize: 16, fontWeight: '900' },
  backBtn: { marginTop: 30, padding: 18, borderRadius: 15, alignItems: 'center' },
  backBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', padding: 24, borderRadius: 20 },
  modalTitle: { fontSize: 18, fontWeight: '900', textAlign: 'center', marginBottom: 20 },
  bloodGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  bloodOption: { width: 60, height: 45, borderRadius: 10, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  bloodText: { fontSize: 16, fontWeight: '700' },
  cancelBtn: { marginTop: 20, padding: 12, alignItems: 'center' },
  cancelText: { color: '#64748b', fontSize: 16, fontWeight: '600' },
  langPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0' },
  langPillActive: { backgroundColor: '#0d6e3f', borderColor: '#0d6e3f' },
  langPillText: { fontSize: 12, fontWeight: '700', color: '#475569' },
  langPillTextActive: { color: '#fff' }
});
