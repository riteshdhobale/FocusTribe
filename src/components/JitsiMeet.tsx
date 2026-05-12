import { useEffect, useRef, useState } from "react";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  MonitorUp,
  PhoneOff,
  Users,
  Maximize2,
  Minimize2,
  Settings,
  Clock,
  CheckCircle,
  Trophy,
  Zap,
} from "lucide-react";
import { useSubscription } from "@/lib/useSubscription";

type JitsiMeetProps = {
  roomName: string;
  displayName: string;
  categoryName?: string;
  /** Allow microphone — true only for matched 1-on-1 Study Date rooms */
  allowMic?: boolean;
};

// ─── Jitsi server config ───────────────────────────────────────────
// meet.ffmuc.net = free community Jitsi (anonymous rooms, no login required)
// For production: self-host on DigitalOcean/AWS (~$20/mo)
// Guide: https://jitsi.github.io/handbook/docs/devops-guide/
const JITSI_DOMAIN = "meet.ffmuc.net";
// ────────────────────────────────────────────────────────────────────

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

export function JitsiMeet({ roomName, displayName, categoryName, allowMic = false }: JitsiMeetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [participantCount, setParticipantCount] = useState(1);
  const [isAudioMuted, setIsAudioMuted] = useState(true);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [joinedAt, setJoinedAt] = useState<number | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const { plan, inReverseTrial, trialDaysLeft } = useSubscription();

  useEffect(() => {
    const scriptUrl = `https://${JITSI_DOMAIN}/external_api.js`;

    const loadScript = (): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (window.JitsiMeetExternalAPI) {
          resolve();
          return;
        }
        const existing = document.querySelector(`script[src="${scriptUrl}"]`);
        if (existing) {
          existing.addEventListener("load", () => resolve());
          existing.addEventListener("error", () => reject(new Error("Failed to load Jitsi")));
          return;
        }
        const script = document.createElement("script");
        script.src = scriptUrl;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load Jitsi"));
        document.head.appendChild(script);
      });
    };

    let mounted = true;

    const initJitsi = async () => {
      try {
        await loadScript();
        if (!mounted || !containerRef.current) return;

        // Sanitize room name for Jitsi
        const sanitizedRoom = `StudyDate-${roomName}`
          .replace(/[^a-zA-Z0-9-]/g, "-")
          .replace(/-+/g, "-")
          .substring(0, 64);

        const api = new window.JitsiMeetExternalAPI(JITSI_DOMAIN, {
          roomName: sanitizedRoom,
          parentNode: containerRef.current,
          width: "100%",
          height: "100%",
          configOverwrite: {
            startWithAudioMuted: true,        // always start muted
            startWithVideoMuted: false,
            prejoinPageEnabled: false,
            disableDeepLinking: true,
            disableInviteFunctions: true,
            disableThirdPartyRequests: true,
            enableClosePage: false,
            enableNoisyMicDetection: false,
            // Lock mic entirely for category rooms
            ...(allowMic ? {} : {
              disableAudioLevels: true,
            }),
            subject: categoryName ? `${categoryName} — StudyDate` : "StudyDate Study Room",
            // Mic button only appears in toolbar for matched rooms
            toolbarButtons: allowMic
              ? ["microphone", "camera", "chat", "raisehand", "tileview", "filmstrip"]
              : ["camera", "chat", "raisehand", "tileview", "filmstrip"],
            notifications: [],
            defaultLanguage: "en",
          },
          interfaceConfigOverwrite: {
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
            FILM_STRIP_MAX_HEIGHT: 90,
            // Kill ALL Jitsi branding
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            SHOW_BRAND_WATERMARK: false,
            SHOW_CHROME_EXTENSION_BANNER: false,
            SHOW_POWERED_BY: false,
            MOBILE_APP_PROMO: false,
            HIDE_INVITE_MORE_HEADER: true,
            GENERATE_ROOMNAMES_ON_WELCOME_PAGE: false,
            TOOLBAR_ALWAYS_VISIBLE: false,
            DEFAULT_BACKGROUND: "#0B1120",
            DEFAULT_REMOTE_DISPLAY_NAME: "Study Partner",
            // Block the promo close page
            SHOW_PROMOTIONAL_CLOSE_PAGE: false,
            CLOSE_PAGE_GUEST_HINT: false,
          },
          userInfo: {
            displayName: displayName || "Study Partner",
          },
        });

        apiRef.current = api;

        api.addEventListener("videoConferenceJoined", () => {
          if (mounted) {
            setLoading(false);
            setJoinedAt(Date.now());
          }
        });

        api.addEventListener("participantJoined", () => {
          if (mounted) setParticipantCount(api.getNumberOfParticipants());
        });

        api.addEventListener("participantLeft", () => {
          if (mounted) setParticipantCount(api.getNumberOfParticipants());
        });

        api.addEventListener("audioMuteStatusChanged", ({ muted }: { muted: boolean }) => {
          if (mounted) {
            setIsAudioMuted(muted);
            // Category rooms: re-mute immediately if Jitsi somehow unmutes
            if (!allowMic && !muted) {
              api.executeCommand("muteEveryone");
              api.executeCommand("toggleAudio"); // force self back to muted
            }
          }
        });

        api.addEventListener("videoMuteStatusChanged", ({ muted }: { muted: boolean }) => {
          if (mounted) setIsVideoMuted(muted);
        });

        // When Jitsi is ready to close, show our summary overlay instead of promo
        api.addEventListener("readyToClose", () => {
          if (mounted) setSessionEnded(true);
        });

        // Fallback — clear loading state after 15s even if event didn't fire
        setTimeout(() => {
          if (mounted) setLoading(false);
        }, 15000);
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Failed to connect to video");
          setLoading(false);
        }
      }
    };

    initJitsi();

    return () => {
      mounted = false;
      if (apiRef.current) {
        try {
          apiRef.current.dispose();
        } catch {}
        apiRef.current = null;
      }
    };
  }, [roomName, displayName, categoryName]);

  const toggleAudio = () => apiRef.current?.executeCommand("toggleAudio");
  const toggleVideo = () => apiRef.current?.executeCommand("toggleVideo");
  const toggleScreenShare = () => apiRef.current?.executeCommand("toggleShareScreen");
  const hangup = () => {
    setSessionEnded(true); // Show summary overlay FIRST (covers promo)
    apiRef.current?.executeCommand("hangup");
  };

  // Enforce 60-minute limit on Free plan
  useEffect(() => {
    if (plan !== "free" || !joinedAt || sessionEnded) return;

    // Safety buffer: Start checking more aggressively when near 60 mins
    const interval = setInterval(() => {
      const elapsedMinutes = Math.floor((Date.now() - joinedAt) / 60000);
      if (elapsedMinutes >= 60) {
        setLimitReached(true);
        hangup(); // Automatically end the session
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [joinedAt, plan, sessionEnded]);

  const getElapsedTime = () => {
    if (!joinedAt) return { minutes: 0, seconds: 0 };
    const elapsed = Math.floor((Date.now() - joinedAt) / 1000);
    return { minutes: Math.floor(elapsed / 60), seconds: elapsed % 60 };
  };

  const toggleFullscreen = () => {
    const el = containerRef.current?.parentElement;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  if (error) {
    return (
      <div
        className="h-full rounded-2xl border border-[color:var(--hairline)] flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, var(--surface), #0F1729)" }}
      >
        <div className="text-center max-w-sm px-6">
          <div
            className="mx-auto h-16 w-16 rounded-2xl flex items-center justify-center"
            style={{ background: "color-mix(in oklab, var(--crimson) 15%, var(--surface-2))" }}
          >
            <VideoOff className="h-7 w-7" style={{ color: "var(--crimson)" }} />
          </div>
          <div className="mt-4 font-display font-bold text-xl">Connection failed</div>
          <div className="mt-2 text-sm text-[color:var(--text-secondary)]">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="mt-5 btn-pill bg-pink-gradient text-[color:var(--primary-foreground)] px-6 py-2.5 font-semibold"
            style={{ boxShadow: "var(--shadow-rose)" }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-full flex flex-col rounded-2xl overflow-hidden border border-[color:var(--hairline)] relative"
      style={{ background: "#0B1120" }}
    >
      {/* ── Session Summary overlay (covers Jitsi promo) ── */}
      {sessionEnded &&
        (() => {
          const { minutes, seconds } = getElapsedTime();

          if (limitReached) {
            return (
              <div
                className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center"
                style={{
                  background: "linear-gradient(135deg, #0B1120 0%, #2a0a18 40%, #0B1120 100%)",
                }}
              >
                <div
                  className="h-20 w-20 rounded-full flex items-center justify-center mb-6 shadow-2xl"
                  style={{
                    background: "rgba(255,59,48,0.1)",
                    border: "1px solid rgba(255,59,48,0.5)",
                  }}
                >
                  <Clock className="h-8 w-8" style={{ color: "#FF3B30" }} />
                </div>
                <h2
                  className="font-display font-bold text-3xl mb-3"
                  style={{ color: "var(--text-primary)" }}
                >
                  Daily Limit Reached ⏱️
                </h2>
                <p
                  className="text-base max-w-sm mb-8"
                  style={{ color: "var(--text-muted)", lineHeight: 1.6 }}
                >
                  You've hit your 60-minute daily limit on the Free plan. Don't lose your momentum.
                  Upgrade to Pro for unlimited study sessions.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => (window.location.href = "/pricing")}
                    className="px-8 py-3.5 rounded-xl text-sm font-bold transition flex items-center gap-2"
                    style={{
                      background: "#FF6B9E",
                      color: "#0B1120",
                      boxShadow: "0 4px 20px rgba(201,165,78,0.3)",
                    }}
                  >
                    <Zap className="h-4 w-4" /> Upgrade to Pro
                  </button>
                  <button
                    onClick={() => window.history.back()}
                    className="px-8 py-3.5 rounded-xl text-sm font-semibold border transition hover:bg-white/5"
                    style={{ borderColor: "var(--hairline)", color: "var(--text-primary)" }}
                  >
                    Leave Room
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div
              className="absolute inset-0 z-30 flex flex-col items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #0B1120 0%, #1a1a3e 50%, #0B1120 100%)",
              }}
            >
              {/* Trophy icon */}
              <div
                className="h-20 w-20 rounded-full flex items-center justify-center mb-6"
                style={{ background: "rgba(201,165,78,0.15)", border: "2px solid #FF6B9E" }}
              >
                <Trophy className="h-9 w-9" style={{ color: "#FF6B9E" }} />
              </div>

              <h2
                className="font-display font-bold text-2xl mb-1"
                style={{ color: "var(--text-primary)" }}
              >
                Session Complete! 🎉
              </h2>
              <p className="text-sm mb-8 relative group" style={{ color: "var(--text-muted)" }}>
                Great work staying focused.
                {inReverseTrial && (
                  <span className="block mt-1 text-xs font-bold" style={{ color: "#FF6B9E" }}>
                    (Trial ends in {trialDaysLeft} days. Don't lose unlimited sessions!)
                  </span>
                )}
              </p>

              {/* Stats cards */}
              <div className="flex gap-4 mb-8">
                <div
                  className="flex flex-col items-center gap-2 px-6 py-4 rounded-2xl border"
                  style={{ borderColor: "var(--hairline)", background: "rgba(255,255,255,0.03)" }}
                >
                  <Clock className="h-5 w-5" style={{ color: "#FF6B9E" }} />
                  <span
                    className="font-display font-bold text-2xl"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {minutes}:{seconds.toString().padStart(2, "0")}
                  </span>
                  <span
                    className="text-[10px] uppercase tracking-widest font-mono"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Focus Time
                  </span>
                </div>

                <div
                  className="flex flex-col items-center gap-2 px-6 py-4 rounded-2xl border"
                  style={{ borderColor: "var(--hairline)", background: "rgba(255,255,255,0.03)" }}
                >
                  <CheckCircle className="h-5 w-5" style={{ color: "#10B981" }} />
                  <span
                    className="font-display font-bold text-2xl"
                    style={{ color: "var(--text-primary)" }}
                  >
                    —
                  </span>
                  <span
                    className="text-[10px] uppercase tracking-widest font-mono"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Tasks Done
                  </span>
                </div>

                <div
                  className="flex flex-col items-center gap-2 px-6 py-4 rounded-2xl border"
                  style={{ borderColor: "var(--hairline)", background: "rgba(255,255,255,0.03)" }}
                >
                  <Users className="h-5 w-5" style={{ color: "#8B5CF6" }} />
                  <span
                    className="font-display font-bold text-2xl"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {participantCount}
                  </span>
                  <span
                    className="text-[10px] uppercase tracking-widest font-mono"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Studied With
                  </span>
                </div>
              </div>

              {/* Motivational */}
              <p
                className="text-sm max-w-sm text-center mb-8"
                style={{ color: "var(--text-secondary)" }}
              >
                {minutes >= 25
                  ? "🔥 You crushed a full focus session! Keep this streak going."
                  : minutes >= 10
                    ? "💪 Solid session! Every focused minute counts."
                    : "📚 Short but sweet. Try a 25-min Pomodoro next time!"}
              </p>

              {/* Leave / Upgrade buttons */}
              <div className="flex gap-4">
                {inReverseTrial ? (
                  <button
                    onClick={() => (window.location.href = "/pricing")}
                    className="px-8 py-3.5 rounded-xl text-sm font-bold transition flex items-center gap-2"
                    style={{
                      background: "transparent",
                      color: "#FF6B9E",
                      border: "1px solid #FF6B9E",
                    }}
                  >
                    <Zap className="h-4 w-4" /> Lock in Pro Price
                  </button>
                ) : null}
                <button
                  onClick={() => window.history.back()}
                  className="px-8 py-3.5 rounded-xl text-sm font-semibold transition hover:opacity-90"
                  style={{
                    background: !inReverseTrial ? "#FF6B9E" : "rgba(255,255,255,0.05)",
                    color: !inReverseTrial ? "#0B1120" : "var(--text-primary)",
                  }}
                >
                  ← Leave Room
                </button>
              </div>
            </div>
          );
        })()}

      {/* Loading overlay */}
      {loading && (
        <div
          className="absolute inset-0 z-20 flex flex-col items-center justify-center"
          style={{ background: "linear-gradient(135deg, var(--surface), #0F1729)" }}
        >
          <div className="relative h-20 w-20">
            <div className="absolute inset-0 rounded-full border-2 border-[color:var(--hairline)]" />
            <div
              className="absolute inset-0 rounded-full border-2 border-transparent"
              style={{ borderTopColor: "#FF6B9E", animation: "spin-slow 1.2s linear infinite" }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Video className="h-7 w-7" style={{ color: "#FF6B9E" }} />
            </div>
          </div>
          <div className="mt-5 font-display font-bold text-lg">Connecting to room…</div>
          <div className="mt-1 text-sm text-[color:var(--text-secondary)]">
            Setting up your camera
          </div>
          <div className="mt-6 w-48 h-1 rounded-full overflow-hidden bg-[color:var(--surface-2)]">
            <div
              className="h-full bg-pink-gradient"
              style={{ animation: "shimmer-bar 2s ease-in-out infinite", width: "40%" }}
            />
          </div>
        </div>
      )}

      {/* Jitsi container */}
      <div
        ref={containerRef}
        className="flex-1 w-full"
        style={{
          minHeight: 0,
          opacity: loading ? 0 : 1,
          transition: "opacity 0.5s ease",
        }}
      />

      {/* Custom bottom toolbar */}
      <div
        className="h-16 px-4 flex items-center justify-between border-t border-[color:var(--hairline)]"
        style={{ background: "color-mix(in oklab, var(--surface) 90%, transparent)" }}
      >
        {/* Participant count */}
        <div className="flex items-center gap-2 text-sm text-[color:var(--text-secondary)]">
          <Users className="h-4 w-4" style={{ color: "#FF6B9E" }} />
          <span className="live-dot" />
          <span className="font-semibold text-[color:var(--text-primary)]">{participantCount}</span>
          <span>in room</span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Mic button — hidden for category rooms, shown for match rooms */}
          {allowMic && (
            <button
              onClick={toggleAudio}
              className="h-10 w-10 rounded-full flex items-center justify-center transition"
              style={{
                background: isAudioMuted
                  ? "color-mix(in oklab, var(--crimson) 20%, var(--surface-2))"
                  : "var(--surface-2)",
                border: `1px solid ${
                  isAudioMuted
                    ? "color-mix(in oklab, var(--crimson) 40%, transparent)"
                    : "var(--hairline)"
                }`,
              }}
              aria-label={isAudioMuted ? "Unmute" : "Mute"}
            >
              {isAudioMuted ? (
                <MicOff className="h-4 w-4" style={{ color: "var(--crimson)" }} />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </button>
          )}
          {/* Mic locked indicator for category rooms */}
          {!allowMic && (
            <div
              className="h-10 w-10 rounded-full flex items-center justify-center cursor-not-allowed"
              title="Mic disabled — silent study room"
              style={{
                background: "color-mix(in oklab, var(--surface-2) 80%, transparent)",
                border: "1px solid var(--hairline)",
                opacity: 0.4,
              }}
            >
              <MicOff className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
            </div>
          )}

          <button
            onClick={toggleVideo}
            className="h-10 w-10 rounded-full flex items-center justify-center transition"
            style={{
              background: isVideoMuted
                ? "color-mix(in oklab, var(--crimson) 20%, var(--surface-2))"
                : "var(--surface-2)",
              border: `1px solid ${isVideoMuted ? "color-mix(in oklab, var(--crimson) 40%, transparent)" : "var(--hairline)"}`,
            }}
            aria-label={isVideoMuted ? "Start Camera" : "Stop Camera"}
          >
            {isVideoMuted ? (
              <VideoOff className="h-4 w-4" style={{ color: "var(--crimson)" }} />
            ) : (
              <Video className="h-4 w-4" />
            )}
          </button>

          <button
            onClick={toggleScreenShare}
            className="h-10 w-10 rounded-full border border-[color:var(--hairline)] flex items-center justify-center hover:border-[color:#FF6B9E] transition"
            style={{ background: "var(--surface-2)" }}
            aria-label="Share Screen"
          >
            <MonitorUp className="h-4 w-4" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="h-10 w-10 rounded-full border border-[color:var(--hairline)] flex items-center justify-center hover:border-[color:#FF6B9E] transition"
            style={{ background: "var(--surface-2)" }}
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>

          <div className="w-px h-6 mx-1" style={{ background: "var(--hairline)" }} />

          <button
            onClick={hangup}
            className="h-10 px-5 rounded-full flex items-center justify-center gap-2 font-semibold text-sm transition"
            style={{
              background: "color-mix(in oklab, var(--crimson) 85%, var(--surface-2))",
              color: "white",
            }}
            aria-label="Leave"
          >
            <PhoneOff className="h-4 w-4" />
            <span className="hidden sm:inline">Leave</span>
          </button>
        </div>

        {/* Settings */}
        <button
          onClick={() => apiRef.current?.executeCommand("toggleSettingsPanel")}
          className="h-10 w-10 rounded-full border border-[color:var(--hairline)] flex items-center justify-center hover:border-[color:#FF6B9E] transition"
          style={{ background: "var(--surface-2)" }}
          aria-label="Settings"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
