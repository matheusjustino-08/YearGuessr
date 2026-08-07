import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';
import {ThemeEngine} from '@/components/ThemeEngine';
import {Navbar} from '@/components/Navbar';
import {Footer} from '@/components/Footer';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "YearGuessr - Adivinhe o Ano da História",
  description: "O jogo definitivo de adivinhação de anos históricos e imagens clássicas.",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: '/favicon.ico?v=100', sizes: 'any' },
      { url: '/favicon-32x32.png?v=100', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-16x16.png?v=100', type: 'image/png', sizes: '16x16' },
      { url: '/android-chrome-192x192.png?v=100', type: 'image/png', sizes: '192x192' },
      { url: '/android-chrome-512x512.png?v=100', type: 'image/png', sizes: '512x512' },
    ],
    apple: '/apple-touch-icon.png?v=100',
  },
};

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }
 
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" href="/favicon.ico?v=100" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=100" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png?v=100" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=100" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className="min-h-screen flex flex-col justify-between">
        <NextIntlClientProvider 
          messages={messages}
          onError={(error) => {
            if (error.code === 'MISSING_MESSAGE') return;
            console.error(error);
          }}
          getMessageFallback={({ key, namespace }) => {
            return `${namespace ? `${namespace}.` : ''}${key}`;
          }}
        >
          <ThemeEngine>
            <Navbar />
            {children}
            <Footer />
          </ThemeEngine>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
