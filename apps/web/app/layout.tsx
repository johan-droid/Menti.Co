import "./styles.css";
import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Menti.Co",
  description: "Real-time medical directory platform"
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
