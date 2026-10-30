// Builds the hand-designed animated SVGs in assets/. Run: node scripts/build-static.mjs
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { C, SANS, MONO, ROOT, esc, rng, brandGradient, frame, svg, icon, glyph } from "./theme.mjs";

const OUT = join(ROOT, "assets");
mkdirSync(OUT, { recursive: true });
const write = (name, content) => {
  writeFileSync(join(OUT, name), content);
  console.log(`assets/${name}  ${(content.length / 1024).toFixed(1)} KB`);
};
const REDUCED = `@media (prefers-reduced-motion: reduce){*{animation:none!important}}`;

/* ------------------------------------------------------------------ HERO */
function hero() {
  const W = 1600, H = 760, HZ = 615;
  const f = frame(W, H, { id: "h", r: 32 });
  const r = rng(42);

  const stars = Array.from({ length: 110 }, () => {
    const x = (r() * W).toFixed(0), y = (r() * (HZ - 20)).toFixed(0);
    const s = (0.6 + r() * 1.8).toFixed(2), d = (2 + r() * 5).toFixed(1), b = (-r() * 6).toFixed(1);
    return `<circle cx="${x}" cy="${y}" r="${s}" fill="#fff" class="tw" style="animation-duration:${d}s;animation-delay:${b}s"/>`;
  }).join("");

  const verticals = Array.from({ length: 33 }, (_, i) => {
    const k = i - 16;
    return `<line x1="${800 + k * 22}" y1="${HZ}" x2="${800 + k * 175}" y2="${H}"/>`;
  }).join("");
  const horizontals = Array.from({ length: 7 }, (_, i) => {
    const anim = (a) => `<animate attributeName="${a}" values="${HZ};${H}" dur="3.5s" begin="-${(i * 0.5).toFixed(1)}s" repeatCount="indefinite" calcMode="spline" keyTimes="0;1" keySplines="0.55 0 1 1"/>`;
    return `<line x1="0" x2="${W}" y1="${HZ}" y2="${HZ}">${anim("y1")}${anim("y2")}</line>`;
  }).join("");

  const roles = ["Full-Stack Developer", "AI Agent Engineer", "UI Craftsman", "Open-Source Builder"];
  const roleEls = roles.map((t, i) =>
    `<text x="800" y="478" text-anchor="middle" class="role" style="animation-delay:${i * 3}s">&lt; ${esc(t)} /&gt;</text>`).join("");

  const glyphs = [["&lt;/&gt;", 170, 175, 0], ["{ }", 120, 420, 2], ["=&gt;", 1460, 470, 4], ["λ", 1500, 330, 1], ["#", 260, 300, 3]]
    .map(([g, x, y, d]) => `<text x="${x}" y="${y}" class="glyph" style="animation-delay:-${d}s">${g}</text>`).join("");

  const orbit = (rx, ry, rot, dur, color) => {
    const p = `M ${-rx} 0 A ${rx} ${ry} 0 1 1 ${rx} 0 A ${rx} ${ry} 0 1 1 ${-rx} 0`;
    return `<g transform="rotate(${rot})">
      <path d="${p}" stroke="rgba(255,255,255,0.14)" stroke-width="1.5" stroke-dasharray="4 8"/>
      <circle r="6" fill="${color}" filter="url(#hGlow)"><animateMotion dur="${dur}s" repeatCount="indefinite" path="${p}"/></circle>
    </g>`;
  };

  const body = `
<defs>${f.defs}
  ${brandGradient("hBrand")}
  <linearGradient id="hName" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${W}" y2="0">
    <stop offset="0" stop-color="#ffffff"/><stop offset="0.42" stop-color="#ffffff"/>
    <stop offset="0.5" stop-color="${C.rose}"/><stop offset="0.58" stop-color="#ffffff"/><stop offset="1" stop-color="#ffffff"/>
    <animateTransform attributeName="gradientTransform" type="translate" values="-${W};${W}" dur="6s" repeatCount="indefinite"/>
  </linearGradient>
  <linearGradient id="hGridFade" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="0.45" stop-color="#fff" stop-opacity="0.55"/><stop offset="1" stop-color="#fff" stop-opacity="1"/>
  </linearGradient>
  <mask id="hGridMask"><rect x="0" y="${HZ}" width="${W}" height="${H - HZ}" fill="url(#hGridFade)"/></mask>
  <filter id="hBlur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="90"/></filter>
  <filter id="hSoft" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="22"/></filter>
  <filter id="hGlow" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <filter id="hGrain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.05 0"/></filter>
</defs>
<style>
  .tw{animation:tw 4s ease-in-out infinite}
  @keyframes tw{0%,100%{opacity:.15}50%{opacity:.95}}
  .blob{animation:drift 18s ease-in-out infinite alternate}
  .b2{animation-duration:22s;animation-delay:-6s}.b3{animation-duration:26s;animation-delay:-12s}
  @keyframes drift{0%{transform:translate(0,0) scale(1)}50%{transform:translate(120px,-40px) scale(1.15)}100%{transform:translate(-100px,30px) scale(.9)}}
  .fade{opacity:0;animation:up 1.1s cubic-bezier(.2,.8,.2,1) forwards}
  @keyframes up{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
  .d1{animation-delay:.15s}.d2{animation-delay:.35s}.d3{animation-delay:.6s}.d4{animation-delay:.85s}.d5{animation-delay:1.1s}
  .name{font:800 152px ${SANS};letter-spacing:-4px}
  .halo{animation:halo 5s ease-in-out infinite}
  @keyframes halo{0%,100%{opacity:.35}50%{opacity:.7}}
  .hi{font:500 44px ${SANS};fill:${C.muted}}
  .wave{transform-box:fill-box;transform-origin:70% 80%;animation:wave 2.4s ease-in-out infinite}
  @keyframes wave{0%,60%,100%{transform:rotate(0)}10%,30%{transform:rotate(14deg)}20%{transform:rotate(-8deg)}40%{transform:rotate(-4deg)}50%{transform:rotate(10deg)}}
  .role{font:600 46px ${MONO};fill:url(#hBrand);opacity:0;animation:role 12s infinite}
  @keyframes role{0%{opacity:0;transform:translateY(22px)}3%,22%{opacity:1;transform:translateY(0)}25%,100%{opacity:0;transform:translateY(-22px)}}
  .pill{font:600 24px ${MONO};letter-spacing:5px;fill:${C.text}}
  .pulse{transform-box:fill-box;transform-origin:center;animation:pulse 2s ease-out infinite}
  @keyframes pulse{0%{transform:scale(1);opacity:.8}100%{transform:scale(3.2);opacity:0}}
  .meta{font:500 30px ${SANS};fill:${C.muted}}
  .glyph{font:500 40px ${MONO};fill:${C.violet};opacity:.0;animation:float 8s ease-in-out infinite}
  @keyframes float{0%,100%{opacity:.12;transform:translateY(0)}50%{opacity:.45;transform:translateY(-18px)}}
  .spin{transform-box:view-box;transform-origin:1390px 175px;animation:spin 40s linear infinite}
  @keyframes spin{to{transform:rotate(360deg)}}
  .core{transform-box:fill-box;transform-origin:center;animation:core 3s ease-in-out infinite}
  @keyframes core{0%,100%{transform:scale(1)}50%{transform:scale(1.25)}}
  .grid line{stroke:${C.violet};stroke-opacity:.55;stroke-width:1.4}
  ${REDUCED}
</style>
<g clip-path="url(#hClip)">
  ${f.bg}
  <g filter="url(#hBlur)" opacity="0.75">
    <ellipse class="blob" cx="380" cy="300" rx="420" ry="260" fill="${C.rose}" opacity="0.55"/>
    <ellipse class="blob b2" cx="1200" cy="250" rx="460" ry="280" fill="${C.violet}" opacity="0.6"/>
    <ellipse class="blob b3" cx="820" cy="640" rx="520" ry="200" fill="${C.cyan}" opacity="0.35"/>
  </g>
  ${stars}
  ${glyphs}
  <g class="grid" mask="url(#hGridMask)">${verticals}${horizontals}</g>
  <rect x="0" y="${HZ - 1}" width="${W}" height="2" fill="url(#hBrand)" opacity="0.9"/>
  <rect x="200" y="${HZ - 14}" width="${W - 400}" height="28" fill="url(#hBrand)" opacity="0.5" filter="url(#hSoft)"/>

  <g class="spin">
    <g transform="translate(1390 175)">
      ${orbit(150, 46, -24, 7, C.rose)}${orbit(150, 46, 36, 9, C.cyan)}${orbit(150, 46, 96, 11, C.gold)}
      <circle r="16" fill="url(#hBrand)" class="core" filter="url(#hGlow)"/>
    </g>
  </g>

  <g class="fade d1">
    <rect x="530" y="118" width="540" height="58" rx="29" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.14)"/>
    <circle cx="572" cy="147" r="8" fill="${C.green}" class="pulse"/>
    <circle cx="572" cy="147" r="8" fill="${C.green}"/>
    <text x="826" y="156" text-anchor="middle" class="pill">OPEN TO OPPORTUNITIES</text>
  </g>
  <g class="fade d2"><text x="990" y="262" text-anchor="end" class="hi">Hi there, I'm Joylan</text>
    <text x="1004" y="262" font-size="44" fill="#fff" class="wave">👋</text></g>
  <g class="fade d3">
    <text x="800" y="395" text-anchor="middle" class="name halo" fill="url(#hBrand)" filter="url(#hSoft)">Joylan Dsouza</text>
    <text x="800" y="395" text-anchor="middle" class="name" fill="url(#hName)">Joylan Dsouza</text>
  </g>
  <g class="fade d4">${roleEls}</g>
  <g class="fade d5"><text x="800" y="560" text-anchor="middle" class="meta">India  <tspan fill="${C.rose}">✦</tspan>  Full-Stack × AI  <tspan fill="${C.violet}">✦</tspan>  Building in public</text></g>
  <rect width="${W}" height="${H}" filter="url(#hGrain)"/>
</g>
${f.edge}`;
  write("hero.svg", svg(W, H, body, "Joylan Dsouza — Full-Stack Developer, AI Agent Engineer, UI Craftsman"));
}

