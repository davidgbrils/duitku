import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const fontSans = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Duitku — Kelola Keuanganmu, Lebih Sederhana",
  description:
    "Duitku — aplikasi pencatatan keuangan pribadi. Catat pemasukan, pengeluaran, transfer, dan scan struk dalam satu tempat.",
  icons: {
    icon: [
      { url: "/images/brand/favicon_32.png", sizes: "32x32", type: "image/png" },
      { url: "/images/brand/favicon_192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/images/brand/app_icon_light.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${fontSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
