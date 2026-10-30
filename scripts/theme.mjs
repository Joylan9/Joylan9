// Shared design tokens + SVG helpers for every generated profile asset.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

export const C = {
  bg: "#06070D",
  panel: "#0C0E1A",
  panel2: "#111427",
  line: "rgba(255,255,255,0.08)",
  text: "#F4F4F8",
  muted: "#9095AD",
  dim: "#5A5F7A",
  rose: "#F75C7E",
  violet: "#8B5CF6",
  cyan: "#22D3EE",
  gold: "#FBBF24",
  green: "#34D399",
};

export const SANS =
  "'Segoe UI Variable Display','Segoe UI',-apple-system,BlinkMacSystemFont,'SF Pro Display',Inter,Roboto,'Helvetica Neue',Arial,sans-serif";
export const MONO =
  "'JetBrains Mono','Cascadia Code','SF Mono',SFMono-Regular,Consolas,'Liberation Mono',Menlo,monospace";

export const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Deterministic RNG so rebuilt assets don't churn in git.
export function rng(seed = 7) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

export const brandGradient = (id, extra = "") => `
  <linearGradient id="${id}" ${extra || 'x1="0" y1="0" x2="1" y2="0"'}>
    <stop offset="0" stop-color="${C.rose}"/>
    <stop offset="0.5" stop-color="${C.violet}"/>
    <stop offset="1" stop-color="${C.cyan}"/>
  </linearGradient>`;

// Rounded dark panel with hairline border + animated gradient glow edge.
export function frame(w, h, { r = 28, id = "f", glow = true } = {}) {
  return {
    defs: `
    <clipPath id="${id}Clip"><rect width="${w}" height="${h}" rx="${r}"/></clipPath>
    <linearGradient id="${id}Edge" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${w}" y2="${h}">
      <stop offset="0" stop-color="${C.rose}" stop-opacity="0.9"/>
      <stop offset="0.35" stop-color="${C.violet}" stop-opacity="0.15"/>
      <stop offset="0.65" stop-color="${C.cyan}" stop-opacity="0.15"/>
      <stop offset="1" stop-color="${C.cyan}" stop-opacity="0.9"/>
      ${glow ? `<animateTransform attributeName="gradientTransform" type="rotate" values="0 ${w / 2} ${h / 2};360 ${w / 2} ${h / 2}" dur="14s" repeatCount="indefinite"/>` : ""}
    </linearGradient>`,
    bg: `<rect width="${w}" height="${h}" rx="${r}" fill="${C.panel}"/>`,
    edge: `<rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="${r - 1}" fill="none" stroke="url(#${id}Edge)" stroke-width="2"/>`,
  };
}

export const svg = (w, h, body, title) =>
  `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(title)}" fill="none">
<title>${esc(title)}</title>
${body}
</svg>
`;

// Load a skill icon (256x256 tile) with ids namespaced so many can share one document.
export function icon(name, x, y, size, cls = "") {
  let raw = readFileSync(join(ROOT, "assets/icons", `${name}.svg`), "utf8");
  // skillicons wraps the real icon in an outer 48px svg — keep the inner one.
  const inner = raw.match(/<g transform="translate\(0, 0\)">([\s\S]*)<\/g>\s*<\/svg>\s*$/);
  raw = (inner ? inner[1] : raw).trim();
  raw = raw.replace(/\bid="([^"]+)"/g, `id="${name}-$1"`)
    .replace(/url\(#([^)]+)\)/g, `url(#${name}-$1)`)
    .replace(/href="#([^"]+)"/g, `href="#${name}-$1"`);
  raw = raw.replace(/^<svg[^>]*>/, `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="0 0 256 256" class="${cls}">`);
  return raw;
}

// Path data of a 24x24 Simple Icons glyph.
export function glyph(name) {
  const raw = readFileSync(join(ROOT, "assets/icons", `si-${name}.svg`), "utf8");
  return raw.match(/ d="([^"]+)"/)[1];
}
