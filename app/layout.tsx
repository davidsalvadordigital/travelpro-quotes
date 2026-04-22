import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700", "800", "900"]
});

const playfair = Playfair_Display({ 
  subsets: ["latin"], 
  variable: "--font-playfair",
  weight: ["400", "600", "700", "800"]
});

// next/font/google — método oficial recomendado para Turbopack en Next.js 16.2+
const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  title: {
    default: "TravelPro Quotes",
    template: "%s | TravelPro Quotes",
  },
  description:
    "Plataforma premium para agentes de viajes. Crea, gestiona y envía cotizaciones profesionales en segundos.",
  applicationName: "TravelPro Quotes",
  authors: [{ name: "TravelPro" }],
  keywords: ["cotizaciones de viaje", "agencia de viajes", "gestor de cotizaciones", "travel quotes"],
  robots: {
    index: false, // Private SaaS — no indexar en Google
    follow: false,
  },
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: "TravelPro Quotes",
    title: "TravelPro Quotes — Motor de Cotizaciones",
    description:
      "Crea cotizaciones de viaje profesionales en segundos. Dual-currency COP/USD, PDF instantáneo y gestión de prospectos.",
  },
  twitter: {
    card: "summary",
    title: "TravelPro Quotes",
    description: "Cotizaciones de viaje profesionales en segundos.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${playfair.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
