import type { Metadata } from "next";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";
import { CartProvider } from "@/components/cart/CartContext";
import { FlyToCartProvider } from "@/components/cart/FlyToCartContext";
import CartDrawer from "@/components/cart/CartDrawer";
import CookieConsent from "@/components/cookies/CookieConsent";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Sushi GO | Authentic Japanese Excellence",
  description:
    "Experience the finest Japanese cuisine in Namangan, Uzbekistan. Hand-crafted rolls, fresh sashimi, and authentic ramen.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark">
      <body className="bg-background text-text-primary font-body antialiased overflow-x-hidden min-h-screen flex flex-col">
        <NextTopLoader color="#E11D2A" height={2} shadow="0 0 10px #E11D2A,0 0 5px #E11D2A" showSpinner={false} />
        <CartProvider>
          <FlyToCartProvider>
            {children}
            <CartDrawer />
          </FlyToCartProvider>
        </CartProvider>
        <CookieConsent />
      </body>
    </html>
  );
}
