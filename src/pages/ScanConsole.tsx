/**
 * CADET PROTOCOL — Assessment Theatre (ScanConsole)
 * 
 * COMPLETE REWRITE: Modular test launcher dashboard.
 * Tier 1: Self-testable parameters via camera/audio/screen/manual input
 * Tier 2: Clinical referrals for parameters requiring hospital equipment
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AppShell } from "@/components/cadet/AppShell";
import { Button } from "@/components/ui/button";
import { SELF_TESTS, CLINICAL_REFERRALS, TestConfig, TestStatus } from "@/data/test-config";
import { CADET_MEDICAL_DATABASE, ServiceBranch, Gender } from "@/data/medical-standards";
import { ISHIHARA_SEQUENCE, calculateCPVerdict } from "@/lib/color-vision";
import { toast } from "sonner";
import {
  ShieldCheck, ShieldAlert, ShieldX, Activity, MapPin, FileText, ChevronRight,
  CheckCircle2, Circle, Clock, Download, Hospital,
} from "lucide-react";

// Lazy imports for test components
import PoseTest from "@/components/tests/PoseTest";
import SnellenTest from "@/components/tests/SnellenTest";
import HearingTest from "@/components/tests/HearingTest";
import AnthropometricInput from "@/components/tests/AnthropometricInput";
import TremorTest from "@/components/tests/TremorTest";
import SelfAssessment from "@/components/tests/SelfAssessment";

// CP-Matrix (Ishihara) - reuse existing system
import { Document, Page, pdfjs } from "react-pdf";
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { Timer, Mic, MicOff } from "lucide-react";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface TestResult {
  testId: string;
  value: string;
  status: 'FIT' | 'UNFIT' | 'BORDERLINE';
  raw: string;
  completedAt: string;
}

export default function ScanConsole() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});
  const [activeTest, setActiveTest] = useState<string | null>(null);
  const [savedResults, setSavedResults] = useState<any[]>([]);

  // CP-Matrix state (reuse existing)
  const [colorTestActive, setColorTestActive] = useState(false);
  const [currentPlateIndex, setCurrentPlateIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(6);
  const [userResponses, setUserResponses] = useState<any[]>([]);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = { current: null as any };

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: p }, { data: r }] = await Promise.all([
        supabase.from("candidate_profiles").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("assessment_results").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      ]);
      setProfile(p);
      setSavedResults(r || []);
    })();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-sans font-bold text-xs uppercase tracking-widest text-primary animate-breathe">
        SYNCING
      </div>
    );
  }
  if (!user) { navigate("/auth"); return null; }

  // Derive AFMS standards for this candidate
  const gender = (profile?.gender || 'Male') as Gender;
  const service = profile?.target_service || 'ARMY';
  const branchKey: ServiceBranch = service === 'AIR_FORCE' ? 'AirForce_Flying' : service === 'NAVY' ? 'Navy_General' : 'Army_Combat';
  const standards = CADET_MEDICAL_DATABASE[branchKey]?.[gender];

  const getTestStatus = (testId: string): TestStatus => {
    if (testResults[testId]) return 'COMPLETED';
    if (activeTest === testId) return 'IN_PROGRESS';
    return 'NOT_STARTED';
  };

  const completedCount = Object.keys(testResults).length;
  const totalSelfTests = SELF_TESTS.length;

  // Save result to Supabase
  const saveResult = async (testId: string, result: TestResult) => {
    const { error } = await supabase.from("assessment_results").insert({
      user_id: user.id,
      parameter: SELF_TESTS.find(t => t.id === testId)?.name || testId,
      measured_value: result.raw,
      status: result.status,
      notes: `Self-assessed via Cadet Protocol. ${result.value}`,
    });
    if (error) toast.error("Failed to save: " + error.message);
  };

  const handleTestComplete = (testId: string, result: Omit<TestResult, 'testId' | 'completedAt'>) => {
    const fullResult: TestResult = {
      ...result,
      testId,
      completedAt: new Date().toISOString(),
    };
    setTestResults(prev => ({ ...prev, [testId]: fullResult }));
    setActiveTest(null);
    saveResult(testId, fullResult);
    toast.success(`${SELF_TESTS.find(t => t.id === testId)?.shortName || testId} — ${result.status}`);
  };

  const launchTest = (testId: string) => {
    if (testId === 'COLOUR_VISION') {
      startColorTest();
      return;
    }
    setActiveTest(testId);
  };

  // ── CP-Matrix Logic (Reuse existing) ──────────────────────────
  const startColorTest = () => {
    setColorTestActive(true);
    setCurrentPlateIndex(0);
    setTimeLeft(6);
    setUserResponses([]);
    toast.info("CP-Matrix Initialization: Hand-free voice mode active.");
    initSpeechRecognition();
  };

  const initSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Voice recognition not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-IN'; // Better for Indian accents
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
      handleVoiceResponse(transcript);
    };

    recognition.onstart = () => {
      setIsListening(true);
      console.log("Voice recognition active");
    };

    recognition.onend = () => {
      setIsListening(false);
      // Auto-restart if the test is still active
      if (colorTestActive && recognitionRef.current) {
        setTimeout(() => {
          try {
            recognitionRef.current?.start();
          } catch (e) {
            console.error("Auto-restart failed:", e);
          }
        }, 1000);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === 'not-allowed') {
        toast.error("Microphone access denied. Please check site permissions.");
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (e) {
      console.error("Manual start failed:", e);
    }
  };

  const handleVoiceResponse = (text: string) => {
    const match = text.match(/\d+/) || (text.includes('nothing') ? ['nothing'] : null);
    if (match) {
      const response = match[0];
      const plate = ISHIHARA_SEQUENCE[currentPlateIndex];
      const isCorrect = String(response) === String(plate.correctDigit);
      const newResponse = { plateId: plate.id, response, correct: isCorrect };
      setUserResponses(prev => [...prev.filter(r => r.plateId !== plate.id), newResponse]);
      toast.success(`Plate ${plate.id} captured: ${response}`, { duration: 1000 });
    }
  };

  useEffect(() => {
    let interval: any;
    if (colorTestActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (colorTestActive && timeLeft === 0) {
      if (currentPlateIndex < ISHIHARA_SEQUENCE.length - 1) {
        setCurrentPlateIndex(idx => idx + 1);
        setTimeLeft(6);
      } else {
        finishColorTest();
      }
    }
    return () => clearInterval(interval);
  }, [colorTestActive, timeLeft, currentPlateIndex]);

  const finishColorTest = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    setColorTestActive(false);
    const correctCount = userResponses.filter(r => r.correct).length;
    const verdict = calculateCPVerdict(correctCount, ISHIHARA_SEQUENCE.length);
    const resultString = `CV Standard: ${verdict} (${correctCount}/${ISHIHARA_SEQUENCE.length} correct)`;
    handleTestComplete('COLOUR_VISION', {
      value: resultString,
      status: verdict === 'CP-I' || verdict === 'CP-II' ? 'FIT' : 'UNFIT',
      raw: `Colour Vision: ${verdict}. ${correctCount}/${ISHIHARA_SEQUENCE.length} plates correct.`,
    });
  };
  // ── End CP-Matrix ─────────────────────────────────────────────

  return (
    <AppShell candidateBadge={profile ? {
      name: profile.full_name, code: profile.candidate_code,
      service: profile.target_service, scheme: profile.entry_scheme,
    } : null}>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="font-sans font-bold text-[10px] uppercase tracking-[0.3em] text-primary mb-3">
            MODULE C : COMPREHENSIVE ASSESSMENT
          </div>
          <h1 className="font-display text-4xl md:text-5xl text-foreground mb-2 tracking-tight">
            Assessment Theatre
          </h1>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            Complete self-assessable tests below. Parameters requiring clinical equipment are listed for Command Hospital referral.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="glass-panel p-5 mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="font-sans font-bold text-[10px] uppercase tracking-widest text-primary">
              Self-Assessment Progress
            </span>
            <span className="font-display text-lg text-primary">
              {completedCount}/{totalSelfTests}
            </span>
          </div>
          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full shadow-glow-gold"
              initial={{ width: 0 }}
              animate={{ width: `${(completedCount / totalSelfTests) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* TIER 1: Self-Assessment Tests */}
        <div className="mb-6">
          <div className="font-sans font-bold text-[10px] uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
            <Activity size={14} />
            Self-Assessment Tests
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SELF_TESTS.map((test, i) => (
              <motion.div
                key={test.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <TestCard
                  test={test}
                  status={getTestStatus(test.id)}
                  result={testResults[test.id]}
                  onLaunch={() => launchTest(test.id)}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* TIER 2: Clinical Referrals */}
        <div className="mb-8">
          <div className="font-sans font-bold text-[10px] uppercase tracking-widest text-destructive/70 mb-4 flex items-center gap-2">
            <Hospital size={14} />
            Clinical Referral Required
          </div>
          <div className="glass-panel p-5 space-y-3">
            <p className="text-xs text-muted-foreground mb-4">
              These parameters require clinical equipment. Visit your nearest Command Hospital
              or Regimental Regimented for these evaluations.
            </p>
            <div className="grid md:grid-cols-2 gap-3">
              {CLINICAL_REFERRALS.map(ref => (
                <div key={ref.id} className="flex items-center gap-3 p-3 bg-background/30 border border-primary/5 rounded-sm">
                  <ref.icon size={16} className="text-muted-foreground/50 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-sans font-bold text-foreground truncate">{ref.name}</div>
                    <div className="text-[9px] text-muted-foreground">{ref.referralDept}</div>
                  </div>
                  <MapPin size={12} className="text-primary/40 flex-shrink-0" />
                </div>
              ))}
            </div>
            <Button
              onClick={() => navigate('/hospitals')}
              variant="outline"
              className="w-full mt-4 font-sans font-bold uppercase text-[10px] tracking-widest border-primary/20"
            >
              <MapPin size={14} className="mr-2" /> Find Nearest Command Hospital
            </Button>
          </div>
        </div>

        {/* Assessment Summary / Download */}
        {completedCount >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel-strong p-6 text-center"
          >
            <div className="font-sans font-bold text-[10px] uppercase tracking-widest text-primary mb-3">
              Assessment Summary Available
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {completedCount} of {totalSelfTests} self-assessments completed.
              Generate your preliminary fitness report.
            </p>
            <Button
              onClick={() => navigate('/dashboard')}
              variant="liquid-glass"
              className="font-sans font-bold uppercase text-[11px] tracking-widest h-12 shadow-glow-gold"
            >
              <Download size={16} className="mr-2" /> Go to Dashboard for Report
            </Button>
          </motion.div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════
          TEST OVERLAYS
          ═══════════════════════════════════════════════ */}

      <AnimatePresence>
        {/* Pose Tests */}
        {activeTest === 'CARRY_ANGLE' && standards && (
          <PoseTest
            testType="CARRY_ANGLE"
            maxThreshold={standards.orthopaedic.carryAngle.maxDegrees}
            gender={gender}
            onComplete={(r) => handleTestComplete('CARRY_ANGLE', r)}
            onClose={() => setActiveTest(null)}
          />
        )}
        {activeTest === 'KNOCK_KNEE' && standards && (
          <PoseTest
            testType="KNOCK_KNEE"
            maxThreshold={standards.orthopaedic.genuValgum.maxInterMalleolarDistanceCm}
            gender={gender}
            onComplete={(r) => handleTestComplete('KNOCK_KNEE', r)}
            onClose={() => setActiveTest(null)}
          />
        )}

        {/* Vision Test */}
        {activeTest === 'VISION_ACUITY' && standards && (
          <SnellenTest
            requiredAcuity={standards.ophthalmological.visualAcuity.betterEyeUncorrected}
            onComplete={(r) => handleTestComplete('VISION_ACUITY', r)}
            onClose={() => setActiveTest(null)}
          />
        )}

        {/* Hearing Test */}
        {activeTest === 'HEARING' && standards && (
          <HearingTest
            maxAllowedDb={standards.audiological.pureToneAudiometry.maxDbHL}
            onComplete={(r) => handleTestComplete('HEARING', r)}
            onClose={() => setActiveTest(null)}
          />
        )}

        {/* Anthropometric Input */}
        {activeTest === 'ANTHROPOMETRIC' && standards && (
          <AnthropometricInput
            minHeight={standards.anthropometric.minHeightCm}
            minChestExpansion={standards.anthropometric.chestExpansionMinCm}
            bmiRange={standards.anthropometric.bmiRangeAllowed}
            gender={gender}
            onComplete={(r) => handleTestComplete('ANTHROPOMETRIC', r)}
            onClose={() => setActiveTest(null)}
          />
        )}

        {/* Tremor Test */}
        {activeTest === 'TREMOR' && (
          <TremorTest
            onComplete={(r) => handleTestComplete('TREMOR', r)}
            onClose={() => setActiveTest(null)}
          />
        )}

        {/* Self Assessment */}
        {activeTest === 'SELF_REPORT' && (
          <SelfAssessment
            onComplete={(r) => handleTestComplete('SELF_REPORT', r)}
            onClose={() => setActiveTest(null)}
          />
        )}

        {/* Flat Foot → redirects to self assessment */}
        {activeTest === 'FLAT_FOOT' && (
          <SelfAssessment
            onComplete={(r) => handleTestComplete('FLAT_FOOT', r)}
            onClose={() => setActiveTest(null)}
          />
        )}
      </AnimatePresence>

      {/* CP-Matrix Ishihara Overlay (existing) */}
      <AnimatePresence>
        {colorTestActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-2xl flex flex-col items-center justify-start p-6 pt-32 pb-12 overflow-y-auto"
          >
            <div className="absolute top-8 left-8 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full border border-primary/20 flex items-center justify-center bg-primary/5">
                <Timer className="text-primary animate-pulse" size={20} />
              </div>
              <div>
                <div className="text-[10px] font-sans font-bold uppercase tracking-widest text-primary/60">Transition Lock</div>
                <div className="text-2xl font-display text-primary">{timeLeft}s</div>
              </div>
            </div>

            <div className="absolute top-8 right-8 flex items-center gap-4 text-right">
              <div>
                <div className="text-[10px] font-sans font-bold uppercase tracking-widest text-primary/60">Voice Link</div>
                <div className="text-sm font-sans font-bold text-foreground flex items-center gap-2">
                  {isListening ? "LISTENING..." : "RECONNECTING..."}
                  {!isListening && (
                    <button 
                      onClick={() => initSpeechRecognition()}
                      className="text-[9px] text-primary hover:underline"
                    >
                      (Retry)
                    </button>
                  )}
                </div>
              </div>
              <div className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all ${isListening ? 'border-green-500/40 bg-green-500/5' : 'border-destructive/40 bg-destructive/5'}`}>
                {isListening ? <Mic className="text-green-500" size={20} /> : <MicOff className="text-destructive" size={20} />}
              </div>
            </div>

            <div className="max-w-2xl w-full text-center space-y-8">
              <div className="space-y-2">
                <div className="font-sans font-bold text-[10px] uppercase tracking-[0.4em] text-primary">
                  Module C : Colour Perception Matrix
                </div>
                <h2 className="text-3xl font-display tracking-tight text-foreground">
                  Ishihara Plate {currentPlateIndex + 1} / {ISHIHARA_SEQUENCE.length}
                </h2>
              </div>

              <motion.div
                key={currentPlateIndex}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="aspect-square w-full max-w-md mx-auto rounded-full overflow-hidden border-4 border-primary/20 shadow-glow-gold bg-black/40 relative group flex items-center justify-center p-0"
              >
                <div className="pdf-plate-container scale-[1.1]">
                  <Document
                    file="/assets/ishihara/Ishihara_Tests.pdf"
                    loading={<Activity className="animate-spin text-primary" size={32} />}
                    error={<div className="text-destructive font-sans font-bold text-xs">FILE_ERROR</div>}
                  >
                    <Page
                      pageNumber={ISHIHARA_SEQUENCE[currentPlateIndex].pageNumber}
                      width={400}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      className="rounded-full overflow-hidden"
                    />
                  </Document>
                </div>
              </motion.div>

              <div className="grid grid-cols-6 gap-2 max-w-sm mx-auto">
                {ISHIHARA_SEQUENCE.map((_, i) => (
                  <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i === currentPlateIndex ? 'bg-primary w-full' : i < currentPlateIndex ? 'bg-primary/40' : 'bg-white/10'}`} />
                ))}
              </div>

              <Button variant="outline" onClick={finishColorTest} className="font-sans font-bold text-[10px] uppercase tracking-widest border-primary/20 hover:bg-primary/10">
                Terminate Assessment Early
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}

