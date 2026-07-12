import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "../context/CartContext";
import { AuthProvider } from "../context/AuthContext";
import CartDrawer from "../components/CartDrawer";
import AuthModal from "../components/AuthModal";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bella House",
  description: "Made to be worn. Or judged. Or both.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
 return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <CartProvider>
            {children}
            <CartDrawer />
            <AuthModal /> {/* <-- RENDERED HERE */}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}