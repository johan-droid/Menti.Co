"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Sparkles, AlertCircle, HeartPulse, Search } from "lucide-react";
import PaperCard from "./PaperCard";

export default function AiAgent() {
  const [query, setQuery] = useState("");
  const [viewType, setViewType] = useState<"patient" | "clinician">("patient");
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setData(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/ai/ask?q=${encodeURIComponent(query)}&view_type=${viewType}`);

      if (!response.ok) throw new Error("Failed to fetch");

      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error(error);
      setData({ message: "I'm sorry, I'm having trouble connecting to the research library.", results: [] });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="max-w-5xl mx-auto w-full my-12 px-4">
      <div className="text-center mb-10 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-widest">
          <Sparkles className="w-3 h-3" />
          Powered by LLM Summarization
        </div>
        <h2 className="text-3xl md:text-4xl font-serif font-semibold text-[#09435e]">Research Assistant</h2>
        <p className="text-[#41484d] max-w-xl mx-auto">
          Describe your feelings or a topic, and we'll find and summarize the most relevant peer-reviewed studies.
        </p>

        {/* View Type Toggle */}
        <div className="flex bg-gray-100 p-1 rounded-2xl w-fit mx-auto border border-gray-200 mt-6">
          <button
            onClick={() => setViewType("patient")}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${
              viewType === "patient" ? "bg-white text-emerald-600 shadow-sm" : "text-gray-500 hover:text-emerald-600"
            }`}
          >
            Patient View
          </button>
          <button
            onClick={() => setViewType("clinician")}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${
              viewType === "clinician" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-blue-600"
            }`}
          >
            Clinician View
          </button>
        </div>
      </div>

      <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto mb-12">
        <textarea
          rows={3}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={viewType === "patient" ? "e.g. 'I feel tired all the time and have no motivation'" : "e.g. 'Efficacy of mindfulness for treatment-resistant depression'"}
          className={`w-full bg-white border border-[#c1c7cd] rounded-2xl p-6 text-[#181c1f] focus:outline-none transition-all shadow-sm text-lg ${
            viewType === "patient" ? "focus:border-emerald-500 focus:ring-emerald-500/10" : "focus:border-blue-500 focus:ring-blue-500/10"
          }`}
        />
        <button
          type="submit"
          disabled={isLoading || query.trim().length < 3}
          className={`absolute right-4 bottom-4 p-3 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg ${
            viewType === "patient" ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20" : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20"
          }`}
        >
          {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Search className="w-6 h-6" />}
        </button>
      </form>

      <AnimatePresence>
        {data && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Summary Box */}
            {!data.is_crisis && data.summary && (
              <div className={`p-8 rounded-3xl border shadow-sm ${
                viewType === "patient" ? "bg-emerald-50/30 border-emerald-100" : "bg-blue-50/30 border-blue-100"
              }`}>
                <div className="flex items-center gap-2 mb-4">
                  <div className={`p-2 rounded-lg ${viewType === "patient" ? "bg-emerald-600 text-white" : "bg-blue-600 text-white"}`}>
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className={`font-bold uppercase tracking-widest text-xs ${viewType === "patient" ? "text-emerald-700" : "text-blue-700"}`}>
                    AI-Generated Research Summary
                  </h3>
                </div>
                <div className={`prose max-w-none text-lg leading-relaxed ${viewType === "patient" ? "text-emerald-900" : "text-blue-900"}`}>
                   {data.summary}
                </div>
              </div>
            )}
            {/* Crisis Response */}
            {data.is_crisis && (
              <div className="bg-[#ffdad6] border border-[#ffb4ab] rounded-3xl p-8 flex flex-col md:flex-row gap-6 items-start">
                <div className="p-4 bg-white rounded-2xl text-[#93000a] shadow-sm">
                  <HeartPulse className="w-8 h-8" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-[#93000a]">You are not alone.</h3>
                  <p className="text-[#410002] leading-relaxed">
                    {data.message}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {data.crisis_resources?.map((res: string, i: number) => (
                      <div key={i} className="p-3 bg-white/50 rounded-xl text-sm font-medium text-[#93000a] border border-[#93000a]/10">
                        {res}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Normal Results */}
            {!data.is_crisis && data.results && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-[#71787e]">
                    Top Research Findings
                  </h3>
                  <span className="text-xs text-gray-400">Showing {data.results.length} most relevant papers</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.results.map((paper: any) => (
                    <PaperCard key={paper.pubmed_id} paper={paper} />
                  ))}
                </div>

                {data.results.length === 0 && (
                   <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                      <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No specific papers found for this query. Try using different keywords.</p>
                   </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
