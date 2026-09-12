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
  Copy,
  Check,
  CornerDownLeft,
  Loader2,
  Users,
  HeartHandshake,
  Compass,
  Clock,
  Shirt,
  HelpCircle,
  PhoneCall,
  Calendar,
  AlertTriangle,
  Flame,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { aiApi, ChatMessage } from "@/api/aiApi";
import { toast } from "react-toastify";

interface SuggestionGroups {
  parents: string[];
  newcomers: string[];
  leaders: string[];
  general: string[];
}

const DEFAULT_SUGGESTIONS: SuggestionGroups = {
  parents: [
    "Bé 8 tuổi học ngành nào, ai phụ trách?",
    "Giờ sinh hoạt Chúa Nhật và quy định đồng phục",
    "Học phí và cách thức đăng ký tham gia",
    "Xin phép nghỉ học cho con thì nhắn cho ai?",
    "Số điện thoại Trưởng phụ trách các ngành",
  ],
  newcomers: [
    "Gia Đình Hưng Đạo Trung Nam là gì?",
    "Bốn tôn chỉ của Thiếu Nhi Thánh Thể là gì?",
    "Ý nghĩa màu khăn các ngành Đồng, Thiếu, Thanh",
    "Có hoạt động cắm trại, dã ngoại không?",
    "Ngày Lễ Bổn mạng Gia Đình Hưng Đạo",
  ],
  leaders: [
    "Tóm tắt tình hình Gia Đình Hưng Đạo Quý này",
    "Những đoàn sinh vắng nhiều cần thăm hỏi",
    "Ai có sinh nhật trong 30 ngày tới?",
    "So sánh tỷ lệ chuyên cần giữa các Ngành",
    "Danh bạ số điện thoại liên lạc khẩn cấp phụ huynh",
  ],
  general: [
    "Bé 8 tuổi học ngành nào, ai phụ trách?",
    "Giờ sinh hoạt Chúa Nhật và quy định đồng phục",
    "Những đoàn sinh vắng nhiều cần thăm hỏi",
    "Học phí và cách thức đăng ký tham gia",
    "Số điện thoại Trưởng phụ trách các ngành",
  ],
};

