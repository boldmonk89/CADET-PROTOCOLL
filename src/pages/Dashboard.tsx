import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AppShell } from "@/components/cadet/AppShell";
import { Button } from "@/components/ui/button";
import { bmi } from "@/lib/cadet-data";
import { Activity, FileText, MapPin, Edit3, Lock } from "lucide-react";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [resultsCount, setResultsCount] = useState(0);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: p }, { count }] = await Promise.all([
        supabase.from("candidate_profiles").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("assessment_results").select("*", { count: "exact", head: true }).eq("user_id", user.id),
      ]);
      setProfile(p);
      setResultsCount(count || 0);
      setFetched(true);
    })();
  }, [user]);

  if (loading || !fetched) {
    return (
      <div className="min-h-screen flex items-center justify-center font-mono-tac text-xs uppercase tracking-widest text-primary animate-breathe">
        ■ SYNCING //
      </div>
    );
  }
  if (!user) {
    navigate("/auth");
    return null;
  }

  const intakeDone = !!profile?.intake_completed_at;
  const candidateBmi = bmi(profile?.height_cm, profile?.weight_kg);

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
          <div className="font-mono-tac text-xs uppercase tracking-widest text-primary mb-2">
            ■ MISSION CONTROL
          </div>
          <h1 className="font-display text-3xl md:text-4xl text-foreground mb-1">
            {profile?.full_name ? `Welcome, ${profile.full_name.split(" ")[0]}` : "Welcome, Cadet"}
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            {intakeDone ? "Profile locked. Proceed to assessment modules." : "Complete your intake profile to unlock assessment modules."}
          </p>

          {/* Profile Locked badge */}
          {intakeDone && (
            <div className="glass-panel-strong p-4 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-sm bg-success/20 border border-success/40 flex items-center justify-center">
                  <Lock size={16} className="text-success" />
                </div>
                <div>
                  <div className="font-mono-tac text-[10px] uppercase tracking-widest text-success">PROFILE LOCKED</div>
                  <div className="text-sm text-muted-foreground">
                    Locked at {new Date(profile.intake_completed_at).toLocaleString()}
                  </div>
                </div>
              </div>
              <Link to="/intake">
                <Button variant="ghost" size="sm" className="text-xs">
                  <Edit3 size={12} className="mr-1.5" /> Amend
                </Button>
              </Link>
            </div>
          )}

          {/* KPI strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <Kpi label="Height" value={profile?.height_cm ? `${profile.height_cm} cm` : "—"} />
            <Kpi label="Weight" value={profile?.weight_kg ? `${profile.weight_kg} kg` : "—"} />
            <Kpi
              label="BMI"
              value={candidateBmi ?? "—"}
              variant={candidateBmi && (candidateBmi < 18.5 || candidateBmi > 25) ? "warning" : "default"}
            />
            <Kpi label="Recorded Results" value={resultsCount} />
          </div>

          {/* Modules */}
          <div className="grid md:grid-cols-3 gap-4">
            <ModuleCard
              icon={FileText}
              title="Intake Module"
              desc={intakeDone ? "Profile is locked. Amend if needed." : `Step ${profile?.intake_step || 1} of 4 in progress.`}
              cta={intakeDone ? "Review" : "Resume"}
              to="/intake"
              active
            />
            <ModuleCard
              icon={Activity}
              title="Biometric Scan Console"
              desc="Camera-assisted parameter scans with examiner sign-off."
              cta="Open Console"
              to="/scan"
              active={intakeDone}
            />
            <ModuleCard
              icon={MapPin}
              title="Hospital Routing"
              desc="Locate nearest Command Hospitals for specialist evaluation."
              cta="View Routing"
              to="/hospitals"
              active
            />
          </div>
        </motion.div>
      </div>
    </AppShell>
  );
}

function Kpi({ label, value, variant = "default" }: { label: string; value: any; variant?: "default" | "warning" }) {
  return (
    <div className="glass-panel p-4">
      <div className="font-mono-tac text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`font-display text-2xl mt-1 ${variant === "warning" ? "text-warning" : "text-primary"}`}>
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
    <div className={`glass-panel p-5 flex flex-col ${active ? "" : "opacity-50"}`}>
      <Icon size={20} className="text-primary mb-3" />
      <div className="font-mono-tac text-xs uppercase tracking-widest text-primary mb-2">{title}</div>
      <p className="text-sm text-muted-foreground flex-1 mb-4">{desc}</p>
      {active ? (
        <Link to={to}>
          <Button variant="outline" className="w-full border-primary/40 hover:bg-primary/10 font-mono-tac uppercase text-xs tracking-widest">
            {cta} →
          </Button>
        </Link>
      ) : (
        <Button disabled variant="outline" className="w-full font-mono-tac uppercase text-xs tracking-widest">
          ■ LOCKED
        </Button>
      )}
    </div>
  );
}
