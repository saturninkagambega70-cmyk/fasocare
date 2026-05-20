import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { setServerURL, getServerURL, testConnection, resetServerURL } from '../../services/api';
import { useTranslation } from 'react-i18next';

const ServerConfigScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [serverUrl, setServerUrl] = useState(getServerURL());
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState(null);

  const handleTest = async () => {
    setTesting(true);
    setStatus(null);
    const result = await testConnection(serverUrl);
    setStatus(result);
    setTesting(false);
  };

  const handleSave = () => {
    setServerURL(serverUrl);
    Alert.alert(t('succes'), t('url_enregistree_succes'));
  };

  const handleReset = () => {
    Alert.alert(
      t('reinitialiser_titre'),
      t('reinitialiser_message'),
      [
        { text: t('annuler'), style: 'cancel' },
        { 
          text: t('reinitialiser_btn'), 
          onPress: async () => {
            await resetServerURL();
            setServerUrl('http://localhost:3001');
            Alert.alert(t('succes'), t('serveur_reinitialise_succes'));
          }
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{t('configuration_serveur')}</Text>
      <Text style={styles.subtitle}>
        {t('entrer_url_serveur')}
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>{t('url_serveur')}</Text>
        <TextInput
          style={styles.input}
          value={serverUrl}
          onChangeText={setServerUrl}
          placeholder="http://192.168.1.100:3001"
          keyboardType="url"
          autoCapitalize="none"
          autoCorrect={false}
        />
        
        <View style={styles.buttons}>
          <TouchableOpacity 
            style={[styles.button, styles.testButton]} 
            onPress={handleTest}
            disabled={testing}
          >
            <Text style={styles.buttonText}>
              {testing ? t('test_cours') : t('tester')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.saveButton]} 
            onPress={handleSave}
          >
            <Text style={[styles.buttonText, styles.saveText]}>{t('enregistrer')}</Text>
          </TouchableOpacity>
        </View>

        {status && (
          <View style={[styles.status, status.success ? styles.success : styles.error]}>
            <Text style={styles.statusText}>{status.message}</Text>
          </View>
        )}
      </View>

      <View style={styles.presets}>
        <Text style={styles.presetsTitle}>{t('presets_courants')}</Text>
        <View style={styles.presetButtons}>
          <TouchableOpacity 
            style={styles.presetButton}
            onPress={() => setServerUrl('http://10.0.2.2:3001')}
          >
            <Text style={styles.presetText}>{t('emulateur_android')}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.presetButton}
            onPress={() => setServerUrl('http://localhost:3001')}
          >
            <Text style={styles.presetText}>localhost</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.presetButton}
            onPress={() => setServerUrl('http://192.168.1.100:3001')}
          >
            <Text style={styles.presetText}>{t('reseau_local')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.resetButton} 
        onPress={handleReset}
      >
        <Text style={styles.resetText}>{t('reinitialiser_defaut')}</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backText}>{t('retour')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007A33',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  buttons: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  testButton: {
    backgroundColor: '#007A33',
  },
  saveButton: {
    backgroundColor: '#007A33',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
  saveText: {
    color: 'white',
  },
  status: {
    marginTop: 15,
    padding: 12,
    borderRadius: 8,
  },
  success: {
    backgroundColor: '#d4edda',
  },
  error: {
    backgroundColor: '#f8d7da',
  },
  statusText: {
    textAlign: 'center',
  },
  presets: {
    marginBottom: 20,
  },
  presetsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  presetButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  presetButton: {
    backgroundColor: '#e9ecef',
    padding: 10,
    borderRadius: 8,
  },
  presetText: {
    fontSize: 12,
    color: '#333',
  },
  resetButton: {
    padding: 15,
    alignItems: 'center',
  },
  resetText: {
    color: '#dc3545',
    fontSize: 14,
  },
  backButton: {
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  backText: {
    color: '#007A33',
    fontSize: 16,
  },
});

export default ServerConfigScreen;