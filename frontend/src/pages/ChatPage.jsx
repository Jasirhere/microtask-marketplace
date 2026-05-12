import { useEffect, useState } from "react";
import DashboardHeader from "../components/DashboardHeader";
import ChatSidebar from "../components/ChatSidebar";
import ChatWindow from "../components/ChatWindow";
import ChatEmptyState from "../components/ChatEmptyState";
import { useChatContext } from "../context/useChatContext";
import { useLocation } from "react-router-dom";
export default function ChatPage() {
  const { chats, loadChats, loadingChats } = useChatContext();

  const [selectedChat, setSelectedChat] = useState(null);

  const location = useLocation();
  useEffect(() => {
    if (selectedChat) return;
    if (!chats.length) return;

    const shouldOpenUnread = location.state?.openUnread;

    if (shouldOpenUnread) {
      const firstUnreadChat = chats.find((chat) => (chat.unread_count || 0) > 0);

      if (firstUnreadChat) {
        setSelectedChat(firstUnreadChat);
        return;
      }
    }

    setSelectedChat(chats[0]);
  }, [chats, selectedChat, location.state]);
  useEffect(() => {
    if (!selectedChat) return;

    const latest = chats.find((chat) => chat.job_id === selectedChat.job_id);

    if (!latest) return;

    setSelectedChat((prev) => ({
      ...prev,
      ...latest,
    }));
  }, [chats, selectedChat?.job_id]);
  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader />

      <div className="mx-auto h-[calc(100vh-88px)] max-w-[1600px] p-4">
        <div className="grid h-full grid-cols-1 overflow-hidden rounded-3xl border bg-white shadow-sm lg:grid-cols-[360px_1fr]">
          {loadingChats ? (
            <div className="col-span-2 flex items-center justify-center text-slate-500">
              Loading chats...
            </div>
          ) : (
            <>
              <ChatSidebar
                chats={chats}
                selectedJobId={selectedChat?.job_id}
                onSelectChat={setSelectedChat}
              />

              <div className="min-h-0">
                {selectedChat ? (
                  <ChatWindow
                    selectedChat={selectedChat}
                    onChatMetaChange={(options) => loadChats(options)}
                  />
                ) : (
                  <ChatEmptyState />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}