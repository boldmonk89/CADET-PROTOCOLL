import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { Logo } from "@/components/cadet/Logo";
import { Button } from "@/components/ui/button";
import { Shield, Activity, FileCheck, MapPin, ArrowRight } from "lucide-react";

export default function Landing() {
  const { scrollYProgress } = useScroll();
  const logoScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);
  const logoOpacity = useTransform(scrollYProgress, [0, 0.2], [0.15, 0]);
  const logoBlur = useTransform(scrollYProgress, [0, 0.2], ["blur(0px)", "blur(20px)"]);
  const textY = useTransform(scrollYProgress, [0, 0.3], [0, -50]);

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden selection:bg-primary/30">
      {/* Premium Background Effects */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>
      
      {/* 3D Holographic Icon Stack Background */}
      <motion.div 
        style={{ 
          scale: logoScale, 
          opacity: logoOpacity,
          perspective: 1000,
        }}
        className="fixed inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden"
      >
        <motion.div
           style={{
             rotateY: useTransform(scrollYProgress, [0, 0.4], [0, 45]),
             rotateX: useTransform(scrollYProgress, [0, 0.4], [0, -15]),
             transformStyle: "preserve-3d",
           }}
           className="relative w-full h-full flex items-center justify-center"
        >
          {/* Layer 1: Shield */}
          <motion.div 
            style={{ translateZ: -200, opacity: 0.1 }}
            className="absolute"
          >
            <Shield size={600} className="text-primary stroke-[0.5]" />
          </motion.div>

          {/* Layer 2: Activity (Pulse) */}
          <motion.div 
            style={{ translateZ: 0 }}
            className="absolute"
          >
            <Activity size={400} className="text-primary/40 stroke-[1] drop-shadow-[0_0_30px_rgba(212,175,55,0.3)]" />
          </motion.div>

          {/* Layer 3: Inner Core */}
          <motion.div 
            style={{ translateZ: 200, opacity: 0.2 }}
            className="absolute"
          >
             <div className="w-40 h-40 rounded-full border border-primary/30 blur-md animate-pulse" />
          </motion.div>
        </motion.div>
      </motion.div>

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

          <motion.h1 
            style={{ y: textY }}
            className="font-display text-6xl md:text-8xl lg:text-[7rem] text-foreground mb-10 leading-[0.95] tracking-tighter"
          >
            Forged in <span className="font-display italic text-primary text-glow-gold font-light">Discipline.</span><br />
            Tested in <span className="font-display text-primary text-glow-gold">Field.</span>
          </motion.h1>

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
