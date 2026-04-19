interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showTagline?: boolean;
}

export const Logo = ({ size = "md", showTagline = false }: LogoProps) => {
  const sizes = {
    sm: { container: "h-8", img: "h-8 w-auto px-1", font: "text-sm", tagline: "text-[6px]" },
    md: { container: "h-14", img: "h-14 w-auto", font: "text-lg", tagline: "text-[7px]" },
    lg: { container: "h-24", img: "h-24 w-auto drop-shadow-xl", font: "text-2xl", tagline: "text-[9px]" },
    xl: { container: "h-40", img: "h-40 w-auto shadow-glow-gold", font: "text-4xl", tagline: "text-xs" },
  };
  const s = sizes[size];

  return (
    <div className={`flex items-center gap-3 ${size === 'xl' ? 'flex-col justify-center text-center' : 'flex-row'}`}>
      <div className="relative">
        <img 
          src="/assets/logo_ultra.png" 
          alt="Cadet Protocol Emblem" 
          className={`${s.img} object-contain rounded-md drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]`}
        />
      </div>
      <div className="flex flex-col leading-none">
        <div className={`${s.font} font-display font-bold tracking-[0.15em] text-white text-glow-gold`}>
          CADET<span className="text-primary/95">PROTOCOL</span>
        </div>
        {showTagline && (
          <div className={`${s.tagline} font-sans font-bold uppercase tracking-[0.4em] text-primary/60 mt-0.5`}>
            STRATEGIC MEDICAL AUDIT
          </div>
        )}
      </div>
    </div>
  );
};
