/**
 * CADET PROTOCOL — Pose Analysis Engine
 * Uses MediaPipe Pose Landmarker for real-time musculoskeletal assessment.
 * 
 * Testable parameters from medical-standards.ts:
 *  - carryAngle.maxDegrees (Orthopaedic)
 *  - genuValgum.maxInterMalleolarDistanceCm (Orthopaedic)
 *  - genuVarum.maxInterCondylarDistanceCm (Orthopaedic)
 */

import { PoseLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';

// MediaPipe Pose Landmark indices
const LANDMARKS = {
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32,
};

interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface PoseResult {
  carryAngleLeft: number | null;
  carryAngleRight: number | null;
  kneeAngleLeft: number | null;  // deviation from 180° = valgus/varus
  kneeAngleRight: number | null;
  landmarks: Point3D[] | null;
  confidence: number;
}

/**
 * Calculate angle between three points (in degrees).
 * The angle is measured at the middle point.
 */
function calculateAngle(a: Point3D, b: Point3D, c: Point3D): number {
  const ba = { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
  const bc = { x: c.x - b.x, y: c.y - b.y, z: c.z - b.z };

  const dot = ba.x * bc.x + ba.y * bc.y + ba.z * bc.z;
  const magBA = Math.sqrt(ba.x ** 2 + ba.y ** 2 + ba.z ** 2);
  const magBC = Math.sqrt(bc.x ** 2 + bc.y ** 2 + bc.z ** 2);

  if (magBA === 0 || magBC === 0) return 0;

  const cosAngle = Math.max(-1, Math.min(1, dot / (magBA * magBC)));
  return (Math.acos(cosAngle) * 180) / Math.PI;
}

/**
 * Simple moving average smoother for reducing jitter.
 */
class AngleSmoother {
  private buffer: number[] = [];
  private maxSize: number;

  constructor(windowSize = 5) {
    this.maxSize = windowSize;
  }

  push(value: number): number {
    this.buffer.push(value);
    if (this.buffer.length > this.maxSize) {
      this.buffer.shift();
    }
    return this.buffer.reduce((a, b) => a + b, 0) / this.buffer.length;
  }

  reset() {
    this.buffer = [];
  }
}

export class PoseAnalyzer {
  private landmarker: PoseLandmarker | null = null;
  private smoothers = {
    carryLeft: new AngleSmoother(5),
    carryRight: new AngleSmoother(5),
    kneeLeft: new AngleSmoother(5),
    kneeRight: new AngleSmoother(5),
  };
  private drawingUtils: DrawingUtils | null = null;

  async initialize(): Promise<void> {
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
    );

    this.landmarker = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      numPoses: 1,
    });
  }

  initDrawingUtils(ctx: CanvasRenderingContext2D): void {
    this.drawingUtils = new DrawingUtils(ctx);
  }

  analyzeFrame(video: HTMLVideoElement, timestamp: number): PoseResult {
    if (!this.landmarker) {
      return { carryAngleLeft: null, carryAngleRight: null, kneeAngleLeft: null, kneeAngleRight: null, landmarks: null, confidence: 0 };
    }

    const result = this.landmarker.detectForVideo(video, timestamp);

    if (!result.landmarks || result.landmarks.length === 0) {
      return { carryAngleLeft: null, carryAngleRight: null, kneeAngleLeft: null, kneeAngleRight: null, landmarks: null, confidence: 0 };
    }

    const lm = result.landmarks[0];
    const wlm = result.worldLandmarks?.[0] || lm;

    // Carrying Angle: Shoulder → Elbow → Wrist (deviation from 180°)
    const rawCarryLeft = 180 - calculateAngle(
      wlm[LANDMARKS.LEFT_SHOULDER],
      wlm[LANDMARKS.LEFT_ELBOW],
      wlm[LANDMARKS.LEFT_WRIST]
    );
    const rawCarryRight = 180 - calculateAngle(
      wlm[LANDMARKS.RIGHT_SHOULDER],
      wlm[LANDMARKS.RIGHT_ELBOW],
      wlm[LANDMARKS.RIGHT_WRIST]
    );

    // Knee Angle: Hip → Knee → Ankle (deviation from 180° = valgus)
    const rawKneeLeft = 180 - calculateAngle(
      wlm[LANDMARKS.LEFT_HIP],
      wlm[LANDMARKS.LEFT_KNEE],
      wlm[LANDMARKS.LEFT_ANKLE]
    );
    const rawKneeRight = 180 - calculateAngle(
      wlm[LANDMARKS.RIGHT_HIP],
      wlm[LANDMARKS.RIGHT_KNEE],
      wlm[LANDMARKS.RIGHT_ANKLE]
    );

    // Average visibility as confidence
    const visibilitySum = [
      LANDMARKS.LEFT_SHOULDER, LANDMARKS.LEFT_ELBOW, LANDMARKS.LEFT_WRIST,
      LANDMARKS.LEFT_HIP, LANDMARKS.LEFT_KNEE, LANDMARKS.LEFT_ANKLE,
    ].reduce((sum, idx) => sum + ((lm[idx] as any).visibility || 0), 0);
    const confidence = visibilitySum / 6;

    return {
      carryAngleLeft: Math.round(this.smoothers.carryLeft.push(Math.abs(rawCarryLeft)) * 10) / 10,
      carryAngleRight: Math.round(this.smoothers.carryRight.push(Math.abs(rawCarryRight)) * 10) / 10,
      kneeAngleLeft: Math.round(this.smoothers.kneeLeft.push(Math.abs(rawKneeLeft)) * 10) / 10,
      kneeAngleRight: Math.round(this.smoothers.kneeRight.push(Math.abs(rawKneeRight)) * 10) / 10,
      landmarks: lm as unknown as Point3D[],
      confidence,
    };
  }

  drawLandmarks(ctx: CanvasRenderingContext2D, landmarks: Point3D[], width: number, height: number): void {
    if (!this.drawingUtils) {
      this.initDrawingUtils(ctx);
    }

    ctx.clearRect(0, 0, width, height);

    // Draw connections
    const connections = PoseLandmarker.POSE_CONNECTIONS;
    if (this.drawingUtils && connections) {
      this.drawingUtils.drawConnectors(landmarks as any, connections, {
        color: 'rgba(212, 175, 55, 0.4)',
        lineWidth: 2,
      });
      this.drawingUtils.drawLandmarks(landmarks as any, {
        color: 'rgba(212, 175, 55, 0.8)',
        lineWidth: 1,
        radius: 3,
      });
    }
  }

  resetSmoothers(): void {
    Object.values(this.smoothers).forEach(s => s.reset());
  }

  destroy(): void {
    if (this.landmarker) {
      this.landmarker.close();
      this.landmarker = null;
    }
  }
}
