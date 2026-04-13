import { useEffect, useState } from "react";
import DashboardHeader from "../components/DashboardHeader";
import ChatSidebar from "../components/ChatSidebar";
import ChatWindow from "../components/ChatWindow";
import ChatEmptyState from "../components/ChatEmptyState";
import { useChatContext } from "../context/ChatContext";

export default function ChatPage() {
  const { chats, loadChats, loadingChats } = useChatContext();

  const [selectedChat, setSelectedChat] = useState(null);

  useEffect(() => {
    if (!selectedChat || chats.length === 0) return;

    const latestSelectedChat = chats.find(
      (chat) => chat.job_id === selectedChat.job_id
    );

    if (latestSelectedChat) {
      setSelectedChat(latestSelectedChat);
    }
  }, [chats, selectedChat]);

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
                    onChatMetaChange={loadChats}
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