import { useState } from "react";
import type { Profile } from "@/lib/profiles";

type Props = {
  profile: Profile;
  onSend: (text: string) => void;
  onClose: () => void;
};

export function SendPromptModal({ profile, onSend, onClose }: Props) {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSend(text.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1E293B] rounded-2xl w-full max-w-md border border-[#334155] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <h2 className="text-xl font-bold text-white mb-2">Send a prompt to {profile.name}</h2>
        <p className="text-[#94A3B8] text-sm mb-4">
          Stand out from the crowd! Send a message attached to this like. (Counts towards your
          monthly limit)
        </p>

        <form onSubmit={handleSubmit}>
          <div className="p-4 bg-[#0F172A] rounded-xl border border-[#334155] mb-4 relative">
            <span className="text-xs font-mono text-[#FF6B9E] uppercase tracking-widest mb-1 block">
              Their prompt
            </span>
            <p className="text-white italic">
              "{profile.lookingForPrompt || "A silent partner for marathon sessions."}"
            </p>
          </div>

          <textarea
            autoFocus
            rows={3}
            placeholder="Your response..."
            className="w-full bg-[#0B1120] text-white border border-[#334155] rounded-xl p-4 mb-6 focus:outline-none focus:border-[#FF6B9E] resize-none"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-semibold text-[#94A3B8] hover:bg-[#334155] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!text.trim()}
              className="px-5 py-2.5 bg-[#FF6B9E] text-[#0B1120] rounded-xl font-bold hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
            >
              Send Prompt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
