"use client";

import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { Send, Loader2, Bot, User } from "lucide-react";
import { motion } from "framer-motion";

export default function ChatPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const chatRef = useRef<HTMLDivElement | null>(null);
  const accessToken = useAuthStore((s) => s.accessToken);
  const router = useRouter();

  // Auto scroll
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  // Load previous chat messages
  useEffect(() => {
    const loadHistory = async () => {
      if (!accessToken) return;

      try {
        const res = await fetch("/api/ai/history", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (res.status === 401) {
          useAuthStore.getState().logout();
          router.push("/login");
          return;
        }

        if (!res.ok) {
          console.error("Failed to load history");
          return;
        }

        const data = await res.json();
        setMessages(data.messages || []);
      } catch (err) {
        console.error("Error loading history:", err);
      }
    };

    loadHistory();
  }, [accessToken, router]);

  const sendMessage = async () => {
    if (!input.trim() || loading || !accessToken) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);

    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ 
          messages: [...messages, userMessage] 
        }),
      });

      if (res.status === 401) {
        useAuthStore.getState().logout();
        router.push("/login");
        return;
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `⚠️ ${errorData.error || "Something went wrong."}` },
        ]);
        setLoading(false);
        return;
      }

      const data = await res.json();
      const botMessage = { role: "assistant", content: data.reply };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error("Error sending message:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Something went wrong." },
      ]);
    }

    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-70px)] p-4">
      <h1 className="text-2xl font-bold mb-2">AI Assistant</h1>
      <p className="text-gray-500 text-sm mb-4">
        Ask anything about your financial activity
      </p>

      <div
        ref={chatRef}
        className="flex-1 overflow-y-auto p-4 bg-white border rounded-xl space-y-4"
      >
        {messages.length === 0 && !loading && (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <Bot className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No messages yet. Start the conversation!</p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-2 items-end ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-gray-700" />
              </div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 max-w-[70%] rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-gray-100 text-gray-800 rounded-bl-none"
              }`}
            >
              {msg.content}
            </motion.div>

            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="animate-spin w-4 h-4" />
            <span>Thinking…</span>
          </div>
        )}
      </div>

      <div className="mt-3 flex gap-2">
        <textarea
          value={input}
          onKeyDown={handleKeyDown}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message…"
          className="flex-1 p-3 border rounded-xl resize-none min-h-[50px] max-h-[120px]"
          disabled={loading}
        />

        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="p-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}
