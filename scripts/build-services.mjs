// Services, workflow, hire-me terminal and banner. Imported by build-static.mjs.
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { C, SANS, MONO, ROOT, esc, rng, brandGradient, frame, svg } from "./theme.mjs";

const write = (name, content) => {
  writeFileSync(join(ROOT, "assets", name), content);
  console.log(`assets/${name}  ${(content.length / 1024).toFixed(1)} KB`);
};
const REDUCED = `@media (prefers-reduced-motion: reduce){*{animation:none!important}}`;
const D = "#0A0C16", P2 = "#151933", P3 = "#2A2F55";

// Shared looping keyframes: every illustration runs on one 6s clock so its parts stay in sync.
const LOOP = `
  .grow{transform-box:fill-box;transform-origin:left center;animation:grow 6s cubic-bezier(.6,0,.2,1) infinite both}
  @keyframes grow{0%{transform:scaleX(0)}14%,86%{transform:scaleX(1)}96%,100%{transform:scaleX(0)}}
  .rise{transform-box:fill-box;transform-origin:center bottom;animation:rise 6s cubic-bezier(.6,0,.2,1) infinite both}
  @keyframes rise{0%{transform:scaleY(0)}14%,86%{transform:scaleY(1)}96%,100%{transform:scaleY(0)}}
  .pop{transform-box:fill-box;transform-origin:center;animation:pop 6s cubic-bezier(.3,1.6,.5,1) infinite both}
  @keyframes pop{0%{transform:scale(0);opacity:0}10%,86%{transform:scale(1);opacity:1}96%,100%{transform:scale(0);opacity:0}}
  .slide{animation:slide 6s cubic-bezier(.2,.8,.2,1) infinite both}
  @keyframes slide{0%{transform:translateX(40px);opacity:0}10%,86%{transform:none;opacity:1}96%,100%{transform:translateX(-20px);opacity:0}}
  .draw{stroke-dasharray:1;stroke-dashoffset:1;animation:draw 6s cubic-bezier(.6,0,.2,1) infinite both}
  @keyframes draw{0%{stroke-dashoffset:1}30%,86%{stroke-dashoffset:0}100%{stroke-dashoffset:-1}}
  .flow{animation:flow 1s linear infinite}
  @keyframes flow{to{stroke-dashoffset:-16}}
  .blink{animation:blink 1.4s steps(1) infinite}
  @keyframes blink{50%{opacity:.25}}
  .lbl{font:600 15px ${MONO};fill:${C.muted}}
  .tiny{font:600 13px ${MONO};fill:${C.muted}}
  .w{fill:#fff}`;
const d = (s) => `style="animation-delay:${s}s"`;

/* -------------------------------------------------------- illustrations */
function web() {
  return `
  <rect x="30" y="26" width="500" height="268" rx="14" fill="${D}" stroke="${P3}"/>
  <path d="M30 40a14 14 0 0 1 14-14h472a14 14 0 0 1 14 14v26H30z" fill="${P2}"/>
  <circle cx="52" cy="46" r="5" fill="#FF5F57"/><circle cx="70" cy="46" r="5" fill="#FEBC2E"/><circle cx="88" cy="46" r="5" fill="#28C840"/>
  <rect x="120" y="36" width="280" height="20" rx="10" fill="${D}"/>
  <text x="140" y="51" class="tiny">🔒 yourbrand.com</text>
  <rect x="50" y="82" width="60" height="10" rx="5" fill="url(#br)" class="grow" ${d(0)}/>
  <rect x="380" y="84" width="30" height="6" rx="3" fill="${P3}"/><rect x="420" y="84" width="30" height="6" rx="3" fill="${P3}"/><rect x="460" y="84" width="50" height="6" rx="3" fill="${C.rose}"/>
  <rect x="50" y="112" width="220" height="18" rx="5" fill="url(#br)" class="grow" ${d(0.2)}/>
  <rect x="50" y="138" width="190" height="11" rx="5" fill="${P3}" class="grow" ${d(0.35)}/>
  <rect x="50" y="157" width="150" height="11" rx="5" fill="${P3}" class="grow" ${d(0.45)}/>
  <g class="pop" ${d(0.6)}><rect x="50" y="182" width="116" height="32" rx="16" fill="${C.rose}"/><text x="108" y="203" text-anchor="middle" style="font:700 13px ${SANS}" class="w">Get started</text></g>
  <g class="pop" ${d(0.5)}>
    <rect x="300" y="106" width="210" height="112" rx="12" fill="url(#img)"/>
    <circle cx="470" cy="138" r="12" fill="#fff" opacity=".85"/>
    <path d="M300 200 l52-50 40 34 30-24 88 58v-8a12 12 0 0 1-12 12H312a12 12 0 0 1-12-12z" fill="#fff" opacity=".28"/>
  </g>
  ${[50, 202, 354].map((x, i) => `<g class="pop" ${d(0.8 + i * 0.12)}><rect x="${x}" y="234" width="140" height="44" rx="10" fill="${P2}" stroke="${P3}"/><circle cx="${x + 22}" cy="256" r="9" fill="${[C.rose, C.violet, C.cyan][i]}"/><rect x="${x + 40}" y="250" width="80" height="8" rx="4" fill="${P3}"/></g>`).join("")}
  <g class="cur"><path d="M0 0 L0 22 L6 16 L11 27 L15 25 L10 14 L18 14 Z" fill="#fff" stroke="${D}" stroke-width="1.5"/></g>
  <circle cx="108" cy="198" r="6" fill="none" stroke="#fff" stroke-width="2" class="ripple"/>
  <g transform="translate(500 40)">
    <circle r="30" fill="${D}" stroke="${P3}" stroke-width="2"/>
    <circle r="23" stroke="rgba(52,211,153,.2)" stroke-width="5"/>
    <circle r="23" pathLength="1" stroke="${C.green}" stroke-width="5" stroke-linecap="round" class="draw" transform="rotate(-90)" ${d(0.3)}/>
    <text y="6" text-anchor="middle" style="font:800 16px ${SANS}" fill="${C.green}">100</text>
  </g>`;
}
const webCss = `
  .cur{animation:cur 6s ease-in-out infinite}
  @keyframes cur{0%,8%{transform:translate(420px,290px)}32%,44%{transform:translate(104px,194px)}70%,100%{transform:translate(420px,290px)}}
  .ripple{transform-box:fill-box;transform-origin:center;opacity:0;animation:rip 6s ease-out infinite}
  @keyframes rip{0%,34%{opacity:0;transform:scale(.5)}36%{opacity:.9;transform:scale(1)}50%,100%{opacity:0;transform:scale(5)}}`;

