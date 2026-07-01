import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';

interface PreviewScreenProps {
  photoUri?: string;
  onRetake?: () => void;
  onAnalyze?: (promptKey: string) => void;
}

export default function PreviewScreen({
  photoUri = 'https://picsum.photos/400/800',
  onRetake,
  onAnalyze,
}: PreviewScreenProps) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  return (
    <View style={styles.container}>
      {/* Background Image view */}
      <Image 
        source={{ uri: photoUri }} 
        style={[
          styles.previewImage, 
          { 
            maxWidth: isTablet ? 600 : '100%', 
            alignSelf: 'center' 
          }
        ]} 
      />
      
      {/* Bottom Control Panel */}
      <View style={styles.controlPanel}>
        <Text style={styles.panelTitle}>AI Analysis Persona</Text>
        <Text style={styles.panelSubtitle}>Choose how you want Gemini to interpret the photo:</Text>
        
        {/* Personas Row */}
        <View style={styles.personaGrid}>
          <TouchableOpacity 
            style={[styles.personaButton, styles.academicBtn]} 
            onPress={() => onAnalyze?.('academic')}
            activeOpacity={0.8}
          >
            <Text style={styles.emoji}>🎓</Text>
            <Text style={styles.personaText}>Academic</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.personaButton, styles.safetyBtn]} 
            onPress={() => onAnalyze?.('safety')}
            activeOpacity={0.8}
          >
            <Text style={styles.emoji}>🚨</Text>
            <Text style={styles.personaText}>Safety</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.personaButton, styles.inventoryBtn]} 
            onPress={() => onAnalyze?.('inventory')}
            activeOpacity={0.8}
          >
            <Text style={styles.emoji}>📋</Text>
            <Text style={styles.personaText}>Inventory</Text>
          </TouchableOpacity>
        </View>

        {/* Retake Call to Action */}
        <TouchableOpacity style={styles.retakeButton} onPress={onRetake} activeOpacity={0.8}>
          <Text style={styles.retakeText}>Discard & Retake Photo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  previewImage: {
    flex: 1,
    resizeMode: 'contain',
  },
  controlPanel: {
    backgroundColor: '#090d16',
    borderTopWidth: 1,
    borderTopColor: '#1f2937',
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 36,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#f8fafc',
    textAlign: 'center',
  },
  panelSubtitle: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  personaGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 20,
  },
  personaButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  academicBtn: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderColor: '#6366f1',
  },
  safetyBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: '#ef4444',
  },
  inventoryBtn: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderColor: '#22c55e',
  },
  emoji: {
    fontSize: 22,
    marginBottom: 6,
  },
  personaText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  retakeButton: {
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#111827',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  retakeText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
  },
});
