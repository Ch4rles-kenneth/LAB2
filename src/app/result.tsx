import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import ResultScreen from '@/screens/ResultScreen';

/**
 * /result Route — Phase 3/5
 *
 * Extracts the captured `photoUri` search parameter from navigation and passes it
 * to the `ResultScreen` component.
 */
export default function ResultRoute() {
  const params = useLocalSearchParams<{ photoUri: string }>();

  return <ResultScreen photoUri={params.photoUri} />;
}
