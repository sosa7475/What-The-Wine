// Build-time per-route SEO prerender.
// The app is a Vite SPA: Vercel rewrites every route to /index.html, so without
// this step every page (/for-agents, /blog, /help, ...) inherits the homepage
// <title>, description and canonical — Google then treats them as duplicates of
// the homepage and won't index them individually.
//
// This emits a static HTML shell per route with a unique <title>, meta
// description, canonical and OG/Twitter tags baked into the RAW served HTML
// (crawlable — not injected client-side). The body/script tags are copied
// verbatim from the built index.html, so the SPA boots and wouter renders the
// correct page from the URL exactly as before. vercel.json points each route at
// its own .html file; /blog/:slug and unknown routes still fall through to the
// catch-all index.html.

import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const BASE = "https://www.whatthewine.com";
const distDir = join(dirname(fileURLToPath(import.meta.url)), "..", "dist", "public");
const tpl = readFileSync(join(distDir, "index.html"), "utf8");

// Escape ampersands so titles/descriptions stay valid HTML attribute/text values.
const esc = (s) => s.replace(/&/g, "&amp;");

const routes = [
  {
    file: "for-agents.html",
    path: "/for-agents",
    title: "Wine API for AI Agents — What the Wine",
    desc: "Integrate AI wine recommendations into your product. A REST API for agents: bottle scanning, food pairing and personalized wine picks with simple endpoints and transparent pricing.",
  },
  {
    file: "blog.html",
    path: "/blog",
    title: "Wine Guides & Pairing Tips — What the Wine Blog",
    desc: "Expert wine guides, food-pairing tips and tasting notes from What the Wine. Learn what to pour for any occasion, dish or budget.",
  },
  {
    file: "help.html",
    path: "/help",
    title: "Help Center — What the Wine",
    desc: "Answers about AI wine recommendations, bottle scanning, your personal wine library and Premium. Get the most out of What the Wine.",
  },
  {
    file: "contact.html",
    path: "/contact",
    title: "Contact Us — What the Wine",
    desc: "Questions, feedback or partnership ideas? Get in touch with the What the Wine team.",
  },
  {
    file: "privacy.html",
    path: "/privacy",
    title: "Privacy Policy — What the Wine",
    desc: "How What the Wine collects, uses and protects your data. Read our privacy commitments.",
  },
  {
    file: "terms.html",
    path: "/terms",
    title: "Terms of Service — What the Wine",
    desc: "The terms governing your use of What the Wine's AI wine recommendation platform.",
  },
];

let count = 0;
for (const r of routes) {
  const url = BASE + r.path;
  const title = esc(r.title);
  const desc = esc(r.desc);
  let html = tpl;

  const before = html;
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`);
  html = html.replace(/(<meta name="description" content=")[^"]*(")/, `$1${desc}$2`);
  html = html.replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`);
  html = html.replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`);
  html = html.replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${title}$2`);
  html = html.replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${desc}$2`);
  html = html.replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${title}$2`);
  html = html.replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${desc}$2`);

  if (html === before) {
    throw new Error(`prerender-seo: no head tags replaced for ${r.path} — template markers changed`);
  }

  writeFileSync(join(distDir, r.file), html);
  count++;
  console.log(`prerendered ${r.file}  ->  "${r.title}"`);
}
console.log(`prerender-seo: wrote ${count} route shells to dist/public`);
