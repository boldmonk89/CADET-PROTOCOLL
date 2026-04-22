/**
 * CADET PROTOCOL — Anthropometric Manual Input
 * Height, Weight, BMI, Chest Expansion with AFMS validation.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { bmi } from '@/lib/cadet-data';
import { toast } from 'sonner';
import { X, Ruler, ShieldCheck, ShieldX, ShieldAlert } from 'lucide-react';

interface AnthropometricProps {
  minHeight: number;
  minChestExpansion: number;
  bmiRange: { min: number; max: number };
  gender: string;
  onComplete: (result: { value: string; status: 'FIT' | 'UNFIT' | 'BORDERLINE'; raw: string; height: number; weight: number; chest: number }) => void;
  onClose: () => void;
}

export default function AnthropometricInput({ minHeight, minChestExpansion, bmiRange, gender, onComplete, onClose }: AnthropometricProps) {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [chestRelaxed, setChestRelaxed] = useState('');
  const [chestExpanded, setChestExpanded] = useState('');
  const [showResult, setShowResult] = useState(false);

  const h = parseFloat(height);
  const w = parseFloat(weight);
  const cr = parseFloat(chestRelaxed);
  const ce = parseFloat(chestExpanded);
  const candidateBmi = bmi(h, w);
  const chestExpansion = (ce && cr) ? ce - cr : null;

  const validate = () => {
    if (!h || !w) {
      toast.error('Height and Weight are mandatory.');
      return;
    }
    if (h < 100 || h > 220) {
      toast.error('Height should be between 100-220 cm.');
      return;
    }
    if (w < 30 || w > 150) {
      toast.error('Weight should be between 30-150 kg.');
      return;
    }
    setShowResult(true);
  };

  const heightStatus = h >= minHeight ? 'FIT' : 'UNFIT';
  const bmiStatus = candidateBmi
    ? candidateBmi >= bmiRange.min && candidateBmi <= bmiRange.max
      ? 'FIT'
      : candidateBmi >= bmiRange.min - 1 && candidateBmi <= bmiRange.max + 2
        ? 'BORDERLINE'
        : 'UNFIT'
    : 'FIT';
  const chestStatus = chestExpansion !== null
    ? chestExpansion >= minChestExpansion ? 'FIT' : 'UNFIT'
    : 'FIT'; // Skip if not entered

  const overallStatus: 'FIT' | 'UNFIT' | 'BORDERLINE' =
    heightStatus === 'UNFIT' || bmiStatus === 'UNFIT' || chestStatus === 'UNFIT'
      ? 'UNFIT'
      : bmiStatus === 'BORDERLINE' ? 'BORDERLINE' : 'FIT';

  const handleAccept = () => {
    onComplete({
      value: `H:${h}cm W:${w}kg BMI:${candidateBmi}`,
      status: overallStatus,
      raw: `Height: ${h}cm, Weight: ${w}kg, BMI: ${candidateBmi}, Chest Expansion: ${chestExpansion ?? 'N/A'}cm`,
      height: h,
      weight: w,
      chest: chestExpansion ?? 0,
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
          <div className="font-sans font-bold text-[10px] uppercase tracking-[0.4em] text-primary">Manual Input</div>
          <h2 className="text-xl font-display text-foreground">Body Metrics Assessment</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}><X size={20} /></Button>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
        {!showResult ? (
          <div className="max-w-lg w-full space-y-6">
            <div className="text-center mb-4">
              <Ruler size={40} className="text-primary mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Use a measuring tape and weighing scale. Enter precise values.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-sans font-bold text-[9px] uppercase tracking-widest text-muted-foreground">Height (cm) *</Label>
                <Input type="number" step="0.1" value={height} onChange={e => setHeight(e.target.value)} placeholder="e.g. 168.5" className="bg-background/40 border-primary/20 h-11" />
                <div className="text-[9px] text-muted-foreground/60">Min: {minHeight} cm ({gender})</div>
              </div>
              <div className="space-y-2">
                <Label className="font-sans font-bold text-[9px] uppercase tracking-widest text-muted-foreground">Weight (kg) *</Label>
                <Input type="number" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} placeholder="e.g. 68.0" className="bg-background/40 border-primary/20 h-11" />
              </div>
              <div className="space-y-2">
                <Label className="font-sans font-bold text-[9px] uppercase tracking-widest text-muted-foreground">Chest Relaxed (cm)</Label>
                <Input type="number" step="0.1" value={chestRelaxed} onChange={e => setChestRelaxed(e.target.value)} placeholder="e.g. 77" className="bg-background/40 border-primary/20 h-11" />
              </div>
              <div className="space-y-2">
                <Label className="font-sans font-bold text-[9px] uppercase tracking-widest text-muted-foreground">Chest Expanded (cm)</Label>
                <Input type="number" step="0.1" value={chestExpanded} onChange={e => setChestExpanded(e.target.value)} placeholder="e.g. 82" className="bg-background/40 border-primary/20 h-11" />
                <div className="text-[9px] text-muted-foreground/60">Min expansion: {minChestExpansion} cm</div>
              </div>
            </div>

            {/* Live BMI */}
            {candidateBmi && (
              <div className="glass-panel p-4 flex items-center justify-between">
                <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-muted-foreground">Computed BMI</span>
                <span className={`text-2xl font-display ${candidateBmi < bmiRange.min || candidateBmi > bmiRange.max ? 'text-warning' : 'text-primary text-glow-gold'}`}>
                  {candidateBmi}
                </span>
              </div>
            )}

            <Button onClick={validate} variant="liquid-glass" className="w-full h-12 font-sans font-bold uppercase text-[11px] tracking-widest shadow-glow-gold">
              Validate Against AFMS Standards
            </Button>
          </div>
        ) : (
          <div className="max-w-md w-full text-center space-y-6">
            {(() => {
              const Icon = overallStatus === 'FIT' ? ShieldCheck : overallStatus === 'BORDERLINE' ? ShieldAlert : ShieldX;
              const color = overallStatus === 'FIT' ? 'text-green-400' : overallStatus === 'BORDERLINE' ? 'text-yellow-400' : 'text-red-400';
              return (
                <>
                  <div className={`w-20 h-20 rounded-full border-2 flex items-center justify-center mx-auto ${color} border-current bg-current/10`}>
                    <Icon size={36} />
                  </div>
                  <h3 className="text-2xl font-display">Body Metrics Assessment</h3>
                  <div className="glass-panel p-6 space-y-3">
                    <MetricRow label="Height" value={`${h} cm`} status={heightStatus} threshold={`Min ${minHeight} cm`} />
                    <MetricRow label="Weight" value={`${w} kg`} status="FIT" threshold="" />
                    <MetricRow label="BMI" value={`${candidateBmi}`} status={bmiStatus} threshold={`${bmiRange.min}–${bmiRange.max}`} />
                    {chestExpansion !== null && (
                      <MetricRow label="Chest Exp." value={`${chestExpansion} cm`} status={chestStatus} threshold={`Min ${minChestExpansion} cm`} />
                    )}
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setShowResult(false)} className="flex-1 text-[10px] uppercase tracking-widest">Edit</Button>
                    <Button onClick={handleAccept} variant="liquid-glass" className="flex-1 text-[10px] uppercase tracking-widest shadow-glow-gold">Accept</Button>
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

function MetricRow({ label, value, status, threshold }: { label: string; value: string; status: string; threshold: string }) {
  const color = status === 'FIT' ? 'text-green-400' : status === 'BORDERLINE' ? 'text-yellow-400' : 'text-red-400';
  return (
    <div className="flex items-center justify-between py-2 border-b border-primary/5 last:border-0">
      <div className="text-left">
        <div className="text-xs font-sans font-bold text-foreground">{label}</div>
        {threshold && <div className="text-[9px] text-muted-foreground">{threshold}</div>}
      </div>
      <div className="text-right">
        <div className={`text-lg font-display ${color}`}>{value}</div>
      </div>
    </div>
  );
}
