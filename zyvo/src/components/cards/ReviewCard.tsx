import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ReviewCardProps {
  review: {
    userName: string;
    rating: number;
    comment: string;
    date: string;
  };
}

export default function ReviewCard({ review }: ReviewCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.userName}>{review.userName}</Text>
        <Text style={styles.rating}>★ {review.rating}</Text>
      </View>
      <Text style={styles.comment}>{review.comment}</Text>
      <Text style={styles.date}>{review.date}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: '#fafafa',
    borderRadius: 8,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  userName: {
    fontWeight: 'bold',
  },
  rating: {
    color: '#FFCC00',
  },
  comment: {
    color: '#444',
    marginBottom: 4,
  },
  date: {
    fontSize: 11,
    color: '#999',
  },
});
