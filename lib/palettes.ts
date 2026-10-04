/**
 * Colour palettes for generated sites. Templates read these as CSS variables
 * (--c-bg, --c-surface, ...) so a palette never changes a layout.
 * Owners pick a preset, or any brand colour, which becomes a "custom-rrggbb" palette.
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
  { id: "marigold", name: "Marigold", nameHi: "गेंदा", bg: "#fffaf2", surface: "#fbeed6", ink: "#2b1d0e", muted: "#6b5843", accent: "#d9480f", accentInk: "#ffffff" },
  { id: "peacock", name: "Peacock", nameHi: "मोर", bg: "#f6faf9", surface: "#e1efec", ink: "#0f2a2e", muted: "#4d6668", accent: "#0b7285", accentInk: "#ffffff" },
  { id: "indigo", name: "Indigo Ink", nameHi: "नील", bg: "#f7f7fb", surface: "#e7e8f3", ink: "#161a33", muted: "#55597a", accent: "#3b3fa8", accentInk: "#ffffff" },
  { id: "terracotta", name: "Terracotta", nameHi: "मिट्टी", bg: "#fbf6f1", surface: "#f1e2d5", ink: "#2e1a12", muted: "#735648", accent: "#b4532a", accentInk: "#ffffff" },
  { id: "rose", name: "Rose", nameHi: "गुलाब", bg: "#fff8f8", surface: "#fbe4e6", ink: "#331419", muted: "#7a5258", accent: "#c2255c", accentInk: "#ffffff" },
  { id: "neem", name: "Neem", nameHi: "नीम", bg: "#f8faf5", surface: "#e5edd9", ink: "#1c2612", muted: "#55624a", accent: "#4d7c0f", accentInk: "#ffffff" },
  { id: "mono", name: "Black & White", nameHi: "श्वेत-श्याम", bg: "#ffffff", surface: "#f1f1f1", ink: "#111111", muted: "#555555", accent: "#111111", accentInk: "#ffffff" },
];

// ── Custom brand colours ────────────────────────────────────────────────────

const CUSTOM = /^custom-([0-9a-f]{6})$/;

/** "#8B1A1A" -> "custom-8b1a1a" (null if it isn't a 6-digit hex colour). */
export function customPaletteId(hex: string): string | null {
  const m = hex.trim().match(/^#?([0-9a-f]{6})$/i);
  return m ? `custom-${m[1].toLowerCase()}` : null;
}

export function isPaletteId(id: string): boolean {
  return CUSTOM.test(id) || palettes.some((p) => p.id === id);
}

const toRgb = (hex: string) => [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
const toHex = (rgb: number[]) => `#${rgb.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;
/** Blend two colours: t = 0 gives a, t = 1 gives b. */
const mix = (a: number[], b: number[], t: number) => a.map((v, i) => v + (b[i] - v) * t);
const luminance = (rgb: number[]) => {
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const WHITE = [255, 255, 255];
const BLACK = [0, 0, 0];

/** Builds a full, readable palette around one brand colour. */
function customPalette(hex6: string): Palette {
  const base = toRgb(hex6);
  // The accent is also used for text links on a light page, so darken colours that are too light to read.
  let accent = base;
  while (luminance(accent) > 0.3) accent = mix(accent, BLACK, 0.12);
  return {
    id: `custom-${hex6}`,
    name: "Your colour",
    nameHi: "आपका रंग",
    bg: toHex(mix(base, WHITE, 0.95)),
    surface: toHex(mix(base, WHITE, 0.85)),
    ink: toHex(mix(base, BLACK, 0.85)),
    muted: toHex(mix(mix(base, BLACK, 0.55), [128, 128, 128], 0.45)),
    accent: toHex(accent),
    accentInk: luminance(accent) > 0.45 ? "#111111" : "#ffffff",
  };
}

export function getPalette(id: string): Palette {
  const custom = id.match(CUSTOM);
  if (custom) return customPalette(custom[1]);
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

// ── Colour requests in the edit chat ───────────────────────────────────────

/** Words owners use for each palette. */
const COLOUR_WORDS: [RegExp, string][] = [
  [/\b(black|white|mono(chrome)?|gr[ae]y|minimal)\b/, "mono"],
  [/\b(marigold|orange|yellow|saffron|gold(en)?)\b/, "marigold"],
  [/\b(peacock|teal|turquoise|aqua|cyan)\b/, "peacock"],
  [/\b(indigo|blue|navy|purple|violet)\b/, "indigo"],
  [/\b(terracotta|brown|earthy?|clay|maroon)\b/, "terracotta"],
  [/\b(rose|pink|red|magenta)\b/, "rose"],
  [/\b(neem|green|olive)\b/, "neem"],
];

/**
 * "change the colour to black and white" -> "mono", "use #8b1a1a" -> "custom-8b1a1a".
 * Null when the request isn't about colours.
 */
export function paletteFromRequest(text: string): string | null {
  const t = text.toLowerCase();
  const hex = t.match(/#([0-9a-f]{6})\b/);
  if (hex) return `custom-${hex[1]}`;
  const named = palettes.find((p) => t.includes(p.name.toLowerCase()));
  if (named) return named.id;
  return COLOUR_WORDS.find(([re]) => re.test(t))?.[1] ?? null;
}
