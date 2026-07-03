import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Circle, Text as SvgText } from 'react-native-svg';

interface LogoWordmarkProps {
  size?: number;
  darkColor?: string;
  isLight?: boolean;
}

export default function LogoWordmark({ size = 34, darkColor = '#111827', isLight = false }: LogoWordmarkProps) {
  const scale = size / 34;
  const width = 140 * scale;
  const height = 44 * scale;

  const primaryColor = isLight ? '#FFFFFF' : '#4F46E5';
  const textColor = isLight ? '#FFFFFF' : darkColor;

  return (
    <View style={{ width, height, justifyContent: 'center', alignItems: 'center' }}>
      <Svg width={width} height={height} viewBox="0 0 140 44" fill="none">
        {/* Stylized geometric Z logo matching user's image */}
        <Path
          d="M 12 14 L 32 14 L 14 34"
          stroke={primaryColor}
          strokeWidth={6.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Circle
          cx="33"
          cy="34"
          r="3.25"
          fill={primaryColor}
        />
        {/* ZYVO Text Wordmark next to it */}
        <SvgText
          x="50"
          y="32"
          fontSize="26"
          fontWeight="bold"
          fill={textColor}
          fontFamily="System"
          letterSpacing={1.2}
        >
          ZYVO
        </SvgText>
      </Svg>
    </View>
  );
}
