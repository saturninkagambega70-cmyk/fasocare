import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
  Animated, Alert
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Send, Bot, User, AlertTriangle, Mic, MicOff } from 'lucide-react-native';
import { medicalService } from '../../services/api';
import * as Speech from 'expo-speech';

let Voice = null;
try {
  Voice = require('@react-native-voice/voice').default;
} catch (e) {
  if (__DEV__) console.log('Voice native module not available in this environment');
}

const TRIAGE_SUGGESTIONS = [
  "J'ai de la fièvre et des maux de tête",
  "Mon enfant vomit depuis ce matin",
  "J'ai une toux persistante",
  "Douleur au niveau de la poitrine",
  "Démangeaisons et boutons sur la peau",
];

export default function TriageScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [messages, setMessages] = useState([
    {
      id: '0',
      role: 'bot',
      text: "Bonjour ! 👋 Je suis l'Assistant Santé FasoCare.\n\nPosez-moi une question sur votre santé (symptômes, maladies, médicaments...) ou utilisez le microphone 🎤 pour parler.\n\n⚠️ Ceci ne remplace pas un avis médical professionnel.",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Voice handlers (native module - requires expo run:android)
  const onSpeechResults = (e) => {
    const text = e.value?.[0];
    if (text) {
      setInput(text);
      sendMessage(text);
    }
  };
  const onSpeechError = (e) => {
    setIsListening(false);
  };
  const onSpeechEnd = () => {
    setIsListening(false);
  };

  useEffect(() => {
    if (Voice) {
      Voice.onSpeechResults = onSpeechResults;
      Voice.onSpeechError = onSpeechError;
      Voice.onSpeechEnd = onSpeechEnd;
      return () => {
        try { Voice.destroy().then(() => Voice.removeAllListeners()).catch(() => {}); } catch {}
      };
    }
  }, []);

  const toggleVoice = async () => {
    if (!Voice) {
      Alert.alert(t('non_disponible'), t('reconnaissance_vocale'));
      return;
    }
    if (isListening) {
      await Voice.stop();
      setIsListening(false);
    } else {
      try {
        setIsListening(true);
        await Voice.start('fr-FR');
      } catch (e) {
        Alert.alert(t('erreur'), t('impossible_demarrer_audio'));
        setIsListening(false);
      }
    }
  };

  const speakResponse = async (text) => {
    try {
      const cleanText = text.replace(/[❌✅🚨⚠️#*_~`>]/g, '').trim();
      if (cleanText.length > 0) {
        Speech.speak(cleanText, { language: 'fr-FR', rate: 0.85 });
      }
    } catch (e) {
      // TTS non disponible - silencieux
    }
  };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const sendMessage = async (text) => {
    if (!text?.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      text: text.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    scrollToBottom();

    try {
      const response = await medicalService.chatWithRetry(text.trim());
      const botReply = response?.response || t('desole_traitement');

      const botMsg = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        text: botReply,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMsg]);
      speakResponse(botReply);
    } catch (err) {
      const isTimeout = err.code === 'ECONNABORTED' || err.message?.includes('timeout');
      const isNetwork = !err.response && !isTimeout;
      const errMsg = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        text: isTimeout
          ? "⏱️ Le service de triage prend plus de temps que prévu. Veuillez réessayer dans quelques instants."
          : isNetwork
            ? "🌐 Problème de connexion au serveur. Vérifiez votre connexion internet et réessayez."
            : "❌ Désolé, une erreur est survenue. Veuillez réessayer ou contacter directement un médecin via l'onglet Messagerie.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  const urgencyBgColor = (urgency) => {
    switch (urgency) {
      case 'CRITICAL': return 'rgba(239, 68, 68, 0.08)';
      case 'MODERATE': return 'rgba(245, 158, 11, 0.08)';
      default: return undefined;
    }
  };

  const renderMessage = (msg) => {
    if (msg.role === 'action') {
      return (
        <View key={msg.id} style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.sosButton, { shadowColor: '#ef4444' }]}
            onPress={() => navigation.navigate('MainTabs', { screen: 'Urgences' })}
          >
            <AlertTriangle color="white" size={22} />
            <Text style={styles.sosText}>{t('appeler_samu')}</Text>
          </TouchableOpacity>
          <Text style={styles.sosHint}>{t('situation_critique')}</Text>
        </View>
      );
    }

    const isBot = msg.role === 'bot';
    return (
      <View
        key={msg.id}
        style={[
          styles.messageBubble,
          isBot ? styles.botBubble : styles.userBubble,
          isBot ? { backgroundColor: msg.urgency ? urgencyBgColor(msg.urgency) : colors.card, borderColor: colors.border } : { backgroundColor: colors.primary },
        ]}
      >
        <View style={styles.messageHeader}>
          {isBot ? (
            <Bot color={colors.primary} size={14} />
          ) : (
            <User color="white" size={14} />
          )}
          <Text style={[styles.messageRole, isBot ? { color: colors.primary } : { color: 'rgba(255,255,255,0.7)' }]}>
            {isBot ? t('assistant_ia') : t('vous')}
          </Text>
          <Text style={[styles.messageTime, isBot ? { color: colors.textSecondary } : { color: 'rgba(255,255,255,0.5)' }]}>
            {msg.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        <Text style={[styles.messageText, isBot ? { color: colors.text } : { color: 'white' }]}>
          {msg.text}
        </Text>
      </View>
    );
  };

  return (
    <Animated.View style={[styles.container, { backgroundColor: colors.background, opacity: fadeAnim }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft color="white" size={22} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{t('assistant_ia')}</Text>
          <View style={styles.statusRow}>
            <View style={styles.onlineDot} />
            <Text style={styles.statusText}>{t('en_ligne_prediag')}</Text>
          </View>
        </View>
      </View>

      {/* Messages */}
      <ScrollView 
        ref={scrollRef} 
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={scrollToBottom}
      >
        {messages.map(renderMessage)}

        {loading && (
          <View style={[styles.messageBubble, styles.botBubble, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.typingRow}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[styles.typingText, { color: colors.textSecondary }]}>{t('analyse_symptomes')}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Suggestions (shown only when no user message yet) */}
      {messages.length <= 1 && (
        <View style={styles.suggestionsContainer}>
          <Text style={[styles.suggestionsTitle, { color: colors.textSecondary }]}>
            {t('suggestions_rapides')}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {TRIAGE_SUGGESTIONS.map((s, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.suggestionChip, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => sendMessage(s)}
              >
                <Text style={[styles.suggestionText, { color: colors.text }]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <View style={[styles.inputContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
            placeholder={t('decrire_symptomes')}
            placeholderTextColor={colors.textSecondary}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
            onSubmitEditing={() => sendMessage(input)}
          />
          <TouchableOpacity
            style={[styles.micBtn, { backgroundColor: isListening ? '#ef4444' : colors.card, borderColor: colors.border }]}
            onPress={toggleVoice}
          >
            {isListening ? <MicOff color="#ef4444" size={20} /> : <Mic color={colors.primary} size={20} />}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sendBtn, { backgroundColor: input.trim() ? colors.primary : colors.border }]}
            onPress={() => sendMessage(input)}
            disabled={!input.trim() || loading}
          >
            <Send color="white" size={20} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    gap: 15,
  },
  backBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14 },
  headerCenter: { flex: 1 },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: '900', letterSpacing: -0.3 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#34d399' },
  statusText: { color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '700' },
  messagesContainer: { flex: 1 },
  messagesContent: { padding: 20, paddingBottom: 10, gap: 12 },
  messageBubble: {
    padding: 16,
    borderRadius: 24,
    maxWidth: '88%',
    borderWidth: 1,
    marginBottom: 8,
  },
  botBubble: { alignSelf: 'flex-start', borderBottomLeftRadius: 6 },
  userBubble: { alignSelf: 'flex-end', borderBottomRightRadius: 6, borderWidth: 0 },
  messageHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  messageRole: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
  messageTime: { fontSize: 9, marginLeft: 'auto' },
  messageText: { fontSize: 14, lineHeight: 22, fontWeight: '500' },
  typingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 5 },
  typingText: { fontSize: 12, fontWeight: '600', fontStyle: 'italic' },
  actionContainer: { alignItems: 'center', marginVertical: 10 },
  sosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#ef4444',
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 24,
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
  },
  sosText: { color: 'white', fontSize: 14, fontWeight: '900', letterSpacing: 0.5 },
  sosHint: { color: '#ef4444', fontSize: 10, fontWeight: '700', marginTop: 8, textAlign: 'center', opacity: 0.7 },
  suggestionsContainer: { paddingHorizontal: 20, paddingVertical: 12 },
  suggestionsTitle: { fontSize: 11, fontWeight: '700', marginBottom: 10 },
  suggestionChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    marginRight: 10,
    borderWidth: 1,
  },
  suggestionText: { fontSize: 12, fontWeight: '600' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 14,
    maxHeight: 100,
    borderWidth: 1,
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
});
