import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "react-router-dom";

import DashboardHeader from "../components/DashboardHeader";
import ChatSidebar from "../components/ChatSidebar";
import ChatWindow from "../components/ChatWindow";
import ChatEmptyState from "../components/ChatEmptyState";
import { useChatContext } from "../context/useChatContext";

export default function ChatPage() {
  const { chats, loadChats, loadingChats } = useChatContext();

  const [selectedChat, setSelectedChat] = useState(null);
  const [showMobileChat, setShowMobileChat] = useState(false);

  const location = useLocation();

  useEffect(() => {
    if (selectedChat) return;
    if (!chats.length) return;

    const shouldOpenUnread = location.state?.openUnread;

    if (shouldOpenUnread) {
      const firstUnreadChat = chats.find((chat) => (chat.unread_count || 0) > 0);

      if (firstUnreadChat) {
        setSelectedChat(firstUnreadChat);
        setShowMobileChat(true);
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

  function handleSelectChat(chat) {
    setSelectedChat(chat);
    setShowMobileChat(true);
  }

  function handleBackToChats() {
    setShowMobileChat(false);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader />

      <main className="mx-auto flex h-[calc(100vh-82px)] w-full max-w-[1600px] flex-col p-3 sm:p-4">
        <div className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:rounded-3xl">
          {loadingChats ? (
            <div className="flex h-full items-center justify-center p-6 text-sm text-slate-500">
              Loading chats...
            </div>
          ) : (
            <div className="grid h-full min-h-0 grid-cols-1 lg:grid-cols-[360px_minmax(0,1fr)]">
              <div
                className={`min-h-0 ${
                  showMobileChat ? "hidden lg:block" : "block"
                }`}
              >
                <ChatSidebar
                  chats={chats}
                  selectedJobId={selectedChat?.job_id}
                  onSelectChat={handleSelectChat}
                />
              </div>

              <section
                className={`min-h-0 ${
                  showMobileChat ? "flex flex-col" : "hidden lg:flex lg:flex-col"
                }`}
              >
                <div className="flex shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
                  <button
                    type="button"
                    onClick={handleBackToChats}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50"
                    aria-label="Back to conversations"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {selectedChat?.other_user_name || "Messages"}
                    </p>

                    <p className="truncate text-xs text-slate-500">
                      {selectedChat?.job_title || "Conversation"}
                    </p>
                  </div>
                </div>

                <div className="min-h-0 flex-1">
                  {selectedChat ? (
                    <ChatWindow
                      selectedChat={selectedChat}
                      onChatMetaChange={(options) => loadChats(options)}
                    />
                  ) : (
                    <ChatEmptyState />
                  )}
                </div>
              </section>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}