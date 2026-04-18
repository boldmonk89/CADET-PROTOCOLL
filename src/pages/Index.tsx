import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Logo } from "@/components/cadet/Logo";
import { Button } from "@/components/ui/button";
import { Shield, Activity, FileCheck, MapPin } from "lucide-react";

const features = [
  { icon: Shield, title: "AFMS-Aligned", desc: "Standards mapped to NDA/CDS entry schemes across Army, Navy, Air Force." },
  { icon: Activity, title: "Biometric Pre-Screen", desc: "Camera-assisted scans for visible parameters with examiner sign-off." },
  { icon: FileCheck, title: "Intake Audit", desc: "4-step medical & family history intake with Profile Lock." },
  { icon: MapPin, title: "Command Hospital Routing", desc: "Nearest Military Hospital referral when results trigger UNFIT or BORDERLINE." },
];

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col grid-tactical">
      <header className="container py-6 flex items-center justify-between">
        <Logo size="md" />
        <Link to="/auth">
          <Button variant="ghost" className="font-mono-tac text-xs uppercase tracking-widest text-muted-foreground hover:text-primary">
            ■ EXAMINER PORTAL →
          </Button>
        </Link>
      </header>

      <section className="container flex-1 flex flex-col items-center justify-center text-center py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 border border-primary/30 rounded-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-breathe" />
            <span className="font-mono-tac text-[10px] uppercase tracking-widest text-muted-foreground">
              DIRECTIVE 02 // BRAVO UNIT — OPERATIONAL
            </span>
          </div>

          <h1 className="font-display text-5xl md:text-7xl text-primary text-glow-gold mb-6 leading-tight">
            Pre-Screen Like<br />the Medical Board
          </h1>

          <p className="font-command text-base md:text-lg text-foreground/80 max-w-2xl mx-auto mb-2">
            AI-POWERED DEFENCE MEDICAL & PSYCHOLOGICAL AUDIT
          </p>
          <p className="text-muted-foreground max-w-xl mx-auto mb-10">
            Built for SSB aspirants targeting NDA & CDS. Map your fitness against AFMS standards
            for Army, Navy, and Air Force — before the day of reckoning.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/auth">
              <Button
                size="lg"
                className="bg-gradient-gold text-primary-foreground hover:opacity-90 font-mono-tac uppercase tracking-widest text-xs h-12 px-8 shadow-glow-gold"
              >
                ■ NEW CANDIDATE REGISTRATION
              </Button>
            </Link>
            <Link to="/auth">
              <Button
                size="lg"
                variant="outline"
                className="border-primary/40 hover:bg-primary/10 font-mono-tac uppercase tracking-widest text-xs h-12 px-8"
              >
                RETURNING CANDIDATE
              </Button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.08, delayChildren: 0.4 } },
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl w-full mt-16"
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={{
                hidden: { opacity: 0, y: 12 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
              }}
              className="glass-panel p-5 text-left"
            >
              <f.icon size={20} className="text-primary mb-3" />
              <div className="font-mono-tac text-xs uppercase tracking-widest text-primary mb-2">{f.title}</div>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <footer className="container py-6 text-center text-[10px] font-mono-tac uppercase tracking-widest text-muted-foreground">
        CADET PROTOCOL © 2025–2028 | RESTRICTED — AUTHORISED PERSONNEL ONLY
      </footer>
    </div>
  );
}
