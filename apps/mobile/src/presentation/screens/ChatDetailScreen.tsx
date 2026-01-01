import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Message, MessageType, MessageStatus, MessageEntity, Chat } from '@/src/domain/entities';
import { MessageBubble, ChatInputField } from '@/src/presentation/components';
import { useTheme } from '@/src/presentation/shared/theme';

interface ChatDetailScreenProps {
  route: { params: { chat: Chat } };
  navigation: any;
}

export const ChatDetailScreen: React.FC<ChatDetailScreenProps> = ({ route, navigation }) => {
  const { chat } = route.params;
  const { colors } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = () => {
    const now = new Date();
    const mockMessages: Message[] = [
      new MessageEntity({
        id: '1',
        chatId: chat.id,
        senderId: 'user2',
        senderName: chat.name,
        content: '你好！',
        type: MessageType.Text,
        timestamp: new Date(now.getTime() - 10 * 60 * 1000),
        status: MessageStatus.Read,
      }),
      new MessageEntity({
        id: '2',
        chatId: chat.id,
        senderId: 'user1',
        senderName: '我',
        content: '你好，最近怎么样？',
        type: MessageType.Text,
        timestamp: new Date(now.getTime() - 8 * 60 * 1000),
        status: MessageStatus.Read,
      }),
    ];
    setMessages(mockMessages);
  };

  const handleSend = (text: string) => {
    const newMessage = new MessageEntity({
      id: Date.now().toString(),
      chatId: chat.id,
      senderId: 'user1',
      senderName: '我',
      content: text,
      type: MessageType.Text,
      timestamp: new Date(),
      status: MessageStatus.Sent,
    });
    setMessages([...messages, newMessage]);
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

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
            <MessageBubble message={item} isMe={item.senderId === 'user1'} />
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
  keyboardView: {
    flex: 1,
  },
  messagesContainer: {
    padding: 16,
  },
});