function apps() {
  const phone = (x, y, inner) => `
    <rect x="${x}" y="${y}" width="160" height="290" rx="28" fill="${D}" stroke="${P3}" stroke-width="3"/>
    <rect x="${x + 55}" y="${y + 10}" width="50" height="9" rx="4.5" fill="${P2}"/>
    ${inner}
    <rect x="${x + 55}" y="${y + 274}" width="50" height="5" rx="2.5" fill="${P3}"/>`;
  const list = [0, 1, 2, 3].map((i) => `<g class="slide" ${d(0.2 + i * 0.15)}>
      <rect x="104" y="${78 + i * 50}" width="132" height="40" rx="11" fill="${P2}"/>
      <circle cx="124" cy="${98 + i * 50}" r="10" fill="${[C.rose, C.violet, C.cyan, C.gold][i]}"/>
      <rect x="142" y="${90 + i * 50}" width="70" height="7" rx="3.5" fill="#E8E8F2" opacity=".7"/>
      <rect x="142" y="${102 + i * 50}" width="46" height="6" rx="3" fill="${P3}"/></g>`).join("");
  const bars = [44, 70, 52, 90, 64].map((h, i) => `<rect x="${326 + i * 22}" y="${262 - h}" width="14" height="${h}" rx="4" fill="url(#brv)" class="rise" ${d(0.3 + i * 0.1)}/>`).join("");
  return `
  ${phone(90, 16, `<text x="108" y="62" style="font:800 17px ${SANS}" class="w">Orders</text>${list}`)}
  ${phone(310, 16, `<circle cx="390" cy="118" r="44" stroke="${P2}" stroke-width="10"/>
    <circle cx="390" cy="118" r="44" pathLength="1" stroke="url(#br)" stroke-width="10" stroke-linecap="round" stroke-dasharray=".82 1" class="ring" transform="rotate(-90 390 118)"/>
    <text x="390" y="125" text-anchor="middle" style="font:800 22px ${SANS}" class="w">82%</text>${bars}`)}
  <g class="toast"><rect x="160" y="-52" width="240" height="44" rx="22" fill="${C.panel2}" stroke="${C.rose}" stroke-opacity=".7"/>
    <circle cx="184" cy="-30" r="9" fill="${C.rose}"/><text x="202" y="-25" style="font:700 14px ${SANS}" class="w">New order received</text></g>
  <text x="28" y="300" class="lbl">iOS</text><text x="500" y="300" class="lbl">Android</text>`;
}
const appsCss = `
  .toast{animation:toast 6s cubic-bezier(.2,.8,.2,1) infinite}
  @keyframes toast{0%,40%{transform:translateY(0)}48%,78%{transform:translateY(70px)}86%,100%{transform:translateY(0)}}
  .ring{animation:ring 6s cubic-bezier(.6,0,.2,1) infinite both}
  @keyframes ring{0%{stroke-dasharray:0 1}30%,86%{stroke-dasharray:.82 1}100%{stroke-dasharray:0 1}}`;

