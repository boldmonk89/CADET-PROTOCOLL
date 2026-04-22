/**
 * CADET PROTOCOL — Hand Tremor Detection Test
 * Touch-point stability test: user holds finger/cursor on target for 10 seconds.
 * Measures deviation from center to detect hand tremors.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { X, HandMetal, ShieldCheck, ShieldX, Target } from 'lucide-react';

interface TremorTestProps {
  onComplete: (result: { value: string; status: 'FIT' | 'UNFIT' | 'BORDERLINE'; raw: string }) => void;
  onClose: () => void;
}

const TEST_DURATION = 10; // seconds
const TARGET_RADIUS = 20; // pixels
const MAX_ACCEPTABLE_DEVIATION = 8; // pixels — below this = no significant tremor

export default function TremorTest({ onComplete, onClose }: TremorTestProps) {
  const [phase, setPhase] = useState<'INTRO' | 'TESTING' | 'RESULT'>('INTRO');
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION);
  const [isHolding, setIsHolding] = useState(false);
  const [deviations, setDeviations] = useState<number[]>([]);
  const [avgDeviation, setAvgDeviation] = useState(0);
  const [maxDeviation, setMaxDeviation] = useState(0);

  const targetRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const deviationsRef = useRef<number[]>([]);

  const startTest = () => {
    setPhase('TESTING');
    setTimeLeft(TEST_DURATION);
    setDeviations([]);
    deviationsRef.current = [];
  };

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (phase !== 'TESTING') return;
    const target = targetRef.current;
    if (!target) return;

    const rect = target.getBoundingClientRect();
    centerRef.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
    setIsHolding(true);
  }, [phase]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isHolding || phase !== 'TESTING') return;

    const dx = e.clientX - centerRef.current.x;
    const dy = e.clientY - centerRef.current.y;
    const deviation = Math.sqrt(dx * dx + dy * dy);
    deviationsRef.current.push(deviation);
  }, [isHolding, phase]);

  const handlePointerUp = useCallback(() => {
    setIsHolding(false);
  }, []);

  // Timer
  useEffect(() => {
    if (phase !== 'TESTING' || !isHolding) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Test complete
          const devs = deviationsRef.current;
          if (devs.length > 0) {
            const avg = devs.reduce((a, b) => a + b, 0) / devs.length;
            const max = Math.max(...devs);
            setAvgDeviation(Math.round(avg * 10) / 10);
            setMaxDeviation(Math.round(max * 10) / 10);
          }
          setIsHolding(false);
          setPhase('RESULT');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, isHolding]);

  const getStatus = (): 'FIT' | 'UNFIT' | 'BORDERLINE' => {
    if (avgDeviation <= MAX_ACCEPTABLE_DEVIATION) return 'FIT';
    if (avgDeviation <= MAX_ACCEPTABLE_DEVIATION * 2) return 'BORDERLINE';
    return 'UNFIT';
  };

  const handleFinish = () => {
    const status = getStatus();
    onComplete({
      value: `Avg deviation: ${avgDeviation}px`,
      status,
      raw: `Tremor Test: Avg deviation ${avgDeviation}px, Max ${maxDeviation}px. ${status === 'FIT' ? 'No significant tremor detected' : 'Tremor detected — clinical review recommended'}`,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-2xl flex flex-col"
    >
      <div className="flex items-center justify-between p-4 border-b border-primary/10">
        <div>
          <div className="font-sans font-bold text-[10px] uppercase tracking-[0.4em] text-primary">Neuromuscular</div>
          <h2 className="text-xl font-display text-foreground">Tremor Detection</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}><X size={20} /></Button>
      </div>

      <div className="flex-1 flex items-center justify-center p-6"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {phase === 'INTRO' && (
          <div className="max-w-md w-full text-center space-y-6">
            <div className="w-24 h-24 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
              <HandMetal size={40} className="text-primary" />
            </div>
            <h3 className="text-2xl font-display">Hand Stability Test</h3>
            <p className="text-sm text-muted-foreground">
              Press and hold the target circle for {TEST_DURATION} seconds. The system will measure
              any hand tremor by tracking movement deviation.
            </p>
            <Button onClick={startTest} variant="liquid-glass" className="w-full h-12 font-sans font-bold uppercase text-[11px] tracking-widest shadow-glow-gold">
              <Target size={16} className="mr-2" /> Start Test
            </Button>
          </div>
        )}

        {phase === 'TESTING' && (
          <div className="text-center space-y-8">
            <div className="text-4xl font-display text-primary">{timeLeft}s</div>
            <p className="text-sm text-muted-foreground">
              {isHolding ? 'Hold steady...' : 'Press and hold the target circle below'}
            </p>

            {/* Target circle */}
            <div className="flex justify-center">
              <div
                ref={targetRef}
                onPointerDown={handlePointerDown}
                className={`w-32 h-32 rounded-full border-4 flex items-center justify-center cursor-pointer transition-all select-none touch-none ${
                  isHolding
                    ? 'border-primary bg-primary/20 scale-95 shadow-glow-gold'
                    : 'border-primary/30 bg-primary/5 hover:bg-primary/10'
                }`}
              >
                <div className={`w-4 h-4 rounded-full transition-all ${isHolding ? 'bg-primary shadow-[0_0_20px_rgba(212,175,55,0.8)]' : 'bg-primary/40'}`} />
              </div>
            </div>

            {isHolding && (
              <div className="text-[10px] font-sans font-bold uppercase tracking-widest text-green-400 animate-pulse">
                Recording hand stability...
              </div>
            )}
          </div>
        )}

        {phase === 'RESULT' && (
          <div className="max-w-md w-full text-center space-y-6">
            {(() => {
              const status = getStatus();
              const Icon = status === 'FIT' ? ShieldCheck : ShieldX;
              const color = status === 'FIT' ? 'text-green-400' : status === 'BORDERLINE' ? 'text-yellow-400' : 'text-red-400';
              return (
                <>
                  <div className={`w-20 h-20 rounded-full border-2 flex items-center justify-center mx-auto ${color} border-current bg-current/10`}>
                    <Icon size={36} />
                  </div>
                  <h3 className="text-2xl font-display">Tremor Test Results</h3>
                  <div className="glass-panel p-6 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Average Deviation</span>
                      <span className={`text-2xl font-display ${color}`}>{avgDeviation}px</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Maximum Deviation</span>
                      <span className="text-lg font-display text-foreground">{maxDeviation}px</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-primary/10">
                      <span className="text-xs text-muted-foreground">Threshold</span>
                      <span className="text-xs text-primary">{MAX_ACCEPTABLE_DEVIATION}px</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {status === 'FIT'
                      ? 'No significant hand tremor detected.'
                      : 'Elevated tremor detected. Clinical confirmation recommended.'}
                  </p>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => { setPhase('INTRO'); }} className="flex-1 text-[10px] uppercase tracking-widest">Re-Test</Button>
                    <Button onClick={handleFinish} variant="liquid-glass" className="flex-1 text-[10px] uppercase tracking-widest shadow-glow-gold">Accept</Button>
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </div>
    </motion.div>
  );
}
