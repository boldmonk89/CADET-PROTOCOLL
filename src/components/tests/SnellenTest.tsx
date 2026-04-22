/**
 * CADET PROTOCOL — Snellen Visual Acuity Test
 * Screen-based Snellen chart with calibration for accurate letter sizing.
 */

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Eye, EyeOff, X, ShieldCheck, ShieldX, ShieldAlert, Ruler } from 'lucide-react';

interface SnellenTestProps {
  onComplete: (result: { value: string; status: 'FIT' | 'UNFIT' | 'BORDERLINE'; raw: string }) => void;
  onClose: () => void;
  requiredAcuity?: string; // e.g. '6/6'
}

// Snellen optotypes (standard letters in decreasing size order)
const SNELLEN_ROWS = [
  { acuity: '6/60', letters: ['E'], size: 87.3 },        // 87.3mm at 6m → scaled
  { acuity: '6/36', letters: ['F', 'P'], size: 52.4 },
  { acuity: '6/24', letters: ['T', 'O', 'Z'], size: 34.9 },
  { acuity: '6/18', letters: ['L', 'P', 'E', 'D'], size: 26.2 },
  { acuity: '6/12', letters: ['P', 'E', 'C', 'F', 'D'], size: 17.5 },
  { acuity: '6/9',  letters: ['E', 'D', 'F', 'C', 'Z', 'P'], size: 13.1 },
  { acuity: '6/6',  letters: ['F', 'E', 'L', 'O', 'P', 'Z', 'D'], size: 8.73 },
];

// For testing at 3m instead of 6m, we halve the letter sizes
const DISTANCE_FACTOR = 0.5; // 3m instead of 6m

