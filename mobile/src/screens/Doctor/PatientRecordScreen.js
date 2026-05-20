import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Droplets, ShieldAlert, Heart, FileText, ChevronRight, User, Plus, Clock } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { medicalService, userService } from '../../services/api';
import Svg, { Path, Circle } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';

const TrendChart = ({ data, color, label }) => {
  const { colors } = useTheme();
  const height = 120;
  const width = 280;
  const padding = 20;

  if (!data || data.length < 2) return null;

  const max = Math.max(...data) + 2;
  const min = Math.min(...data) - 2;
  const range = max - min || 1;

  const points = data.map((val, i) => {
    const x = padding + (i * (width - 2 * padding) / (data.length - 1));
    const y = height - padding - ((val - min) / range * (height - 2 * padding));
    return { x, y };
  });

  const pathData = points.reduce((acc, p, i) => 
    i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`, "");

  return (
    <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.chartLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Svg height={height} width={width}>
        <Path d={pathData} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />
        {points.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r="4" fill={colors.card} stroke={color} strokeWidth="2" />
        ))}
      </Svg>
    </View>
  );
};

export default function PatientRecordScreen() {
  const { t } = useTranslation();
  const { colors, isDarkMode } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { patientName, patientPhone, patient } = route.params || { patientName: "Patient Inconnu" };
  const patientId = patient?.id || route.params?.patientId;
  
  const [history, setHistory] = useState([]);
  const [patientProfile, setPatientProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        if (patientId) {
          const [histData, profileData] = await Promise.all([
            medicalService.getPatientHistory(patientId),
            userService.findById(patientId).catch(() => null),
          ]);
          setHistory(Array.isArray(histData) ? histData : []);
          setPatientProfile(profileData || patient || null);
        } else {
          setHistory([]);
        }
      } catch (err) {
        if (__DEV__) console.warn(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [patientId]);

  const latest = history[history.length - 1] || {};
  const bloodGroup = patientProfile?.bloodGroup || latest.bloodGroup || "N/A";
  const allergy = latest.allergies || "Aucune";
  const bp = latest.bloodPressure || "--/--";
  
  const tempData = history.map(h => h.temperature).filter(t => t);
  const weightData = history.map(h => h.weight).filter(w => w);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Retour"
          >
            <ChevronRight color="white" size={24} style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>
              {patientName}
            </Text>
            <Text style={styles.headerSub}>{patientPhone || t('health_subtitle')}</Text>
          </View>
          <View style={styles.headerAvatar}>
            <User color="white" size={32} />
          </View>
        </View>

        {/* Clinical Overview */}
        <View style={styles.grid}>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Droplets color={colors.accent} size={24} />
            <Text style={[styles.cardValue, { color: colors.text }]}>{bloodGroup}</Text>
            <Text style={styles.cardLabel}>{t('blood_group')}</Text>
          </View>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ShieldAlert color="#f97316" size={24} />
            <Text style={[styles.cardValue, { color: colors.text }]}>{allergy}</Text>
            <Text style={styles.cardLabel}>{t('allergy')}</Text>
          </View>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Heart color="#db2777" size={24} />
            <Text style={[styles.cardValue, { color: colors.text }]}>{bp}</Text>
            <Text style={styles.cardLabel}>Tension</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Tendances Cliniques 📊</Text>
          {tempData.length > 1 || weightData.length > 1 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 15, paddingRight: 25 }}>
              {tempData.length > 1 && <TrendChart data={tempData} color="#ef4444" label="Température (°C)" />}
              {weightData.length > 1 && <TrendChart data={weightData} color={colors.primary} label="Poids (kg)" />}
            </ScrollView>
          ) : (
             <Text style={{color: colors.textSecondary, fontSize: 13, fontStyle: 'italic'}}>Pas assez de points pour générer les graphiques.</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Audit des Consultations 📜</Text>
          {loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
          ) : history.length === 0 ? (
            <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 20 }}>Aucun antécédent trouvé.</Text>
          ) : (
            history.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={[styles.historyItem, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => navigation.navigate('MainTabs', { screen: 'Ordonnances', params: { patient: item.patient } })}
              >
                <View style={[styles.historyIcon, { backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9' }]}>
                  <FileText color={colors.primary} size={20} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.historyDiagnosis, { color: colors.text }]}>{item.diagnosis || "Consultation Routine"}</Text>
                  <Text style={[styles.historyMeta, { color: colors.textSecondary }]}>{new Date(item.createdAt).toLocaleDateString()} · Dr. {item.doctor?.name || "Zongo"}</Text>
                </View>
                <ChevronRight color={colors.textSecondary} size={20} />
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Vaccinations & Prévention 💉</Text>
          {history.filter(h => h.type === 'VACCINATION').length > 0 ? (
            history.filter(h => h.type === 'VACCINATION').slice(0, 3).map(v => (
              <View key={v.id} style={[styles.vaccineCard, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: 8 }]}>
                <Clock color="#f59e0b" size={20} />
                <Text style={[styles.vaccineText, { color: colors.text }]}>{v.vaccineName || 'Vaccin'} — {new Date(v.createdAt).toLocaleDateString('fr-FR')}</Text>
              </View>
            ))
          ) : (
            <View style={[styles.vaccineCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Clock color="#94a3b8" size={20} />
              <Text style={[{ color: colors.textSecondary, fontSize: 13, fontWeight: '600' }]}>Aucun vaccin enregistré pour ce patient.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: colors.primary }]} 
        onPress={() => navigation.navigate('MainTabs', { screen: 'Ordonnances', params: { patient: route.params?.patient, phone: patientPhone } })}
      >
        <Plus color="white" size={32} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 25, paddingTop: 60, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, flexDirection: 'row', alignItems: 'center', gap: 15 },
  backBtn: { padding: 10, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12 },
  headerInfo: { flex: 1 },
  headerTitle: { color: 'white', fontSize: 22, fontWeight: '900' },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '700' },
  headerAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center' },
  grid: { flexDirection: 'row', padding: 20, gap: 12, marginTop: -20 },
  card: { flex: 1, padding: 18, borderRadius: 24, alignItems: 'center', borderWidth: 1, elevation: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  cardValue: { fontSize: 17, fontWeight: '900', marginVertical: 6 },
  cardLabel: { fontSize: 10, color: '#94a3b8', fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
  section: { paddingHorizontal: 25, marginTop: 30 },
  sectionTitle: { fontSize: 18, fontWeight: '900', marginBottom: 15 },
  chartCard: { padding: 15, borderRadius: 24, borderWidth: 1 },
  chartLabel: { fontSize: 11, fontWeight: '900', textTransform: 'uppercase', marginBottom: 10, letterSpacing: 1 },
  historyItem: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 24, marginBottom: 12, borderWidth: 1, gap: 14 },
  historyIcon: { padding: 12, borderRadius: 16 },
  historyDiagnosis: { fontSize: 15, fontWeight: '900' },
  historyMeta: { fontSize: 12, marginTop: 4, fontWeight: '500' },
  vaccineCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 18, borderRadius: 24, borderWidth: 1 },
  vaccineText: { fontSize: 13, fontWeight: '700' },
  fab: { position: 'absolute', bottom: 30, right: 25, width: 68, height: 68, borderRadius: 34, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 15 }
});
