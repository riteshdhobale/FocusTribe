import type { Match, Profile } from "@/lib/profiles";
import { getProfileById } from "@/lib/profiles";
import { MessageCircle } from "lucide-react";

type Props = {
  matches: Match[];
  selectedId?: string;
  myId: string;
  onSelect: (matchId: string) => void;
};

export function MatchList({ matches, selectedId, myId, onSelect }: Props) {
  const sortedMatches = [...matches].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="h-full flex flex-col border-r border-[color:var(--hairline)]" style={{ background: "var(--surface)" }}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-[color:var(--hairline)]">
        <h2 className="font-display font-bold text-lg">
          Study <span className="text-rose-gradient">Dates</span>
        </h2>
        <p className="text-xs text-[color:var(--text-muted)] mt-0.5">
          {matches.length} {matches.length === 1 ? "match" : "matches"}
        </p>
      </div>

      {/* New matches (horizontal scroll) */}
      {matches.filter(m => !m.lastMessage).length > 0 && (
        <div className="px-5 py-3 border-b border-[color:var(--hairline)]">
          <div className="text-[10px] uppercase tracking-widest text-[color:var(--text-muted)] mb-2">New Matches</div>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {matches.filter(m => !m.lastMessage).map(m => {
              const partnerId = m.profileA === myId ? m.profileB : m.profileA;
              const partner = getProfileById(partnerId);
              if (!partner) return null;
              return (
                <button
                  key={m.id}
                  onClick={() => onSelect(m.id)}
                  className="flex flex-col items-center gap-1 flex-shrink-0"
                >
                  <div className="relative">
                    <div
                      className="h-14 w-14 rounded-full flex items-center justify-center text-2xl ring-2 transition hover:scale-105"
                      style={{
                        background: `linear-gradient(135deg, ${partner.avatarColor}, color-mix(in oklab, ${partner.avatarColor} 60%, #0B1120))`,
                        boxShadow: "0 0 0 2px #F472B6",
                      }}
                    >
                      {partner.avatarEmoji}
                    </div>
                    {partner.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-[color:var(--surface)]"
                        style={{ background: "var(--emerald-live)" }} />
                    )}
                  </div>
                  <span className="text-[10px] text-[color:var(--text-secondary)] max-w-[56px] truncate">
                    {partner.name.split(" ")[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto">
        {sortedMatches.filter(m => m.lastMessage).length === 0 && matches.length > 0 && (
          <div className="p-6 text-center text-sm text-[color:var(--text-muted)]">
            <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-30" />
            Tap a match above to start chatting!
          </div>
        )}

        {sortedMatches.filter(m => m.lastMessage).map(m => {
          const partnerId = m.profileA === myId ? m.profileB : m.profileA;
          const partner = getProfileById(partnerId);
          if (!partner) return null;

          const isSelected = m.id === selectedId;

          return (
            <button
              key={m.id}
              onClick={() => onSelect(m.id)}
              className={`w-full flex items-center gap-3 px-5 py-3 text-left transition ${
                isSelected ? "bg-[color:var(--surface-2)]" : "hover:bg-[color:var(--surface-2)]/50"
              }`}
              style={isSelected ? {
                borderLeft: "3px solid #F472B6",
              } : undefined}
            >
              <div className="relative flex-shrink-0">
                <div
                  className="h-12 w-12 rounded-full flex items-center justify-center text-xl"
                  style={{
                    background: `linear-gradient(135deg, ${partner.avatarColor}, color-mix(in oklab, ${partner.avatarColor} 60%, #0B1120))`,
                  }}
                >
                  {partner.avatarEmoji}
                </div>
                {partner.isOnline && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[color:var(--surface)]"
                    style={{ background: "var(--emerald-live)" }} />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm truncate">{partner.name}</span>
                  <span className="text-[10px] text-[color:var(--text-muted)]">
                    {new Date(m.timestamp).toLocaleDateString([], { month: "short", day: "numeric" })}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-xs text-[color:var(--text-muted)] truncate max-w-[180px]">
                    {m.lastMessage}
                  </span>
                  {m.unread > 0 && (
                    <span className="flex-shrink-0 h-5 min-w-5 rounded-full bg-rose-gradient text-white text-[10px] font-bold flex items-center justify-center px-1.5">
                      {m.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}

        {matches.length === 0 && (
          <div className="p-8 text-center">
            <div className="text-4xl mb-3">💔</div>
            <div className="font-display font-bold mb-1">No matches yet</div>
            <p className="text-xs text-[color:var(--text-muted)]">
              Keep swiping to find your perfect study partner!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
