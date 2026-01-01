import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Message, MessageType, MessageStatus, MessageEntity, Chat, ChatEntity, ChatType } from '@/src/domain/entities';
import { MessageBubble, ChatInputField } from '@/src/presentation/components';
import { useTheme } from '@/src/presentation/shared/theme';

export default function ChatDetailScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { colors } = useTheme();
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Load chat and messages
    const now = new Date();
    const mockChat = new ChatEntity({
      id: params.chatId as string || '1',
      name: 'Jenny',
      type: ChatType.Individual,
      participantIds: ['user1', 'user2'],
      createdAt: now,
      updatedAt: now,
    });
    setChat(mockChat);

    const mockMessages: Message[] = [
      new MessageEntity({
        id: '1',
        chatId: mockChat.id,
        senderId: 'user2',
        senderName: mockChat.name,
        content: '你好！',
        type: MessageType.Text,
        timestamp: new Date(now.getTime() - 10 * 60 * 1000),
        status: MessageStatus.Read,
      }),
      new MessageEntity({
        id: '2',
        chatId: mockChat.id,
        senderId: 'user1',
        senderName: '我',
        content: '你好，最近怎么样？',
        type: MessageType.Text,
        timestamp: new Date(now.getTime() - 8 * 60 * 1000),
        status: MessageStatus.Read,
      }),
    ];
    setMessages(mockMessages);
  }, [params.chatId]);

  const handleSend = (text: string) => {
    if (!chat) return;
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

  if (!chat) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.primaryText }}>加载中...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: chat.name,
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
          headerStyle: {
            backgroundColor: colors.secondaryBackground,
          },
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
    </>
  );
}

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

