import { NavbarWrapper } from "@/components/ui/NavbarWrapper";
import { Navbar } from "@/components/ui/Navbar";
import { FooterWrapper } from "@/components/ui/FooterWrapper";
import { LocaleDebug } from "@/components/ui/LocaleDebug";
import GlobalPresence from "@/components/ui/GlobalPresence";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { FavoritesProvider } from "@/hooks/FavoritesContext";
import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Luxe Estate - Premium Real Estate",
  description: "Find your sanctuary.",
};

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale} className="h-full antialiased">
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-background-light text-nordic-dark font-display selection:bg-mosque selection:text-white">
        <NextIntlClientProvider messages={messages}>
          <GlobalPresence />
          <LocaleDebug />
          <FavoritesProvider>
            <NavbarWrapper>
              <Navbar />
            </NavbarWrapper>
            {children}
            <FooterWrapper />
          </FavoritesProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
