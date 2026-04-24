import { Link } from "@tanstack/react-router";

export function Navbar() {
  return (
    <header className="glass-nav fixed top-0 inset-x-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="h-8 w-8 rounded-xl bg-gold-gradient flex items-center justify-center text-[hsl(var(--background))] font-black">
            F
          </div>
          <span className="font-display font-extrabold text-lg tracking-tight">
            Focus<span className="text-gold-gradient">Tribe</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-[color:var(--text-secondary)]">
          <a href="#rooms" className="hover:text-[color:var(--text-primary)] transition">Rooms</a>
          <a href="#features" className="hover:text-[color:var(--text-primary)] transition">Features</a>
          <a href="#pricing" className="hover:text-[color:var(--text-primary)] transition">Pricing</a>
        </nav>
        <a
          href="#rooms"
          className="btn-pill bg-gold-gradient text-[color:var(--primary-foreground)] px-5 py-2 text-sm font-semibold hover:opacity-95 transition"
          style={{ boxShadow: "var(--shadow-gold)" }}
        >
          Start studying
        </a>
      </div>
    </header>
  );
}
