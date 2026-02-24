import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Message, MessageType, MessageStatus, MessageEntity, Chat } from '@/src/domain/entities';
import { MessageBubble, ChatInputField } from '@/src/presentation/components';
import { styled } from '@/src/presentation/shared/emotion';
import { useTheme } from '@/src/presentation/shared/theme';
import { useAuthStore } from '@/src/presentation/stores';
import { messageService } from '@/src/application/services';

interface ChatDetailScreenProps {
  route: { params: { chat: Chat } };
  navigation: any;
}

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

const MessagesContainer = styled.View`
  padding: 16px;
`;

export const ChatDetailScreen: React.FC<ChatDetailScreenProps> = ({ route, navigation }) => {
  const { chat } = route.params;
  const { colors } = useTheme();
  const userId = useAuthStore((s) => s.user?.id);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const loadMessages = useCallback(async () => {
    try {
      const list = await messageService.getMessages(chat.id);
      setMessages(list.reverse());
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [chat.id]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const handleSend = useCallback(
    async (text: string) => {
      if (!text.trim()) return;
      const trimmed = text.trim();
      setInputText('');
      const tempId = `temp-${Date.now()}`;
      const temp = new MessageEntity({
        id: tempId,
        chatId: chat.id,
        senderId: userId ?? '',
        senderName: '我',
        content: trimmed,
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
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      try {
        const msg = await messageService.sendMessage(chat.id, trimmed);
        setMessages((prev) => prev.map((m) => (m.id === tempId ? msg : m)));
      } catch {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempId
              ? new MessageEntity({ ...m, status: MessageStatus.Failed })
              : m
          )
        );
      }
    },
    [chat.id, userId]
  );

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <Centered>
          <ActivityIndicator size="large" color={colors.primaryGreen} />
          <LoadingText>加载中...</LoadingText>
        </Centered>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <Container>
        <KeyboardView
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
            contentContainerStyle={{ padding: 16 }}
            inverted={false}
          />
          <ChatInputField
            value={inputText}
            onChangeText={setInputText}
            onSend={handleSend}
          />
        </KeyboardView>
      </Container>
    </SafeAreaView>
  );
};
