import { useRef } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * CameraScreen — Phase 2: Camera Fundamentals
 *
 * Implements three states as required by the guide:
 *  1. null permission  → empty View (OS is still loading permission status)
 *  2. !permission.granted → friendly prompt + "Grant Permission" button
 *  3. permission.granted  → full-screen CameraView + circular Capture button
 *
 * useRef is used (not useState) for the camera reference because we only
 * need a stable handle to call takePictureAsync() — we never need React
 * to re-render when that reference changes.
 */
export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const insets = useSafeAreaInsets();

  // ── State 1: Permission status still loading ──────────────────────────────
  if (!permission) {
    return <View style={styles.container} />;
  }

  // ── State 2: Permission denied ────────────────────────────────────────────
  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        {/* iOS and Android phrase permission dialogs differently */}
        <Text style={styles.permissionText}>
          {Platform.OS === 'ios'
            ? 'VisionAI needs camera access.\nTap below, then choose "Allow" in the dialog.'
            : 'VisionAI needs camera access.\nTap below to grant the permission.'}
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Capture handler ───────────────────────────────────────────────────────
  async function takePicture() {
    if (!cameraRef.current) return;
    try {
      const result = await cameraRef.current.takePictureAsync({ quality: 0.7 });
      if (result?.uri) {
        console.log('📸 Photo captured:', result.uri);
        // Navigate to the preview screen using search params
        router.push({
          pathname: '/preview',
          params: { photoUri: result.uri },
        });
      }
    } catch (error) {
      console.error('Error capturing photo:', error);
    }
  }

  // ── State 3: Permission granted — live preview ────────────────────────────
  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back" />

      {/* Capture button — positioned dynamically based on safe area insets */}
      <TouchableOpacity 
        style={[styles.captureButton, { bottom: insets.bottom + 24 }]} 
        onPress={takePicture}
      >
        <Text style={styles.captureButtonText}>Capture</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  // ── Shared ──────────────────────────────────────────────────────────────
  container: {
    flex: 1,
  },

  // ── Camera view ──────────────────────────────────────────────────────────
  camera: {
    flex: 1,
  },

  // ── Capture button (matches guide colours exactly) ───────────────────────
  captureButton: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: '#2E5BBA',
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 30,
  },
  captureButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  // ── Permission denied screen ─────────────────────────────────────────────
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#0f172a',
  },
  permissionText: {
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 16,
    color: '#e2e8f0',
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: '#2E5BBA',
    padding: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  // ── Temporary capture confirmation banner ────────────────────────────────
  photoConfirm: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  photoConfirmText: {
    color: '#fff',
    fontSize: 13,
  },
});
