import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: "candidate" | "examiner" | "admin";
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="font-sans font-bold text-xs uppercase tracking-widest text-primary animate-breathe">
          AUTHENTICATING
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  if (requiredRole && role !== requiredRole && role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
