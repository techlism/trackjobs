import type { Metadata } from "next";
import "./globals.css";
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { ThemeProvider } from "next-themes";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "TrackJobs",
  description: "Track your job applications effortlessly within seconds.",
  creator: "Techlism",
  keywords: ['jobs', 'application tracker'],
  openGraph: {
    images: 'https://trackjobs.online/trackjobs_og.png',
    siteName: 'TrackJobs'
  },
  twitter: {
    images: 'https://trackjobs.online/trackjobs_og.png',
    site: '@trackjobs'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={`${GeistSans.className} flex flex-col min-h-dvh w-full mx-auto `}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <Navbar className="flex-shrink-0" />
          <main className="flex-grow flex flex-col max-w-7xl mx-auto my-auto items-center justify-center">
            {children}
          </main>
          <Footer className="flex-shrink-0" />
        </ThemeProvider>
      </body>
    </html>
  );
}