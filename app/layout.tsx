import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { FirebaseProvider } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CareerPilot — Your AI Career Co-pilot",
  description: "AI-powered career assistant that knows you through your CV",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <FirebaseProvider>{children}</FirebaseProvider>
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
