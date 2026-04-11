# What the Wine — Advanced SEO & AIO Guide

## Architecture Summary

| Layer             | Implementation                                | Status    |
|-------------------|-----------------------------------------------|-----------|
| URL structure     | Clean SPA routes via wouter                   | ✅ Done   |
| robots.txt        | `client/public/robots.txt`                   | ✅ Done   |
| sitemap.xml       | Express route `/sitemap.xml`                 | ✅ Done   |
| Canonical tags    | Per-page via `useSEO` hook                   | ✅ Done   |
| Meta tags         | `useSEO` hook, all pages covered             | ✅ Done   |
| Open Graph        | `index.html` + `useSEO` per-page            | ✅ Done   |
| Structured data   | WebSite, Organization, SoftwareApp, FAQPage  | ✅ Done   |
| H1 hierarchy      | Fixed across all pages                        | ✅ Done   |
| Hero image perf   | `fetchPriority`, `width/height`, alt text    | ✅ Done   |
| Dashboard noindex | `noindex, nofollow` via `useSEO`             | ✅ Done   |
| llms.txt (AIO)    | `client/public/llms.txt`                     | ✅ Done   |
| AI meta signals   | `<link rel="ai-instructions">` in HTML       | ✅ Done   |
| GA4               | Already installed (`G-QQV6YL3FJ7`)           | ✅ Done   |
| GSC               | Token placeholder in `index.html`             | ⚙️ Config |
| SSR/Prerendering  | SPA only — see roadmap below                  | 🔜 Future |

---

## Core Web Vitals

### LCP (Largest Contentful Paint)
**Current**: Hero image is above-fold; loaded with `fetchPriority="high"` and explicit dimensions.

**To improve further**:
1. Serve hero image from a CDN (Cloudflare Images, Vercel's Image Optimization)
2. Add `<link rel="preload" as="image" href="HERO_URL" />` to `index.html` if using a static image
3. Self-host the hero image in `client/public/` to eliminate third-party DNS lookup (currently Unsplash)

### CLS (Cumulative Layout Shift)
**Current**: Hero image has explicit `width="1920" height="1080"` — prevents layout shift.

**To improve further**:
- Set explicit dimensions on all images (check scanner, library, community hub components)
- Ensure fonts don't cause FOUT: use `font-display: swap` in any custom `@font-face` rules
- Check dashboard tabs for layout shift on load

### FID / INP (Interaction to Next Paint)
**To improve**:
- Defer non-critical analytics scripts (already using `async` on GA4)
- Code-split heavy components (WineRecommendations, WineScanner) with `React.lazy()`:
  ```tsx
  const WineScanner = React.lazy(() => import("@/components/wine-scanner"));
  ```
- Reduce bundle size — currently 617KB JS. Target: split into ≤200KB chunks

### Lighthouse Testing
1. Open Chrome DevTools → Lighthouse tab
2. Run on: `https://what-the-wine.vercel.app/`
3. Target scores: Performance >80, SEO >95, Accessibility >90, Best Practices >90
4. Re-run after each optimization batch

---

## SSR / Prerendering Roadmap

The app is currently a client-side SPA. Google can execute JavaScript, but prerendering improves:
- Time to first meaningful paint
- Crawl efficiency
- Social media preview accuracy

### Option A: Vite SSR (recommended for this stack)
Convert to Vite SSR mode:
- `vite build --ssr` for server-side rendering
- Express serves SSR-rendered HTML
- Requires refactoring `server/vercel-entry.ts` to serve HTML from `renderToString()`

### Option B: Static Prerendering
Use `vite-plugin-ssr` or `@vitejs/plugin-prerender` for static HTML snapshots:
- Pre-render `/`, `/help`, `/contact`, `/privacy`, `/terms` at build time
- Vite outputs static HTML files — zero runtime cost
- Dashboard stays client-side only (dynamic/auth-protected)

### Option C: Next.js Migration
For maximum SEO power, migrate to Next.js with:
- `getStaticProps` for public pages
- `getServerSideProps` for dynamic/auth routes

---

## Content & Keyword Architecture

### Page → Intent Mapping

| Page      | Primary Intent               | Target Keyword Theme                              |
|-----------|------------------------------|---------------------------------------------------|
| `/`       | Discovery / conversion       | "AI wine recommendations", "wine app for hosts"   |
| `/help`   | Informational / support      | "how to get wine recommendations", "wine app FAQ" |
| `/contact`| Support / trust              | "contact wine app", "wine support"                |
| `/privacy`| Legal / trust                | "wine app privacy policy"                        |
| `/terms`  | Legal / trust                | "wine app terms of service"                      |

### Content Opportunities (not yet built)
1. **Blog** (`/blog`, `/blog/[slug]`) — High-value evergreen content:
   - "Best Wines for Dinner Parties"
   - "How to Use AI to Pick Wine for Any Occasion"
   - "Red vs. White: A Host's Guide"
   
2. **Wine Guides** (`/guides/[topic]`) — Static educational pages:
   - `/guides/wine-pairing` — Food & wine pairing basics
   - `/guides/wine-regions` — Major wine regions guide
   - `/guides/wine-types` — Red, white, rosé, sparkling explained

3. **Agent Directory** (`/for-agents`) — Dedicated AIO landing page:
   - Document API capabilities
   - Explain how AI agents can use the wine recommendation API
   - Link to `llms.txt`

### Title & Meta Templates

**Homepage**: `[Core Value Prop] | What the Wine`  
**Feature pages**: `[Feature Name] — [Benefit] | What the Wine`  
**Blog posts**: `[Post Title] | What the Wine Blog`  
**Guide pages**: `[Topic] Guide — [Benefit] | What the Wine`

### H1 Template by Page Type
- Homepage: Pain-point + solution statement (current: "Want to Impress Your Guests...")
- Blog post: Exact target keyword or question ("Best Wines for a Summer Dinner Party")
- Guide: Descriptive + benefit ("The Complete Wine Pairing Guide for Home Hosts")
- FAQ/Help: Topic + context ("Help Center — Wine Recommendations & App Support")

---

## Schema Additions (Future)

### Review Schema (when real reviews are displayed)
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Wine Name",
  "review": {
    "@type": "Review",
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": "4.5",
      "bestRating": "5"
    },
    "author": { "@type": "Person", "name": "Username" },
    "reviewBody": "Review text..."
  }
}
```
Add this to wine detail pages when individual wine pages are built.

### BreadcrumbList (for future multi-level pages)
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://what-the-wine.vercel.app/" },
    { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://what-the-wine.vercel.app/blog" },
    { "@type": "ListItem", "position": 3, "name": "Article Title", "item": "https://what-the-wine.vercel.app/blog/article-slug" }
  ]
}
```

