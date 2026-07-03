import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking, Alert } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { FONTS, TYPOGRAPHY } from '../../constants/fonts';
import { Booking } from '../../store/bookingStore';

interface BookingCardProps {
  booking: Booking;
  onPressQR?: () => void;
  onPressBookAgain?: () => void;
}

export default function BookingCard({ booking, onPressQR, onPressBookAgain }: BookingCardProps) {
  
  const getStatusColors = (status: string) => {
    switch (status) {
      case 'active':
        return { bg: '#EFF6FF', text: COLORS.primary, label: 'Active' };
      case 'completed':
        return { bg: '#ECFDF5', text: COLORS.success, label: 'Completed' };
      case 'cancelled':
        return { bg: '#FEF2F2', text: COLORS.error, label: 'Cancelled' };
      default:
        return { bg: '#F1F5F9', text: COLORS.textSecondary, label: status };
    }
  };

  const statusStyle = getStatusColors(booking.status);

  const handleDirections = () => {
    const query = encodeURIComponent(booking.location);
    Linking.openURL(`https://maps.google.com/?q=${query}`).catch(() => {
      Alert.alert('Directions Error', 'Could not open map maps application.');
    });
  };

  return (
    <View style={styles.card}>
      {/* Top Main Section */}
      <View style={styles.topSection}>
        <Image source={{ uri: booking.spaceImageUrl }} style={styles.image} />
        
        <View style={styles.details}>
          <View style={styles.rowBetween}>
            <Text style={styles.category}>{booking.category}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
              <Text style={[styles.statusText, { color: statusStyle.text }]}>{statusStyle.label}</Text>
            </View>
          </View>
          
          <Text style={styles.spaceName} numberOfLines={1}>{booking.spaceName}</Text>
          
          <View style={styles.infoRow}>
            <Feather name="calendar" size={12} color={COLORS.textSecondary} />
            <Text style={styles.infoText}>{booking.date}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Feather name="clock" size={12} color={COLORS.textSecondary} />
            <Text style={styles.infoText} numberOfLines={1}>{booking.timeSlot} ({booking.hours}h)</Text>
          </View>
        </View>
      </View>

      {/* Footer Invoice Section */}
      <View style={styles.footer}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>TOTAL PAID</Text>
          <Text style={styles.priceAmount}>${booking.totalPrice.toFixed(2)}</Text>
        </View>

        {/* Dynamic Action Buttons */}
        <View style={styles.actions}>
          {booking.status === 'active' && (
            <>
              <TouchableOpacity style={styles.outlineBtn} onPress={handleDirections} activeOpacity={0.7}>
                <Feather name="map-pin" size={13} color={COLORS.textPrimary} style={{ marginRight: 4 }} />
                <Text style={styles.outlineBtnText}>Directions</Text>
              </TouchableOpacity>
              
              {onPressQR && (
                <TouchableOpacity style={styles.primaryBtn} onPress={onPressQR} activeOpacity={0.8}>
                  <Ionicons name="qr-code-outline" size={13} color="#FFF" style={{ marginRight: 4 }} />
                  <Text style={styles.primaryBtnText}>Access QR</Text>
                </TouchableOpacity>
              )}
            </>
          )}

          {booking.status === 'completed' && (
            <>
              <TouchableOpacity style={styles.outlineBtn} activeOpacity={0.7}>
                <Feather name="edit-3" size={13} color={COLORS.textPrimary} style={{ marginRight: 4 }} />
                <Text style={styles.outlineBtnText}>Review</Text>
              </TouchableOpacity>
              
              {onPressBookAgain && (
                <TouchableOpacity style={styles.primaryBtn} onPress={onPressBookAgain} activeOpacity={0.8}>
                  <Feather name="rotate-ccw" size={13} color="#FFF" style={{ marginRight: 4 }} />
                  <Text style={styles.primaryBtnText}>Book Again</Text>
                </TouchableOpacity>
              )}
            </>
          )}

          {booking.status === 'cancelled' && (
            <TouchableOpacity style={styles.outlineBtn} onPress={onPressBookAgain} activeOpacity={0.7}>
              <Feather name="search" size={13} color={COLORS.textPrimary} style={{ marginRight: 4 }} />
              <Text style={styles.outlineBtnText}>Find Alternative</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
    marginBottom: 16,
    overflow: 'hidden',
  },
  topSection: {
    flexDirection: 'row',
    padding: 18, // Increased padding
  },
  image: {
    width: 90, // Increased image size
    height: 90,
    borderRadius: 16,
  },
  details: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  category: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusText: {
    ...TYPOGRAPHY.caption,
    fontSize: 9,
    fontFamily: FONTS.bold,
    textTransform: 'uppercase',
  },
  spaceName: {
    ...TYPOGRAPHY.cardTitle,
    color: COLORS.textPrimary,
    marginBottom: 8, // Increased margin
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6, // Increased spacing
  },
  infoText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14, // Increased padding
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#F8FAFC',
  },
  priceContainer: {
    justifyContent: 'center',
  },
  priceLabel: {
    ...TYPOGRAPHY.caption,
    fontSize: 9,
    fontFamily: FONTS.bold,
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
  priceAmount: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  outlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 34, // Increased height for whitespace
    marginRight: 8,
  },
  outlineBtnText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: COLORS.textPrimary,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 34, // Increased height for whitespace
  },
  primaryBtnText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: '#FFFFFF',
  },
});
