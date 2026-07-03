import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FONTS } from '../../constants/fonts';

const CATEGORIES = ['Booking', 'Payment', 'App Bug', 'Suggestion'];

export default function ReportProblemScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [category, setCategory] = useState('App Bug');
  const [description, setDescription] = useState('');
  const [attachment, setAttachment] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!description) {
      Alert.alert('Details Required', 'Please enter a description of the problem.');
      return;
    }
    Alert.alert('Report Submitted', 'Our engineering team has received your ticket and will audit the session logs shortly.', [
      { text: 'OK', onPress: () => router.back() }
    ]);
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
          <Text style={styles.headerTitle}>Report a Problem</Text>
          <Text style={styles.headerSubtitle}>Describe issues or suggest features</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        {/* ISSUE CATEGORY */}
        <Text style={styles.sectionTitle}>Issue Category</Text>
        <View style={styles.categoryRow}>
          {CATEGORIES.map((cat) => {
            const active = category === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.catBtn, active && styles.catBtnActive]}
                onPress={() => setCategory(cat)}
                activeOpacity={0.8}
              >
                <Text style={[styles.catText, active && styles.catTextActive]}>{cat}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* DETAILS INPUT */}
        <Text style={styles.sectionTitle}>Details</Text>
        <View style={styles.card}>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={6}
            placeholder="Please detail the steps to reproduce the bug. For payment issues, specify the transaction ID..."
            placeholderTextColor="#9CA3AF"
            value={description}
            onChangeText={setDescription}
            textAlignVertical="top"
          />
        </View>

        {/* SCREENSHOT ATTACHMENT */}
        <Text style={styles.sectionTitle}>Attachments</Text>
        <TouchableOpacity
          style={styles.attachBtn}
          activeOpacity={0.8}
          onPress={() => setAttachment('screenshot_1.jpg')}
        >
          <Feather name={attachment ? "check" : "camera"} size={16} color="#4F7EFF" style={{ marginRight: 6 }} />
          <Text style={styles.attachBtnTxt}>
            {attachment ? 'Screenshot Attached (1)' : 'Attach Screenshot'}
          </Text>
        </TouchableOpacity>

        {/* SUBMIT BUTTON */}
        <TouchableOpacity style={styles.submitBtn} activeOpacity={0.85} onPress={handleSubmit}>
          <Text style={styles.submitBtnTxt}>Submit Report</Text>
        </TouchableOpacity>
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

  sectionTitle: { fontFamily: FONTS.bold, fontSize: 13, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10, paddingHorizontal: 4 },
  
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  catBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E8EEF8' },
  catBtnActive: { backgroundColor: '#4F7EFF', borderColor: '#4F7EFF' },
  catText: { fontFamily: FONTS.medium, fontSize: 12.5, color: '#4B5563' },
  catTextActive: { fontFamily: FONTS.bold, color: '#FFFFFF' },

  card: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#E8EEF8' },
  textArea: { fontFamily: FONTS.medium, fontSize: 13.5, color: '#111827', height: 120 },

  attachBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E8EEF8', borderRadius: 16, height: 48, marginBottom: 24 },
  attachBtnTxt: { fontFamily: FONTS.bold, fontSize: 13, color: '#4F7EFF' },

  submitBtn: { backgroundColor: '#4F7EFF', borderRadius: 20, height: 50, justifyContent: 'center', alignItems: 'center' },
  submitBtnTxt: { fontFamily: FONTS.bold, fontSize: 14, color: '#FFFFFF' },
});
