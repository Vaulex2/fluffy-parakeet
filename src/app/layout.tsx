import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/cart/CartContext";
import CartDrawer from "@/components/cart/CartDrawer";

export const metadata: Metadata = {
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
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
