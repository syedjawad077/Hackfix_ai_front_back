import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HackFix AI — Autonomous Security Testing Assistant",
  description:
    "AI-powered security testing assistant that finds, proves, fixes and verifies vulnerabilities in AI-built apps.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[var(--paper)] text-[var(--ink)] antialiased selection:bg-[#EAE4D9] selection:text-[#1B1B1B]">
        {children}
      </body>

    </html>
  );
}