const QUICK_ACTION_PILLS = [
  { icon: Clock, label: "Giờ sinh hoạt", query: "Chúa Nhật sinh hoạt mấy giờ?" },
  { icon: Shirt, label: "Đồng phục", query: "Quy định đồng phục sinh hoạt và khăn quàng" },
  { icon: HelpCircle, label: "Học phí & Đăng ký", query: "Học phí và cách thức đăng ký tham gia" },
  { icon: PhoneCall, label: "SĐT Trưởng", query: "Số điện thoại liên hệ đại diện Ban Trưởng" },
  { icon: HeartHandshake, label: "Xin nghỉ học", query: "Cách thức xin phép nghỉ học cho con" },
  { icon: Calendar, label: "Sinh nhật quý này", query: "Ai có sinh nhật trong quý này?" },
  { icon: AlertTriangle, label: "Vắng nhiều", query: "Những đoàn sinh vắng nhiều cần thăm hỏi" },
  { icon: Flame, label: "Cắm trại", query: "Hoạt động cắm trại dã ngoại Hưng Đạo" },
];

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
      <div key={`table-${key}`} className="my-2.5 overflow-x-auto rounded-xl border border-slate-200 shadow-2xs bg-white">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
            <tr>
              {headerRow.map((h, i) => (
                <th key={i} className="px-3 py-2 whitespace-nowrap">
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
      .replace(/`([^`]+)`/g, "<code class='px-1.5 py-0.5 rounded bg-slate-100 text-blue-700 font-mono text-[11px] font-semibold'>$1</code>")
      .replace(/\*([^*]+)\*/g, "<em class='italic text-slate-600'>$1</em>");
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

    // Heading 4 (####)
    if (line.startsWith("#### ")) {
      elements.push(
        <h5 key={i} className="text-xs font-bold text-slate-700 mt-2 mb-1 flex items-center gap-1">
          <span dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(line.replace("#### ", "")) }} />
        </h5>
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

    // Numbered step (1., 2., 3.)
    if (/^\d+\.\s+/.test(line.trim())) {
      const content = line.trim().replace(/^\d+\.\s+/, "");
      const num = line.trim().match(/^(\d+)\./)?.[1] || "1";
      elements.push(
        <div key={i} className="text-xs sm:text-sm text-slate-700 ml-2 my-1 flex items-start gap-2">
          <span className="font-bold text-blue-600 shrink-0">{num}.</span>
          <span dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(content) }} />
        </div>
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
  const [suggestionGroups, setSuggestionGroups] = useState<SuggestionGroups>(DEFAULT_SUGGESTIONS);
  const [activeCategory, setActiveCategory] = useState<"parents" | "newcomers" | "leaders">("parents");
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
        const data = res.data?.data || res.data;
        if (data && typeof data === "object" && !Array.isArray(data)) {
          setSuggestionGroups({
            parents: data.parents || DEFAULT_SUGGESTIONS.parents,
            newcomers: data.newcomers || DEFAULT_SUGGESTIONS.newcomers,
            leaders: data.leaders || DEFAULT_SUGGESTIONS.leaders,
            general: data.general || DEFAULT_SUGGESTIONS.general,
          });
        } else if (Array.isArray(data) && data.length > 0) {
          setSuggestionGroups((prev) => ({
            ...prev,
            general: data,
          }));
        }
      } catch (err) {
        setSuggestionGroups(DEFAULT_SUGGESTIONS);
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

  // Auto focus input when opened on desktop
  useEffect(() => {
    if (isOpen && window.innerWidth >= 768) {
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
        text: data.reply || "Dạ, em chưa nhận diện được câu hỏi này. Trưởng hoặc Quý phụ huynh có thể chọn các câu hỏi gợi ý bên trên nhé!",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        modelUsed: data.modelUsed,
        toolCalled: data.toolCalled,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error("AI Chat Error:", err);
      toast.error("Không thể kết nối tới Trợ lý. Đang chuyển sang chế độ hướng dẫn offline.");
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: "Dạ, kết nối mạng đang gián đoạn. Quý vị có thể liên hệ trực tiếp Trưởng phụ trách qua số điện thoại hoặc đến trực tiếp phòng sinh hoạt lúc 14h15 Chúa Nhật nhé!",
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
    toast.info("Đã làm mới cuộc trò chuyện");
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Đã sao chép nội dung");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const activeSuggestions = suggestionGroups[activeCategory] || suggestionGroups.general || [];

  return (
    <>
      {/* ───────────────────────────────────────────────────────────── */}
      {/* FLOATING TRIGGER BUTTON                                        */}
      {/* ───────────────────────────────────────────────────────────── */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 group flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 border border-blue-400/30"
          title="Mở Trợ lý Đồng hành Trung Nam"
        >
          <div className="relative">
            <Sparkles className="h-5 w-5 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <div className="flex flex-col text-left hidden sm:flex">
            <span className="font-bold text-xs tracking-wide">Trợ Lý Trung Nam</span>
            <span className="text-[10px] text-blue-100 font-normal">Hỏi đáp & Tra cứu 24/7</span>
          </div>
        </button>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* CHAT DRAWER / POPUP PANEL                                      */}
      {/* ───────────────────────────────────────────────────────────── */}
      {isOpen && (
        <div className="fixed inset-x-2 bottom-2 sm:inset-auto sm:bottom-6 sm:right-6 z-50 w-auto sm:w-[480px] h-[600px] sm:h-[640px] max-h-[92vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="p-3.5 px-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white flex items-center justify-between border-b border-indigo-900/50 select-none">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-400/30 shadow-inner">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-white">Trợ Lý Đồng Hành</h3>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 text-[10px] px-1.5 py-0 font-medium">
                    Trực tuyến
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-300">
                  Hỗ trợ Phụ huynh & Ban Trưởng 24/7
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  title="Xóa làm mới đoạn chat"
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
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 bg-slate-50/60">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col justify-start items-center text-center p-2 space-y-3.5">
                {/* Greeting Avatar & Welcome */}
                <div className="space-y-2 pt-2">
                  <div className="inline-flex h-12 w-12 rounded-2xl bg-blue-100 text-blue-600 items-center justify-center shadow-xs">
                    <Sparkles className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="space-y-1 max-w-xs mx-auto">
                    <h4 className="font-bold text-slate-800 text-sm sm:text-base">
                      Xin chào, {user?.name ? `${user.name} Trưởng` : "Trưởng & Quý Phụ Huynh"}!
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Em có thể giải đáp ngay mọi thông tin về giờ sinh hoạt, đồng phục, cách đăng ký, học phí, điểm số hoặc hỗ trợ Ban Trưởng.
                    </p>
                  </div>
                </div>

                {/* Categorized Suggestion Tabs */}
                <div className="w-full space-y-2 pt-1">
                  <div className="flex p-1 bg-slate-200/70 rounded-xl gap-1">
                    <button
                      onClick={() => setActiveCategory("parents")}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
                        activeCategory === "parents"
                          ? "bg-white text-blue-700 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <HeartHandshake className="h-3.5 w-3.5" />
                      <span>Phụ Huynh</span>
                    </button>
                    <button
                      onClick={() => setActiveCategory("newcomers")}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
                        activeCategory === "newcomers"
                          ? "bg-white text-blue-700 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <Compass className="h-3.5 w-3.5" />
                      <span>Người Mới</span>
                    </button>
                    <button
                      onClick={() => setActiveCategory("leaders")}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
                        activeCategory === "leaders"
                          ? "bg-white text-blue-700 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <Users className="h-3.5 w-3.5" />
                      <span>Ban Trưởng</span>
                    </button>
                  </div>

                  {/* List of Suggestions for active category */}
                  <div className="grid grid-cols-1 gap-1.5 text-left pt-1">
                    {activeSuggestions.map((sug, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(sug)}
                        className="p-2.5 px-3 rounded-xl bg-white border border-slate-200/80 hover:border-blue-400 hover:bg-blue-50/50 text-xs font-medium text-slate-700 hover:text-blue-700 transition-all text-left shadow-2xs flex items-center justify-between group"
                      >
                        <span className="line-clamp-2">{sug}</span>
                        <CornerDownLeft className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-600 shrink-0 ml-2" />
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
                      className={`max-w-[92%] p-3.5 rounded-2xl text-xs sm:text-sm ${
                        isUser
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-xs shadow-xs"
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
                            title="Sao chép câu trả lời"
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
                  <span>Trợ lý đang tìm kiếm thông tin...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Area */}
          <div className="p-3 bg-white border-t border-slate-200 space-y-2">
            {/* Quick Action Pills (always 1-click away) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-left">
              {QUICK_ACTION_PILLS.map((pill, idx) => {
                const IconComponent = pill.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(pill.query)}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200/80 shrink-0 transition-all flex items-center gap-1 font-medium hover:border-blue-300"
                  >
                    <IconComponent className="h-3 w-3 text-blue-500" />
                    <span>{pill.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Hỏi tự nhiên, ví dụ: 'con 8 tuổi học lớp nào?', 'giờ sinh hoạt', 'xin nghỉ'..."
                rows={1}
                className="flex-1 text-base sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none max-h-24"
              />
              <Button
                size="sm"
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || loading}
                className="h-10 w-10 p-0 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shrink-0 shadow-xs disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-[10px] text-slate-400 text-center">
              💡 <em>Không cần từ ngữ kỹ thuật, quý vị cứ hỏi tự nhiên như nhắn tin trò chuyện!</em>
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export default AiChatDrawer;
