import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useTheme } from '@/src/presentation/shared/theme';

interface ChatAvatarProps {
  name: string;
  imageUrl?: string;
  size?: number;
  showBorder?: boolean;
}

export const ChatAvatar: React.FC<ChatAvatarProps> = ({
  name,
  imageUrl,
  size = 50,
  showBorder = false,
}) => {
  const { colors } = useTheme();

  const getInitial = () => {
    return name?.[0]?.toUpperCase() || '?';
  };

  const getAvatarColor = (name: string): string => {
    const colors = [
      '#FF6B6B',
      '#4ECDC4',
      '#45B7D1',
      '#FFA07A',
      '#98D8C8',
      '#F7DC6F',
      '#BB8FCE',
      '#85C1E2',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: showBorder ? 2 : 0,
          borderColor: colors.primaryGreen,
        },
      ]}
    >
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.image} />
      ) : (
        <View
          style={[
            styles.placeholder,
            {
              backgroundColor: getAvatarColor(name),
              width: size,
              height: size,
              borderRadius: size / 2,
            },
          ]}
        >
          <Text style={[styles.initial, { fontSize: size * 0.36 }]}>{getInitial()}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initial: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

