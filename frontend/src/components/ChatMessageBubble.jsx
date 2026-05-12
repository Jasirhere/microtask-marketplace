import { Check, CheckCheck } from "lucide-react";

function formatTime(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ChatMessageBubble({ message, isMine, isLastMine }) {
  const statusLabel = message.is_seen ? "Seen" : "Delivered";

  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[72%] ${isMine ? "items-end" : "items-start"}`}>
        <div
          className={`rounded-2xl px-4 py-3 shadow-sm ${
            isMine
              ? "rounded-br-md bg-blue-600 text-white"
              : "rounded-bl-md border border-slate-200 bg-white text-slate-900"
          }`}
        >
          <p className="whitespace-pre-wrap break-words text-sm leading-6">
            {message.text}
          </p>
        </div>

        <div
          className={`mt-1 flex items-center gap-1 text-xs ${
            isMine ? "justify-end text-slate-400" : "justify-start text-slate-400"
          }`}
        >
          <span>{formatTime(message.created_at)}</span>

          {isMine && isLastMine && (
            <>
              <span>•</span>

              <span className="flex items-center gap-1">
                {message.is_seen ? (
                  <CheckCheck className="h-3.5 w-3.5 text-blue-500" />
                ) : (
                  <Check className="h-3.5 w-3.5 text-slate-400" />
                )}
                {statusLabel}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}