import type { Metadata } from "next";
import { Instrument_Serif, DM_Sans } from "next/font/google";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  weight: ["400"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "YieldIt — AI Marketing for HVAC Businesses",
  description:
    "YieldIt is an AI-powered marketing agency built exclusively for HVAC contractors. Stop losing jobs to competitors who show up first online.",
  openGraph: {
    title: "YieldIt — AI Marketing for HVAC Businesses",
    description:
      "Stop losing jobs to competitors. YieldIt runs your Google Ads, SEO, and follow-up automatically — so your phone rings more.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${instrumentSerif.variable} ${dmSans.variable}`}>
      <body className="bg-white text-[#111827] antialiased font-sans">{children}</body>
    </html>
  );
}
