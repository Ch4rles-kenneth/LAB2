# VisionAI

**Demonstration 2**

*A Progressive Follow-Along Guide to Camera + Gemini Mobile Analysis*

## What you'll build

A mobile app that opens your device camera, captures a real photo, sends it to Google's Gemini Vision model, and displays a structured AI analysis of what's in the frame — objects, context, activity, and recommendations. Along the way, you'll feel firsthand why mobile development asks more of you than web development: permissions, native hardware, and asynchronous AI calls all in one small app.

## How to use this guide

This is a follow-along, not a read-along. Type every command and every snippet yourself. Each phase builds directly on the last, ends with a checkpoint, and lists the concepts you've just practiced. Work top to bottom — Phase 4 in particular assumes the camera and preview screens from Phases 2 and 3 already work.

Before most major code blocks you'll also find a ⚡ Vibe Coding Prompt — a ready-to-paste instruction for an AI coding assistant. Try the hand-typed version first; the muscle memory is the point.

| Detail | Value |
| --- | --- |
| Total time | 4.5 – 5.5 hours |
| Builds on | Demonstration 1 (React Native + Expo fundamentals) |
| New territory | Native device APIs, async AI requests, prompt engineering,<br>platform-aware UI |

---

| Detail | Value |
| --- | --- |
| Tools needed | Computer, smartphone, free Google AI Studio account |

---

## Guide Overview

Demonstration 1 showed you how a mobile app talks to a cloud database. This project shows you something different: how a mobile app talks to the device it's running on, and then hands what it finds to an AI model. That combination — native hardware plus a cloud AI — is where mobile development stops resembling web development.

| Phase | Title | Time | Deliverable |
| --- | --- | --- | --- |
| 1 | Setup | 30 min | Camera package installed + Gemini key<br>stored |
| 2 | Camera Fundamentals | 60 min | Working camera screen with capture<br>button |
| 3 | Image Preview Screen | 30 min | Captured photo displayed on its own<br>screen |
| 4 | Gemini Vision Integration | 90 min | Photo sent to Gemini, JSON response<br>received |
| 4.5 | Object Detection with<br>Roboflow (Optional) | 45 min | Bounding-box detections shown<br>alongside Gemini's analysis |
| 5 | AI Result Screen | 45 min | Parsed results shown in a readable<br>layout |
| 6 | Prompt Engineering | 30 min | Same photo, three different AI personas |
| 7 | Platform & Screen Awareness | 30 min | OS-aware text, safe areas, responsive<br>layout |
| 8 | Saving History with Supabase<br>(Optional) | 60 min | Each analysis saved as a row; a history<br>screen lists past results |

## Why This Project Feels Different

In Demonstration 1, almost everything happened inside JavaScript and a remote database. Here, you'll cross a boundary that web apps rarely have to cross: asking the operating system for permission to use a physical camera, holding a live native video feed on screen, and then sending the resulting binary image data over the network to an AI model that has to actually understand what it's looking at.

---

> [!TIP]
> **A Note on Vibe Coding**

"Vibe coding" — describing what you want in plain English and letting an AI assistant write the code — is a normal part of professional workflows now. The prompts in this guide get you to a working result fast; the explanations and hand-typed code around them are what let you debug it, extend it, and recover when the AI gets something wrong — which, with native device APIs, it sometimes will.

## Concept Map

- Native device permissions (camera access)
- Native APIs and what makes them different from web APIs
- useRef for talking to native components directly
- Screen navigation and passing data between screens
- fetch() and async/await for real-world API calls
- Sending images as part of an API request
- Parsing structured JSON from an AI response
- Conditional rendering, loading states, and error handling
- Prompt engineering — shaping AI output by changing instructions, not code
- Platform.OS, safe areas, and useWindowDimensions for OS- and size-aware UI
- (Optional) Dedicated object detection with Roboflow, as a complement to Gemini's general-purpose vision analysis
- (Optional) Persisting analysis history to a real backend with Supabase

---

## Phase 1: Setup

*⏱ Estimated time: 30 minutes*

### 1.1 Starting Point

This guide assumes you have an existing Expo project, such as the TaskFlow app from Demonstration 1, or a fresh npx create-expo-app project. Either way, make sure you can run npx expo start and see your app in Expo Go before continuing.

### 1.2 Install the Camera Package

Expo provides a first-party camera package that wraps the native iOS and Android camera APIs behind one consistent JavaScript interface. Install it with Expo's install command rather than plain npm — Expo install resolves the exact version compatible with your SDK.

```bash
npx expo install expo-camera
```

> [!WARNING]
> **Common Gotchas**

Using npm install expo-camera instead of npx expo install can silently install a version that doesn't match your Expo SDK, causing confusing native crashes. Always prefer npx expo install for any package that touches native device features. After installing a native module like this, fully restart the dev server (stop and re-run npx expo start) rather than relying on Fast Refresh.

### 1.3 Create a Gemini API Key

1. Go to Google AI Studio (aistudio.google.com).

2. Sign in with a Google account.

3. Click "Get API key," then "Create API key."

4. Copy the generated key — you'll only see it in full once.

> [!NOTE]
> **What is Gemini?**

Gemini is Google's family of multimodal AI models — meaning a single model can accept both text and images as input. That's exactly what this project needs: a photo plus a text instruction, sent together, with a text answer coming back.

---

### 1.4 Store the Key Safely

Never hard-code an API key directly into a component file. Instead, create a .env file in your project root:

```bash
EXPO_PUBLIC_GEMINI_KEY=your_key_here
```

The EXPO_PUBLIC_ prefix is required for any environment variable you intend to read from your app's JavaScript — Expo only exposes prefixed variables to the client bundle. Restart npx expo start after creating or editing .env so the new variable is picked up.

> [!WARNING]
> **Common Gotchas**

Add .env to your .gitignore file immediately, before your first commit. Anyone with your key can use your Gemini quota. EXPO_PUBLIC_ variables are bundled into your app and are technically visible to anyone who inspects the app's network traffic or files. That's an acceptable tradeoff for a learning project, but production apps typically proxy AI calls through a backend server instead of calling the AI provider directly from the client.

### 1.5 Read the Key in Code

Anywhere you need it, access the key through process.env:

```javascript
const GEMINI_KEY = process.env.EXPO_PUBLIC_GEMINI_KEY;
```

> [!SUCCESS]
> **Checkpoint — before moving on, confirm:**

npx expo install expo-camera completed with no errors. .env exists at the project root, contains EXPO_PUBLIC_GEMINI_KEY, and is listed in .gitignore. console.log(process.env.EXPO_PUBLIC_GEMINI_KEY) prints your real key, not undefined, after restarting the dev server.

---

## Phase 2: Camera Fundamentals

*⏱ Estimated time: 60 minutes*