function ai() {
  const nodes = [["LLM", 452, 160, 34], ["Search", 392, 58, 22], ["DB", 528, 92, 22], ["Email", 528, 236, 22], ["Docs", 392, 262, 22]];
  const [, cx, cy] = nodes[0];
  const edges = nodes.slice(1).map(([, x, y], i) => `
    <path d="M${cx} ${cy} L${x} ${y}" stroke="${P3}" stroke-width="2" stroke-dasharray="4 4" class="flow"/>
    <circle r="4" fill="${[C.cyan, C.rose, C.gold, C.green][i]}"><animateMotion dur="${1.6 + i * 0.3}s" repeatCount="indefinite" path="M${cx} ${cy} L${x} ${y}"/></circle>`).join("");
  return `
  <rect x="20" y="20" width="330" height="280" rx="16" fill="${D}" stroke="${P3}"/>
  <text x="40" y="52" style="font:800 15px ${SANS}" class="w">AI Assistant</text><circle cx="140" cy="47" r="4" fill="${C.green}" class="blink"/>
  <line x1="20" y1="66" x2="350" y2="66" stroke="${P3}"/>
  <g class="pop" ${d(0.1)}><rect x="146" y="80" width="186" height="38" rx="14" fill="${C.violet}"/><text x="162" y="104" style="font:600 13px ${SANS}" class="w">Summarise this week's sales</text></g>
  <g class="typing"><rect x="38" y="132" width="70" height="34" rx="14" fill="${P2}"/>
    ${[0, 1, 2].map((i) => `<circle cx="${58 + i * 15}" cy="149" r="4" fill="${C.muted}" class="dot" ${d(i * 0.15)}/>`).join("")}</g>
  <g class="reply"><rect x="38" y="132" width="264" height="74" rx="14" fill="${P2}"/>
    <text x="54" y="160" style="font:600 13px ${SANS}" class="w">Revenue ↑ 24% vs last week</text>
    <text x="54" y="186" style="font:500 13px ${SANS}" fill="${C.muted}">3 follow-ups drafted for you ✓</text></g>
  <g class="reply2"><rect x="38" y="220" width="96" height="28" rx="14" fill="none" stroke="${C.cyan}"/><text x="86" y="239" text-anchor="middle" class="tiny" fill="${C.cyan}" style="fill:${C.cyan}">Send all</text>
    <rect x="144" y="220" width="96" height="28" rx="14" fill="none" stroke="${P3}"/><text x="192" y="239" text-anchor="middle" class="tiny">Edit</text></g>
  <rect x="34" y="258" width="302" height="30" rx="15" fill="${P2}"/><text x="52" y="278" class="tiny">Ask anything…</text>
  ${edges}
  ${nodes.slice(1).map(([n, x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${C.panel2}" stroke="${P3}" stroke-width="2"/><text x="${x}" y="${y + 4}" text-anchor="middle" class="tiny" style="font-size:11px">${n}</text>`).join("")}
  <circle cx="${cx}" cy="${cy}" r="46" fill="url(#brv)" opacity=".25" class="halo"/>
  <circle cx="${cx}" cy="${cy}" r="34" fill="${C.panel2}" stroke="url(#br)" stroke-width="3"/>
  <text x="${cx}" y="${cy + 6}" text-anchor="middle" style="font:800 17px ${SANS}" class="w">LLM</text>`;
}
const aiCss = `
  .typing{animation:typing 6s infinite both}
  @keyframes typing{0%,14%{opacity:0}18%,40%{opacity:1}44%,100%{opacity:0}}
  .reply{animation:reply 6s cubic-bezier(.2,.8,.2,1) infinite both}
  @keyframes reply{0%,42%{opacity:0;transform:translateY(10px)}48%,90%{opacity:1;transform:none}100%{opacity:0}}
  .reply2{animation:reply 6s cubic-bezier(.2,.8,.2,1) infinite both;animation-delay:.5s}
  .dot{animation:bounce .9s ease-in-out infinite}
  @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
  .halo{transform-box:fill-box;transform-origin:center;animation:halo 2.4s ease-in-out infinite}
  @keyframes halo{50%{transform:scale(1.25);opacity:.5}}`;

function saas() {
  const kpis = [["MRR", "$48k", C.rose], ["Users", "12.4k", C.violet], ["Uptime", "99.9%", C.green]];
  const bars = [60, 84, 70, 104, 92, 120, 136].map((h, i) => `<rect x="${140 + i * 34}" y="${270 - h}" width="22" height="${h}" rx="5" fill="url(#brv)" class="rise" ${d(0.2 + i * 0.08)}/>`).join("");
  return `
  <rect x="20" y="20" width="520" height="280" rx="14" fill="${D}" stroke="${P3}"/>
  <path d="M20 34a14 14 0 0 1 14-14h76v280H34a14 14 0 0 1-14-14z" fill="#10132A"/>
  <circle cx="44" cy="46" r="10" fill="url(#br)"/>
  ${[0, 1, 2, 3, 4].map((i) => `<rect x="36" y="${78 + i * 30}" width="${i === 1 ? 60 : 50}" height="9" rx="4.5" fill="${i === 1 ? "url(#br)" : P3}"/>`).join("")}
  ${kpis.map(([k, v, c], i) => `<g class="pop" ${d(0.1 + i * 0.12)}><rect x="${126 + i * 138}" y="36" width="126" height="66" rx="11" fill="${P2}"/>
    <text x="${140 + i * 138}" y="60" class="tiny">${k}</text><text x="${140 + i * 138}" y="90" style="font:800 22px ${SANS}" fill="${c}">${v}</text></g>`).join("")}
  <rect x="126" y="116" width="264" height="168" rx="11" fill="${P2}" opacity=".6"/>
  ${bars}
  <rect x="402" y="116" width="126" height="168" rx="11" fill="${P2}" opacity=".6"/>
  <circle cx="465" cy="186" r="38" stroke="${P3}" stroke-width="12"/>
  <circle cx="465" cy="186" r="38" pathLength="1" stroke="${C.cyan}" stroke-width="12" class="draw" transform="rotate(-90 465 186)" ${d(0.4)}/>
  <text x="465" y="262" text-anchor="middle" class="tiny">conversion</text>`;
}

function backend() {
  const logs = ["GET  /api/orders   200  12ms", "POST /auth/login  201  34ms", "GET  /api/users    200   9ms", "PUT  /api/cart     200  18ms"];
  const logEls = [...logs, ...logs].map((l, i) => `<text x="40" y="${232 + i * 24}" style="font:500 14px ${MONO}" fill="${l.includes("201") ? C.cyan : C.green}">${esc(l)}</text>`).join("");
  return `
  <g transform="translate(30 50)">
    <rect width="120" height="78" rx="8" fill="${P2}" stroke="${P3}" stroke-width="2"/><rect x="10" y="10" width="100" height="52" rx="4" fill="${D}"/>
    <path d="M-12 84h144l-10 10H-2z" fill="${P3}"/><text x="60" y="44" text-anchor="middle" class="tiny">client</text>
  </g>
  <rect x="222" y="34" width="116" height="116" rx="22" fill="${C.panel2}" stroke="url(#br)" stroke-width="3"/>
  <text x="280" y="88" text-anchor="middle" style="font:800 24px ${SANS}" class="w">API</text>
  <text x="280" y="112" text-anchor="middle" class="tiny">Node · FastAPI</text>
  ${[0, 1, 2].map((i) => `<circle cx="${250 + i * 14}" cy="134" r="3.5" fill="${C.green}" class="blink" ${d(i * 0.3)}/>`).join("")}
  <g transform="translate(420 40)">
    <ellipse cx="50" cy="12" rx="50" ry="12" fill="${P3}"/><path d="M0 12v76c0 7 22 12 50 12s50-5 50-12V12" fill="${P2}" stroke="${P3}" stroke-width="2"/>
    <path d="M0 40c0 7 22 12 50 12s50-5 50-12M0 66c0 7 22 12 50 12s50-5 50-12" stroke="${P3}" stroke-width="2"/>
    <text x="50" y="128" text-anchor="middle" class="tiny">MongoDB · Redis</text>
  </g>
  <path d="M152 92 H222 M338 92 H420" stroke="${P3}" stroke-width="2" stroke-dasharray="5 5" class="flow"/>
  ${[["M152 86 H222", C.cyan, 0], ["M222 98 H152", C.green, 0.6], ["M338 86 H420", C.violet, 0.3], ["M420 98 H338", C.rose, 0.9]].map(([p, c, b]) =>
    `<circle r="5" fill="${c}"><animateMotion dur="1.2s" begin="${b}s" repeatCount="indefinite" path="${p}"/></circle>`).join("")}
  <rect x="20" y="200" width="520" height="104" rx="12" fill="${D}" stroke="${P3}"/>
  <clipPath id="logc"><rect x="20" y="210" width="520" height="86"/></clipPath>
  <g clip-path="url(#logc)"><g class="scroll">${logEls}</g></g>`;
}
const backendCss = `
  .scroll{animation:scroll 6s linear infinite}
  @keyframes scroll{to{transform:translateY(-96px)}}`;

function design() {
  const swatches = [C.rose, C.violet, C.cyan, C.gold, C.green];
  return `
  <rect x="24" y="24" width="330" height="272" rx="14" fill="#F5F3FF"/>
  <text x="40" y="50" style="font:700 12px ${MONO}" fill="#8B8FA3">Frame · Hero</text>
  <rect x="48" y="70" width="150" height="16" rx="5" fill="#1F2140" class="grow" ${d(0.1)}/>
  <rect x="48" y="94" width="110" height="10" rx="5" fill="#B9B7D6" class="grow" ${d(0.25)}/>
  <g class="pop" ${d(0.4)}><rect x="48" y="116" width="90" height="28" rx="14" fill="${C.violet}"/></g>
  <path d="M60 250 C 110 150, 170 300, 220 210 S 310 150, 330 200" pathLength="1" stroke="${C.rose}" stroke-width="5" stroke-linecap="round" class="draw" ${d(0.3)}/>
  ${[[60, 250], [220, 210], [330, 200]].map(([x, y], i) => `<rect x="${x - 6}" y="${y - 6}" width="12" height="12" fill="#fff" stroke="${C.violet}" stroke-width="2" class="pop" ${d(0.6 + i * 0.2)}/>`).join("")}
  <line x1="220" y1="210" x2="270" y2="168" stroke="${C.violet}" stroke-width="1.5" class="pop" ${d(1)}/><circle cx="270" cy="168" r="5" fill="${C.violet}" class="pop" ${d(1)}/>
  <rect x="370" y="24" width="166" height="272" rx="14" fill="${D}" stroke="${P3}"/>
  <text x="386" y="52" class="tiny">FILL</text>
  ${swatches.map((c, i) => `<circle cx="${396 + i * 29}" cy="76" r="11" fill="${c}" class="pop" ${d(0.2 + i * 0.1)}/>`).join("")}
  <text x="386" y="118" class="tiny">RADIUS</text>
  <rect x="386" y="130" width="134" height="6" rx="3" fill="${P3}"/><rect x="386" y="130" width="134" height="6" rx="3" fill="url(#br)" class="grow" ${d(0.5)}/>
  <text x="386" y="168" class="tiny">MOTION</text>
  <rect x="386" y="180" width="134" height="6" rx="3" fill="${P3}"/><rect x="386" y="180" width="96" height="6" rx="3" fill="url(#br)" class="grow" ${d(0.7)}/>
  <text x="386" y="220" class="tiny">LAYERS</text>
  ${[0, 1, 2].map((i) => `<rect x="386" y="${232 + i * 20}" width="${120 - i * 24}" height="9" rx="4.5" fill="${P3}"/>`).join("")}
  <g class="c1"><path d="M0 0 L0 20 L6 15 L10 24 L14 22 L10 13 L17 13 Z" fill="${C.rose}"/><rect x="14" y="20" width="62" height="22" rx="6" fill="${C.rose}"/><text x="45" y="36" text-anchor="middle" style="font:700 12px ${SANS}" class="w">Joylan</text></g>
  <g class="c2"><path d="M0 0 L0 20 L6 15 L10 24 L14 22 L10 13 L17 13 Z" fill="${C.cyan}"/><rect x="14" y="20" width="58" height="22" rx="6" fill="${C.cyan}"/><text x="43" y="36" text-anchor="middle" style="font:700 12px ${SANS}" fill="${D}">Client</text></g>`;
}
const designCss = `
  .c1{animation:c1 6s ease-in-out infinite}
  @keyframes c1{0%{transform:translate(70px,240px)}33%{transform:translate(215px,205px)}66%{transform:translate(320px,190px)}100%{transform:translate(70px,240px)}}
  .c2{animation:c2 7s ease-in-out infinite}
  @keyframes c2{0%{transform:translate(400px,60px)}40%{transform:translate(150px,120px)}75%{transform:translate(440px,170px)}100%{transform:translate(400px,60px)}}`;

/* ---------------------------------------------------------------- cards */
const SERVICES = [
  ["web", "Websites & Landing Pages", ["Fast, SEO-ready, beautifully animated sites", "that turn visitors into customers."], ["Next.js", "React", "SEO", "Animations"], web, webCss],
  ["apps", "Mobile Apps", ["Cross-platform iOS & Android apps with", "smooth native feel, built in Flutter."], ["Flutter", "Dart", "Firebase", "Play / App Store"], apps, appsCss],
  ["ai", "AI Agents & Automation", ["LLM assistants, chatbots and workflow", "automation that save your team hours."], ["LLMs", "RAG", "Tool calling", "Python"], ai, aiCss],
  ["saas", "SaaS & Web Apps", ["Full-stack products with auth, dashboards,", "payments-ready APIs and admin panels."], ["React", "Node.js", "MongoDB", "Stripe-ready"], saas, ""],
  ["backend", "Backend & APIs", ["Secure, documented REST APIs that scale,", "deployed with Docker on the cloud."], ["Node", "FastAPI", "Redis", "Docker"], backend, backendCss],
  ["design", "UI / UX Design", ["Figma-first interfaces and design systems", "with motion that feels premium."], ["Figma", "Design systems", "Prototypes", "Motion"], design, designCss],
];

function services() {
  SERVICES.forEach(([slug, title, desc, chips, art, css], i) => {
    const W = 1600, H = 400, flip = i % 2 === 1;
    const f = frame(W, H, { id: "s" });
    const bx = flip ? 70 : W - 630, tx = flip ? 700 : 90;
    let cx = tx;
    const chipEls = chips.map((t) => {
      const w = t.length * 14 + 40, el = `<rect x="${cx}" y="300" width="${w}" height="44" rx="22" fill="rgba(255,255,255,.05)" stroke="rgba(255,255,255,.12)"/><text x="${cx + w / 2}" y="328" text-anchor="middle" class="chip">${esc(t)}</text>`;
      cx += w + 12;
      return el;
    }).join("");
    const body = `
