import { useMemo, useState } from "react";
import { Search } from "lucide-react";

function formatTimeAgo(dateString) {
  if (!dateString) return "";

  const created = new Date(dateString);
  const now = new Date();
  const diffMs = now - created;

  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export default function ChatSidebar({ chats, selectedJobId, onSelectChat }) {
  const [search, setSearch] = useState("");

  const filteredChats = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return chats;

    return chats.filter((chat) => {
      return (
        chat.other_user_name?.toLowerCase().includes(query) ||
        chat.job_title?.toLowerCase().includes(query) ||
        chat.last_message_text?.toLowerCase().includes(query)
      );
    });
  }, [chats, search]);

  return (
    <aside className="flex h-full w-full flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-100 p-5">
        <h2 className="mb-4 text-2xl font-bold text-slate-900">Messages</h2>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="p-5 text-sm text-slate-500">
            No conversations found.
          </div>
        ) : (
          filteredChats.map((chat) => {
            const selected = selectedJobId === chat.job_id;
            const unreadCount = chat.unread_count || 0;

            return (
              <button
                key={chat.job_id}
                type="button"
                onClick={() => onSelectChat(chat)}
                className={`flex w-full items-start gap-3 border-b border-slate-100 px-4 py-4 text-left transition ${
                  selected ? "bg-blue-50" : "bg-white hover:bg-slate-50"
                }`}
              >
                <div className="relative shrink-0">
                  {chat.other_user_photo_data_url ? (
                    <img
                      src={chat.other_user_photo_data_url}
                      alt={chat.other_user_name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 font-semibold text-slate-700">
                      {chat.other_user_name?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}

                  <span
                    className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white ${
                      chat.other_user_online ? "bg-emerald-500" : "bg-slate-300"
                    }`}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-bold text-slate-900">
                      {chat.other_user_name}
                    </p>

                    <span className="shrink-0 text-xs text-slate-400">
                      {formatTimeAgo(chat.last_message_at)}
                    </span>
                  </div>

                  <p className="truncate text-xs text-slate-500">
                    {chat.job_title}
                  </p>

                  <div className="mt-1 flex items-center justify-between gap-3">
                    <p
                      className={`truncate text-sm ${
                        unreadCount > 0
                          ? "font-semibold text-slate-900"
                          : "text-slate-500"
                      }`}
                    >
                      {chat.last_message_text || "No messages yet"}
                    </p>

                    {unreadCount > 0 && (
                      <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-600 px-1.5 text-xs font-bold text-white">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}