### 2.1 Why Cameras Need Permission

A web page can't normally access your camera without an explicit, OS-level prompt — and neither can a mobile app. This is your first real encounter with a native API: a capability that lives in the operating system, not in JavaScript, and that JavaScript can only request access to, never assume.

### 2.2 Target Screen

┌──────────────────┐ │ │ │ live camera │ │ feed │ │ │ │ │ │ ( Capture ) │ └──────────────────┘

A full-screen live camera preview with a single capture button overlaid at the bottom.

### 2.3 Request Camera Permission

---

> [!TIP]
> **Vibe Coding Prompt**

Paste this into your AI coding assistant (Claude Code, Cursor, Copilot Chat, etc.) to generate this step instantly:

> Create CameraScreen.jsx for an Expo React Native app using

> expo-camera. Use useCameraPermissions() to check/request camera

> access. Render three states: (1) while permission is null, return

> an empty View; (2) while permission.granted is false, show centered

> text "We need your permission to use the camera" and a button that

> calls requestPermission; (3) once granted, render a full-screen

> CameraView (facing="back") with a circular "Capture" button

> overlaid near the bottom using absolute positioning. Use useRef to

> hold a reference to the CameraView so a takePicture() function can

> call cameraRef.current.takePictureAsync({ quality: 0.7 }).

Native permission flows are exactly where AI assistants can guess wrong about current package APIs — expo-camera's API has changed across SDK versions. Cross-check the generated code against the explanation below, and if it references an older API like Camera.Constants, ask your assistant to update it to the CameraView component shown here.

Or build it by hand. expo-camera exposes a Hook that both checks and requests permission in one call: useCameraPermissions. Create a new screen, CameraScreen.jsx, and start with the permission flow.

```javascript
import { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) {
    // Permission status is still loading
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          We need your permission to use the camera
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }
```

---

```javascript
  // Permission granted — camera UI goes here
  return <View style={styles.container} />;
}
```

#### Reading This Code

- useCameraPermissions() returns the current permission state and a function to request it — nothing renders the camera until permission.granted is true.
- The three-way branch (loading / denied / granted) is a pattern you'll see constantly in native development: never assume a device capability is available — check first, every time.

> [!NOTE]
> **Native APIs vs. Web APIs**

On the web, navigator.mediaDevices.getUserMedia() asks the browser for camera access, and the browser's own UI handles the permission prompt. On mobile, the permission prompt is owned by the operating system itself (iOS or Android), and a denied permission is far more final — the user must leave your app and go into system Settings to change their mind. This is a core difference: native APIs hand control to the OS, not the browser.

### 2.4 Render the Live Camera and Capture

Once permission is granted, render Expo's CameraView component, and use useRef to get a stable, persistent handle to it — this is what lets you call takePictureAsync() later without that reference being recreated on every render.

```javascript
const cameraRef = useRef(null);
const [photo, setPhoto] = useState(null);

async function takePicture() {
  if (!cameraRef.current) return;
  const result = await cameraRef.current.takePictureAsync({ quality: 0.7 });
  setPhoto(result.uri);
}

return (
  <View style={styles.container}>
    <CameraView ref={cameraRef} style={styles.camera} facing="back" />
    <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
      <Text style={styles.captureButtonText}>Capture</Text>
    </TouchableOpacity>
  </View>
);
```

Add matching styles:

```javascript
const styles = StyleSheet.create({
  container: { flex: 1 },
```

---

```javascript
  camera: { flex: 1 },
  captureButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: '#2E5BBA',
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 30,
  },
  captureButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  permissionContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  permissionText: { textAlign: 'center', marginBottom: 16, fontSize: 16 },
  permissionButton: { backgroundColor: '#2E5BBA', padding: 12, borderRadius: 8 },
  permissionButtonText: { color: '#fff', fontWeight: 'bold' },
});
```

> [!NOTE]
> **Why useRef Instead of useState Here**

useState triggers a re-render every time its value changes, which is exactly what you want for things like task lists or typed text. The camera reference itself, though, never needs to trigger a re-render — you just need a stable way to call a method (takePictureAsync) on the underlying native component. That's precisely what useRef is for: persistent access to something without causing re-renders when it changes.

> [!SUCCESS]
> **Checkpoint — before moving on, confirm:**

Opening the camera screen prompts for camera permission the first time. After granting permission, a live camera feed fills the screen. Tapping Capture doesn't crash — even before Phase 3, you can confirm it worked by temporarily logging result.uri to the console. You can explain, in your own words, why a denied camera permission is handled differently on mobile than on the web.

---

## Phase 3: Image Preview Screen

*⏱ Estimated time: 30 minutes*

### 3.1 Why a Separate Screen

Right now, takePicture() saves a photo URI into state, but nothing shows it. Rather than cramming a preview into the same screen as the live camera, this phase introduces navigation — moving to a dedicated screen and handing it the photo to display, which mirrors how almost every real camera app is structured (capture screen, then review screen).

### 3.2 Install Navigation

If your project doesn't already have a navigation library, install Expo Router's dependencies, or React Navigation directly. This guide uses React Navigation's native stack for clarity:

```bash
npx expo install @react-navigation/native @react-navigation/native-stack
npx expo install react-native-screens react-native-safe-area-context
```

### 3.3 Pass the Photo as a Route Parameter

When navigating from the camera screen to the preview screen, attach the photo's URI as a parameter on the navigation call:

```javascript
async function takePicture() {
  if (!cameraRef.current) return;
  const result = await cameraRef.current.takePictureAsync({ quality: 0.7 });
  navigation.navigate('Preview', { photoUri: result.uri });
}
```

Route parameters are how two screens that don't otherwise share state can exchange data — the navigator carries the value across, and the receiving screen reads it back out.

### 3.4 Build the Preview Screen

---

> [!TIP]
> **Vibe Coding Prompt**

Paste this into your AI coding assistant (Claude Code, Cursor, Copilot Chat, etc.) to generate this step instantly:

> Create PreviewScreen.jsx for React Navigation native-stack. Read

> photoUri from route.params. Render the photo full-screen using

> Image with resizeMode "contain" on a black background, with two

> buttons below it in a row: "Retake" (calls navigation.goBack())

> and "Analyze" (calls navigation.navigate('Result', { photoUri })).

> Style Retake in a neutral grey and Analyze in a distinct accent

> color so they're visually different actions.

Notice this prompt has to specify exactly which navigation calls to use — an assistant with no context about your navigator setup will often guess at prop names. Supplying the route/param shape explicitly, like here, is itself a prompt engineering skill you'll practice more deliberately in Phase 6.

Or build it by hand. Create PreviewScreen.jsx. It reads the photo URI from its route prop and renders it using React Native's Image component.

