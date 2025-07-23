// components/MessageInput.jsx
"use client";
import { useState } from "react";
import api from "../utils/api";

export default function MessageInput({
  chatId,
  onNewMessage,
  setIsGenerating,
  abortControllerRef,
}) {
  const [content, setContent] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    const userMsg = {
      role: "user",
      content: content.trim(),
    };

    onNewMessage(userMsg);
    setContent("");
    setIsGenerating(true);

    try {
      // Create new AbortController and assign to ref
      const controller = new AbortController();
      abortControllerRef.current = controller;

      // Send user message to server
      const res = await api.post(
        `/chat/${chatId}/message`,
        { content },
        {
          signal: controller.signal, // pass signal here
        }
      );

      const assistantMsg = {
        role: "assistant",
        content: res.data.reply,
      };

      onNewMessage(assistantMsg);
    } catch (err) {
      if (err.name === "CanceledError" || err.name === "AbortError") {
        console.log("Message generation aborted.");
      } else {
        console.error("Error sending message:", err);
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex space-x-2">
      <input
        type="text"
        placeholder="Send a message..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="flex-1 border px-4 py-2 rounded-md text-sm"
        disabled={abortControllerRef.current !== null}
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
        disabled={abortControllerRef.current !== null}
      >
        Send
      </button>
    </form>
  );
}
