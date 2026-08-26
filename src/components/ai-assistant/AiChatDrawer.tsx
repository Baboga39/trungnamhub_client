// src/components/ai-assistant/AiChatDrawer.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import {
  Sparkles,
  Bot,
  Send,
  X,
  Trash2,
  ChevronDown,
  Copy,
  Check,
  TrendingUp,
  Award,
  AlertTriangle,
  Users,
  CornerDownLeft,
  Loader2,
  BarChart3,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { aiApi, ChatMessage } from "@/api/aiApi";
import { toast } from "react-toastify";

// ─────────────────────────────────────────────────────────────────────────────
// SIMPLE & CLEAN MARKDOWN RENDERER
// ─────────────────────────────────────────────────────────────────────────────
function FormattedMessage({ text }: { text: string }) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let tableRows: string[] = [];
  let inTable = false;

  const renderTable = (rows: string[], key: number) => {
    if (rows.length < 2) return null;
    const headerRow = rows[0]
      .split("|")
      .map((c) => c.trim())
      .filter(Boolean);
    const dataRows = rows.slice(2).map((r) =>
      r
        .split("|")
        .map((c) => c.trim())
        .filter((_, idx, arr) => idx > 0 && idx < arr.length)
    );

    return (
      <div key={`table-${key}`} className="my-2.5 overflow-x-auto rounded-xl border border-slate-200 shadow-xs bg-white">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
            <tr>
              {headerRow.map((h, i) => (
                <th key={i} className="px-3 py-2">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {dataRows.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-slate-50/70 transition-colors">
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="px-3 py-2 text-slate-700">
                    <span dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(cell) }} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const parseInlineMarkdown = (raw: string) => {
    return raw
      .replace(/\*\*(.*?)\*\*/g, "<strong class='font-bold text-slate-900'>$1</strong>")
      .replace(/`([^`]+)`/g, "<code class='px-1.5 py-0.5 rounded bg-slate-100 text-blue-700 font-mono text-[11px] font-semibold'>$1</code>");
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Table detection
    if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
      inTable = true;
      tableRows.push(line);
      continue;
    } else if (inTable) {
      elements.push(renderTable(tableRows, i));
      tableRows = [];
      inTable = false;
    }

    // Heading 3 (###)
    if (line.startsWith("### ")) {
      elements.push(
        <h4 key={i} className="text-sm font-bold text-slate-800 mt-2.5 mb-1 flex items-center gap-1.5">
          <span dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(line.replace("### ", "")) }} />
        </h4>
      );
      continue;
    }

    // Heading 2 (##)
    if (line.startsWith("## ")) {
      elements.push(
        <h3 key={i} className="text-base font-bold text-slate-800 mt-3 mb-1.5">
          <span dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(line.replace("## ", "")) }} />
        </h3>
      );
      continue;
    }

    // Bullet points (- or *)
    if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
      const content = line.trim().substring(2);
      elements.push(
        <li key={i} className="text-xs sm:text-sm text-slate-700 ml-4 list-disc my-0.5 leading-relaxed">
          <span dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(content) }} />
        </li>
      );
      continue;
    }

    // Horizontal divider (---)
    if (line.trim() === "---") {
      elements.push(<hr key={i} className="my-2.5 border-slate-200" />);
      continue;
    }

    // Normal paragraph
    if (line.trim()) {
      elements.push(
        <p key={i} className="text-xs sm:text-sm text-slate-700 my-1 leading-relaxed">
          <span dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(line) }} />
        </p>
      );
    }
  }

  if (inTable && tableRows.length > 0) {
    elements.push(renderTable(tableRows, lines.length));
  }

  return <div className="space-y-0.5">{elements}</div>;
}

export function AiChatDrawer() {
  const user = useSelector((state: any) => state.auth?.user);
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load chat history from LocalStorage & Suggestions on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("tnhub_ai_chat_history");
      if (saved) {
        setMessages(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load AI chat history:", e);
    }

    const fetchSuggestions = async () => {
      try {
        const res = await aiApi.getSuggestions();
        setSuggestions(res.data?.data || res.data || []);
      } catch (err) {
        // Fallback default suggestions
        setSuggestions([
          "Tóm tắt tình hình Quý này",
          "Top 5 đoàn sinh điểm cao nhất",
          "Những em nào đang vắng nhiều?",
          "So sánh tỷ lệ chuyên cần các ngành",
        ]);
      }
    };

    fetchSuggestions();
  }, []);

  // Save history to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("tnhub_ai_chat_history", JSON.stringify(messages.slice(-20)));
    }
  }, [messages]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading, isOpen]);

  // Auto focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const msg = textToSend || inputMessage;
    if (!msg.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: msg.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setLoading(true);

    try {
      const res = await aiApi.chat(msg.trim(), messages);
      const data = res.data?.data || res.data || {};

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: data.reply || "Xin lỗi, tôi không thể xử lý câu hỏi này lúc này.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        modelUsed: data.modelUsed,
        toolCalled: data.toolCalled,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error("AI Chat Error:", err);
      toast.error("Không thể kết nối tới Trợ lý AI. Vui lòng thử lại sau.");
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: "⚠️ Rất tiếc, đã có lỗi xảy ra khi kết nối tới máy chủ phân tích. Vui lòng kiểm tra lại kết nối mạng hoặc thử lại sau.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([]);
    localStorage.removeItem("tnhub_ai_chat_history");
    toast.info("Đã xóa lịch sử cuộc trò chuyện");
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* ───────────────────────────────────────────────────────────── */}
      {/* FLOATING TRIGGER BUTTON                                        */}
      {/* ───────────────────────────────────────────────────────────── */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 group flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 border border-blue-400/30"
          title="Mở Trợ lý AI Phân tích Dữ liệu"
        >
          <div className="relative">
            <Sparkles className="h-5 w-5 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <span className="font-semibold text-sm tracking-wide hidden sm:inline">
            Trợ Lý AI Phân Tích
          </span>
        </button>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* CHAT DRAWER / POPUP PANEL                                      */}
      {/* ───────────────────────────────────────────────────────────── */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[460px] h-[620px] max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="p-3.5 px-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white flex items-center justify-between border-b border-indigo-900/50 select-none">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-400/30">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-white">Trung Nam AI Analyst</h3>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 text-[10px] px-1.5 py-0">
                    Live
                  </Badge>
                </div>
              
              </div>
            </div>

            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  title="Xóa lịch sử chat"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Đóng cửa sổ"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center text-center p-4 space-y-4">
                <div className="h-14 w-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
                  <Sparkles className="h-7 w-7 text-blue-600" />
                </div>
                <div className="space-y-1 max-w-xs">
                  <h4 className="font-bold text-slate-800 text-sm">
                    Xin chào, {user?.name || "Huỳnh Trưởng"}!
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Tôi có thể giúp bạn tra cứu nhanh điểm số, thống kê chuyên cần, phát hiện đoàn sinh cần hỗ trợ hoặc so sánh hiệu suất các ngành.
                  </p>
                </div>

                {/* Quick Prompts Grid */}
                <div className="w-full space-y-1.5 pt-2">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-left">
                    Gợi ý câu hỏi nhanh:
                  </p>
                  <div className="grid grid-cols-1 gap-1.5 text-left">
                    {suggestions.map((sug, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(sug)}
                        className="p-2.5 px-3 rounded-xl bg-white border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/50 text-xs font-medium text-slate-700 hover:text-blue-700 transition-all text-left shadow-2xs flex items-center justify-between group"
                      >
                        <span>{sug}</span>
                        <CornerDownLeft className="h-3 w-3 text-slate-400 group-hover:text-blue-600 shrink-0 ml-2" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              messages.map((m) => {
                const isUser = m.sender === "user";
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isUser ? "items-end" : "items-start"} group`}
                  >
                    <div
                      className={`max-w-[90%] p-3 rounded-2xl text-xs sm:text-sm ${
                        isUser
                          ? "bg-blue-600 text-white rounded-br-xs shadow-xs"
                          : "bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs shadow-xs"
                      }`}
                    >
                      {isUser ? (
                        <p className="whitespace-pre-wrap">{m.text}</p>
                      ) : (
                        <FormattedMessage text={m.text} />
                      )}
                    </div>

                    {/* Metadata & Actions */}
                    <div className="flex items-center gap-2 mt-1 px-1 text-[10px] text-slate-400">
                      <span>{m.timestamp}</span>
                      {!isUser && (
                        <>
                          <button
                            onClick={() => handleCopy(m.id, m.text)}
                            className="hover:text-slate-600 transition-colors flex items-center gap-1"
                            title="Sao chép nội dung"
                          >
                            {copiedId === m.id ? (
                              <Check className="h-3 w-3 text-emerald-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                          {m.toolCalled && (
                            <span className="bg-slate-100 text-slate-500 px-1.5 py-0.2 rounded font-mono text-[9px]">
                              {m.toolCalled}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex items-start gap-2.5">
                <div className="h-7 w-7 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 animate-bounce" />
                </div>
                <div className="p-3 rounded-2xl bg-white border border-slate-200 text-xs text-slate-500 shadow-xs flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
                  <span>Đang phân tích số liệu...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Area */}
          <div className="p-3 bg-white border-t border-slate-200 space-y-2">
            {/* Quick chips when there are messages */}
            {messages.length > 0 && suggestions.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {suggestions.slice(0, 3).map((sug, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(sug)}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 border border-slate-200 shrink-0 transition-colors"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Hỏi về điểm số, chuyên cần, xếp hạng..."
                rows={1}
                className="flex-1 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none max-h-24"
              />
              <Button
                size="sm"
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || loading}
                className="h-10 w-10 p-0 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shrink-0 shadow-xs disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-[10px] text-slate-400 text-center">
              Nhấn <strong>Enter</strong> để gửi, <strong>Shift + Enter</strong> để xuống dòng
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export default AiChatDrawer;
