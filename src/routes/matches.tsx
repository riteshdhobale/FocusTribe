import { useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { ChatWindow } from "@/components/ChatWindow";
import { ConversationStarters } from "@/components/ConversationStarters";
import { INTENTS, ACADEMIC_FOCUS } from "@/lib/constants";
import { getMatches, getProfileById, getMyProfile, compatibilityScore, type Match, type Profile } from "@/lib/profiles";

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
    getMyProfile().then(p => {
      setMyProfile(p);
      setLoadingProfile(false);
      
      const m = getMatches();
      setMatches(m);
      
      // Fetch profiles for all matches
      m.forEach(match => {
        getProfileById(match.profileB).then(prof => {
          if (prof) {
            setProfilesCache(prev => ({ ...prev, [prof.id]: prof }));
          }
        });
      });
    });
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
            <h2 className="font-display font-bold text-xl mb-2" style={{ color: "var(--text-primary)" }}>Set up your profile first</h2>
            <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>Create your profile to start matching</p>
            <button onClick={() => navigate({ to: "/discover" })} className="px-6 py-3 rounded-xl text-sm font-semibold" style={{ background: "var(--rose-accent)", color: "#0B1120" }}>
              Get started →
            </button>
          </div>
        </div>
      </div>
    );
  }

  const selectedMatch = selectedMatchId ? matches.find(m => m.id === selectedMatchId) : null;
  const selectedProfile = selectedMatch ? profilesCache[selectedMatch.profileB] : null;

  // Get matched profiles with details
  const matchCards = matches.map(m => {
    const prof = profilesCache[m.profileB];
    if (!prof) return null;
    const compat = compatibilityScore(myProfile, prof);
    return { match: m, profile: prof, compatibility: compat };
  }).filter(Boolean) as { match: Match; profile: Profile; compatibility: number }[];

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-main)" }}>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 pt-6 pb-16">
        {matches.length === 0 ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center max-w-md">
              <span className="text-5xl mb-4 block">💛</span>
              <h2 className="font-display font-bold text-2xl mb-2" style={{ color: "var(--text-primary)" }}>No matches yet</h2>
              <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>Keep swiping in Discover to find your study dates!</p>
              <button onClick={() => navigate({ to: "/discover" })} className="px-6 py-3 rounded-xl text-sm font-semibold" style={{ background: "var(--rose-accent)", color: "#0B1120" }}>
                Go to Discover →
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Match list */}
            <div>
              <div className="mb-6">
                <span className="text-xs font-mono tracking-widest uppercase mb-1 block" style={{ color: "var(--rose-accent)" }}>Matches</span>
                <h1 className="font-display font-bold text-2xl mb-2" style={{ color: "var(--text-primary)" }}>People who matched your ambition</h1>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  Use compatibility insights, smart openers, and study-date suggestions to turn a match into momentum.
                </p>
              </div>

              <div className="flex items-center justify-end mb-4">
                <span className="text-xs px-3 py-1.5 rounded-full border" style={{ borderColor: "var(--hairline)", color: "var(--text-muted)" }}>
                  {matches.length} active matches
                </span>
              </div>

              <div className="space-y-3">
                {matchCards.map(({ match, profile, compatibility }) => {
                  const intentObj = INTENTS.find(i => i.value === profile.intent);
                  const examLabels = profile.examFocus.map(e => ACADEMIC_FOCUS.find(a => a.value === e)?.label || e);

                  return (
                    <div key={match.id}
                      className="p-4 rounded-2xl border transition hover:border-[color:var(--rose-accent)]"
                      style={{ borderColor: selectedMatchId === match.id ? "var(--rose-accent)" : "var(--hairline)", background: "var(--bg-card)" }}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-display font-bold text-lg" style={{ color: "var(--text-primary)" }}>
                            {profile.name}, {profile.age}
                          </h3>
                          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                            {profile.college} · {profile.city}
                          </p>
                        </div>
                        <span className="text-sm font-bold" style={{ color: "var(--rose-accent)" }}>✨ {compatibility}%</span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {intentObj && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium border" style={{ borderColor: "var(--hairline)", color: "var(--text-secondary)" }}>
                            {intentObj.label}
                          </span>
                        )}
                        {examLabels.map(e => (
                          <span key={e} className="px-2 py-0.5 rounded-md text-[10px] font-medium border" style={{ borderColor: "var(--hairline)", color: "var(--text-secondary)" }}>
                            {e}
                          </span>
                        ))}
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium border" style={{ borderColor: "var(--hairline)", color: "var(--text-secondary)" }}>
                          {profile.careerGoal}
                        </span>
                      </div>

                      <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
                        {profile.lookingForPrompt || profile.bio}
                      </p>

                      <div className="flex gap-2">
                        <button onClick={() => { setSelectedMatchId(match.id); setShowChat(true); }}
                          className="px-4 py-2 rounded-xl text-xs font-semibold transition"
                          style={{ background: "var(--rose-accent)", color: "#0B1120" }}>
                          💬 Start chat
                        </button>
                        <button onClick={() => navigate({ to: "/discover" })}
                          className="px-4 py-2 rounded-xl text-xs font-medium border transition"
                          style={{ borderColor: "var(--hairline)", color: "var(--text-secondary)" }}>
                          📅 Suggest study date
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Conversation starters or Chat */}
            <div>
              {showChat && selectedMatch && selectedProfile ? (
                <div>
                  <button onClick={() => setShowChat(false)}
                    className="text-xs font-medium mb-4 transition"
                    style={{ color: "var(--text-muted)" }}>
                    ← Back to starters
                  </button>
                  <ChatWindow
                    match={selectedMatch}
                    partner={selectedProfile}
                  />
                </div>
              ) : (
                <ConversationStarters matchExamFocus={selectedProfile?.examFocus} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
