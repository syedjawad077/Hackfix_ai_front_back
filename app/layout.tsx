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
      </head>
      <body className="bg-white text-[#0B1F3A] antialiased selection:bg-[#E3ECFA] selection:text-[#0F2A5C]">
        {children}
      </body>
    </html>
  );
}

