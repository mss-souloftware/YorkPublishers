// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";

import Providers from "./providers/SessionProvider";
import ToastProvider from "./providers/ToastProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Modern Dashboard",
  description: "Sleek Next.js Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>

        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
            <ToastProvider />
        </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}