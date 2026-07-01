/**
 * Gemini API Integration Library
 * Safe environment access: process.env.EXPO_PUBLIC_GEMINI_KEY
 */

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_KEY;

// Warn developer if the key is not defined
if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
  console.warn(
    'WARNING: EXPO_PUBLIC_GEMINI_KEY is not defined or is set to placeholder in .env. ' +
    'Please add your Gemini API Key from Google AI Studio.'
  );
}

// API Endpoint configuration for Gemini 2.0 Flash
const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

/**
 * Converts a local file URI to a base64-encoded string.
 * This is required to send image bytes in the JSON payload of the Gemini request.
 * 
 * @param fileUri - Local device URI of the captured photo
 * @returns Base64 encoded string of the image
 */
export async function imageToBase64(fileUri: string): Promise<string> {
  // We will install and use expo-file-system for reading the file in Phase 4.
  // This is a placeholder showing how the workflow structure is set up.
  console.log('Converting file to Base64:', fileUri);
  return '';
}

/**
 * Sends a base64 image and a prompt to the Gemini API.
 * 
 * @param base64Image - Base64 encoded image data
 * @param prompt - Prompt describing the analysis requested
 * @returns Parsed JSON response from Gemini
 */
export async function analyzeImage(base64Image: string, prompt: string): Promise<any> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is missing. Check your .env file configuration.');
  }

  const response = await fetch(GEMINI_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: 'image/jpeg',
                data: base64Image,
              },
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Gemini API returned status ${response.status}: ${
        errorData.error?.message || response.statusText
      }`
    );
  }

  return response.json();
}
