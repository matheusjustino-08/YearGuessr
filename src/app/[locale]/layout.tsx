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
  icons: {
    icon: [
      { url: '/favicon.ico?v=2', sizes: 'any' },
      { url: '/logo-icon.svg?v=2', type: 'image/svg+xml' },
      { url: '/logo-icon.png?v=2', type: 'image/png' },
    ],
    apple: '/logo-icon.png?v=2',
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
      <body className="min-h-screen flex flex-col justify-between">
        <NextIntlClientProvider messages={messages}>
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
