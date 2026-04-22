/**
 * CADET PROTOCOL — Pose Test Component
 * Camera-based musculoskeletal assessment using MediaPipe Pose.
 * Tests: Carrying Angle, Knock Knee (Genu Valgum), Bow Legs (Genu Varum)
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { PoseAnalyzer, PoseResult } from '@/lib/pose-analysis';
import { toast } from 'sonner';
import { Camera, X, Activity, ShieldCheck, ShieldX, ShieldAlert, Loader2 } from 'lucide-react';

type PoseTestType = 'CARRY_ANGLE' | 'KNOCK_KNEE';

interface PoseTestProps {
  testType: PoseTestType;
  maxThreshold: number; // from AFMS standards
  gender: string;
  onComplete: (result: { value: number; status: 'FIT' | 'UNFIT' | 'BORDERLINE'; raw: string }) => void;
  onClose: () => void;
}

const TEST_CONFIG = {
  CARRY_ANGLE: {
    title: 'Carrying Angle Assessment',
    subtitle: 'Shoulder → Elbow → Wrist Angle',
    instruction: 'Stand 2 metres from camera. Arms fully extended at sides, palms facing forward.',
    valueLabel: 'Carrying Angle',
    unit: '°',
    captureCount: 5,
  },
  KNOCK_KNEE: {
    title: 'Knee Alignment Assessment',
    subtitle: 'Hip → Knee → Ankle Alignment',
    instruction: 'Stand facing camera. Feet together, legs straight. Full body must be visible.',
    valueLabel: 'Knee Deviation',
    unit: '°',
    captureCount: 5,
  },
};

export default function PoseTest({ testType, maxThreshold, gender, onComplete, onClose }: PoseTestProps) {
  const config = TEST_CONFIG[testType];
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analyzerRef = useRef<PoseAnalyzer | null>(null);
  const rafRef = useRef<number>(0);

  const [phase, setPhase] = useState<'INIT' | 'LOADING' | 'CALIBRATING' | 'TESTING' | 'RESULT'>('INIT');
  const [currentResult, setCurrentResult] = useState<PoseResult | null>(null);
  const [captures, setCaptures] = useState<number[]>([]);
  const [finalValue, setFinalValue] = useState<number>(0);
  const [confidence, setConfidence] = useState(0);

  const startCamera = async () => {
    try {
      setPhase('LOADING');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      streamRef.current = stream;

      // Initialize MediaPipe
      const analyzer = new PoseAnalyzer();
      await analyzer.initialize();
      analyzerRef.current = analyzer;

      setPhase('CALIBRATING');
      toast.success('AI Pose Engine initialized. Position yourself as instructed.');

      // Wait 2 seconds for user to position, then start testing
      setTimeout(() => setPhase('TESTING'), 2000);
    } catch (err) {
      toast.error('Camera access denied or MediaPipe failed to load.');
      setPhase('INIT');
    }
  };

  const processFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !analyzerRef.current || phase !== 'TESTING') return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const result = analyzerRef.current.analyzeFrame(video, performance.now());
    setCurrentResult(result);
    setConfidence(result.confidence);

    // Draw skeleton overlay
    if (result.landmarks) {
      analyzerRef.current.drawLandmarks(ctx, result.landmarks, canvas.width, canvas.height);
    }

    rafRef.current = requestAnimationFrame(processFrame);
  }, [phase]);

  useEffect(() => {
    if (phase === 'TESTING') {
      rafRef.current = requestAnimationFrame(processFrame);
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [phase, processFrame]);

  const captureReading = () => {
    if (!currentResult) return;

    let value: number;
    if (testType === 'CARRY_ANGLE') {
      // Average of both arms
      value = ((currentResult.carryAngleLeft || 0) + (currentResult.carryAngleRight || 0)) / 2;
    } else {
      // Average of both knees
      value = ((currentResult.kneeAngleLeft || 0) + (currentResult.kneeAngleRight || 0)) / 2;
    }

    const newCaptures = [...captures, value];
    setCaptures(newCaptures);
    toast.success(`Reading ${newCaptures.length}/${config.captureCount} captured: ${value.toFixed(1)}${config.unit}`);

    if (newCaptures.length >= config.captureCount) {
      // Calculate average of all captures
      const avg = newCaptures.reduce((a, b) => a + b, 0) / newCaptures.length;
      setFinalValue(Math.round(avg * 10) / 10);
      setPhase('RESULT');
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    if (analyzerRef.current) {
      analyzerRef.current.destroy();
    }
  };

  const getStatus = (value: number): 'FIT' | 'UNFIT' | 'BORDERLINE' => {
    if (value <= maxThreshold) return 'FIT';
    if (value <= maxThreshold * 1.2) return 'BORDERLINE';
    return 'UNFIT';
  };

  const handleFinish = () => {
    const status = getStatus(finalValue);
    onComplete({
      value: finalValue,
      status,
      raw: `${config.valueLabel}: ${finalValue}${config.unit} (${captures.length} captures averaged)`,
    });
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-2xl flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-primary/10">
        <div>
          <div className="font-sans font-bold text-[10px] uppercase tracking-[0.4em] text-primary">
            AI Pose Analysis
          </div>
          <h2 className="text-xl font-display text-foreground">{config.title}</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={() => { stopCamera(); onClose(); }}>
          <X size={20} />
        </Button>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6 overflow-auto">
        {phase === 'INIT' && (
          <div className="text-center space-y-6 max-w-md">
            <div className="w-24 h-24 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
              <Camera size={40} className="text-primary" />
            </div>
            <h3 className="text-2xl font-display">{config.title}</h3>
            <p className="text-sm text-muted-foreground">{config.instruction}</p>
            <div className="p-4 bg-warning/10 border border-warning/20 rounded-sm">
              <p className="text-[10px] font-sans font-bold uppercase tracking-widest text-warning mb-1">AFMS Threshold</p>
              <p className="text-lg font-display text-warning">Maximum: {maxThreshold}{config.unit} ({gender})</p>
            </div>
            <Button onClick={startCamera} variant="liquid-glass" className="w-full h-12 font-sans font-bold uppercase text-[11px] tracking-widest shadow-glow-gold">
              <Camera size={16} className="mr-2" /> Initialise Camera + AI
            </Button>
          </div>
        )}

        {phase === 'LOADING' && (
          <div className="text-center space-y-4">
            <Loader2 size={48} className="text-primary animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground font-sans font-bold uppercase tracking-widest">
              Loading MediaPipe Pose Engine...
            </p>
          </div>
        )}

        {(phase === 'CALIBRATING' || phase === 'TESTING') && (
          <div className="w-full max-w-3xl space-y-4">
            {/* Video + Canvas overlay */}
            <div className="relative aspect-video bg-black rounded-sm overflow-hidden border border-primary/20">
              <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
              <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

              {/* Live readings overlay */}
              {phase === 'TESTING' && currentResult && (
                <div className="absolute top-4 left-4 space-y-2">
                  {testType === 'CARRY_ANGLE' ? (
                    <>
                      <LiveReading label="Left Arm" value={currentResult.carryAngleLeft} unit="°" max={maxThreshold} />
                      <LiveReading label="Right Arm" value={currentResult.carryAngleRight} unit="°" max={maxThreshold} />
                    </>
                  ) : (
                    <>
                      <LiveReading label="Left Knee" value={currentResult.kneeAngleLeft} unit="°" max={maxThreshold} />
                      <LiveReading label="Right Knee" value={currentResult.kneeAngleRight} unit="°" max={maxThreshold} />
                    </>
                  )}
                  <div className="text-[9px] font-sans font-bold uppercase tracking-widest text-primary/60">
                    Confidence: {(confidence * 100).toFixed(0)}%
                  </div>
                </div>
              )}

              {/* Capture progress */}
              <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                {Array.from({ length: config.captureCount }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-all ${i < captures.length ? 'bg-primary shadow-glow-gold' : 'bg-white/10'}`}
                  />
                ))}
              </div>

              {phase === 'CALIBRATING' && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <div className="text-center">
                    <Activity size={32} className="text-primary animate-pulse mx-auto mb-3" />
                    <p className="font-sans font-bold text-[10px] uppercase tracking-widest text-primary">
                      Calibrating... Position yourself
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Capture button */}
            {phase === 'TESTING' && (
              <div className="flex gap-4">
                <Button
                  onClick={captureReading}
                  disabled={!currentResult || confidence < 0.3}
                  variant="liquid-glass"
                  className="flex-1 h-14 font-sans font-bold uppercase text-[11px] tracking-widest shadow-glow-gold"
                >
                  <Activity size={16} className="mr-2" />
                  Capture Reading ({captures.length}/{config.captureCount})
                </Button>
              </div>
            )}

            <p className="text-center text-[10px] text-muted-foreground/60 italic">
              {config.instruction}
            </p>
          </div>
        )}

        {phase === 'RESULT' && (
          <ResultPanel
            title={config.title}
            value={finalValue}
            unit={config.unit}
            label={config.valueLabel}
            maxThreshold={maxThreshold}
            status={getStatus(finalValue)}
            gender={gender}
            onAccept={handleFinish}
            onRetry={() => { setCaptures([]); setPhase('INIT'); }}
          />
        )}
      </div>
    </motion.div>
  );
}

function LiveReading({ label, value, unit, max }: { label: string; value: number | null; unit: string; max: number }) {
  if (value === null) return null;
  const color = value <= max ? 'text-green-400' : value <= max * 1.2 ? 'text-yellow-400' : 'text-red-400';
  return (
    <div className="bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-sm border border-primary/10">
      <div className="text-[8px] font-sans font-bold uppercase tracking-widest text-primary/60">{label}</div>
      <div className={`text-lg font-display ${color}`}>{value.toFixed(1)}{unit}</div>
    </div>
  );
}

function ResultPanel({
  title, value, unit, label, maxThreshold, status, gender, onAccept, onRetry,
}: {
  title: string; value: number; unit: string; label: string; maxThreshold: number;
  status: 'FIT' | 'UNFIT' | 'BORDERLINE'; gender: string;
  onAccept: () => void; onRetry: () => void;
}) {
  const statusConfig = {
    FIT: { Icon: ShieldCheck, color: 'text-green-400 border-green-500/30 bg-green-500/10', label: 'FIT' },
    BORDERLINE: { Icon: ShieldAlert, color: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10', label: 'BORDERLINE' },
    UNFIT: { Icon: ShieldX, color: 'text-red-400 border-red-500/30 bg-red-500/10', label: 'UNFIT' },
  };
  const s = statusConfig[status];

  return (
    <div className="max-w-md w-full space-y-6 text-center">
      <div className={`w-20 h-20 rounded-full border-2 flex items-center justify-center mx-auto ${s.color}`}>
        <s.Icon size={36} />
      </div>
      <div>
        <h3 className="text-2xl font-display text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1">Assessment Complete</p>
      </div>
      <div className="glass-panel p-6 space-y-4">
        <div>
          <div className="text-[9px] font-sans font-bold uppercase tracking-widest text-muted-foreground">{label}</div>
          <div className={`text-4xl font-display mt-1 ${status === 'FIT' ? 'text-primary' : status === 'BORDERLINE' ? 'text-warning' : 'text-destructive'}`}>
            {value}{unit}
          </div>
        </div>
        <div className="flex justify-between text-[10px] font-sans font-bold uppercase tracking-widest">
          <span className="text-muted-foreground">AFMS Limit ({gender})</span>
          <span className="text-primary">{maxThreshold}{unit}</span>
        </div>
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-sm border ${s.color}`}>
          <s.Icon size={14} />
          <span className="font-sans font-bold text-[10px] uppercase tracking-widest">{s.label}</span>
        </div>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={onRetry} className="flex-1 font-sans font-bold uppercase text-[10px] tracking-widest">
          Re-Test
        </Button>
        <Button onClick={onAccept} variant="liquid-glass" className="flex-1 font-sans font-bold uppercase text-[10px] tracking-widest shadow-glow-gold">
          Accept Result
        </Button>
      </div>
      <p className="text-[9px] text-muted-foreground/50 italic">
        Screening-grade only. Final authority rests with SMB/AMB.
      </p>
    </div>
  );
}
