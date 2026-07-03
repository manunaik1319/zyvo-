import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FONTS } from '../../constants/fonts';

interface RatingBadgeProps {
  rating: number;
}

export default function RatingBadge({ rating }: RatingBadgeProps) {
  return (
    <View style={styles.badge}>
      <Text style={styles.star}>★</Text>
      <Text style={styles.text}>{rating.toFixed(1)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  star: {
    color: '#FFB800',
    fontSize: 12,
    marginRight: 4,
  },
  text: {
    color: '#FFB800',
    fontSize: 12,
    fontFamily: FONTS.bold,
  },
});

