import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AppShell } from "@/components/cadet/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { COMMAND_HOSPITALS, distanceKm, getCityCoords } from "@/lib/cadet-data";
import { Navigation, Phone, Copy, MapPin } from "lucide-react";
import { toast } from "sonner";

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

  if (loading) return null;
  if (!user) { navigate("/auth"); return null; }

  const candidateCity = overrideCity || profile?.city || "";
  const coords = getCityCoords(candidateCity);

  const hospitals = useMemo(() => {
    return COMMAND_HOSPITALS
      .map((h) => ({ ...h, distance: coords ? distanceKm(coords, { lat: h.lat, lng: h.lng }) : null }))
      .sort((a, b) => {
        if (a.distance == null) return 1;
        if (b.distance == null) return -1;
        return a.distance - b.distance;
      });
  }, [coords]);

  const triggered = results.length > 0;

  return (
    <AppShell candidateBadge={profile ? {
      name: profile.full_name, code: profile.candidate_code, service: profile.target_service, scheme: profile.entry_scheme,
    } : null}>
      <div className="container py-8">
        <div className="mb-6">
          <div className="font-mono-tac text-xs uppercase tracking-widest text-primary mb-2">
            ■ MODULE D // HOSPITAL ROUTING
          </div>
          <h1 className="font-display text-3xl text-foreground mb-1">Command Hospital Referral</h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            This assessment is indicative — only an AFMS Medical Board has authority to determine final fitness.
            For UNFIT or BORDERLINE results, seek specialist evaluation at the nearest Command Hospital.
          </p>
        </div>

        {/* Trigger banner */}
        {triggered && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel-strong border-l-4 border-warning p-4 mb-6"
          >
            <div className="font-mono-tac text-xs uppercase tracking-widest text-warning mb-1">
              ⚠ {results.length} ASSESSMENT FLAG{results.length > 1 ? "S" : ""}
            </div>
            <div className="text-sm text-foreground/90">
              We recommend specialist review before your SSB / medical board date.
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {results.slice(0, 6).map((r) => (
                <span key={r.id} className="text-[10px] font-mono-tac uppercase tracking-widest px-2 py-0.5 border border-warning/40 text-warning rounded-sm">
                  {r.parameter} · {r.status}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* City selector */}
        <div className="glass-panel p-4 mb-6 flex flex-col sm:flex-row gap-3 items-start sm:items-end">
          <div className="flex-1 space-y-1.5">
            <label className="font-mono-tac text-[10px] uppercase tracking-widest text-muted-foreground">
              Search from city {!coords && candidateCity && <span className="text-warning">// city not in registry, showing all</span>}
            </label>
            <Input
              value={candidateCity}
              onChange={(e) => setOverrideCity(e.target.value)}
              placeholder="e.g. Patna, Mumbai, Delhi"
            />
          </div>
          <div className="text-[10px] font-mono-tac uppercase tracking-widest text-muted-foreground">
            Distances are city-level approximations · Maps API not required
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hospitals.map((h, i) => (
            <motion.div
              key={h.name}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <HospitalCard hospital={h} />
            </motion.div>
          ))}
        </div>
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
      <div className="flex items-start justify-between mb-3">
        <span className={`text-[10px] font-mono-tac uppercase tracking-widest px-2 py-0.5 border rounded-sm ${serviceColor[hospital.service]}`}>
          {hospital.service.replace("_", " ")}
        </span>
        {hospital.distance != null && (
          <span className="text-xs font-mono-tac text-primary">~{hospital.distance} km</span>
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
          <Button size="sm" variant="outline" className="w-full border-primary/40 hover:bg-primary/10 font-mono-tac uppercase text-[10px] tracking-widest">
            <Navigation size={11} className="mr-1.5" /> Directions
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
