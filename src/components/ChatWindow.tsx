import { useEffect, useRef, useState } from "react";
import type { Message, Profile, Match } from "@/lib/profiles";
import { getMessages, sendMessage, getAutoReply, getMyProfile, updateMatch } from "@/lib/profiles";
import { Send, Video, Sparkles } from "lucide-react";
import { ReportButton } from "./ReportButton";
import { useNavigate } from "@tanstack/react-router";

type Props = {
  match: Match;
  partner: Profile;
};

export function ChatWindow({ match, partner }: Props) {
  const navigate = useNavigate();
  const me = getMyProfile();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(getMessages(match.id));
  }, [match.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !me) return;

    const msg: Message = {
      id: crypto.randomUUID(),
      matchId: match.id,
      senderId: me.id,
      text: input.trim(),
      timestamp: Date.now(),
    };

    sendMessage(msg);
    setMessages(prev => [...prev, msg]);
    setInput("");

    // Simulate typing + auto-reply
    setTyping(true);
    const delay = 1500 + Math.random() * 2000;
    setTimeout(() => {
      setTyping(false);
      const reply: Message = {
        id: crypto.randomUUID(),
        matchId: match.id,
        senderId: partner.id,
        text: getAutoReply(),
        timestamp: Date.now(),
      };
      sendMessage(reply);
      setMessages(prev => [...prev, reply]);
    }, delay);
  };

  const startStudyDate = () => {
    // Navigate to a study room with this match
    updateMatch(match.id, { status: "study-date" });
    const examSlug = partner.examFocus[0] || "general";
    navigate({ to: `/room/${examSlug}/0` });
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Chat header */}
      <div className="px-5 py-3 flex items-center justify-between border-b border-[color:var(--hairline)]"
        style={{ background: "var(--surface)" }}>
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
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="h-16 w-16 rounded-full flex items-center justify-center mb-4"
              style={{ background: "color-mix(in oklab, #F472B6 12%, var(--surface-2))" }}>
              <Sparkles className="h-7 w-7" style={{ color: "#F472B6" }} />
            </div>
            <div className="font-display font-bold text-lg mb-1">You matched with {partner.name}!</div>
            <p className="text-sm text-[color:var(--text-secondary)] max-w-xs">
              Say hi and plan your first study date together. You both have common interests!
            </p>
          </div>
        )}

        {messages.map(msg => {
          const isMine = msg.senderId === me?.id;
          return (
            <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div>
                <div className={`chat-bubble ${isMine ? "chat-bubble-mine" : "chat-bubble-theirs"}`}>
                  {msg.text}
                </div>
                <div className={`text-[10px] text-[color:var(--text-muted)] mt-1 ${isMine ? "text-right" : "text-left"}`}>
                  {formatTime(msg.timestamp)}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {typing && (
          <div className="flex justify-start">
            <div className="chat-bubble chat-bubble-theirs flex items-center gap-1.5 py-3 px-4">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="h-2 w-2 rounded-full bg-[color:var(--text-muted)]"
                    style={{
                      animation: `pulse-heart 1.2s ease-in-out ${i * 0.15}s infinite`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-[color:var(--hairline)] flex items-center gap-3"
        style={{ background: "var(--surface)" }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-[color:var(--surface-2)] border border-[color:var(--hairline)] rounded-full px-4 py-2.5 text-sm outline-none transition focus:border-[#F472B6]"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="h-10 w-10 rounded-full bg-rose-gradient text-white flex items-center justify-center transition disabled:opacity-40"
          style={{ boxShadow: input.trim() ? "var(--shadow-rose)" : "none" }}
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
