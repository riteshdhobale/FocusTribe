import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/useAuth";

type Props = {
  open: boolean;
  onClose: () => void;
  redirectTo?: string;
};

export function WelcomeModal({ open, onClose, redirectTo }: Props) {
  const navigate = useNavigate();
  const { signInWithGoogle, isAuthenticated } = useAuth();

  useEffect(() => {
    if (open && isAuthenticated) {
      onClose();
      if (redirectTo) navigate({ to: redirectTo });
    }
  }, [open, isAuthenticated, onClose, navigate, redirectTo]);

  if (!open) return null;

  const handleGoogleLogin = async () => {
    await signInWithGoogle();
    onClose();
    if (redirectTo) navigate({ to: redirectTo });
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      style={{ background: "color-mix(in oklab, #0B1120 70%, transparent)", backdropFilter: "blur(12px)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="surface-card w-full max-w-md p-8 animate-fade-up text-center"
        style={{ borderColor: "color-mix(in oklab, #FF6B9E 35%, transparent)" }}
      >
        <h3 className="text-2xl font-display font-bold mb-2">
          Welcome to <span className="text-rose-gradient">StudyDate</span> 🎯
        </h3>
        <p className="text-sm text-[color:var(--text-secondary)] mb-6">
          Sign in to join live study rooms and track your pomodoro sessions.
        </p>
        <button
          onClick={handleGoogleLogin}
          className="mt-2 w-full btn-pill bg-white text-black font-bold py-3 hover:opacity-95 transition flex items-center justify-center gap-3"
          style={{ boxShadow: "var(--shadow-rose)" }}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/></svg>
          Continue with Google
        </button>
      </div>
    </div>
  );
}
