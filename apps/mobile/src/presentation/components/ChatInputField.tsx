import React, { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styled } from '@/src/presentation/shared/emotion';
import { useTheme } from '@/src/presentation/shared/theme';

interface ChatInputFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: (text: string) => void;
  onAttachmentPress?: () => void;
}

const Container = styled.View`
  padding: 8px 16px;
`;

const AttachmentMenu = styled.View`
  padding: 16px;
  margin-bottom: 8px;
  border-radius: 16px;
  border-width: 0.5px;
  background-color: ${(p) => p.theme.colors.secondaryBackground};
  border-color: ${(p) => p.theme.colors.separator};
`;

const AttachmentRow = styled.View`
  flex-direction: row;
  justify-content: space-around;
`;

const AttachmentButton = styled.TouchableOpacity`
  align-items: center;
`;

const AttachmentIcon = styled.View`
  width: 56px;
  height: 56px;
  border-radius: 28px;
  justify-content: center;
  align-items: center;
  margin-bottom: 8px;
  background-color: ${(p) => p.theme.colors.iosBlue};
`;

const AttachmentIconGreen = styled(AttachmentIcon)`
  background-color: ${(p) => p.theme.colors.iosGreen};
`;

const AttachmentIconPurple = styled(AttachmentIcon)`
  background-color: ${(p) => p.theme.colors.iosPurple};
`;

const AttachmentIconRed = styled(AttachmentIcon)`
  background-color: ${(p) => p.theme.colors.iosRed};
`;

const AttachmentLabel = styled.Text`
  font-size: 12px;
  color: #808080;
`;

const InputContainer = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const InputWrapper = styled.View`
  flex: 1;
  flex-direction: row;
  align-items: center;
  border-radius: 20px;
  border-width: 0.5px;
  padding: 10px 16px;
  background-color: ${(p) => p.theme.colors.secondaryBackground};
  border-color: ${(p) => p.theme.colors.separator};
`;

const Input = styled.TextInput`
  flex: 1;
  font-size: 16px;
  max-height: 100px;
  padding-right: 8px;
  color: ${(p) => p.theme.colors.primaryText};
`;

const SendButton = styled.TouchableOpacity`
  width: 36px;
  height: 36px;
  border-radius: 18px;
  justify-content: center;
  align-items: center;
  background-color: ${(p) => p.theme.colors.primaryGreen};
`;

const AddButton = styled.TouchableOpacity`
  align-items: center;
  background-color: ${(p: { active: boolean }) =>
    p.active ? p.theme.colors.primaryGreen + '20' : 'transparent'};
`;

export const ChatInputField: React.FC<ChatInputFieldProps> = ({
  value,
  onChangeText,
  onSend,
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
    <Container>
      {showAttachmentMenu && (
        <AttachmentMenu>
          <AttachmentRow>
            <AttachmentButton onPress={() => {}}>
              <AttachmentIcon>
                <Ionicons name="camera" size={24} color="#FFFFFF" />
              </AttachmentIcon>
              <AttachmentLabel>相机</AttachmentLabel>
            </AttachmentButton>
            <AttachmentButton onPress={() => {}}>
              <AttachmentIconGreen>
                <Ionicons name="images" size={24} color="#FFFFFF" />
              </AttachmentIconGreen>
              <AttachmentLabel>相册</AttachmentLabel>
            </AttachmentButton>
            <AttachmentButton onPress={() => {}}>
              <AttachmentIconPurple>
                <Ionicons name="document" size={24} color="#FFFFFF" />
              </AttachmentIconPurple>
              <AttachmentLabel>文件</AttachmentLabel>
            </AttachmentButton>
            <AttachmentButton onPress={() => {}}>
              <AttachmentIconRed>
                <Ionicons name="location" size={24} color="#FFFFFF" />
              </AttachmentIconRed>
              <AttachmentLabel>位置</AttachmentLabel>
            </AttachmentButton>
          </AttachmentRow>
        </AttachmentMenu>
      )}
      <InputContainer>
        <AddButton
          active={showAttachmentMenu}
          onPress={() => setShowAttachmentMenu(!showAttachmentMenu)}
        >
          <Ionicons
            name={showAttachmentMenu ? 'close' : 'add'}
            size={20}
            color={colors.primaryGreen}
          />
        </AddButton>
        <InputWrapper>
          <Input
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
        </InputWrapper>
        <SendButton
          onPress={value.trim() ? handleSend : () => {}}
          disabled={!value.trim()}
        >
          <Ionicons
            name={value.trim() ? 'send' : 'mic'}
            size={18}
            color="#FFFFFF"
          />
        </SendButton>
      </InputContainer>
    </Container>
  );
};
