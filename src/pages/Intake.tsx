import { useEffect, useState } from "react";
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
import { ENTRY_SCHEMES, TARGET_SERVICES, GENDERS, BLOOD_GROUPS, bmi } from "@/lib/cadet-data";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Check, CalendarIcon, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Calendar } from "@/components/ui/calendar";
import { INDIAN_STATES, STATE_CITY_MAP } from "@/lib/cadet-data";
import { cn } from "@/lib/utils";

const STEPS = [
  { num: 1, label: "Personal Details" },
  { num: 2, label: "Biometric Baseline" },
  { num: 3, label: "Medical History" },
  { num: 4, label: "Family History" },
];

interface Profile {
  full_name?: string;
  date_of_birth?: string;
  gender?: string;
  entry_scheme?: string;
  target_service?: string;
  city?: string;
  state?: string;
  contact_phone?: string;
  contact_email?: string;
  height_cm?: number | null;
  weight_kg?: number | null;
  chest_cm?: number | null;
  blood_group?: string;
  medical_history?: any;
  family_history?: any;
  intake_step?: number;
}

export default function Intake() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<Profile>({});
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("candidate_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        setProfile(data);
        setStep(Math.min(data.intake_step || 1, 4));
      }
      setLoaded(true);
    })();
  }, [user]);

  const update = (patch: Partial<Profile>) => setProfile((p) => ({ ...p, ...patch }));

  const saveStep = async (nextStep: number, completed = false) => {
    if (!user) return;
    setSaving(true);
    const payload: any = {
      ...profile,
      user_id: user.id,
      intake_step: nextStep,
    };
    if (completed) payload.intake_completed_at = new Date().toISOString();
    const { error } = await supabase
      .from("candidate_profiles")
      .upsert(payload, { onConflict: "user_id" });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return false;
    }
    return true;
  };

  const next = async () => {
    const ok = await saveStep(step + 1);
    if (ok) setStep(step + 1);
  };

  const prev = () => setStep(Math.max(1, step - 1));

  const submit = async () => {
    const ok = await saveStep(4, true);
    if (ok) {
      toast.success("RECORD LOCKED. Profile shell created.");
      navigate("/dashboard");
    }
  };

  if (authLoading || !loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center font-sans font-bold text-xs uppercase tracking-widest text-primary animate-breathe">
        LOADING
      </div>
    );
  }
  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <AppShell>
      <div className="container py-8 max-w-4xl">
        <div className="mb-8">
          <div className="font-sans font-bold text-[10px] uppercase tracking-[0.3em] text-primary mb-3">
            CADET INTAKE
          </div>
          <h1 className="font-display text-3xl text-foreground mb-1">Pre-Assessment Profile</h1>
          <p className="text-sm text-muted-foreground">
            All data stored in your private candidate record. Required before any biometric scan.
          </p>
        </div>

        {/* Stepper */}
        <div className="grid grid-cols-4 gap-2 mb-8">
          {STEPS.map((s) => (
            <div
              key={s.num}
              className={`relative p-3 border-l-2 ${
                step === s.num
                  ? "border-primary bg-primary/5"
                  : step > s.num
                  ? "border-success/60 bg-success/5"
                  : "border-muted"
              }`}
            >
              <div className="flex items-center gap-2 font-sans font-bold text-[9px] uppercase tracking-widest text-muted-foreground">
                <span className={step >= s.num ? "text-primary" : ""}>STEP {s.num}/4</span>
                {step > s.num && <Check size={12} className="text-success" />}
              </div>
              <div className="text-xs mt-1 hidden sm:block">{s.label}</div>
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="glass-panel-strong corner-bracket p-6 md:p-8 liquid-glass-ultra"
          >
            {step === 1 && <Step1 profile={profile} update={update} />}
            {step === 2 && <Step2 profile={profile} update={update} />}
            {step === 3 && <Step3 profile={profile} update={update} />}
            {step === 4 && <Step4 profile={profile} update={update} />}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={prev}
            disabled={step === 1 || saving}
            className="border-primary/20 font-sans font-bold uppercase text-[10px] tracking-widest h-11"
          >
            <ChevronLeft size={14} className="mr-2" /> Previous
          </Button>

          {step < 4 ? (
            <Button
              onClick={next}
              disabled={saving}
              variant="liquid-glass"
              className="font-sans font-bold uppercase text-[10px] tracking-widest h-11"
            >
              Next Step <ChevronRight size={14} className="ml-2" />
            </Button>
          ) : (
            <Button
              onClick={submit}
              disabled={saving}
              variant="liquid-glass"
              className="font-sans font-bold uppercase text-[11px] tracking-widest h-12 shadow-glow-gold"
            >
              COMPLETE PROFILE LOCK
            </Button>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function Step1({ profile, update }: { profile: Profile; update: (p: Partial<Profile>) => void }) {
  return (
    <div className="space-y-5">
      <SectionTitle num="A.2" title="Personal Details" />
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Full Name">
          <Input value={profile.full_name || ""} onChange={(e) => update({ full_name: e.target.value })} />
        </Field>
        <Field label="Date of Birth">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={`w-full justify-start text-left font-sans h-11 border-primary/20 bg-background/40 ${!profile.date_of_birth && "text-muted-foreground"}`}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {profile.date_of_birth ? format(new Date(profile.date_of_birth), "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-[100]" align="start">
              <Calendar
                mode="single"
                selected={profile.date_of_birth ? new Date(profile.date_of_birth) : undefined}
                onSelect={(date) => update({ date_of_birth: date?.toISOString() })}
                disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </Field>
        <Field label="Gender">
          <Select value={profile.gender} onValueChange={(v) => update({ gender: v })}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>{GENDERS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Entry Scheme">
          <Select value={profile.entry_scheme} onValueChange={(v) => update({ entry_scheme: v })}>
            <SelectTrigger><SelectValue placeholder="NDA / CDS" /></SelectTrigger>
            <SelectContent>{ENTRY_SCHEMES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Target Service">
          <Select value={profile.target_service} onValueChange={(v) => update({ target_service: v })}>
            <SelectTrigger><SelectValue placeholder="Select branch" /></SelectTrigger>
            <SelectContent>{TARGET_SERVICES.map((s) => <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="State">
          <Select value={profile.state} onValueChange={(v) => {
            update({ state: v, city: "" }); // Clear city when state changes
          }}>
            <SelectTrigger className="bg-background/40 border-primary/20 h-11"><SelectValue placeholder="Select State" /></SelectTrigger>
            <SelectContent className="z-[100] liquid-glass-ultra">
              {INDIAN_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <Field label="City">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                disabled={!profile.state}
                className={cn(
                  "w-full justify-between bg-background/40 border-primary/20 h-11 px-3",
                  !profile.city && "text-muted-foreground"
                )}
              >
                {profile.city || (profile.state ? "Select or type city..." : "Select state first")}
                <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 z-[100] liquid-glass-ultra">
              <Command>
                <CommandInput placeholder="Search city..." className="h-9" />
                <CommandList>
                  <CommandEmpty>No city found.</CommandEmpty>
                  <CommandGroup>
                    {profile.state && STATE_CITY_MAP[profile.state]?.map((c) => (
                      <CommandItem
                        key={c}
                        value={c}
                        onSelect={(currentValue) => {
                          update({ city: currentValue });
                        }}
                        className="font-sans text-xs"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            profile.city === c ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {c}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </Field>
        <Field label="Contact Phone">
          <Input type="tel" value={profile.contact_phone || ""} onChange={(e) => update({ contact_phone: e.target.value })} />
        </Field>
      </div>
    </div>
  );
}

function Step2({ profile, update }: { profile: Profile; update: (p: Partial<Profile>) => void }) {
  const calcBmi = bmi(profile.height_cm, profile.weight_kg);
  return (
    <div className="space-y-5">
      <SectionTitle num="A.3" title="Biometric Baseline" />
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Height (cm)">
          <Input type="number" step="0.1" value={profile.height_cm ?? ""} onChange={(e) => update({ height_cm: e.target.value ? Number(e.target.value) : null })} />
        </Field>
        <Field label="Weight (kg)">
          <Input type="number" step="0.1" value={profile.weight_kg ?? ""} onChange={(e) => update({ weight_kg: e.target.value ? Number(e.target.value) : null })} />
        </Field>
        <Field label="Chest (cm, relaxed)">
          <Input type="number" step="0.1" value={profile.chest_cm ?? ""} onChange={(e) => update({ chest_cm: e.target.value ? Number(e.target.value) : null })} />
        </Field>
        <Field label="Blood Group">
          <Select value={profile.blood_group} onValueChange={(v) => update({ blood_group: v })}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>{BLOOD_GROUPS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
      </div>
      {calcBmi !== null && (
        <div className="glass-panel p-4 flex items-center justify-between">
          <span className="font-mono-tac text-xs uppercase tracking-widest text-muted-foreground">Computed BMI</span>
          <span className={`font-display text-2xl ${calcBmi < 18.5 || calcBmi > 25 ? "text-warning" : "text-success"}`}>{calcBmi}</span>
        </div>
      )}
    </div>
  );
}

function Step3({ profile, update }: { profile: Profile; update: (p: Partial<Profile>) => void }) {
  const mh = profile.medical_history || {};
  const set = (k: string, v: any) => update({ medical_history: { ...mh, [k]: v } });
  return (
    <div className="space-y-5">
      <SectionTitle num="A.4" title="Medical History" />
      <p className="text-xs text-muted-foreground">
        Honest disclosure assists fitness assessment. The platform flags items for human medical board review only — it does not render final fitness verdicts.
      </p>
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Past Illnesses">
          <Textarea rows={2} value={mh.past_illnesses || ""} onChange={(e) => set("past_illnesses", e.target.value)} placeholder="e.g. asthma (childhood, resolved)" />
        </Field>
        <Field label="Surgeries (year, type)">
          <Textarea rows={2} value={mh.surgeries || ""} onChange={(e) => set("surgeries", e.target.value)} />
        </Field>
        <Field label="Chronic Medications">
          <Textarea rows={2} value={mh.medications || ""} onChange={(e) => set("medications", e.target.value)} />
        </Field>
        <Field label="Known Allergies">
          <Textarea rows={2} value={mh.allergies || ""} onChange={(e) => set("allergies", e.target.value)} />
        </Field>
        <Field label="Vision Correction (Y/N + prescription)">
          <Input value={mh.vision_correction || ""} onChange={(e) => set("vision_correction", e.target.value)} />
        </Field>
        <Field label="Colour Blindness">
          <Select value={mh.colour_blindness} onValueChange={(v) => set("colour_blindness", v)}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="No">No</SelectItem>
              <SelectItem value="Yes">Yes</SelectItem>
              <SelectItem value="Unknown">Unknown</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Hearing Issues">
          <Input value={mh.hearing || ""} onChange={(e) => set("hearing", e.target.value)} />
        </Field>
        <Field label="Mental Health History (Y/N)">
          <Select value={mh.mental_health} onValueChange={(v) => set("mental_health", v)}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="No">No</SelectItem>
              <SelectItem value="Yes">Yes</SelectItem>
              <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>
    </div>
  );
}

function Step4({ profile, update }: { profile: Profile; update: (p: Partial<Profile>) => void }) {
  const fh = profile.family_history || {};
  const set = (k: string, v: any) => update({ family_history: { ...fh, [k]: v } });
  const yn = ["No", "Yes", "Unknown"];
  return (
    <div className="space-y-5">
      <SectionTitle num="A.5" title="Family History" />
      <p className="text-xs text-muted-foreground">
        Hereditary conditions inform pre-screen flags only. Used for context — never auto-disqualifying.
      </p>
      <div className="grid md:grid-cols-2 gap-4">
        {[
          ["heart_disease", "Heart Disease (Parents/Siblings)"],
          ["diabetes", "Diabetes"],
          ["hypertension", "Hypertension"],
          ["asthma", "Asthma / Respiratory"],
          ["epilepsy", "Epilepsy / Seizures"],
          ["mental_illness", "Mental Illness in Family"],
          ["colour_blindness", "Colour Blindness (Father/Mother)"],
          ["hearing_loss", "Hereditary Hearing Loss"],
        ].map(([k, label]) => (
          <Field key={k} label={label}>
            <Select value={fh[k]} onValueChange={(v) => set(k, v)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{yn.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
        ))}
      </div>
      <Field label="Known Genetic Disorders (optional)">
        <Textarea rows={2} value={fh.genetic_disorders || ""} onChange={(e) => set("genetic_disorders", e.target.value)} />
      </Field>
    </div>
  );
}

function SectionTitle({ num, title }: { num: string; title: string }) {
  return (
    <div className="flex items-baseline gap-3 pb-3 border-b border-primary/5">
      <span className="font-sans font-bold text-[10px] uppercase tracking-widest text-primary/60">{num}</span>
      <h2 className="font-display text-2xl text-foreground font-bold">{title}</h2>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="font-sans font-bold text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60">{label}</Label>
      {children}
    </div>
  );
}
