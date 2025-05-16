import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Coin Country",
  description: "All your chips are belong to us"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>{children}</body>
    </html>
  );
}
