import { useEffect, useMemo, useRef, useState } from "react";
import { MoreVertical, Paperclip, Send, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getChatMessages } from "../api/chat";
import { useAuth } from "../auth/AuthContext";
import ChatMessageBubble from "./ChatMessageBubble";

function formatLastSeen(dateString) {
  if (!dateString) return "Offline";

  const seen = new Date(dateString);
  const now = new Date();
  const diffMs = now - seen;

  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));

  if (minutes < 1) return "Last seen just now";
  if (minutes < 60) return `Last seen ${minutes}m ago`;
  if (hours < 24) return `Last seen ${hours}h ago`;

  return "Offline";
}

function TypingIndicator({ name }) {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-500">
      <span>{name} is typing</span>

      <span className="flex gap-1">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.2s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.1s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
      </span>
    </div>
  );
}

export default function ChatWindow({ selectedChat, onChatMetaChange }) {
  const { user } = useAuth();
  const currentUserId = user?.id;
  const navigate = useNavigate();

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
        setMessages([]);
        setIsOtherUserTyping(false);

        const data = await getChatMessages(selectedChat.job_id);

        if (isMounted) {
          setMessages(Array.isArray(data) ? data : []);
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

            onChatMetaChangeRef.current?.({ silent: true });
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

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      if (ws) {
        ws.close();
      }
    };
  }, [selectedChat?.job_id, selectedChat?.other_user_id, currentUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOtherUserTyping]);

  const lastMineMessageId = useMemo(() => {
    const mine = [...messages]
      .reverse()
      .find((message) => message.sender_user_id === currentUserId);

    return mine?.id;
  }, [messages, currentUserId]);

  function sendTyping(isTyping) {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

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
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

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
  function handleViewProfile() {
    if (!selectedChat?.other_user_id) return;

    if (user?.current_mode === "poster") {
      navigate(`/workers/${selectedChat.other_user_id}`);
      return;
    }

    navigate(`/posters/${selectedChat.other_user_id}`);
  }
  return (
    <section className="flex h-full flex-col bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative shrink-0">
            {selectedChat.other_user_photo_data_url ? (
              <img
                src={selectedChat.other_user_photo_data_url}
                alt={selectedChat.other_user_name}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 font-semibold text-slate-700">
                {selectedChat.other_user_name?.[0]?.toUpperCase() || "U"}
              </div>
            )}

            <span
              className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white ${otherUserOnline ? "bg-emerald-500" : "bg-slate-300"
                }`}
            />
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-base font-bold text-slate-900">
              {selectedChat.other_user_name}
            </h3>

            <p className="truncate text-xs text-slate-500">
              {selectedChat.job_title}
            </p>

            <p className="mt-0.5 text-xs text-slate-400">
              {isOtherUserTyping
                ? `${selectedChat.other_user_name} is typing...`
                : otherUserOnline
                  ? "Online"
                  : formatLastSeen(otherUserLastSeenAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleViewProfile}
            className="flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            <UserRound className="h-4 w-4" />
            View Profile
          </button>

          <button
            type="button"
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100"
          >
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-6">
        {loading ? (
          <div className="text-sm text-slate-500">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            No messages yet. Start the conversation.
          </div>
        ) : (
          <div className="space-y-5">
            <div className="mx-auto w-fit rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs text-amber-700">
              Chat activated. You can now communicate about this job.
            </div>

            {messages.map((message) => (
              <ChatMessageBubble
                key={message.id}
                message={message}
                isMine={message.sender_user_id === currentUserId}
                isLastMine={message.id === lastMineMessageId}
              />
            ))}

            {isOtherUserTyping && (
              <TypingIndicator name={selectedChat.other_user_name} />
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <footer className="border-t border-slate-200 bg-white px-5 py-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100"
          >
            <Paperclip className="h-5 w-5" />
          </button>

          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="min-w-0 flex-1 rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
          />

          <button
            type="button"
            onClick={handleSendMessage}
            disabled={!socketConnected || !input.trim()}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </footer>
    </section>
  );
}