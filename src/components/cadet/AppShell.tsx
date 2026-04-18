import { ReactNode } from "react";
import { Logo } from "./Logo";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface AppShellProps {
  children: ReactNode;
  candidateBadge?: { name?: string; code?: string; service?: string; scheme?: string } | null;
}

export const AppShell = ({ children, candidateBadge }: AppShellProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 glass-panel-strong border-b border-primary/30">
        <div className="container flex items-center justify-between h-16">
          <Link to="/">
            <Logo size="sm" />
          </Link>
          <div className="flex items-center gap-3">
            {user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-muted-foreground hover:text-primary"
              >
                <LogOut size={14} className="mr-2" />
                <span className="font-mono-tac text-xs uppercase">Sign Out</span>
              </Button>
            )}
          </div>
        </div>
        {candidateBadge && (
          <div className="border-t border-primary/15 bg-background/40">
            <div className="container py-2 flex flex-wrap items-center gap-x-6 gap-y-1 text-xs font-mono-tac uppercase">
              <span className="text-muted-foreground">CANDIDATE //</span>
              <span className="text-primary">{candidateBadge.code || "—"}</span>
              {candidateBadge.name && <span>{candidateBadge.name}</span>}
              {candidateBadge.scheme && <span className="text-muted-foreground">SCHEME: <span className="text-foreground">{candidateBadge.scheme}</span></span>}
              {candidateBadge.service && <span className="text-muted-foreground">SERVICE: <span className="text-foreground">{candidateBadge.service}</span></span>}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-primary/15 mt-12">
        <div className="container py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] font-mono-tac uppercase tracking-widest text-muted-foreground">
          <span>CADET PROTOCOL © 2025–2028 | RESTRICTED</span>
          <span>AUTHORISED PERSONNEL ONLY</span>
        </div>
      </footer>
    </div>
  );
};
