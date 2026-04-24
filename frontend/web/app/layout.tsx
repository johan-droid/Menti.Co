import "./styles.css";
import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Menti.Co - Mental Health Education Portal",
  description: "Explore a trusted, calm, and evidence-based environment for mental health education."
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