<defs>${f.defs}${brandGradient("br")}
  <linearGradient id="brv" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${C.violet}"/><stop offset="1" stop-color="${C.rose}"/></linearGradient>
  <linearGradient id="img" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.violet}"/><stop offset="1" stop-color="${C.cyan}"/></linearGradient>
  <radialGradient id="sg" cx="${flip ? ".2" : ".8"}" cy=".5" r=".5"><stop offset="0" stop-color="${C.violet}" stop-opacity=".28"/><stop offset="1" stop-color="${C.violet}" stop-opacity="0"/></radialGradient>
  <clipPath id="art"><rect width="560" height="320" rx="20"/></clipPath>
</defs>
<style>${LOOP}${css}
  .k{font:600 22px ${MONO};letter-spacing:5px;fill:${C.muted}}
  .t{font:800 64px ${SANS};letter-spacing:-2px;fill:${C.text}}
  .dsc{font:500 30px ${SANS};fill:${C.muted}}
  .chip{font:600 19px ${MONO};fill:${C.text}}
  .num{font:800 200px ${SANS};fill:none;stroke:rgba(255,255,255,.05);stroke-width:2}
  ${REDUCED}
</style>
<g clip-path="url(#sClip)">
  ${f.bg}
  <rect width="${W}" height="${H}" fill="url(#sg)"/>
  <text x="${flip ? W - 40 : 640}" y="${H - 30}" text-anchor="end" class="num">0${i + 1}</text>
  <text x="${tx}" y="92" class="k"><tspan fill="${C.rose}">SERVICE 0${i + 1}</tspan>  ·  I BUILD</text>
  <text x="${tx - 4}" y="166" class="t">${esc(title)}</text>
  ${desc.map((l, k) => `<text x="${tx}" y="${218 + k * 40}" class="dsc">${esc(l)}</text>`).join("")}
  ${chipEls}
  <g transform="translate(${bx} 40)">
    <g clip-path="url(#art)"><rect width="560" height="320" fill="${C.panel2}"/>${art()}</g>
    <rect x=".75" y=".75" width="558.5" height="318.5" rx="19.5" stroke="rgba(255,255,255,.1)" stroke-width="1.5"/>
  </g>
