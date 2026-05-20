import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react-native';
import { WebView } from 'react-native-webview';
import { useTranslation } from 'react-i18next';

const JITSI_DOMAIN = 'meet.jit.si';

export default function MeetingScreen({ route, navigation }) {
  const { t } = useTranslation();
  const { roomName } = route.params || { roomName: `FasoCare-${Date.now()}` };
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const webviewRef = useRef(null);
  const jitsiReady = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => setDuration(d => d + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

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

  const jitsiHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
      <script src="https://${JITSI_DOMAIN}/external_api.js"></script>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { width: 100%; height: 100%; overflow: hidden; }
        #jitsi-container { width: 100%; height: 100%; }
      </style>
    </head>
    <body>
      <div id="jitsi-container"></div>
      <script>
        const domain = '${JITSI_DOMAIN}';
        const options = {
          roomName: '${roomName}',
          parentNode: document.getElementById('jitsi-container'),
          width: '100%',
          height: '100%',
          configOverrides: {
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            disableDeepLinking: true,
            prejoinPageEnabled: false,
          },
          interfaceConfigOverrides: {
            TOOLBAR_ALWAYS_VISIBLE: false,
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
            MOBILE_APP_PROMO: false,
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
          },
        };
        try {
          const jitsiApi = new JitsiMeetExternalAPI(domain, options);
          jitsiApi.addListener('videoConferenceJoined', () => {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'joined' }));
          });
          jitsiApi.addListener('readyToClose', () => {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'closed' }));
          });
          window.jitsiApi = jitsiApi;
        } catch (e) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', message: e.message }));
        }
      </script>
    </body>
    </html>
  `;

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'joined') {
        jitsiReady.current = true;
        setLoading(false);
      } else if (data.type === 'closed') {
        navigation.goBack();
      } else if (data.type === 'error') {
        setError(data.message);
        setLoading(false);
      }
    } catch {}
  };

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.remotePlaceholder}>
          <PhoneOff size={50} color="#ef4444" />
          <Text style={[styles.remoteText, { color: '#ef4444' }]}>{t('echec_connexion')}</Text>
          <Text style={styles.errorDetail}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.retryText}>{t('retour')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        ref={webviewRef}
        source={{ html: jitsiHtml }}
        style={styles.webview}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        allowFileAccess
        mixedContentMode="always"
      />

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={styles.loadingText}>{t('connexion_salle_teleconsultation')}</Text>
        </View>
      )}

      <View style={[styles.timerBadge, { opacity: loading ? 0 : 1 }]}>
        <Text style={styles.timerText}>{formatTime(duration)}</Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity 
          style={[styles.controlBtn, isMuted && styles.controlBtnActive]} 
          onPress={toggleMute}
        >
          {isMuted ? <MicOff color="#fff" size={24} /> : <Mic color="#fff" size={24} />}
        </TouchableOpacity>

        <TouchableOpacity style={styles.endCallBtn} onPress={handleEndCall}>
          <PhoneOff color="#fff" size={28} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.controlBtn, isVideoOff && styles.controlBtnActive]} 
          onPress={toggleVideo}
        >
          {isVideoOff ? <VideoOff color="#fff" size={24} /> : <Video color="#fff" size={24} />}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  webview: { flex: 1 },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' },
  loadingText: { color: '#94a3b8', marginTop: 20, fontSize: 16 },
  remotePlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  remoteText: { marginTop: 20, fontSize: 16 },
  errorDetail: { color: '#64748b', fontSize: 13, marginTop: 10, textAlign: 'center', paddingHorizontal: 30 },
  retryBtn: { marginTop: 30, backgroundColor: '#1a4a2e', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 12 },
  retryText: { color: 'white', fontWeight: 'bold' },
  timerBadge: { position: 'absolute', top: 60, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 15, paddingVertical: 5, borderRadius: 20 },
  timerText: { color: '#fff', fontWeight: 'bold' },
  controls: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 30, paddingBottom: 40, paddingTop: 10 },
  controlBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  controlBtnActive: { backgroundColor: '#ef4444' },
  endCallBtn: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#ef4444', justifyContent: 'center', alignItems: 'center', shadowColor: '#ef4444', shadowOpacity: 0.4, shadowRadius: 10 },
});
