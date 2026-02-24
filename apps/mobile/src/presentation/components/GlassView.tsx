import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/src/presentation/shared/theme';

interface GlassViewProps {
  children: React.ReactNode;
  intensity?: number;
  style?: ViewStyle;
  borderRadius?: number;
  liquid?: boolean;
}

const LIQUID_RADIUS = 20;
const VIBRANCY_LIGHT = 'rgba(255, 255, 255, 0.38)';
const VIBRANCY_DARK = 'rgba(0, 0, 0, 0.18)';

export const GlassView: React.FC<GlassViewProps> = ({
  children,
  intensity = 60,
  style,
  borderRadius = 0,
  liquid = false,
}) => {
  const { isDark } = useTheme();
  const tint = isDark ? 'dark' : 'light';
  const radius = liquid ? LIQUID_RADIUS : borderRadius;
  const blurIntensity = liquid ? 80 : intensity;
  const vibrancy = isDark ? VIBRANCY_DARK : VIBRANCY_LIGHT;

  return (
    <View style={[styles.outer, { borderRadius: radius }, style]}>
      <BlurView
        intensity={blurIntensity}
        tint={tint}
        style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
      />
      {liquid && (
        <View
          style={[
            StyleSheet.absoluteFill,
            { borderRadius: radius, backgroundColor: vibrancy },
          ]}
          pointerEvents="none"
        />
      )}
      <View style={[styles.content, { borderRadius: radius }]}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  outer: {
    overflow: 'hidden',
  },
  content: {
    backgroundColor: 'transparent',
  },
});
