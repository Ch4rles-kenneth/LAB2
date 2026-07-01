import { router } from 'expo-router';
import { Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

/**
 * HomeScreen — Phase 1 verification dashboard
 *
 * Shows environment variable status, installed dependencies, and folder
 * structure. The "Open Camera" button uses Expo Router's router.push()
 * to navigate to the /camera route (Phase 2).
 */
export default function HomeScreen() {
  // Safely read the Gemini key from the environment
  const geminiKey = process.env.EXPO_PUBLIC_GEMINI_KEY;
  const isKeyConfigured = !!geminiKey && geminiKey !== 'your_gemini_api_key_here';

  // Mask the key so it's safe to display on screen
  function getMaskedKey() {
    if (!geminiKey) return 'Not Found';
    if (geminiKey === 'your_gemini_api_key_here') return '⚠ Placeholder — add your real key';
    return `${geminiKey.substring(0, 8)}...${geminiKey.slice(-4)}`;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <View style={styles.headerSection}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>AI</Text>
          </View>
          <Text style={styles.title}>VisionAI</Text>
          <Text style={styles.subtitle}>Camera + Gemini Vision App</Text>
        </View>

        {/* ── Phase badge ─────────────────────────────────────────────────── */}
        <View style={styles.phaseBadge}>
          <Text style={styles.phaseBadgeText}>✅ Phase 1 Complete · 📷 Phase 2 Active</Text>
        </View>

        {/* ── Environment Variables ───────────────────────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Environment Variables</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Variable</Text>
            <Text style={styles.codeText}>EXPO_PUBLIC_GEMINI_KEY</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Access</Text>
            <Text style={styles.codeText}>process.env.EXPO_PUBLIC_...</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Status</Text>
            <View style={[styles.statusBadge, isKeyConfigured ? styles.badgeSuccess : styles.badgeWarning]}>
              <Text style={styles.statusText}>
                {isKeyConfigured ? '✓ Configured' : '⚠ Missing Key'}
              </Text>
            </View>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Value</Text>
            <Text style={styles.maskedValue}>{getMaskedKey()}</Text>
          </View>
        </View>

        {/* ── Dependencies ────────────────────────────────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Dependencies Installed</Text>

          <View style={styles.checkItem}>
            <Text style={styles.checkIcon}>✓</Text>
            <View style={styles.checkTextBlock}>
              <Text style={styles.checkTitle}>expo-camera</Text>
              <Text style={styles.checkDesc}>
                Native camera permissions, live preview, and photo capture
              </Text>
            </View>
          </View>

          <View style={styles.checkItem}>
            <Text style={styles.checkIcon}>✓</Text>
            <View style={styles.checkTextBlock}>
              <Text style={styles.checkTitle}>expo-router</Text>
              <Text style={styles.checkDesc}>
                File-based navigation — Stack + full-screen camera route
              </Text>
            </View>
          </View>
        </View>

        {/* ── Folder Structure ────────────────────────────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Scalable Folder Structure</Text>
          {[
            ['src/screens/', 'Full screen components (Camera, Preview, Result)'],
            ['src/lib/',     'API helpers (gemini.ts, roboflow.ts)'],
            ['src/components/', 'Reusable UI widgets'],
            ['src/app/',    'Expo Router file-based routes'],
          ].map(([dir, desc]) => (
            <View key={dir} style={styles.dirItem}>
              <Text style={styles.dirIcon}>📁</Text>
              <View>
                <Text style={styles.dirName}>{dir}</Text>
                <Text style={styles.dirDesc}>{desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── Open Camera ─────────────────────────────────────────────────── */}
        <TouchableOpacity
          style={styles.cameraButton}
          onPress={() => router.push('/camera')}
          accessibilityLabel="Open Camera Screen"
        >
          <Text style={styles.cameraButtonText}>📷  Open Camera</Text>
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
    paddingBottom: 48,
  },

  // ── Header ───────────────────────────────────────────────────────────────
  headerSection: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#4f46e5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#f8fafc',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },

  // ── Phase badge ──────────────────────────────────────────────────────────
  phaseBadge: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  phaseBadgeText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },

  // ── Cards ────────────────────────────────────────────────────────────────
  card: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },

  // ── Rows ─────────────────────────────────────────────────────────────────
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    color: '#64748b',
  },
  codeText: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#38bdf8',
    backgroundColor: '#0f172a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  maskedValue: {
    fontSize: 13,
    color: '#e2e8f0',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeSuccess: { backgroundColor: 'rgba(34,197,94,0.15)' },
  badgeWarning: { backgroundColor: 'rgba(234,179,8,0.15)' },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#f8fafc',
  },

  // ── Dependency checklist ─────────────────────────────────────────────────
  checkItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  checkIcon: {
    color: '#22c55e',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 12,
    marginTop: 2,
  },
  checkTextBlock: { flex: 1 },
  checkTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f1f5f9',
  },
  checkDesc: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    lineHeight: 18,
  },

  // ── Directory list ───────────────────────────────────────────────────────
  dirItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  dirIcon: { fontSize: 16, marginRight: 10, marginTop: 2 },
  dirName: { fontSize: 14, color: '#cbd5e1', fontWeight: '600' },
  dirDesc: { fontSize: 12, color: '#64748b', marginTop: 2 },

  // ── Camera CTA ───────────────────────────────────────────────────────────
  cameraButton: {
    backgroundColor: '#2E5BBA',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#2E5BBA',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  cameraButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
