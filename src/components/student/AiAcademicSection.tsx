import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { 
  Sparkles, 
  Send, 
  Copy, 
  Check, 
  Download, 
  RefreshCw, 
  Image as ImageIcon, 
  X, 
  Globe, 
  Mic, 
  Volume2, 
  VolumeX, 
  ThumbsUp, 
  ThumbsDown, 
  Plus, 
  MessageSquare, 
  PanelLeftClose, 
  PanelLeftOpen, 
  Code2,
  Trash2,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { DepartmentCode, AiChatMessage } from '../../types';
import { sendGeminiChatApi } from '../../services/api';
import { saveMessageToSupabase } from '../../services/supabase';
import { uploadToSupabaseStorage, deleteFileFromStorage } from '../../services/storageService';

// Markdown parser for Gemini response formatting
function renderGeminiMarkdown(
  text: string, 
  onCopyCode: (code: string) => void,
  copiedCode: string | null
) {
  if (!text) return null;

  const parts = text.split(/(```[\s\S]*?```)/g);

  return parts.map((part, index) => {
    if (part.startsWith('```') && part.endsWith('```')) {
      const firstLineBreak = part.indexOf('\n');
      const language = firstLineBreak !== -1 ? part.slice(3, firstLineBreak).trim() : '';
      const code = firstLineBreak !== -1 ? part.slice(firstLineBreak + 1, -3) : part.slice(3, -3);
      const isCopied = copiedCode === code;

      return (
        <div key={index} className="my-3 rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-950 font-mono text-xs shadow-md">
          <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-slate-400 text-[11px]">
            <span className="font-semibold text-slate-300 uppercase tracking-wider">{language || 'code'}</span>
            <button
              onClick={() => onCopyCode(code)}
              className="flex items-center gap-1 hover:text-white transition px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{isCopied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre className="p-4 overflow-x-auto text-emerald-400 leading-relaxed text-[12px]">
            <code>{code}</code>
          </pre>
        </div>
      );
    }

    const lines = part.split('\n');
    return (
      <div key={index} className="space-y-2">
        {lines.map((line, lIdx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={lIdx} className="h-1.5" />;

          if (trimmed.startsWith('### ')) {
            return (
              <h3 key={lIdx} className="text-base font-bold text-slate-900 dark:text-slate-100 mt-3 mb-1">
                {trimmed.replace('### ', '')}
              </h3>
            );
          }
          if (trimmed.startsWith('## ')) {
            return (
              <h2 key={lIdx} className="text-lg font-bold text-slate-900 dark:text-white mt-3 mb-1.5">
                {trimmed.replace('## ', '')}
              </h2>
            );
          }
          if (trimmed.startsWith('# ')) {
            return (
              <h1 key={lIdx} className="text-xl font-black text-slate-900 dark:text-white mt-4 mb-2">
                {trimmed.replace('# ', '')}
              </h1>
            );
          }

          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            const content = trimmed.slice(2);
            return (
              <div key={lIdx} className="flex items-start gap-2 text-sm text-slate-800 dark:text-slate-200 ml-2">
                <span className="text-blue-500 mt-1">•</span>
                <span className="leading-relaxed">{parseInlineStyles(content)}</span>
              </div>
            );
          }

          const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
          if (numMatch) {
            return (
              <div key={lIdx} className="flex items-start gap-2 text-sm text-slate-800 dark:text-slate-200 ml-2">
                <span className="font-semibold text-blue-500 min-w-4 text-xs mt-0.5">{numMatch[1]}.</span>
                <span className="leading-relaxed">{parseInlineStyles(numMatch[2])}</span>
              </div>
            );
          }

          return (
            <p key={lIdx} className="text-sm leading-relaxed text-slate-800 dark:text-slate-200">
              {parseInlineStyles(trimmed)}
            </p>
          );
        })}
      </div>
    );
  });
}

