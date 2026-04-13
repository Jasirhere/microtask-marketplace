import { useEffect, useMemo, useRef, useState } from "react";
import { getChatMessages } from "../api/chat";
import { useAuth } from "../auth/AuthContext";
import ChatMessageBubble from "./ChatMessageBubble";

export default function ChatWindow({ selectedChat, onChatMetaChange }) {
  const { user } = useAuth();
  const currentUserId = user?.id;

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const [otherUserOnline, setOtherUserOnline] = useState(
    selectedChat?.other_user_online || false
  );
  const [otherUserLastSeenAt, setOtherUserLastSeenAt] = useState(
    selectedChat?.other_user_last_seen_at || null
  );

  const socketRef = useRef(null);
  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const onChatMetaChangeRef = useRef(onChatMetaChange);

  useEffect(() => {
    onChatMetaChangeRef.current = onChatMetaChange;
  }, [onChatMetaChange]);

  useEffect(() => {
    setOtherUserOnline(selectedChat?.other_user_online || false);
    setOtherUserLastSeenAt(selectedChat?.other_user_last_seen_at || null);
  }, [selectedChat?.other_user_online, selectedChat?.other_user_last_seen_at]);

  useEffect(() => {
    if (!selectedChat || !currentUserId) return;
    if (selectedChat.other_user_id === currentUserId) return;

    let isMounted = true;
    let ws = null;

    async function setupChat() {
      try {
        setLoading(true);
        const data = await getChatMessages(selectedChat.job_id);

        if (isMounted) {
          setMessages(data);
          setLoading(false);
        }

        const wsUrl = `ws://127.0.0.1:8000/chat/ws/${selectedChat.job_id}/${currentUserId}`;
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          if (!isMounted) return;
          setSocketConnected(true);

          ws.send(
            JSON.stringify({
              type: "seen",
              user_id: currentUserId,
            })
          );
        };

        ws.onmessage = (event) => {
          const payload = JSON.parse(event.data);
          if (!isMounted) return;

          if (payload.type === "message") {
            setMessages((prev) => [...prev, payload]);

            if (
              payload.sender_user_id !== currentUserId &&
              socketRef.current?.readyState === WebSocket.OPEN
            ) {
              socketRef.current.send(
                JSON.stringify({
                  type: "seen",
                  user_id: currentUserId,
                })
              );
            }

            if (onChatMetaChangeRef.current) {
              onChatMetaChangeRef.current();
            }
            return;
          }

          if (payload.type === "typing") {
            if (payload.user_id !== currentUserId) {
              setIsOtherUserTyping(payload.is_typing);
            }
            return;
          }

          if (payload.type === "seen") {
            if (payload.user_id !== currentUserId) {
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.sender_user_id === currentUserId
                    ? { ...msg, is_seen: true }
                    : msg
                )
              );
            }
            return;
          }

          if (payload.type === "presence") {
            if (payload.user_id === selectedChat.other_user_id) {
              setOtherUserOnline(payload.online);
              setOtherUserLastSeenAt(payload.last_seen_at || null);
            }
          }
        };

        ws.onerror = () => {
          if (isMounted) {
            setSocketConnected(false);
            setIsOtherUserTyping(false);
          }
        };

        ws.onclose = () => {
          if (isMounted) {
            setSocketConnected(false);
            setIsOtherUserTyping(false);
          }
        };

        socketRef.current = ws;
      } catch (err) {
        console.error("Failed to initialize chat:", err);
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    setupChat();

    return () => {
      isMounted = false;
      if (ws) {
        ws.close();
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [selectedChat?.job_id, selectedChat?.other_user_id, currentUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOtherUserTyping]);

  function sendTyping(isTyping) {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;

    socketRef.current.send(
      JSON.stringify({
        type: "typing",
        user_id: currentUserId,
        is_typing: isTyping,
      })
    );
  }

  function handleInputChange(e) {
    const value = e.target.value;
    setInput(value);

    sendTyping(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      sendTyping(false);
    }, 1200);
  }

  function handleSendMessage() {
    const text = input.trim();
    if (!text) return;
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;

    socketRef.current.send(
      JSON.stringify({
        type: "message",
        sender_user_id: currentUserId,
        receiver_user_id: selectedChat.other_user_id,
        text,
      })
    );

    sendTyping(false);
    setInput("");
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }

  const lastMineMessageId = useMemo(() => {
    const mine = [...messages].reverse().find((m) => m.sender_user_id === currentUserId);
    return mine?.id;
  }, [messages, currentUserId]);

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
    return "Offline";
  }

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center justify-between gap-4 border-b bg-slate-50 px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            {selectedChat.other_user_photo_data_url ? (
              <img
                src={selectedChat.other_user_photo_data_url}
                alt={selectedChat.other_user_name}
                className="h-12 w-12 rounded-full object-cover border"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full border bg-slate-100 font-semibold text-slate-600">
                {selectedChat.other_user_name?.[0]?.toUpperCase() || "U"}
              </div>
            )}

            <span
              className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white ${
                otherUserOnline ? "bg-green-500" : "bg-red-500"
              }`}
            />
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-2xl font-bold text-slate-900">
              {selectedChat.other_user_name}
            </h3>
            <p className="truncate text-sm text-slate-500">
              Job: {selectedChat.job_title}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {otherUserOnline ? "Online" : formatLastSeen(otherUserLastSeenAt)}
            </p>
          </div>
        </div>

        <div className="text-sm">
          {socketConnected ? (
            <span className="rounded-full bg-green-100 px-3 py-1 text-green-700">
              Connected
            </span>
          ) : (
            <span className="rounded-full bg-red-100 px-3 py-1 text-red-700">
              Not connected
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-50 px-6 py-6">
        {loading ? (
          <div className="text-slate-500">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-slate-500">
            No messages yet. Start the conversation.
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <ChatMessageBubble
                key={message.id}
                message={message}
                isMine={message.sender_user_id === currentUserId}
                isLastMine={message.id === lastMineMessageId}
              />
            ))}

            {isOtherUserTyping && (
              <div className="text-sm text-slate-500">
                {selectedChat.other_user_name} is typing...
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <div className="border-t bg-white p-5">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 rounded-2xl border px-4 py-3 outline-none focus:border-violet-400"
          />

          <button
            onClick={handleSendMessage}
            disabled={!socketConnected}
            className="rounded-2xl bg-violet-600 px-5 py-3 font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}