/* ------------------------------------------------------- SECTION HEADERS */
const SECTIONS = [
  ["about", "01", "ABOUT ME", "The human behind the commits"],
  ["stack", "02", "TECH STACK", "Tools I build worlds with"],
  ["work", "03", "FEATURED WORK", "Things I've shipped"],
  ["stats", "04", "GITHUB UNIVERSE", "Numbers that never sleep"],
  ["badges", "05", "ACHIEVEMENTS", "Badges & milestones"],
  ["connect", "06", "CONNECT", "Let's build something iconic"],
];
function headers() {
  for (const [slug, num, label, title] of SECTIONS) {
    const W = 1600, H = 190;
    const body = `
<defs>${brandGradient("g", 'gradientUnits="userSpaceOnUse" x1="640" x2="960" y1="0" y2="0"')}
  <filter id="gl" x="-300%" y="-300%" width="700%" height="700%"><feGaussianBlur stdDeviation="5"/></filter></defs>
<style>
  .k{font:600 26px ${MONO};letter-spacing:7px;fill:${C.muted}}
  .n{fill:${C.rose}}
  .t{font:800 68px ${SANS};letter-spacing:-1.5px;fill:${C.text}}
  .in{opacity:0;animation:in .9s cubic-bezier(.2,.8,.2,1) forwards}
  .in2{animation-delay:.2s}
  @keyframes in{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
  .ln{stroke-dasharray:320;stroke-dashoffset:320;animation:draw 1.4s .4s cubic-bezier(.6,0,.2,1) forwards}
  @keyframes draw{to{stroke-dashoffset:0}}
  ${REDUCED}
</style>
<g class="in"><text x="800" y="52" text-anchor="middle" class="k"><tspan class="n">${num}</tspan>  /  ${esc(label)}</text></g>
<g class="in in2"><text x="800" y="132" text-anchor="middle" class="t">${esc(title)}</text></g>
<line x1="640" y1="168" x2="960" y2="168" stroke="url(#g)" stroke-width="4" stroke-linecap="round" class="ln"/>
<circle cy="168" r="5" fill="#fff" filter="url(#gl)"><animate attributeName="cx" values="640;960;640" dur="5s" repeatCount="indefinite" calcMode="spline" keyTimes="0;.5;1" keySplines=".45 0 .55 1;.45 0 .55 1"/></circle>`;
    write(`header-${slug}.svg`, svg(W, H, body, `${num} ${label} — ${title}`));
  }
}

