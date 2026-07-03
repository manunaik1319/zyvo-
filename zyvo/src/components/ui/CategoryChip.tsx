import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { FONTS, TYPOGRAPHY } from '../../constants/fonts';

interface CategoryChipProps {
  label: string;
  selected?: boolean;
  onPress: () => void;
}

export default function CategoryChip({ label, selected, onPress }: CategoryChipProps) {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.selectedChip]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.text, selected && styles.selectedText]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 24,
    backgroundColor: COLORS.card,
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: '#E2E8F0', // Slate 200
  },
  selectedChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  text: {
    ...TYPOGRAPHY.label,
    color: COLORS.textSecondary,
  },
  selectedText: {
    color: '#FFF',
    fontFamily: FONTS.semiBold,
  },
});

