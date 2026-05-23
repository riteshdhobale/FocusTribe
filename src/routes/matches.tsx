import { useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { ChatWindow } from "@/components/ChatWindow";
import { ArrowLeft, Heart, Star, Lock, Check, X } from "lucide-react";
import { useActionLimits } from "@/hooks/useActionLimits";
import {
  getMatches,
  getProfileById,
  getMyProfile,
  compatibilityScore,
  type Match,
  type Profile,
} from "@/lib/profiles";

export const Route = createFileRoute("/matches")({
  component: MatchesPage,
  head: () => ({
    meta: [
      { title: "Matches — FocusTribe" },
      { name: "robots", content: "noindex" },
      {
        name: "description",
        content: "Your study partner matches. Chat, schedule sessions, and study together.",
      },
    ],
  }),
});

// ─── Likes You Card (Hinge-style) ────────────────────────────────────────────
// Shows who liked you. Free users see blurred cards. Pro users see full details.
function LikesYouCard({
  profile,
  match,
  compatibility,
  canSee,
  onAccept,
  onReject,
  onUpgrade,
}: {
  profile: Profile;
  match: Match;
  compatibility: number;
  canSee: boolean;
  onAccept: () => void;
  onReject: () => void;
  onUpgrade: () => void;
}) {
  if (!canSee) {
    // Blurred card — shows count but not who
    return (
      <div
        className="relative flex items-center gap-3 p-4 border-b border-[color:var(--hairline)] overflow-hidden cursor-pointer"
        onClick={onUpgrade}
        style={{ background: "rgba(255,107,158,0.03)" }}
      >
        {/* Blurred avatar */}
        <div
          className="w-12 h-12 rounded-full shrink-0 flex items-center justify-center text-xl"
          style={{
            background: `linear-gradient(135deg, ${profile.avatarColor}, #0B1120)`,
            filter: "blur(8px)",
          }}
        >
          {profile.avatarEmoji}
        </div>

        {/* Blurred name + Lock overlay */}
        <div className="flex-1 min-w-0">
          <div
            className="font-semibold text-sm mb-0.5 select-none"
            style={{ filter: "blur(5px)", color: "var(--text-primary)" }}
          >
            {profile.name}
          </div>
          <div
            className="text-xs select-none"
            style={{ filter: "blur(4px)", color: "var(--text-muted)" }}
          >
            {profile.examFocus[0]} · {profile.college}
          </div>
        </div>

        {/* Upgrade CTA */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          <div
            className="h-8 w-8 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,107,158,0.15)" }}
          >
            <Lock className="h-3.5 w-3.5" style={{ color: "#FF6B9E" }} />
          </div>
          <span className="text-[9px] font-bold" style={{ color: "#FF6B9E" }}>
            Upgrade
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative flex items-center gap-3 p-4 border-b border-[color:var(--hairline)] bg-[color:var(--surface-2)]/30 group"
      style={{ borderLeft: "3px solid #FF6B9E" }}
    >
      {/* Like indicator */}
      <div className="absolute top-2 right-2">
        {match.type === "super-like" ? (
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
        ) : (
          <Heart className="h-3 w-3 fill-rose-400 text-rose-400" />
        )}
      </div>

      {/* Avatar */}
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center text-xl shrink-0"
        style={{
          background: `linear-gradient(135deg, ${profile.avatarColor}, color-mix(in oklab, ${profile.avatarColor} 60%, #0B1120))`,
        }}
      >
        {profile.avatarEmoji}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 mb-0.5">
          <h3
            className="font-semibold text-sm truncate"
            style={{ color: "var(--text-primary)" }}
          >
            {profile.name}
          </h3>
          <span className="text-[10px] font-bold shrink-0" style={{ color: "#FF6B9E" }}>
            ✨ {compatibility}%
          </span>
        </div>
        {match.type === "super-like" && (
          <p className="text-[10px] font-bold mb-0.5" style={{ color: "#FFC107" }}>
            ⭐ Super liked you
          </p>
        )}
        <p className="text-xs truncate italic" style={{ color: "var(--text-muted)" }}>
          "{profile.lookingForPrompt || "Looking for a study partner"}"
        </p>
      </div>

      {/* Accept / Reject */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onReject}
          className="h-9 w-9 rounded-full border border-[color:var(--hairline)] flex items-center justify-center transition hover:bg-red-500/10 hover:border-red-400"
          title="Pass"
        >
          <X className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
        </button>
        <button
          onClick={onAccept}
          className="h-9 w-9 rounded-full flex items-center justify-center transition hover:scale-110 active:scale-95"
          style={{
            background: "linear-gradient(135deg, #FF6B9E, #FF8FB5)",
            boxShadow: "0 4px 15px rgba(255,107,158,0.4)",
          }}
          title="Accept & Chat"
        >
          <Check className="h-4 w-4 text-white" />
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
function MatchesPage() {
  const navigate = useNavigate();
  const { canSeeWhoLikedYou, tier, limits, rightRemaining } = useActionLimits();

  const [myProfile, setMyProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [matches, setMatches] = useState<Match[]>([]);
  const [profilesCache, setProfilesCache] = useState<Record<string, Profile>>({});
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [activeTab, setActiveTab] = useState<"likes" | "chats">("likes");

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      const p = await getMyProfile();
      if (!mounted) return;
      setMyProfile(p);
      setLoadingProfile(false);
      if (!p) return;
      const m = await getMatches();
      if (!mounted) return;
      setMatches(m);
      m.forEach(async (match) => {
        const partnerId =
          match.profileA === "me" || match.profileA === p.id ? match.profileB : match.profileA;
        const prof = await getProfileById(partnerId);
        if (prof && mounted) {
          setProfilesCache((prev) => ({ ...prev, [prof.id]: prof }));
        }
      });
    }
    loadData();
    return () => { mounted = false; };
  }, []);

  if (loadingProfile) {
    return (
      <div className="min-h-screen" style={{ background: "var(--bg-main)" }}>
        <Navbar />
        <div className="flex items-center justify-center py-20 text-[color:var(--text-muted)]">
          Loading...
        </div>
      </div>
    );
  }

  if (!myProfile) {
    return (
      <div className="min-h-screen" style={{ background: "var(--bg-main)" }}>
        <Navbar />
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="text-center">
            <span className="text-5xl mb-4 block">💛</span>
            <h2 className="font-display font-bold text-xl mb-2" style={{ color: "var(--text-primary)" }}>
              Set up your profile first
            </h2>
            <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
              Create your profile to start matching
            </p>
            <button
              onClick={() => navigate({ to: "/discover" })}
              className="px-6 py-3 rounded-xl text-sm font-semibold"
              style={{ background: "var(--rose-accent)", color: "#0B1120" }}
            >
              Get started →
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getPartnerId = (m: Match) => {
    // Use the stored _myId when available (set by getMatches) for reliable resolution.
    // Falls back to myProfile.id comparison for any legacy / optimistically-updated records.
    const myId = m._myId ?? myProfile.id;
    return m.profileA === myId ? m.profileB : m.profileA;
  };

  const matchCards = matches
    .map((m) => {
      const partnerId = getPartnerId(m);
      const prof = profilesCache[partnerId];
      if (!prof) return null;
      return { match: m, profile: prof, compatibility: compatibilityScore(myProfile, prof) };
    })
    .filter(Boolean) as { match: Match; profile: Profile; compatibility: number }[];

  // "Likes You" = pending requests sent TO me (I haven't responded yet)
  const pendingLikes = matchCards.filter((mc) => mc.match.status === "pending");
  const activeMatches = matchCards.filter((mc) => mc.match.status === "matched");

  const selectedMatch = selectedMatchId ? matches.find((m) => m.id === selectedMatchId) : null;
  const selectedPartnerId = selectedMatch ? getPartnerId(selectedMatch) : null;
  const selectedProfile = selectedPartnerId ? profilesCache[selectedPartnerId] : null;
  const showMobileChat = showChat && selectedMatch && selectedProfile;

  const handleAccept = async (matchId: string) => {
    const { updateMatch } = await import("@/lib/profiles");
    await updateMatch(matchId, { status: "matched" });
    setMatches((prev) => prev.map((m) => (m.id === matchId ? { ...m, status: "matched" } : m)));
    // Auto-open chat after accepting
    setSelectedMatchId(matchId);
    setShowChat(true);
    setActiveTab("chats");
  };

  const handleReject = async (matchId: string) => {
    const { updateMatch } = await import("@/lib/profiles");
    await updateMatch(matchId, { status: "unmatched" });
    setMatches((prev) => prev.map((m) => (m.id === matchId ? { ...m, status: "unmatched" } : m)));
    if (selectedMatchId === matchId) { setSelectedMatchId(null); setShowChat(false); }
  };

  const selectMatch = (matchId: string) => {
    setSelectedMatchId(matchId);
    setShowChat(true);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: "var(--bg-main)" }}>
      <div className="shrink-0"><Navbar /></div>

      <div className="flex-1 flex overflow-hidden border-t border-[color:var(--hairline)]">

        {/* ── Left Sidebar ── */}
        <div
          className={`w-full md:w-[320px] lg:w-[380px] shrink-0 md:border-r border-[color:var(--hairline)] flex flex-col bg-[color:var(--bg-main)] ${showMobileChat ? "hidden md:flex" : "flex"}`}
        >
          {/* Tabs */}
          <div className="border-b border-[color:var(--hairline)] shrink-0">
            <div className="flex">
              <button
                onClick={() => setActiveTab("likes")}
                className={`flex-1 py-3.5 text-sm font-semibold flex items-center justify-center gap-2 transition border-b-2 ${
                  activeTab === "likes"
                    ? "border-[#FF6B9E] text-[#FF6B9E]"
                    : "border-transparent text-[color:var(--text-muted)]"
                }`}
              >
                <Heart className="h-4 w-4" />
                Likes You
                {pendingLikes.length > 0 && (
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: "#FF6B9E", color: "#0B1120" }}
                  >
                    {pendingLikes.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("chats")}
                className={`flex-1 py-3.5 text-sm font-semibold flex items-center justify-center gap-2 transition border-b-2 ${
                  activeTab === "chats"
                    ? "border-[#FF6B9E] text-[#FF6B9E]"
                    : "border-transparent text-[color:var(--text-muted)]"
                }`}
              >
                💬 Chats
                {activeMatches.length > 0 && (
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}
                  >
                    {activeMatches.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">

            {/* ── LIKES YOU TAB ── */}
            {activeTab === "likes" && (
              <>
                {/* Swipe quota banner */}
                <div
                  className="px-4 py-3 flex items-center justify-between border-b border-[color:var(--hairline)]"
                  style={{ background: "rgba(255,107,158,0.04)" }}
                >
                  <div>
                    <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                      {tier === "free"
                        ? `${rightRemaining} likes left today`
                        : tier === "pro"
                        ? `${rightRemaining === Infinity ? "∞" : rightRemaining} likes left`
                        : "Unlimited likes"}
                    </p>
                    <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                      {tier === "free" ? "Upgrade for 15/day + see who liked you" : `${tier === "pro" ? "Pro" : "Annual"} plan`}
                    </p>
                  </div>
                  {tier === "free" && (
                    <button
                      onClick={() => navigate({ to: "/pricing" })}
                      className="text-[10px] font-bold px-3 py-1.5 rounded-full transition hover:opacity-90"
                      style={{ background: "#FF6B9E", color: "#0B1120" }}
                    >
                      Upgrade
                    </button>
                  )}
                </div>

                {/* Free users: blurred teaser */}
                {!canSeeWhoLikedYou && pendingLikes.length > 0 && (
                  <div
                    className="mx-4 mt-4 mb-2 p-4 rounded-2xl text-center cursor-pointer"
                    style={{
                      background: "linear-gradient(135deg, rgba(255,107,158,0.1), rgba(255,107,158,0.05))",
                      border: "1px solid rgba(255,107,158,0.25)",
                    }}
                    onClick={() => navigate({ to: "/pricing" })}
                  >
                    <div className="flex -space-x-3 justify-center mb-3">
                      {pendingLikes.slice(0, 3).map(({ profile }) => (
                        <div
                          key={profile.id}
                          className="w-10 h-10 rounded-full border-2 border-[color:var(--bg-main)] flex items-center justify-center text-lg"
                          style={{
                            background: `linear-gradient(135deg, ${profile.avatarColor}, #0B1120)`,
                            filter: "blur(6px)",
                          }}
                        >
                          {profile.avatarEmoji}
                        </div>
                      ))}
                    </div>
                    <p className="font-bold text-sm mb-1" style={{ color: "var(--text-primary)" }}>
                      {pendingLikes.length} {pendingLikes.length === 1 ? "person" : "people"} liked you
                    </p>
                    <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
                      Upgrade to Pro to see who
                    </p>
                    <button
                      className="text-xs font-bold px-4 py-2 rounded-full"
                      style={{ background: "#FF6B9E", color: "#0B1120" }}
                    >
                      See who liked you →
                    </button>
                  </div>
                )}

                {/* Like cards */}
                {pendingLikes.length === 0 ? (
                  <div className="p-8 text-center">
                    <span className="text-4xl mb-3 block">💌</span>
                    <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                      No likes yet
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      Keep your profile updated — likes will appear here
                    </p>
                  </div>
                ) : (
                  pendingLikes.map(({ match, profile, compatibility }) => (
                    <LikesYouCard
                      key={match.id}
                      profile={profile}
                      match={match}
                      compatibility={compatibility}
                      canSee={canSeeWhoLikedYou}
                      onAccept={() => handleAccept(match.id)}
                      onReject={() => handleReject(match.id)}
                      onUpgrade={() => navigate({ to: "/pricing" })}
                    />
                  ))
                )}
              </>
            )}

            {/* ── CHATS TAB ── */}
            {activeTab === "chats" && (
              <>
                {activeMatches.length === 0 ? (
                  <div className="p-8 text-center">
                    <span className="text-4xl mb-3 block">💬</span>
                    <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                      No active chats yet
                    </p>
                    <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
                      Accept a like to start chatting
                    </p>
                    <button
                      onClick={() => setActiveTab("likes")}
                      className="text-xs font-semibold px-4 py-2 rounded-full border border-[color:var(--hairline)] transition hover:bg-[color:var(--surface)]"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      View Likes →
                    </button>
                  </div>
                ) : (
                  activeMatches.map(({ match, profile, compatibility }) => {
                    const isSelected = selectedMatchId === match.id;
                    return (
                      <div
                        key={match.id}
                        onClick={() => selectMatch(match.id)}
                        className={`flex items-center gap-3 p-4 cursor-pointer border-b border-[color:var(--hairline)] transition hover:bg-[color:var(--surface)] ${isSelected ? "bg-[color:var(--surface)]" : ""}`}
                      >
                        <div className="relative shrink-0">
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                            style={{
                              background: `linear-gradient(135deg, ${profile.avatarColor}, color-mix(in oklab, ${profile.avatarColor} 60%, #0B1120))`,
                            }}
                          >
                            {profile.avatarEmoji}
                          </div>
                          {profile.isOnline && (
                            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[color:var(--bg-main)] bg-emerald-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline mb-0.5">
                            <h3 className="font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>
                              {profile.name}
                            </h3>
                            <span className="text-[10px] font-bold shrink-0" style={{ color: "#FF6B9E" }}>
                              ✨ {compatibility}%
                            </span>
                          </div>
                          <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                            {profile.examFocus[0]} · {profile.college}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </>
            )}
          </div>
        </div>

        {/* ── Right: Chat Window ── */}
        <div
          className={`flex-1 flex flex-col bg-[color:var(--bg-main)] relative overflow-hidden ${showMobileChat ? "flex" : "hidden md:flex"}`}
        >
          {showMobileChat && (
            <button
              onClick={() => { setShowChat(false); setSelectedMatchId(null); }}
              className="md:hidden flex items-center gap-2 px-4 py-3 text-sm font-medium border-b border-[color:var(--hairline)] shrink-0 transition hover:bg-[color:var(--surface)]"
              style={{ color: "var(--text-secondary)" }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to chats
            </button>
          )}

          {showChat && selectedMatch && selectedProfile ? (
            <ChatWindow
              match={selectedMatch}
              partner={selectedProfile}
              onStatusChange={(status) => {
                setMatches((prev) => prev.map((m) => (m.id === selectedMatch.id ? { ...m, status } : m)));
                if (status === "unmatched") { setSelectedMatchId(null); setShowChat(false); }
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: "var(--surface-2)" }}>
                <span className="text-2xl">💬</span>
              </div>
              <h2 className="font-display font-bold text-xl mb-2">Your Messages</h2>
              <p className="text-sm text-[color:var(--text-muted)] max-w-sm">
                Accept a like to start chatting. Share notes, plan sessions, and build your study circle.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
