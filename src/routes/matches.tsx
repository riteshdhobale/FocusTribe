import { useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { ChatWindow } from "@/components/ChatWindow";
import { ConversationStarters } from "@/components/ConversationStarters";
import { INTENTS, ACADEMIC_FOCUS } from "@/lib/constants";
import { ArrowLeft } from "lucide-react";
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
  head: () => ({ meta: [{ title: "Matches — StudyDate" }] }),
});

function MatchesPage() {
  const navigate = useNavigate();
  const [myProfile, setMyProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [matches, setMatches] = useState<Match[]>([]);
  const [profilesCache, setProfilesCache] = useState<Record<string, Profile>>({});
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);

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

      // Fetch profiles for all matches
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

    return () => {
      mounted = false;
    };
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
            <h2
              className="font-display font-bold text-xl mb-2"
              style={{ color: "var(--text-primary)" }}
            >
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

  const selectedMatch = selectedMatchId ? matches.find((m) => m.id === selectedMatchId) : null;
  const selectedPartnerId = selectedMatch
    ? selectedMatch.profileA === "me" || selectedMatch.profileA === myProfile.id
      ? selectedMatch.profileB
      : selectedMatch.profileA
    : null;
  const selectedProfile = selectedPartnerId ? profilesCache[selectedPartnerId] : null;

  // Get matched profiles with details
  const matchCards = matches
    .map((m) => {
      const partnerId =
        m.profileA === "me" || m.profileA === myProfile.id ? m.profileB : m.profileA;
      const prof = profilesCache[partnerId];
      if (!prof) return null;
      const compat = compatibilityScore(myProfile, prof);
      return { match: m, profile: prof, compatibility: compat };
    })
    .filter(Boolean) as { match: Match; profile: Profile; compatibility: number }[];

  const pendingRequests = matchCards.filter((mc) => mc.match.status === "pending");
  const activeMatches = matchCards.filter((mc) => mc.match.status === "matched");

  const handleAccept = async (matchId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const { updateMatch } = await import("@/lib/profiles");
    await updateMatch(matchId, { status: "matched" });
    setMatches((prev) => prev.map((m) => (m.id === matchId ? { ...m, status: "matched" } : m)));
  };

  const handleReject = async (matchId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const { updateMatch } = await import("@/lib/profiles");
    await updateMatch(matchId, { status: "unmatched" });
    setMatches((prev) => prev.map((m) => (m.id === matchId ? { ...m, status: "unmatched" } : m)));
    if (selectedMatchId === matchId) {
      setSelectedMatchId(null);
      setShowChat(false);
    }
  };

  const selectMatch = (matchId: string) => {
    setSelectedMatchId(matchId);
    setShowChat(true);
  };

  const goBackToList = () => {
    setShowChat(false);
    setSelectedMatchId(null);
  };

  // Mobile: show either list or chat, not both
  const showMobileChat = showChat && selectedMatch && selectedProfile;

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{ background: "var(--bg-main)" }}
    >
      <div className="shrink-0">
        <Navbar />
      </div>

      <div className="flex-1 flex overflow-hidden border-t border-[color:var(--hairline)]">
        {/* Left Sidebar: Match List — hidden on mobile when chat is open */}
        <div
          className={`w-full md:w-[320px] lg:w-[380px] shrink-0 md:border-r border-[color:var(--hairline)] flex flex-col bg-[color:var(--bg-main)] ${showMobileChat ? "hidden md:flex" : "flex"}`}
        >
          <div className="p-4 border-b border-[color:var(--hairline)] flex items-center justify-between shrink-0">
            <h1 className="font-display font-bold text-xl">Chats</h1>
            <span className="text-xs px-2 py-1 rounded-md bg-[color:var(--surface-2)] text-[color:var(--text-muted)]">
              {activeMatches.length} active
            </span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {matches.length === 0 ? (
              <div className="p-6 text-center text-sm text-[color:var(--text-muted)]">
                No matches yet. Keep swiping in Discover!
              </div>
            ) : (
              <div className="flex flex-col">
                {/* Pending Requests */}
                {pendingRequests.length > 0 && (
                  <div className="mb-2">
                    <div className="px-4 py-2 bg-[color:var(--surface)] border-b border-[color:var(--hairline)]">
                      <span className="text-xs font-mono uppercase tracking-widest text-[color:var(--rose-accent)]">
                        Likes You ({pendingRequests.length})
                      </span>
                    </div>
                    {pendingRequests.map(({ match, profile, compatibility }) => {
                      const isSelected = selectedMatchId === match.id;
                      return (
                        <div
                          key={match.id}
                          onClick={() => selectMatch(match.id)}
                          className={`flex items-center gap-3 p-4 cursor-pointer border-b border-[color:var(--hairline)] transition hover:bg-[color:var(--surface)] relative overflow-hidden group ${isSelected ? "bg-[color:var(--surface)]" : "bg-[color:var(--surface-2)]/30"}`}
                        >
                          <div className="absolute top-0 left-0 w-1 h-full bg-rose-gradient opacity-50" />

                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-xl shrink-0"
                            style={{
                              background: `linear-gradient(135deg, ${profile.avatarColor}, color-mix(in oklab, ${profile.avatarColor} 60%, #0B1120))`,
                            }}
                          >
                            {profile.avatarEmoji}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3
                              className="font-semibold text-sm truncate pr-2"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {profile.name}{" "}
                              <span className="text-[10px] text-[color:var(--text-muted)] font-normal ml-1">
                                ✨ {compatibility}%
                              </span>
                            </h3>
                            <p className="text-xs text-[color:var(--text-muted)] truncate italic">
                              "{profile.lookingForPrompt || "Looking for a study partner"}"
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={(e) => handleReject(match.id, e)}
                              className="h-8 w-8 rounded-full border border-[color:var(--hairline)] flex items-center justify-center text-[color:var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 transition"
                            >
                              ✕
                            </button>
                            <button
                              onClick={(e) => handleAccept(match.id, e)}
                              className="h-8 w-8 rounded-full bg-rose-gradient text-white flex items-center justify-center hover:scale-105 active:scale-95 transition"
                              style={{ boxShadow: "0 4px 15px rgba(255,107,158,0.3)" }}
                            >
                              ✓
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Active Chats */}
                {activeMatches.map(({ match, profile, compatibility }) => {
                  const isSelected = selectedMatchId === match.id;
                  return (
                    <div
                      key={match.id}
                      onClick={() => selectMatch(match.id)}
                      className={`flex items-center gap-3 p-4 cursor-pointer border-b border-[color:var(--hairline)] transition hover:bg-[color:var(--surface)] ${
                        isSelected ? "bg-[color:var(--surface)]" : ""
                      }`}
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
                        <div className="flex justify-between items-baseline mb-1">
                          <h3
                            className="font-semibold text-sm truncate pr-2"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {profile.name}
                          </h3>
                          <span className="text-[10px] text-[color:var(--rose-accent)] font-bold shrink-0">
                            ✨ {compatibility}%
                          </span>
                        </div>
                        <p className="text-xs text-[color:var(--text-muted)] truncate">
                          {profile.examFocus[0]} · {profile.college}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Area: Chat Window — fullscreen on mobile when chat is selected */}
        <div
          className={`flex-1 flex flex-col bg-[color:var(--bg-main)] relative overflow-hidden ${showMobileChat ? "flex" : "hidden md:flex"}`}
        >
          {/* Mobile back button */}
          {showMobileChat && (
            <button
              onClick={goBackToList}
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
                setMatches((prev) =>
                  prev.map((m) => (m.id === selectedMatch.id ? { ...m, status } : m)),
                );
                if (status === "unmatched") {
                  setSelectedMatchId(null);
                  setShowChat(false);
                }
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{ background: "var(--surface-2)" }}
              >
                <span className="text-2xl">💬</span>
              </div>
              <h2 className="font-display font-bold text-xl mb-2">Your Messages</h2>
              <p className="text-sm text-[color:var(--text-muted)] max-w-sm">
                Select a match from the sidebar to view your conversation, share notes, and schedule
                study dates.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
