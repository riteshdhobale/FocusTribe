import { useState, useCallback, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { SwipeCard } from "@/components/SwipeCard";
import { MatchFilters } from "@/components/MatchFilters";
import { ProfileSetup } from "@/components/ProfileSetup";
import { MatchCelebration } from "@/components/MatchCelebration";
import { SendPromptModal } from "@/components/SendPromptModal";
import { AuthPage } from "@/components/AuthPage";
import { BanScreen } from "@/components/BanScreen";
import { useAuth } from "@/lib/useAuth";
import { useBanCheck } from "@/lib/useBanCheck";
import { useActionLimits, incrementSparksUsed, SWIPE_LIMITS } from "@/hooks/useActionLimits";
import {
  getMyProfile,
  getFilteredDeck,
  getPreferences,
  savePreferences,
  addToSwipeHistory,
  compatibilityScore,
  sendMessage,
  type Profile,
  type MatchPreferences,
  type Match,
  type Message,
} from "@/lib/profiles";

export const Route = createFileRoute("/discover")({
  component: DiscoverPage,
  errorComponent: ({ error }) => (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--bg-main)" }}
    >
      <div className="text-center max-w-md">
        <span className="text-5xl mb-4 block">📚</span>
        <h1
          className="font-display font-bold text-2xl mb-2"
          style={{ color: "var(--text-primary)" }}
        >
          Loading StudyDate...
        </h1>
        <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
          {String(error?.message || "Something went wrong. Try refreshing.")}
        </p>
        <button
          onClick={() => (window.location.href = "/discover")}
          className="px-6 py-3 rounded-xl text-sm font-semibold"
          style={{ background: "#FF6B9E", color: "#0B1120" }}
        >
          Refresh
        </button>
      </div>
    </div>
  ),
  head: () => ({ meta: [{ title: "Discover — StudyDate" }] }),
});

function DiscoverPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isSupabaseMode, loading: authLoading } = useAuth();
  const {
    isBanned,
    reason: banReason,
    banType,
    expiresAt: banExpiry,
    loading: banLoading,
  } = useBanCheck();
  const [demoMode, setDemoMode] = useState(false);
  const [myProfile, setMyProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [prefs, setPrefs] = useState<MatchPreferences>(getPreferences());
  const [deck, setDeck] = useState<Profile[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [celebration, setCelebration] = useState<Profile | null>(null);
  const limits = useActionLimits();
  const { canRightSwipe, rightRemaining, canSendSpark, sparkRemaining } = limits;
  const [showPromptModal, setShowPromptModal] = useState<Profile | null>(null);
  const [showSparkModal, setShowSparkModal] = useState<Profile | null>(null);

  const refreshDeck = useCallback(async () => {
    const filtered = await getFilteredDeck(prefs);
    setDeck(filtered);
    setCurrentIdx(0);
  }, [prefs]);

  useEffect(() => {
    getMyProfile().then((p) => {
      setMyProfile(p);
      setLoadingProfile(false);
    });
  }, []);

  useEffect(() => {
    if (myProfile) refreshDeck();
  }, [myProfile, refreshDeck]);

  const handlePrefsChange = (newPrefs: MatchPreferences) => {
    setPrefs(newPrefs);
    savePreferences(newPrefs);
  };

  const handleSetupComplete = () => {
    getMyProfile().then((p) => setMyProfile(p));
  };

  const handleSwipe = async (action: "like" | "pass" | "super") => {
    const profile = deck[currentIdx];
    if (!profile || !myProfile) return;

    // Optimistically advance to keep UI snappy
    if (currentIdx + 1 < deck.length) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      refreshDeck();
    }

    const dbAction = action === "pass" ? "left" : action === "super" ? "super-like" : "right";
    await addToSwipeHistory(profile.id, dbAction);

    // Check if the trigger auto-created a match (meaning it was a mutual like)
    if (action === "like" || action === "super") {
      import("@/lib/supabase").then(async ({ supabase }) => {
        // Query to see if a match exists between these two users
        const { data } = await supabase
          .from("matches")
          .select("id")
          .or(
            `and(profile_a.eq.${myProfile.id},profile_b.eq.${profile.id}),and(profile_a.eq.${profile.id},profile_b.eq.${myProfile.id})`,
          )
          .single();

        if (data) {
          setCelebration(profile);
        }
      });
    }
  };

  const dismissCelebration = (goToChat: boolean) => {
    setCelebration(null);
    if (goToChat) {
      navigate({ to: "/matches" });
    }
  };

  // Auth loading
  if (authLoading || banLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--bg-main)" }}
      >
        <div className="text-center">
          <div
            className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center animate-pulse"
            style={{ background: "#FF6B9E" }}
          >
            <span className="font-bold" style={{ color: "#0B1120" }}>
              S
            </span>
          </div>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // Ban check
  if (isBanned) {
    return <BanScreen reason={banReason} banType={banType} expiresAt={banExpiry} />;
  }

  // Need auth (only if Supabase is configured and not in demo mode)
  if (isSupabaseMode && !isAuthenticated && !demoMode) {
    return <AuthPage onLocalMode={() => setDemoMode(true)} />;
  }

  // Not set up profile yet
  if (!loadingProfile && !myProfile) {
    return <ProfileSetup onComplete={handleSetupComplete} />;
  }

  // Still loading profile
  if (loadingProfile) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--bg-main)" }}
      >
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Loading your profile...
        </p>
      </div>
    );
  }

  // Extra safety: should be unreachable due to earlier guard.
  if (!myProfile) {
    return <ProfileSetup onComplete={handleSetupComplete} />;
  }

  const currentProfile = deck[currentIdx];

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-main)" }}>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 pt-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
          {/* Left sidebar — Filters */}
          <aside className="hidden lg:block">
            <MatchFilters
              prefs={prefs}
              onChange={handlePrefsChange}
            />
          </aside>

          {/* Center — Swipe deck */}
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-between w-full max-w-md mb-6">
              <div>
                <span
                  className="text-xs font-mono tracking-widest uppercase mb-1 block"
                  style={{ color: "#FF6B9E" }}
                >
                  Swipe Deck
                </span>
                <h1
                  className="font-display font-bold text-2xl"
                  style={{ color: "var(--text-primary)" }}
                >
                  Find your next study date
                </h1>
              </div>
              <span
                className="text-xs px-3 py-1.5 rounded-full border"
                style={{ borderColor: "var(--hairline)", color: "var(--text-muted)" }}
              >
                {deck.length} curated profiles nearby
              </span>
            </div>

            {currentProfile ? (
              <SwipeCard
                profile={currentProfile}
                compatibility={compatibilityScore(myProfile, currentProfile)}
                onLike={() => handleSwipe("like")}
                onPass={() => handleSwipe("pass")}
                onSuperLike={() => handleSwipe("super")}
                onSpark={canSendSpark ? () => setShowSparkModal(currentProfile) : undefined}
                sparkRemaining={sparkRemaining}
              />
            ) : (
              <div
                className="w-full max-w-md p-10 rounded-[2rem] border relative overflow-hidden text-center group"
                style={{
                  borderColor: "rgba(255,107,158,0.2)",
                  background:
                    "linear-gradient(145deg, rgba(30,41,59,0.4) 0%, rgba(15,23,42,0.8) 100%)",
                  backdropFilter: "blur(20px)",
                }}
              >
                {/* Background glow elements */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#FF6B9E] rounded-full mix-blend-screen filter blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#7C3AED] rounded-full mix-blend-screen filter blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>

                <div className="relative z-10">
                  <div
                    className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center border-4 relative"
                    style={{
                      borderColor: "rgba(255,107,158,0.1)",
                      background: "rgba(11,17,32,0.5)",
                    }}
                  >
                    <div
                      className="absolute inset-0 rounded-full animate-ping opacity-20"
                      style={{ background: "var(--rose-accent)" }}
                    ></div>
                    <span className="text-4xl">✨</span>
                  </div>

                  <h3 className="font-display font-extrabold text-2xl mb-3 text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B9E] to-[#FFA3C0]">
                    You're all caught up!
                  </h3>
                  <p
                    className="text-sm mb-8 leading-relaxed"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {prefs.locationMode !== "global"
                      ? "There are no more study profiles in your immediate area. Widen your horizon to connect with ambitious minds globally."
                      : "You've seen everyone matching your specific academic goals. Adjust your filters to discover more people."}
                  </p>

                  <button
                    onClick={() => {
                      handlePrefsChange({
                        ...prefs,
                        ageRange: null,
                        cities: [],
                        colleges: [],
                        locationMode: "global",
                      });
                      refreshDeck();
                    }}
                    className="w-full relative px-6 py-4 rounded-xl text-sm font-bold overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(255,107,158,0.3)]"
                    style={{
                      background: "linear-gradient(135deg, #FF6B9E 0%, #FF8FB5 100%)",
                      color: "#0B1120",
                    }}
                  >
                    <div className="absolute inset-0 bg-white/20 hover:bg-transparent transition-colors"></div>
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {prefs.locationMode !== "global"
                        ? "🌍 Unlock Global Discovery"
                        : "🔄 Reset Filters & Refresh"}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>


        </div>
      </div>

      {/* Match celebration overlay */}
      {celebration && (
        <MatchCelebration
          profile={celebration}
          onMessage={() => dismissCelebration(true)}
          onKeep={() => dismissCelebration(false)}
        />
      )}

      {showPromptModal && (
        <SendPromptModal
          profile={showPromptModal}
          likesRemaining={rightRemaining}
          onClose={() => setShowPromptModal(null)}
          onSend={async () => {
            setShowPromptModal(null);
            await handleSwipe("like");
          }}
        />
      )}

      {showSparkModal && (
        <SendPromptModal
          profile={showSparkModal}
          likesRemaining={rightRemaining}
          isSpark
          sparksRemaining={sparkRemaining}
          onClose={() => setShowSparkModal(null)}
          onSend={async () => {
            setShowSparkModal(null);
            incrementSparksUsed();
            await handleSwipe("super"); // Spark counts as a super-like in the DB
          }}
        />
      )}
    </div>
  );
}