```javascript
import { View, Image, TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function PreviewScreen({ route, navigation }) {
  const { photoUri } = route.params;

  return (
    <View style={styles.container}>
      <Image source={{ uri: photoUri }} style={styles.preview} />

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.retakeButton} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Retake</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.analyzeButton}
          onPress={() => navigation.navigate('Result', { photoUri })}
        >
          <Text style={styles.buttonText}>Analyze</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  preview: { flex: 1, resizeMode: 'contain' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-around', padding: 20 },
  retakeButton: { backgroundColor: '#5A6472', padding: 14, borderRadius: 8 },
  analyzeButton: { backgroundColor: '#5B3FA3', padding: 14, borderRadius: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
```

---

```javascript
});
```

#### Reading This Code

- source={{ uri: photoUri }} is how Image renders a photo from a file path or remote URL, rather than a bundled local asset.
- Retake calls navigation.goBack(), returning to the live camera without losing the stack.
- Analyze forwards the same photoUri onward to a Result screen — the same parameter, passed one screen further, which Phase 5 will build.

> [!SUCCESS]
> **Checkpoint — before moving on, confirm:**

Capturing a photo on the camera screen navigates to the preview screen automatically. The exact photo you took is visible, full-screen, on the preview screen. Tapping Retake returns you to the live camera feed. Tapping Analyze attempts to navigate to a 'Result' screen (it's fine if this errors for now — you'll build it in Phase 5).

---

## Phase 4: Gemini Vision Integration

*⏱ Estimated time: 90 minutes*

### 4.1 What's About to Happen

This is the conceptual core of the project. A photo of a book, a laptop, a classroom, or a whiteboard will be converted into a format an HTTP request can carry, sent to Gemini alongside a text prompt, and a structured answer will come back — all without you writing a single line of computer-vision code yourself.

📷 → [ Book / Laptop / Classroom / Whiteboard ]

↓ fetch()

Gemini Vision Model

↓ JSON

Objects · Context · Activities · Tips

### 4.2 Convert the Photo to Base64

Gemini's API accepts images as base64-encoded text embedded directly in the JSON request body. Expo's FileSystem module reads the photo file and encodes it in one call.

```bash
npx expo install expo-file-system
```

```javascript
import * as FileSystem from 'expo-file-system';

export async function imageToBase64(uri) {
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return base64;
}
```

---

> [!NOTE]
> **Where to Put This**

Place imageToBase64 in the same lib/gemini.js file you'll create in section 4.3 — keeping every piece of Gemini-related code in one file makes it the single place you import from anywhere in the app, including the Preview screen in section 4.5.

### 4.3 Build the Gemini Request

> [!TIP]
> **Vibe Coding Prompt**

Paste this into your AI coding assistant (Claude Code, Cursor, Copilot Chat, etc.) to generate this step instantly:

> In my existing lib/gemini.js (which already has an imageToBase64

> helper), add an export async function analyzeImage(base64Image,

> prompt) that POSTs to the Gemini API endpoint

> generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:

> generateContent, with the API key read from

> process.env.EXPO_PUBLIC_GEMINI_KEY as a query parameter. The request

> body should be JSON with a `contents` array containing one object

> whose `parts` array has a text part (the prompt) and an inline_data

> part with mime_type 'image/jpeg' and the base64 string. Use fetch

> and return the parsed JSON response.

This is the single most important block in the project to actually read, even if you let an assistant write it — the nested contents → parts → inline_data shape is exactly what the Reading This Code notes below explain, and you'll be debugging against this shape for the rest of the guide.

Or build it by hand. Add this to the same lib/gemini.js file from section 4.2, alongside imageToBase64 — keeping the API call in the same file as the conversion helper continues the separation-of-concerns principle from Demonstration 1's componentization phase.

```javascript
const GEMINI_KEY = process.env.EXPO_PUBLIC_GEMINI_KEY;
const GEMINI_URL =

`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?k
ey=${GEMINI_KEY}`;

export async function analyzeImage(base64Image, prompt) {
  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inline_data: {
```

---

```javascript
                mime_type: 'image/jpeg',
                data: base64Image,
              },
            },
          ],
        },
      ],
    }),
  });

  const json = await response.json();
  return json;
}
```

#### Reading This Code

- fetch() is the same function you'd use on the web — this is one of the few moments in the project where mobile and web genuinely behave alike.
- await pauses execution until each network step finishes: first the response headers, then response.json() to parse the body.
- The request body's contents array can mix text and inline_data parts — this is exactly what "multimodal" means in practice.
- inline_data.data must be raw base64 text with no data: prefix — a common first mistake is passing a full data URI instead of just the encoded bytes.

> [!WARNING]
> **Common Gotchas**

If you copy a data URI string from somewhere (e.g. data:image/jpeg;base64,/9j/4AAQ...), you must strip everything before the comma before sending it — Gemini expects only the bytes after it. Large, uncompressed photos can produce very large request bodies. Keeping quality: 0.7 in takePictureAsync from Phase 2 keeps payloads reasonably small and requests fast. If response.json() throws, it usually means the HTTP response wasn't JSON at all — often an HTML error page from a malformed URL or invalid key. Log response.status before parsing if you get stuck.

### 4.4 Write the Analysis Prompt

The prompt is what tells Gemini exactly what kind of answer to produce. Ask for a specific structure so the response is easy to parse and display.

```javascript
const ANALYSIS_PROMPT = `
Analyze this image. Identify:
1. Objects - list the distinct physical objects you see
2. Context - briefly describe the setting or scene
3. Activities - what activity appears to be happening, if any
4. Recommendations - one practical suggestion based on the scene
```

---

```javascript
Respond ONLY with valid JSON in this exact shape, no extra text:
{
  "objects": ["...", "..."],
  "context": "...",
  "activities": "...",
  "recommendations": "..."
}
`;
```

> [!NOTE]
> **Why Ask for JSON Explicitly**

Without an explicit format instruction, Gemini will happily answer in flowing paragraphs — which is fine to read, but painful to render into a structured screen with separate sections. Asking for a specific JSON shape turns the model's free-form reasoning into something your app can reliably parse and bind to UI components.

### 4.5 Where the Conversion Belongs

You now have everything analyzeImage needs: a base64 string and a prompt. The one decision left is where in the navigation flow the conversion and the API call actually happen. Converting to base64 inside the Preview screen, before navigating, keeps the Result screen simple — it only ever needs to receive a string and use it, never re-derive it from a raw file path.

```javascript
// In PreviewScreen.jsx, update the Analyze button from Phase 3:
import { imageToBase64 } from '../lib/gemini';

async function handleAnalyze() {
  const base64Image = await imageToBase64(photoUri);
  navigation.navigate('Result', { base64Image });
}

// ...
<TouchableOpacity style={styles.analyzeButton} onPress={handleAnalyze}>
  <Text style={styles.buttonText}>Analyze</Text>
</TouchableOpacity>
```

