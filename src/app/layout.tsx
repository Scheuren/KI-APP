import type { Metadata } from "next";
import { Bangers, Comic_Neue } from "next/font/google";
import "./globals.css";

// Overlay: shown on mobile portrait via CSS (no JS needed)
function RotateHint() {
  return (
    <div
      className="fixed inset-0 z-[200] bg-slate-950 flex-col items-center justify-center text-center p-8 hidden"
      style={{ display: 'none' }}
      id="rotate-hint"
    >
      <div className="text-6xl mb-4" style={{ animation: 'spin 2s linear infinite' }}>📱</div>
      <p className="font-[family-name:var(--font-bangers)] text-[#FFE135] text-2xl tracking-widest">GERÄT DREHEN</p>
      <p className="font-[family-name:var(--font-comic)] text-slate-400 text-sm mt-2">Bitte drehe dein Gerät ins Querformat</p>
    </div>
  )
}

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
      <body className="antialiased font-comic">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-[100] bg-[#FFE135] px-4 py-2 rounded-xl border-2 border-[#111] font-[family-name:var(--font-bangers)] tracking-widest text-[#111]"
        >
          Zum Hauptinhalt springen
        </a>
        <RotateHint />
        <main id="main-content">{children}</main>
      </body>
    </html>
  );
}
