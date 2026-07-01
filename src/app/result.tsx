import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import ResultScreen from '@/screens/ResultScreen';

/**
 * /result Route — Phase 6
 *
 * Reads both `photoUri` and `promptKey` from navigation parameters and binds them to
 * the ResultScreen component.
 */
export default function ResultRoute() {
  const params = useLocalSearchParams<{ photoUri: string; promptKey: string }>();

  return (
    <ResultScreen 
      photoUri={params.photoUri} 
      promptKey={params.promptKey} 
    />
  );
}