/* --------------------------------------------------------- ABOUT (code) */
function about() {
  const W = 1600, H = 820;
  const f = frame(W, H, { id: "a" });
  const k = (s) => `<tspan fill="${C.violet}">${s}</tspan>`;      // keyword
  const p = (s) => `<tspan fill="${C.cyan}">${s}</tspan>`;        // property
  const s = (t) => `<tspan fill="${C.gold}">"${esc(t)}"</tspan>`; // string
  const o = (t) => `<tspan fill="${C.muted}">${esc(t)}</tspan>`;  // punctuation
  const v = (t) => `<tspan fill="${C.rose}">${t}</tspan>`;        // literal
  const lines = [
    [`${k("const")} ${v("joylan")} ${o("=")} ${o("{")}`, 19],
    [`  ${p("role")}${o(":")}      ${s("Full-Stack Developer")}${o(",")}`, 40],
    [`  ${p("based")}${o(":")}     ${s("India")}${o(",")}`, 24],
    [`  ${p("focus")}${o(":")}     ${o("[")}${s("AI Agents")}${o(", ")}${s("SaaS")}${o(", ")}${s("UI")}${o("],")}`, 44],
    [`  ${p("building")}${o(":")}  ${s("TraceAI · AgentOps platform")}${o(",")}`, 43],
    [`  ${p("frontend")}${o(":")}  ${o("[")}${s("React")}${o(", ")}${s("Next.js")}${o(", ")}${s("TS")}${o("],")}`, 43],
    [`  ${p("backend")}${o(":")}   ${o("[")}${s("Node")}${o(", ")}${s("FastAPI")}${o(", ")}${s("Mongo")}${o("],")}`, 43],
    [`  ${p("coffee")}${o(":")}    ${v("Infinity")}${o(",")}`, 22],
    [`  ${p("available")}${o(":")} ${v("true")}${o(",")}`, 18],
    [`${o("};")}`, 2],
  ];
  const X = 150, Y0 = 200, LH = 54, CW = 20.4; // approx mono advance at 34px
  let t = 0.6;
  const code = [], covers = [];
  lines.forEach(([html, len], i) => {
    const y = Y0 + i * LH, w = Math.ceil(len * CW) + 30, dur = Math.max(0.2, len * 0.022);
    code.push(`<text x="70" y="${y}" class="ln">${i + 1}</text><text x="${X}" y="${y}" class="code">${html}</text>`);
    covers.push(`<rect x="${X}" y="${y - 40}" width="${w}" height="${LH}" fill="${C.panel}" class="cv" style="animation-duration:${dur.toFixed(2)}s;animation-delay:${t.toFixed(2)}s;animation-timing-function:steps(${len})"/>`);
    t += dur + 0.08;
  });
  const lastY = Y0 + (lines.length - 1) * LH;
  const orbitIcons = ["react", "python", "typescript", "nodejs", "fastapi", "mongodb"];
  const cx = 1290, cy = 450;
  const orbIcons = orbitIcons.map((n, i) => {
    const a = (i / orbitIcons.length) * Math.PI * 2;
    const x = cx + Math.cos(a) * 190 - 36, y = cy + Math.sin(a) * 190 - 36;
    return `<g class="cnt" style="transform-origin:${x + 36}px ${y + 36}px">${icon(n, x.toFixed(1), y.toFixed(1), 72)}</g>`;
  }).join("");

  const body = `
<defs>${f.defs}${brandGradient("aBrand")}
  <radialGradient id="aOrb"><stop offset="0" stop-color="${C.violet}" stop-opacity=".55"/><stop offset=".6" stop-color="${C.rose}" stop-opacity=".12"/><stop offset="1" stop-color="${C.rose}" stop-opacity="0"/></radialGradient>
</defs>
<style>
  .code{font:500 34px ${MONO};fill:${C.text};white-space:pre}
  .ln{font:500 26px ${MONO};fill:${C.dim}}
  .cv{transform-box:fill-box;transform-origin:right;animation-name:type;animation-fill-mode:both}
  @keyframes type{from{transform:scaleX(1)}to{transform:scaleX(0)}}
  .caret{opacity:0;animation:blink 1s steps(1) infinite}
  @keyframes blink{0%,49%{opacity:1}50%,100%{opacity:0}}
  .tab{font:600 24px ${MONO};fill:${C.text}}
  .rot{transform-origin:${cx}px ${cy}px;animation:rot 36s linear infinite}
  .cnt{animation:rot 36s linear infinite reverse}
  @keyframes rot{to{transform:rotate(360deg)}}
  .breath{transform-origin:${cx}px ${cy}px;animation:br 5s ease-in-out infinite}
  @keyframes br{0%,100%{transform:scale(1);opacity:.8}50%{transform:scale(1.12);opacity:1}}
  .cap{font:600 22px ${MONO};letter-spacing:5px;fill:${C.muted}}
  ${REDUCED}
</style>
<g clip-path="url(#aClip)">
  ${f.bg}
  <rect width="${W}" height="84" fill="${C.panel2}"/>
  <circle cx="48" cy="42" r="10" fill="#FF5F57"/><circle cx="82" cy="42" r="10" fill="#FEBC2E"/><circle cx="116" cy="42" r="10" fill="#28C840"/>
  <rect x="170" y="18" width="250" height="66" rx="12" fill="${C.panel}"/>
  <rect x="170" y="80" width="250" height="4" fill="url(#aBrand)"/>
  <text x="200" y="60" class="tab"><tspan fill="${C.cyan}">TS</tspan>  joylan.ts</text>
  <text x="${W - 40}" y="58" text-anchor="end" class="cap">~/profile · main</text>
  ${code.join("\n  ")}
  ${covers.join("\n  ")}
  <rect x="${X + 2 * CW + 4}" y="${lastY - 34}" width="18" height="40" fill="${C.rose}" class="caret" style="animation-delay:${t.toFixed(2)}s"/>
  <line x1="1000" y1="120" x2="1000" y2="${H - 50}" stroke="${C.line}" stroke-width="2"/>
  <circle cx="${cx}" cy="${cy}" r="260" fill="url(#aOrb)" class="breath"/>
  <circle cx="${cx}" cy="${cy}" r="190" stroke="rgba(255,255,255,.12)" stroke-width="2" stroke-dasharray="3 10"/>
  <circle cx="${cx}" cy="${cy}" r="120" stroke="rgba(255,255,255,.08)" stroke-width="2"/>
  <g class="rot">${orbIcons}</g>
  <circle cx="${cx}" cy="${cy}" r="62" fill="${C.panel2}" stroke="url(#aBrand)" stroke-width="3"/>
  <text x="${cx}" y="${cy + 18}" text-anchor="middle" style="font:800 50px ${SANS}" fill="url(#aBrand)">JD</text>
  <text x="${cx}" y="${H - 60}" text-anchor="middle" class="cap">CURRENTLY ORBITING</text>
</g>
${f.edge}`;
  write("about.svg", svg(W, H, body, "const joylan = { role: Full-Stack Developer, based: India, focus: AI Agents, SaaS, UI, building: TraceAI }"));
}