This replaces the simple navigation.navigate('Result', { photoUri }) call from Phase 3 — the Result screen you'll build next expects base64Image specifically, not the raw photoUri, since the conversion now happens here, one step earlier.

> [!NOTE]
> **Why Convert Before Navigating, Not After**

The alternative would be passing photoUri straight through and converting it inside the Result screen instead. Either works, but converting in the Preview screen means the conversion happens once, right after the photo is taken, rather than potentially re-running if the Result screen re-renders. It also means ResultScreen.jsx — which Phase 5 builds next — stays focused purely on calling Gemini and rendering the outcome, with no file-system code mixed in.

---

> [!SUCCESS]
> **Checkpoint — before moving on, confirm:**

Tapping Analyze on the Preview screen converts the photo to base64 without throwing an error (confirm with a temporary console.log(base64Image.length) before navigating). Navigating to the Result screen now passes base64Image, not photoUri, in the route params. You can explain, in your own words, why the conversion step moved into the Preview screen instead of staying in the Result screen.

---

## Phase 4.5: Object Detection with Roboflow  (Optional)

*⏱ Estimated time: 45 minutes*

### 4.5.1 Gemini vs. a Dedicated Detection Model

Gemini, from Phase 4, is a general-purpose vision-language model: show it a photo and ask almost anything, and it will answer in prose or loose JSON. That flexibility comes at a cost — Gemini does not return precise bounding boxes, is not trained on your specific objects, and can be inconsistent about exactly what counts as a detection from one call to the next. Roboflow takes the opposite approach: you train (or pick a pre-trained) model for one narrow task — detecting a fixed set of object classes — and in exchange get back exact bounding boxes and confidence scores, every time, in a small and predictable JSON shape. This phase adds a second, complementary analysis path alongside Gemini's: same captured photo, same app, a different kind of model answering a different kind of question.

> [!NOTE]
> **When to Reach for Each**

Gemini answers open-ended questions about a photo — "what is happening here," "is this safe," "describe the mood." Roboflow answers one narrow question very precisely — "where exactly are the people, and how confident is the model in each one." Production apps often use both: a fast, cheap detection model to find and count specific objects, and a vision-language model to reason about what those objects mean in context.

### 4.5.2 Create a Roboflow Account and Model

Roboflow's free tier includes hosted inference for public, pre-trained models — no training required to follow along here.

1.Go to Roboflow (roboflow.com) and create a free account. 2.Open Roboflow Universe (universe.roboflow.com) and search for a pre-trained model that matches something likely to appear in your test photo — "COCO" for everyday objects is a safe default that recognizes people, furniture, electronics, and dozens of other common classes. 3.On the model's page, click "Model" in the sidebar, then note the model ID and version number shown in the example API request — they appear as model_id/version, e.g. coco/8. 4.Click your account icon, then "Settings," then "API Keys" to copy your private API key.

---

> [!WARNING]
> **Common Gotchas**

Roboflow Universe model IDs use the project's URL slug, not its display name — copy the exact model_id/version string from the "Model" tab's sample request rather than typing it from memory. Hosted inference on free-tier public models is rate-limited; if you get repeated 429 responses while testing, wait a few seconds between requests rather than retrying immediately.

### 4.5.3 Store the Roboflow Key

Add a second variable alongside your existing Gemini key in .env, following the same pattern from Phase 1:

```bash
EXPO_PUBLIC_ROBOFLOW_KEY=your_roboflow_key_here
```

Restart npx expo start after editing .env so the new variable is picked up, the same requirement Phase 1 called out for the Gemini key.

### 4.5.4 Building a Roboflow Helper

Create a new file, lib/roboflow.js, that mirrors the shape of lib/gemini.js from Phase 4: one module, one async function, one place where the API key and endpoint are assembled.

> [!TIP]
> **Vibe Coding Prompt**

Paste this into your AI coding assistant (Claude Code, Cursor, Copilot Chat, etc.) to generate this step instantly:

> Create a detectObjects(base64Image) async function in a new

> lib/roboflow.js file for a React Native Expo app. It should POST to

> https://detect.roboflow.com/{modelId}/{version}?api_key={key} using

> fetch, with the base64 image string as the raw request body and a

> Content-Type header of application/x-www-form-urlencoded. Read the

> model ID, version, and API key from process.env.EXPO_PUBLIC_ROBOFLOW_KEY

> and two constants for the model ID and version. Parse the JSON

> response and return its "predictions" array, or an empty array if the

> request fails for any reason. Wrap the whole thing in try/catch so a

> failed detection never throws past this function.

Notice this prompt asks for an empty array on failure rather than letting an exception propagate — that's a deliberate echo of Phase 5's ResultScreen pattern: a detection feature failing should degrade gracefully, not crash a screen that is also showing a perfectly good Gemini analysis.

Or build it by hand:

---

```javascript
const ROBOFLOW_MODEL_ID = 'coco';
const ROBOFLOW_MODEL_VERSION = '8';
const ROBOFLOW_API_KEY = process.env.EXPO_PUBLIC_ROBOFLOW_KEY;

export async function detectObjects(base64Image) {
  const url =
    `https://detect.roboflow.com/${ROBOFLOW_MODEL_ID}/` +
    `${ROBOFLOW_MODEL_VERSION}?api_key=${ROBOFLOW_API_KEY}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: base64Image,
    });

    if (!response.ok) return [];

    const data = await response.json();
    return data.predictions ?? [];
  } catch (err) {
    return [];
  }
}
```

#### Reading This Code

- ROBOFLOW_MODEL_ID and ROBOFLOW_MODEL_VERSION are plain constants, not environment variables — unlike the API key, they aren't a secret, so there's no need to route them through .env.
- Roboflow's hosted endpoint accepts the raw base64 string as the request body, not wrapped in a JSON object — this is different from Gemini's request shape in Phase 4, where the image was nested inside a larger JSON payload.
- Returning an empty array, rather than rethrowing, on any failure means the calling screen never needs its own try/catch for this call — an empty array is a normal, renderable state, not an error state.

### 4.5.5 Showing Detections on the Result Screen

Add a second analysis call alongside the Gemini request from Phase 5, and a small section to ResultScreen.jsx's success branch that lists what Roboflow found.

---

```javascript
// In ResultScreen.jsx, alongside the existing Gemini state:
import { detectObjects } from '../lib/roboflow';
const [detections, setDetections] = useState([]);

// Inside runAnalysis(), after the Gemini call succeeds:
const found = await detectObjects(base64Image);
setDetections(found);
```

