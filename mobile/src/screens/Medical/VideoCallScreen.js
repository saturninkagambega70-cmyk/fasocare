import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, SafeAreaView, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { useTranslation } from 'react-i18next';

export default function VideoCallScreen({ route, navigation }) {
  const { t } = useTranslation();
  const { patientName } = route.params || { patientName: t('patient_fallback') };
  const { user } = useAuthStore();
  const safeName = encodeURIComponent((patientName || 'Patient').replace(/\s+/g, ''));
  const displayName = encodeURIComponent(user?.name || 'FasoCare User');
  const roomName = `FasoCareRoom_${safeName}`;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const webviewRef = useRef(null);

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    webviewRef.current?.injectJavaScript(`
      if (window.jitsiApi) {
        window.jitsiApi.executeCommand('toggleAudio');
      }
      true;
    `);
  };

  const toggleVideo = () => {
    const next = !isVideoOff;
    setIsVideoOff(next);
    webviewRef.current?.injectJavaScript(`
      if (window.jitsiApi) {
        window.jitsiApi.executeCommand('toggleVideo');
      }
      true;
    `);
  };

  const handleEndCall = () => {
    webviewRef.current?.injectJavaScript(`
      try {
        if (window.jitsiApi) {
          window.jitsiApi.executeCommand('hangup');
          window.jitsiApi.dispose();
        }
      } catch(e) {}
      true;
    `);
    navigation.goBack();
  };

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#ef4444', fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>{t('erreur_connexion')}</Text>
        <Text style={{ color: '#94a3b8', textAlign: 'center', marginBottom: 30, paddingHorizontal: 40 }}>
          {t('impossible_teleconsultation_detail')}
        </Text>
        <TouchableOpacity style={styles.endBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.endText}>{t('retour')}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('teleconsultation_label')} {patientName}</Text>
      </View>
      {loading && (
        <View style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#000', zIndex: 10 }]}>
          <ActivityIndicator color="#34d399" size="large" />
          <Text style={{ color: '#94a3b8', marginTop: 12 }}>{t('connexion_jitsi')}</Text>
        </View>
      )}
      <WebView 
        ref={webviewRef}
        source={{ uri: `https://meet.jit.si/${roomName}#config.disableDeepLinking=true&userInfo.displayName="${displayName}"` }} 
        style={styles.webview}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
        javaScriptEnabled={true}
        onLoad={() => setLoading(false)}
        onError={() => { setLoading(false); setError(true); }}
      />
      <View style={styles.controls}>
        <TouchableOpacity style={[styles.controlBtn, isMuted && styles.activeBtn]} onPress={toggleMute}>
          {isMuted ? <MicOff color="#fff" size={24} /> : <Mic color="#fff" size={24} />}
        </TouchableOpacity>
        <TouchableOpacity style={styles.endCallBtn} onPress={handleEndCall}>
          <PhoneOff color="#fff" size={28} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.controlBtn, isVideoOff && styles.activeBtn]} onPress={toggleVideo}>
          {isVideoOff ? <VideoOff color="#fff" size={24} /> : <Video color="#fff" size={24} />}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { padding: 15, backgroundColor: '#1e293b', alignItems: 'center' },
  title: { color: 'white', fontWeight: 'bold' },
  webview: { flex: 1 },
  controls: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 30, paddingBottom: 40, paddingTop: 10, backgroundColor: '#0f172a' },
  controlBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  activeBtn: { backgroundColor: '#ef4444' },
  endCallBtn: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#ef4444', justifyContent: 'center', alignItems: 'center', shadowColor: '#ef4444', shadowOpacity: 0.4, shadowRadius: 10 },
  endBtn: { backgroundColor: '#ef4444', padding: 25, alignItems: 'center', paddingBottom: 40 },
  endText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});
