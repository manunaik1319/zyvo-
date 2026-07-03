import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/fonts';

export default function OfflineScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.content}>
        <Feather name="wifi-off" size={80} color={COLORS.error} style={{ marginBottom: 20 }} />
        <Text style={styles.errorTitle}>No Connection</Text>
        <Text style={styles.errorDesc}>You are currently offline. Please check your internet connectivity.</Text>
        <TouchableOpacity style={styles.btn}>
          <Text style={styles.btnText}>Retry Connection</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  errorTitle: { fontFamily: FONTS.bold, fontSize: 24, color: COLORS.textPrimary, marginBottom: 8 },
  errorDesc: { fontFamily: FONTS.regular, fontSize: 15, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  btn: { height: 48, paddingHorizontal: 32, borderRadius: 24, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  btnText: { fontFamily: FONTS.bold, fontSize: 16, color: '#FFF' },
});
