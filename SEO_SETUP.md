# What the Wine — SEO Setup Guide

## Overview
This document covers foundational SEO and AIO (AI Optimization) configuration for the What the Wine platform.  
The app is positioned as **the wine app for both humans and AI agents**.

---

## Technical SEO

### URLs
- All routes are lowercase, hyphen-separated, semantically meaningful
- SPA routes: `/`, `/help`, `/contact`, `/privacy`, `/terms`, `/dashboard`
- Dashboard is `noindex` (private, behind auth)
- No duplicate routes or parameter-only primary pages

### robots.txt
- **Location**: `client/public/robots.txt` (Vite copies to `dist/public/`)
- Allows all crawlers including known AI bots (GPTBot, Claude-Web, PerplexityBot, anthropic-ai)
- Blocks: `/dashboard`, `/api/`
- Points to sitemap: `https://what-the-wine.vercel.app/sitemap.xml`

### sitemap.xml
- **Served by**: Express at `/sitemap.xml` (`server/routes.ts`)
- Includes: `/`, `/help`, `/contact`, `/privacy`, `/terms`
- Dynamic `lastmod` date on indexable pages
- Excludes: `/dashboard` (private)
- Cache-Control: `public, max-age=3600`

### Canonical Tags
- Set in `client/index.html` (default: homepage)
- Overridden per-page via `useSEO` hook (canonical prop)
- All canonical URLs use `https://what-the-wine.vercel.app`

### HTTPS
- Enforced by Vercel (all HTTP → HTTPS redirect)
- `secure: true` on auth cookies in production

---

## On-Page SEO

### Per-Page Metadata (useSEO hook)
Location: `client/src/hooks/useSEO.ts`

Use the hook in any page component:
```tsx
import { useSEO } from "@/hooks/useSEO";

useSEO({
  title: "Page Title",           // becomes "Page Title | What the Wine"
  description: "...",
  canonical: "/path",
  noindex: false,               // set true for private pages
  structuredData: { ... },      // JSON-LD object(s)
});
```

### Page Metadata Reference
| Page        | Title                                             | Description summary                          |
|-------------|---------------------------------------------------|----------------------------------------------|
| `/`         | AI Wine Recommendations for Every Occasion        | Full homepage pitch, free to start           |
| `/help`     | Help Center — Wine Recommendations & App Support  | FAQs, how the app works                      |
| `/contact`  | Contact Us — Get Support for What the Wine        | Support form, 24hr response time             |
| `/privacy`  | Privacy Policy                                    | How we handle data                           |
| `/terms`    | Terms of Service                                  | Usage rules, age requirement                 |
| `/dashboard`| My Dashboard (noindex)                           | Private user area — excluded from crawling  |

### Heading Hierarchy
**Homepage**
- `h1` — Hero headline (1 per page ✓)
- `h2` — "Why Choose What The Wine?", CTA section, "Stay in the Know"
- `h3` — Feature cards, newsletter subsections
- `h4`/`h5` — Footer brand name, footer section labels

**Help Center**: `h1` already correct (Help Center)  
**Contact/Privacy/Terms**: semantic headings rendered from data arrays

---

## Structured Data (JSON-LD)

### Global (index.html)
- **WebSite** — platform name, URL
- **Organization** — company info, contact URL
- **SoftwareApplication** — app type, pricing tiers, feature list

### Help Center page
- **FAQPage** — 5 key Q&As (injected via `useSEO({ structuredData: faqSchema })`)

### Validation
Test at: https://search.google.com/test/rich-results  
Paste the page URL or any JSON-LD block to verify schema.

---

## AI Optimization (AIO)

### llms.txt
- **Location**: `client/public/llms.txt` (served at `/llms.txt`)
- Machine-readable platform description for AI agents
- Covers: capabilities, API endpoints, data schemas, pricing, contact
- AI agents can read this to understand how to interact with What the Wine programmatically

### Meta signals for AI crawlers
In `index.html`:
```html
<link rel="ai-instructions" href="/llms.txt" type="text/plain" />
<meta name="ai-content-type" content="interactive-application" />
<meta name="ai-capabilities" content="wine-recommendations, bottle-scanning, wine-library, community-discovery, food-pairing" />
```

### robots.txt AI directives
All major AI crawlers are explicitly allowed:
- GPTBot (OpenAI)
- Claude-Web / anthropic-ai (Anthropic)
- PerplexityBot
- ChatGPT-User
- Applebot

---

## Analytics

### Google Analytics 4
- **Property ID**: `G-QQV6YL3FJ7` (already active in `index.html`)
- **GTM Container**: `GTM-PDCNGPD9` (also active)
- Configured with `send_page_view: true`

### GA4 Event Tracking
Use the `trackEvent` helper from `useSEO.ts`:
```tsx
import { trackEvent } from "@/hooks/useSEO";

// On form submit:
trackEvent("contact_form_submit");

// On sign-up:
trackEvent("sign_up", { method: "email" });

// On recommendation request:
trackEvent("wine_recommendation_requested", { wine_type: "red" });
```

Key events already available to add:
- `sign_up` — Register
- `login` — Login  
- `wine_recommendation_requested` — Recommendation form submit
- `bottle_scan` — Bottle scan initiated
- `premium_upgrade_click` — Upgrade CTA clicked
- `contact_form_submit` — Contact form submitted

### Google Search Console Setup
1. Go to https://search.google.com/search-console/
2. Add property: `https://what-the-wine.vercel.app`
3. Choose "URL prefix" method
4. Get your verification token
5. Replace `REPLACE_WITH_GSC_TOKEN` in `client/index.html`:
   ```html
   <meta name="google-site-verification" content="YOUR_TOKEN_HERE" />
   ```
6. Deploy, then verify in GSC
7. Submit sitemap: `https://what-the-wine.vercel.app/sitemap.xml`

---

## Image SEO

### Hero Image (homepage)
- Descriptive `alt` text: "Guests raising wine glasses at an elegant dinner party"
- `width` and `height` attributes set (1920×1080) — prevents CLS
- `fetchPriority="high"` — browser prioritizes loading
- `loading` default is "eager" for above-fold

### Logo Images
- `alt="What the Wine"` on all logo instances

### Below-fold Images (to implement)
Add `loading="lazy"` to all images not in the first viewport.

---

## Vercel Deployment Notes
- HTTPS enforced automatically by Vercel
- `vercel.json` rewrites SPA routes to `index.html` while preserving `/api` routing
- `robots.txt`, `llms.txt`, `sitemap.xml` all served correctly
- All env vars required: `DATABASE_URL`, `SESSION_SECRET`, `OPENAI_API_KEY`, `STRIPE_SECRET_KEY`
