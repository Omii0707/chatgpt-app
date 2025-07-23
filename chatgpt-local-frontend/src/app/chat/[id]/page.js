// === Fully Styled Chat UI with Sidebar (Based on reference image) ===
"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "../../../utils/api";
import MessageInput from "../../../components/MessageInput";

export default function ChatPage() {
  const { id } = useParams();
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const abortControllerRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    api.get("/chats").then((res) => setChats(res.data));
  }, []);

  useEffect(() => {
    if (id) {
      api.get(`/chat/${id}`).then((res) => setMessages(res.data));
      const chat = chats.find((c) => c.id === parseInt(id));
      if (chat) setCurrentChat(chat);
    }
  }, [id, chats]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleNewMessage = (msg) => {
    setMessages((prev) => [...prev, msg]);

    // Title setting logic
    if (!currentChat?.title && msg.role === "assistant") {
      const title = msg.content
        .split(/[\\.\\!\\?]/)[0]
        .slice(0, 50)
        .trim();
      api.put(`/chat/${id}`, { title });
      setCurrentChat((prev) => ({ ...prev, title }));
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === parseInt(id) ? { ...chat, title } : chat
        )
      );
    }

    setIsGenerating(false); // Done generating
  };

  const createNewChat = async () => {
    const res = await api.post("/chat", { title: "" });
    router.push(`/chat/${res.data.id}`);
  };

  return (
    <div className="h-screen flex bg-slate-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-white p-4 flex flex-col h-screen overflow-y-auto">
        <button
          onClick={createNewChat}
          className="mb-4 bg-indigo-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-indigo-700"
        >
          New Chat
        </button>
        <h2 className="text-sm text-gray-600 mb-2">ChatGPT-style App</h2>
        <ul className="space-y-2 text-sm">
          {chats.map((chat) => (
            <li
              key={chat.id}
              onClick={() => router.push(`/chat/${chat.id}`)}
              className={`cursor-pointer p-2 rounded hover:bg-indigo-100 ${
                chat.id == id ? "bg-indigo-200 font-semibold" : ""
              }`}
            >
              {chat.title || `Chat ${chat.id}`}
              <span className="block text-xs text-gray-400">
                {new Date(chat.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </li>
          ))}
        </ul>
      </aside>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <header className="border-b p-4 bg-white flex justify-between items-center">
          <h1 className="text-lg font-semibold text-slate-800">
            {currentChat?.title || "Chat"}
          </h1>
          <div className="space-x-2">
            <button
              onClick={() => router.push("/")}
              className="px-3 py-1 bg-indigo-100 rounded hover:bg-indigo-200 text-sm"
            >
              Home
            </button>
            {isGenerating && (
              <button
                onClick={() => {
                  if (abortControllerRef.current) {
                    abortControllerRef.current.abort();
                    setIsGenerating(false);
                  }
                }}
                className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
              >
                Stop
              </button>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`max-w-2xl px-4 py-2 rounded-md w-fit ${
                msg.role === "user"
                  ? "ml-auto bg-indigo-600 text-white"
                  : "mr-auto bg-slate-100 text-gray-900"
              }`}
            >
              <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <footer className="p-4 border-t bg-white">
          <MessageInput
            chatId={id}
            onNewMessage={handleNewMessage}
            setIsGenerating={setIsGenerating}
            abortControllerRef={abortControllerRef}
          />
        </footer>
      </div>
    </div>
  );
}
