import React, { useState } from 'react';
import { TouchableOpacity, Modal, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styled } from '@/src/presentation/shared/emotion';
import { useTheme } from '@/src/presentation/shared/theme';

interface ChatInputFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: (text: string) => void;
  onAttachmentPress?: () => void;
  onCameraPress?: () => void;
}

const Bar = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 6px 10px 10px;
  background-color: transparent;
`;

const AttachmentSheet = styled.View`
  background-color: ${(p) => p.theme.colors.secondaryBackground};
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  padding-top: 20px;
  padding-bottom: 24px;
  padding-horizontal: 16px;
`;

const AttachmentGrid = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;

const AttachmentItem = styled.TouchableOpacity`
  align-items: center;
  min-width: 72px;
`;

const AttachmentIconWrap = styled.View`
  width: 56px;
  height: 56px;
  border-radius: 28px;
  justify-content: center;
  align-items: center;
  margin-bottom: 8px;
`;

const AttachmentLabel = styled.Text`
  font-size: 13px;
  color: ${(p) => p.theme.colors.secondaryText};
`;

const Pill = styled.View`
  flex: 1;
  flex-direction: row;
  align-items: center;
  min-height: 40px;
  max-height: 100px;
  border-radius: 24px;
  padding-left: 12px;
  padding-right: 8px;
  padding-vertical: 8px;
  margin-right: 8px;
  background-color: #FFFFFF;
  shadow-color: #000;
  shadow-offset: 0 1px;
  shadow-opacity: 0.08;
  shadow-radius: 4px;
  elevation: 2;
`;

const Input = styled.TextInput`
  flex: 1;
  font-size: 16px;
  padding: 0;
  padding-horizontal: 8px;
  color: ${(p) => p.theme.colors.primaryText};
`;

const InPillIcon = styled.TouchableOpacity`
  width: 36px;
  height: 36px;
  justify-content: center;
  align-items: center;
`;

const VoiceButton = styled.TouchableOpacity`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  justify-content: center;
  align-items: center;
  background-color: ${(p) => p.theme.colors.primaryGreen};
`;

const ATTACHMENT_OPTIONS = [
  { key: 'camera', icon: 'camera' as const, label: '相机', colorKey: 'iosBlue' },
  { key: 'gallery', icon: 'images' as const, label: '相册', colorKey: 'iosGreen' },
  { key: 'document', icon: 'document' as const, label: '文件', colorKey: 'iosPurple' },
  { key: 'location', icon: 'location' as const, label: '位置', colorKey: 'iosRed' },
];

export const ChatInputField: React.FC<ChatInputFieldProps> = ({
  value,
  onChangeText,
  onSend,
  onCameraPress,
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

  const closeAttachmentMenu = () => setShowAttachmentMenu(false);

  return (
    <>
      <Modal
        visible={showAttachmentMenu}
        transparent
        animationType="slide"
        onRequestClose={closeAttachmentMenu}
      >
        <View style={styles.modalContainer}>
          <Pressable
            style={[StyleSheet.absoluteFill, styles.backdrop]}
            onPress={closeAttachmentMenu}
          />
          <View style={styles.sheetContainer}>
            <AttachmentSheet>
              <AttachmentGrid>
                {ATTACHMENT_OPTIONS.map((opt) => (
                  <AttachmentItem key={opt.key} onPress={() => {}}>
                    <AttachmentIconWrap
                      style={{
                        backgroundColor: (colors as Record<string, string>)[opt.colorKey],
                      }}
                    >
                      <Ionicons name={opt.icon} size={26} color="#FFFFFF" />
                    </AttachmentIconWrap>
                    <AttachmentLabel>{opt.label}</AttachmentLabel>
                  </AttachmentItem>
                ))}
              </AttachmentGrid>
            </AttachmentSheet>
          </View>
        </View>
      </Modal>
      <Bar>
        <Pill>
          <InPillIcon onPress={() => {}}>
            <Ionicons name="happy-outline" size={24} color={colors.secondaryText} />
          </InPillIcon>
          <Input
            value={value}
            onChangeText={onChangeText}
            placeholder="Message"
            placeholderTextColor="#8E8E93"
            multiline
            maxLength={1000}
            onSubmitEditing={handleSend}
          />
          <InPillIcon onPress={() => setShowAttachmentMenu(!showAttachmentMenu)}>
            <Ionicons name="attach-outline" size={22} color={colors.secondaryText} />
          </InPillIcon>
          <InPillIcon onPress={onCameraPress ?? (() => {})}>
            <Ionicons name="camera-outline" size={22} color={colors.secondaryText} />
          </InPillIcon>
        </Pill>
        <VoiceButton
          onPress={value.trim() ? handleSend : () => {}}
          disabled={!value.trim()}
        >
          <Ionicons
            name={value.trim() ? 'send' : 'mic'}
            size={22}
            color="#FFFFFF"
          />
        </VoiceButton>
      </Bar>
    </>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheetContainer: {},
});