```javascript
{/* Add this section to the success branch, after Context: */}
<Text style={styles.sectionTitle}>Detected Objects (Roboflow)</Text>
{detections.length === 0 ? (
  <Text style={styles.bodyText}>
    No objects detected above the confidence threshold.
  </Text>
) : (
  detections.map((d, i) => (
    <Text key={i} style={styles.listItem}>
      • {d.class} — {(d.confidence * 100).toFixed(1)}% confidence
    </Text>
  ))
)}
```

#### Reading This Code

- Running the Roboflow call after the Gemini call succeeds, inside the same try block, keeps both analyses tied to one captured photo and one loading spinner — the user sees a single "Analyzing image…" state, not two separate ones.
- Each prediction's class and confidence fields come directly from Roboflow's JSON response shape — unlike Gemini's response in Phase 5, there is no custom parsing step to write, because the predictions array is already exactly the shape the UI needs.
- d.confidence arrives as a value between 0 and 1; multiplying by 100 and formatting with toFixed(1) turns 0.873 into the more readable 87.3%.

> [!NOTE]
> **Why No Bounding Boxes Yet**

Roboflow's predictions also include x, y, width, and height fields locating each detection precisely within the image — enough to draw boxes directly over the photo with react-native-svg. This guide stops at a text list to keep the phase short; drawing the boxes is a natural next step if you want to push further.

---

> [!SUCCESS]
> **Checkpoint — before moving on, confirm:**

Capturing a photo that contains a few recognizable objects produces a non-empty "Detected Objects" list with believable class names and confidence percentages. Pointing the camera at a mostly empty scene (a blank wall, the ceiling) correctly shows "No objects detected" instead of crashing or showing stale data from a previous photo. Turning on Airplane Mode and capturing a photo still shows the Gemini analysis — the empty-array fallback in lib/roboflow.js means one failed network call doesn't take down the whole screen. You can explain, in one or two sentences, why this app now sends the same photo to two different AI services instead of one.

### 4.5.6 Push Further (Optional)

- Draw the detected bounding boxes directly over the displayed photo using react-native-svg and the x/y/width/height fields each prediction already includes.
- Filter out low-confidence detections (e.g. below 50%) before displaying them, and let the user adjust that threshold with a slider.
- Cross-reference Roboflow's object list against Gemini's free-text analysis from Phase 5 — do they ever disagree about what's in the frame, and if so, which one would you trust more for a safety-critical use case?

## Phase 5: AI Result Screen

*⏱ Estimated time: 45 minutes*

### 5.1 Target Screen

┌──────────────────┐ │ Objects: │ │ • Laptop │ │ • Notebook │ │ │ │ Context: │ │ Student studying │ │ │ │ Recommendations: │ │ Keep taking notes│ └──────────────────┘

Four labeled sections rendered from the parsed Gemini JSON response.

---

### 5.2 Three States, Not One

Every screen that depends on a network call has at least three distinct states to design for: still loading, finished successfully, or failed. Skipping any one of them is the single most common bug in apps that call external APIs.

| State | What the User Sees | What Triggers It |
| --- | --- | --- |
| Loading | A spinner or placeholder text | Request sent, response not yet<br>received |
| Success | Parsed objects, context, activity, tips | JSON parsed without errors |
| Error | A friendly message and a retry option | Network failure or invalid JSON |

### 5.3 Build the Result Screen

> [!TIP]
> **Vibe Coding Prompt**

Paste this into your AI coding assistant (Claude Code, Cursor, Copilot Chat, etc.) to generate this step instantly:

> Create ResultScreen.jsx for a React Native app. It receives

> base64Image via route.params and calls an existing analyzeImage(base64Image,

> prompt) function from '../lib/gemini' inside useEffect on mount.

> Track three states with useState: loading (default true), error

> (default null), and analysis (default null). On success, parse

> result.candidates[0].content.parts[0].text as JSON shaped like

> { objects: string[], context: string, activities: string,

> recommendations: string } and store it in analysis. Wrap the call in

> try/catch/finally so loading always ends. Render: a centered

> ActivityIndicator + "Analyzing image..." while loading; a friendly

> error message if error is set; otherwise four labeled sections

> (Objects as a bullet list, Context, Activities, Recommendations as

> plain text) once analysis is populated.

This prompt is intentionally explicit about all three states and the exact JSON shape — leave any of that out and an assistant is likely to skip the error branch entirely, which is the single easiest way to ship an app that just spins forever on a bad network.

Or build it by hand. ResultScreen.jsx receives base64Image through route params, then runs the Gemini request itself and manages its own loading, error, and analysis state.

```javascript
import { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { analyzeImage } from '../lib/gemini';

const ANALYSIS_PROMPT = `...`; // same prompt from Phase 4
```

---

```javascript
export default function ResultScreen({ route }) {
  const { base64Image } = route.params;
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    runAnalysis();
  }, []);

  async function runAnalysis() {
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeImage(base64Image, ANALYSIS_PROMPT);
      const textPart = result?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!textPart) throw new Error('Empty response from Gemini');
      setAnalysis(JSON.parse(textPart));
    } catch (err) {
      setError('Could not analyze this image. Please try again.');
    } finally {
      setLoading(false);
    }
  }
```

Continue the same component with the conditional render block:

```javascript
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#5B3FA3" />
        <Text style={styles.loadingText}>Analyzing image...</Text>
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
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Objects</Text>
      {analysis.objects.map((obj, i) => (
        <Text key={i} style={styles.listItem}>• {obj}</Text>
      ))}

      <Text style={styles.sectionTitle}>Context</Text>
      <Text style={styles.bodyText}>{analysis.context}</Text>
```

---

```javascript
      <Text style={styles.sectionTitle}>Activities</Text>
      <Text style={styles.bodyText}>{analysis.activities}</Text>

      <Text style={styles.sectionTitle}>Recommendations</Text>
      <Text style={styles.bodyText}>{analysis.recommendations}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#5A6472' },
  errorText: { color: '#B3261E', textAlign: 'center', fontSize: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 16, color: '#1F2A44' },
  listItem: { fontSize: 15, marginTop: 4 },
  bodyText: { fontSize: 15, marginTop: 4, color: '#2B2F38' },
});
```

#### Reading This Code

- Three pieces of state — loading, error, analysis — together describe exactly one of the three states from the table above; only one branch ever renders.
- try / catch / finally guarantees setLoading(false) runs whether the request succeeds or fails — without finally, a failed request could leave the spinner showing forever.
- analysis.objects.map(...) only runs once analysis is guaranteed non-null, because the loading and error branches both return earlier.

> [!WARNING]
> **Common Gotchas**

If Gemini's response text includes Markdown formatting like JSON code fences around the JSON, JSON.parse() will throw. Strip leading/trailing backtick fences before parsing if you encounter this. Rendering analysis.objects.map(...) before confirming analysis is not null will crash the app — this is exactly why the loading and error branches must return before reaching this line.

