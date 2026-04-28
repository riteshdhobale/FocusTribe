import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/useAuth";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { User, LogOut, Settings } from "lucide-react";

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location?.pathname || "/";
  const { isAuthenticated, signOut } = useAuth();

  const isActive = (path: string) => currentPath === path;

  const navLinks = [
    { to: "/", label: "Rooms" },
    { to: "/discover", label: "Discover" },
    { to: "/matches", label: "Matches" },
    { to: "/pricing", label: "Pricing" },
    { to: "/safety", label: "Safety" },
  ] as const;

  return (
    <nav className="sticky top-0 z-50 border-b" style={{ background: "var(--bg-main)", borderColor: "var(--hairline)", backdropFilter: "blur(16px)" }}>
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{ background: "#FF6B9E", color: "#0B1120" }}>
            S
          </span>
          <span className="font-display font-bold text-lg">
            <span style={{ color: "#FF6B9E" }}>Study</span>
            <span style={{ color: "var(--text-primary)" }}>Date</span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map(link => (
            <Link key={link.to} to={link.to}
              className="relative text-sm font-medium transition"
              style={{ color: isActive(link.to) ? "var(--text-primary)" : "var(--text-muted)" }}>
              {link.label}
              {isActive(link.to) && (
                <span className="absolute -bottom-[17px] left-0 right-0 h-0.5 rounded-full" style={{ background: "#FF6B9E" }} />
              )}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-4">
          <Link 
            to="/pricing"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-full border transition hover:opacity-90"
            style={{ 
              borderColor: "rgba(255,107,158,0.4)", 
              color: "#FF6B9E",
              background: "rgba(255,107,158,0.05)"
            }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1-1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
            Upgrade
          </Link>
          
          {isAuthenticated ? (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="w-9 h-9 flex items-center justify-center rounded-full border transition hover:scale-105 outline-none" 
                  style={{ background: "rgba(255,107,158,0.1)", borderColor: "rgba(255,107,158,0.3)", color: "var(--text-primary)" }}>
                  <User size={16} />
                </button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content 
                  className="min-w-[180px] rounded-xl p-1.5 shadow-xl border animate-in fade-in zoom-in-95 duration-200"
                  style={{ background: "var(--bg-card)", borderColor: "var(--hairline)" }}
                  side="bottom" align="end" sideOffset={8}>
                  
                  <DropdownMenu.Item asChild>
                    <Link to="/profile" className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium outline-none cursor-pointer transition-colors"
                      style={{ color: "var(--text-primary)" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <Settings size={16} style={{ color: "var(--text-muted)" }} />
                      Edit Profile
                    </Link>
                  </DropdownMenu.Item>

                  <DropdownMenu.Separator className="h-px my-1" style={{ background: "var(--hairline)" }} />

                  <DropdownMenu.Item asChild>
                    <button onClick={signOut} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium outline-none cursor-pointer transition-colors text-red-400"
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.1)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <LogOut size={16} className="text-red-400/80" />
                      Sign Out
                    </button>
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          ) : (
            <Link to="/"
              className="text-xs font-semibold px-4 py-2 rounded-full transition hover:opacity-90"
              style={{ background: "#FF6B9E", color: "#0B1120" }}>
              Log In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
