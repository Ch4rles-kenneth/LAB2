import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

interface AnalysisResult {
  objects: string[];
  context: string;
  activities: string;
  recommendations: string;
}

export default function ResultScreen() {
  const [loading] = useState<boolean>(false);
  const [error] = useState<string | null>(null);
  const [analysis] = useState<AnalysisResult | null>({
    objects: ['Laptop', 'Book', 'Coffee Cup'],
    context: 'A student desk under natural morning light',
    activities: 'Studying or working on programming tasks',
    recommendations: 'Take a short break to rest your eyes.',
  });

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Analyzing image with Gemini...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.header}>Gemini Analysis</Text>

      {analysis && (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Objects Detected</Text>
            {analysis.objects.map((obj, i) => (
              <Text key={i} style={styles.listItem}>• {obj}</Text>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Context</Text>
            <Text style={styles.bodyText}>{analysis.context}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Activities</Text>
            <Text style={styles.bodyText}>{analysis.activities}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommendations</Text>
            <Text style={styles.bodyText}>{analysis.recommendations}</Text>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  contentContainer: {
    padding: 24,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 24,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    color: '#94a3b8',
    fontSize: 16,
  },
  errorText: {
    color: '#ef4444',
    textAlign: 'center',
    fontSize: 16,
  },
  section: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#818cf8',
    marginBottom: 8,
  },
  listItem: {
    fontSize: 15,
    color: '#e2e8f0',
    marginTop: 4,
  },
  bodyText: {
    fontSize: 15,
    color: '#e2e8f0',
    lineHeight: 22,
  },
});