> [!SUCCESS]
> **Checkpoint — before moving on, confirm:**

Opening the Result screen briefly shows a spinner and "Analyzing image..." before any content appears. A successful analysis displays all four sections with real content from your photo, not placeholder text. Turning on Airplane Mode and retrying shows the friendly error message instead of crashing the app. You can point to the exact line where loading, error, and success are each decided.

---

## Phase 6: Prompt Engineering

*⏱ Estimated time: 30 minutes*

### 6.1 The Same Photo, Three Different Minds

Everything built so far treats the prompt as fixed. This phase proves a different point entirely: with the exact same photo and the exact same code, changing only the wording of the prompt can completely change what the AI pays attention to and how it responds. No new components, no new API calls — just new instructions.

### 6.2 Turn the Prompt Into a Variable

> [!TIP]
> **Vibe Coding Prompt**

Paste this into your AI coding assistant (Claude Code, Cursor, Copilot Chat, etc.) to generate this step instantly:

> Refactor my single ANALYSIS_PROMPT string into a PROMPTS object with

> three named keys: academic ("Act as a university professor...",

> asking for objects, educational context, and one piece of

> constructive feedback), safety ("Act as a workplace safety

> inspector...", asking for visible hazards or a clear statement that

> none exist), and inventory ("Act as an asset management clerk...",

> asking for a clean list of visible assets with no commentary). On

> the Preview screen, add three buttons — "Academic Analysis",

> "Safety Analysis", "Inventory Analysis" — that each navigate to

> 'Result' with { base64Image, promptKey }. On the Result screen,

> look up PROMPTS[promptKey] and pass that text into analyzeImage

> instead of a single hardcoded prompt.

Once this is wired up, the real exercise isn't the code — it's reading the three persona strings out loud and predicting how each will change the model's output before you run it. The code is the easy part; treat the prompt wording itself as the thing worth iterating on.

Or build it by hand. Refactor ANALYSIS_PROMPT into a small set of named prompts, and let the user choose which one to send.

```javascript
const PROMPTS = {
  academic: `Act as a university professor. Looking at this image, provide an academic-style
analysis: identify the objects present, the educational context, and one piece of constructive
feedback.`,

  safety: `Act as a workplace safety inspector. Looking at this image, identify any visible hazards,
risks, or safety concerns. If none are visible, state that clearly.`,
```

---

```javascript
  inventory: `Act as an asset management clerk. Looking at this image, list every visible physical
asset as a clean inventory list, with no extra commentary.`,
};
```

### 6.3 Add a Persona Picker

Add a simple row of buttons to the Preview screen so the user picks a persona before analysis runs, and pass the choice through to the Result screen.

```javascript
<View style={styles.personaRow}>
  <TouchableOpacity onPress={() => goAnalyze('academic')}>
    <Text style={styles.personaLabel}>Academic Analysis</Text>
  </TouchableOpacity>
  <TouchableOpacity onPress={() => goAnalyze('safety')}>
    <Text style={styles.personaLabel}>Safety Analysis</Text>
  </TouchableOpacity>
  <TouchableOpacity onPress={() => goAnalyze('inventory')}>
    <Text style={styles.personaLabel}>Inventory Analysis</Text>
  </TouchableOpacity>
</View>

function goAnalyze(personaKey) {
  navigation.navigate('Result', { base64Image, promptKey: personaKey });
}
```

In ResultScreen.jsx, select the right prompt text before calling analyzeImage:

```javascript
const { base64Image, promptKey } = route.params;
const prompt = PROMPTS[promptKey];
// ...
const result = await analyzeImage(base64Image, prompt);
```

### 6.4 Run the Experiment

Capture one photo — a classroom, a desk, anything with a few objects in it — and run it through all three personas without retaking the picture. Compare the three results side by side.

| Persona | Instruction Style | What Tends to Change |
| --- | --- | --- |
| Academic | "Act as a professor" | Focuses on learning context, gives feedback-style<br>language |
| Safety | "Identify hazards" | Notices cords, clutter, or sharp edges the others<br>ignore |
| Inventory | "List visible assets" | Drops all narrative; returns a flat, neutral list |

---

| Persona | Instruction Style | What Tends to Change |
| --- | --- | --- |
| ℹ What This<br>Demonstrates<br>The underlying<br>model, the image,<br>the network code,<br>and the<br>JSON-parsing logic<br>are all completely<br>unchanged across<br>the three runs.<br>Only the words in<br>the prompt<br>changed — yet the<br>model's framing,<br>vocabulary, and<br>priorities shift<br>noticeably. This is<br>the essence of<br>prompt<br>engineering:<br>treating<br>instructions as a<br>design surface in<br>their own right, not<br>just a formality<br>before the "real"<br>work of calling an<br>API. |  |  |

### 6.5 Push Further (Optional)

- Add a fourth persona of your own design and predict its output before running it.
- Ask one persona to respond in a different structure (e.g. a numbered severity scale for Safety Analysis) and observe whether the model honors it.
- Deliberately write a vague, unstructured prompt and compare its reliability to the structured JSON-output prompt from Phase 4.

---

> [!SUCCESS]
> **Checkpoint — before moving on, confirm:**

The same captured photo produces three visibly different analyses depending on which persona button was tapped. Switching personas required no changes to gemini.js, the navigation logic, or the result-rendering JSX — only to the prompt text itself. You can articulate, in one or two sentences, why prompt wording is treated as a first-class design decision in AI-integrated apps.

---

## Phase 7: Platform & Screen Awareness

*⏱ Estimated time: 30 minutes*

### 7.1 Why This Phase Exists

Every screen you've built so far has been tested on whatever single phone happened to be in your hand. "React Native" promises one codebase for iOS and Android, and mostly delivers — but mostly isn't entirely. The camera permission text renders in a slightly different system style on each OS, status bars and home indicators eat into different amounts of screen on different devices, and a layout tuned for one phone's screen can clip or float strangely on a tablet or a phone with an unusually tall or short screen. This phase doesn't add a new feature — it makes the features you already built behave correctly everywhere, not just on your test phone.

### 7.2 Detecting the OS: Platform

React Native ships a small Platform module specifically for this. Platform.OS is a string — 'ios' or 'android' — that you can branch on directly, and Platform.select() lets you pick a whole value (often a style object) per OS in one expression.

```javascript
import { Platform } from 'react-native';

console.log(Platform.OS); // 'ios' or 'android'

const cardShadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  android: {
    elevation: 4,
  },
});
```

> [!NOTE]
> **Why Shadows Need This**

This isn't a contrived example — it's the single most common Platform.select() use in React Native. iOS renders shadows through the shadow* properties; Android ignores those entirely and uses elevation instead. Without branching, you either get a shadow on one OS and nothing on the other, or you write both sets of properties on every styled card in the app.

Applying It to the Permission Screen

