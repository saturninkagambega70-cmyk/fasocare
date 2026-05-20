import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, Alert } from 'react-native';
import { Globe, X, Check, RotateCcw } from 'lucide-react-native';
import { getServerURL, setServerURL, systemService } from '../services/api';

export const ServerConfigModal = ({ visible, onClose }) => {
  const [url, setUrl] = useState(getServerURL());
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState(null); // 'success', 'error', or null

  useEffect(() => {
    if (visible) {
      setUrl(getServerURL());
      setStatus(null);
    }
  }, [visible]);

  const handleSave = () => {
    setServerURL(url);
    Alert.alert("Configuration", "URL du serveur mise à jour avec succès.");
    onClose();
  };

  const testConnection = async () => {
    const oldUrl = getServerURL();
    try {
      setTesting(true);
      setStatus(null);
      setServerURL(url);
      const health = await systemService.checkHealth();
      if (health && health.status === 'ready') {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (e) {
      setStatus('error');
    } finally {
      setServerURL(oldUrl);
      setTesting(false);
    }
  };

  const resetDefault = () => {
    setUrl(getServerURL());
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Configuration Serveur</Text>
            <TouchableOpacity onPress={onClose} accessibilityRole="button" accessibilityLabel="Fermer">
              <X color="#64748b" size={24} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.label}>Base URL de l'API :</Text>
            <View style={styles.inputContainer}>
              <Globe color="#64748b" size={20} />
              <TextInput
                style={styles.input}
                value={url}
                onChangeText={setUrl}
                placeholder="http://192.168.x.x:3001"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <TouchableOpacity style={styles.testBtn} onPress={testConnection} disabled={testing} accessibilityRole="button" accessibilityLabel="Tester la connexion au serveur">
              <Text style={styles.testBtnText}>
                {testing ? 'Vérification...' : 'Tester la connexion'}
              </Text>
            </TouchableOpacity>

            {status === 'success' && (
              <View style={[styles.statusBanner, styles.successBanner]}>
                <Check color="#059669" size={16} />
                <Text style={styles.successText}>Serveur accessible !</Text>
              </View>
            )}

            {status === 'error' && (
              <View style={[styles.statusBanner, styles.errorBanner]}>
                <X color="#dc2626" size={16} />
                <Text style={styles.errorText}>Serveur injoignable.</Text>
              </View>
            )}

            <TouchableOpacity style={styles.resetBtn} onPress={resetDefault} accessibilityRole="button" accessibilityLabel="Réinitialiser l'URL du serveur">
              <RotateCcw color="#64748b" size={16} />
              <Text style={styles.resetText}>Réinitialiser (Défaut local)</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} accessibilityRole="button" accessibilityLabel="Enregistrer la configuration">
              <Text style={styles.saveBtnText}>Enregistrer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modal: { backgroundColor: 'white', borderRadius: 24, overflow: 'hidden' },
  header: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  content: { padding: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#64748b', marginBottom: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  input: { flex: 1, marginLeft: 10, fontSize: 14, color: '#1e293b' },
  testBtn: { marginTop: 15, backgroundColor: '#f1f5f9', padding: 12, borderRadius: 12, alignItems: 'center' },
  testBtnText: { color: '#0d6e3f', fontWeight: 'bold' },
  statusBanner: { flexDirection: 'row', alignItems: 'center', marginTop: 10, padding: 8, borderRadius: 8, gap: 8 },
  successBanner: { backgroundColor: '#ecfdf5' },
  successText: { color: '#059669', fontSize: 13, fontWeight: '600' },
  errorBanner: { backgroundColor: '#fef2f2' },
  errorText: { color: '#dc2626', fontSize: 13, fontWeight: '600' },
  resetBtn: { flexDirection: 'row', alignItems: 'center', alignSelf: 'center', marginTop: 20, gap: 8 },
  resetText: { color: '#64748b', fontSize: 12 },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  saveBtn: { backgroundColor: '#0d6e3f', padding: 16, borderRadius: 16, alignItems: 'center' },
  saveBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});
