import { useEffect, useRef, useState } from "react";
import { Video, VideoOff, Mic, MicOff, MonitorUp, PhoneOff, Users, Maximize2, Minimize2, Settings } from "lucide-react";

type JitsiMeetProps = {
  roomName: string;
  displayName: string;
  categoryName?: string;
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

export function JitsiMeet({ roomName, displayName, categoryName }: JitsiMeetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [participantCount, setParticipantCount] = useState(1);
  const [isAudioMuted, setIsAudioMuted] = useState(true);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

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
        const sanitizedRoom = `FocusTribe-${roomName}`
          .replace(/[^a-zA-Z0-9-]/g, "-")
          .replace(/-+/g, "-")
          .substring(0, 64);

        const api = new window.JitsiMeetExternalAPI(JITSI_DOMAIN, {
          roomName: sanitizedRoom,
          parentNode: containerRef.current,
          width: "100%",
          height: "100%",
          configOverwrite: {
            // Audio muted by default for study rooms
            startWithAudioMuted: true,
            startWithVideoMuted: false,
            prejoinPageEnabled: false,
            disableDeepLinking: true,
            disableInviteFunctions: true,
            enableClosePage: false,
            enableNoisyMicDetection: false,
            // Minimal toolbar — we use our own custom toolbar
            toolbarButtons: [
              "camera",
              "chat",
              "raisehand",
              "tileview",
              "filmstrip",
            ],
            notifications: [],
            defaultLanguage: "en",
          },
          interfaceConfigOverwrite: {
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
            FILM_STRIP_MAX_HEIGHT: 90,
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            SHOW_BRAND_WATERMARK: false,
            SHOW_CHROME_EXTENSION_BANNER: false,
            MOBILE_APP_PROMO: false,
            HIDE_INVITE_MORE_HEADER: true,
            TOOLBAR_ALWAYS_VISIBLE: false,
            DEFAULT_BACKGROUND: "#0B1120",
            DEFAULT_REMOTE_DISPLAY_NAME: "Tribe Member",
            SHOW_PROMOTIONAL_CLOSE_PAGE: false,
          },
          userInfo: {
            displayName: displayName || "Tribe Member",
          },
        });

        apiRef.current = api;

        api.addEventListener("videoConferenceJoined", () => {
          if (mounted) setLoading(false);
        });

        api.addEventListener("participantJoined", () => {
          if (mounted) setParticipantCount(api.getNumberOfParticipants());
        });

        api.addEventListener("participantLeft", () => {
          if (mounted) setParticipantCount(api.getNumberOfParticipants());
        });

        api.addEventListener("audioMuteStatusChanged", ({ muted }: { muted: boolean }) => {
          if (mounted) setIsAudioMuted(muted);
        });

        api.addEventListener("videoMuteStatusChanged", ({ muted }: { muted: boolean }) => {
          if (mounted) setIsVideoMuted(muted);
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
        try { apiRef.current.dispose(); } catch {}
        apiRef.current = null;
      }
    };
  }, [roomName, displayName, categoryName]);

  const toggleAudio = () => apiRef.current?.executeCommand("toggleAudio");
  const toggleVideo = () => apiRef.current?.executeCommand("toggleVideo");
  const toggleScreenShare = () => apiRef.current?.executeCommand("toggleShareScreen");
  const hangup = () => apiRef.current?.executeCommand("hangup");

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
      <div className="h-full rounded-2xl border border-[color:var(--hairline)] flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, var(--surface), #0F1729)" }}>
        <div className="text-center max-w-sm px-6">
          <div className="mx-auto h-16 w-16 rounded-2xl flex items-center justify-center"
            style={{ background: "color-mix(in oklab, var(--crimson) 15%, var(--surface-2))" }}>
            <VideoOff className="h-7 w-7" style={{ color: "var(--crimson)" }} />
          </div>
          <div className="mt-4 font-display font-bold text-xl">Connection failed</div>
          <div className="mt-2 text-sm text-[color:var(--text-secondary)]">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="mt-5 btn-pill bg-gold-gradient text-[color:var(--primary-foreground)] px-6 py-2.5 font-semibold"
            style={{ boxShadow: "var(--shadow-gold)" }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col rounded-2xl overflow-hidden border border-[color:var(--hairline)] relative"
      style={{ background: "#0B1120" }}>

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center"
          style={{ background: "linear-gradient(135deg, var(--surface), #0F1729)" }}>
          <div className="relative h-20 w-20">
            <div className="absolute inset-0 rounded-full border-2 border-[color:var(--hairline)]" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent"
              style={{ borderTopColor: "var(--gold)", animation: "spin-slow 1.2s linear infinite" }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <Video className="h-7 w-7" style={{ color: "var(--gold)" }} />
            </div>
          </div>
          <div className="mt-5 font-display font-bold text-lg">Connecting to room…</div>
          <div className="mt-1 text-sm text-[color:var(--text-secondary)]">Setting up your camera</div>
          <div className="mt-6 w-48 h-1 rounded-full overflow-hidden bg-[color:var(--surface-2)]">
            <div className="h-full bg-gold-gradient" style={{ animation: "shimmer-bar 2s ease-in-out infinite", width: "40%" }} />
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
      <div className="h-16 px-4 flex items-center justify-between border-t border-[color:var(--hairline)]"
        style={{ background: "color-mix(in oklab, var(--surface) 90%, transparent)" }}>

        {/* Participant count */}
        <div className="flex items-center gap-2 text-sm text-[color:var(--text-secondary)]">
          <Users className="h-4 w-4" style={{ color: "var(--gold)" }} />
          <span className="live-dot" />
          <span className="font-semibold text-[color:var(--text-primary)]">{participantCount}</span>
          <span>in room</span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleAudio}
            className="h-10 w-10 rounded-full flex items-center justify-center transition"
            style={{
              background: isAudioMuted
                ? "color-mix(in oklab, var(--crimson) 20%, var(--surface-2))"
                : "var(--surface-2)",
              border: `1px solid ${isAudioMuted ? "color-mix(in oklab, var(--crimson) 40%, transparent)" : "var(--hairline)"}`,
            }}
            aria-label={isAudioMuted ? "Unmute" : "Mute"}
          >
            {isAudioMuted
              ? <MicOff className="h-4 w-4" style={{ color: "var(--crimson)" }} />
              : <Mic className="h-4 w-4" />}
          </button>

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
            {isVideoMuted
              ? <VideoOff className="h-4 w-4" style={{ color: "var(--crimson)" }} />
              : <Video className="h-4 w-4" />}
          </button>

          <button
            onClick={toggleScreenShare}
            className="h-10 w-10 rounded-full border border-[color:var(--hairline)] flex items-center justify-center hover:border-[color:var(--gold)] transition"
            style={{ background: "var(--surface-2)" }}
            aria-label="Share Screen"
          >
            <MonitorUp className="h-4 w-4" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="h-10 w-10 rounded-full border border-[color:var(--hairline)] flex items-center justify-center hover:border-[color:var(--gold)] transition"
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
          className="h-10 w-10 rounded-full border border-[color:var(--hairline)] flex items-center justify-center hover:border-[color:var(--gold)] transition"
          style={{ background: "var(--surface-2)" }}
          aria-label="Settings"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
