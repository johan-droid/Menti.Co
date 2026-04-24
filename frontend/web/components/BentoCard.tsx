"use client";

import { motion } from "framer-motion";
import React from "react";

interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function BentoCard({ children, className = "", delay = 0 }: BentoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.7, 
        delay, 
        ease: [0.22, 1, 0.36, 1] // Custom smooth easing
      }}
      whileHover={{ y: -6, scale: 1.01 }}
      className={`bg-white/70 backdrop-blur-lg rounded-[2rem] p-6 shadow-soft border border-white/60 overflow-hidden flex flex-col hover:shadow-floating transition-all duration-300 ${className}`}
    >
      {children}
    </motion.div>
  );
}
