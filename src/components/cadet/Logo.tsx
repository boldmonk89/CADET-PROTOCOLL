import { Shield } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
}

export const Logo = ({ size = "md", showTagline = false }: LogoProps) => {
  const sizes = {
    sm: { icon: 18, text: "text-sm", brackets: "text-base" },
    md: { icon: 22, text: "text-base", brackets: "text-lg" },
    lg: { icon: 32, text: "text-2xl", brackets: "text-3xl" },
  };
  const s = sizes[size];

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <Shield size={s.icon} className="text-primary" strokeWidth={1.5} />
        <div className="absolute inset-0 bg-primary/20 blur-md -z-10" />
      </div>
      <div className="flex flex-col leading-tight">
        <div className={`flex items-center gap-1.5 font-mono-tac font-semibold tracking-widest text-primary text-glow-gold ${s.text}`}>
          <span className={s.brackets}>■</span>
          <span>CADET PROTOCOL</span>
          <span className={s.brackets}>■</span>
        </div>
        {showTagline && (
          <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mt-0.5">
            AI-Powered Defence Medical & Psychological Audit
          </div>
        )}
      </div>
    </div>
  );
};
