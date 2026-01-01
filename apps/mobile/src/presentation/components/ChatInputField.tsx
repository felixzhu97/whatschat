import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/presentation/shared/theme';

interface ChatInputFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: (text: string) => void;
  onAttachmentPress?: () => void;
}

export const ChatInputField: React.FC<ChatInputFieldProps> = ({
  value,
  onChangeText,
  onSend,
  onAttachmentPress,
}) => {
  const { colors } = useTheme();
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);

  const handleSend = () => {
    const text = value.trim();
    if (text) {
      onSend(text);
      onChangeText('');
    }
  };

  return (
    <View style={styles.container}>
      {showAttachmentMenu && (
        <View
          style={[
            styles.attachmentMenu,
            { backgroundColor: colors.secondaryBackground, borderColor: colors.separator },
          ]}
        >
          <View style={styles.attachmentRow}>
            <TouchableOpacity style={styles.attachmentButton} onPress={() => {}}>
              <View style={[styles.attachmentIcon, { backgroundColor: colors.iosBlue }]}>
                <Ionicons name="camera" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.attachmentLabel}>相机</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.attachmentButton} onPress={() => {}}>
              <View style={[styles.attachmentIcon, { backgroundColor: colors.iosGreen }]}>
                <Ionicons name="images" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.attachmentLabel}>相册</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.attachmentButton} onPress={() => {}}>
              <View style={[styles.attachmentIcon, { backgroundColor: colors.iosPurple }]}>
                <Ionicons name="document" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.attachmentLabel}>文件</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.attachmentButton} onPress={() => {}}>
              <View style={[styles.attachmentIcon, { backgroundColor: colors.iosRed }]}>
                <Ionicons name="location" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.attachmentLabel}>位置</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      <View style={styles.inputContainer}>
        <TouchableOpacity
          onPress={() => setShowAttachmentMenu(!showAttachmentMenu)}
          style={[
            styles.attachmentButton,
            showAttachmentMenu && { backgroundColor: colors.primaryGreen + '20' },
          ]}
        >
          <Ionicons
            name={showAttachmentMenu ? 'close' : 'add'}
            size={20}
            color={colors.primaryGreen}
          />
        </TouchableOpacity>
        <View
          style={[
            styles.inputWrapper,
            { backgroundColor: colors.secondaryBackground, borderColor: colors.separator },
          ]}
        >
          <TextInput
            style={[styles.input, { color: colors.primaryText }]}
            value={value}
            onChangeText={onChangeText}
            placeholder="消息"
            placeholderTextColor={colors.secondaryText}
            multiline
            maxLength={1000}
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity onPress={() => {}}>
            <Ionicons name="happy-outline" size={24} color={colors.secondaryText} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={value.trim() ? handleSend : () => {}}
          style={[styles.sendButton, { backgroundColor: colors.primaryGreen }]}
        >
          <Ionicons
            name={value.trim() ? 'send' : 'mic'}
            size={18}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  attachmentMenu: {
    padding: 16,
    marginBottom: 8,
    borderRadius: 16,
    borderWidth: 0.5,
  },
  attachmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  attachmentButton: {
    alignItems: 'center',
  },
  attachmentIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  attachmentLabel: {
    fontSize: 12,
    color: '#808080',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 0.5,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    paddingRight: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

