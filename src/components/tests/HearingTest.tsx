/**
 * CADET PROTOCOL — Hearing Test (Pure Tone Audiometry)
 * Tests hearing at 500Hz, 1kHz, 2kHz, 4kHz per ear.
 * Maps to: AudiologicalStandards from medical-standards.ts
 */

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { AudiometryEngine, TEST_FREQUENCIES, ThresholdResult } from '@/lib/audiometry';
import { toast } from 'sonner';
import { Headphones, Volume2, VolumeX, X, ShieldCheck, ShieldX, ShieldAlert, Ear } from 'lucide-react';

interface HearingTestProps {
  maxAllowedDb?: number; // from AFMS (20-30 dB)
  onComplete: (result: { value: string; status: 'FIT' | 'UNFIT' | 'BORDERLINE'; raw: string }) => void;
  onClose: () => void;
}

const DB_LEVELS = [-5, -10, -15, -20, -25, -30, -35]; // Relative dB from reference

export default function HearingTest({ maxAllowedDb = 30, onComplete, onClose }: HearingTestProps) {
  const [phase, setPhase] = useState<'INTRO' | 'TESTING' | 'RESULT'>('INTRO');
  const [currentEar, setCurrentEar] = useState<'right' | 'left'>('right');
  const [currentFreqIdx, setCurrentFreqIdx] = useState(0);
  const [currentDbIdx, setCurrentDbIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [results, setResults] = useState<ThresholdResult[]>([]);
  const [waitingResponse, setWaitingResponse] = useState(false);
  
  const engineRef = useRef<AudiometryEngine | null>(null);

  useEffect(() => {
    const engine = new AudiometryEngine();
    engine.initialize();
    engineRef.current = engine;
    return () => engine.destroy();
  }, []);

  const startTest = async () => {
    if (engineRef.current) {
      await engineRef.current.resume();
    }
    setPhase('TESTING');
    setCurrentEar('right');
    setCurrentFreqIdx(0);
    setCurrentDbIdx(0);
    setResults([]);
    playCurrentTone();
  };

  const playCurrentTone = async () => {
    if (!engineRef.current) return;
    
    const freq = TEST_FREQUENCIES[currentFreqIdx].frequency;
    const db = DB_LEVELS[currentDbIdx];
    
    setIsPlaying(true);
    await engineRef.current.playTone(freq, db, currentEar);
    setIsPlaying(false);
    setWaitingResponse(true);
  };

  const handleResponse = (canHear: boolean) => {
    setWaitingResponse(false);
    
    if (canHear) {
      // Try quieter tone
      if (currentDbIdx < DB_LEVELS.length - 1) {
        const nextIdx = currentDbIdx + 1;
        setCurrentDbIdx(nextIdx);
        setTimeout(() => {
          playToneAt(currentFreqIdx, nextIdx, currentEar);
        }, 500);
      } else {
        // Reached quietest — record threshold and move on
        recordAndAdvance(DB_LEVELS[currentDbIdx]);
      }
    } else {
      // Cannot hear — threshold is the previous (louder) level
      const threshold = currentDbIdx > 0 ? DB_LEVELS[currentDbIdx - 1] : DB_LEVELS[0];
      recordAndAdvance(threshold);
    }
  };

  const playToneAt = async (freqIdx: number, dbIdx: number, ear: 'left' | 'right') => {
    if (!engineRef.current) return;
    const freq = TEST_FREQUENCIES[freqIdx].frequency;
    const db = DB_LEVELS[dbIdx];
    setIsPlaying(true);
    await engineRef.current.playTone(freq, db, ear);
    setIsPlaying(false);
    setWaitingResponse(true);
  };

  const recordAndAdvance = (thresholdDb: number) => {
    const result: ThresholdResult = {
      frequency: TEST_FREQUENCIES[currentFreqIdx].frequency,
      ear: currentEar,
      thresholdDb: Math.abs(thresholdDb), // Convert to positive dB HL
      passed: Math.abs(thresholdDb) <= maxAllowedDb,
    };
    
    const newResults = [...results, result];
    setResults(newResults);

    // Advance to next frequency
    if (currentFreqIdx < TEST_FREQUENCIES.length - 1) {
      const nextFreqIdx = currentFreqIdx + 1;
      setCurrentFreqIdx(nextFreqIdx);
      setCurrentDbIdx(0);
      setTimeout(() => {
        playToneAt(nextFreqIdx, 0, currentEar);
      }, 800);
    } else if (currentEar === 'right') {
      // Switch to left ear
      setCurrentEar('left');
      setCurrentFreqIdx(0);
      setCurrentDbIdx(0);
      toast.info('Right ear complete. Now testing LEFT ear.');
      setTimeout(() => {
        playToneAt(0, 0, 'left');
      }, 1500);
    } else {
      // Both ears done
      setPhase('RESULT');
    }
  };

  const handleFinish = () => {
    const engine = engineRef.current!;
    const evaluation = engine.evaluateResults(results, maxAllowedDb);
    const maxDb = Math.max(...results.map(r => r.thresholdDb));
    
    onComplete({
      value: `Max: ${maxDb} dB | ${evaluation.overallStatus}`,
      status: evaluation.overallStatus === 'PASS' ? 'FIT' : evaluation.overallStatus === 'FAIL' ? 'UNFIT' : 'BORDERLINE',
      raw: `Hearing: Max threshold ${maxDb} dB HL. Right: ${results.filter(r => r.ear === 'right').map(r => `${r.frequency}Hz=${r.thresholdDb}dB`).join(', ')}. Left: ${results.filter(r => r.ear === 'left').map(r => `${r.frequency}Hz=${r.thresholdDb}dB`).join(', ')}`,
    });
  };

  const totalSteps = TEST_FREQUENCIES.length * 2;
  const completedSteps = results.length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-2xl flex flex-col"
    >
      <div className="flex items-center justify-between p-4 border-b border-primary/10">
        <div>
          <div className="font-sans font-bold text-[10px] uppercase tracking-[0.4em] text-primary">Audiometry</div>
          <h2 className="text-xl font-display text-foreground">Hearing Assessment</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}><X size={20} /></Button>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
        {phase === 'INTRO' && (
          <div className="max-w-md w-full text-center space-y-6">
            <div className="w-24 h-24 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
              <Headphones size={40} className="text-primary" />
            </div>
            <h3 className="text-2xl font-display">Pure Tone Audiometry</h3>
            <div className="space-y-3 text-sm text-muted-foreground text-left">
              <p>• <strong>Wear headphones</strong> in a quiet room</p>
              <p>• You will hear tones at different frequencies</p>
              <p>• Tap <strong>"I Can Hear"</strong> when you hear the tone</p>
              <p>• Tap <strong>"Cannot Hear"</strong> if you cannot</p>
              <p>• Each ear is tested separately</p>
            </div>
            <div className="p-4 bg-warning/10 border border-warning/20 rounded-sm">
              <p className="text-[10px] font-sans font-bold uppercase tracking-widest text-warning mb-1">AFMS Standard</p>
              <p className="text-lg font-display text-warning">Maximum: {maxAllowedDb} dB HL</p>
            </div>
            <Button onClick={startTest} variant="liquid-glass" className="w-full h-12 font-sans font-bold uppercase text-[11px] tracking-widest shadow-glow-gold">
              <Headphones size={16} className="mr-2" /> Start Hearing Test
            </Button>
          </div>
        )}

        {phase === 'TESTING' && (
          <div className="max-w-md w-full text-center space-y-8">
            {/* Ear indicator */}
            <div className="flex items-center justify-center gap-6">
              <div className={`flex flex-col items-center gap-2 ${currentEar === 'right' ? 'opacity-100' : 'opacity-30'}`}>
                <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center ${currentEar === 'right' ? 'border-primary bg-primary/10 animate-pulse' : 'border-muted'}`}>
                  <Ear size={24} className="text-primary" />
                </div>
                <span className="text-[10px] font-sans font-bold uppercase tracking-widest">Right</span>
              </div>
              <div className={`flex flex-col items-center gap-2 ${currentEar === 'left' ? 'opacity-100' : 'opacity-30'}`}>
                <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center ${currentEar === 'left' ? 'border-primary bg-primary/10 animate-pulse' : 'border-muted'}`}>
                  <Ear size={24} className="text-primary scale-x-[-1]" />
                </div>
                <span className="text-[10px] font-sans font-bold uppercase tracking-widest">Left</span>
              </div>
            </div>

            {/* Current frequency */}
            <div>
              <div className="text-[10px] font-sans font-bold uppercase tracking-widest text-muted-foreground">Frequency</div>
              <div className="text-4xl font-display text-primary">{TEST_FREQUENCIES[currentFreqIdx].label}</div>
              <div className="text-xs text-muted-foreground mt-1">Level: {Math.abs(DB_LEVELS[currentDbIdx])} dB</div>
            </div>

            {/* Tone indicator */}
            <div className="flex justify-center">
              <div className={`w-32 h-32 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                isPlaying ? 'border-primary bg-primary/20 scale-110 shadow-glow-gold' : 'border-muted bg-muted/5'
              }`}>
                {isPlaying ? (
                  <Volume2 size={48} className="text-primary animate-pulse" />
                ) : (
                  <VolumeX size={48} className="text-muted-foreground/30" />
                )}
              </div>
            </div>

            {/* Response buttons */}
            {waitingResponse && (
              <div className="flex gap-4">
                <Button
                  onClick={() => handleResponse(true)}
                  variant="liquid-glass"
                  className="flex-1 h-14 text-[11px] uppercase tracking-widest"
                >
                  <Volume2 size={16} className="mr-2" /> I Can Hear
                </Button>
                <Button
                  onClick={() => handleResponse(false)}
                  variant="outline"
                  className="flex-1 h-14 text-[11px] uppercase tracking-widest border-destructive/30"
                >
                  <VolumeX size={16} className="mr-2" /> Cannot Hear
                </Button>
              </div>
            )}

            {!waitingResponse && !isPlaying && (
              <Button onClick={() => playToneAt(currentFreqIdx, currentDbIdx, currentEar)} variant="outline" className="text-[10px] uppercase tracking-widest">
                Play Tone Again
              </Button>
            )}

            {/* Progress */}
            <div className="flex gap-1">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div key={i} className={`h-1.5 flex-1 rounded-full ${i < completedSteps ? 'bg-primary' : 'bg-white/10'}`} />
              ))}
            </div>
          </div>
        )}

        {phase === 'RESULT' && (
          <div className="max-w-md w-full text-center space-y-6">
            {(() => {
              const maxDb = Math.max(...results.map(r => r.thresholdDb));
              const allPassed = results.every(r => r.thresholdDb <= maxAllowedDb);
              const status = allPassed ? 'FIT' : 'UNFIT';
              const Icon = status === 'FIT' ? ShieldCheck : ShieldX;
              const color = status === 'FIT' ? 'text-green-400' : 'text-red-400';

              return (
                <>
                  <div className={`w-20 h-20 rounded-full border-2 flex items-center justify-center mx-auto ${color} border-current bg-current/10`}>
                    <Icon size={36} />
                  </div>
                  <h3 className="text-2xl font-display">Audiometry Results</h3>

                  <div className="glass-panel p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-[9px] font-sans font-bold uppercase tracking-widest text-muted-foreground mb-2">Right Ear</div>
                        {results.filter(r => r.ear === 'right').map(r => (
                          <div key={r.frequency} className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">{r.frequency} Hz</span>
                            <span className={r.passed ? 'text-green-400' : 'text-red-400'}>{r.thresholdDb} dB</span>
                          </div>
                        ))}
                      </div>
                      <div>
                        <div className="text-[9px] font-sans font-bold uppercase tracking-widest text-muted-foreground mb-2">Left Ear</div>
                        {results.filter(r => r.ear === 'left').map(r => (
                          <div key={r.frequency} className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">{r.frequency} Hz</span>
                            <span className={r.passed ? 'text-green-400' : 'text-red-400'}>{r.thresholdDb} dB</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="pt-3 border-t border-primary/10">
                      <div className="flex justify-between text-[10px] font-sans font-bold uppercase">
                        <span className="text-muted-foreground">Max Threshold</span>
                        <span className={maxDb <= maxAllowedDb ? 'text-green-400' : 'text-red-400'}>{maxDb} dB</span>
                      </div>
                      <div className="flex justify-between text-[10px] font-sans font-bold uppercase mt-1">
                        <span className="text-muted-foreground">AFMS Limit</span>
                        <span className="text-primary">{maxAllowedDb} dB</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => { setResults([]); setPhase('INTRO'); }} className="flex-1 text-[10px] uppercase tracking-widest">Re-Test</Button>
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
