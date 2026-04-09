"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Send, User, Bot, BarChart3, TrendingUp, Sparkles, RefreshCcw } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Message {
  role: "ai" | "user";
  text: string;
  feedback?: string;
}

export default function InterviewPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", text: "Welcome! I'm your AI Interview Preparer. What role or domain are you preparing for today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(0);
  const [difficulty, setDifficulty] = useState(1);
  const [threadId] = useState(() => Math.random().toString(36).substring(7));
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:8000/chat", {
        thread_id: threadId,
        text: input,
      });

      const { message, feedback, score: newScore, difficulty: newDifficulty } = response.data;

      const aiMsg: Message = { role: "ai", text: message, feedback };
      setMessages((prev) => [...prev, aiMsg]);
      setScore(newScore);
      setDifficulty(newDifficulty);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [...prev, { role: "ai", text: "Sorry, I encountered an error. Is the backend running?" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-6xl mx-auto p-4 md:p-8 flex flex-col h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Interview AI
            </h1>
            <p className="text-sm text-gray-500">Professional Prep Agent</p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="glass-card px-4 py-2 flex items-center gap-3">
            <BarChart3 className="text-indigo-400 w-5 h-5" />
            <div>
              <p className="text-[10px] uppercase text-gray-500 font-bold">Total Score</p>
              <p className="text-lg font-bold text-white leading-tight">{score}</p>
            </div>
          </div>
          <div className="glass-card px-4 py-2 flex items-center gap-3">
            <TrendingUp className="text-purple-400 w-5 h-5" />
            <div>
              <p className="text-[10px] uppercase text-gray-500 font-bold">Difficulty</p>
              <p className="text-lg font-bold text-white leading-tight">{difficulty}/10</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 glass-card overflow-hidden flex flex-col mb-4">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6"
        >
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex gap-4 max-w-[85%]",
                  msg.role === "user" ? "ml-auto flex-row-reverse" : ""
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                  msg.role === "ai" ? "bg-indigo-500/20 text-indigo-400" : "bg-purple-500/20 text-purple-400"
                )}>
                  {msg.role === "ai" ? <Bot size={20} /> : <User size={20} />}
                </div>
                <div className="space-y-2">
                  <div className={cn(
                    "p-4 rounded-2xl text-sm leading-relaxed",
                    msg.role === "ai" ? "chat-bubble-ai text-gray-200" : "chat-bubble-user text-white"
                  )}>
                    {msg.text}
                  </div>
                  {msg.feedback && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-[12px] bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded-xl italic"
                    >
                      💡 Feedback: {msg.feedback}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {loading && (
            <div className="flex gap-4 items-center text-gray-500 text-sm italic">
              <RefreshCcw className="animate-spin w-4 h-4" />
              AI is thinking...
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white/5 border-t border-white/10">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type your answer here..."
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-4 pr-12 focus:outline-none focus:border-indigo-500/50 transition-colors text-white text-sm"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="absolute right-2 top-2 p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
