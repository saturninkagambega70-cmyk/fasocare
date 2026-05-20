import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react-native';
import { FasoCareIcon } from '../../components/FasoCareIcon';
import { ServerConfigModal } from '../../components/ServerConfigModal';

const WelcomeScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [configVisible, setConfigVisible] = useState(false);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <View style={{ maxWidth: 600, alignSelf: 'center', width: '100%', flex: 1 }}>
        <View style={styles.content}>
          <TouchableOpacity 
            activeOpacity={0.8} 
            onLongPress={() => setConfigVisible(true)}
            style={styles.logoContainer}
          >
            <FasoCareIcon size={80} />
          </TouchableOpacity>
          <Text style={styles.title}>FasoCare</Text>
          <Text style={styles.subtitle}>{t('votre_sante_mains')}</Text>
          <Text style={styles.description}>
            {t('description_app')}
          </Text>
        </View>

        <ServerConfigModal visible={configVisible} onClose={() => setConfigVisible(false)} />

        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.btnPrimary}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.btnText}>{t('commencer_experience')}</Text>
            <ChevronRight color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, paddingTop: 60 },
  logoContainer: { 
    width: 120, height: 120, backgroundColor: '#f0fdf4', borderRadius: 40, 
    justifyContent: 'center', alignItems: 'center', marginBottom: 30,
    shadowColor: '#0d6e3f', shadowOpacity: 0.1, shadowRadius: 20, elevation: 10
  },
  logoIcon: { fontSize: 60 },
  title: { fontSize: 48, fontWeight: 'bold', color: '#0f172a', letterSpacing: -2, marginBottom: 5 },
  subtitle: { fontSize: 18, color: '#0d6e3f', fontWeight: 'bold', marginBottom: 25, textAlign: 'center', letterSpacing: -0.5 },
  description: { fontSize: 15, color: '#64748b', textAlign: 'center', lineHeight: 24, fontWeight: 'medium' },
  footer: { padding: 40, paddingBottom: 60 },
  btnPrimary: { 
    backgroundColor: '#0d6e3f', padding: 22, borderRadius: 24, 
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#0d6e3f', shadowOpacity: 0.4, shadowRadius: 20, elevation: 15,
    marginBottom: 40
  },
  btnText: { color: 'white', fontSize: 18, fontWeight: 'black', marginRight: 12, textTransform: 'uppercase', letterSpacing: 1 }
});

export default WelcomeScreen;
