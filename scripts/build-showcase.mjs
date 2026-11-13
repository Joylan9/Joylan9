// Auto-sliding "browser window" showcase cards built from screenshots in assets/shots/<slug>-1..4.jpg.
// Screenshots are embedded as data URIs because GitHub renders SVGs as <img>, which blocks external files.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { C, SANS, MONO, ROOT, esc, brandGradient, frame, svg } from "./theme.mjs";

const REDUCED = `@media (prefers-reduced-motion: reduce){*{animation:none!important}}`;
export const SHOWCASE = [
  { slug: "portfolio", title: "3D Portfolio", url: "portfolio-l3xs.vercel.app",
    tagline: "Immersive, scroll-driven WebGL portfolio", tags: ["Next.js", "Three.js", "R3F", "GSAP"] },
  { slug: "isha", title: "ISHA Pro", url: "ishaliving.co.in",
    tagline: "Smart-home app to control lights, fans & more", tags: ["PWA", "Smart Home", "IoT", "Real-time"] },
  { slug: "sovir", title: "SoVir Technologies", url: "sovirtechnologies.in",
    tagline: "Industrial automation company website", tags: ["Corporate site", "Lead capture", "SEO", "Responsive"] },
];

function card({ slug, title, url, tagline, tags }, i) {
  const shots = [1, 2, 3, 4].map((k) => join(ROOT, "assets/shots", `${slug}-${k}.jpg`)).filter(existsSync);
  if (!shots.length) return null;
  const W = 1600, BX = 40, BW = 1520, VH = Math.round((BW * 900) / 1440), TOP = 170, CH = 56;
  const H = TOP + CH + VH + 90;
  const N = shots.length, HOLD = 3.4, MOVE = 0.8, DUR = N * (HOLD + MOVE);
  // Keyframes: hold each slide, then slide left; the last slide eases back to the first.
  const kf = [];
  for (let k = 0; k < N; k++) {
    const a = (k * (HOLD + MOVE)) / DUR * 100, b = a + (HOLD / DUR) * 100;
    kf.push(`${a.toFixed(2)}%,${b.toFixed(2)}%{transform:translateX(${-k * BW}px)}`);
  }
  kf.push(`100%{transform:translateX(0)}`);
  const imgs = shots.map((p, k) =>
    `<image x="${k * BW}" y="0" width="${BW}" height="${VH}" preserveAspectRatio="xMidYMin slice" href="data:image/jpeg;base64,${readFileSync(p).toString("base64")}"/>`).join("");
  const dots = shots.map((_, k) => {
    const x = W / 2 - (N - 1) * 22 + k * 44;
    return `<rect x="${x - 7}" y="${H - 48}" width="14" height="14" rx="7" fill="rgba(255,255,255,.18)"/>
      <rect x="${x - 7}" y="${H - 48}" width="14" height="14" rx="7" fill="url(#vB)" class="dot" style="animation-delay:${(k * (HOLD + MOVE)).toFixed(2)}s"/>`;
  }).join("");
  const dotOn = (HOLD + MOVE) / DUR * 100;
  let cx = W - 40;
  const chips = [...tags].reverse().map((t) => {
    const w = t.length * 14 + 40; cx -= w;
    const el = `<rect x="${cx}" y="96" width="${w}" height="42" rx="21" fill="rgba(255,255,255,.05)" stroke="rgba(255,255,255,.12)"/><text x="${cx + w / 2}" y="123" text-anchor="middle" class="chip">${esc(t)}</text>`;
    cx -= 12;
    return el;
  }).join("");
  const f = frame(W, H, { id: "v" });
  const body = `
<defs>${f.defs}${brandGradient("vB")}
  <clipPath id="vp"><rect x="${BX}" y="${TOP + CH}" width="${BW}" height="${VH}"/></clipPath>
  <clipPath id="win"><rect x="${BX}" y="${TOP}" width="${BW}" height="${CH + VH}" rx="18"/></clipPath>
</defs>
<style>
  .k{font:600 22px ${MONO};letter-spacing:5px;fill:${C.muted}}
  .t{font:800 60px ${SANS};letter-spacing:-2px;fill:${C.text}}
  .tg{font:600 28px ${SANS};fill:url(#vB)}
  .chip{font:600 19px ${MONO};fill:${C.text}}
  .url{font:500 22px ${MONO};fill:${C.muted}}
  .strip{animation:slide ${DUR}s cubic-bezier(.7,0,.25,1) infinite}
  @keyframes slide{${kf.join("")}}
  .dot{opacity:0;animation:dot ${DUR}s steps(1) infinite}
  @keyframes dot{0%{opacity:1}${dotOn.toFixed(2)}%,100%{opacity:0}}
  .live{animation:live 2s ease-in-out infinite}
  @keyframes live{50%{opacity:.35}}
  ${REDUCED}
</style>
<g clip-path="url(#vClip)">
  ${f.bg}
  <text x="40" y="62" class="k"><tspan fill="${C.rose}">LIVE PROJECT 0${i + 1}</tspan>  ·  <tspan fill="${C.green}" class="live">● ONLINE</tspan></text>
  <text x="36" y="126" class="t">${esc(title)}</text>
  <text x="40" y="160" class="tg">${esc(tagline)}</text>
  ${chips}
  <g clip-path="url(#win)">
    <rect x="${BX}" y="${TOP}" width="${BW}" height="${CH}" fill="${C.panel2}"/>
    <circle cx="${BX + 30}" cy="${TOP + 28}" r="8" fill="#FF5F57"/><circle cx="${BX + 56}" cy="${TOP + 28}" r="8" fill="#FEBC2E"/><circle cx="${BX + 82}" cy="${TOP + 28}" r="8" fill="#28C840"/>
    <rect x="${BX + 420}" y="${TOP + 11}" width="${BW - 840}" height="34" rx="17" fill="${C.bg}"/>
    <text x="${W / 2}" y="${TOP + 35}" text-anchor="middle" class="url">🔒 ${esc(url)}</text>
    <rect x="${BX}" y="${TOP + CH}" width="${BW}" height="${VH}" fill="#fff"/>
    <g clip-path="url(#vp)"><g transform="translate(${BX} ${TOP + CH})"><g class="strip">${imgs}</g></g></g>
  </g>
  <rect x="${BX + 0.75}" y="${TOP + 0.75}" width="${BW - 1.5}" height="${CH + VH - 1.5}" rx="17.5" stroke="rgba(255,255,255,.14)" stroke-width="1.5"/>
  ${dots}
</g>
${f.edge}`;
  return svg(W, H + 28, body, `${title} — ${tagline} (${url})`);
}

export function buildShowcase() {
  SHOWCASE.forEach((p, i) => {
    const out = card(p, i);
    if (!out) return console.log(`showcase-${p.slug}: no screenshots, skipped`);
    writeFileSync(join(ROOT, "assets", `showcase-${p.slug}.svg`), out);
    console.log(`assets/showcase-${p.slug}.svg  ${(out.length / 1024).toFixed(0)} KB`);
  });
}
