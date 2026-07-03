import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/fonts';

interface OccupancyBadgeProps {
  capacity: number;
}

export default function OccupancyBadge({ capacity }: OccupancyBadgeProps) {
  return (
    <View style={styles.badge}>
      <Text style={styles.text}>Up to {capacity} people</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: '#EFF6FF', // Light blue tint
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  text: {
    color: COLORS.primary,
    fontSize: 11,
    fontFamily: FONTS.semiBold,
  },
});

