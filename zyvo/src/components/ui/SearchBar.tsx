import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { FONTS, TYPOGRAPHY } from '../../constants/fonts';

interface SearchBarProps {
  placeholder: string;
  onSearch: (text: string) => void;
  onFilterPress?: () => void;
  value?: string;
}

export default function SearchBar({ placeholder, onSearch, onFilterPress, value }: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const hasText = value && String(value).length > 0;
  const inputFontSize = hasText ? 16 : 15;

  return (
    <View style={[styles.container, isFocused ? styles.focused : null]}>
      <Feather name="search" size={18} color={COLORS.textSecondary} style={styles.searchIcon} />
      <TextInput
        style={[styles.input, { fontSize: inputFontSize }]}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        onChangeText={onSearch}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        value={value}
        autoCorrect={false}
      />
      {onFilterPress && (
        <TouchableOpacity style={styles.filterBtn} onPress={onFilterPress} activeOpacity={0.7}>
          <Feather name="sliders" size={16} color={COLORS.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 52, // Expanded height
    borderWidth: 1.5,
    borderColor: '#E2E8F0', // Slate 200
    marginBottom: 24, // Increased spacing
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.01,
    shadowRadius: 8,
    elevation: 1,
  },
  focused: {
    borderColor: COLORS.primary,
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontFamily: FONTS.regular,
    color: COLORS.textPrimary,
    height: '100%',
    padding: 0, // Reset default padding
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      } as any,
    }),
  },
  filterBtn: {
    padding: 6,
    marginLeft: 6,
    backgroundColor: '#EFF6FF', // Light blue background
    borderRadius: 8,
  },
});
