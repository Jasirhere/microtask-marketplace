function formatMessageTime(dateString) {
  if (!dateString) return "";

  return new Date(dateString).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ChatMessageBubble({ message, isMine, isLastMine }) {
  return (
    <div
      className={`flex w-full min-w-0 ${
        isMine ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`min-w-0 max-w-[86%] rounded-2xl px-4 py-2.5 shadow-sm sm:max-w-[70%] ${
          isMine
            ? "rounded-br-md bg-blue-600 text-white"
            : "rounded-bl-md border border-slate-200 bg-white text-slate-900"
        }`}
      >
        <p className="whitespace-pre-wrap break-words text-sm leading-6">
          {message.text}
        </p>

        <div
          className={`mt-1 flex items-center justify-end gap-1 text-[11px] ${
            isMine ? "text-blue-100" : "text-slate-400"
          }`}
        >
          <span>{formatMessageTime(message.created_at)}</span>

          {isMine && isLastMine && (
            <span>{message.is_seen ? "Seen" : "Sent"}</span>
          )}
        </div>
      </div>
    </div>
  );
}