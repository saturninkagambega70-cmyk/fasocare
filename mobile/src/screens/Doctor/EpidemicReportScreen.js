import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { AlertTriangle, ShieldCheck, ChevronRight, Send, Info, ArrowLeft } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { medicalService } from '../../services/api';
import { savePendingAction, initDatabase } from '../../database/db';

export default function EpidemicReportScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [disease, setDisease] = useState('');
  const [customDisease, setCustomDisease] = useState('');
  const [cases, setCases] = useState('1');
  const [location, setLocation] = useState('Ouagadougou, Secteur 15');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const diseaseName = customDisease || disease;
    if (!diseaseName) {
      Alert.alert("Attention", "Veuillez spécifier la maladie à déclaration obligatoire (MDO).");
      return;
    }
    const casesCount = parseInt(cases, 10);
    if (isNaN(casesCount) || casesCount < 1) {
      Alert.alert("Attention", "Le nombre de cas doit être un nombre valide supérieur à 0.");
      return;
    }
    setLoading(true);
    const reportData = {
      disease: diseaseName,
      casesCount,
      location,
      notes
    };

    try {
      await medicalService.reportEpidemic(reportData);
      setLoading(false);
      Alert.alert(
        "Signalement Transmis 🚀",
        "Le rapport a été envoyé avec succès au Ministère de la Santé (DGISS) et à l'OMS. Merci pour votre vigilance.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      if (__DEV__) console.log("Epidemic report network error, saving offline...");
      try {
        const db = await initDatabase();
        await savePendingAction(db, 'REPORT_EPIDEMIC', reportData);
        setLoading(false);
        Alert.alert(
          "Sauvegardé Hors-ligne 📡",
          "Aucune connexion détectée. Le rapport a été mis en file d'attente et sera transmis automatiquement dès le retour de la connexion.",
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
      } catch (dbErr) {
        setLoading(false);
        Alert.alert("Erreur", "Échec de la sauvegarde locale.");
      }
    }
  };

  const diseases = [
    { id: '1', name: 'Paludisme Grave' },
    { id: '2', name: 'Choléra' },
    { id: '3', name: 'Méningite Cérébro-spinale' },
    { id: '4', name: 'Fièvre Jaune' },
    { id: '5', name: 'Rage humaine' },
    { id: '6', name: 'Autre' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
        <View style={[styles.header, { backgroundColor: colors.accent || '#ef4444' }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft color="white" size={24} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Audit Epidémique 🚨</Text>
            <Text style={styles.headerSub}>Signalement DGISS / OMS</Text>
          </View>
        </View>

        <View style={styles.alertBox}>
          <Info color="#b91c1c" size={18} />
          <Text style={styles.alertText}>
            En vertu du Règlement Sanitaire International (RSI), tout cas de MDO doit être signalé dans les 24h.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Maladie Détectée (MDO)</Text>
          <View style={styles.diseaseGrid}>
             {diseases.map((d) => (
               <TouchableOpacity 
                 key={d.id} 
                 style={[styles.diseaseChip, disease === d.name && { backgroundColor: '#ef4444', borderColor: '#ef4444' }, { borderColor: colors.border }]}
                 onPress={() => { setDisease(d.name); if (d.name !== 'Autre') setCustomDisease(''); }}
               >
                 <Text style={[styles.diseaseChipText, disease === d.name && { color: 'white' }, { color: colors.textSecondary }]}>{d.name}</Text>
               </TouchableOpacity>
             ))}
          </View>
          {disease === 'Autre' && (
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text, marginTop: 12 }]}
              placeholder="Précisez la maladie..."
              placeholderTextColor={colors.textSecondary}
              value={customDisease}
              onChangeText={setCustomDisease}
            />
          )}
        </View>

        <View style={styles.form}>
           <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Nombre de Cas</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                keyboardType="numeric"
                value={cases}
                onChangeText={setCases}
              />
           </View>

           <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Localisation Précise</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                value={location}
                onChangeText={setLocation}
              />
           </View>

           <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Notes Complémentaires</Text>
              <TextInput 
                style={[styles.input, styles.textarea, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                multiline
                numberOfLines={4}
                placeholder="Ex: Facteurs de risque identifiés, cluster familial..."
                placeholderTextColor={colors.textSecondary}
                value={notes}
                onChangeText={setNotes}
              />
           </View>

           <TouchableOpacity 
             style={[styles.submitBtn, { backgroundColor: colors.accent || '#ef4444' }]} 
             onPress={handleSubmit}
             disabled={loading}
           >
             {loading ? <ActivityIndicator color="white" /> : (
               <>
                 <Send color="white" size={20} />
                 <Text style={styles.submitBtnText}>TRANSMETTRE AU MINISTÈRE</Text>
               </>
             )}
           </TouchableOpacity>

           <View style={styles.securitySeal}>
              <ShieldCheck color={colors.success} size={14} />
              <Text style={[styles.securityText, { color: colors.success }]}>Transmission Chiffrée & Certifiée DGISS</Text>
           </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 25, paddingTop: 60, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, flexDirection: 'row', alignItems: 'center', gap: 15 },
  backBtn: { padding: 10, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12 },
  headerInfo: { flex: 1 },
  headerTitle: { color: 'white', fontSize: 22, fontWeight: '900' },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  alertBox: { margin: 25, padding: 15, backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 16, flexDirection: 'row', gap: 10, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)' },
  alertText: { flex: 1, fontSize: 11, color: '#b91c1c', fontWeight: '800', lineHeight: 16 },
  section: { paddingHorizontal: 25, marginTop: 10 },
  label: { fontSize: 13, fontWeight: '900', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  diseaseGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  diseaseChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  diseaseChipText: { fontSize: 12, fontWeight: '700' },
  form: { padding: 25 },
  inputGroup: { marginBottom: 20 },
  input: { padding: 16, borderRadius: 16, borderWidth: 1, fontSize: 15, fontWeight: '600' },
  textarea: { height: 100, textAlignVertical: 'top' },
  submitBtn: { flexDirection: 'row', padding: 20, borderRadius: 20, justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 10, elevation: 4 },
  submitBtnText: { color: 'white', fontSize: 14, fontWeight: '900', letterSpacing: 1 },
  securitySeal: { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center', marginTop: 20 },
  securityText: { fontSize: 11, fontWeight: '800' }
});
