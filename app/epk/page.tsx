import type { Metadata } from "next"
import EpkSite from "@/components/epk/epk-site"
import { Bricolage_Grotesque } from "next/font/google"
import "./epk.css"

const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage", display: "swap" })

export const metadata: Metadata = {
  title: "Saransh · House Music · Electronic Press Kit",
  description:
    "Official EPK for Saransh, house music producer and DJ from St. Tropez, based in Brickell, Miami. Bio, music, discography, press photos and tech rider.",
  icons: { icon: "/epk/assets/favicon.svg" },
  openGraph: {
    title: "Saransh · Work Hard, Play Hard",
    description: "House music from the shoreline. Bio, music, discography, press photos and tech rider.",
    type: "website",
    images: ["/epk/assets/og.png"],
  },
  twitter: { card: "summary_large_image" },
}

export default function Page() {
  return <EpkSite className={bricolage.variable} />
}
