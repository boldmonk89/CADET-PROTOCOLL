interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showTagline?: boolean;
}

export const Logo = ({ size = "md", showTagline = false }: LogoProps) => {
  const sizes = {
    sm: { img: "h-10 w-auto px-1" },
    md: { img: "h-20 w-auto" },
    lg: { img: "h-32 w-auto drop-shadow-xl" },
    xl: { img: "h-56 w-auto" },
  };
  const s = sizes[size];

  return (
    <div className={`flex ${size === 'xl' ? 'flex-col items-center text-center gap-4' : 'flex-col justify-center'}`}>
      <div className="relative">
        <img 
          src="/cadet_protocol_logo_full.png" 
          alt="Cadet Protocol Emblem" 
          className={`${s.img} object-contain rounded-md`}
        />
        <div className="absolute inset-0 bg-primary/10 blur-xl -z-10 rounded-full" />
      </div>
      <div>
        {showTagline && (
          <div className="font-command italic text-xs uppercase tracking-[0.3em] text-muted-foreground mt-2">
            AI-Powered Defence Medical & Psychological Audit
          </div>
        )}
      </div>
    </div>
  );
};