---

Back in Phase 2, the camera permission screen showed the same wording and layout on every device. iOS and Android phrase system permission dialogs differently, and it's common (and good practice) for an app's own explanation text to nod to that, since the system dialog the user is about to see won't look identical either way.

```javascript
import { Platform, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

if (!permission.granted) {
  return (
    <View style={styles.permissionContainer}>
      <Text style={styles.permissionText}>
        {Platform.OS === 'ios'
          ? 'TaskFlow needs camera access. Tap below, then choose "Allow" in the dialog.'
          : 'TaskFlow needs camera access. Tap below to grant the permission.'}
      </Text>
      <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
        <Text style={styles.permissionButtonText}>Grant Permission</Text>
      </TouchableOpacity>
    </View>
  );
}
```

This is a small change, but it's the same Platform.OS pattern you'll reach for any time OS-specific wording, icons, or behavior is the right call — which, on a camera screen, is more often than it first appears.

### 7.3 Respecting Safe Areas

Phase 2's camera screen positioned its Capture button with a fixed bottom: 40. That number was tuned against one phone. Devices with a home indicator (most modern iPhones) or a gesture navigation bar (most modern Android phones) reserve space at the bottom of the screen that your fixed-position button can end up sitting inside of, or worse, behind.

```bash
npx expo install react-native-safe-area-context
```

Wrap the relevant screen content in a SafeAreaView, or use the useSafeAreaInsets Hook when you need the exact inset numbers to add to your own positioning math:

```javascript
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CameraScreen() {
  const insets = useSafeAreaInsets();
  // ...permission logic from Phase 2 stays the same...

  return (
    <View style={styles.container}>
```

---

```javascript
      <CameraView ref={cameraRef} style={styles.camera} facing="back" />
      <TouchableOpacity
        style={[styles.captureButton, { bottom: insets.bottom + 24 }]}
        onPress={takePicture}
      >
        <Text style={styles.captureButtonText}>Capture</Text>
      </TouchableOpacity>
    </View>
  );
}
```

> [!WARNING]
> **Common Gotchas**

insets.bottom is 0 on most Android phones with a traditional 3-button nav bar, and 20–34 points on an iPhone with a home indicator — don't hardcode either number; always read it from the Hook. Style arrays like [styles.captureButton, { bottom: ... }] merge left to right, so the inline object's bottom always wins over whatever bottom is set inside styles.captureButton — remove any fixed bottom value from the StyleSheet entry once you switch to this pattern, or the two will conflict silently.

### 7.4 Responding to Screen Size: useWindowDimensions

Platform.OS answers "which OS," but says nothing about "how big is this screen" — a question that matters the moment your layout needs to look reasonable on both a compact phone and a tablet. useWindowDimensions returns the current screen's width and height, and re-renders your component automatically if that ever changes (most commonly, when the user rotates the device).

```javascript
import { useWindowDimensions, View, Image } from 'react-native';

export default function PreviewScreen({ route }) {
  const { photoUri } = route.params;
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <Image
        source={{ uri: photoUri }}
        style={{
          flex: 1,
          resizeMode: 'contain',
          maxWidth: isTablet ? 600 : '100%',
          alignSelf: 'center',
        }}
      />
    </View>
  );
}
```

---

#### Reading This Code

- useWindowDimensions is a Hook, so calling it inside a component automatically subscribes that component to size changes — no manual event listener to add or clean up, unlike the older Dimensions.get('window') API it replaces.
- isTablet here is just a width threshold, not a special API — "is this a tablet" is a judgment call you make from the numbers, not something React Native tells you directly.
- Capping maxWidth on a tablet keeps a full-screen preview photo from stretching into something absurdly wide; on a phone, width is almost always close enough to 100% that the cap never engages.

> [!NOTE]
> **Platform.OS vs. useWindowDimensions**

These solve two different problems that are easy to conflate. Platform.OS tells you which operating system is running your code, which correlates loosely with screen size (most Android tablets are larger than most iPhones) but isn't the same thing — plenty of Android phones are small, and iPads run iOS. Branch on Platform.OS for OS-specific behavior (shadow styling, permission wording); branch on useWindowDimensions for size-specific layout (column counts, image widths, font scale). Using one to guess at the other will eventually be wrong for someone's device.

> [!SUCCESS]
> **Checkpoint — before moving on, confirm:**

The permission screen's explanation text reads differently on iOS vs. Android (test with Platform.OS temporarily hardcoded to each value if you only have one device available). The Capture button sits clearly above the home indicator or gesture bar, not flush against the bottom edge or hidden behind it. Rotating the device (or resizing the simulator window) changes the preview image's layout without restarting the app. You can explain, in your own words, why Platform.OS and useWindowDimensions answer different questions even though both affect layout.

---

## Phase 8: Saving History with Supabase  (Optional)

*⏱ Estimated time: 60 minutes*

### 8.1 Why Add a Backend Now

Every screen so far has lived entirely on the device: a photo is captured, analyzed, displayed, and then gone the moment you navigate away or close the app. That's fine for trying the app out, but it means there's no way to look back at a result, no record of what the camera has seen, and no way for the same account to see its history on a different device. Supabase gives you a hosted Postgres database with an auto-generated API, so you can persist each analysis as a row in a table and read it back later — without writing or hosting any backend code yourself.

> [!NOTE]
> **Local Cache vs. a Real Backend**

The "Where to Go Next" ideas earlier in this guide mentioned caching results locally. That's a reasonable lighter-weight option — it survives an app restart, but it lives only on one device and disappears if the app is uninstalled. A Supabase table survives both, and is the same kind of persistence layer most real production apps use.

### 8.2 Create a Supabase Project and Table

1.Go to supabase.com and create a free account, then create a new project. Note the database password you set — you won't need it for this guide, but save it somewhere safe. 2.Once the project finishes provisioning, open the SQL Editor and run the statement below to create a table for analysis history.

```sql
create table analysis_history (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  objects text,
  context text,
  recommendations text
);

alter table analysis_history enable row level security;

create policy "Allow anonymous read/write"
  on analysis_history
  for all
  using (true)
  with check (true);
```

---

> [!WARNING]
> **This Policy Is for Following Along Only**

The using (true) / with check (true) policy above allows anyone with your publishable key to read and write every row in this table — acceptable for a single-user demo app you're building to learn, but not for anything you'd ship. A real app would scope this policy to auth.uid(), tying each row to the signed-in user who created it, which means adding Supabase Auth first.

3.In the project's Connect dialog (or Settings → API Keys), copy the Project URL and the Publishable key (sb_publishable_…). Supabase is phasing out the older anon key naming in favor of these, so use the Publishable key shown there rather than searching for "anon key" in the dashboard.

### 8.3 Store the Supabase Credentials

