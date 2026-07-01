import React from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import PreviewScreen from '@/screens/PreviewScreen';

/**
 * /preview Route — Phase 3/6
 *
 * Pulls the captured `photoUri` parameter, sets up standard retake triggers,
 * and handles prompt persona forwarding.
 */
export default function PreviewRoute() {
  const params = useLocalSearchParams<{ photoUri: string }>();

  const handleRetake = () => {
    router.back();
  };

  const handleAnalyze = (promptKey: string) => {
    if (params.photoUri) {
      router.push({
        pathname: '/result',
        params: { 
          photoUri: params.photoUri,
          promptKey: promptKey 
        },
      });
    }
  };

  return (
    <PreviewScreen
      photoUri={params.photoUri}
      onRetake={handleRetake}
      onAnalyze={handleAnalyze}
    />
  );
}
