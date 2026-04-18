import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/cadet/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/dashboard` },
        });
        if (error) throw error;
        toast.success("CANDIDATE REGISTERED // Profile shell created");
        navigate("/intake");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("ACCESS GRANTED");
        navigate("/dashboard");
      }
    } catch (err: any) {
      toast.error(err?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid-tactical flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="flex justify-center mb-8">
          <Logo size="md" showTagline />
        </div>

        <div className="glass-panel-strong corner-bracket p-8">
          <div className="mb-6">
            <div className="font-command text-xs uppercase tracking-widest text-primary mb-2">
              {mode === "signup" ? "■ NEW CANDIDATE REGISTRATION" : "■ RETURNING CANDIDATE"}
            </div>
            <h1 className="text-2xl font-display text-primary text-glow-gold">
              {mode === "signup" ? "Initialise Profile" : "Restore Session"}
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-mono-tac text-xs uppercase tracking-widest text-muted-foreground">
                Identifier // Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-input/50 border-primary/30 focus:border-primary font-mono-tac"
                placeholder="cadet@protocol.in"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="font-mono-tac text-xs uppercase tracking-widest text-muted-foreground">
                Authentication Key
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="bg-input/50 border-primary/30 focus:border-primary font-mono-tac"
                placeholder="••••••••"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-gold text-primary-foreground hover:opacity-90 font-mono-tac uppercase tracking-widest text-xs h-11"
            >
              {loading ? "PROCESSING //" : mode === "signup" ? "■ INITIALISE" : "■ AUTHENTICATE"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-primary/15 text-center">
            <button
              onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
              className="font-mono-tac text-xs uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
            >
              {mode === "signup" ? "Already enrolled? Sign in →" : "New candidate? Register →"}
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-[10px] font-mono-tac uppercase tracking-widest text-muted-foreground">
          RESTRICTED — AUTHORISED PERSONNEL ONLY
        </p>
      </motion.div>
    </div>
  );
}