/* ------------------------------------------------------------ TECH STACK */
function stack() {
  const groups = [
    ["Languages", "the grammar", ["typescript", "javascript", "python", "java", "dart"]],
    ["Frontend & Mobile", "pixels that feel", ["react", "nextjs", "tailwind", "flutter", "html", "css"]],
    ["Backend & APIs", "the engine room", ["nodejs", "express", "fastapi", "docker"]],
    ["Data & Cloud", "where state lives", ["mongodb", "mysql", "redis", "firebase"]],
    ["AI / ML", "teaching machines", ["tensorflow", "pytorch", "opencv"]],
    ["Tooling", "daily drivers", ["git", "github", "vscode", "postman", "figma", "notion"]],
  ];
  const W = 1600, PW = 770, PH = 260, GAP = 20, IS = 92, IG = 18;
  const H = 3 * PH + 2 * GAP;
  let n = 0;
  const panels = groups.map(([title, sub, icons], gi) => {
    const col = gi % 2, row = Math.floor(gi / 2);
    const x = col * (PW + GAP * 3), y = row * (PH + GAP);
    const id = `p${gi}`;
    const tiles = icons.map((ic, ii) => {
      const ix = x + 40 + ii * (IS + IG), iy = y + 128;
      const k = n++;
      return `<g class="fl" style="animation-delay:-${(k * 0.37).toFixed(2)}s"><g class="pop" style="animation-delay:${(0.2 + k * 0.05).toFixed(2)}s;transform-origin:${ix + IS / 2}px ${iy + IS / 2}px">${icon(ic, ix, iy, IS)}</g></g>`;
    }).join("");
    return `<g class="panel" style="animation-delay:${(gi * 0.1).toFixed(1)}s">
    <clipPath id="${id}c"><rect x="${x}" y="${y}" width="${PW}" height="${PH}" rx="24"/></clipPath>
    <g clip-path="url(#${id}c)">
      <rect x="${x}" y="${y}" width="${PW}" height="${PH}" fill="${C.panel}"/>
      <rect x="${x - 300}" y="${y}" width="220" height="${PH}" fill="url(#sheen)" class="sh" style="animation-delay:${(gi * 0.6).toFixed(1)}s"/>
      <rect x="${x}" y="${y}" width="6" height="${PH}" fill="url(#vBrand)"/>
    </g>
    <rect x="${x + 0.75}" y="${y + 0.75}" width="${PW - 1.5}" height="${PH - 1.5}" rx="24" stroke="rgba(255,255,255,.09)" stroke-width="1.5"/>
    <text x="${x + 40}" y="${y + 66}" class="gt">${esc(title)}</text>
    <text x="${x + PW - 36}" y="${y + 64}" text-anchor="end" class="gs">// ${esc(sub)}</text>
    ${tiles}
  </g>`;
  }).join("\n");
  const body = `
<defs>
  <linearGradient id="vBrand" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.rose}"/><stop offset=".5" stop-color="${C.violet}"/><stop offset="1" stop-color="${C.cyan}"/></linearGradient>
  <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".07"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
</defs>
<style>
  .gt{font:700 36px ${SANS};fill:${C.text};letter-spacing:-.5px}
  .gs{font:500 22px ${MONO};fill:${C.dim}}
  .panel{opacity:0;animation:in .8s cubic-bezier(.2,.8,.2,1) forwards}
  @keyframes in{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
  .pop{animation:pop .6s cubic-bezier(.3,1.6,.5,1) both}
  @keyframes pop{from{transform:scale(.4);opacity:0}to{transform:scale(1);opacity:1}}
  .fl{animation:fl 4.5s ease-in-out infinite}
  @keyframes fl{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
  .sh{animation:sh 7s ease-in-out infinite}
  @keyframes sh{0%{transform:translateX(0)}40%,100%{transform:translateX(1400px)}}
  ${REDUCED}
</style>
${panels}`;
  write("stack.svg", svg(W, H, body, "Tech stack: TypeScript, JavaScript, Python, Java, Dart, React, Next.js, Tailwind, Flutter, Node.js, Express, FastAPI, Docker, MongoDB, MySQL, Redis, Firebase, TensorFlow, PyTorch, OpenCV, Git, GitHub, VS Code, Postman, Figma, Notion"));
}

