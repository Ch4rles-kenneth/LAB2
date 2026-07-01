import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PreviewScreenProps {
  photoUri?: string;
  onRetake?: () => void;
  onAnalyze?: () => void;
}

export default function PreviewScreen({
  photoUri = 'https://picsum.photos/400/800',
  onRetake,
  onAnalyze,
}: PreviewScreenProps) {
  return (
    <View style={styles.container}>
      <Image source={{ uri: photoUri }} style={styles.previewImage} />
      
      <View style={styles.actionRow}>
        <TouchableOpacity style={[styles.button, styles.retakeButton]} onPress={onRetake}>
          <Text style={styles.buttonText}>Retake</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.analyzeButton]} onPress={onAnalyze}>
          <Text style={styles.buttonText}>Analyze</Text>
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
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  retakeButton: {
    backgroundColor: '#475569',
  },
  analyzeButton: {
    backgroundColor: '#6366f1',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
