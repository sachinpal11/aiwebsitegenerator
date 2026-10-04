/**
 * Colour palettes offered on the onboarding cards. Templates read these as CSS
 * variables (--c-bg, --c-surface, ...) so a palette never changes a layout.
 * Names lean on familiar Indian references so the cards make sense at a glance.
 */
export type Palette = {
  id: string;
  name: string;
  nameHi: string;
  bg: string; // page background
  surface: string; // cards / alternate sections
  ink: string; // main text
  muted: string; // secondary text
  accent: string; // buttons, highlights
  accentInk: string; // text on accent
};

export const palettes: Palette[] = [
  {
    id: "marigold",
    name: "Marigold",
    nameHi: "गेंदा",
    bg: "#fffaf2",
    surface: "#fbeed6",
    ink: "#2b1d0e",
    muted: "#6b5843",
    accent: "#d9480f",
    accentInk: "#ffffff",
  },
  {
    id: "peacock",
    name: "Peacock",
    nameHi: "मोर",
    bg: "#f6faf9",
    surface: "#e1efec",
    ink: "#0f2a2e",
    muted: "#4d6668",
    accent: "#0b7285",
    accentInk: "#ffffff",
  },
  {
    id: "indigo",
    name: "Indigo Ink",
    nameHi: "नील",
    bg: "#f7f7fb",
    surface: "#e7e8f3",
    ink: "#161a33",
    muted: "#55597a",
    accent: "#3b3fa8",
    accentInk: "#ffffff",
  },
  {
    id: "terracotta",
    name: "Terracotta",
    nameHi: "मिट्टी",
    bg: "#fbf6f1",
    surface: "#f1e2d5",
    ink: "#2e1a12",
    muted: "#735648",
    accent: "#b4532a",
    accentInk: "#ffffff",
  },
  {
    id: "rose",
    name: "Rose",
    nameHi: "गुलाब",
    bg: "#fff8f8",
    surface: "#fbe4e6",
    ink: "#331419",
    muted: "#7a5258",
    accent: "#c2255c",
    accentInk: "#ffffff",
  },
  {
    id: "neem",
    name: "Neem",
    nameHi: "नीम",
    bg: "#f8faf5",
    surface: "#e5edd9",
    ink: "#1c2612",
    muted: "#55624a",
    accent: "#4d7c0f",
    accentInk: "#ffffff",
  },
];

export function getPalette(id: string): Palette {
  return palettes.find((p) => p.id === id) ?? palettes[0];
}

export function paletteVars(p: Palette): React.CSSProperties {
  return {
    "--c-bg": p.bg,
    "--c-surface": p.surface,
    "--c-ink": p.ink,
    "--c-muted": p.muted,
    "--c-accent": p.accent,
    "--c-accent-ink": p.accentInk,
  } as React.CSSProperties;
}
