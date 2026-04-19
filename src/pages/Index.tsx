import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Logo } from "@/components/cadet/Logo";
import { Button } from "@/components/ui/button";
import { Shield, Activity, FileCheck, MapPin, ArrowRight } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Premium Background Effects */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-primary/5 to-transparent blur-3xl pointer-events-none"></div>
      
      <header className="container py-8 flex items-center justify-between relative z-10 border-b border-border/30">
        <Logo size="md" />
        <Link to="/auth">
          <Button variant="ghost" className="font-sans font-bold text-xs uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
            EXAMINER PORTAL
          </Button>
        </Link>
      </header>

      <section className="container flex-1 flex flex-col items-center justify-center text-center py-16 md:py-24 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 border border-primary/20 rounded-full bg-card/50 backdrop-blur-sm shadow-glow-gold">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="font-sans font-bold text-[10px] uppercase tracking-[0.25em] text-primary">
              Medical Intake & Audit System
            </span>
          </div>

          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-foreground mb-6 leading-[1.1] tracking-tight">
            Forged in <span className="font-display italic text-primary text-glow-gold font-light">Discipline.</span><br />
            Tested in <span className="font-display text-primary text-glow-gold">Field.</span>
          </h1>

          <p className="font-command italic text-lg md:text-xl text-primary/80 max-w-2xl mx-auto mb-4 tracking-wide">
            AI-POWERED DEFENCE PSYCHOLOGY & MEDICAL AUDIT
          </p>
          
          <p className="font-sans text-muted-foreground max-w-2xl mx-auto mb-12 text-base md:text-lg leading-relaxed font-light">
            Built for serious SSB aspirants targeting NDA and CDS combat roles. Evaluate your exact medical, psychological, and physiological readiness against the <span className="text-foreground font-medium">AFMS standard matrices</span> before the day of reckoning.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center mt-4">
            <Link to="/auth">
              <Button
                size="lg"
                variant="liquid-glass"
                className="font-sans font-bold uppercase tracking-widest text-[11px] h-14 px-12 shadow-glow-gold transition-all duration-300 hover:scale-[1.05]"
              >
                Commence Audit <ArrowRight size={14} className="ml-2" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button
                size="lg"
                variant="ghost"
                className="hover:bg-primary/5 text-foreground font-sans font-bold uppercase tracking-widest text-[11px] h-14 px-12 transition-all duration-300"
              >
                Returning Candidate
              </Button>
            </Link>
          </div>
        </motion.div>

      </section>

      <footer className="container py-8 border-t border-border/20 text-center text-[9px] font-sans font-bold uppercase tracking-[0.4em] text-muted-foreground/40 relative z-10 bg-background/80">
        CADET PROTOCOL 2025–2028 | SECURE ENVIRONMENT
      </footer>
    </div>
  );
}
