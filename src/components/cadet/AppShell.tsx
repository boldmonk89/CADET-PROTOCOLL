import { ReactNode, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Logo } from "./Logo";
import {
  LayoutDashboard,
  UserPlus,
  Activity,
  MapPin,
  LogOut,
  Menu,
  X,
  CreditCard
} from "lucide-react";

interface AppShellProps {
  children: ReactNode;
  candidateBadge?: { name?: string; code?: string; service?: string; scheme?: string } | null;
}

export const AppShell = ({ children, candidateBadge }: AppShellProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Close mobile menu on navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const navItems = [
    { name: "Summary", path: "/dashboard", icon: LayoutDashboard },
    { name: "Cadet Intake", path: "/intake", icon: UserPlus },
    { name: "Medical Audit", path: "/scan", icon: Activity },
    { name: "Referrals", path: "/hospitals", icon: MapPin },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden selection:bg-primary/20">
      
      {/* SIDEBAR (Desktop) */}
      <aside className="hidden md:flex flex-col w-72 border-r border-border bg-card shadow-2xl z-20">
        <div className="p-6 border-b border-border/50">
          <Link to="/">
            <Logo size="sm" />
          </Link>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          <div className="font-mono-tac text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-4 pl-2">
            Command Modules
          </div>
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const isExaminerRequired = item.path === "/scan";
            const canAccess = !isExaminerRequired || role === "examiner" || role === "admin";
            
            if (!canAccess) return null;

            return (
              <Link key={item.name} to={item.path}>
                <div
                  className={`flex items-center gap-4 px-4 py-3 rounded-md transition-all duration-300 ${
                    isActive 
                      ? "bg-primary/10 border-l-2 border-primary text-primary shadow-glow-gold" 
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  }`}
                >
                  <item.icon size={18} className={isActive ? "text-primary" : "opacity-70"} />
                  <span className={`font-sans text-xs uppercase tracking-widest ${isActive ? "font-bold text-primary" : "font-medium"}`}>
                    {item.name}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-border/50">
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-red-400 hover:bg-red-500/10 font-sans font-bold text-xs uppercase tracking-widest"
            onClick={handleSignOut}
          >
            <LogOut size={16} className="mr-3 opacity-70" />
            Log Out
          </Button>
        </div>
      </aside>

      {/* MOBILE MENU VERLAY */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col">
          <div className="p-4 flex justify-between items-center border-b border-border">
            <Logo size="sm" />
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
              <X className="text-primary" />
            </Button>
          </div>
          <div className="flex-1 p-6 space-y-4">
            {navItems.map((item) => {
              const isExaminerRequired = item.path === "/scan";
              if (isExaminerRequired && role !== "examiner" && role !== "admin") return null;

              return (
                <Link 
                  key={item.name} 
                  to={item.path} 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block"
                >
                  <div className={`flex items-center gap-4 px-4 py-4 rounded-md border border-border/50 ${
                    location.pathname.startsWith(item.path) ? "bg-primary/10 text-primary border-primary/50" : "text-muted-foreground"
                  }`}>
                    <item.icon size={20} />
                    <span className="font-sans font-bold text-sm uppercase tracking-widest">{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <div className="scanline"></div>
        
        {/* TOP BAR */}
        <header className="h-[72px] flex-shrink-0 border-b border-border bg-card/80 backdrop-blur-xl flex items-center justify-between px-4 md:px-8 z-10 sticky top-0">
          <div className="flex items-center gap-4 md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="text-primary" />
            </Button>
          </div>
          
          <div className="flex-1 flex items-center justify-end md:justify-between">
            {/* Left side empty on Desktop, but we can put breadcrumbs here later */}
            <div className="hidden md:block">
              {candidateBadge && (
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                   <span className="font-sans font-bold text-[10px] uppercase tracking-widest text-muted-foreground/60">
                     Active Verification Session
                   </span>
                </div>
              )}
            </div>

            {/* Candidate Badge Right Side */}
            {candidateBadge && (
              <div className="flex items-center gap-4 bg-background/50 backdrop-blur-md px-5 py-2.5 rounded-sm border border-primary/10">
                <div className="font-sans font-bold text-[10px] uppercase tracking-widest flex items-center gap-4">
                  <span className="text-muted-foreground opacity-60">ID</span>
                  <span className="text-primary tracking-tighter text-sm">{candidateBadge.code || "PENDING"}</span>
                  {candidateBadge.name && <span className="hidden sm:inline border-l border-primary/10 pl-4 text-foreground/80">{candidateBadge.name}</span>}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 scroll-smooth">
          <div className="max-w-6xl mx-auto pb-12">
            {children}
          </div>
          
          {/* Footer inside scrolling area */}
          <footer className="max-w-6xl mx-auto mt-auto py-6 border-t border-border/50 text-center md:text-left flex flex-col md:flex-row justify-between gap-4">
             <div className="font-sans font-bold text-[9px] uppercase tracking-[0.3em] text-muted-foreground/40">
               Cadet Protocol 2025–2028
             </div>
             <div className="font-sans font-bold text-[9px] uppercase tracking-[0.3em] text-primary/30">
               Secure Environment
             </div>
          </footer>
        </div>
      </main>
    </div>
  );
};