</g>
${f.edge}`;
    write(`service-${slug}.svg`, svg(W, H + 28, body, `${title} — ${desc.join(" ")}`));
  });
}

/* ------------------------------------------------------------- workflow */
function workflow() {
  const W = 1600, H = 680;
  const f = frame(W, H, { id: "w" });
  const steps = [
    ["Discover", "Goals, users & scope", "M-14 -14a20 20 0 1 0 28 28 20 20 0 0 0-28-28zM14 14l18 18"],
    ["Design", "Wireframes → Figma UI", "M0 -26 18 6 0 26-18 6zM0 -26v52M-18 6h36"],
    ["Build", "Clean, typed, tested code", "M-12 -16 -28 0l16 16M12 -16 28 0 12 16M6 -24-6 24"],
    ["Test", "CI, QA & performance", "M0 -26 24 -16v14c0 16-10 26-24 30-14-4-24-14-24-30v-14zM-10 2l7 7 14-14"],
    ["Launch", "Vercel · Hostinger · Stores", "M0 -28c12 8 16 22 12 38H-12c-4-16 0-30 12-38zM-12 10l-10 12h10M12 10l10 12H12M0 -8a5 5 0 1 0 .1 0"],
    ["Grow", "Analytics & iterations", "M-26 20-6 0 6 10 26-14M12 -14h14v14"],
  ];
  const pos = [[300, 210], [800, 210], [1300, 210], [1300, 490], [800, 490], [300, 490]];
  const route = "M300 210 H1300 C1470 210 1470 490 1300 490 H300";
  const DUR = 9;
  const nodes = steps.map(([t, sub, icon], i) => {
    const [x, y] = pos[i];
    return `<g>
      <circle cx="${x}" cy="${y}" r="62" fill="${C.panel2}" stroke="rgba(255,255,255,.1)" stroke-width="2"/>
      <circle cx="${x}" cy="${y}" r="62" stroke="url(#wB)" stroke-width="4" class="act" style="animation-delay:${((i * DUR) / 6).toFixed(2)}s"/>
      <path d="${icon}" transform="translate(${x} ${y})" stroke="${C.text}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="${x}" y="${y - 82}" text-anchor="middle" class="n">0${i + 1}</text>
      <text x="${x}" y="${y + 108}" text-anchor="middle" class="t">${esc(t)}</text>
      <text x="${x}" y="${y + 144}" text-anchor="middle" class="s">${esc(sub)}</text>
    </g>`;
  }).join("");
  const body = `
