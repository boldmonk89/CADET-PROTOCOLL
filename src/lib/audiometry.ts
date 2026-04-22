/**
 * CADET PROTOCOL — Audiometry Engine
 * Pure Tone Audiometry using Web Audio API
 * 
 * Tests hearing thresholds at standard audiometric frequencies.
 * Maps to: AudiologicalStandards.pureToneAudiometry from medical-standards.ts
 * 
 * DISCLAIMER: This is a screening tool, not a clinical audiometer.
 * Results are indicative only. Professional audiological evaluation required.
 */

export interface ToneConfig {
  frequency: number;
  label: string;
}

export interface ThresholdResult {
  frequency: number;
  ear: 'left' | 'right';
  thresholdDb: number;
  passed: boolean;
}

export interface AudiometryResult {
  leftEar: ThresholdResult[];
  rightEar: ThresholdResult[];
  overallStatus: 'PASS' | 'FAIL' | 'BORDERLINE';
  maxThresholdDb: number;
}

// Standard audiometric test frequencies
export const TEST_FREQUENCIES: ToneConfig[] = [
  { frequency: 500, label: '500 Hz' },
  { frequency: 1000, label: '1 kHz' },
  { frequency: 2000, label: '2 kHz' },
  { frequency: 4000, label: '4 kHz' },
];

/**
 * Convert decibels to gain value.
 * 0 dB = reference level, negative = quieter
 * We use a reference gain of 0.3 as "0 dB HL" (hearing level)
 */
function dbToGain(db: number): number {
  const referenceGain = 0.3; // Safe reference level
  return referenceGain * Math.pow(10, db / 20);
}

export class AudiometryEngine {
  private audioCtx: AudioContext | null = null;
  private currentOscillator: OscillatorNode | null = null;
  private currentGain: GainNode | null = null;
  private isPlaying = false;

  // Safety: absolute maximum gain to protect hearing
  private readonly MAX_GAIN = 0.5;
  private readonly TONE_DURATION_MS = 1500;
  private readonly RAMP_MS = 50; // Fade in/out to prevent clicks

  initialize(): void {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  async resume(): Promise<void> {
    if (this.audioCtx?.state === 'suspended') {
      await this.audioCtx.resume();
    }
  }

  /**
   * Play a pure tone at the given frequency and dB level.
   * Supports stereo panning for individual ear testing.
   */
  playTone(frequency: number, dbLevel: number, ear: 'left' | 'right' | 'both' = 'both'): Promise<void> {
    return new Promise((resolve) => {
      if (!this.audioCtx) {
        this.initialize();
      }
      const ctx = this.audioCtx!;

      // Stop any currently playing tone
      this.stopTone();

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const panNode = ctx.createStereoPanner();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

      // Calculate gain from dB level, clamped to safety max
      const targetGain = Math.min(dbToGain(dbLevel), this.MAX_GAIN);

      // Ramp in to prevent audio clicks
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(targetGain, ctx.currentTime + this.RAMP_MS / 1000);

      // Pan for ear selection
      if (ear === 'left') {
        panNode.pan.setValueAtTime(-1, ctx.currentTime);
      } else if (ear === 'right') {
        panNode.pan.setValueAtTime(1, ctx.currentTime);
      } else {
        panNode.pan.setValueAtTime(0, ctx.currentTime);
      }

      // Connect: oscillator → gain → pan → output
      oscillator.connect(gainNode);
      gainNode.connect(panNode);
      panNode.connect(ctx.destination);

      // Ramp out before stopping
      const stopTime = ctx.currentTime + this.TONE_DURATION_MS / 1000;
      gainNode.gain.setValueAtTime(targetGain, stopTime - this.RAMP_MS / 1000);
      gainNode.gain.linearRampToValueAtTime(0, stopTime);

      oscillator.start();
      oscillator.stop(stopTime + 0.01);

      this.currentOscillator = oscillator;
      this.currentGain = gainNode;
      this.isPlaying = true;

      oscillator.onended = () => {
        this.isPlaying = false;
        this.currentOscillator = null;
        this.currentGain = null;
        resolve();
      };
    });
  }

  stopTone(): void {
    if (this.currentOscillator && this.isPlaying) {
      try {
        this.currentOscillator.stop();
      } catch {
        // Already stopped
      }
      this.isPlaying = false;
    }
  }

  /**
   * Run a simplified Hughson-Westlake procedure for one frequency/ear.
   * Returns the threshold in dB.
   * 
   * Procedure:
   * 1. Start at -10 dB (easily audible)
   * 2. If heard: decrease by 10 dB
   * 3. If not heard: increase by 5 dB
   * 4. Threshold = lowest level heard 2/3 times
   */
  getTestLevels(): number[] {
    // dB levels from loudest to softest (relative to reference)
    return [-10, -15, -20, -25, -30, -35, -40];
  }

  /**
   * Evaluate results against AFMS standards.
   * maxDbHL from AudiologicalStandards (typically 20-30 dB)
   */
  evaluateResults(
    results: ThresholdResult[],
    maxAllowedDb: number = 30
  ): AudiometryResult {
    const leftEar = results.filter(r => r.ear === 'left');
    const rightEar = results.filter(r => r.ear === 'right');

    const allPassed = results.every(r => r.thresholdDb <= maxAllowedDb);
    const anyFailed = results.some(r => r.thresholdDb > maxAllowedDb);
    const maxThreshold = Math.max(...results.map(r => r.thresholdDb));

    // Mark individual results
    leftEar.forEach(r => { r.passed = r.thresholdDb <= maxAllowedDb; });
    rightEar.forEach(r => { r.passed = r.thresholdDb <= maxAllowedDb; });

    return {
      leftEar,
      rightEar,
      overallStatus: allPassed ? 'PASS' : anyFailed ? 'FAIL' : 'BORDERLINE',
      maxThresholdDb: maxThreshold,
    };
  }

  destroy(): void {
    this.stopTone();
    if (this.audioCtx) {
      this.audioCtx.close();
      this.audioCtx = null;
    }
  }
}
