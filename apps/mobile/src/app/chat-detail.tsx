import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  Message,
  MessageType,
  MessageStatus,
  MessageEntity,
  Chat,
  ChatEntity,
  ChatType,
} from '@/src/domain/entities';
import { MessageBubble, ChatInputField } from '@/src/presentation/components';
import { useTheme } from '@/src/presentation/shared/theme';
import { useAuthStore } from '@/src/presentation/stores';
import { useSocket } from '@/src/presentation/hooks/useSocket';
import { messageService } from '@/src/application/services/MessageService';
import { chatService } from '@/src/application/services/ChatService';

export default function ChatDetailScreen() {
  const params = useLocalSearchParams<{ chatId: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const userId = useAuthStore((s) => s.user?.id);
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const onMessageReceived = useCallback(
    (message: Message) => {
      if (message.chatId !== params.chatId) return;
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message].sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
      });
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    },
    [params.chatId]
  );

  const onMessageSent = useCallback(
    (message: Message) => {
      if (message.chatId !== params.chatId) return;
      setMessages((prev) => {
        const exists = prev.find((m) => m.id === message.id);
        if (exists) return prev;
        return [...prev, message].sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
      });
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    },
    [params.chatId]
  );

  const { sendMessage, connected } = useSocket(onMessageReceived, onMessageSent);

  useEffect(() => {
    const chatId = params.chatId;
    if (!chatId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    Promise.all([chatService.getChatById(chatId), messageService.getMessages(chatId)])
      .then(([c, list]) => {
        if (cancelled) return;
        if (c) setChat(c);
        setMessages(list.reverse());
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [params.chatId]);

  const handleSend = useCallback(
    (text: string) => {
      const chatId = params.chatId;
      if (!chatId || !text.trim()) return;
      if (connected) {
        sendMessage(chatId, text.trim(), 'TEXT');
        setInputText('');
      } else {
        const tempId = `temp-${Date.now()}`;
        const temp = new MessageEntity({
          id: tempId,
          chatId,
          senderId: userId ?? '',
          senderName: '我',
          content: text.trim(),
          type: MessageType.Text,
          status: MessageStatus.Sent,
          timestamp: new Date(),
          isForwarded: false,
          forwardedFrom: [],
        });
        setMessages((prev) => [...prev, temp].sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        ));
        setInputText('');
        messageService.sendMessage(chatId, text.trim()).then((msg) => {
          setMessages((prev) => prev.map((m) => (m.id === tempId ? msg : m)));
        }).catch(() => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === tempId ? new MessageEntity({ ...m, status: MessageStatus.Failed }) : m
            )
          );
        });
      }
    },
    [params.chatId, userId, connected, sendMessage]
  );

  if (loading && !chat) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primaryGreen} />
        <Text style={[styles.loadingText, { color: colors.secondaryText }]}>加载中...</Text>
      </View>
    );
  }

  const displayChat = chat ?? new ChatEntity({
    id: params.chatId ?? '',
    name: 'Chat',
    type: ChatType.Individual,
    participantIds: [],
    unreadCount: 0,
    isMuted: false,
    isPinned: false,
    isArchived: false,
    adminIds: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return (
    <>
      <Stack.Screen
        options={{
          title: displayChat.name,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 16 }}>
              <Ionicons name="arrow-back" size={24} color={colors.primaryText} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={{ flexDirection: 'row', marginRight: 16, gap: 16 }}>
              <TouchableOpacity>
                <Ionicons name="videocam" size={24} color={colors.primaryText} />
              </TouchableOpacity>
              <TouchableOpacity>
                <Ionicons name="call" size={24} color={colors.primaryText} />
              </TouchableOpacity>
            </View>
          ),
          headerStyle: { backgroundColor: colors.secondaryBackground },
          headerTintColor: colors.primaryText,
        }}
      />
      <SafeAreaView style={[styles.container, { backgroundColor: colors.chatBackground }]} edges={['bottom']}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={({ item }) => (
              <MessageBubble message={item} isMe={item.senderId === userId} />
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesContainer}
          />
          <ChatInputField
            value={inputText}
            onChangeText={setInputText}
            onSend={handleSend}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 15,
  },
  keyboardView: {
    flex: 1,
  },
  messagesContainer: {
    padding: 16,
  },
});
