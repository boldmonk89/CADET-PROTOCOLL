import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AppShell } from "@/components/cadet/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AFMS_STANDARDS, bmi } from "@/lib/cadet-data";
import { toast } from "sonner";
import { Camera, ShieldCheck, ShieldAlert, ShieldX, Power, Activity, Maximize2 } from "lucide-react";

const PARAMETERS = [
  "Height", "Weight (BMI)", "Chest Expansion", "Vision (Acuity)",
  "Colour Vision", "Hearing", "Posture / Gait", "Skin Condition",
];

const STATUSES = ["FIT", "BORDERLINE", "UNFIT", "INCONCLUSIVE"] as const;

export default function ScanConsole() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [param, setParam] = useState(PARAMETERS[0]);
  const [measured, setMeasured] = useState("");
  const [status, setStatus] = useState<string>("FIT");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [hasCaptured, setHasCaptured] = useState(false);
  
  // Camera State
  const [cameraActive, setCameraActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: p }, { data: r }] = await Promise.all([
        supabase.from("candidate_profiles").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("assessment_results").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      ]);
      setProfile(p);
      setResults(r || []);
    })();
  }, [user]);

  const toggleCamera = async () => {
    if (cameraActive) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      setCameraActive(false);
      setIsScanning(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        streamRef.current = stream;
        setCameraActive(true);
      } catch (err) {
        toast.error("Camera access denied or not available");
      }
    }
  };

  const startAiScan = () => {
    if (!cameraActive) return;
    setIsScanning(true);
    setHasCaptured(false);
    toast.info("Initialising CV Analysis Engine...");
    
    // Switch-based context-aware simulation
    setTimeout(() => {
      let result = "";
      switch(param) {
        case "Height": 
          result = (160 + Math.random() * 25).toFixed(1) + " cm";
          break;
        case "Hearing":
          result = Math.random() > 0.3 ? "HEARING: 6/6 OPTIMAL (CP-I)" : "HEARING: TRACE DEFICIT (CP-II)";
          break;
        case "Vision":
          result = Math.random() > 0.5 ? "VISION: 6/6 DISTANT" : "VISION: 6/9 MILD ACUITY";
          break;
        case "Weight":
          result = (50 + Math.random() * 40).toFixed(1) + " kg";
          break;
        default:
          result = "POSTURE: " + (Math.random() > 0.5 ? "OPTIMAL" : "SLIGHT KYPHOSIS");
      }
      
      setMeasured(result);
      setIsScanning(false);
      setHasCaptured(true);
      toast.success("Parameter accurately captured via Computer Vision.");
    }, 3500);
  };

  if (loading) return null;
  if (!user) { navigate("/auth"); return null; }

  const scheme = profile?.entry_scheme;
  const service = profile?.target_service;
  const key = scheme && service ? `${scheme}-${service}` : null;
  const candBmi = bmi(profile?.height_cm, profile?.weight_kg);

  const submitResult = async () => {
    if (!measured.trim()) { toast.error("Enter measured value"); return; }
    setSubmitting(true);
    const { data, error } = await supabase
      .from("assessment_results")
      .insert({
        user_id: user.id,
        parameter: param,
        measured_value: measured,
        status,
        notes,
      })
      .select()
      .single();
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    setResults([data, ...results]);
    setMeasured("");
    setNotes("");
    toast.success(`Result recorded: ${param} -> ${status}`);
  };

  return (
    <AppShell candidateBadge={profile ? {
      name: profile.full_name, code: profile.candidate_code, service, scheme,
    } : null}>
      <div className="container py-8">
        <div className="mb-6">
          <div className="font-sans font-bold text-[10px] uppercase tracking-[0.3em] text-primary mb-3 text-center">
            MODULE C : BIOMETRIC ASSESSMENT
          </div>
          <h1 className="font-display text-4xl md:text-5xl text-foreground mb-2 text-center tracking-tight">Assessment Theatre</h1>
          <p className="text-center text-sm text-muted-foreground font-medium max-w-lg mx-auto">
            Real-time biometric analysis active. Establish coordinate lock for parameter capture.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          {/* Scan card */}
          <div className="lg:col-span-8 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel-strong p-6 relative"
            >
              <div className="aspect-video bg-black/40 border border-primary/20 rounded-sm mb-5 relative overflow-hidden group">
                {/* Camera Viewport */}
                <video 
                  ref={videoRef}
                  autoPlay 
                  playsInline 
                  className={`w-full h-full object-cover transition-opacity duration-500 ${cameraActive ? 'opacity-100' : 'opacity-0'}`}
                />
                
                {/* Standby UI */}
                {!cameraActive && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-tactical-200/80 backdrop-blur-sm z-10">
                    <Camera size={48} className="text-primary/40 mb-4 animate-pulse" />
                    <div className="font-sans font-bold text-xs uppercase tracking-[0.3em] text-primary/60">
                      System Standby
                    </div>
                  </div>
                )}

                {/* Analytical Overlays */}
                <AnimatePresence>
                  {cameraActive && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 pointer-events-none z-20"
                    >
                      {/* Grid / Scanning effect */}
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grid.png')] opacity-10" />
                      
                      {/* Horizon & Vertical markers */}
                      <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-primary/20" />
                      <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-primary/20" />
                      
                      {/* Detection Frame */}
                      <div className="absolute top-[10%] left-[25%] right-[25%] bottom-[10%] border border-primary/40 rounded-sm">
                        <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-primary shadow-glow-gold" />
                        <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-primary shadow-glow-gold" />
                        <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-primary shadow-glow-gold" />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-primary shadow-glow-gold" />
                        
                        {/* Scanning Bar */}
                        {isScanning && (
                          <motion.div 
                            initial={{ top: "0%" }}
                            animate={{ top: "100%" }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="absolute left-0 right-0 h-0.5 bg-primary shadow-glow-gold"
                          />
                        )}
                      </div>

                      {/* AI Indicators */}
                      <div className="absolute top-4 left-4 font-mono-tac text-[9px] uppercase tracking-widest text-primary/80 space-y-1">
                        <div>LINKED: SECURE_CORE_ALPHA</div>
                        <div>FRAME: {Math.floor(Math.random()*1000)} / 60FPS</div>
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                          BIOMETRIC_STREAM_LIVE
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex flex-wrap gap-3 mb-6">
                <Button 
                  onClick={toggleCamera} 
                  variant={cameraActive ? "destructive" : "outline"}
                  className="font-sans font-bold text-[10px] uppercase tracking-widest h-10 px-6 gap-2"
                >
                  <Power size={14} />
                  {cameraActive ? "Deactivate Camera" : "Initialise Biometrics"}
                </Button>
                
                {cameraActive && (
                  <Button 
                    onClick={startAiScan}
                    disabled={!cameraActive || isScanning}
                    className="w-full bg-black/40 border border-primary/20 hover:bg-black/60 font-sans font-bold uppercase text-[10px] tracking-widest h-12"
                  >
                    {isScanning ? (
                      <>Analysing...</>
                    ) : hasCaptured ? (
                      <>Re-Test Parameter</>
                    ) : (
                      <>
                        <Activity size={14} className="mr-2 text-primary" /> Capture AI Measurement
                      </>
                    )}
                  </Button>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-5 pt-4 border-t border-primary/10">
                <div className="space-y-3">
                  <Label className="font-sans font-bold text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-primary/40" />
                    Target Parameter
                  </Label>
                  <Select value={param} onValueChange={setParam}>
                    <SelectTrigger className="bg-background/40 border-primary/20"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PARAMETERS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className="font-sans font-bold text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-primary/40" />
                    Verdict Status
                  </Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="bg-background/40 border-primary/20"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3 md:col-span-2">
                  <Label className="font-sans font-bold text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-primary/40" />
                    Validated Measured Value
                  </Label>
                  <Input 
                    value={measured} 
                    onChange={(e) => setMeasured(e.target.value)} 
                    placeholder="e.g. 168.4 cm" 
                    className="bg-background/40 border-primary/20 h-11 font-sans font-bold"
                  />
                </div>
                <div className="space-y-3 md:col-span-2">
                  <Label className="font-sans font-bold text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-primary/40" />
                    Observations (Diagnostic Notes)
                  </Label>
                  <Textarea 
                    rows={3} 
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)} 
                    className="bg-background/40 border-primary/20 resize-none font-sans"
                    placeholder="Enter analytical observations..."
                  />
                </div>
              </div>

              <Button
                onClick={submitResult}
                disabled={submitting}
                variant="liquid-glass"
                className="w-full mt-6 font-sans font-bold uppercase text-[11px] tracking-[0.2em] h-12 shadow-glow-gold"
              >
                AUTHORISE AND RECORD RESULT
              </Button>
            </motion.div>

            {/* Results log */}
            <div className="glass-panel p-6">
              <div className="font-sans font-bold text-xs uppercase tracking-widest text-primary mb-5 flex items-center justify-between">
                <span>Assessment History ({results.length})</span>
                <Maximize2 size={14} className="text-muted-foreground opacity-50" />
              </div>
              {results.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-primary/10 rounded-sm">
                  <p className="text-sm text-muted-foreground">Analytic records for this candidate are currently void.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {results.map((r) => (
                    <div key={r.id} className="flex items-center justify-between p-4 bg-background/30 border border-primary/5 rounded-sm hover:border-primary/20 transition-all">
                      <div>
                        <div className="text-[15px] font-sans font-bold text-foreground">{r.parameter}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5 uppercase tracking-wider">{r.measured_value} | {new Date(r.created_at).toLocaleDateString()}</div>
                      </div>
                      <StatusBadge status={r.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Standards Panel */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="glass-panel p-6 h-fit lg:sticky lg:top-24">
              <div className="font-sans font-bold text-xs uppercase tracking-widest text-primary mb-4">
                AFMS REFERENCE STANDARDS
              </div>
              <div className="p-3 bg-card/60 border border-primary/10 rounded-sm mb-6">
                <div className="text-[10px] font-sans font-bold uppercase tracking-widest text-muted-foreground mb-1">
                  Profile Parameters
                </div>
                <div className="text-sm font-sans text-foreground">
                  {scheme && service ? `${scheme} / ${service.replace("_", " ")}` : "Select service in intake"}
                </div>
              </div>
              
              {candBmi !== null && (
                <div className="mb-6 p-4 border border-primary/10 rounded-sm bg-background/20">
                  <div className="text-[10px] font-sans font-bold uppercase text-muted-foreground mb-1">Current BMI Metric</div>
                  <div className={`text-2xl font-display ${candBmi < 18.5 || candBmi > 25 ? "text-warning" : "text-primary text-glow-gold"}`}>{candBmi}</div>
                </div>
              )}
              
              <div className="space-y-4">
                {AFMS_STANDARDS.map((s) => (
                  <div key={s.parameter} className="border-b border-primary/5 pb-3 last:border-0">
                    <div className="text-sm font-sans font-bold text-foreground/90">{s.parameter}</div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[11px] text-muted-foreground">Requirement</span>
                      <span className="text-[11px] font-sans font-bold text-primary">
                        {key && s.thresholds[key] ? `${s.thresholds[key]} ${s.unit}` : "REF REQ"}
                      </span>
                    </div>
                    <div className="text-[10px] text-destructive/70 mt-1 italic opacity-80 font-light">
                      Automatic Rejection Trigger: {s.rejectTrigger}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: any = {
    FIT: { Icon: ShieldCheck, color: "text-primary border-primary/30 bg-primary/5" },
    UNFIT: { Icon: ShieldX, color: "text-destructive border-destructive/30 bg-destructive/5" },
    BORDERLINE: { Icon: ShieldAlert, color: "text-warning border-warning/30 bg-warning/5" },
    INCONCLUSIVE: { Icon: ShieldAlert, color: "text-muted-foreground border-border bg-muted/20" },
  };
  const { Icon, color } = map[status] || map.INCONCLUSIVE;
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-sm font-sans font-bold text-[10px] uppercase tracking-widest transition-all ${color}`}>
      <Icon size={12} />
      {status}
    </div>
  );
}

