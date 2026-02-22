import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Message, MessageType, MessageStatus, MessageEntity, Chat } from '@/src/domain/entities';
import { MessageBubble, ChatInputField } from '@/src/presentation/components';
import { useTheme } from '@/src/presentation/shared/theme';
import { useAuthStore } from '@/src/presentation/stores';
import { messageService } from '@/src/application/services';

interface ChatDetailScreenProps {
  route: { params: { chat: Chat } };
  navigation: any;
}

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
      setMessages((prev) => [...prev, temp].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      ));
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
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primaryGreen} />
        <Text style={[styles.loadingText, { color: colors.secondaryText }]}>加载中...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.chatBackground }]} edges={['top']}>
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
          inverted={false}
        />
        <ChatInputField
          value={inputText}
          onChangeText={setInputText}
          onSend={handleSend}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

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

