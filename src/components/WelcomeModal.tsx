import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";

type Props = {
  open: boolean;
  onClose: () => void;
  redirectTo?: string;
};

export function WelcomeModal({ open, onClose, redirectTo }: Props) {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      const existing = localStorage.getItem("ft_name");
      if (existing) setName(existing);
    }
  }, [open]);

  if (!open) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    localStorage.setItem("ft_name", name.trim());
    onClose();
    if (redirectTo) navigate({ to: redirectTo });
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      style={{ background: "color-mix(in oklab, #0B1120 70%, transparent)", backdropFilter: "blur(12px)" }}
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="surface-card w-full max-w-md p-8 animate-fade-up"
        style={{ borderColor: "color-mix(in oklab, var(--gold) 35%, transparent)" }}
      >
        <h3 className="text-2xl font-display font-bold mb-2">
          Welcome to <span className="text-gold-gradient">FocusTribe</span> 🎯
        </h3>
        <p className="text-sm text-[color:var(--text-secondary)] mb-6">
          Enter your name to join study rooms.
        </p>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="w-full bg-[color:var(--surface-2)] border border-[color:var(--hairline)] rounded-xl px-4 py-3 outline-none transition focus:border-[color:var(--gold)]"
          style={{ boxShadow: "none" }}
          onFocus={(e) => (e.currentTarget.style.boxShadow = "0 0 0 4px color-mix(in oklab, var(--gold) 20%, transparent)")}
          onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
        />
        <button
          type="submit"
          className="mt-5 w-full btn-pill bg-gold-gradient text-[color:var(--primary-foreground)] font-semibold py-3 hover:opacity-95 transition"
          style={{ boxShadow: "var(--shadow-gold)" }}
        >
          Join the Tribe →
        </button>
      </form>
    </div>
  );
}