function parseInlineStyles(text: string) {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((seg, i) => {
    if (seg.startsWith('**') && seg.endsWith('**')) {
      return <strong key={i} className="font-semibold text-slate-900 dark:text-white">{seg.slice(2, -2)}</strong>;
    }
    if (seg.startsWith('`') && seg.endsWith('`')) {
      return <code key={i} className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-mono text-xs">{seg.slice(1, -1)}</code>;
    }
    return seg;
  });
}

export const AiAcademicSection: React.FC = () => {
  const { user } = useAuth();
  const userName = user?.name?.split(' ')[0] || 'there';

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [question, setQuestion] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedCodeSnippet, setCopiedCodeSnippet] = useState<string | null>(null);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [enableSearchGrounding, setEnableSearchGrounding] = useState(true);

  // Chat sessions
  const [chatSessions, setChatSessions] = useState<Array<{ id: string; title: string }>>([
    { id: 'session-1', title: 'New Chat' }
  ]);
  const [activeSessionId, setActiveSessionId] = useState('session-1');

  const [chatMessages, setChatMessages] = useState<AiChatMessage[]>([
    {
      id: 'msg-init',
      sender: 'assistant',
      content: `Hi ${userName}, I'm **SHOV AI**. What would you like to explore, solve, or build today?`,
      timestamp: 'Just now'
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Prompt suggestion chips like Gemini Web
  const promptSuggestions = [
    {
      title: 'Explain a complex concept',
      subtitle: 'Quantum computing or attention mechanisms',
      prompt: 'Explain how attention mechanisms in modern AI models work in simple terms with an example.'
    },
    {
      title: 'Write or debug code',
      subtitle: 'Python, TypeScript, Rust, or C++',
      prompt: 'Write a clean, optimized TypeScript debounce and throttle function with full type safety.'
    },
    {
      title: 'Brainstorm project ideas',
      subtitle: 'Data science & full-stack architectures',
      prompt: 'Suggest 3 innovative, high-impact final year project ideas in Computer Science & AI.'
    },
    {
      title: 'Quick problem solving',
      subtitle: 'Math, algorithms, or systems design',
      prompt: 'How do you design a real-time collaborative document editing system like Google Docs?'
    }
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAiLoading]);

  // Voice speech-to-text initialization
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuestion(prev => (prev ? `${prev} ${transcript}` : transcript));
        setIsListeningVoice(false);
      };

      recognition.onerror = () => setIsListeningVoice(false);
      recognition.onend = () => setIsListeningVoice(false);
      recognitionRef.current = recognition;
    }
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use Chrome/Edge.');
      return;
    }
    if (isListeningVoice) {
      recognitionRef.current.stop();
      setIsListeningVoice(false);
    } else {
      setIsListeningVoice(true);
      recognitionRef.current.start();
    }
  };

  const handleSpeakText = (msgId: string, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (speakingMessageId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text
      .replace(/###/g, '')
      .replace(/##/g, '')
      .replace(/#/g, '')
      .replace(/\*\*/g, '')
      .replace(/```[\s\S]*?```/g, 'Code block.')
      .slice(0, 800);

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);
    setSpeakingMessageId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const handleStartNewChat = () => {
    const newId = `session-${Date.now()}`;
    setChatSessions(prev => [{ id: newId, title: 'New Chat' }, ...prev]);
    setActiveSessionId(newId);
    setChatMessages([
      {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        content: `Hi ${userName}, I'm **SHOV AI**. What would you like to explore today?`,
        timestamp: 'Just now'
      }
    ]);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const q = textToSend || question;
    if (!q.trim() && !codeSnippet.trim() && !imageBase64) return;

    const userMsg: AiChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content: q,
      codeSnippet: codeSnippet || undefined,
      imageUrl: imageBase64 || undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setQuestion('');
    setCodeSnippet('');
    setShowCodeInput(false);
    setImageBase64(null);
    setIsAiLoading(true);

    // Update current session title if it's the first query
    setChatSessions(prev => prev.map(s => {
      if (s.id === activeSessionId && (s.title === 'New Chat' || s.title === '')) {
        return { ...s, title: q.slice(0, 28) + (q.length > 28 ? '...' : '') };
      }
      return s;
    }));

    // Async save to Supabase
    saveMessageToSupabase({
      sender: 'user',
      content: q,
      department: 'CSE'
    });

    try {
      const res = await sendGeminiChatApi({
        message: q,
        codeSnippet: userMsg.codeSnippet,
        imageBase64: userMsg.imageUrl,
        enableSearchGrounding,
        history: chatMessages.slice(-6).map(m => ({ sender: m.sender, content: m.content }))
      });

      if (res.success && res.answer) {
        const assistantMsg: AiChatMessage = {
          id: `msg-ai-${Date.now()}`,
          sender: 'assistant',
          content: res.answer,
          groundingChunks: res.groundingChunks,
          timestamp: res.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChatMessages(prev => [...prev, assistantMsg]);

        saveMessageToSupabase({
          sender: 'assistant',
          content: res.answer,
          department: 'CSE'
        });
      } else {
        setChatMessages(prev => [
          ...prev,
          {
            id: `msg-ai-${Date.now()}`,
            sender: 'assistant',
            content: res.error || 'I encountered an issue processing your request. Please try again.',
            timestamp: 'Now'
          }
        ]);
      }
    } catch {
      setChatMessages(prev => [
        ...prev,
        {
          id: `msg-ai-${Date.now()}`,
          sender: 'assistant',
          content: 'SHOV AI is ready. Please ask your question.',
          timestamp: 'Now'
        }
      ]);
    }

    setIsAiLoading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Upload to private app-files bucket under ${auth.uid()}/academic/${activeSessionId}/${uuid}.${ext}
      const uploadRes = await uploadToSupabaseStorage(file, {
        featureName: 'academic',
        itemId: activeSessionId || 'general',
        fileName: file.name,
        expiresInSeconds: 60 * 60 * 24 * 7
      });

      if (uploadRes.signedUrl) {
        setImageBase64(uploadRes.signedUrl);
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImageBase64(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleRemoveAttachedImage = async () => {
    if (imageBase64) {
      await deleteFileFromStorage(imageBase64);
      setImageBase64(null);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeSnippet(code);
    setTimeout(() => setCopiedCodeSnippet(null), 2000);
  };

  const handleFeedback = (msgId: string, type: 'like' | 'dislike') => {
    setChatMessages(prev => prev.map(m => {
      if (m.id === msgId) {
        return {
          ...m,
          liked: type === 'like' ? !m.liked : false,
          disliked: type === 'dislike' ? !m.disliked : false
        };
      }
      return m;
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-[calc(100vh-140px)] min-h-[680px] bg-slate-950 text-slate-100 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
      
      {/* ============================================================ */}
      {/* GEMINI SIDEBAR                                              */}
      {/* ============================================================ */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="h-full bg-slate-900/90 border-r border-slate-800/80 flex flex-col shrink-0 overflow-hidden z-10"
          >
            {/* Sidebar Top: New Chat Pill */}
            <div className="p-3.5 space-y-3">
              <button
                onClick={handleStartNewChat}
                className="w-full py-2.5 px-3.5 rounded-full bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white text-xs font-semibold flex items-center justify-between transition border border-slate-700/60 shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4 text-slate-300" />
                  <span>New chat</span>
                </div>
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              </button>
            </div>

            {/* Recent History */}
            <div className="flex-1 overflow-y-auto px-3 space-y-1">
              <div className="px-2 py-1 text-[11px] font-semibold text-slate-400">
                Recent
              </div>
              {chatSessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => setActiveSessionId(session.id)}
                  className={`w-full text-left p-2 rounded-xl text-xs flex items-center gap-2 transition truncate ${
                    activeSessionId === session.id
                      ? 'bg-slate-800 text-white font-medium'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                  <span className="truncate">{session.title}</span>
                </button>
              ))}
            </div>

            {/* Bottom Profile Pill */}
            <div className="p-3.5 border-t border-slate-800/80 bg-slate-900">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                  {userName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{user?.name || 'Scholar'}</p>
                  <p className="text-[10px] text-slate-400">SHOV Scholar</p>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* MAIN GEMINI CHAT VIEW                                       */}
      {/* ============================================================ */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950 relative">
        
        {/* GEMINI TOP BAR */}
        <div className="h-14 px-4 sm:px-6 bg-slate-950 border-b border-slate-800/60 flex items-center justify-between gap-4 z-10 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Toggle menu"
            >
              {sidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
            </button>

            {/* SHOV AI Name & Sparkle */}
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-slate-100 flex items-center gap-1.5">
                SHOV AI
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Gemini 3.7 Flash
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Google Search Grounding Indicator Toggle */}
            <button
              onClick={() => setEnableSearchGrounding(!enableSearchGrounding)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition flex items-center gap-1.5 border ${
                enableSearchGrounding
                  ? 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
              title="Toggle Live Web Grounding"
            >
              <Globe className="w-3 h-3 text-blue-400" />
              <span className="hidden sm:inline">Search Grounding</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </button>
          </div>
        </div>

        {/* CHAT STREAM SCROLL AREA */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6">
          <div className="max-w-3xl mx-auto space-y-6">
            
            {/* GEMINI HOME GREETING (When new chat) */}
            {chatMessages.length <= 1 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="my-8 sm:my-12 space-y-8"
              >
                <div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                    <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                      Hello, {userName}
                    </span>
                  </h1>
                  <p className="text-slate-400 text-sm mt-1">
                    How can I help you today?
                  </p>
                </div>

                {/* Gemini Simple Suggestion Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {promptSuggestions.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(item.prompt)}
                      className="p-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-left transition-all group flex flex-col justify-between"
                    >
                      <span className="text-xs font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">
                        {item.title}
                      </span>
                      <span className="text-[11px] text-slate-400 mt-1">
                        {item.subtitle}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* MESSAGES LIST */}
            {chatMessages.map((msg) => {
              const isUser = msg.sender === 'user';
              const isSpeaking = speakingMessageId === msg.id;

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {/* SHOV AI Sparkle Avatar */}
                  {!isUser && (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div className={`max-w-[88%] space-y-1.5 ${isUser ? 'items-end' : 'items-start'}`}>
                    
                    {/* Message Bubble / Container */}
                    <div
                      className={`p-3.5 rounded-2xl text-sm leading-relaxed ${
                        isUser
                          ? 'bg-slate-800 text-white rounded-tr-none'
                          : 'bg-transparent text-slate-200'
                      }`}
                    >
                      {/* Attached Image Preview */}
                      {msg.imageUrl && (
                        <div className="mb-2.5 rounded-xl overflow-hidden border border-slate-700 max-w-sm">
                          <img src={msg.imageUrl} alt="Attached" className="max-h-56 object-cover w-full" />
                        </div>
                      )}

                      {/* Attached Code */}
                      {msg.codeSnippet && (
                        <pre className="p-3 mb-2.5 rounded-xl bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto border border-slate-800">
                          <code>{msg.codeSnippet}</code>
                        </pre>
                      )}

                      {/* Content */}
                      {isUser ? (
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      ) : (
                        <div>
                          {renderGeminiMarkdown(msg.content, handleCopyCode, copiedCodeSnippet)}
                        </div>
                      )}

                      {/* Verified Search Citations */}
                      {msg.groundingChunks && msg.groundingChunks.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-slate-800 flex flex-wrap gap-1.5">
                          {msg.groundingChunks.map((chunk, cIdx) => (
                            <a
                              key={cIdx}
                              href={chunk.uri}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-750 text-slate-300 text-[11px] transition"
                            >
                              <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                              <span className="truncate max-w-[180px]">{chunk.title || 'Source'}</span>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Gemini Action Footer for Assistant */}
                    {!isUser && (
                      <div className="flex items-center gap-3 px-1 text-slate-400 text-xs">
                        <button
                          onClick={() => handleCopyText(msg.id, msg.content)}
                          className="hover:text-white flex items-center gap-1 transition"
                          title="Copy text"
                        >
                          {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={() => handleSpeakText(msg.id, msg.content)}
                          className={`hover:text-white transition ${isSpeaking ? 'text-blue-400' : ''}`}
                          title="Listen"
                        >
                          {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={() => handleFeedback(msg.id, 'like')}
                          className={`hover:text-white transition ${msg.liked ? 'text-blue-400' : ''}`}
                          title="Good response"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleFeedback(msg.id, 'dislike')}
                          className={`hover:text-white transition ${msg.disliked ? 'text-red-400' : ''}`}
                          title="Bad response"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* User Initial Avatar */}
                  {isUser && (
                    <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      {userName[0]}
                    </div>
                  )}
                </motion.div>
              );
            })}

            {/* Thinking indicator */}
            {isAiLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3 text-slate-400 text-xs"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center animate-pulse">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="flex items-center gap-2 bg-slate-900 px-3.5 py-2 rounded-full border border-slate-800">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
                  <span>SHOV AI is thinking...</span>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* ============================================================ */}
        {/* GEMINI BOTTOM CAPSULE INPUT BAR                             */}
        {/* ============================================================ */}
        <div className="p-4 sm:px-8 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent">
          <div className="max-w-3xl mx-auto space-y-2">
            
            {/* Attached Image / Code Snippet Drawers */}
            {imageBase64 && (
              <div className="p-2 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <img src={imageBase64} alt="Attached" className="w-8 h-8 rounded-lg object-cover border border-slate-700" />
                  <span>Image attached (Supabase Storage)</span>
                </div>
                <button onClick={handleRemoveAttachedImage} className="text-slate-400 hover:text-rose-400 p-1" title="Delete from storage">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {showCodeInput && (
              <div className="p-2 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                  <span>Paste code snippet:</span>
                  <button onClick={() => setShowCodeInput(false)} className="hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <textarea
                  value={codeSnippet}
                  onChange={(e) => setCodeSnippet(e.target.value)}
                  placeholder="function example() { ... }"
                  className="w-full h-24 p-2 bg-slate-950 border border-slate-800 rounded-lg text-emerald-400 font-mono text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            )}

            {/* Main Gemini Capsule Input Container */}
            <div className="relative rounded-3xl bg-slate-900 border border-slate-800 focus-within:border-slate-650 transition shadow-lg px-4 py-2.5">
              <textarea
                ref={textareaRef}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask SHOV AI anything..."
                rows={1}
                className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-400 resize-none focus:outline-none max-h-32 pr-28"
                style={{ height: 'auto', minHeight: '26px' }}
              />

              {/* Action Buttons Inside Capsule */}
              <div className="absolute right-3 bottom-2.5 flex items-center gap-1.5">
                {/* Code Snippet Toggle */}
                <button
                  type="button"
                  onClick={() => setShowCodeInput(!showCodeInput)}
                  className={`p-1.5 rounded-full transition ${
                    showCodeInput ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                  title="Attach code snippet"
                >
                  <Code2 className="w-4 h-4" />
                </button>

                {/* Image Upload */}
                <label className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition" title="Attach image">
                  <ImageIcon className="w-4 h-4" />
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>

                {/* Voice Input Microphone */}
                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  className={`p-1.5 rounded-full transition ${
                    isListeningVoice ? 'text-red-400 bg-red-500/10 animate-pulse' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                  title="Voice input"
                >
                  <Mic className="w-4 h-4" />
                </button>

                {/* Send Button */}
                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={!question.trim() && !codeSnippet.trim() && !imageBase64}
                  className={`p-1.5 rounded-full transition ${
                    question.trim() || codeSnippet.trim() || imageBase64
                      ? 'bg-white text-slate-900 hover:bg-slate-200'
                      : 'text-slate-600 bg-slate-800/60 cursor-not-allowed'
                  }`}
                  title="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Disclaimer */}
            <p className="text-[11px] text-center text-slate-500">
              SHOV AI may display inaccurate info, so double-check its responses.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
