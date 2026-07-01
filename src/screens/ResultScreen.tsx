import React, { useState, useEffect } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { imageToBase64, analyzeImage } from '@/lib/gemini';

// Structured JSON analysis prompt for Gemini
const ANALYSIS_PROMPT = `
Analyze this image. Identify:
1. Objects - list the distinct physical objects you see
2. Context - briefly describe the setting or scene
3. Activities - what activity appears to be happening, if any
4. Recommendations - one practical suggestion based on the scene

Respond ONLY with valid JSON in this exact shape, no extra text:
{
  "objects": ["...", "..."],
  "context": "...",
  "activities": "...",
  "recommendations": "..."
}
`;

interface AnalysisResult {
  objects: string[];
  context: string;
  activities: string;
  recommendations: string;
}

interface ResultScreenProps {
  photoUri?: string;
}

export default function ResultScreen({ photoUri }: ResultScreenProps) {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = async (uri: string) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Convert local file to base64 encoding
      const base64Image = await imageToBase64(uri);
      if (!base64Image) {
        throw new Error('Could not convert the image. The file may be empty or missing.');
      }

      // 2. Transmit to Google's Gemini API
      const response = await analyzeImage(base64Image, ANALYSIS_PROMPT);
      
      // 3. Extract text from response structure
      const textPart = response?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!textPart) {
        throw new Error('Gemini did not return any analysis content.');
      }

      // 4. Sanitize potential markdown code fences from the JSON string
      let jsonString = textPart.trim();
      if (jsonString.startsWith('```')) {
        jsonString = jsonString
          .replace(/^```(json)?/, '')
          .replace(/```$/, '')
          .trim();
      }

      // 5. Parse and store
      const parsedAnalysis: AnalysisResult = JSON.parse(jsonString);
      setAnalysis(parsedAnalysis);
    } catch (err: any) {
      console.error('Analysis failed:', err);
      setError(err?.message || 'Could not analyze this image. Please check your network and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (photoUri) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      runAnalysis(photoUri);
    } else {
      setError('No photo was provided for analysis.');
      setLoading(false);
    }
  }, [photoUri]);

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
        <Text style={styles.errorLabel}>Analysis Error</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={() => photoUri && runAnalysis(photoUri)}
        >
          <Text style={styles.retryButtonText}>Retry Analysis</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.retryButton, styles.backButton]} 
          onPress={() => router.back()}
        >
          <Text style={styles.retryButtonText}>Back to Preview</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* Header bar */}
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Analysis Results</Text>
        <TouchableOpacity style={styles.doneButton} onPress={() => router.dismissAll()}>
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {analysis && (
          <>
            {/* Objects section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Objects Detected</Text>
              {analysis.objects && analysis.objects.length > 0 ? (
                analysis.objects.map((obj, i) => (
                  <Text key={i} style={styles.listItem}>• {obj}</Text>
                ))
              ) : (
                <Text style={styles.bodyText}>No distinct objects detected.</Text>
              )}
            </View>

            {/* Context section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Scene Context</Text>
              <Text style={styles.bodyText}>{analysis.context || 'N/A'}</Text>
            </View>

            {/* Activities section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Activities</Text>
              <Text style={styles.bodyText}>{analysis.activities || 'N/A'}</Text>
            </View>

            {/* Recommendations section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>AI Recommendations</Text>
              <Text style={styles.bodyText}>{analysis.recommendations || 'N/A'}</Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  headerTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
  },
  doneButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  doneButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 13,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#090d16',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: '500',
  },
  errorLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 8,
  },
  errorText: {
    color: '#cbd5e1',
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#4f46e5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
    marginBottom: 12,
  },
  backButton: {
    backgroundColor: '#374151',
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1f2937',
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#818cf8',
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  listItem: {
    fontSize: 15,
    color: '#cbd5e1',
    marginTop: 4,
    lineHeight: 22,
  },
  bodyText: {
    fontSize: 15,
    color: '#cbd5e1',
    lineHeight: 22,
  },
});
