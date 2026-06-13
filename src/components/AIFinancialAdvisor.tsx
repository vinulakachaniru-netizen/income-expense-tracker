import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, AlertCircle } from "lucide-react";
import type { Transaction } from "@/types/transaction";
import type { CategoryBudgets } from "@/hooks/useCategoryBudgets";
import type { SavingsGoal } from "@/hooks/useSavingsGoal";

interface Props {
  transactions: Transaction[];
  budgets: CategoryBudgets;
  goal: SavingsGoal | null;
}

interface Message {
  role: "user" | "ai";
  content: string;
}

const QUICK_PROMPTS = [
  "Can I afford to buy a PS5 for Rs. 150,000?",
  "Where am I overspending this month?",
  "How can I reach my savings goal faster?",
  "Summarize my spending habits.",
];

export function AIFinancialAdvisor({ transactions, budgets, goal }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      content: "Hi! I'm Lanka AI, your personal financial advisor. I have analyzed your spending, budgets, and goals. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          context: { transactions, budgets, goal },
        }),
      });

      if (!res.ok) throw new Error("Failed to get response");

      const data = await res.json();
      setMessages((prev) => [...prev, { role: "ai", content: data.text }]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: "Sorry, I'm having trouble connecting to the network right now. Please try again later.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[70vh] rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/50 shadow-sm dark:shadow-xl dark:backdrop-blur-md overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-900/50 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Lanka AI Advisor</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Powered by Google Gemini</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                msg.role === "user"
                  ? "bg-teal text-white"
                  : "bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400"
              }`}
            >
              {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                msg.role === "user"
                  ? "bg-teal text-white rounded-tr-none"
                  : "bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-white/5"
              }`}
            >
              {/* Very basic markdown rendering for bold text and line breaks */}
              {msg.content.split('\n').map((line, i) => (
                <p key={i} className={i !== 0 ? 'mt-2' : ''}>
                  {line.split(/(\*\*.*?\*\*)/g).map((part, j) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                      return <strong key={j} className="font-bold">{part.slice(2, -2)}</strong>;
                    }
                    return part;
                  })}
                </p>
              ))}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400">
              <Bot className="h-4 w-4" />
            </div>
            <div className="flex max-w-[80%] items-center rounded-2xl rounded-tl-none bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 px-4 py-3">
              <div className="flex gap-1">
                <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      {messages.length === 1 && (
        <div className="px-4 pb-2">
          <p className="text-xs text-slate-500 mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                className="rounded-full border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/50 px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-white/5"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-slate-100 dark:border-white/5 bg-white dark:bg-slate-900/50 p-4">
        {!process.env.NEXT_PUBLIC_GEMINI_API_KEY && (
           <div className="mb-3 flex items-center gap-2 rounded-lg bg-amber-50 dark:bg-amber-500/10 p-3 text-xs text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
             <AlertCircle className="h-4 w-4 shrink-0" />
             <p>AI requires a valid GEMINI_API_KEY configured in your environment.</p>
           </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="flex items-end gap-2"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage(input);
              }
            }}
            placeholder="Ask anything about your finances..."
            className="max-h-32 min-h-[44px] w-full resize-none rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/50 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/20"
            rows={1}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal text-white transition hover:bg-teal/90 disabled:opacity-50 disabled:hover:bg-teal"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
