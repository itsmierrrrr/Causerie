import { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";

const hashString = (value = "") =>
  value.split("").reduce((hash, character) => (hash * 31 + character.charCodeAt(0)) >>> 0, 0);

const buildAvatarStyle = (seed = "") => {
  const palette = ["#5b88b2", "#7fa6cb", "#fbf9e4", "#8ab8e8", "#2f4e77"];
  const color = palette[hashString(seed) % palette.length];

  return {
    background: color,
    color: color === "#fbf9e4" ? "#000000" : "#fbf9e4",
  };
};

const ChatPage = () => {
  const { user, setUser, logout } = useAuth();
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const activeUserRef = useRef(null);

  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [usernameInput, setUsernameInput] = useState(user?.username || "");
  const [usernameStatus, setUsernameStatus] = useState("");

  useEffect(() => {
    activeUserRef.current = activeUser;
  }, [activeUser]);

  useEffect(() => {
    setUsernameInput(user?.username || "");
  }, [user?.username]);

  useEffect(() => {
    const loadConversations = async () => {
      try {
        const { data } = await api.get("/messages/conversations");
        setConversations(data.conversations || []);
      } catch {
        setConversations([]);
      }
    };

    loadConversations();
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    const socket = io(SOCKET_URL, { transports: ["websocket"] });
    socket.emit("setup", user.id);
    socketRef.current = socket;

    socket.on("message:new", (incoming) => {
      const active = activeUserRef.current;
      const peer =
        incoming.sender === user.id ? incoming.receiverProfile : incoming.senderProfile;

      setConversations((prev) => {
        const rest = prev.filter((c) => c.user.id !== peer.id);
        return [{ user: peer, latestMessage: incoming }, ...rest];
      });

      if (active && (incoming.sender === active.id || incoming.receiver === active.id)) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === incoming.id)) return prev;
          return [...prev, incoming];
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user?.id]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!search.trim()) {
        setSearchResults([]);
        return;
      }

      try {
        const { data } = await api.get(`/users/search?q=${encodeURIComponent(search)}`);
        setSearchResults(data.users || []);
      } catch {
        setSearchResults([]);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const activeUserId = activeUser?.id;

  const openConversation = async (targetUser) => {
    setActiveUser(targetUser);
    setSearch("");
    setSearchResults([]);

    try {
      const { data } = await api.get(`/messages/${targetUser.id}`);
      setMessages(data.messages || []);
      setConversations((prev) => {
        const existing = prev.find((c) => c.user.id === targetUser.id);
        if (existing) return prev;
        return [{ user: targetUser, latestMessage: null }, ...prev];
      });
    } catch {
      setMessages([]);
    }
  };

  const sendMessage = async (event) => {
    event.preventDefault();
    if (!activeUserId || !messageInput.trim()) return;

    try {
      const { data } = await api.post(`/messages/${activeUserId}`, {
        text: messageInput,
      });

      setMessageInput("");
      setMessages((prev) => {
        if (prev.some((m) => m.id === data.message.id)) return prev;
        return [...prev, data.message];
      });
      setConversations((prev) => {
        const rest = prev.filter((c) => c.user.id !== activeUserId);
        return [{ user: activeUser, latestMessage: data.message }, ...rest];
      });
    } catch {
      // Intentionally silent for now; UI remains responsive.
    }
  };

  const updateUsername = async (event) => {
    event.preventDefault();
    setUsernameStatus("");

    try {
      const { data } = await api.put("/users/username", {
        username: usernameInput,
      });
      setUser(data.user);
      setUsernameStatus("Username updated.");
    } catch (err) {
      setUsernameStatus(err?.response?.data?.message || "Could not update username.");
    }
  };

  const sortedConversations = useMemo(
    () =>
      [...conversations].sort((a, b) => {
        const aTime = new Date(a.latestMessage?.createdAt || 0).getTime();
        const bTime = new Date(b.latestMessage?.createdAt || 0).getTime();
        return bTime - aTime;
      }),
    [conversations]
  );

  const activeConversationCount = sortedConversations.length;

  return (
    <div className="chat-shell">
      <nav className="sidebar-left">
        <div className="logo-icon">◇</div>

        <div className="search-container">
          <input
            className="search-input"
            placeholder="Search people..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="search-icon">🔍</span>
          {searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.map((result) => (
                <button
                  type="button"
                  key={result.id}
                  className="search-result-item"
                  onClick={() => openConversation(result)}
                >
                  <div className="avatar avatar-sm" style={buildAvatarStyle(result.username)}>
                    {getInitials(result.name || result.username)}
                  </div>
                  <div className="result-info">
                    <strong>{result.name}</strong>
                    <span>@{result.username}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="conversations-list-container">
          {sortedConversations.map((entry) => {
            const isActive = activeUserId === entry.user.id;
            const preview = entry.latestMessage?.text || "No messages yet";

            return (
              <button
                key={entry.user.id}
                type="button"
                className={`conversation-list-item ${isActive ? "active" : ""}`}
                onClick={() => openConversation(entry.user)}
              >
                <div className="avatar avatar-sm" style={buildAvatarStyle(entry.user.username)}>
                  {getInitials(entry.user.name)}
                </div>
                <div className="conversation-list-info">
                  <strong>{entry.user.name}</strong>
                  <span>{preview.substring(0, 36)}</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="sidebar-bottom">
          <div className="profile-section">
            <div className="profile-header">
              <div className="avatar avatar-sm" style={buildAvatarStyle(user?.username || user?.name)}>
                {getInitials(user?.name || user?.username)}
              </div>
              <div className="profile-text">
                <strong>{user?.name}</strong>
                <span>@{user?.username}</span>
              </div>
            </div>

            <form onSubmit={updateUsername} className="username-form">
              <input
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                minLength={3}
                maxLength={24}
                required
                placeholder="Update username"
              />
              <button type="submit" className="btn-update">
                Update
              </button>
            </form>
            {usernameStatus && <p className="status-message">{usernameStatus}</p>}
          </div>

          <div className="control-buttons">
            <button type="button" className="control-btn" onClick={() => setSearch("")}>
              Clear Search
            </button>
            <button type="button" className="control-btn" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="main-chat">
        <header className="chat-header">
          <div>
            <h2>{user?.name || "You"}</h2>
            <p>{activeUser ? `Chatting with ${activeUser.name}` : `${activeConversationCount} conversations`}</p>
          </div>
          <div className="header-actions">
            <button type="button" className="header-btn" onClick={() => setMessages([])}>
              Clear View
            </button>
            <button type="button" className="header-btn" onClick={() => activeUser && openConversation(activeUser)}>
              Refresh
            </button>
          </div>
        </header>

        {activeUser ? (
          <>
            <section className="messages-feed">
              {messages.map((message) => {
                const isMine = message.sender === user?.id;

                return (
                  <div key={message.id} className={`message-row ${isMine ? "mine" : "theirs"}`}>
                    <div className="message-group">
                      <div className="message-meta">
                        <span>{isMine ? "You" : activeUser.name}</span>
                        <time>
                          {new Date(message.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </time>
                      </div>
                      <div className="message-bubble">{message.text}</div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </section>

            <form className="message-composer" onSubmit={sendMessage}>
              <input
                placeholder={`Type a message to ${activeUser.name}...`}
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
              />
              <button type="submit" className="send-btn">
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">✦</div>
            <h3>Select a conversation</h3>
            <p>Search for a user or pick an existing chat to start messaging.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
