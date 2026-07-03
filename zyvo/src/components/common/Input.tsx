import React, { useState } from 'react';
import { TextInput, StyleSheet, View, Text, TextInputProps, ViewStyle, Platform } from 'react-native';
import { COLORS } from '../../constants/colors';
import { FONTS, TYPOGRAPHY } from '../../constants/fonts';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export default function Input({ label, error, style, containerStyle, leftIcon, rightIcon, ...props }: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const inputFontSize = 16;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          leftIcon ? styles.inputContainerWithIcon : null,
          isFocused ? styles.inputFocused : null,
          error ? styles.inputError : null,
        ]}
      >
        {leftIcon && <View style={styles.iconWrapper}>{leftIcon}</View>}
        <TextInput
          style={[styles.input, { fontSize: inputFontSize }, style]}
          placeholderTextColor={COLORS.textMuted}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus && props.onFocus(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur && props.onBlur(e);
          }}
          {...props}
        />
        {rightIcon && <View style={styles.rightIconWrapper}>{rightIcon}</View>}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    width: '100%',
  },
  label: {
    ...TYPOGRAPHY.label,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 16,
    backgroundColor: COLORS.card,
    height: 52,
    paddingHorizontal: 16,
  },
  inputContainerWithIcon: {
    paddingLeft: 12,
  },
  iconWrapper: {
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightIconWrapper: {
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: '100%',
    fontFamily: FONTS.regular,
    color: COLORS.textPrimary,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      } as any,
    }),
  },
  inputFocused: {
    borderColor: COLORS.primary,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    fontFamily: FONTS.regular,
    color: COLORS.error,
    fontSize: 12,
    marginTop: 4,
  },
});

