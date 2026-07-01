import React from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import PreviewScreen from '@/screens/PreviewScreen';

/**
 * /preview Route — Phase 3: Image Preview Screen
 *
 * This route reads the captured `photoUri` search parameter using Expo Router's
 * `useLocalSearchParams` and displays the PreviewScreen.
 *
 * - Tapping "Retake" executes `router.back()`, which pops this screen off the Stack
 *   and restores the active camera viewfinder.
 * - Tapping "Analyze" navigates to the `/result` page, passing along the `photoUri`.
 */
export default function PreviewRoute() {
  const params = useLocalSearchParams<{ photoUri: string }>();

  const handleRetake = () => {
    router.back();
  };

  const handleAnalyze = () => {
    if (params.photoUri) {
      router.push({
        pathname: '/result',
        params: { photoUri: params.photoUri },
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
