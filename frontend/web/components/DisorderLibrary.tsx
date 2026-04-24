"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Disorder {
  id: string;
  name: string;
  description: string;
  ai_summary?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export default function DisorderLibrary() {
  const [disorders, setDisorders] = useState<Disorder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchDisorders() {
      try {
        const res = await fetch(`${API_URL}/v1/public/disorders`);
        const data = await res.json();
        if (data.ok) {
          setDisorders(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch disorders:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDisorders();
  }, []);

  const filtered = disorders.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-[#e0e3e6] pb-6">
        <div>
          <h2 className="text-3xl font-serif font-semibold text-[#09435e]">Disorder Library</h2>
          <p className="text-[#41484d] mt-2">Official ICD-11 definitions with AI-simplified summaries.</p>
        </div>
        <div className="relative w-full md:w-64">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#71787e] text-[20px]">search</span>
          <input 
            type="text" 
            placeholder="Search disorders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#c1c7cd] text-sm focus:ring-2 focus:ring-[#09435e] outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 bg-white rounded-3xl animate-pulse border border-[#e0e3e6]" />
          ))
        ) : filtered.length > 0 ? (
          filtered.map((disorder) => (
            <motion.div 
              layout
              key={disorder.id}
              className="bg-white rounded-3xl p-6 border border-[#e0e3e6] hover:shadow-lg transition-shadow group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-4xl">menu_book</span>
              </div>
              <div className="space-y-4">
                <div className="inline-block px-2 py-0.5 bg-[#e5e8ec] text-[#09435e] text-[10px] font-bold rounded uppercase tracking-wider">
                  {disorder.id}
                </div>
                <h3 className="text-xl font-semibold text-[#181c1f] leading-tight group-hover:text-[#09435e] transition-colors">
                  {disorder.name}
                </h3>
                <div className="space-y-2">
                  <p className="text-sm text-[#41484d] line-clamp-3 leading-relaxed">
                    {disorder.description}
                  </p>
                  {disorder.ai_summary && (
                    <div className="bg-[#f0f7f6] p-3 rounded-2xl border border-[#d1e9e5]">
                      <div className="flex items-center gap-1.5 text-[#2e6861] text-[11px] font-bold uppercase mb-1">
                        <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                        AI Summary
                      </div>
                      <p className="text-xs text-[#2e6861] italic leading-relaxed">
                        "{disorder.ai_summary}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center text-[#71787e]">
            No disorders found matching your search.
          </div>
        )}
      </div>
    </section>
  );
}
