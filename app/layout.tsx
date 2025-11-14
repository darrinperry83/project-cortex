import React from "react";
import "./../styles/globals.css";
import { Providers } from "./providers";
import { Topbar } from "@/components/Topbar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Project Cortex",
  description: "Modern, offline-capable project/task/knowledge OS",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Topbar />
          <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
