import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { getMyChats } from "../api/chat";
import { useAuth } from "../auth/AuthContext";

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const { user } = useAuth();

  const [chats, setChats] = useState([]);
  const [loadingChats, setLoadingChats] = useState(false);

  const socketRef = useRef(null);
  const hasConnectedRef = useRef(false);

  const loadChats = useCallback(async () => {
    if (!user?.id) {
      setChats([]);
      return;
    }

    try {
      setLoadingChats(true);
      const data = await getMyChats();
      setChats(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load chats:", err);
    } finally {
      setLoadingChats(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;

    loadChats();
  }, [user?.id, loadChats]);

  useEffect(() => {
    if (!user?.id) return;

    if (hasConnectedRef.current) return;
    hasConnectedRef.current = true;

    const ws = new WebSocket(`ws://127.0.0.1:8000/chat/ws-global/${user.id}`);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("Global WS connected");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "chat_list_update") {
        loadChats();
      }

      if (data.type === "notification_update") {
        window.dispatchEvent(new Event("notification-update"));
      }
    };

    ws.onclose = () => {
      console.log("Global WS closed");
      hasConnectedRef.current = false;
    };

    return () => {
      ws.close();
      socketRef.current = null;
      hasConnectedRef.current = false;
    };
  }, [user?.id, loadChats]);

  const unreadConversationCount = chats.filter(
    (chat) => (chat.unread_count || 0) > 0
  ).length;

  return (
    <ChatContext.Provider
      value={{
        chats,
        setChats,
        loadChats,
        loadingChats,
        unreadConversationCount,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used inside ChatProvider");
  }
  return context;
}