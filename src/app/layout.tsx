import type { Metadata } from "next";
import { Geist, Geist_Mono, DM_Sans, Source_Sans_3 } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Display font for card headers - modern, bold
const dmSans = DM_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

// Reading font for card body - clean, highly legible sans-serif
const sourceSans = Source_Sans_3({
  variable: "--font-reading",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Flow Prompter",
  description: "A prompt engineering playground for iterating on prompts with multi-model testing and AI-assisted refinement",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${dmSans.variable} ${sourceSans.variable} antialiased bg-neutral-50`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
