"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CRISIS_KEYWORDS = [
  "suicide",
  "kill myself",
  "end it all",
  "want to die",
  "hopeless",
  "can't go on",
  "no way out"
];

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export default function SafeSpaceJournal() {
  const [text, setText] = useState("");
  const [isCrisis, setIsCrisis] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    const lowerText = text.toLowerCase();
    const detected = CRISIS_KEYWORDS.some(keyword => lowerText.includes(keyword));
    setIsCrisis(detected);
  }, [text]);

  const handleSave = async () => {
    if (!text.trim()) return;
    
    setIsSaving(true);
    setSaveStatus("idle");

    try {
      const response = await fetch(`${API_URL}/v1/user/journal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: text,
          mood_score: 5, // Default mood for now
          userId: "db284b3e-647d-4c3e-8980-8774773822c0" // Placeholder for demo
        })
      });

      const data = await response.json();
      if (data.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        setSaveStatus("error");
      }
    } catch (error) {
      console.error("Save failed:", error);
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="w-full">
      <div className="bg-white rounded-3xl p-8 md:p-10 shadow-[0_8px_32px_rgba(42,91,119,0.06)] border border-[#e0e3e6] relative overflow-hidden transition-all duration-500">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <span className="material-symbols-outlined text-[10rem]">edit_note</span>
        </div>
        
        <div className="relative z-10 space-y-6">
          <div>
            <div className="inline-flex items-center space-x-2 text-[#09435e] bg-[#e5e8ec] px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
              <span className="material-symbols-outlined text-[16px]">lock</span>
              <span>Your Safe Space</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-semibold text-[#09435e]">
              Clear Your Mind
            </h2>
            <p className="text-lg text-[#41484d] mt-2 max-w-2xl">
              Write down your thoughts in this distraction-free journal. Everything stays on your device—it's your private space to process how you're feeling.
            </p>
          </div>

          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What's on your mind right now?"
              className="w-full h-48 md:h-64 p-6 rounded-2xl bg-[#f7fafd] border border-[#c1c7cd] text-[#181c1f] text-lg focus:ring-2 focus:ring-[#09435e] focus:border-[#09435e] resize-none transition-all duration-300 placeholder:text-[#71787e] shadow-inner"
            />
          </div>

          <AnimatePresence>
            {isCrisis && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-[#ffdad6] text-[#93000a] rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between shadow-md mt-2 border border-[#ffb4ab]">
                  <div className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-4xl mt-1" style={{ fontVariationSettings: `'FILL' 1` }}>emergency</span>
                    <div>
                      <h3 className="font-semibold text-xl mb-1">You are not alone.</h3>
                      <p className="text-base opacity-90 max-w-xl">
                        It sounds like you might be going through a really difficult time. There are people who want to support you right now, completely confidentially and for free.
                      </p>
                    </div>
                  </div>
                  <a
                    href="#"
                    className="mt-6 md:mt-0 flex-shrink-0 px-8 py-3 bg-[#93000a] text-[#ffdad6] rounded-xl font-bold hover:bg-[#7b0000] hover:shadow-lg transition-all duration-300 text-center whitespace-nowrap"
                  >
                    Get Help Now
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="flex items-center justify-between pt-2">
             <div className="flex-grow">
               <AnimatePresence>
                 {saveStatus === "success" && (
                   <motion.span 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-[#2e6861] font-semibold flex items-center gap-1"
                   >
                     <span className="material-symbols-outlined text-[18px]">check_circle</span>
                     Entry saved securely
                   </motion.span>
                 )}
               </AnimatePresence>
             </div>
             <button 
               onClick={handleSave}
               disabled={isSaving || !text.trim()}
               className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 shadow-md flex items-center gap-2 group ${
                 isSaving ? 'bg-[#71787e] cursor-not-allowed' : 'bg-[#09435e] hover:bg-[#336380] text-white'
               }`}
             >
               {isSaving ? 'Processing...' : 'Save Entry'} 
               <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
             </button>
          </div>
        </div>
      </div>
    </section>
  );
}