/* --------------------------------------------------------- SOCIAL PILLS */
const LINKEDIN = "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z";
export const SOCIALS = [
  ["linkedin", "LinkedIn", "#0A66C2", LINKEDIN, "https://www.linkedin.com/in/joylan-dsouza-31b056263"],
  ["instagram", "Instagram", "#E4405F", glyph("instagram"), "https://instagram.com/joylan_7"],
  ["x", "X / Twitter", "#FFFFFF", glyph("x"), "https://x.com/joylan_7"],
  ["gmail", "Email", "#EA4335", glyph("gmail"), "mailto:joylan928@gmail.com"],
  ["facebook", "Facebook", "#1877F2", glyph("facebook"), "https://www.facebook.com/joylan.dsouza.792"],
  ["reddit", "Reddit", "#FF4500", glyph("reddit"), "https://reddit.com/user/joylan_7"],
  ["pinterest", "Pinterest", "#E60023", glyph("pinterest"), "https://pinterest.com/joylan_7"],
];
function socials() {
  const W = 400, H = 112;
  SOCIALS.forEach(([slug, label, color, d], i) => {
    const body = `
<defs>
  <clipPath id="c"><rect width="${W}" height="${H}" rx="28"/></clipPath>
  <linearGradient id="sh" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".16"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <radialGradient id="gl" cx="0.18" cy="0.5" r="0.6"><stop offset="0" stop-color="${color}" stop-opacity=".45"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>
</defs>
<style>
  .l{font:700 34px ${SANS};fill:${C.text};letter-spacing:-.3px}
  .s{animation:s 4.5s ease-in-out infinite;animation-delay:${(i * 0.45).toFixed(2)}s}
  @keyframes s{0%{transform:translateX(-200px)}45%,100%{transform:translateX(560px)}}
  .g{animation:g 3s ease-in-out infinite;animation-delay:-${i * 0.4}s}
  @keyframes g{0%,100%{opacity:.6}50%{opacity:1}}
  ${REDUCED}
</style>
<g clip-path="url(#c)">
  <rect width="${W}" height="${H}" fill="${C.panel}"/>
  <rect width="${W}" height="${H}" fill="url(#gl)" class="g"/>
  <rect x="0" y="0" width="160" height="${H}" fill="url(#sh)" class="s"/>
</g>
<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="27" stroke="${color}" stroke-opacity=".55" stroke-width="2"/>
<circle cx="62" cy="56" r="34" fill="${color}" fill-opacity=".16" stroke="${color}" stroke-opacity=".5"/>
<path d="${d}" fill="${color}" transform="translate(44 38) scale(1.5)"/>
<text x="118" y="68" class="l">${esc(label)}</text>
<path d="M352 66 L368 50 M356 50 H368 V62" stroke="${C.muted}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>`;
    write(`social-${slug}.svg`, svg(W, H, body, label));
  });
}