<defs>${f.defs}${brandGradient("wB")}
  <linearGradient id="wR" gradientUnits="userSpaceOnUse" x1="300" x2="1460" y1="0" y2="0"><stop offset="0" stop-color="${C.rose}"/><stop offset=".5" stop-color="${C.violet}"/><stop offset="1" stop-color="${C.cyan}"/></linearGradient>
  <filter id="wG" x="-300%" y="-300%" width="700%" height="700%"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>
<style>
  .k{font:600 22px ${MONO};letter-spacing:5px;fill:${C.muted}}
  .n{font:700 20px ${MONO};letter-spacing:3px;fill:${C.rose}}
  .t{font:800 40px ${SANS};letter-spacing:-1px;fill:${C.text}}
  .s{font:500 25px ${SANS};fill:${C.muted}}
  .act{opacity:0;animation:act ${DUR}s ease-in-out infinite}
  @keyframes act{0%{opacity:0}4%,14%{opacity:1}22%,100%{opacity:0}}
  .fl{stroke-dasharray:14 12;animation:fl 1.2s linear infinite}
  @keyframes fl{to{stroke-dashoffset:-26}}
  ${REDUCED}
</style>
<g clip-path="url(#wClip)">
  ${f.bg}
  <text x="60" y="70" class="k">THE WORKFLOW · IDEA → LAUNCH</text>
  <text x="${W - 60}" y="70" text-anchor="end" class="k">~2–6 WEEKS</text>
  <path d="${route}" stroke="rgba(255,255,255,.08)" stroke-width="10" stroke-linecap="round"/>
  <path d="${route}" stroke="url(#wR)" stroke-width="3" class="fl" opacity=".9"/>
  ${nodes}
  <circle r="9" fill="#fff" filter="url(#wG)"><animateMotion dur="${DUR}s" repeatCount="indefinite" path="${route}" keyPoints="0;1" keyTimes="0;1" calcMode="linear"/></circle>