Add two more variables to .env, alongside the Gemini and Roboflow keys from earlier phases. Expo requires the EXPO_PUBLIC_ prefix to expose them to app code, the same rule Phase 1 introduced:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key_here
```

Then install the official client library and its small set of required polyfills, and restart npx expo start after editing .env:

```bash
npx expo install @supabase/supabase-js react-native-url-polyfill expo-sqlite
```

### 8.4 Initializing the Supabase Client

Create a new file, lib/supabase.js, that builds one shared client other files can import — the same one-module pattern lib/gemini.js and lib/roboflow.js already use.

---

> [!TIP]
> **Vibe Coding Prompt**

Paste this into your AI coding assistant (Claude Code, Cursor, Copilot Chat, etc.) to generate this step instantly:

> Create a lib/supabase.js file for a React Native Expo app that

> initializes and exports a Supabase client. Import

> 'react-native-url-polyfill/auto' and 'expo-sqlite/localStorage/install'

> before anything else in the file. Use createClient from

> @supabase/supabase-js, passing process.env.EXPO_PUBLIC_SUPABASE_URL

> and process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Export the

> client as a named export called supabase.

The two polyfill imports matter more than they look — React Native's JavaScript environment is missing pieces (URL parsing, a localStorage-like API) that supabase-js assumes exist. Skipping them produces confusing runtime errors that don't obviously point back to a missing import.

Or build it by hand:

```javascript
// lib/supabase.js
import 'react-native-url-polyfill/auto';
import 'expo-sqlite/localStorage/install';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabasePublishableKey =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(supabaseUrl, supabasePublishableKey);
```

#### Reading This Code

- The two polyfill imports must run before createClient is called, which is why they sit at the very top of the file — import order matters here in a way it usually doesn't.
- supabase is a plain named export, not a React hook or context — any file can import { supabase } from '../lib/supabase' and call it directly, the same way lib/gemini.js and lib/roboflow.js export plain async functions rather than components.

### 8.5 Saving Each Analysis

After Gemini's response is parsed in ResultScreen.jsx, insert one row into analysis_history with the same three fields the screen already displays.

---

```javascript
// In ResultScreen.jsx, after the Gemini analysis succeeds:
import { supabase } from '../lib/supabase';

async function saveToHistory(result) {
  try {
    await supabase.from('analysis_history').insert({
      objects: result.objects.join(', '),
      context: result.context,
      recommendations: result.recommendations,
    });
  } catch (err) {
    // Saving history should never block showing the result on screen.
    console.warn('Failed to save history:', err);
  }
}
```

#### Reading This Code

- This call happens after the result is already on screen, not before — the user sees their analysis immediately regardless of whether the save succeeds, which mirrors the same fail-soft approach Roboflow used in Phase 4.5.
- result.objects.join(', ') flattens an array back into a single string because the table column is plain text — a more advanced version could use a Postgres array or json column instead, but text keeps the schema simple for following along.

### 8.6 A Minimal History Screen

Add one new screen that queries every saved row, most recent first, and lists it in a simple scrollable list.

---

```javascript
// HistoryScreen.jsx
import { useState, useEffect } from 'react';
import { View, FlatList, Text, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';

export default function HistoryScreen() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    const { data } = await supabase
      .from('analysis_history')
      .select()
      .order('created_at', { ascending: false });
    setRows(data ?? []);
    setLoading(false);
  }

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <FlatList
      data={rows}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={{ padding: 12 }}>
          <Text style={{ fontWeight: 'bold' }}>{item.objects}</Text>
          <Text>{item.context}</Text>
        </View>
      )}
    />
  );
}
```

#### Reading This Code

- .select() with no arguments returns every column; .order('created_at', { ascending: false }) puts the newest analysis at the top of the list, the same direction a chat app orders messages.
- supabase-js returns { data, error } from every query — unlike the raw fetch() calls used for Gemini and Roboflow earlier in this guide, there's no response.json() step; data ?? [] guards against a null result if the query fails.
- Wire a button or header icon on an existing screen (e.g. CameraScreen) to navigation.navigate('History'), the same navigation pattern used everywhere else in this app.

---

> [!NOTE]
> **Realtime Is Available Too**

Supabase can push new rows to every connected client the instant they're inserted, using its Realtime feature, instead of requiring a manual reload like loadHistory() above. That's a natural "push further" step once this basic version is working.

> [!SUCCESS]
> **Checkpoint — before moving on, confirm:**

Running an analysis and then opening the History screen shows that analysis as the most recent entry. Force-closing and reopening the app still shows previously saved history — confirming the data lives in Supabase, not just in memory. Temporarily breaking the Supabase URL or key (e.g. typo it) still lets a new analysis complete and display on ResultScreen, even though saving to history silently fails. You can explain, in one or two sentences, why the row-level security policy used here would need to change before shipping this app to real users.

### 8.7 Push Further (Optional)

- Add Supabase Auth so each row is tied to a signed-in user via auth.uid(), and tighten the row level security policy to match — each user should only see their own history.
- Subscribe to Realtime changes on analysis_history so the History screen updates live without a manual refresh.
- Store the original captured photo in Supabase Storage and save its URL alongside each row, so the history list can show a thumbnail.

---

## Learning Outcomes

Across roughly four and a half to five and a half hours, moving from an installed camera package to a fully working, platform-aware AI vision app with three swappable personas, you have practiced:

- Native device permissions and why mobile permission models differ from the web
- Native APIs as OS-level capabilities, distinct from browser APIs
- useRef for stable references to native components
- Screen navigation and passing data forward with route parameters
- fetch() and async/await for real, production-style network requests
- Sending multimodal (image + text) requests to an AI API
- Parsing and trusting — carefully — structured JSON from an AI response
- Conditional rendering across loading, success, and error states
- Defensive error handling around unpredictable external services
- Prompt engineering as a lightweight, code-free way to reshape AI behavior
- Branching on Platform.OS and Platform.select() for OS-specific behavior and styling
- Respecting safe areas with useSafeAreaInsets so UI never collides with system chrome
- Responding to screen size with useWindowDimensions, distinct from OS detection

## Where to Go Next

- If you completed the optional Supabase phase, cache the most recent history query locally so the History screen has something to show instantly, even before the network request resolves.
- If you completed the optional Roboflow phase, draw the detection bounding boxes directly over the photo instead of listing them as text.
- If you completed the optional Supabase phase, add Supabase Auth and scope each row's row-level security policy to auth.uid(), so the History screen only ever shows one signed-in user's own past analyses.
- Stream the Gemini response token-by-token instead of waiting for the full JSON body.
- Move the Gemini API key behind a small backend proxy so it's never bundled into the client app.
- Add a tablet-specific two-column layout to the Result screen using the isTablet pattern from Phase 7.

End of Demonstration 2 — VisionAI
