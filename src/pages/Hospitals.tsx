import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AppShell } from "@/components/cadet/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { COMMAND_HOSPITALS, distanceKm, getCityCoords, STATE_TO_COMMAND_MAP } from "@/lib/cadet-data";
import { Navigation, Phone, Copy, MapPin, Target, Hospital } from "lucide-react";
import { toast } from "sonner";
import { ReferralSection } from "@/components/cadet/ReferralSection";

export default function Hospitals() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [overrideCity, setOverrideCity] = useState("");
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: p }, { data: r }] = await Promise.all([
        supabase.from("candidate_profiles").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("assessment_results")
          .select("*").eq("user_id", user.id)
          .in("status", ["UNFIT", "BORDERLINE"])
          .order("created_at", { ascending: false }),
      ]);
      setProfile(p);
      setResults(r || []);
    })();
  }, [user]);

  const candidateCity = overrideCity || profile?.city || "";
  const candidateState = profile?.state || "";
  const coords = getCityCoords(candidateCity);
  const recommendedNode = STATE_TO_COMMAND_MAP[candidateState];

  const hospitals = useMemo(() => {
    return COMMAND_HOSPITALS
      .map((h) => ({ 
        ...h, 
        distance: coords ? distanceKm(coords, { lat: h.lat, lng: h.lng }) : null,
        isRecommended: recommendedNode && h.name.toLowerCase().includes(recommendedNode.toLowerCase().split("(")[0].trim().toLowerCase())
      }))
      .sort((a, b) => {
        // If searching a specific city, distance is the absolute priority
        if (overrideCity) {
          if (a.distance !== null && b.distance !== null) return a.distance - b.distance;
          if (a.distance !== null) return -1;
          if (b.distance !== null) return 1;
        }
        
        if (a.isRecommended && !b.isRecommended) return -1;
        if (!a.isRecommended && b.isRecommended) return 1;
        if (a.distance !== null && b.distance !== null) return a.distance - b.distance;
        if (a.distance !== null) return -1;
        if (b.distance !== null) return 1;
        return 0;
      });
  }, [coords, recommendedNode]);

  if (loading) return null;
  if (!user) { navigate("/auth"); return null; }

  const triggered = results.length > 0;

  return (
    <AppShell candidateBadge={profile ? {
      name: profile.full_name, code: profile.candidate_code, service: profile.target_service, scheme: profile.entry_scheme,
    } : null}>
      <div className="container py-8 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <div className="font-sans font-bold text-[10px] uppercase tracking-[0.2em] text-primary mb-3">
            MODULE D : HOSPITAL ROUTING
          </div>
          <h1 className="font-display text-4xl text-foreground mb-2 text-glow-gold">Command Hospital Referral</h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            This assessment is indicative — only an AFMS Medical Board has authority to determine final fitness.
            For UNFIT or BORDERLINE results, seek specialist evaluation at the nearest Command Hospital.
          </p>
        </motion.div>

        {/* Trigger banner */}
        {triggered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="glass-panel-strong border-l-4 border-warning p-5 mb-8 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Target size={80} className="text-warning" />
            </div>
            <div className="font-sans font-bold text-[10px] uppercase tracking-widest text-warning mb-1">
              {results.length} ASSESSMENT FLAG{results.length > 1 ? "S" : ""}
            </div>
            <div className="text-base text-foreground font-bold mb-3">
              Specialist review recommended for {candidateState || "your region"}.
            </div>
            <div className="flex flex-wrap gap-2">
              {results.slice(0, 6).map((r) => (
                <span key={r.id} className="text-[9px] font-sans font-bold uppercase tracking-wider px-3 py-1 border border-warning/30 text-warning bg-warning/5 rounded-full">
                  {r.parameter} · {r.status}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* City selector */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-panel p-5 mb-8 flex flex-col sm:row gap-4 items-start sm:items-end liquid-glass-ultra"
        >
          <div className="flex-1 w-full space-y-2">
            <label className="font-sans font-bold text-[10px] uppercase tracking-widest text-primary/70">
              Active Search Anchor {!coords && candidateCity && <span className="text-warning ml-2">(manual location mode)</span>}
            </label>
            <Input
              value={candidateCity}
              onChange={(e) => setOverrideCity(e.target.value)}
              placeholder="e.g. Patna, Mumbai, Delhi"
              className="bg-black/20 border-white/10 h-12 text-base"
            />
          </div>
          <div className="text-[9px] font-sans font-bold uppercase tracking-[0.2em] text-muted-foreground/60 max-w-xs leading-relaxed">
            Distances computed via Haversine geometry from city centroids. No telemetry used.
          </div>
        </motion.div>

        {!candidateCity && !candidateState && (
          <div className="glass-panel p-12 text-center border-dashed border-primary/20 backdrop-blur-md">
            <MapPin size={48} className="mx-auto text-primary/20 mb-4" />
            <h3 className="font-display text-xl text-foreground mb-2">Regional Identity Pending</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
              Finish your Cadet Intake to activate regional routing and find your nearest Command Hospital automatically.
            </p>
            <Button variant="liquid-glass" onClick={() => navigate("/intake")} className="uppercase tracking-widest text-[10px]">
              Complete Intake
            </Button>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {hospitals.map((h, i) => (
            <motion.div
              key={h.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="h-full"
            >
              <HospitalCard hospital={h} />
            </motion.div>
          ))}
        </div>

        {/* Global Clinical Referral Instructions */}
        <ReferralSection />
      </div>
    </AppShell>
  );
}

function HospitalCard({ hospital }: { hospital: any }) {
  const serviceColor: Record<string, string> = {
    ARMY: "bg-service-army/30 border-service-army text-service-army",
    NAVY: "bg-service-navy/30 border-service-navy text-service-navy",
    AIR_FORCE: "bg-service-airforce/30 border-service-airforce text-service-airforce",
  };
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hospital.name + " " + hospital.city)}`;

  const copyAddress = () => {
    navigator.clipboard.writeText(`${hospital.name}, ${hospital.city}, ${hospital.state}`);
    toast.success("Address copied");
  };

  return (
    <div className="glass-panel p-5 h-full flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <span className={`text-[9px] font-sans font-bold uppercase tracking-wider px-2 py-1 border rounded-sm ${serviceColor[hospital.service]}`}>
          {hospital.service.replace("_", " ")}
        </span>
        {hospital.distance != null && (
          <span className="text-xs font-sans font-bold text-primary tracking-tighter">~{hospital.distance} KM</span>
        )}
      </div>

      <h3 className="text-sm font-semibold text-foreground leading-snug">{hospital.name}</h3>
      <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
        <MapPin size={11} /> {hospital.city}, {hospital.state}
      </div>

      <div className="flex flex-wrap gap-1 mt-3">
        {hospital.specialities.map((s: string) => (
          <span key={s} className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-sm">
            {s}
          </span>
        ))}
      </div>

      <div className="flex gap-2 mt-4 pt-4 border-t border-border/40">
        <a href={mapsUrl} target="_blank" rel="noreferrer" className="flex-1">
          <Button size="sm" variant="liquid-glass" className="w-full font-sans font-bold uppercase text-[10px] tracking-widest h-10">
            <Navigation size={11} className="mr-2" /> Directions
          </Button>
        </a>
        {hospital.phone ? (
          <a href={`tel:${hospital.phone}`}>
            <Button size="sm" variant="outline" className="border-primary/40 hover:bg-primary/10">
              <Phone size={12} />
            </Button>
          </a>
        ) : (
          <Button size="sm" variant="outline" onClick={copyAddress} className="border-primary/40">
            <Copy size={12} />
          </Button>
        )}
      </div>
    </div>
  );
}
