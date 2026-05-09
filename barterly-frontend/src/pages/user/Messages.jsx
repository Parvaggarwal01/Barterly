import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import authService from "../../services/authService";
import chatService from "../../services/chatService";
import socketService from "../../services/socketService";
import DashboardHeader from "../../components/layout/DashboardHeader";
import Sidebar from "../../components/layout/Sidebar";

const Messages = () => {
  const location = useLocation();
  const [user] = useState(() => authService.getUser() || {});
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [conversationSearch, setConversationSearch] = useState("");

  const messagesEndRef = useRef(null);

  // Initialize socket and fetch initial data
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      socketService.connect(token);
    }

    const loadConversations = async () => {
      try {
        const res = await chatService.getConversations();
        const loadedConvos = res.data?.data || res.data || [];
        setConversations(loadedConvos);

        // Check if we came from another page telling us to open a specific chat
        if (location.state?.activeConversationId && !activeConversation) {
          const targetConvo = loadedConvos.find(
            (c) => c._id === location.state.activeConversationId,
          );
          if (targetConvo) {
            setActiveConversation(targetConvo);
          }
        }
      } catch (err) {
        console.error("Failed to load conversations", err);
      }
    };

    loadConversations();

    // Listen for incoming dynamic messages globally to update unreads/previews
    socketService.on("new_message", (msg) => {
      // If the message belongs to our currently active conversation pane, inject it into the stream
      if (activeConversation && msg.conversation === activeConversation._id) {
        setMessages((prev) => [...prev, msg]);
      }

      // Reorder and update conversation list's lastMessage
      setConversations((prevConvos) => {
        const updated = prevConvos.map((c) => {
          if (c._id === msg.conversation) {
            return { ...c, lastMessage: msg };
          }
          return c;
        });
        // Sort by most recently updated
        return updated.sort(
          (a, b) =>
            new Date(b.lastMessage?.createdAt || 0) -
            new Date(a.lastMessage?.createdAt || 0),
        );
      });
    });

    return () => {
      socketService.off("new_message");
      socketService.disconnect();
    };
  }, [activeConversation]);

  // Load messages whenever active conversation changes
  useEffect(() => {
    if (activeConversation) {
      const loadMessages = async () => {
        try {
          const res = await chatService.getMessages(activeConversation._id);
          setMessages(res.data?.data || res.data || []);

          // Join socket room to listen for typing events and specific message drops
          socketService.emit("join_conversation", {
            conversationId: activeConversation._id,
          });
        } catch (err) {
          console.error("Failed to load messages", err);
        }
      };

      loadMessages();

      return () => {
        socketService.emit("leave_conversation", {
          conversationId: activeConversation._id,
        });
      };
    }
  }, [activeConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    try {
      // Send payload to backend HTTP. The server will fire the socket event 'new_message' to everyone in the room!
      await chatService.sendMessage(activeConversation._id, newMessage);
      setNewMessage("");
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  const getOtherParticipant = (conversation) => {
    const currentUserId = user._id || user.id;
    return (
      conversation.participants.find((p) => p._id !== currentUserId) ||
      conversation.participants[0]
    );
  };

  return (
    <div className="font-display bg-[#FFFBF0] h-screen flex flex-col overflow-hidden text-black">
      <DashboardHeader onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar
          isOpen={isSidebarOpen}
          closeSidebar={() => setIsSidebarOpen(false)}
        />

        <main className="flex-1 flex overflow-hidden bg-[#FFFBF0]">
          {/* Conversation List Sidebar */}
          <div
            className={`w-full md:w-[320px] bg-white border-r-2 border-black flex flex-col shrink-0 ${activeConversation ? "hidden md:flex" : "flex"}`}
          >
            <div className="p-6 border-b-2 border-black bg-white">
              <h2 className="text-3xl font-extrabold mb-4 tracking-tight uppercase">
                Messages
              </h2>
              <div className="relative">
                <input
                  className="w-full bg-white border-2 border-black px-3 py-2 text-sm font-bold placeholder-gray-500 focus:outline-none focus:ring-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] placeholder:font-medium"
                  placeholder="Search conversations..."
                  type="text"
                  value={conversationSearch}
                  onChange={(e) => setConversationSearch(e.target.value)}
                />
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-black text-sm">
                  search
                </span>
              </div>
            </div>

            <div className="overflow-y-auto flex-1">
              {(() => {
                const filteredConvos = conversations.filter((c) => {
                  const other = getOtherParticipant(c);
                  return other?.name
                    ?.toLowerCase()
                    .includes(conversationSearch.toLowerCase());
                });

                if (filteredConvos.length === 0) {
                  return (
                    <div className="p-6 text-center text-gray-500 font-bold text-sm">
                      No conversations found.
                    </div>
                  );
                }

                return filteredConvos.map((convo) => {
                  const otherUser = getOtherParticipant(convo);
                  const isActive = activeConversation?._id === convo._id;

                  return (
                    <div
                      key={convo._id}
                      onClick={() => setActiveConversation(convo)}
                      className={`flex items-start gap-3 p-4 border-b-2 border-black cursor-pointer transition-colors group ${
                        isActive
                          ? "bg-[#FFDE59] border-l-[6px] border-l-black hover:bg-[#e6c300]"
                          : "bg-white hover:bg-neutral-100 border-l-[6px] border-l-transparent"
                      }`}
                    >
                      <div className="w-12 h-12 border-2 border-black shrink-0 relative bg-gray-200 overflow-hidden">
                        {otherUser?.avatar ? (
                          <img
                            src={
                              typeof otherUser.avatar === "object"
                                ? otherUser.avatar.url
                                : otherUser.avatar
                            }
                            alt={otherUser.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-blue-200 flex items-center justify-center font-bold text-lg uppercase">
                            {otherUser?.name?.[0] || "?"}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                          <h4 className="font-bold text-sm truncate uppercase group-hover:underline">
                            {otherUser?.name || "Unknown User"}
                          </h4>
                          <span className="text-[10px] font-bold text-black/70">
                            {convo.lastMessage
                              ? new Date(
                                  convo.lastMessage.createdAt,
                                ).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : ""}
                          </span>
                        </div>
                        <p
                          className={`text-xs truncate ${isActive ? "text-black font-bold" : "text-gray-600"}`}
                        >
                          {convo.lastMessage?.content || "No messages yet"}
                        </p>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          {/* Active Chat Area */}
          {activeConversation ? (
            <div className="flex-1 flex flex-col min-w-0 bg-[#FFFBF0]">
              {/* Chat Area Header */}
              <div className="h-20 bg-white border-b-2 border-black flex items-center justify-between px-4 md:px-6 shrink-0 z-10">
                <div className="flex items-center gap-4">
                  {/* Mobile Back Button */}
                  <button
                    onClick={() => setActiveConversation(null)}
                    className="md:hidden w-8 h-8 border-2 border-black flex items-center justify-center bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none"
                  >
                    <span className="material-symbols-outlined text-sm">
                      arrow_back
                    </span>
                  </button>

                  <div className="w-10 h-10 border-2 border-black bg-blue-200 flex items-center justify-center font-bold text-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                    {getOtherParticipant(activeConversation)?.avatar ? (
                      <img
                        src={
                          typeof getOtherParticipant(activeConversation)
                            .avatar === "object"
                            ? getOtherParticipant(activeConversation).avatar.url
                            : getOtherParticipant(activeConversation).avatar
                        }
                        alt="avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="uppercase">
                        {getOtherParticipant(activeConversation)?.name?.[0] ||
                          "?"}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold leading-none uppercase">
                      {getOtherParticipant(activeConversation)?.name ||
                        "Unknown User"}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="w-2 h-2 bg-green-500 border border-black"></span>
                      <span className="text-xs font-bold text-gray-600">
                        Active
                      </span>
                    </div>
                  </div>
                </div>
                {activeConversation.barter && (
                  <Link
                    to={`/requests`}
                    className="bg-transparent hover:bg-neutral-100 text-black border-2 border-black px-4 py-2 text-xs font-bold uppercase transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none hidden sm:block"
                  >
                    View Barter
                  </Link>
                )}
              </div>

              {/* Message Stream */}
              <div
                className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-6 relative"
                id="chat-container"
              >
                {messages.length === 0 && (
                  <div className="flex justify-center my-4">
                    <span className="bg-white text-black text-xs font-bold px-3 py-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      Say hello!
                    </span>
                  </div>
                )}

                {messages.map((msg, index) => {
                  const currentUserId = user._id || user.id;
                  const isMe = msg.sender?._id === currentUserId;
                  const senderUser = isMe
                    ? user
                    : getOtherParticipant(activeConversation);

                  return (
                    <div
                      key={msg._id || index}
                      className={`flex items-end gap-3 max-w-[85%] md:max-w-[70%] group ${isMe ? "self-end flex-row-reverse" : "self-start"}`}
                    >
                      <div
                        className={`w-8 h-8 border-2 border-black shrink-0 flex items-center justify-center font-bold text-xs mb-1 overflow-hidden ${isMe ? "bg-gray-100" : "bg-blue-200"}`}
                      >
                        {senderUser?.avatar ? (
                          <img
                            src={
                              typeof senderUser.avatar === "object"
                                ? senderUser.avatar.url
                                : senderUser.avatar
                            }
                            alt="avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="uppercase">
                            {senderUser?.name?.[0] || "?"}
                          </span>
                        )}
                      </div>
                      <div
                        className={`flex flex-col gap-1 ${isMe ? "items-end" : ""}`}
                      >
                        <div
                          className={`p-4 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] relative ${isMe ? "bg-[#FFDE59]" : "bg-white"}`}
                        >
                          <p className="text-sm font-medium leading-relaxed">
                            {msg.content}
                          </p>
                        </div>
                        <span
                          className={`text-[10px] font-bold text-gray-500 ${isMe ? "mr-1" : "ml-1"}`}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Area */}
              <div className="bg-white border-t-4 border-black p-4 shrink-0">
                <form
                  onSubmit={handleSendMessage}
                  className="flex items-end gap-2 md:gap-3 max-w-5xl mx-auto"
                >
                  <button
                    type="button"
                    className="w-12 h-12 flex items-center justify-center border-2 border-black bg-white hover:bg-neutral-100 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none shrink-0"
                    title="Attach File"
                  >
                    <span className="material-symbols-outlined">
                      attach_file
                    </span>
                  </button>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="w-full bg-white border-2 border-black p-3 pr-10 text-sm font-bold placeholder-gray-400 focus:outline-none focus:ring-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] h-12 transition-all focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                      placeholder="Type a message..."
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-3 text-gray-400 hover:text-black transition-colors"
                    >
                      <span className="material-symbols-outlined text-xl">
                        sentiment_satisfied
                      </span>
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="h-12 px-4 md:px-6 flex items-center justify-center gap-2 border-2 border-black bg-[#FFDE59] hover:bg-[#e6c300] transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none shrink-0 font-bold uppercase text-sm tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="hidden md:inline">Send</span>
                    <span className="text-lg">→</span>
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="flex-1 hidden md:flex flex-col items-center justify-center bg-[#FFFBF0] text-center p-8">
              <div className="w-24 h-24 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-5xl">chat</span>
              </div>
              <h3 className="text-2xl font-extrabold uppercase">
                Select a conversation
              </h3>
              <p className="text-sm font-bold text-gray-500 mt-2 max-w-sm">
                Choose an existing conversation from the sidebar or start a new
                barter to begin chatting.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Messages;
