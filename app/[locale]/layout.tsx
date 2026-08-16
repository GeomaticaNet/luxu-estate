import { NavbarWrapper } from "@/components/ui/NavbarWrapper";
import { Navbar } from "@/components/ui/Navbar";
import { FooterWrapper } from "@/components/ui/FooterWrapper";
import { WhatsAppWrapper } from "@/components/ui/WhatsAppWrapper";
import { LocaleDebug } from "@/components/ui/LocaleDebug";
import GlobalPresence from "@/components/ui/GlobalPresence";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { FavoritesProvider } from "@/hooks/FavoritesContext";
import Script from "next/script";
import type { Metadata } from "next";
import "../globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://inmo-estate.vercel.app";

const localeMap: Record<string, string> = {
  es: "es_AR",
  en: "en_US",
  pt: "pt_BR",
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const ogLocale = localeMap[locale] ?? "es_AR";

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: "Luxe Estate - Premium Real Estate",
      template: "%s | Luxe Estate",
    },
    description: "Find your sanctuary.",
    openGraph: {
      title: "Luxe Estate - Premium Real Estate",
      description: "Find your sanctuary.",
      url: siteUrl,
      siteName: "Luxe Estate",
      locale: ogLocale,
      type: "website",
      images: [`${siteUrl}/og-image.png`],
    },
    twitter: {
      card: "summary_large_image",
      title: "Luxe Estate - Premium Real Estate",
      description: "Find your sanctuary.",
      images: [`${siteUrl}/og-image.png`],
    },
    alternates: {
      canonical: `${siteUrl}/${locale}`,
      languages: {
        "es-AR": `${siteUrl}/es`,
        "en-US": `${siteUrl}/en`,
        "pt-BR": `${siteUrl}/pt`,
      },
    },
    verification: {
      google: "PeYwD2FRSWf61vTA93CmlRW2JVe7CpvZVF_Hd5neFeE",
    },
  };
}

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
    <html lang={locale} suppressHydrationWarning className="h-full antialiased">
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-background text-foreground font-display selection:bg-mosque selection:text-white">
        <Script
          id="luxe-theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('luxe_theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark');}catch(e){}`,
          }}
        />
        <NextIntlClientProvider messages={messages}>
          <GlobalPresence />
          <LocaleDebug />
          <FavoritesProvider>
            <NavbarWrapper>
              <Navbar />
            </NavbarWrapper>
            {children}
            <FooterWrapper />
            <WhatsAppWrapper />
          </FavoritesProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
