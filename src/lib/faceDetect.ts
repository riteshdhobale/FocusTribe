// ─── Face Detection Utility ──────────────────────────────────────────────────
//
// Dual-layer client-side face detection for profile photo validation:
//
//   Layer 1 (fast path):  Chrome/Edge native FaceDetector API — ~5ms, zero bundle cost
//   Layer 2 (fallback):   MediaPipe Tasks Vision via WASM — ~50-150ms, lazy-loaded
//
// Usage:
//   const result = await detectFace(croppedBlob);
//   if (!result.hasFace) { /* show error */ }
//
// The MediaPipe model (~2MB WASM) is loaded from CDN only when needed (non-Chrome browsers)
// and cached for the session so subsequent detections are instant.

export type FaceDetectionResult = {
  hasFace: boolean;
  confidence: number;
  faceCount: number;
};

// Minimum confidence threshold — below this, we consider "no face"
const MIN_CONFIDENCE = 0.65;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Convert a Blob to an HTMLImageElement for canvas/detection APIs */
function blobToImage(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image for face detection"));
    };
    img.src = url;
  });
}

// ─── Layer 1: Native FaceDetector API ────────────────────────────────────────

function isNativeFaceDetectorAvailable(): boolean {
  return typeof window !== "undefined" && "FaceDetector" in window;
}

async function detectWithNativeAPI(
  img: HTMLImageElement,
): Promise<FaceDetectionResult | null> {
  if (!isNativeFaceDetectorAvailable()) return null;

  try {
    // @ts-expect-error — FaceDetector is not in TypeScript's DOM types yet
    const detector = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 5 });
    const faces = await detector.detect(img);

    if (!faces || faces.length === 0) {
      return { hasFace: false, confidence: 0, faceCount: 0 };
    }

    // Native API doesn't always provide confidence, but when it does, use it
    const topConfidence = faces.reduce(
      (max: number, f: any) => Math.max(max, f.boundingBox ? 0.9 : 0),
      0,
    );

    return {
      hasFace: true,
      confidence: topConfidence || 0.9, // native detections are high-confidence
      faceCount: faces.length,
    };
  } catch (e) {
    // NotSupportedError means the API exists but doesn't work on this device
    console.warn("[faceDetect] Native FaceDetector failed, falling back:", e);
    return null;
  }
}

// ─── Layer 2: MediaPipe Tasks Vision ─────────────────────────────────────────

// Cached MediaPipe detector instance (lazy-loaded once per session)
let mediapipeDetector: any = null;
let mediapipeLoading: Promise<any> | null = null;

async function getMediaPipeDetector(): Promise<any> {
  if (mediapipeDetector) return mediapipeDetector;

  // Prevent parallel loading
  if (mediapipeLoading) return mediapipeLoading;

  mediapipeLoading = (async () => {
    try {
      const { FaceDetector, FilesetResolver } = await import(
        "@mediapipe/tasks-vision"
      );

      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
      );

      mediapipeDetector = await FaceDetector.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
          delegate: "GPU",
        },
        runningMode: "IMAGE",
        minDetectionConfidence: MIN_CONFIDENCE,
      });

      return mediapipeDetector;
    } catch (e) {
      console.error("[faceDetect] MediaPipe initialization failed:", e);
      mediapipeLoading = null;
      throw e;
    }
  })();

  return mediapipeLoading;
}

async function detectWithMediaPipe(
  img: HTMLImageElement,
): Promise<FaceDetectionResult> {
  const detector = await getMediaPipeDetector();
  const result = detector.detect(img);

  if (!result || !result.detections || result.detections.length === 0) {
    return { hasFace: false, confidence: 0, faceCount: 0 };
  }

  const topConfidence = result.detections.reduce(
    (max: number, d: any) => {
      const scores = d.categories || [];
      const best = scores.reduce(
        (m: number, c: any) => Math.max(m, c.score || 0),
        0,
      );
      return Math.max(max, best);
    },
    0,
  );

  return {
    hasFace: topConfidence >= MIN_CONFIDENCE,
    confidence: topConfidence,
    faceCount: result.detections.length,
  };
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Detect whether a Blob image contains a human face.
 *
 * Uses Chrome's native FaceDetector API when available (~5ms),
 * falls back to MediaPipe WASM (~50-150ms, lazy-loaded from CDN).
 *
 * Returns `{ hasFace, confidence, faceCount }`.
 * If both detection methods fail (e.g. offline + non-Chrome), returns
 * `hasFace: true` to avoid blocking the user.
 */
export async function detectFace(blob: Blob): Promise<FaceDetectionResult> {
  try {
    const img = await blobToImage(blob);

    // Try native API first (fast + free)
    const nativeResult = await detectWithNativeAPI(img);
    if (nativeResult !== null) {
      console.log("[faceDetect] Native API result:", nativeResult);
      return nativeResult;
    }

    // Fallback to MediaPipe
    console.log("[faceDetect] Using MediaPipe fallback...");
    const mpResult = await detectWithMediaPipe(img);
    console.log("[faceDetect] MediaPipe result:", mpResult);
    return mpResult;
  } catch (e) {
    // If everything fails, don't block the user — let them upload
    console.error("[faceDetect] All detection methods failed:", e);
    return { hasFace: true, confidence: 1, faceCount: 1 };
  }
}
