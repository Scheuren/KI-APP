import type { Metadata } from "next";
import { Bangers, Comic_Neue } from "next/font/google";
import "./globals.css";

const bangers = Bangers({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bangers",
});

const comicNeue = Comic_Neue({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-comic",
});

export const metadata: Metadata = {
  title: "Team MKS — KI & Entscheidungsbäume",
  description: "Informatik Klasse 9 · Maximilian Kolbe Schule",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className={`${bangers.variable} ${comicNeue.variable}`}>
      <body className="antialiased font-comic">{children}</body>
    </html>
  );
}
