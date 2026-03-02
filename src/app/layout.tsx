import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Serenity - Votre Espace de Réconfort",
  description: "Un assistant bienveillant pour vous aider à traverser les temps incertains. Écoute, réconfort et conseils apaisants.",
  keywords: ["soutien", "réconfort", "anxiété", "stress", "bien-être", "aide", "écoute", "calme"],
  authors: [{ name: "Serenity" }],
  icons: {
    icon: "/favicon.png",
  },
  openGraph: {
    title: "Serenity - Votre Espace de Réconfort",
    description: "Un assistant bienveillant pour vous aider à traverser les temps incertains.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Serenity - Votre Espace de Réconfort",
    description: "Un assistant bienveillant pour vous aider à traverser les temps incertains.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
