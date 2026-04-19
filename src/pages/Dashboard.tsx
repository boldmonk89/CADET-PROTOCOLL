import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AppShell } from "@/components/cadet/AppShell";
import { Button } from "@/components/ui/button";
import { bmi } from "@/lib/cadet-data";
import { generateMedicalCertificate } from "@/lib/certificate";
import { Activity, FileText, MapPin, Edit3, Lock, Users, Download, ShieldCheck } from "lucide-react";

export default function Dashboard() {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: p }, { data: r }] = await Promise.all([
        supabase.from("candidate_profiles").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("assessment_results").select("*").eq("user_id", user.id),
      ]);
      setProfile(p);
      setResults(r || []);
      setFetched(true);
    })();
  }, [user]);

  if (loading || !fetched) {
    return (
      <div className="min-h-screen flex items-center justify-center font-sans font-bold text-xs uppercase tracking-widest text-primary animate-breathe">
        SYNCING
      </div>
    );
  }
  if (!user) {
    navigate("/auth");
    return null;
  }

  const intakeDone = !!profile?.intake_completed_at;
  const candidateBmi = bmi(profile?.height_cm, profile?.weight_kg);
  const isExaminer = role === "examiner" || role === "admin";

  return (
    <AppShell candidateBadge={profile ? {
      name: profile.full_name,
      code: profile.candidate_code,
      service: profile.target_service,
      scheme: profile.entry_scheme,
    } : null}>
      <div className="container py-8">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="font-sans font-bold text-[10px] uppercase tracking-[0.3em] text-primary mb-3">
            MISSION CONTROL
          </div>
          <h1 className="font-display text-4xl md:text-5xl text-foreground mb-1 tracking-tight">
            {profile?.full_name ? `Welcome, ${profile.full_name.split(" ")[0]}` : "Welcome, Cadet"}
          </h1>
          <p className="text-sm text-muted-foreground mb-10 font-light">
            {intakeDone ? "Profile active. Access assessment intelligence below." : "Initialise your profile to unlock the full protocol."}
          </p>

          {/* Quick Actions Tooltip Area */}
          <div className="flex flex-wrap gap-4 mb-8">
            {intakeDone && (
              <Button 
                onClick={() => generateMedicalCertificate(profile, results)}
                className="bg-primary text-primary-foreground font-sans font-bold uppercase text-[10px] tracking-widest px-6 shadow-glow-gold hover:scale-[1.02] transition-transform"
              >
                <Download size={14} className="mr-2" /> Download Fitness Certificate
              </Button>
            )}
            {isExaminer && (
              <Link to="/scan">
                <Button variant="outline" className="border-primary/20 hover:border-primary/50 font-sans font-bold uppercase text-[10px] tracking-widest px-6">
                  <Activity size={14} className="mr-2" /> Start New Assessment
                </Button>
              </Link>
            )}
          </div>

          {/* Profile Status Badge */}
          {intakeDone && (
            <div className="glass-panel p-5 mb-8 flex items-center justify-between border-primary/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <ShieldCheck size={20} className="text-primary" />
                </div>
                <div>
                  <div className="font-sans font-bold text-[10px] uppercase tracking-widest text-primary">AUDIT STATUS: VERIFIED</div>
                  <div className="text-sm text-muted-foreground font-light">
                    Your digital record is locked and cryptographically signed.
                  </div>
                </div>
              </div>
              <Link to="/intake" className="hidden sm:block">
                <Button variant="ghost" size="sm" className="font-sans font-bold text-[10px] uppercase tracking-widest text-muted-foreground">
                  <Edit3 size={12} className="mr-2" /> Amend Records
                </Button>
              </Link>
            </div>
          )}

          {/* KPI strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <Kpi label="Assessed Height" value={profile?.height_cm ? `${profile.height_cm} cm` : "N/A"} />
            <Kpi label="Assessed Weight" value={profile?.weight_kg ? `${profile.weight_kg} kg` : "N/A"} />
            <Kpi
              label="BMI Index"
              value={candidateBmi ?? "N/A"}
              variant={candidateBmi && (candidateBmi < 18.5 || candidateBmi > 25) ? "warning" : "default"}
            />
            <Kpi label="Active Results" value={results.length} />
          </div>

          {/* Modules Section */}
          <div className="mb-6 font-sans font-bold text-[10px] uppercase tracking-widest text-muted-foreground">
            Available Modules
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <ModuleCard
              icon={FileText}
              title="Intake Module"
              desc={intakeDone ? "Candidate identity and history is locked." : `Intake sequence is active. Finalise to unlock.`}
              cta={intakeDone ? "Review" : "Continue"}
              to="/intake"
              active
            />
            <ModuleCard
              icon={Activity}
              title="Biometric Console"
              desc="Capture real-time biometric and physiological parameters."
              cta="Launch Console"
              to="/scan"
              active={isExaminer || intakeDone}
            />
            {isExaminer ? (
              <ModuleCard
                icon={Users}
                title="Candidate Management"
                desc="Manage profiles, assessments, and clearance status."
                cta="Open Registry"
                to="/scan" // Placeholder
                active
              />
            ) : (
              <ModuleCard
                icon={MapPin}
                title="Hospital Routing"
                desc="AFMS designated specialist eval centres near you."
                cta="View Facilities"
                to="/hospitals"
                active
              />
            )}
          </div>
        </motion.div>
      </div>
    </AppShell>
  );
}

function Kpi({ label, value, variant = "default" }: { label: string; value: any; variant?: "default" | "warning" }) {
  return (
    <div className="glass-panel p-5 border-primary/5">
      <div className="font-sans font-bold text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60">{label}</div>
      <div className={`font-display text-4xl mt-2 ${variant === "warning" ? "text-warning" : "text-primary tracking-tighter"}`}>
        {value}
      </div>
    </div>
  );
}

function ModuleCard({
  icon: Icon, title, desc, cta, to, active,
}: {
  icon: any; title: string; desc: string; cta: string; to: string; active: boolean;
}) {
  return (
    <div className={`glass-panel p-6 flex flex-col hover:border-primary/20 transition-all ${active ? "opacity-100" : "opacity-40"}`}>
      <div className="w-10 h-10 rounded-sm border border-primary/10 flex items-center justify-center bg-background/40 mb-5">
        <Icon size={18} className="text-primary" />
      </div>
      <div className="font-sans font-bold text-xs uppercase tracking-widest text-primary mb-2">{title}</div>
      <p className="text-sm text-muted-foreground flex-1 mb-6 font-light leading-relaxed">{desc}</p>
      <Link to={active ? to : "#"}>
        <Button 
          disabled={!active}
          variant={active ? "liquid-glass" : "ghost"} 
          className="w-full font-sans font-bold uppercase text-[10px] tracking-widest h-11"
        >
          {active ? cta : "LOCKED"}
        </Button>
      </Link>
    </div>
  );
}