</g>
${f.edge}`;
  write("workflow.svg", svg(W, H, body, "My workflow: Discover, Design, Build, Test, Launch, Grow"));
}

/* ------------------------------------------------------------- terminal */
function terminal() {
  const W = 1600, H = 640;
  const f = frame(W, H, { id: "t" });
  const g = (t) => `<tspan fill="${C.green}">${t}</tspan>`, m = (t) => `<tspan fill="${C.muted}">${esc(t)}</tspan>`;
  const lines = [
    [`<tspan fill="${C.rose}">❯</tspan> npx hire-joylan --idea ${`<tspan fill="${C.gold}">"your next big thing"</tspan>`}`, 46],
    [`${g("◆")} Understanding your goals ${m("............")} ${g("done")}`, 46],
    [`${g("◆")} Designing the UI in Figma ${m("...........")} ${g("done")}`, 46],
    [`${g("◆")} Building web + mobile + AI ${m("..........")} ${g("done")}`, 46],
    [`${g("◆")} Deploying to Vercel / Hostinger ${m(".....")} ${g("done")}`, 46],
    [`<tspan fill="${C.cyan}">✔ Live in production.</tspan> Client happiness: <tspan fill="${C.rose}">100%</tspan>`, 47],
  ];
  const X = 70, Y0 = 170, LH = 62, CW = 18.1;
  let t = 0.5;
  const text = [], covers = [];
  lines.forEach(([html, len], i) => {
    const y = Y0 + i * LH, dur = i === 0 ? len * 0.045 : 0.5;
    text.push(`<text x="${X}" y="${y}" class="c">${html}</text>`);
    covers.push(`<rect x="${X}" y="${y - 40}" width="${Math.ceil(len * CW) + 40}" height="${LH}" fill="${C.panel}" class="cv" style="animation-duration:${dur.toFixed(2)}s;animation-delay:${t.toFixed(2)}s;animation-timing-function:${i === 0 ? `steps(${len})` : "ease-out"}"/>`);
    t += dur + (i === 0 ? 0.4 : 0.55);
  });
  const end = t;
  const r = rng(11);
  const colors = [C.rose, C.violet, C.cyan, C.gold, C.green, "#fff"];
  const confetti = Array.from({ length: 70 }, (_, i) => {
    const a = r() * Math.PI * 2, dist = 120 + r() * 260;
    const dx = Math.cos(a) * dist, dy = Math.sin(a) * dist * 0.7 - 60;
    const c = colors[i % colors.length], rot = Math.round(r() * 720 - 360);
    const shape = i % 3 ? `<rect x="-5" y="-9" width="10" height="18" rx="2" fill="${c}"/>` : `<circle r="6" fill="${c}"/>`;
    return `<g transform="translate(1250 300)"><g class="cf" style="--dx:${dx.toFixed(0)}px;--dy:${dy.toFixed(0)}px;--r:${rot}deg;animation-delay:${end.toFixed(2)}s">${shape}</g></g>`;
  }).join("");
  const body = `
<defs>${f.defs}${brandGradient("tB")}
  <radialGradient id="tg" cx=".8" cy=".45" r=".45"><stop offset="0" stop-color="${C.violet}" stop-opacity=".3"/><stop offset="1" stop-color="${C.violet}" stop-opacity="0"/></radialGradient>
