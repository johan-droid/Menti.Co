"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export default function HomePage() {
  const [status, setStatus] = useState("connecting");
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000");

    socket.on("connected", () => setStatus("connected"));
    socket.on("content.updated", () => {
      setUpdatedAt(new Date().toISOString());
    });

    return () => socket.disconnect();
  }, []);

  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-3xl font-semibold">Menti.Co</h1>
      <p className="mt-2 text-slate-600">
        Production-ready starter for real-time, clinician-reviewed medical content.
      </p>

      <motion.div
        layout
        className="mt-6 rounded-lg border border-slate-200 p-4"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="font-medium">Socket status: {status}</p>
        <p className="text-sm text-slate-500">
          Last live content update: {updatedAt ?? "none yet"}
        </p>
      </motion.div>
    </main>
  );
}