/* ------------------------------------------------------------ CTA BUTTON */
function cta() {
  const W = 760, H = 128;
  const body = `
<defs>${brandGradient("b")}
  <linearGradient id="bm" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${W}" y2="0">
    <stop offset="0" stop-color="${C.rose}"/><stop offset=".5" stop-color="${C.violet}"/><stop offset="1" stop-color="${C.cyan}"/>
    <animateTransform attributeName="gradientTransform" type="translate" values="0;${-W / 2};0" dur="6s" repeatCount="indefinite"/>
  </linearGradient>
  <clipPath id="c"><rect width="${W}" height="${H}" rx="64"/></clipPath>
  <linearGradient id="sh" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
</defs>
<style>
  .t{font:800 40px ${SANS};fill:#fff;letter-spacing:.5px}
  .s{animation:s 3.6s ease-in-out infinite}
  @keyframes s{0%{transform:translateX(-260px)}50%,100%{transform:translateX(${W + 260}px)}}
  .a{animation:a 1.6s ease-in-out infinite}
  @keyframes a{0%,100%{transform:translateX(0)}50%{transform:translateX(8px)}}
  ${REDUCED}
</style>
<g clip-path="url(#c)">
  <rect width="${W * 1.5}" height="${H}" fill="url(#bm)"/>
  <rect width="${W}" height="${H}" fill="#06070D" fill-opacity=".12"/>
  <rect x="0" y="0" width="200" height="${H}" fill="url(#sh)" class="s"/>
</g>
<rect x="1.5" y="1.5" width="${W - 3}" height="${H - 3}" rx="62.5" stroke="#fff" stroke-opacity=".35" stroke-width="3"/>
<g stroke="#fff" stroke-width="4" fill="none" transform="translate(110 64)"><circle r="24"/><ellipse rx="10" ry="24"/><path d="M-24 0 H24 M-20 -12 H20 M-20 12 H20"/></g>
<text x="${W / 2 + 30}" y="78" text-anchor="middle" class="t">Explore my portfolio</text>
<g class="a"><path d="M640 64 H676 M660 46 L678 64 L660 82" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  write("cta-portfolio.svg", svg(W, H, body, "Explore my portfolio"));
}

/* ---------------------------------------------------------------- FOOTER */
function footer() {
  const W = 1600, H = 440;
  const wave = (amp, y, len) => {
    let d = `M0 ${y}`;
    for (let x = 0; x <= W * 2; x += len) d += ` q ${len / 4} ${-amp} ${len / 2} 0 t ${len / 2} 0`;
    return d + ` V ${H} H 0 Z`;
  };
  const quotes = [
    ["The best way to predict the future is to build it.", "Alan Kay"],
    ["Make it work, make it right, make it fast.", "Kent Beck"],
    ["Simplicity is the soul of efficiency.", "Austin Freeman"],
    ["First, solve the problem. Then, write the code.", "John Johnson"],
  ];
  const q = quotes.map(([t, a], i) =>
    `<g class="q" style="animation-delay:${i * 5}s"><text x="800" y="210" text-anchor="middle" class="qt">“${esc(t)}”</text><text x="800" y="260" text-anchor="middle" class="qa">— ${esc(a)}</text></g>`).join("");
  const body = `
<defs>${brandGradient("fb")}
  <clipPath id="fc"><rect width="${W}" height="${H}" rx="32"/></clipPath>
  <linearGradient id="fw1" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.rose}"/><stop offset="1" stop-color="${C.violet}"/></linearGradient>
  <linearGradient id="fw2" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.violet}"/><stop offset="1" stop-color="${C.cyan}"/></linearGradient>
