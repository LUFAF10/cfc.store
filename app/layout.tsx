import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import AnnouncementBar from "@/components/AnnouncementBar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Club Fútbol Collection — Camisetas Retro Originales",
  description: "Encontrá las mejores camisetas retro del fútbol mundial. Piezas únicas, stock limitado. Pagá con Mercado Pago o transferencia. Envíos a todo el país.",
  openGraph: {
    title: "Club Fútbol Collection — Camisetas Retro Originales",
    description: "Encontrá las mejores camisetas retro del fútbol mundial. Piezas únicas, stock limitado.",
    url: "https://cfc-store-rgp2.vercel.app",
    siteName: "Club Fútbol Collection",
    images: [
      {
        url: "https://cfc-store-rgp2.vercel.app/images/og-image.png",
        width: 1080,
        height: 1080,
        alt: "Club Fútbol Collection",
      },
    ],
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Club Fútbol Collection — Camisetas Retro Originales",
    description: "Encontrá las mejores camisetas retro del fútbol mundial. Piezas únicas, stock limitado.",
    images: ["https://cfc-store-rgp2.vercel.app/images/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${oswald.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-stadium-black text-cream-bone">
        <CartProvider>
          <AnnouncementBar />
          {children}
          <CartDrawer />
          <FloatingWhatsApp />
        </CartProvider>
      </body>
    </html>
  );
}
