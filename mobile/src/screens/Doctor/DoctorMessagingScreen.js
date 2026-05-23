import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Modal, Alert } from 'react-native';
import { User, Pill, Search, Plus, MessageSquare } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { medicalService, userService } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import { useSocket } from '../../context/SocketContext';
import { useTranslation } from 'react-i18next';

const ChatItem = ({ item, onPress }) => {
  const { colors } = useTheme();
  return (
    <TouchableOpacity style={[styles.chatItem, { borderColor: colors.border }]} onPress={() => onPress(item)}>
      <View style={[styles.avatar, { backgroundColor: item.type === 'pharmacist' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(2, 132, 199, 0.1)' }]}>
        {item.type === 'pharmacist' ? <Pill color="#10b981" size={20} /> : <User color="#0284c7" size={20} />}
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={[styles.chatName, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.chatTime, { color: colors.textSecondary }]}>{item.time}</Text>
        </View>
        <Text style={[styles.chatLastMsg, { color: colors.textSecondary }]} numberOfLines={1}>{item.lastMsg}</Text>
      </View>
      {item.unread && <View style={[styles.unreadBadge, { backgroundColor: colors.accent || '#ef4444' }]} />}
    </TouchableOpacity>
  );
};

export default function DoctorMessagingScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const socket = useSocket();
  const [search, setSearch] = useState('');
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewChat, setShowNewChat] = useState(false);
  const [contactPhone, setContactPhone] = useState('');
  const [searchingContact, setSearchingContact] = useState(false);

  const groupMessages = useCallback((msgs) => {
    const grouped = {};
    msgs.forEach(msg => {
      const contactId = msg.sender?.id === user?.id ? msg.receiver?.id : msg.sender?.id;
      const contactData = msg.sender?.id === user?.id ? msg.receiver : msg.sender;
      if (!contactId || !contactData) return;
      grouped[contactId] = {
        id: contactId,
        name: contactData.name || contactData.phone || t('inconnu'),
        role: (contactData.activeRole || contactData.roles?.[0] || t('patient')),
        lastMsg: msg.content,
        time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        unread: !msg.isRead && msg.receiver?.id === user?.id,
      };
    });
    return Object.values(grouped);
  }, [user]);

  const loadChats = useCallback(async () => {
    if (!user?.id) return;
    try {
      const data = await medicalService.getMessages();
      const msgs = Array.isArray(data) ? data : data?.data || [];
      setChats(groupMessages(msgs));
    } catch (err) {
      if (__DEV__) console.warn('Failed to load chats', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, groupMessages]);

  useEffect(() => {
    if (!user?.id) return;
    loadChats();
    const unsub = socket.onNewMessage(() => { loadChats(); });
    return () => { unsub(); };
  }, [user?.id]);

  const handleNewChat = async () => {
    if (!contactPhone.trim()) return;
    setSearchingContact(true);
    try {
      const cleanPhone = contactPhone.replace(/\s+/g, '').replace('+226', '');
      const contact = await userService.findPatient(cleanPhone);
      if (contact && contact.id) {
        setShowNewChat(false);
        setContactPhone('');
        navigation.navigate('Chat', {
          contactId: contact.id,
          contactName: contact.name || contact.phone,
          contactRole: contact.activeRole || contact.roles?.[0] || t('patient'),
        });
      } else {
        Alert.alert(t('non_trouve'), t('utilisateur_non_trouve'));
      }
    } catch (err) {
      Alert.alert(t('erreur'), t('utilisateur_non_trouve_verifiez'));
    } finally {
      setSearchingContact(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Modal visible={showNewChat} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{t('nouvelle_conversation')}</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder={t('numero_telephone')}
              placeholderTextColor={colors.textSecondary}
              value={contactPhone}
              onChangeText={setContactPhone}
              keyboardType="phone-pad"
              autoFocus
            />
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.border, flex: 1 }]}
                onPress={() => { setShowNewChat(false); setContactPhone(''); }}
              >
                <Text style={[styles.modalBtnText, { color: colors.text }]}>{t('annuler')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.primary, flex: 1 }]}
                onPress={handleNewChat}
                disabled={searchingContact}
              >
                {searchingContact ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={[styles.modalBtnText, { color: '#fff' }]}>{t('rechercher')}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.title}>{t('messagerie_securisee')}</Text>
        <Text style={styles.subtitle}>{t('echanges_confidentiels')}</Text>
      </View>

      <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Search color={colors.textSecondary} size={20} />
        <TextInput 
          style={[styles.searchInput, { color: colors.text }]} 
          placeholder={t('rechercher_conversation')} 
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={chats.filter(c => c?.name?.toLowerCase().includes(search.toLowerCase()))}
          keyExtractor={(item) => item?.id}
          renderItem={({ item }) => <ChatItem item={item} onPress={(chat) => navigation.navigate('Chat', { contactId: chat.id, contactName: chat.name, contactRole: chat.role })} />}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          ListEmptyComponent={() => (
            <View style={{ alignItems: 'center', padding: 40, marginTop: 60 }}>
              <MessageSquare color={colors.textSecondary} size={48} />
              <Text style={{ color: colors.textSecondary, marginTop: 12, textAlign: 'center', fontSize: 15 }}>
                {search ? t('aucune_conversation') : t('aucune_conversation_demarrez')}
              </Text>
            </View>
          )}
        />
      )}

      <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary }]} onPress={() => setShowNewChat(true)}>
        <Plus color="#fff" size={28} />
      </TouchableOpacity>

      <View style={styles.securityBanner}>
         <Text style={[styles.securityText, { color: colors.success }]}>{t('messages_https')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { padding: 25, paddingTop: 60, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  title: { color: 'white', fontSize: 22, fontWeight: '900' },
  subtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginTop: 4, letterSpacing: 1 },
  searchBox: { flexDirection: 'row', alignItems: 'center', margin: 20, paddingHorizontal: 15, height: 50, borderRadius: 15, borderWidth: 1 },
  searchInput: { flex: 1, marginLeft: 10, fontWeight: '600' },
  chatItem: { flexDirection: 'row', alignItems: 'center', gap: 15, paddingVertical: 18, borderBottomWidth: 1 },
  avatar: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  chatName: { fontSize: 16, fontWeight: '900' },
  chatTime: { fontSize: 11, fontWeight: '600' },
  chatLastMsg: { fontSize: 13, marginTop: 4, fontWeight: '500' },
  unreadBadge: { width: 10, height: 10, borderRadius: 5, marginLeft: 10 },
  securityBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center', padding: 20 },
  securityText: { fontSize: 11, fontWeight: '800' },
  fab: { position: 'absolute', bottom: 70, right: 20, width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10, zIndex: 100 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', padding: 30, borderRadius: 24, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: '900', marginBottom: 20 },
  modalInput: { width: '100%', padding: 16, borderRadius: 14, borderWidth: 1, fontSize: 16, fontWeight: '600' },
  modalBtn: { padding: 16, borderRadius: 14, alignItems: 'center' },
  modalBtnText: { fontWeight: '900', fontSize: 14 },
});
