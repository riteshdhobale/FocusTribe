import { useEffect, useRef, useState } from "react";
import type { Message, Profile, Match, MatchStatus } from "@/lib/profiles";
import { getMessages, sendMessage, getMyProfile, updateMatch } from "@/lib/profiles";
import { Send, Video, Sparkles, MoreVertical, UserX, AlertTriangle } from "lucide-react";
import { ReportButton } from "./ReportButton";
import { useNavigate } from "@tanstack/react-router";

type Props = {
  match: Match;
  partner: Profile;
  onStatusChange?: (status: MatchStatus) => void;
};

export function ChatWindow({ match, partner, onStatusChange }: Props) {
  const navigate = useNavigate();
  const [me, setMe] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showUnmatchModal, setShowUnmatchModal] = useState(false);
  const [unmatching, setUnmatching] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getMyProfile().then(setMe);
  }, []);

  useEffect(() => {
    getMessages(match.id).then(setMessages);

    let channel: any;
    import("@/lib/supabase").then(({ supabase }) => {
      channel = supabase
        .channel(`chat:${match.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `match_id=eq.${match.id}`,
          },
          (payload) => {
            const newMsg = payload.new;
            setMessages((prev) => {
              if (prev.find((m) => m.id === newMsg.id)) return prev;
              return [
                ...prev,
                {
                  id: newMsg.id,
                  matchId: newMsg.match_id,
                  senderId: newMsg.sender_id,
                  text: newMsg.is_filtered ? "[Message blocked by filter]" : newMsg.text,
                  timestamp: new Date(newMsg.created_at).getTime(),
                },
              ];
            });
          },
        )
        .subscribe();
    });

    return () => {
      if (channel) {
        import("@/lib/supabase").then(({ supabase }) => supabase.removeChannel(channel));
      }
    };
  }, [match.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !me) return;
    const text = input.trim();
    setInput("");
    const tempMsg: Message = {
      id: crypto.randomUUID(),
      matchId: match.id,
      senderId: me.id,
      text,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, tempMsg]);
    try {
      await sendMessage(match.id, text);
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== tempMsg.id));
    }
  };

  const handleUnmatch = async () => {
    setUnmatching(true);
    try {
      await updateMatch(match.id, { status: "unmatched" });
      onStatusChange?.("unmatched");
    } catch {
      setUnmatching(false);
      setShowUnmatchModal(false);
    }
  };

  const startStudyDate = () => {
    updateMatch(match.id, { status: "study-date" });
    const examSlug = partner.examFocus[0] || "general";
    navigate({ to: `/room/${examSlug}/${match.id}` });
  };

  const formatTime = (ts: number) =>
    new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* ── Header ── */}
      <div
        className="px-5 py-3 flex items-center justify-between border-b border-[color:var(--hairline)]"
        style={{ background: "var(--surface)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-full flex items-center justify-center text-xl"
            style={{
              background: `linear-gradient(135deg, ${partner.avatarColor}, color-mix(in oklab, ${partner.avatarColor} 60%, #0B1120))`,
            }}
          >
            {partner.avatarEmoji}
          </div>
          <div>
            <div className="font-display font-bold">{partner.name}</div>
            <div className="flex items-center gap-1.5 text-xs text-[color:var(--text-muted)]">
              {partner.isOnline && <span className="live-dot" style={{ width: 5, height: 5 }} />}
              {partner.college} · {partner.examFocus.join(", ")}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={startStudyDate}
            className="btn-pill bg-rose-gradient text-white px-4 py-2 text-sm font-semibold inline-flex items-center gap-2 transition hover:opacity-95"
            style={{ boxShadow: "var(--shadow-rose)" }}
          >
            <Video className="h-4 w-4" />
            Study Date
          </button>
          <ReportButton userId={partner.id} userName={partner.name} context="chat" />

          {/* Kebab menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="h-9 w-9 rounded-full flex items-center justify-center transition hover:bg-[color:var(--surface-2)] border border-transparent hover:border-[color:var(--hairline)]"
              aria-label="More options"
            >
              <MoreVertical className="h-4 w-4 text-[color:var(--text-muted)]" />
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 top-full mt-1 w-44 rounded-2xl border shadow-2xl z-50 overflow-hidden"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--hairline)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                }}
              >
                <button
                  onClick={() => { setMenuOpen(false); setShowUnmatchModal(true); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition hover:bg-red-500/10 text-red-400"
                >
                  <UserX className="h-4 w-4" />
                  Unmatch
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Messages ── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div
              className="h-16 w-16 rounded-full flex items-center justify-center mb-4"
              style={{ background: "color-mix(in oklab, #F472B6 12%, var(--surface-2))" }}
            >
              <Sparkles className="h-7 w-7" style={{ color: "#F472B6" }} />
            </div>
            <div className="font-display font-bold text-lg mb-1">
              You matched with {partner.name}!
            </div>
            <p className="text-sm text-[color:var(--text-secondary)] max-w-xs">
              Say hi and plan your first study date together. You both have common interests!
            </p>
          </div>
        )}

        {messages.map((msg) => {
          const isMine = msg.senderId === me?.id;
          return (
            <div key={msg.id} className={`flex w-full ${isMine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] md:max-w-[75%] flex flex-col ${isMine ? "items-end" : "items-start"}`}>
                <div className={`chat-bubble inline-block ${isMine ? "chat-bubble-mine" : "chat-bubble-theirs"}`}>
                  {msg.text}
                </div>
                <div className={`text-[10px] text-[color:var(--text-muted)] mt-1.5 ${isMine ? "text-right" : "text-left"}`}>
                  {formatTime(msg.timestamp)}
                </div>
              </div>
            </div>
          );
        })}

        {typing && (
          <div className="flex justify-start">
            <div className="chat-bubble chat-bubble-theirs flex items-center gap-1.5 py-3 px-4">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-2 w-2 rounded-full bg-[color:var(--text-muted)]"
                    style={{ animation: `pulse-heart 1.2s ease-in-out ${i * 0.15}s infinite` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Input / Pending ── */}
      {match.status === "pending" ? (
        <div className="p-5 border-t border-[color:var(--hairline)] flex flex-col items-center gap-3 bg-[color:var(--surface)] text-center">
          <p className="text-sm text-[color:var(--text-secondary)]">
            Accept {partner.name}'s request to start chatting and studying together.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={async () => {
                const { updateMatch } = await import("@/lib/profiles");
                await updateMatch(match.id, { status: "unmatched" });
                onStatusChange?.("unmatched");
              }}
              className="px-6 py-2.5 rounded-full border border-[color:var(--hairline)] font-medium text-[color:var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 transition"
            >
              Reject
            </button>
            <button
              onClick={async () => {
                const { updateMatch } = await import("@/lib/profiles");
                await updateMatch(match.id, { status: "matched" });
                onStatusChange?.("matched");
              }}
              className="px-6 py-2.5 rounded-full bg-rose-gradient text-white font-semibold transition hover:scale-105 active:scale-95"
              style={{ boxShadow: "0 4px 15px rgba(255,107,158,0.3)" }}
            >
              Accept Request
            </button>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSend}
          className="p-4 border-t border-[color:var(--hairline)] relative"
          style={{ background: "var(--surface)" }}
        >
          <div className="relative flex items-center">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-[color:var(--surface-2)] border border-[color:var(--hairline)] rounded-full pl-5 pr-12 py-3.5 text-sm outline-none transition focus:border-[color:var(--rose-accent)] focus:ring-1 focus:ring-[color:var(--rose-accent)] placeholder:text-[color:var(--text-muted)]"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="absolute right-1.5 h-9 w-9 rounded-full bg-rose-gradient text-white flex items-center justify-center transition disabled:opacity-40 hover:scale-105 active:scale-95"
              style={{ boxShadow: input.trim() ? "0 4px 15px rgba(255,107,158,0.3)" : "none" }}
            >
              <Send className="h-4 w-4 ml-0.5" />
            </button>
          </div>
        </form>
      )}

      {/* ── Unmatch Confirmation Modal (Hinge-style) ── */}
      {showUnmatchModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={(e) => { if (e.target === e.currentTarget && !unmatching) setShowUnmatchModal(false); }}
        >
          <div
            className="w-full max-w-sm rounded-3xl border p-6 animate-in slide-in-from-bottom duration-300"
            style={{
              background: "var(--surface)",
              borderColor: "rgba(239,68,68,0.3)",
              boxShadow: "0 0 40px rgba(239,68,68,0.1), 0 25px 50px rgba(0,0,0,0.5)",
            }}
          >
            <div
              className="h-14 w-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)" }}
            >
              <AlertTriangle className="h-7 w-7 text-red-400" />
            </div>

            <h3 className="font-display font-bold text-lg text-center mb-1" style={{ color: "var(--text-primary)" }}>
              Unmatch with {partner.name}?
            </h3>
            <p className="text-sm text-center mb-6" style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>
              This will permanently delete your conversation and remove{" "}
              <span style={{ color: "var(--text-primary)" }}>{partner.name}</span> from your matches.
              This cannot be undone.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleUnmatch}
                disabled={unmatching}
                className="w-full py-3.5 rounded-2xl font-bold text-sm transition flex items-center justify-center gap-2"
                style={{
                  background: "#EF4444",
                  color: "white",
                  opacity: unmatching ? 0.6 : 1,
                }}
              >
                <UserX className="h-4 w-4" />
                {unmatching ? "Unmatching…" : "Yes, unmatch"}
              </button>
              <button
                onClick={() => setShowUnmatchModal(false)}
                disabled={unmatching}
                className="w-full py-3.5 rounded-2xl font-semibold text-sm border transition hover:bg-[color:var(--surface-2)]"
                style={{ borderColor: "var(--hairline)", color: "var(--text-secondary)" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
