import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#0A2540",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "S.A.S.P.I. | Sistema de Acompanhamento de Saúde",
  description:
    "Plataforma digital integrada para organização de rotinas, histórico clínico e cuidado compartilhado da saúde de pessoas idosas.",
  keywords: [
    "saúde",
    "idosos",
    "acompanhamento",
    "prontuário",
    "telemetria",
    "cuidado",
  ],
  authors: [{ name: "Equipe S.A.S.P.I." }],
  openGraph: {
    title: "S.A.S.P.I. | Cuidado Inteligente",
    description: "Tecnologia a favor da saúde e do acompanhamento contínuo.",
    url: "https://saspi.vercel.app",
    siteName: "S.A.S.P.I.",
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
    >
      <body className="flex min-h-full flex-col bg-white text-gray-900 selection:bg-[#1565C0] selection:text-white">
        {children}
      </body>
    </html>
  );
}