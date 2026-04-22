/**
 * CADET PROTOCOL — Self-Assessment Checklist
 * For conditions that require self-reporting:
 * - Sweaty palms (Hyperhidrosis) — general.dermatological
 * - Varicose veins — cardio.vascular
 * - Skin conditions — general.dermatological
 * - Stammering / Speech issues
 * - Flat foot grading
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { X, ClipboardCheck, ShieldCheck, ShieldAlert, ShieldX, AlertTriangle } from 'lucide-react';

interface SelfAssessmentProps {
  onComplete: (result: { value: string; status: 'FIT' | 'UNFIT' | 'BORDERLINE'; raw: string; flags: string[] }) => void;
  onClose: () => void;
}

interface AssessmentItem {
  id: string;
  question: string;
  options: { value: string; label: string; risk: 'none' | 'low' | 'high' }[];
  standardsRef: string;
}

const ASSESSMENT_ITEMS: AssessmentItem[] = [
  {
    id: 'sweaty_palms',
    question: 'Do you experience excessively sweaty palms?',
    options: [
      { value: 'no', label: 'No — palms are dry', risk: 'none' },
      { value: 'occasionally', label: 'Occasionally when nervous', risk: 'low' },
      { value: 'frequently', label: 'Yes — frequently sweaty', risk: 'high' },
    ],
    standardsRef: 'general.dermatological.hyperhidrosisSweatyPalmsPermitted',
  },
  {
    id: 'varicose_veins',
    question: 'Do you have visible varicose veins on your legs?',
    options: [
      { value: 'none', label: 'No visible veins', risk: 'none' },
      { value: 'mild', label: 'Mild, barely visible (Grade I)', risk: 'low' },
      { value: 'moderate', label: 'Visible, somewhat prominent (Grade II)', risk: 'high' },
      { value: 'severe', label: 'Very prominent, bulging (Grade III)', risk: 'high' },
    ],
    standardsRef: 'cardio.vascular.varicoseVeinsAcceptedGrades',
  },
  {
    id: 'flat_foot',
    question: 'How would you describe your foot arch (check by wet footprint test)?',
    options: [
      { value: 'normal', label: 'Normal arch visible', risk: 'none' },
      { value: 'grade1', label: 'Slight flattening (Grade 1)', risk: 'low' },
      { value: 'grade2', label: 'Moderate flattening (Grade 2)', risk: 'high' },
      { value: 'grade3', label: 'Complete flat / no arch (Grade 3)', risk: 'high' },
    ],
    standardsRef: 'orthopaedic.flatFoot.acceptedGrades',
  },
  {
    id: 'skin_condition',
    question: 'Do you have any significant skin conditions?',
    options: [
      { value: 'none', label: 'No skin issues', risk: 'none' },
      { value: 'mild', label: 'Minor acne/dry skin', risk: 'none' },
      { value: 'psoriasis', label: 'Psoriasis (patches present)', risk: 'high' },
      { value: 'eczema', label: 'Eczema / Dermatitis', risk: 'low' },
    ],
    standardsRef: 'general.dermatological.extensivePsoriasisPermitted',
  },
  {
    id: 'stammering',
    question: 'Do you have any speech difficulties or stammering?',
    options: [
      { value: 'no', label: 'No — fluent speech', risk: 'none' },
      { value: 'occasional', label: 'Occasional under stress', risk: 'low' },
      { value: 'frequent', label: 'Frequent stammering', risk: 'high' },
    ],
    standardsRef: 'general (speech impediment)',
  },
  {
    id: 'hernia',
    question: 'Have you ever been diagnosed with a hernia?',
    options: [
      { value: 'no', label: 'No', risk: 'none' },
      { value: 'treated', label: 'Yes, but surgically treated', risk: 'low' },
      { value: 'present', label: 'Yes, currently present', risk: 'high' },
    ],
    standardsRef: 'general.hernia',
  },
];

export default function SelfAssessment({ onComplete, onClose }: SelfAssessmentProps) {
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);

  const setResponse = (id: string, value: string) => {
    setResponses(prev => ({ ...prev, [id]: value }));
  };

  const allAnswered = ASSESSMENT_ITEMS.every(item => responses[item.id]);

  const getFlags = (): string[] => {
    const flags: string[] = [];
    ASSESSMENT_ITEMS.forEach(item => {
      const response = responses[item.id];
      if (!response) return;
      const option = item.options.find(o => o.value === response);
      if (option && option.risk === 'high') {
        flags.push(`${item.question.split('?')[0]} — ${option.label}`);
      }
    });
    return flags;
  };

  const getStatus = (): 'FIT' | 'UNFIT' | 'BORDERLINE' => {
    const flags = getFlags();
    if (flags.length === 0) return 'FIT';
    const hasHigh = ASSESSMENT_ITEMS.some(item => {
      const r = responses[item.id];
      return item.options.find(o => o.value === r)?.risk === 'high';
    });
    return hasHigh ? 'UNFIT' : 'BORDERLINE';
  };

  const handleValidate = () => {
    if (!allAnswered) {
      toast.error('Please answer all questions.');
      return;
    }
    setShowResult(true);
  };

  const handleFinish = () => {
    const flags = getFlags();
    const status = getStatus();
    onComplete({
      value: `${flags.length} flag${flags.length !== 1 ? 's' : ''}`,
      status,
      raw: `Self-Assessment: ${flags.length === 0 ? 'All clear' : flags.join('; ')}`,
      flags,
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
          <div className="font-sans font-bold text-[10px] uppercase tracking-[0.4em] text-primary">Self Report</div>
          <h2 className="text-xl font-display text-foreground">Self-Assessment Checklist</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}><X size={20} /></Button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {!showResult ? (
          <div className="max-w-lg mx-auto space-y-6">
            <p className="text-sm text-muted-foreground text-center">
              Answer honestly. This flags conditions for professional verification —
              it does not render final fitness verdicts.
            </p>
            {ASSESSMENT_ITEMS.map((item, i) => (
              <div key={item.id} className="glass-panel p-5 space-y-3">
                <Label className="font-sans font-bold text-xs text-foreground">
                  {i + 1}. {item.question}
                </Label>
                <Select value={responses[item.id]} onValueChange={v => setResponse(item.id, v)}>
                  <SelectTrigger className="bg-background/40 border-primary/20">
                    <SelectValue placeholder="Select response" />
                  </SelectTrigger>
                  <SelectContent>
                    {item.options.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
            <Button
              onClick={handleValidate}
              disabled={!allAnswered}
              variant="liquid-glass"
              className="w-full h-12 font-sans font-bold uppercase text-[11px] tracking-widest shadow-glow-gold"
            >
              <ClipboardCheck size={16} className="mr-2" /> Submit Assessment
            </Button>
          </div>
        ) : (
          <div className="max-w-md mx-auto text-center space-y-6">
            {(() => {
              const flags = getFlags();
              const status = getStatus();
              const Icon = status === 'FIT' ? ShieldCheck : status === 'BORDERLINE' ? ShieldAlert : ShieldX;
              const color = status === 'FIT' ? 'text-green-400' : status === 'BORDERLINE' ? 'text-yellow-400' : 'text-red-400';
              return (
                <>
                  <div className={`w-20 h-20 rounded-full border-2 flex items-center justify-center mx-auto ${color} border-current bg-current/10`}>
                    <Icon size={36} />
                  </div>
                  <h3 className="text-2xl font-display">Self-Assessment Result</h3>
                  {flags.length > 0 ? (
                    <div className="glass-panel p-5 text-left space-y-2">
                      <div className="flex items-center gap-2 text-warning mb-3">
                        <AlertTriangle size={16} />
                        <span className="font-sans font-bold text-[10px] uppercase tracking-widest">{flags.length} Condition{flags.length > 1 ? 's' : ''} Flagged</span>
                      </div>
                      {flags.map((f, i) => (
                        <div key={i} className="text-sm text-muted-foreground border-l-2 border-warning/30 pl-3 py-1">{f}</div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-green-400">All conditions clear. No flags raised.</p>
                  )}
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setShowResult(false)} className="flex-1 text-[10px] uppercase tracking-widest">Edit</Button>
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
