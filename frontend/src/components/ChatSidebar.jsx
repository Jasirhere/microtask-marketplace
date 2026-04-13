import { useMemo, useState } from "react";

function formatTimeAgo(dateString) {
  if (!dateString) return "";

  const created = new Date(dateString);
  const now = new Date();
  const diffMs = now - created;

  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hr ago`;
  return `${days} day ago`;
}

function formatLastSeen(dateString) {
  if (!dateString) return "Offline";

  const seen = new Date(dateString);
  const now = new Date();
  const diffMs = now - seen;

  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));

  if (minutes < 1) return "Last seen just now";
  if (minutes < 60) return `Last seen ${minutes} min ago`;
  if (hours < 24) return `Last seen ${hours} hr ago`;
  return `Last seen ${formatTimeAgo(dateString)}`;
}

export default function ChatSidebar({
  chats,
  selectedJobId,
  onSelectChat,
}) {
  const [search, setSearch] = useState("");
  const [filterMode, setFilterMode] = useState("all"); // all | unread

  const filteredChats = useMemo(() => {
    let result = [...chats];

    if (filterMode === "unread") {
      result = result.filter((chat) => (chat.unread_count || 0) > 0);
    }

    const query = search.trim().toLowerCase();
    if (query) {
      result = result.filter((chat) => {
        return (
          chat.other_user_name?.toLowerCase().includes(query) ||
          chat.job_title?.toLowerCase().includes(query)
        );
      });
    }

    return result;
  }, [chats, search, filterMode]);

  return (
    <div className="flex h-full w-full flex-col border-r bg-white">
      <div className="border-b p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-slate-900">Messages</h2>

          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value)}
            className="rounded-xl border px-3 py-2 text-sm outline-none focus:border-violet-400"
          >
            <option value="all">All messages</option>
            <option value="unread">Unread</option>
          </select>
        </div>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search conversations..."
          className="w-full rounded-2xl border px-4 py-3 outline-none focus:border-violet-400"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="p-5 text-sm text-slate-500">
            No conversations found.
          </div>
        ) : (
          filteredChats.map((chat) => {
            const selected = selectedJobId === chat.job_id;

            return (
              <button
                key={chat.job_id}
                onClick={() => onSelectChat(chat)}
                className={`flex w-full items-start gap-3 border-b px-4 py-4 text-left transition hover:bg-slate-50 ${
                  selected ? "bg-violet-50" : "bg-white"
                }`}
              >
                <div className="relative">
                  {chat.other_user_photo_data_url ? (
                    <img
                      src={chat.other_user_photo_data_url}
                      alt={chat.other_user_name}
                      className="h-12 w-12 rounded-full object-cover border"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border bg-slate-100 font-semibold text-slate-600">
                      {chat.other_user_name?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}

                  <span
                    className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white ${
                      chat.other_user_online ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-lg font-semibold text-slate-900">
                      {chat.other_user_name}
                    </p>

                    <div className="flex items-center gap-2">
                      {(chat.unread_count || 0) > 0 && (
                        <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
                          {chat.unread_count}
                        </span>
                      )}

                      <span className="shrink-0 text-xs text-slate-400">
                        {formatTimeAgo(chat.last_message_at)}
                      </span>
                    </div>
                  </div>

                  <p className="truncate text-sm text-slate-500">
                    Job: {chat.job_title}
                  </p>

                  <p className="mt-1 truncate text-sm text-slate-600">
                    {chat.last_message_text || "No messages yet"}
                  </p>

                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-xs text-slate-400">
                      {chat.other_user_online
                        ? "Online"
                        : formatLastSeen(chat.other_user_last_seen_at)}
                    </p>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}