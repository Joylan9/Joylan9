// Generates live, self-hosted stat cards from public GitHub data.
// Usage: node scripts/build-stats.mjs [outDir=dist] [README.md]
//   GITHUB_TOKEN  optional, raises API rate limits
//   PROFILE_TOKEN optional fine-grained PAT (read-only "Metadata" on all repos) -> private repos count
//                 toward repo totals and languages. Private repo names are never rendered.
import { writeFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { C, SANS, MONO, esc, brandGradient, frame, svg } from "./theme.mjs";

const USER = process.env.PROFILE_USER || "Joylan9";
const OUT = process.argv[2] || "dist";
const CACHE = process.env.STATS_CACHE; // local dev: reuse fetched data
const REDUCED = `@media (prefers-reduced-motion: reduce){*{animation:none!important}}`;

const MAX_PROJECTS = 6;
// Hand-written copy for known repos (keyed by owner/repo, lowercase). Any other pinned repo
// is described automatically from its GitHub description, topics and languages.
const CURATED = {
  "joylan9/genai-agent-sprint": { title: "TraceAI", tagline: "Enterprise AI agent control plane", diagram: true,
    desc: ["Plan → execute → synthesize agents with full run tracing,", "5-gate guardrails, RBAC and Prometheus metrics."],
    tags: ["Python", "FastAPI", "React 19", "MongoDB", "Redis", "Docker"] },
  "joylan9/plumber-booking-portal": { title: "FlowMatch", tagline: "On-demand plumber booking platform",
    desc: ["MERN marketplace with JWT roles, OTP resets and a", "cinematic GSAP + Framer Motion interface."],
    tags: ["React 19", "Node.js", "MongoDB", "GSAP"] },
  "joylan9/portfolio": { title: "3D Portfolio", tagline: "Immersive scroll-driven WebGL experience",
    desc: ["A Next.js portfolio rendered in real-time 3D with", "React Three Fiber and GSAP scroll choreography."],
    tags: ["Next.js", "Three.js", "R3F", "GSAP"], live: "https://portfolio-l3xs.vercel.app/" },
  "joylan9/verinews": { title: "VeriNews", tagline: "AI claim detection for news",
    desc: ["Extracts and checks factual claims in articles with", "spaCy NLP behind a rate-limited FastAPI backend."],
    tags: ["Python", "FastAPI", "spaCy", "React"] },
  "joylan9/vectorshift_company": { title: "VectorShift Pipelines", tagline: "Drag-and-drop AI pipeline builder",
    desc: ["ReactFlow canvas with a reusable node abstraction,", "Zustand state and a FastAPI DAG validator."],
    tags: ["React", "ReactFlow", "Zustand", "FastAPI"] },
};
// Pinned repos always come first (in pin order); these fill the remaining slots.
const FILLERS = ["genai-agent-sprint", "Plumber-booking-portal", "Portfolio", "VeriNews", "VectorShift_Company"];

const LANG_COLORS = {
  TypeScript: "#3178C6", JavaScript: "#F1E05A", Python: "#3572A5", Java: "#B07219", Dart: "#00B4AB",
  CSS: "#663399", HTML: "#E34C26", SCSS: "#C6538C", Go: "#00ADD8", Rust: "#DEA584", "C#": "#178600",
  PHP: "#4F5D95", Vue: "#41B883", Kotlin: "#A97BFF", Swift: "#F05138", "Jupyter Notebook": "#DA5B0B",
};
// Build/scaffold/vendored languages that would misrepresent what is actually written by hand.
const NOISE = new Set(["Roff", "Meson", "Batchfile", "PowerShell", "CMake", "Makefile", "Dockerfile", "Shell",
  "Cython", "Fortran", "Cuda", "Go Template", "Jinja", "Lua", "C", "C++", "Objective-C", "Swift", "Kotlin", "Procfile"]);

/* ---------------------------------------------------------------- data */
const headers = { "User-Agent": `${USER}-profile-stats`, Accept: "application/vnd.github+json" };
const TOKEN = process.env.PROFILE_TOKEN || process.env.GITHUB_TOKEN;
if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;

async function get(url, json = true) {
  for (let i = 0; i < 3; i++) {
    const r = await fetch(url, { headers: json ? headers : { "User-Agent": headers["User-Agent"] } });
    if (r.ok) return json ? r.json() : r.text();
    if (i === 2) throw new Error(`${r.status} ${url}`);
    await new Promise((res) => setTimeout(res, 1500 * (i + 1)));
  }
}

// The public contributions page includes private contributions when the user opted in.
async function calendar(from, to) {
  const q = from ? `?from=${from}&to=${to}` : "";
  const html = await get(`https://github.com/users/${USER}/contributions${q}`, false);
  const counts = {};
  for (const m of html.matchAll(/<tool-tip[^>]*for="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g)) {
    const n = m[2].match(/^(\d[\d,]*) contribution/);
    counts[m[1]] = n ? Number(n[1].replace(/,/g, "")) : 0;
  }
  const days = [];
  for (const m of html.matchAll(/<td[^>]*ContributionCalendar-day[^>]*>/g)) {
    const date = m[0].match(/data-date="([^"]+)"/)?.[1], id = m[0].match(/id="([^"]+)"/)?.[1];
    if (date) days.push({ date, count: counts[id] ?? 0 });
  }
  if (!days.length) throw new Error("Could not parse contribution calendar");
  return days.sort((a, b) => a.date.localeCompare(b.date));
}

// Pinned repos, read from the public profile page (no token needed). Empty on failure -> fillers only.
async function pinnedRepos() {
  try {
    const html = await get(`https://github.com/${USER}`, false);
    const out = [...html.matchAll(/pinned-item-list-item[\s\S]*?href="\/([^"\/]+\/[^"\/]+)"/g)].map((m) => m[1]);
    return [...new Set(out)].filter((f) => f.toLowerCase() !== `${USER}/${USER}`.toLowerCase());
  } catch (e) {
    console.warn(`pinned lookup failed: ${e.message}`);
    return [];
  }
}

async function fetchData() {
  if (CACHE && existsSync(CACHE)) return JSON.parse(readFileSync(CACHE, "utf8"));
  const user = await get(`https://api.github.com/users/${USER}`);
  // With a personal token, /user/repos also returns private repos; otherwise public only.
  const list = process.env.PROFILE_TOKEN
    ? (p) => `https://api.github.com/user/repos?per_page=100&page=${p}&affiliation=owner&visibility=all`
    : (p) => `https://api.github.com/users/${USER}/repos?per_page=100&page=${p}&type=owner`;
  const repos = [];
  for (let p = 1; ; p++) {
    const page = await get(list(p));
    repos.push(...page.filter((r) => !r.fork));
    if (page.length < 100) break;
  }
  for (const r of repos) r.languages = await get(r.languages_url);
  const prs = (await get(`https://api.github.com/search/issues?q=author:${USER}+type:pr&per_page=1`)).total_count;
  const issues = (await get(`https://api.github.com/search/issues?q=author:${USER}+type:issue&per_page=1`)).total_count;
  const lastYear = await calendar();
  const allDays = [];
  const start = new Date(user.created_at).getUTCFullYear(), now = new Date().getUTCFullYear();
  for (let y = start; y <= now; y++) allDays.push(...(await calendar(`${y}-01-01`, `${y}-12-31`)));
  const pins = await pinnedRepos();
  const wanted = [...pins, ...FILLERS.map((r) => `${USER}/${r}`)];
  const projects = [], seen = new Set();
  for (const full of wanted) {
    if (projects.length >= MAX_PROJECTS || seen.has(full.toLowerCase())) continue;
    seen.add(full.toLowerCase());
    let r = repos.find((x) => !x.private && x.full_name.toLowerCase() === full.toLowerCase());
    if (!r) {
      r = await get(`https://api.github.com/repos/${full}`).catch(() => null);
      if (!r) continue; // private, renamed or deleted
      r.languages = await get(r.languages_url);
    }
    projects.push({ repo: r, pinned: pins.includes(full) });
  }
  const data = { user, repos, prs, issues, lastYear, allDays, projects, generated: new Date().toISOString() };
  if (CACHE) writeFileSync(CACHE, JSON.stringify(data));
  return data;
}

/* --------------------------------------------------------------- stats */
function compute({ user, repos, prs, issues, lastYear, allDays, generated }) {
  const today = generated.slice(0, 10);
  const days = [...new Map(allDays.map((d) => [d.date, d])).values()].filter((d) => d.date <= today).sort((a, b) => a.date.localeCompare(b.date));
  let longest = 0, run = 0;
  for (const d of days) { run = d.count > 0 ? run + 1 : 0; longest = Math.max(longest, run); }
  let i = days.length - 1, current = 0;
  if (i >= 0 && days[i].count === 0) i--; // today not counted yet doesn't break the streak
  for (; i >= 0 && days[i].count > 0; i--) current++;
  const langTotals = {};
  for (const r of repos) {
    const entries = Object.entries(r.languages || {}).filter(([l]) => !NOISE.has(l));
    const sum = entries.reduce((a, [, b]) => a + b, 0);
    for (const [l, b] of entries) langTotals[l] = (langTotals[l] || 0) + b / sum;
  }
  const langSum = Object.values(langTotals).reduce((a, b) => a + b, 0) || 1;
  const langs = Object.entries(langTotals).map(([name, v]) => ({ name, pct: (v / langSum) * 100 }))
    .sort((a, b) => b.pct - a.pct);
  const ly = lastYear.filter((d) => d.date <= today);
  return {
    lastYear: ly, yearTotal: ly.reduce((a, d) => a + d.count, 0),
    allTime: days.reduce((a, d) => a + d.count, 0), current, longest,
    bestDay: Math.max(0, ...ly.map((d) => d.count)),
    activeDays: ly.filter((d) => d.count > 0).length,
    stars: repos.reduce((a, r) => a + r.stargazers_count, 0),
    forks: repos.reduce((a, r) => a + r.forks_count, 0),
    repoCount: repos.length, privateCount: repos.filter((r) => r.private).length, followers: user.followers, prs, issues,
    since: new Date(user.created_at).getUTCFullYear(),
    langs, repos, generated,
  };
}

const fmt = (n) => Number(n).toLocaleString("en-US");
const ago = (iso, now) => {
  const d = Math.max(0, Math.round((new Date(now) - new Date(iso)) / 864e5));
  return d === 0 ? "today" : d === 1 ? "yesterday" : d < 30 ? `${d}d ago` : d < 365 ? `${Math.round(d / 30)}mo ago` : `${Math.round(d / 365)}y ago`;
};
// Weekly buckets (Sunday-start columns, like GitHub's grid).
function weeks(days) {
  const out = [];
  for (const d of days) {
    const dow = new Date(d.date + "T00:00:00Z").getUTCDay();
    if (!out.length || dow === 0) out.push([]);
    out[out.length - 1][dow] = d;
  }
  return out;
}
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/* -------------------------------------------------------------- render */
const ICONS = {
  // 24x24 line icons, drawn with stroke
  bolt: "M13 2 4 14h7l-1 8 9-12h-7z",
  flame: "M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-6 0 2 1 3 2 3 0-4 0-6 1-9z",
  trophy: "M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4",
  pr: "M6 3v12M6 15a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM6 3a3 3 0 1 0 0 6M18 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 15V8a3 3 0 0 0-3-3h-4m2-2-2 2 2 2",
  star: "m12 2 3 6.5 7 .8-5.2 4.8 1.4 7L12 17.6 5.8 21l1.4-7L2 9.3l7-.8z",
  repo: "M4 19V5a2 2 0 0 1 2-2h13v15H6a2 2 0 0 0-2 2 2 2 0 0 0 2 2h13M8 7h7",
  calendar: "M4 5h16v16H4zM4 10h16M9 3v4M15 3v4",
};

const pair = ([k, v]) => `${k} <tspan fill="${C.text}" font-weight="700">${fmt(v)}</tspan>`;
function subLines(s) {
  const items = [["Best day", s.bestDay], ["Followers", s.followers], ["Stars", s.stars], ["Forks", s.forks], ["Issues", s.issues]]
    .filter(([, v]) => v > 0);
  return [items.slice(0, 3), items.slice(3)].filter((l) => l.length)
    .map((l, i) => `<text x="60" y="${304 + i * 48}" class="sub">${l.map(pair).join("  ·  ")}</text>`).join("");
}

function overview(s) {
  const W = 1600, H = 660;
  const f = frame(W, H, { id: "o" });
  const tiles = [
    s.current >= 2 ? ["flame", fmt(s.current), "CURRENT STREAK", "days", C.rose] : ["flame", fmt(s.bestDay), "BEST DAY", "contributions", C.rose],
    ["trophy", fmt(s.longest), "LONGEST STREAK", "days", C.gold],
    ["bolt", fmt(s.allTime), "ALL-TIME", `since ${s.since}`, C.violet],
    ["pr", fmt(s.prs), "PULL REQUESTS", "opened", C.cyan],
    ["calendar", fmt(s.activeDays), "ACTIVE DAYS", "last 12 months", C.green],
    ["repo", fmt(s.repoCount), "REPOSITORIES", s.privateCount ? `${fmt(s.repoCount - s.privateCount)} public · ${fmt(s.privateCount)} private` : s.stars ? `${fmt(s.stars)} ★ earned` : "public & original", C.rose],
  ];
  const TX = 680, TW = 270, TH = 158, TG = 22;
  const tileEls = tiles.map(([ic, val, label, sub, col], i) => {
    const x = TX + (i % 3) * (TW + TG), y = 56 + Math.floor(i / 3) * (TH + TG);
    return `<g class="in" style="animation-delay:${(0.25 + i * 0.08).toFixed(2)}s">
      <rect x="${x}" y="${y}" width="${TW}" height="${TH}" rx="20" fill="${C.panel2}" stroke="rgba(255,255,255,.07)"/>
      <rect x="${x}" y="${y + 24}" width="4" height="40" rx="2" fill="${col}"/>
      <path d="${ICONS[ic]}" transform="translate(${x + TW - 50} ${y + 22}) scale(1.15)" stroke="${col}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/>
      <text x="${x + 26}" y="${y + 60}" class="tl">${label}</text>
      <text x="${x + 24}" y="${y + 118}" class="tv">${val}</text>
      <text x="${x + 26}" y="${y + 144}" class="ts">${esc(sub)}</text>
    </g>`;
  }).join("");

  // sparkline of weekly totals
  const wk = weeks(s.lastYear).map((w) => w.reduce((a, d) => a + (d ? d.count : 0), 0));
  const max = Math.max(1, ...wk), X0 = 60, X1 = W - 60, Y0 = 600, Y1 = 440;
  const pts = wk.map((v, i) => [X0 + (i / (wk.length - 1)) * (X1 - X0), Y0 - (v / max) * (Y0 - Y1)]);
  const line = pts.map(([x, y], i) => {
    if (!i) return `M${x.toFixed(1)} ${y.toFixed(1)}`;
    const [px, py] = pts[i - 1], cx = (px + x) / 2;
    return `C${cx.toFixed(1)} ${py.toFixed(1)} ${cx.toFixed(1)} ${y.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");
  const peak = pts[wk.indexOf(max)];
  const updated = new Date(s.generated).toUTCString().slice(5, 16);

  const body = `
<defs>${f.defs}${brandGradient("oB")}
  <linearGradient id="oArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.violet}" stop-opacity=".45"/><stop offset="1" stop-color="${C.violet}" stop-opacity="0"/></linearGradient>
  <linearGradient id="oLine" gradientUnits="userSpaceOnUse" x1="${X0}" x2="${X1}" y1="0" y2="0"><stop offset="0" stop-color="${C.rose}"/><stop offset=".5" stop-color="${C.violet}"/><stop offset="1" stop-color="${C.cyan}"/></linearGradient>
  <radialGradient id="oGlow" cx=".2" cy=".3" r=".5"><stop offset="0" stop-color="${C.rose}" stop-opacity=".22"/><stop offset="1" stop-color="${C.rose}" stop-opacity="0"/></radialGradient>
  <filter id="oG" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="6"/></filter>
</defs>
<style>
  .in{opacity:0;animation:in .8s cubic-bezier(.2,.8,.2,1) forwards}
  @keyframes in{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
  .k{font:600 22px ${MONO};letter-spacing:5px;fill:${C.muted}}
  .big{font:800 150px ${SANS};letter-spacing:-6px;fill:url(#oB)}
  .sub{font:500 28px ${SANS};fill:${C.muted}}
  .tl{font:600 18px ${MONO};letter-spacing:3px;fill:${C.muted}}
  .tv{font:800 54px ${SANS};letter-spacing:-1.5px;fill:${C.text}}
  .ts{font:500 20px ${SANS};fill:${C.dim}}
  .draw{stroke-dasharray:1;stroke-dashoffset:1;animation:draw 2.4s .6s cubic-bezier(.6,0,.2,1) forwards}
  @keyframes draw{to{stroke-dashoffset:0}}
  .area{opacity:0;animation:fadein 1.2s 1.6s forwards}
  @keyframes fadein{to{opacity:1}}
  .ping{transform-box:fill-box;transform-origin:center;animation:ping 2s ease-out infinite}
  @keyframes ping{from{transform:scale(1);opacity:.9}to{transform:scale(4);opacity:0}}
  .ax{font:500 18px ${MONO};fill:${C.dim}}
  ${REDUCED}
</style>
<g clip-path="url(#oClip)">
  ${f.bg}
  <rect width="${W}" height="${H}" fill="url(#oGlow)"/>
  <g class="in">
    <text x="60" y="96" class="k">CONTRIBUTIONS · LAST 12 MONTHS</text>
    <text x="52" y="248" class="big">${fmt(s.yearTotal)}</text>
    ${subLines(s)}
  </g>
  ${tileEls}
  <line x1="${X0}" y1="${Y0}" x2="${X1}" y2="${Y0}" stroke="rgba(255,255,255,.08)" stroke-width="2"/>
  <path d="${line} L${X1} ${Y0} L${X0} ${Y0} Z" fill="url(#oArea)" class="area"/>
  <path d="${line}" pathLength="1" stroke="url(#oLine)" stroke-width="4" stroke-linecap="round" class="draw"/>
  <circle cx="${peak[0].toFixed(1)}" cy="${peak[1].toFixed(1)}" r="7" fill="#fff" class="ping"/>
  <circle cx="${peak[0].toFixed(1)}" cy="${peak[1].toFixed(1)}" r="7" fill="#fff"/>
  <text x="${X0}" y="${Y0 + 34}" class="ax">12 MONTHS AGO</text>
  <text x="${W / 2}" y="${Y0 + 34}" text-anchor="middle" class="ax">WEEKLY ACTIVITY · AUTO-UPDATED ${updated.toUpperCase()}</text>
  <text x="${X1}" y="${Y0 + 34}" text-anchor="end" class="ax">THIS WEEK</text>
</g>
${f.edge}`;
  return svg(W, H, body, `${s.yearTotal} contributions in the last year; current streak ${s.current} days; longest streak ${s.longest} days`);
}

function mix(a, b, t) {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return "#" + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, "0")).join("");
}
const shade = (h, k) => mix(h, k > 0 ? "#ffffff" : "#000000", Math.abs(k));
const ramp = (t) => (t < 0.5 ? mix(C.rose, C.violet, t * 2) : mix(C.violet, C.cyan, (t - 0.5) * 2));

function skyline(s) {
  const W = 1600, H = 640;
  const f = frame(W, H, { id: "k" });
  const wk = weeks(s.lastYear);
  const max = Math.max(1, ...s.lastYear.map((d) => d.count));
  const S = 22, STEP = 26, DX = 13, DY = 9, HMAX = 230;
  const X0 = (W - (wk.length * STEP + 6 * DX)) / 2, BASE = H - 92;
  const bars = [];
  for (let d = 0; d < 7; d++) {
    const back = 6 - d;
    for (let w = 0; w < wk.length; w++) {
      const day = wk[w][d];
      if (!day) continue;
      const x = X0 + w * STEP + back * DX, base = BASE - back * DY;
      const h = day.count ? 10 + Math.sqrt(day.count / max) * HMAX : 3;
      const col = day.count ? ramp(Math.min(1, w / (wk.length - 1))) : "#1A1E36";
      const top = day.count ? shade(col, 0.35) : "#262B4A", side = shade(col, -0.45);
      const y = base - h;
      bars.push(`<g class="b" style="animation-delay:${(w * 0.022 + back * 0.05).toFixed(3)}s"><path d="M${x} ${base}V${y.toFixed(1)}l${DX} ${-DY}V${base - DY}z" transform="translate(${S} 0)" fill="${side}"/><rect x="${x}" y="${y.toFixed(1)}" width="${S}" height="${h.toFixed(1)}" fill="${col}"/><path d="M${x} ${y.toFixed(1)}h${S}l${DX} ${-DY}h${-S}z" fill="${top}"${day.count ? ` class="g" style="animation-delay:${(w * 0.06).toFixed(2)}s"` : ""}/></g>`);
    }
  }
  const months = [];
  wk.forEach((w, i) => {
    const first = w.find(Boolean);
    if (first && Number(first.date.slice(8)) <= 7 && i > 0) months.push(`<text x="${X0 + i * STEP + 6 * DX * 0}" y="${BASE + 40}" class="m">${MONTHS[Number(first.date.slice(5, 7)) - 1].toUpperCase()}</text>`);
  });
  const legend = [0, 0.25, 0.5, 0.75, 1].map((t, i) =>
    `<rect x="${W - 300 + i * 34}" y="68" width="24" height="24" rx="5" fill="${i ? ramp(t) : "#1A1E36"}"/>`).join("");
  const body = `
<defs>${f.defs}${brandGradient("kB")}
  <radialGradient id="kGlow" cx=".5" cy="1" r=".7"><stop offset="0" stop-color="${C.violet}" stop-opacity=".25"/><stop offset="1" stop-color="${C.violet}" stop-opacity="0"/></radialGradient>
</defs>
<style>
  .b{transform-box:fill-box;transform-origin:50% 100%;animation:rise 1s cubic-bezier(.2,.9,.25,1.2) both}
  @keyframes rise{from{transform:scaleY(0);opacity:0}to{transform:scaleY(1);opacity:1}}
  .g{animation:glint 6s ease-in-out infinite}
  @keyframes glint{0%,8%,100%{filter:none;opacity:1}4%{opacity:.35}}
  .k{font:600 22px ${MONO};letter-spacing:5px;fill:${C.muted}}
  .t{font:800 54px ${SANS};letter-spacing:-1.5px;fill:${C.text}}
  .m{font:600 17px ${MONO};letter-spacing:2px;fill:${C.dim}}
  .lg{font:500 18px ${MONO};fill:${C.dim}}
  ${REDUCED}
</style>
<g clip-path="url(#kClip)">
  ${f.bg}
  <rect width="${W}" height="${H}" fill="url(#kGlow)"/>
  <text x="60" y="88" class="k">CONTRIBUTION SKYLINE · 3D</text>
  <text x="58" y="152" class="t"><tspan fill="url(#kB)">${fmt(s.yearTotal)}</tspan> contributions in the last year</text>
  <text x="${W - 316}" y="86" text-anchor="end" class="lg">LESS</text>${legend}<text x="${W - 124}" y="86" class="lg">MORE</text>
  ${bars.join("")}
  ${months.join("")}
</g>
${f.edge}`;
  return svg(W, H, body, `3D contribution skyline: ${s.yearTotal} contributions in the last year`);
}

function languages(s) {
  const W = 1600, H = 560;
  const f = frame(W, H, { id: "l" });
  const top = s.langs.filter((l) => l.pct >= 1).slice(0, 8);
  const rest = 100 - top.reduce((a, l) => a + l.pct, 0);
  if (rest > 0.5) top.push({ name: "Other", pct: rest });
  const color = (n) => LANG_COLORS[n] || "#8B949E";
  const cx = 300, cy = 290, R = 170;
  let acc = 0;
  const kf = [];
  const segs = top.map((l, i) => {
    const len = Math.max(0, l.pct - 0.6);
    kf.push(`@keyframes s${i}{from{stroke-dasharray:0 100}to{stroke-dasharray:${len.toFixed(2)} ${(100 - len).toFixed(2)}}}`);
    const el = `<circle cx="${cx}" cy="${cy}" r="${R}" pathLength="100" stroke="${color(l.name)}" stroke-width="46" stroke-dashoffset="${(-acc).toFixed(2)}" style="animation:s${i} 1.2s ${(0.3 + i * 0.12).toFixed(2)}s cubic-bezier(.6,0,.2,1) both" transform="rotate(-90 ${cx} ${cy})"/>`;
    acc += l.pct;
    return el;
  }).join("");
  const rows = top.map((l, i) => {
    const per = Math.max(3, Math.ceil(top.length / 2)), col = Math.floor(i / per), row = i % per;
    const x = 620 + col * 470, y = 130 + row * (per > 4 ? 82 : 100), bw = 380;
    return `<g class="in" style="animation-delay:${(0.4 + i * 0.08).toFixed(2)}s">
      <circle cx="${x + 9}" cy="${y - 9}" r="9" fill="${color(l.name)}"/>
      <text x="${x + 32}" y="${y}" class="ln">${esc(l.name)}</text>
      <text x="${x + bw}" y="${y}" text-anchor="end" class="lp">${l.pct.toFixed(1)}%</text>
      <rect x="${x}" y="${y + 18}" width="${bw}" height="8" rx="4" fill="rgba(255,255,255,.06)"/>
      <rect x="${x}" y="${y + 18}" width="${Math.max(8, (bw * l.pct) / top[0].pct).toFixed(1)}" height="8" rx="4" fill="${color(l.name)}" class="bar" style="animation-delay:${(0.6 + i * 0.08).toFixed(2)}s"/>
    </g>`;
  }).join("");
  const body = `
<defs>${f.defs}${brandGradient("lB")}</defs>
<style>
  ${kf.join("\n  ")}
  .in{opacity:0;animation:in .7s cubic-bezier(.2,.8,.2,1) forwards}
  @keyframes in{from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:none}}
  .bar{transform-box:fill-box;transform-origin:left;animation:grow 1.1s cubic-bezier(.6,0,.2,1) both}
  @keyframes grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
  .k{font:600 22px ${MONO};letter-spacing:5px;fill:${C.muted}}
  .ln{font:600 30px ${SANS};fill:${C.text}}
  .lp{font:600 26px ${MONO};fill:${C.muted}}
  .c1{font:800 64px ${SANS};fill:${C.text};letter-spacing:-2px}
  .c2{font:600 18px ${MONO};letter-spacing:3px;fill:${C.muted}}
  .spin{transform-origin:${cx}px ${cy}px;animation:spin 30s linear infinite}
  @keyframes spin{to{transform:rotate(360deg)}}
  ${REDUCED}
</style>
<g clip-path="url(#lClip)">
  ${f.bg}
  <text x="620" y="66" class="k">LANGUAGES · WEIGHTED BY REPO</text>
  <circle cx="${cx}" cy="${cy}" r="${R}" stroke="rgba(255,255,255,.05)" stroke-width="46"/>
  ${segs}
  <circle cx="${cx}" cy="${cy}" r="${R + 44}" stroke="url(#lB)" stroke-width="2" stroke-dasharray="2 12" class="spin" opacity=".6"/>
  <text x="${cx}" y="${cy + 10}" text-anchor="middle" class="c1">${top.length - (rest > 0.5 ? 1 : 0)}</text>
  <text x="${cx}" y="${cy + 46}" text-anchor="middle" class="c2">LANGUAGES</text>
  ${rows}
</g>
${f.edge}`;
  return svg(W, H, body, `Top languages: ${top.map((l) => `${l.name} ${l.pct.toFixed(1)}%`).join(", ")}`);
}

const wrap = (text, width, maxLines) => {
  const lines = [""];
  for (const w of text.split(/\s+/).filter(Boolean)) {
    if ((lines.at(-1) + " " + w).trim().length > width) { if (lines.length === maxLines) { lines[maxLines - 1] += "…"; break; } lines.push(w); }
    else lines[lines.length - 1] = (lines.at(-1) + " " + w).trim();
  }
  return lines.filter(Boolean);
};

function describe({ repo: r, pinned }) {
  const c = CURATED[r.full_name.toLowerCase()] || {};
  const langs = Object.entries(r.languages || {}).filter(([l]) => !NOISE.has(l)).sort((a, b) => b[1] - a[1]).map(([l]) => l);
  const name = r.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const clean = (r.description || "").replace(new RegExp(`^${name}\\s*[-–—:|]\\s*`, "i"), "")
    .split(/\s*(?:Deployment|Live|Demo|Website)\s*:/i)[0].trim();
  const first = clean.split(/(?<=\.)\s/)[0].replace(/\.$/, "");
  return {
    url: r.html_url, live: c.live || r.homepage || "", pinned, diagram: !!c.diagram,
    owner: r.owner.login, collab: r.owner.login.toLowerCase() !== USER.toLowerCase(),
    title: c.title || r.name.replace(/[-_]+/g, " "),
    tagline: c.tagline || wrap(first || `${langs[0] || "Open-source"} project`, 58, 1)[0],
    desc: c.desc || wrap(clean, 56, 2),
    tags: c.tags || [...new Set([...(r.topics || []).slice(0, 3), ...langs])].slice(0, 5),
    repo: r,
  };
}

function project(p, i, s) {
  const r = p.repo;
  const featured = i === 0;
  const W = 1600, H = featured ? 520 : 340;
  const f = frame(W, H, { id: "p" });
  const lang = r.language || p.tags[0] || "Code";
  const live = p.live || r.homepage;
  const chips = []; let cxp = 80;
  for (const t of p.tags) {
    const w = t.length * 15 + 40;
    if (cxp + w > W - 80) break;
    chips.push(`<rect x="${cxp}" y="${H - 104}" width="${w}" height="46" rx="23" fill="rgba(255,255,255,.05)" stroke="rgba(255,255,255,.12)"/><text x="${cxp + w / 2}" y="${H - 73}" text-anchor="middle" class="chip">${esc(t)}</text>`);
    cxp += w + 12;
  }
  const meta = [`<tspan fill="${LANG_COLORS[lang] || C.muted}">●</tspan> ${esc(lang)}`,
    r.stargazers_count ? `★ ${fmt(r.stargazers_count)}` : "", r.forks_count ? `⑂ ${fmt(r.forks_count)}` : "",
    r.pushed_at ? `↻ ${ago(r.pushed_at, s.generated)}` : ""].filter(Boolean).join("   ");
  const ty = featured ? 190 : 150;
  // Featured card: animated agent-pipeline diagram on the right.
  const nodes = ["PLAN", "EXECUTE", "SYNTHESIZE"];
  const diagram = featured && p.diagram ? `
  <g transform="translate(940 170)">
    <path d="M95 72 V160 H505 V72" stroke="${C.violet}" stroke-opacity=".6" stroke-width="2" stroke-dasharray="4 6" class="flow"/>
    ${[0, 1].map((k) => `<path d="M${k * 205 + 190} 36 H${k * 205 + 205}" stroke="${C.muted}" stroke-width="2" stroke-dasharray="4 5" class="flow"/>`).join("")}
    <circle r="7" fill="${C.cyan}" filter="url(#pG)"><animateMotion dur="3.6s" repeatCount="indefinite" path="M95 36 H505"/></circle>
    ${nodes.map((n, k) => `<g class="node" style="animation-delay:${k * 0.9}s"><rect x="${k * 205}" y="0" width="190" height="72" rx="18" fill="${C.panel2}" stroke="url(#pB)" stroke-width="2"/><text x="${k * 205 + 95}" y="44" text-anchor="middle" class="nd">${n}</text></g>`).join("")}
    <rect x="200" y="136" width="200" height="50" rx="25" fill="${C.bg}" stroke="${C.violet}" stroke-opacity=".7"/>
    <text x="300" y="168" text-anchor="middle" class="nd" fill="${C.violet}">◉ TRACE</text>
  </g>` : "";
  const body = `
<defs>${f.defs}${brandGradient("pB")}
  <filter id="pG" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <radialGradient id="pGlow" cx="${featured ? ".85" : ".95"}" cy=".2" r=".6"><stop offset="0" stop-color="${C.violet}" stop-opacity=".3"/><stop offset="1" stop-color="${C.violet}" stop-opacity="0"/></radialGradient>
</defs>
<style>
  .in{opacity:0;animation:in .8s cubic-bezier(.2,.8,.2,1) forwards}
  @keyframes in{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
  .k{font:600 22px ${MONO};letter-spacing:5px;fill:${C.muted}}
  .t{font:800 ${featured ? 92 : 68}px ${SANS};letter-spacing:-2.5px;fill:${C.text}}
  .tg{font:600 ${featured ? 38 : 32}px ${SANS};fill:url(#pB)}
  .d{font:500 ${featured ? 30 : 26}px ${SANS};fill:${C.muted}}
  .chip{font:600 20px ${MONO};fill:${C.text}}
  .meta{font:500 24px ${MONO};fill:${C.muted};white-space:pre}
  .num{font:800 220px ${SANS};fill:none;stroke:rgba(255,255,255,.06);stroke-width:2}
  .nd{font:700 18px ${MONO};letter-spacing:2px;fill:${C.text}}
  .flow{animation:flow 1s linear infinite}
  @keyframes flow{to{stroke-dashoffset:-18}}
  .node{animation:node 2.7s ease-in-out infinite}
  @keyframes node{0%,100%{opacity:.75}15%{opacity:1}}
  .live{animation:live 2s ease-in-out infinite}
  @keyframes live{50%{opacity:.35}}
  ${REDUCED}
</style>
<g clip-path="url(#pClip)">
  ${f.bg}
  <rect width="${W}" height="${H}" fill="url(#pGlow)"/>
  ${featured && p.diagram ? "" : `<text x="${W - 40}" y="${H - 40}" text-anchor="end" class="num">0${i + 1}</text>`}
  <g class="in">
    <text x="80" y="${featured ? 84 : 74}" class="k">${featured ? "★ " : ""}${p.pinned ? "PINNED" : featured ? "FEATURED" : "PROJECT"} 0${i + 1}${p.collab ? `  ·  WITH @${esc(p.owner.toUpperCase())}` : ""}${live ? `  ·  <tspan fill="${C.green}" class="live">● LIVE</tspan>` : ""}</text>
    <text x="76" y="${ty}" class="t">${esc(p.title)}</text>
    <text x="80" y="${ty + (featured ? 56 : 48)}" class="tg">${esc(p.tagline)}</text>
    ${featured ? p.desc.map((l, k) => `<text x="80" y="${ty + 112 + k * 42}" class="d">${esc(l)}</text>`).join("") : ""}
  </g>
  <g class="in" style="animation-delay:.25s">${chips.join("")}</g>
  <text x="${W - 80}" y="${featured ? 84 : 74}" text-anchor="end" class="meta">${meta}</text>
  ${diagram}
</g>
${f.edge}`;
  return svg(W, H + 28, body, `${p.title} — ${p.tagline}. ${p.desc.join(" ")}`); // +28: gap between stacked cards
}

/* ---------------------------------------------------------------- main */
const data = await fetchData();
const s = compute(data);
mkdirSync(OUT, { recursive: true });
const out = { "overview.svg": overview(s), "skyline.svg": skyline(s), "languages.svg": languages(s) };
const projects = data.projects.map(describe);
projects.forEach((p, i) => (out[`project-${i + 1}.svg`] = project(p, i, s)));
for (const [name, content] of Object.entries(out)) {
  writeFileSync(join(OUT, name), content);
  console.log(`${OUT}/${name}  ${(content.length / 1024).toFixed(1)} KB`);
}
console.log(`year=${s.yearTotal} all=${s.allTime} streak=${s.current}/${s.longest} prs=${s.prs} langs=${s.langs.slice(0, 5).map((l) => l.name).join(",")}`);

// Keep the README's project list in sync with whatever is pinned.
const readme = process.argv[3];
if (readme) {
  const repo = process.env.GITHUB_REPOSITORY || `${USER}/${USER}`;
  const block = projects.map((p, i) => `<a href="${p.url}">\n  <img src="https://raw.githubusercontent.com/${repo}/output/project-${i + 1}.svg" width="100%" alt="${esc(p.title)} — ${esc(p.tagline)}" />\n</a>`).join("\n");
  const md = readFileSync(readme, "utf8").replace(/\r\n/g, "\n");
  const next = md.replace(/(<!-- PROJECTS:START -->)[\s\S]*?(<!-- PROJECTS:END -->)/, (_, a, b) => `${a}\n${block}\n${b}`);
  if (next === md) console.log("README projects unchanged");
  else { writeFileSync(readme, next); console.log("README projects updated"); }
}
