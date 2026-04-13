function formatTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ChatMessageBubble({ message, isMine, isLastMine }) {
  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-sm ${
          isMine
            ? "bg-violet-600 text-white"
            : "bg-slate-100 text-slate-900"
        }`}
      >
        <p className="text-sm leading-6">{message.text}</p>

        <div className="mt-2 flex items-center justify-end gap-2">
          <p
            className={`text-xs ${
              isMine ? "text-violet-100" : "text-slate-500"
            }`}
          >
            {formatTime(message.created_at)}
          </p>

          {isMine && isLastMine && (
            <span className="text-xs text-violet-100">
              {message.is_seen ? "Seen" : "Delivered"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}