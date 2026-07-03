import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/colors';
import { FONTS, TYPOGRAPHY } from '../../constants/fonts';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'gradient' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  loading?: boolean;
  rightIcon?: React.ReactNode;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  style,
  textStyle,
  disabled,
  loading,
  rightIcon,
}: ButtonProps) {
  const isGradient = variant === 'gradient';

  const buttonStyle = [
    styles.base,
    styles[size],
    !isGradient && styles[variant as keyof typeof styles],
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`text_${size}` as keyof typeof styles],
    styles[`text_${variant}` as keyof typeof styles],
    textStyle,
  ];

  const content = (
    <View style={styles.contentRow}>
      {loading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? COLORS.primary : '#fff'} size="small" />
      ) : (
        <>
          <Text style={textStyles}>{title}</Text>
          {rightIcon && <View style={styles.rightIconWrapper}>{rightIcon}</View>}
        </>
      )}
    </View>
  );

  if (isGradient && !disabled) {
    const flattenedStyle = style ? StyleSheet.flatten(style) : null;
    const customHeight = flattenedStyle?.height;
    const customBorderRadius = flattenedStyle?.borderRadius;

    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.9}
        style={[styles.gradientContainer, style]}
      >
        <LinearGradient
          colors={['#1D4ED8', '#2563EB', '#3B82F6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.gradient,
            styles[size],
            customHeight !== undefined ? { height: customHeight, paddingVertical: 0 } : null,
            customBorderRadius !== undefined ? { borderRadius: customBorderRadius } : null,
          ]}
        >
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={buttonStyle as any}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {content}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  rightIconWrapper: {
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  small: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    height: 40,
  },
  medium: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    height: 52,
  },
  large: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    height: 58,
  },
  primary: {
    backgroundColor: COLORS.primary,
  },
  secondary: {
    backgroundColor: '#EFF6FF',
    borderColor: '#DBEAFE',
    borderWidth: 1,
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: COLORS.border,
    borderWidth: 1.5,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  text: {
    ...TYPOGRAPHY.button,
    textAlign: 'center',
  },
  text_small: {
    fontSize: 14,
  },
  text_medium: {
    fontSize: 16,
  },
  text_large: {
    fontSize: 16,
  },
  text_primary: {
    color: '#FFFFFF',
  },
  text_gradient: {
    color: '#FFFFFF',
  },
  text_secondary: {
    color: COLORS.primary,
  },
  text_outline: {
    color: COLORS.textPrimary,
  },
  text_ghost: {
    color: COLORS.textSecondary,
  },
});