---

## GA4 Conversion Events

Add these `trackEvent` calls to instrument key actions:

```tsx
// auth-dialog.tsx — after successful login
trackEvent("login", { method: "email" });

// auth-dialog.tsx — after successful register  
trackEvent("sign_up", { method: "email" });

// wine-recommendations component — on form submit
trackEvent("wine_recommendation_requested", {
  wine_type: formData.wineType,
  budget: formData.budget,
  occasion: formData.occasion,
});

// payment-dialog.tsx — on upgrade click
trackEvent("begin_checkout", { currency: "USD", value: 3.99 });

// payment-dialog.tsx — on successful payment
trackEvent("purchase", {
  transaction_id: sessionId,
  currency: "USD",
  value: 3.99,
});

// wine-scanner.tsx — on scan initiated
trackEvent("bottle_scan_initiated");

// contact.tsx — on form submit
trackEvent("contact_form_submit");
```

---

## Advanced Image Pipeline

### Current State
- Hero: Unsplash CDN, explicit dimensions, `fetchPriority="high"`
- Logo: Local PNG via Vite asset pipeline

### Recommended Upgrades

1. **Convert images to WebP/AVIF**
   - Use Vite's built-in asset handling or `vite-plugin-imagemin`
   - Replace PNG logo with WebP version for ~30% size reduction

2. **Vercel Image Optimization**
   - Wrap images with `/_vercel/image?url=...&w=...&q=...` for on-demand optimization
   - Or use the `<Image>` component pattern from Next.js if migrating

3. **Lazy load below-fold images**
   ```tsx
   <img src="..." alt="..." loading="lazy" width="..." height="..." />
   ```
   Apply to: community hub cards, library thumbnails, testimonial images

---

## Internal Linking Strategy

### Current
- Header nav → `/`, `/help`, `/contact`, `/privacy`, `/terms`
- Footer → all main pages

### To Add
- Hero CTA → `#recommendations` anchor (already done)
- Help Center → link to Contact page ("Still need help?")
- Privacy/Terms → cross-link each other
- Blog posts (future) → link to homepage recommendation tool
- Each FAQ answer → relevant feature section on homepage

---

## Search Console Error Monitoring

1. In GSC → Coverage → check for:
   - Crawl errors (404s, 500s)
   - Soft 404s (pages returning 200 but with no content)
   - Redirect chains

2. In GSC → Core Web Vitals → monitor LCP, CLS, FID trends

3. In GSC → Links → verify internal link equity flows to key pages

4. After adding structured data, check GSC → Enhancements:
   - FAQPage (from help page schema)
   - Review snippets (future)

### Common Issues to Watch
- `noindex` accidentally left on public pages after dev work
- Canonical pointing to wrong URL after route changes
- Sitemap not updated when new routes are added → update `server/routes.ts`

---

## Ongoing Maintenance Checklist

When adding a new page:
- [ ] Add `useSEO({ title, description, canonical })` to the component
- [ ] Add the route to the sitemap array in `server/routes.ts`
- [ ] Verify one `h1` per page, logical `h2`/`h3` hierarchy
- [ ] Add internal links from relevant existing pages
- [ ] Add the URL to `client/public/robots.txt` if it should be blocked

When updating content:
- [ ] Refresh `lastmod` in sitemap (auto-updates with `new Date()`)
- [ ] Update `description` in `useSEO` if page content changes significantly

When adding new images:
- [ ] Add meaningful `alt` text
- [ ] Set explicit `width` and `height`
- [ ] Use `loading="lazy"` for below-fold, `fetchPriority="high"` for hero
