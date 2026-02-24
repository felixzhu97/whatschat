import React from 'react';
import { ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/src/presentation/shared/theme';
import { styled } from '@/src/presentation/shared/emotion';

const Outer = styled.View`
  overflow: hidden;
`;

const Content = styled.View`
  background-color: transparent;
`;

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

const absoluteFill = { position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0 };

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
    <Outer style={[{ borderRadius: radius }, style]}>
      <BlurView
        intensity={blurIntensity}
        tint={tint}
        style={[absoluteFill, { borderRadius: radius }]}
      />
      {liquid && (
        <Outer
          style={[absoluteFill, { borderRadius: radius, backgroundColor: vibrancy }]}
          pointerEvents="none"
        />
      )}
      <Content style={{ borderRadius: radius }}>{children}</Content>
    </Outer>
  );
};
