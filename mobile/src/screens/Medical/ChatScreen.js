import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { Send, ArrowLeft, User } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { medicalService } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import { connectSocket, joinChat, onNewMessage, disconnectSocket, sendMessageViaSocket } from '../../services/socket';
import { useTranslation } from 'react-i18next';

export default function ChatScreen({ route, navigation }) {
  const { contactId, contactName, contactRole } = route.params || {};
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatRef = useRef(null);

  const loadMessages = async () => {
    try {
      const data = await medicalService.getMessages();
      const msgs = Array.isArray(data) ? data : data?.data || [];
      const filtered = msgs.filter(
        m => m && ((m.sender?.id === contactId && m.receiver?.id === user?.id) ||
             (m.sender?.id === user?.id && m.receiver?.id === contactId))
      ).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      setMessages(filtered);
    } catch (err) {
      if (__DEV__) console.warn('Load messages error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.id || !contactId) return;
    loadMessages();
    connectSocket(user.id);
    const unsub = onNewMessage((msg) => {
      if (msg.sender?.id === contactId || msg.receiver?.id === contactId) {
        setMessages(prev => [...prev, msg].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)));
      }
    });
    return () => { unsub(); disconnectSocket(); };
  }, [contactId, user?.id]);

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    const text = input.trim();
    setInput('');
    try {
      await medicalService.sendMessage(contactId, text);
      sendMessageViaSocket(contactId, text);
      await loadMessages();
    } catch (err) {
      Alert.alert(t('erreur'), t('impossible_envoyer_message'));
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item }) => {
    const isMe = item.sender?.id === user?.id;
    return (
      <View style={{
        alignSelf: isMe ? 'flex-end' : 'flex-start',
        maxWidth: '80%',
        marginBottom: 12,
      }}>
        <View style={{
          backgroundColor: isMe ? colors.primary : colors.card,
          padding: 14,
          borderRadius: 20,
          borderBottomRightRadius: isMe ? 4 : 20,
          borderBottomLeftRadius: isMe ? 20 : 4,
          borderWidth: isMe ? 0 : 1,
          borderColor: colors.border,
        }}>
          <Text style={{
            color: isMe ? '#fff' : colors.text,
            fontSize: 15,
            lineHeight: 21,
          }}>{item.content}</Text>
        </View>
        <Text style={{
          fontSize: 10,
          color: colors.textSecondary,
          marginTop: 4,
          alignSelf: isMe ? 'flex-end' : 'flex-start',
        }}>{formatTime(item.createdAt)}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={{ backgroundColor: colors.primary, padding: 15, paddingTop: 50, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12 }}>
          <ArrowLeft color="#fff" size={22} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>{contactName}</Text>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' }}>
            {contactRole || t('patient')}
          </Text>
        </View>
        <View style={{ padding: 8, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12 }}>
          <User color="#34d399" size={20} />
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : messages.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
          <User color={colors.textSecondary} size={48} />
          <Text style={{ color: colors.textSecondary, marginTop: 12, textAlign: 'center', fontSize: 15 }}>
            {t('aucun_message_debutez', { contactName })}
          </Text>
        </View>
      ) : (
        <FlatList
          ref={flatRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={{ padding: 20, paddingBottom: 10 }}
          onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: false })}
        />
      )}

      <View style={{
        flexDirection: 'row', alignItems: 'flex-end', gap: 10,
        padding: 16, borderTopWidth: 1, borderTopColor: colors.border,
        backgroundColor: colors.card,
      }}>
        <TextInput
          style={{
            flex: 1, borderRadius: 20, paddingHorizontal: 18, paddingVertical: 12,
            fontSize: 15, maxHeight: 100, backgroundColor: colors.background,
            color: colors.text, borderWidth: 1, borderColor: colors.border,
          }}
          placeholder={t('ecrire_message')}
          placeholderTextColor={colors.textSecondary}
          value={input}
          onChangeText={setInput}
          multiline
        />
        <TouchableOpacity
          onPress={sendMessage}
          disabled={!input.trim() || sending}
          style={{
            width: 48, height: 48, borderRadius: 24,
            justifyContent: 'center', alignItems: 'center',
            backgroundColor: input.trim() ? colors.primary : colors.border,
          }}
        >
          <Send color="#fff" size={20} />
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center', padding: 10, backgroundColor: colors.background }}>
        <Text style={{ color: '#10b981', fontSize: 10, fontWeight: '800' }}>{t('messages_https')}</Text>
      </View>
    </KeyboardAvoidingView>
  );
}