export default function SnellenTest({ onComplete, onClose, requiredAcuity = '6/6' }: SnellenTestProps) {
  const [phase, setPhase] = useState<'CALIBRATE' | 'TEST_RIGHT' | 'TEST_LEFT' | 'RESULT'>('CALIBRATE');
  const [pixelsPerMm, setPixelsPerMm] = useState<number>(3.78); // default ~96 DPI
  const [currentRow, setCurrentRow] = useState(0);
  const [userInputs, setUserInputs] = useState<string[]>([]);
  const [rightEyeResult, setRightEyeResult] = useState<string>('');
  const [leftEyeResult, setLeftEyeResult] = useState<string>('');
  const [showLetters, setShowLetters] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  // Credit card calibration: 85.6mm × 53.98mm
  const CARD_WIDTH_MM = 85.6;

  const handleCalibration = (screenWidthPx: number) => {
    const ppmm = screenWidthPx / CARD_WIDTH_MM;
    setPixelsPerMm(ppmm);
    toast.success(`Screen calibrated: ${ppmm.toFixed(2)} px/mm`);
    setPhase('TEST_RIGHT');
    setCurrentRow(0);
  };

  const getLetterSizePx = (rowIdx: number): number => {
    return SNELLEN_ROWS[rowIdx].size * DISTANCE_FACTOR * pixelsPerMm;
  };

  const getCurrentTestLetters = (): string[] => {
    // Shuffle letters for each presentation
    const letters = [...SNELLEN_ROWS[currentRow].letters];
    // Take random 3 or fewer
    const count = Math.min(3, letters.length);
    const shuffled = letters.sort(() => Math.random() - 0.5).slice(0, count);
    return shuffled;
  };

  const [displayLetters, setDisplayLetters] = useState<string[]>([]);

  useEffect(() => {
    if (phase === 'TEST_RIGHT' || phase === 'TEST_LEFT') {
      setDisplayLetters(getCurrentTestLetters());
      setShowLetters(true);
    }
  }, [currentRow, phase]);

  const handleResponse = (correct: boolean) => {
    if (correct) {
      // Move to next (smaller) row
      if (currentRow < SNELLEN_ROWS.length - 1) {
        setCurrentRow(currentRow + 1);
      } else {
        // Completed all rows — perfect vision
        finishEyeTest(SNELLEN_ROWS[currentRow].acuity);
      }
    } else {
      // Failed at this level — result is previous row's acuity
      const resultAcuity = currentRow > 0 ? SNELLEN_ROWS[currentRow - 1].acuity : 'Below 6/60';
      finishEyeTest(resultAcuity);
    }
  };

  const finishEyeTest = (acuity: string) => {
    if (phase === 'TEST_RIGHT') {
      setRightEyeResult(acuity);
      setCurrentRow(0);
      setPhase('TEST_LEFT');
      toast.info('Right eye complete. Now cover your RIGHT eye for left eye test.');
    } else {
      setLeftEyeResult(acuity);
      setPhase('RESULT');
    }
  };

  const acuityToScore = (acuity: string): number => {
    const map: Record<string, number> = {
      '6/6': 6, '6/9': 5, '6/12': 4, '6/18': 3, '6/24': 2, '6/36': 1, '6/60': 0,
    };
    return map[acuity] ?? -1;
  };

  const getOverallStatus = (): 'FIT' | 'UNFIT' | 'BORDERLINE' => {
    const reqScore = acuityToScore(requiredAcuity);
    const rightScore = acuityToScore(rightEyeResult);
    const leftScore = acuityToScore(leftEyeResult);
    const betterEye = Math.max(rightScore, leftScore);

    if (betterEye >= reqScore) return 'FIT';
    if (betterEye >= reqScore - 1) return 'BORDERLINE';
    return 'UNFIT';
  };

  const handleFinish = () => {
    const status = getOverallStatus();
    onComplete({
      value: `R: ${rightEyeResult}, L: ${leftEyeResult}`,
      status,
      raw: `Vision Acuity: Right Eye ${rightEyeResult}, Left Eye ${leftEyeResult}`,
    });
  };

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
          <div className="font-sans font-bold text-[10px] uppercase tracking-[0.4em] text-primary">Visual Acuity</div>
          <h2 className="text-xl font-display text-foreground">Snellen Chart Test</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}><X size={20} /></Button>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
        {/* Calibration Phase */}
        {phase === 'CALIBRATE' && (
          <CalibrationStep onCalibrated={handleCalibration} />
        )}

        {/* Testing Phase */}
        {(phase === 'TEST_RIGHT' || phase === 'TEST_LEFT') && (
          <div className="text-center space-y-8 max-w-2xl w-full">
            <div className="flex items-center justify-center gap-4">
              <div className={`w-12 h-12 rounded-full border flex items-center justify-center ${phase === 'TEST_RIGHT' ? 'border-primary bg-primary/10' : 'border-muted'}`}>
                <Eye size={20} className={phase === 'TEST_RIGHT' ? 'text-primary' : 'text-muted-foreground'} />
              </div>
              <span className="text-muted-foreground text-xs">→</span>
              <div className={`w-12 h-12 rounded-full border flex items-center justify-center ${phase === 'TEST_LEFT' ? 'border-primary bg-primary/10' : 'border-muted'}`}>
                <Eye size={20} className={phase === 'TEST_LEFT' ? 'text-primary' : 'text-muted-foreground'} />
              </div>
            </div>

            <div>
              <div className="font-sans font-bold text-[10px] uppercase tracking-widest text-primary mb-1">
                {phase === 'TEST_RIGHT' ? 'Testing Right Eye — Cover Left Eye' : 'Testing Left Eye — Cover Right Eye'}
              </div>
              <div className="text-sm text-muted-foreground">
                Row {currentRow + 1}/{SNELLEN_ROWS.length} — Target: {SNELLEN_ROWS[currentRow].acuity}
              </div>
            </div>

            {/* Letter display */}
            <div className="min-h-[200px] flex items-center justify-center">
              <div className="flex gap-4 items-center justify-center">
                {displayLetters.map((letter, i) => (
                  <span
                    key={`${currentRow}-${i}`}
                    style={{ fontSize: `${getLetterSizePx(currentRow)}px`, lineHeight: 1 }}
                    className="font-mono font-bold text-foreground select-none"
                  >
                    {showLetters ? letter : '•'}
                  </span>
                ))}
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              Can you read the letters clearly from <span className="text-primary font-bold">3 metres</span> away?
            </div>

            <div className="flex gap-4 max-w-sm mx-auto">
              <Button
                onClick={() => handleResponse(true)}
                variant="liquid-glass"
                className="flex-1 h-14 font-sans font-bold uppercase text-[11px] tracking-widest"
              >
                <Eye size={16} className="mr-2" /> Yes, I Can Read
              </Button>
              <Button
                onClick={() => handleResponse(false)}
                variant="outline"
                className="flex-1 h-14 font-sans font-bold uppercase text-[11px] tracking-widest border-destructive/30 text-destructive hover:bg-destructive/10"
              >
                <EyeOff size={16} className="mr-2" /> Cannot Read
              </Button>
            </div>
          </div>
        )}

        {/* Result Phase */}
        {phase === 'RESULT' && (
          <div className="max-w-md w-full text-center space-y-6">
            {(() => {
              const status = getOverallStatus();
              const Icon = status === 'FIT' ? ShieldCheck : status === 'BORDERLINE' ? ShieldAlert : ShieldX;
              const color = status === 'FIT' ? 'text-green-400' : status === 'BORDERLINE' ? 'text-yellow-400' : 'text-red-400';
              return (
                <>
                  <div className={`w-20 h-20 rounded-full border-2 flex items-center justify-center mx-auto ${color} border-current bg-current/10`}>
                    <Icon size={36} />
                  </div>
                  <h3 className="text-2xl font-display">Vision Acuity Results</h3>
                  <div className="glass-panel p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-[9px] font-sans font-bold uppercase tracking-widest text-muted-foreground">Right Eye</div>
                        <div className="text-3xl font-display text-primary mt-1">{rightEyeResult}</div>
                      </div>
                      <div>
                        <div className="text-[9px] font-sans font-bold uppercase tracking-widest text-muted-foreground">Left Eye</div>
                        <div className="text-3xl font-display text-primary mt-1">{leftEyeResult}</div>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-primary/10 flex justify-between text-[10px] font-sans font-bold uppercase">
                      <span className="text-muted-foreground">Required</span>
                      <span className="text-primary">{requiredAcuity}</span>
                    </div>
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-sm border ${color} border-current bg-current/10`}>
                      <Icon size={14} />
                      <span className="font-sans font-bold text-[10px] uppercase tracking-widest">{status}</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => { setCurrentRow(0); setPhase('TEST_RIGHT'); }} className="flex-1 text-[10px] uppercase tracking-widest">Re-Test</Button>
                    <Button onClick={handleFinish} variant="liquid-glass" className="flex-1 text-[10px] uppercase tracking-widest shadow-glow-gold">Accept Result</Button>
                  </div>
                  <p className="text-[9px] text-muted-foreground/50 italic">Screening-grade. Visit ophthalmologist for clinical assessment.</p>
                </>
              );
            })()}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function CalibrationStep({ onCalibrated }: { onCalibrated: (px: number) => void }) {
  const [cardWidthPx, setCardWidthPx] = useState(320);
  const sliderRef = useRef<HTMLInputElement>(null);

  return (
    <div className="max-w-md w-full text-center space-y-6">
      <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
        <Ruler size={32} className="text-primary" />
      </div>
      <h3 className="text-2xl font-display">Screen Calibration</h3>
      <p className="text-sm text-muted-foreground">
        Hold a credit card or Aadhaar card against the screen. Adjust the slider until the outline matches your card exactly.
      </p>

      <div className="flex justify-center py-6">
        <div
          style={{ width: `${cardWidthPx}px`, height: `${cardWidthPx * 0.6306}px` }}
          className="border-2 border-dashed border-primary rounded-lg flex items-center justify-center bg-primary/5 transition-all"
        >
          <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-primary/60">
            Credit Card Size
          </span>
        </div>
      </div>

      <input
        ref={sliderRef}
        type="range"
        min={200}
        max={500}
        value={cardWidthPx}
        onChange={(e) => setCardWidthPx(Number(e.target.value))}
        className="w-full accent-primary"
      />

      <Button
        onClick={() => onCalibrated(cardWidthPx)}
        variant="liquid-glass"
        className="w-full h-12 font-sans font-bold uppercase text-[11px] tracking-widest shadow-glow-gold"
      >
        Confirm Calibration & Start Test
      </Button>
    </div>
  );
}
