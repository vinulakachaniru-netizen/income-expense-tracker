import { Home, PieChart, Plus, Sparkles, Settings } from "lucide-react";

interface BottomNavProps {
  currentView: string;
  onChangeView: (view: any) => void;
}

export function BottomNav({ currentView, onChangeView }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-safe">
      <div className="relative w-full max-w-md bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] px-6 py-3 flex items-center justify-between">
        
        {/* Home */}
        <button 
          onClick={() => onChangeView("home")}
          className={`flex flex-col items-center gap-1 p-2 transition-colors ${currentView === "home" ? "text-teal-600 dark:text-teal-400" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"}`}
        >
          <Home className="h-6 w-6" strokeWidth={currentView === "home" ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Home</span>
        </button>

        {/* Analytics */}
        <button 
          onClick={() => onChangeView("analytics")}
          className={`flex flex-col items-center gap-1 p-2 transition-colors ${currentView === "analytics" ? "text-teal-600 dark:text-teal-400" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"}`}
        >
          <PieChart className="h-6 w-6" strokeWidth={currentView === "analytics" ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Insights</span>
        </button>

        {/* Center FAB (Add) */}
        <div className="relative -top-6">
          <button 
            onClick={() => onChangeView("add")}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg shadow-teal-500/30 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="h-7 w-7" strokeWidth={2.5} />
          </button>
        </div>

        {/* AI Advisor */}
        <button 
          onClick={() => onChangeView("advisor")}
          className={`flex flex-col items-center gap-1 p-2 transition-colors ${currentView === "advisor" ? "text-violet-500" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"}`}
        >
          <Sparkles className="h-6 w-6" strokeWidth={currentView === "advisor" ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Lanka AI</span>
        </button>

        {/* Settings */}
        <button 
          onClick={() => onChangeView("settings")}
          className={`flex flex-col items-center gap-1 p-2 transition-colors ${currentView === "settings" ? "text-teal-600 dark:text-teal-400" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"}`}
        >
          <Settings className="h-6 w-6" strokeWidth={currentView === "settings" ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Settings</span>
        </button>

      </div>
    </div>
  );
}
