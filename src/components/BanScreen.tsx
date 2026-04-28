import { Shield, Mail } from "lucide-react";

type BanScreenProps = {
  reason: string | null;
  banType: "warning" | "temporary" | "permanent" | "ip_ban" | null;
  expiresAt: string | null;
};

export function BanScreen({ reason, banType, expiresAt }: BanScreenProps) {
  const isPermanent = banType === "permanent" || banType === "ip_ban";
  const expiresDate = expiresAt ? new Date(expiresAt) : null;

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--bg-main)" }}>
      <div className="w-full max-w-md text-center">
        {/* Icon */}
        <div className="h-20 w-20 rounded-full mx-auto flex items-center justify-center mb-6"
          style={{ background: "rgba(239,68,68,0.1)", border: "2px solid #EF4444" }}>
          <Shield className="h-9 w-9" style={{ color: "#EF4444" }} />
        </div>

        <h1 className="font-display font-bold text-2xl mb-2" style={{ color: "var(--text-primary)" }}>
          {isPermanent ? "Account Suspended" : "Account Temporarily Restricted"}
        </h1>

        <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
          {isPermanent
            ? "Your account has been permanently suspended for violating our Community Guidelines."
            : "Your account has been temporarily restricted due to reported behavior."}
        </p>

        {/* Reason card */}
        {reason && (
          <div className="p-4 rounded-2xl border mb-6 text-left"
            style={{ borderColor: "var(--hairline)", background: "var(--bg-card)" }}>
            <span className="text-[10px] font-mono tracking-widest uppercase block mb-2"
              style={{ color: "var(--text-muted)" }}>
              Reason
            </span>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {reason}
            </p>
          </div>
        )}

        {/* Expiry info */}
        {!isPermanent && expiresDate && (
          <div className="p-4 rounded-2xl border mb-6"
            style={{ borderColor: "var(--hairline)", background: "var(--bg-card)" }}>
            <span className="text-[10px] font-mono tracking-widest uppercase block mb-2"
              style={{ color: "var(--text-muted)" }}>
              Access Resumes
            </span>
            <p className="text-sm font-semibold" style={{ color: "var(--rose-accent)" }}>
              {expiresDate.toLocaleDateString("en-US", {
                weekday: "long", year: "numeric", month: "long", day: "numeric",
                hour: "2-digit", minute: "2-digit",
              })}
            </p>
          </div>
        )}

        {/* Appeal */}
        <div className="p-4 rounded-2xl border mb-6 text-left"
          style={{ borderColor: "var(--hairline)", background: "var(--bg-card)" }}>
          <span className="text-[10px] font-mono tracking-widest uppercase block mb-2"
            style={{ color: "var(--text-muted)" }}>
            Think this is a mistake?
          </span>
          <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>
            If you believe this action was taken in error, you can appeal by contacting our safety team.
          </p>
          <a href="mailto:safety@studydate.app"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition hover:opacity-80"
            style={{ borderColor: "var(--hairline)", color: "var(--text-primary)" }}>
            <Mail className="h-4 w-4" />
            safety@studydate.app
          </a>
        </div>

        {/* Community guidelines link */}
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          Review our{" "}
          <a href="/safety" className="underline" style={{ color: "var(--rose-accent)" }}>
            Community Guidelines
          </a>{" "}
          to understand our safety policies.
        </p>
      </div>
    </div>
  );
}
