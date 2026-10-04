import { Geist, Mukta } from "next/font/google";

/** App fonts: Geist for UI text, Mukta as the fallback that covers Hindi. */
export const dashFont = Geist({ subsets: ["latin"], variable: "--font-dash" });
export const hindiFont = Mukta({ subsets: ["devanagari", "latin"], weight: ["400", "500"], variable: "--font-mukta" });