</defs>
<style>
  .c{font:500 31px ${MONO};fill:${C.text};white-space:pre}
  .cv{transform-box:fill-box;transform-origin:right;animation-name:type;animation-fill-mode:both}
  @keyframes type{from{transform:scaleX(1)}to{transform:scaleX(0)}}
  .caret{opacity:0;animation:blink 1s steps(1) infinite}
  @keyframes blink{0%,49%{opacity:1}50%,100%{opacity:0}}
  .cf{opacity:0;animation:cf 2.6s cubic-bezier(.1,.7,.3,1) forwards}
  @keyframes cf{0%{opacity:1;transform:translate(0,0) rotate(0)}70%{opacity:1}100%{opacity:0;transform:translate(var(--dx),calc(var(--dy) + 160px)) rotate(var(--r))}}
  .badge{opacity:0;transform-box:fill-box;transform-origin:center;animation:badge .9s cubic-bezier(.3,1.6,.5,1) forwards;animation-delay:${end.toFixed(2)}s}
  @keyframes badge{from{opacity:0;transform:scale(.3)}to{opacity:1;transform:scale(1)}}
  .float{animation:float 4s ease-in-out infinite}
  @keyframes float{50%{transform:translateY(-12px)}}
  .tab{font:600 22px ${MONO};fill:${C.muted}}
  .b1{font:800 64px ${SANS};fill:url(#tB)}
  .b2{font:600 22px ${MONO};letter-spacing:4px;fill:${C.muted}}
  ${REDUCED}
</style>
<g clip-path="url(#tClip)">
  ${f.bg}
  <rect width="${W}" height="${H}" fill="url(#tg)"/>
  <rect width="${W}" height="76" fill="${C.panel2}"/>
  <circle cx="44" cy="38" r="10" fill="#FF5F57"/><circle cx="78" cy="38" r="10" fill="#FEBC2E"/><circle cx="112" cy="38" r="10" fill="#28C840"/>
  <text x="${W / 2}" y="46" text-anchor="middle" class="tab">joylan@studio: ~/your-project — zsh</text>
  ${text.join("\n  ")}
  ${covers.join("\n  ")}
  <rect x="${X}" y="${Y0 + lines.length * LH - 34}" width="18" height="38" fill="${C.rose}" class="caret" style="animation-delay:${end.toFixed(2)}s"/>
  ${confetti}
  <g class="badge"><g class="float">
    <circle cx="1250" cy="300" r="120" fill="${C.panel2}" stroke="url(#tB)" stroke-width="4"/>
    <text x="1250" y="300" text-anchor="middle" class="b1">Hired!</text>
    <text x="1250" y="342" text-anchor="middle" class="b2">PROJECT LAUNCHED</text>
  </g></g>
</g>
${f.edge}`;
  write("terminal.svg", svg(W, H, body, "npx hire-joylan: understanding goals, designing, building, deploying — live in production"));
}

/* --------------------------------------------------------------- banner */
function hire() {
  const W = 1600, H = 380;
  const r = rng(5);
  const sparks = Array.from({ length: 40 }, () => `<circle cx="${(r() * W).toFixed(0)}" cy="${(r() * H).toFixed(0)}" r="${(1 + r() * 2).toFixed(1)}" fill="#fff" class="sp" style="animation-delay:-${(r() * 4).toFixed(1)}s"/>`).join("");
  const body = `
<defs>
  <linearGradient id="hg" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${W}" y2="${H}">
    <stop offset="0" stop-color="${C.rose}"/><stop offset=".5" stop-color="${C.violet}"/><stop offset="1" stop-color="${C.cyan}"/>
    <animateTransform attributeName="gradientTransform" type="rotate" values="0 800 190;20 800 190;0 800 190" dur="10s" repeatCount="indefinite"/>
  </linearGradient>
  <clipPath id="hc"><rect width="${W}" height="${H}" rx="32"/></clipPath>
  <linearGradient id="sh" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".45"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
</defs>
<style>
  .t{font:800 76px ${SANS};letter-spacing:-2.5px;fill:#fff}
  .s{font:500 30px ${SANS};fill:#fff;opacity:.9}
  .b{font:800 30px ${SANS};fill:${C.bg}}
  .sp{animation:sp 4s ease-in-out infinite}
  @keyframes sp{0%,100%{opacity:.1}50%{opacity:.9}}
  .shine{animation:shine 3.5s ease-in-out infinite}
  @keyframes shine{0%{transform:translateX(-200px)}55%,100%{transform:translateX(560px)}}
  .btn{transform-box:fill-box;transform-origin:center;animation:btn 2.4s ease-in-out infinite}
  @keyframes btn{50%{transform:scale(1.04)}}
  ${REDUCED}
</style>
<g clip-path="url(#hc)">
  <rect width="${W}" height="${H}" fill="url(#hg)"/>
  <rect width="${W}" height="${H}" fill="${C.bg}" opacity=".35"/>
  ${sparks}
  <circle cx="1460" cy="40" r="180" fill="#fff" opacity=".07"/><circle cx="120" cy="360" r="140" fill="#fff" opacity=".06"/>
  <text x="800" y="138" text-anchor="middle" class="t">Got an idea? Let's ship it.</text>
  <text x="800" y="196" text-anchor="middle" class="s">Websites · Mobile apps · AI agents · SaaS — from first sketch to launch.</text>
  <g class="btn">
    <rect x="560" y="240" width="480" height="84" rx="42" fill="#fff"/>
    <g clip-path="url(#hb)"><rect x="560" y="240" width="140" height="84" fill="url(#sh)" class="shine"/></g>
    <text x="780" y="293" text-anchor="middle" class="b">Start a project</text>
    <path d="M920 282 H956 M940 266 L957 282 L940 298" stroke="${C.bg}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <clipPath id="hb"><rect x="560" y="240" width="480" height="84" rx="42"/></clipPath>
</g>
<rect x="1.5" y="1.5" width="${W - 3}" height="${H - 3}" rx="30.5" stroke="#fff" stroke-opacity=".25" stroke-width="3"/>`;
  write("hire-banner.svg", svg(W, H, body, "Got an idea? Let's ship it. Start a project with Joylan"));
}

export function buildServices() {
  services(); workflow(); terminal(); hire();
}
