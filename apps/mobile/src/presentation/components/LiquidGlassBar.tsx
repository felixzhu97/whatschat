import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/src/presentation/shared/theme';

const VIBRANCY_LIGHT = 'rgba(255, 255, 255, 0.4)';
const VIBRANCY_DARK = 'rgba(0, 0, 0, 0.12)';

export function LiquidGlassBar() {
  const { isDark } = useTheme();
  const vibrancy = isDark ? VIBRANCY_DARK : VIBRANCY_LIGHT;

  return (
    <View style={styles.outer}>
      <BlurView
        intensity={78}
        tint={isDark ? 'dark' : 'light'}
        style={[StyleSheet.absoluteFill, styles.blur]}
      />
      <View style={[StyleSheet.absoluteFill, styles.overlay, { backgroundColor: vibrancy }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  blur: {},
  overlay: {},
});
