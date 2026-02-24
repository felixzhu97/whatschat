import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
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
import { MessageBubble, ChatInputField, ChatAvatar } from '@/src/presentation/components';
import { styled } from '@/src/presentation/shared/emotion';
import { useTheme } from '@/src/presentation/shared/theme';
import { useAuthStore } from '@/src/presentation/stores';
import { useSocket } from '@/src/presentation/hooks/useSocket';
import { useCall } from '@/src/presentation/hooks/useCall';
import { messageService } from '@/src/application/services/MessageService';
import { chatService } from '@/src/application/services/ChatService';

const Container = styled.View`
  flex: 1;
  background-color: ${(p) => p.theme.colors.chatBackground};
`;

const Centered = styled(Container)`
  justify-content: center;
  align-items: center;
`;

const LoadingText = styled.Text`
  margin-top: 8px;
  font-size: 15px;
  color: ${(p) => p.theme.colors.secondaryText};
`;

const KeyboardView = styled(KeyboardAvoidingView)`
  flex: 1;
`;

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
  const { startCall } = useCall();

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
        setMessages((prev) =>
          [...prev, temp].sort(
            (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          )
        );
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
      <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
        <Centered>
          <ActivityIndicator size="large" color={colors.primaryGreen} />
          <LoadingText>加载中...</LoadingText>
        </Centered>
      </SafeAreaView>
    );
  }

  const displayChat =
    chat ??
    new ChatEntity({
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

  const otherUserId = displayChat.participantIds?.find((id) => id !== userId) ?? null;
  const contactName =
    displayChat.name && displayChat.name !== 'Chat'
      ? displayChat.name
      : (messages.find((m) => m.senderId !== userId)?.senderName ?? displayChat.name);
  const handleVoiceCall = () => {
    if (otherUserId) startCall(otherUserId, contactName, '', 'voice');
  };
  const handleVideoCall = () => {
    if (otherUserId) startCall(otherUserId, contactName, '', 'video');
  };

  const HeaderContent = () => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        width: '100%',
        paddingHorizontal: 4,
      }}
    >
      <TouchableOpacity
        onPress={() => router.back()}
        style={{
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderRadius: 20,
          backgroundColor: colors.secondaryBackground,
        }}
      >
        <Ionicons name="chevron-back" size={24} color={colors.primaryText} />
      </TouchableOpacity>
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          marginHorizontal: 12,
          minWidth: 0,
        }}
      >
        <ChatAvatar name={contactName} size={40} />
        <View style={{ marginLeft: 12, flex: 1, minWidth: 0 }}>
          <Text style={{ fontSize: 17, fontWeight: '600', color: colors.primaryText }} numberOfLines={1}>
            {contactName}
          </Text>
          <Text style={{ fontSize: 13, fontWeight: '400', color: colors.secondaryText, marginTop: 2 }}>
            online
          </Text>
        </View>
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 6,
          paddingHorizontal: 8,
          borderRadius: 20,
          backgroundColor: colors.secondaryBackground,
          gap: 4,
        }}
      >
        <TouchableOpacity onPress={handleVideoCall} disabled={!otherUserId} style={{ padding: 6 }}>
          <Ionicons name="videocam-outline" size={22} color={colors.primaryText} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleVoiceCall} disabled={!otherUserId} style={{ padding: 6 }}>
          <Ionicons name="call-outline" size={22} color={colors.primaryText} />
        </TouchableOpacity>
        <TouchableOpacity style={{ padding: 6 }}>
          <Ionicons name="ellipsis-vertical" size={20} color={colors.primaryText} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerTransparent: false,
          headerBackVisible: false,
          headerLeft: () => null,
          headerRight: () => null,
          headerTitle: HeaderContent,
          headerTitleAlign: 'left',
          headerStyle: {
            backgroundColor: colors.secondaryBackground,
            borderBottomWidth: 0.5,
            borderBottomColor: colors.separator,
            shadowOpacity: 0,
            elevation: 0,
          },
          headerTintColor: colors.primaryText,
        }}
      />
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.chatBackground }} edges={['bottom']}>
        <Container>
          <KeyboardView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            style={{ flex: 1 }}
          >
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={({ item }) => (
                <MessageBubble message={item} isMe={item.senderId === userId} />
              )}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 8, paddingBottom: 8, flexGrow: 1 }}
              showsVerticalScrollIndicator={false}
            />
            <ChatInputField
              value={inputText}
              onChangeText={setInputText}
              onSend={handleSend}
            />
          </KeyboardView>
        </Container>
      </SafeAreaView>
    </>
  );
}
