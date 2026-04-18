import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
import { Camera, ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";

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
    toast.success(`Result recorded: ${param} → ${status}`);
  };

  return (
    <AppShell candidateBadge={profile ? {
      name: profile.full_name, code: profile.candidate_code, service, scheme,
    } : null}>
      <div className="container py-8">
        <div className="mb-6">
          <div className="font-mono-tac text-xs uppercase tracking-widest text-primary mb-2">
            ■ MODULE C // BIOMETRIC SCAN CONSOLE
          </div>
          <h1 className="font-display text-3xl text-foreground mb-1">Assessment Theatre</h1>
          <p className="text-sm text-muted-foreground">
            Manual entry mode active. Camera scan integration is examiner-supervised.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Scan card */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel-strong corner-bracket p-6"
            >
              <div className="aspect-video bg-background/60 border border-primary/30 rounded-sm mb-5 flex flex-col items-center justify-center scanline relative overflow-hidden">
                <Camera size={48} className="text-primary/60 mb-3" />
                <div className="font-mono-tac text-xs uppercase tracking-widest text-muted-foreground">
                  CAMERA STANDBY // MANUAL ENTRY MODE
                </div>
                <div className="text-[10px] text-muted-foreground mt-1">
                  Examiner sign-off required for camera-assisted scans.
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-mono-tac text-[10px] uppercase tracking-widest text-muted-foreground">Parameter</Label>
                  <Select value={param} onValueChange={setParam}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PARAMETERS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="font-mono-tac text-[10px] uppercase tracking-widest text-muted-foreground">Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="font-mono-tac text-[10px] uppercase tracking-widest text-muted-foreground">Measured Value</Label>
                  <Input value={measured} onChange={(e) => setMeasured(e.target.value)} placeholder="e.g. 168.4 cm" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="font-mono-tac text-[10px] uppercase tracking-widest text-muted-foreground">Notes (optional)</Label>
                  <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>
              </div>

              <Button
                onClick={submitResult}
                disabled={submitting}
                className="w-full mt-5 bg-gradient-gold text-primary-foreground font-mono-tac uppercase text-xs tracking-widest"
              >
                ■ RECORD RESULT
              </Button>
            </motion.div>

            {/* Results log */}
            <div className="glass-panel p-5">
              <div className="font-mono-tac text-xs uppercase tracking-widest text-primary mb-3">
                ■ RESULTS LOG ({results.length})
              </div>
              {results.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No results recorded yet.</p>
              ) : (
                <div className="space-y-2">
                  {results.map((r) => (
                    <div key={r.id} className="flex items-center justify-between p-3 border border-border/50 rounded-sm">
                      <div>
                        <div className="text-sm">{r.parameter}</div>
                        <div className="text-xs text-muted-foreground">{r.measured_value} · {new Date(r.created_at).toLocaleString()}</div>
                      </div>
                      <StatusBadge status={r.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Standards Panel */}
          <aside className="glass-panel p-5 h-fit lg:sticky lg:top-24">
            <div className="font-mono-tac text-xs uppercase tracking-widest text-primary mb-3">
              ■ AFMS STANDARDS PANEL
            </div>
            <div className="text-[10px] font-mono-tac uppercase tracking-widest text-muted-foreground mb-4">
              {scheme && service ? `${scheme} // ${service.replace("_", " ")}` : "Complete intake to load standards"}
            </div>
            {candBmi !== null && (
              <div className="mb-4 p-2 border border-primary/20 rounded-sm">
                <div className="text-[10px] font-mono-tac uppercase text-muted-foreground">Your BMI</div>
                <div className={`text-lg font-display ${candBmi < 18.5 || candBmi > 25 ? "text-warning" : "text-success"}`}>{candBmi}</div>
              </div>
            )}
            <div className="space-y-3">
              {AFMS_STANDARDS.map((s) => (
                <div key={s.parameter} className="border-b border-border/40 pb-2 last:border-0">
                  <div className="text-xs font-medium">{s.parameter}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    {key && s.thresholds[key] ? `≥ ${s.thresholds[key]} ${s.unit}` : "—"}
                  </div>
                  <div className="text-[10px] text-destructive/80 mt-0.5">⚠ {s.rejectTrigger}</div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: any = {
    FIT: { Icon: ShieldCheck, color: "text-success border-success/40 bg-success/10" },
    UNFIT: { Icon: ShieldX, color: "text-destructive border-destructive/40 bg-destructive/10" },
    BORDERLINE: { Icon: ShieldAlert, color: "text-warning border-warning/40 bg-warning/10" },
    INCONCLUSIVE: { Icon: ShieldAlert, color: "text-muted-foreground border-border bg-muted/30" },
  };
  const { Icon, color } = map[status] || map.INCONCLUSIVE;
  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 border rounded-sm font-mono-tac text-[10px] uppercase tracking-widest ${color}`}>
      <Icon size={12} />
      {status}
    </div>
  );
}