// ─── Test Card Component ──────────────────────────────────────

function TestCard({
  test, status, result, onLaunch,
}: {
  test: TestConfig; status: TestStatus; result?: TestResult; onLaunch: () => void;
}) {
  const Icon = test.icon;
  const isCompleted = status === 'COMPLETED';

  const statusBadge = {
    NOT_STARTED: { icon: Circle, color: 'text-muted-foreground/30', label: 'Not Started' },
    IN_PROGRESS: { icon: Activity, color: 'text-primary animate-pulse', label: 'In Progress' },
    COMPLETED: {
      icon: result?.status === 'FIT' ? ShieldCheck : result?.status === 'BORDERLINE' ? ShieldAlert : ShieldX,
      color: result?.status === 'FIT' ? 'text-green-400' : result?.status === 'BORDERLINE' ? 'text-yellow-400' : 'text-red-400',
      label: result?.status || 'Done',
    },
    SKIPPED: { icon: Circle, color: 'text-muted-foreground/30', label: 'Skipped' },
  }[status];

  return (
    <div className={`glass-panel p-5 flex flex-col h-full transition-all hover:border-primary/20 ${isCompleted ? 'border-primary/10' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-sm border border-primary/10 flex items-center justify-center bg-background/40">
          <Icon size={18} className="text-primary" />
        </div>
        <div className={`flex items-center gap-1.5 ${statusBadge.color}`}>
          <statusBadge.icon size={14} />
          <span className="font-sans font-bold text-[9px] uppercase tracking-widest">{statusBadge.label}</span>
        </div>
      </div>

      <div className="flex-1">
        <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-foreground mb-1">{test.shortName}</h3>
        <p className="text-[11px] text-muted-foreground leading-relaxed mb-2">{test.description}</p>
        <div className="flex items-center gap-3 text-[9px] text-muted-foreground/60">
          <span className="flex items-center gap-1"><Clock size={10} /> {test.duration}</span>
          <span className="uppercase tracking-wider">{test.method.replace('_', ' ')}</span>
        </div>
      </div>

      {result && (
        <div className="mt-3 p-2 bg-background/30 border border-primary/5 rounded-sm">
          <div className="text-[10px] font-sans font-bold text-foreground truncate">{result.value}</div>
        </div>
      )}

      <Button
        onClick={onLaunch}
        variant={isCompleted ? "outline" : "liquid-glass"}
        className="w-full mt-4 font-sans font-bold uppercase text-[10px] tracking-widest h-10"
      >
        {isCompleted ? 'Re-Test' : 'Start Test'}
        <ChevronRight size={14} className="ml-1" />
      </Button>
    </div>
  );
}
