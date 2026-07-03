import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FONTS } from '../../constants/fonts';

export default function ContactSupportScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleStartChat = () => {
    Alert.alert('Live Chat', 'Starting live support session with ZYVO assistant.');
  };

  const handleEmail = () => {
    Alert.alert('Email Support', 'Opening email composer for support@zyvoapp.com.');
  };

  const handleCall = () => {
    Alert.alert('Phone Support', 'Calling ZYVO support hotline: +91 1800 123 456.');
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* HEADER */}
      <View style={[styles.header, { paddingTop: insets.top || 14 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.75}>
          <Feather name="arrow-left" size={20} color="#111827" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={styles.headerTitle}>Contact Support</Text>
          <Text style={styles.headerSubtitle}>We are here to assist you 24/7</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        {/* CARDS FOR CHANNELS */}
        <Text style={styles.sectionTitle}>Get In Touch</Text>

        <TouchableOpacity style={styles.channelCard} onPress={handleStartChat} activeOpacity={0.9}>
          <View style={styles.iconBox}>
            <Feather name="message-square" size={20} color="#4F7EFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.channelName}>Live Chat Assistance</Text>
            <Text style={styles.channelDesc}>Instant response. Chat directly with support agents.</Text>
            <Text style={styles.channelMeta}>Expected wait: &lt; 2 minutes</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.channelCard} onPress={handleEmail} activeOpacity={0.9}>
          <View style={styles.iconBox}>
            <Feather name="mail" size={20} color="#4F7EFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.channelName}>Email Support</Text>
            <Text style={styles.channelDesc}>Send ticket inquiries and university validation issues.</Text>
            <Text style={styles.channelMeta}>Expected response: Within 2 hours</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.channelCard} onPress={handleCall} activeOpacity={0.9}>
          <View style={styles.iconBox}>
            <Feather name="phone" size={20} color="#4F7EFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.channelName}>Hotline Call Support</Text>
            <Text style={styles.channelDesc}>Speak directly with our team for emergency check-in bugs.</Text>
            <Text style={styles.channelMeta}>Available: 9:00 AM – 8:00 PM</Text>
          </View>
        </TouchableOpacity>

        {/* INFO FOOTER */}
        <View style={styles.infoCard}>
          <Feather name="clock" size={14} color="#6B7280" style={{ marginRight: 8, marginTop: 1 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>Business Hours</Text>
            <Text style={styles.infoText}>
              Standard office support operations run 9:00 AM to 8:00 PM IST on weekdays, while chatbot live ticket routing is active 24/7.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 14, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E8EEF8' },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: FONTS.bold, fontSize: 18, color: '#111827' },
  headerSubtitle: { fontFamily: FONTS.medium, fontSize: 12, color: '#6B7280', marginTop: 1 },

  scrollBody: { paddingHorizontal: 20, paddingBottom: 60, paddingTop: 16 },

  sectionTitle: { fontFamily: FONTS.bold, fontSize: 13, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12, paddingHorizontal: 4 },
  
  channelCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 24, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: '#E8EEF8', alignItems: 'flex-start' },
  iconBox: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  channelName: { fontFamily: FONTS.bold, fontSize: 14.5, color: '#111827' },
  channelDesc: { fontFamily: FONTS.medium, fontSize: 12, color: '#6B7280', marginTop: 4, lineHeight: 18 },
  channelMeta: { fontFamily: FONTS.bold, fontSize: 11, color: '#4F7EFF', marginTop: 8 },

  infoCard: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 20, padding: 14, marginTop: 14, borderWidth: 1, borderColor: '#E2E8F0' },
  infoTitle: { fontFamily: FONTS.bold, fontSize: 13, color: '#374151', marginBottom: 2 },
  infoText: { fontFamily: FONTS.medium, fontSize: 11.5, color: '#6B7280', lineHeight: 17 },
});
