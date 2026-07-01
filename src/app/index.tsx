import React, { useState } from 'react';
import { Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CameraScreen from '@/screens/CameraScreen';

export default function HomeScreen() {
  const [showCamera, setShowCamera] = useState<boolean>(false);

  // Safely access the Gemini API Key
  const geminiKey = process.env.EXPO_PUBLIC_GEMINI_KEY;
  const isKeyConfigured = !!geminiKey && geminiKey !== 'your_gemini_api_key_here';

  // Helper to mask key for display
  const getMaskedKey = () => {
    if (!geminiKey) return 'Not Found';
    if (geminiKey === 'your_gemini_api_key_here') return 'Placeholder Value';
    return `${geminiKey.substring(0, 8)}...${geminiKey.substring(geminiKey.length - 4)}`;
  };

  if (showCamera) {
    return (
      <SafeAreaView style={styles.cameraContainer}>
        <View style={styles.cameraHeader}>
          <Text style={styles.cameraTitle}>Live Camera Feed</Text>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={() => setShowCamera(false)}
          >
            <Text style={styles.closeButtonText}>Close Camera</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.cameraWrapper}>
          <CameraScreen />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.headerSection}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>AI</Text>
          </View>
          <Text style={styles.title}>VisionAI</Text>
          <Text style={styles.subtitle}>Phase 1 Setup & Verification</Text>
        </View>

        {/* Environment Variable Verification */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Environment Variables</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Var Name:</Text>
            <Text style={styles.codeText}>EXPO_PUBLIC_GEMINI_KEY</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Access Code:</Text>
            <Text style={styles.codeText}>process.env.EXPO_PUBLIC_...</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Status:</Text>
            <View style={[styles.statusBadge, isKeyConfigured ? styles.badgeSuccess : styles.badgeWarning]}>
              <Text style={styles.statusText}>
                {isKeyConfigured ? 'Configured' : 'Missing Key'}
              </Text>
            </View>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Value:</Text>
            <Text style={styles.maskedValueText}>{getMaskedKey()}</Text>
          </View>
        </View>

        {/* Dependency Status Checklist */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Dependencies installed</Text>
          <View style={styles.checkItem}>
            <Text style={styles.checkIcon}>✓</Text>
            <View>
              <Text style={styles.checkTitle}>expo-camera</Text>
              <Text style={styles.checkDesc}>Provides native camera components and permissions hooks</Text>
            </View>
          </View>
          <View style={styles.checkItem}>
            <Text style={styles.checkIcon}>✓</Text>
            <View>
              <Text style={styles.checkTitle}>expo-router</Text>
              <Text style={styles.checkDesc}>File-based routing navigation for modern Expo apps</Text>
            </View>
          </View>
        </View>

        {/* Directory Structure Verification */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Folder Structure Scalability</Text>
          <View style={styles.dirItem}>
            <Text style={styles.dirIcon}>📁</Text>
            <Text style={styles.dirName}>src/components/ <Text style={styles.dirMute}>(Reusable UI)</Text></Text>
          </View>
          <View style={styles.dirItem}>
            <Text style={styles.dirIcon}>📁</Text>
            <Text style={styles.dirName}>src/screens/ <Text style={styles.dirMute}>(App screens logic)</Text></Text>
          </View>
          <View style={styles.dirItem}>
            <Text style={styles.dirIcon}>📁</Text>
            <Text style={styles.dirName}>src/lib/ <Text style={styles.dirMute}>(External API configs)</Text></Text>
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => setShowCamera(true)}
        >
          <Text style={styles.actionButtonText}>Test Camera Permission & View</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  headerSection: {
    alignItems: 'center',
    marginVertical: 32,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#4f46e5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#94a3b8',
  },
  codeText: {
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#38bdf8',
    backgroundColor: '#0f172a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  maskedValueText: {
    fontSize: 14,
    color: '#e2e8f0',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeSuccess: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
  },
  badgeWarning: {
    backgroundColor: 'rgba(234, 179, 8, 0.2)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#f8fafc',
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  checkIcon: {
    color: '#22c55e',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 12,
  },
  checkTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#f1f5f9',
  },
  checkDesc: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
    lineHeight: 18,
  },
  dirItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dirIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  dirName: {
    fontSize: 14,
    color: '#cbd5e1',
  },
  dirMute: {
    color: '#64748b',
    fontSize: 12,
  },
  actionButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  cameraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#0f172a',
  },
  cameraTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  closeButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 12,
  },
  cameraWrapper: {
    flex: 1,
  },
});
