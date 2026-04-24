import React from "react";
import { Stethoscope, UserCircle } from "lucide-react";

export function Header() {
  return (
    <header className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <div className="bg-white/60 backdrop-blur-xl border border-white/40 shadow-glass rounded-full px-6 h-14 flex items-center justify-between w-full max-w-4xl pointer-events-auto">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-empathetic-teal to-empathetic-mint flex items-center justify-center text-white font-bold text-lg shadow-sm">
            <Stethoscope className="w-5 h-5" />
          </div>
          <span className="text-xl font-semibold text-slate-800 tracking-tight">Menti.Co</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center bg-white/50 rounded-full px-4 py-1.5 shadow-sm border border-white/60 text-sm font-medium text-slate-600 hover:bg-white/80 transition-colors cursor-pointer">
            Workspace
          </div>
          <div className="w-10 h-10 rounded-full bg-empathetic-lavender/20 border border-empathetic-lavender/30 flex items-center justify-center text-empathetic-lavender hover:bg-empathetic-lavender/30 hover:shadow-md transition-all cursor-pointer">
            <UserCircle className="w-6 h-6" />
          </div>
        </div>
      </div>
    </header>
  );
}
