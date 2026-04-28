import { useState } from "react";
import { Flag } from "lucide-react";
import { ReportModal } from "./ReportModal";

type ReportButtonProps = {
  userId: string;
  userName: string;
  context: "swipe_card" | "chat" | "study_room" | "profile";
  variant?: "icon" | "text" | "menu-item";
};

export function ReportButton({ userId, userName, context, variant = "icon" }: ReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (variant === "menu-item") {
    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition hover:opacity-80"
          style={{ color: "#EF4444" }}>
          <Flag className="h-4 w-4" />
          Report {userName}
        </button>
        <ReportModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          reportedUserId={userId}
          reportedUserName={userName}
          context={context}
        />
      </>
    );
  }

  if (variant === "text") {
    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1.5 text-xs font-medium transition hover:opacity-80"
          style={{ color: "var(--text-muted)" }}>
          <Flag className="h-3 w-3" />
          Report
        </button>
        <ReportModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          reportedUserId={userId}
          reportedUserName={userName}
          context={context}
        />
      </>
    );
  }

  // Default: icon button
  return (
    <>
      <button
        onClick={(e) => { e.stopPropagation(); setIsOpen(true); }}
        className="h-8 w-8 rounded-full flex items-center justify-center transition hover:opacity-80"
        style={{ background: "rgba(239,68,68,0.1)" }}
        aria-label={`Report ${userName}`}
        title={`Report ${userName}`}>
        <Flag className="h-3.5 w-3.5" style={{ color: "#EF4444" }} />
      </button>
      <ReportModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        reportedUserId={userId}
        reportedUserName={userName}
        context={context}
      />
    </>
  );
}