</defs>
<style>
  .big{font:800 64px ${SANS};fill:url(#fb);letter-spacing:-1.5px}
  .qt{font:italic 500 34px ${SANS};fill:${C.text}}
  .qa{font:500 24px ${MONO};fill:${C.muted};letter-spacing:2px}
  .q{opacity:0;animation:q 20s infinite}
  @keyframes q{0%{opacity:0;transform:translateY(12px)}4%,21%{opacity:1;transform:none}25%,100%{opacity:0;transform:translateY(-12px)}}
  .w1{animation:w 14s linear infinite}.w2{animation:w 9s linear infinite reverse}.w3{animation:w 20s linear infinite}
  @keyframes w{to{transform:translateX(-${W}px)}}
  .sig{font:500 22px ${MONO};fill:${C.text};opacity:.85;letter-spacing:3px}
  ${REDUCED}
</style>
<g clip-path="url(#fc)">
  <rect width="${W}" height="${H}" fill="${C.panel}"/>
  <path d="${wave(26, 340, 400)}" fill="url(#fw2)" opacity=".18" class="w3"/>
  <path d="${wave(34, 360, 533.3333)}" fill="url(#fw1)" opacity=".3" class="w1"/>
  <path d="${wave(22, 385, 320)}" fill="url(#fw2)" opacity=".45" class="w2"/>
  <text x="800" y="112" text-anchor="middle" class="big">Thanks for stopping by ✦</text>
  ${q}
  <text x="800" y="418" text-anchor="middle" class="sig">CRAFTED WITH CODE &amp; COFFEE · JOYLAN DSOUZA</text>
</g>
<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="31" stroke="rgba(255,255,255,.1)" stroke-width="2"/>`;
  write("footer.svg", svg(W, H, body, "Thanks for stopping by"));
}

/* ------------------------------------------------------------- DIVIDER */
function divider() {
  const W = 1600, H = 40;
  const body = `
<defs><linearGradient id="d" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.rose}" stop-opacity="0"/><stop offset=".3" stop-color="${C.rose}"/><stop offset=".5" stop-color="${C.violet}"/><stop offset=".7" stop-color="${C.cyan}"/><stop offset="1" stop-color="${C.cyan}" stop-opacity="0"/></linearGradient>
<filter id="b" x="-10%" y="-400%" width="120%" height="900%"><feGaussianBlur stdDeviation="4"/></filter></defs>
<rect x="100" y="19" width="1400" height="2" fill="url(#d)" opacity=".7"/>
<circle cy="20" r="4" fill="#fff"><animate attributeName="cx" values="100;1500" dur="6s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.1;.9;1" dur="6s" repeatCount="indefinite"/></circle>
<rect y="14" width="120" height="12" rx="6" fill="#fff" opacity=".6" filter="url(#b)"><animate attributeName="x" values="40;1440" dur="6s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;.6;.6;0" keyTimes="0;.1;.9;1" dur="6s" repeatCount="indefinite"/></rect>`;
  write("divider.svg", svg(W, H, body, "divider"));
}

hero(); headers(); about(); stack(); socials(); cta(); footer(); divider();
