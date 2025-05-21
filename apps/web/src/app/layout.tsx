import Header from "@/components/Header";
import { Providers } from "@/components/providers";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Coin Country",
  description: "All your chips are belong to us"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full flex flex-col relative">
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
