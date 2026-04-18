import { Link } from "react-router-dom";
import { Logo } from "@/components/cadet/Logo";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center grid-tactical px-4">
      <Logo size="md" />
      <div className="mt-10 font-display text-7xl text-primary text-glow-gold">404</div>
      <div className="font-mono-tac text-xs uppercase tracking-widest text-muted-foreground mt-3">
        ■ COORDINATES NOT FOUND // SECTOR UNCHARTED
      </div>
      <Link to="/" className="mt-8">
        <Button variant="outline" className="border-primary/40 hover:bg-primary/10 font-mono-tac uppercase text-xs tracking-widest">
          ← Return to Base
        </Button>
      </Link>
    </div>
  );
};

export default NotFound;
