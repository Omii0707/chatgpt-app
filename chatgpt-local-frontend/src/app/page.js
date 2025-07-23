// app/page.js  vh
//c hghgh
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../utils/api";

export default function Home() {
  const router = useRouter();
  const [chats, setChats] = useState([]);

  useEffect(() => {
    api.get("/chats").then((res) => setChats(res.data));
  }, []);

  const createChat = async () => {
    const res = await api.post("/chat", { title: "" });
    router.push(`/chat/${res.data.id}`);
  };

  return (
    <div className="min-h-screen bg-slate-100 px-6 py-10 font-sans">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-semibold mb-6 text-gray-800">
          Your Chats
        </h1>

        <button
          onClick={createChat}
          className="mb-6 bg-black text-white px-5 py-2 rounded-md font-medium hover:bg-gray-800"
        >
          + New Chat
        </button>

        <ul className="space-y-4">
          {chats.map((chat) => (
            <li
              key={chat.id}
              className="border p-4 rounded hover:bg-gray-50 transition"
            >
              <a
                href={`/chat/${chat.id}`}
                className="text-blue-600 hover:underline font-medium"
              >
                {chat.title || `Chat ${chat.id}`}
              </a>
              <div className="text-sm text-gray-500">
                {new Date(chat.created_at).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
