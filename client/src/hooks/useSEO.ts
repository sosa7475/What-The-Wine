import { useEffect } from "react";

interface SEOOptions {
  title?: string;
  description?: string;
  /** Path only, e.g. "/help". Defaults to current pathname. */
  canonical?: string;
  noindex?: boolean;
  ogType?: string;
  ogImage?: string;
  /** JSON-LD schema objects to inject for this page */
  structuredData?: object | object[];
}

const SITE_NAME = "What the Wine";
const BASE_URL = "https://what-the-wine.vercel.app";
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.jpg`;

function upsertMeta(selector: string, attr: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    const [a, v] = selector.replace("[", "").replace("]", "").split("=");
    el.setAttribute(a.trim(), v.replace(/"/g, "").trim());
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

function upsertStructuredData(id: string, data: object | object[]) {
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement("script");
    el.id = id;
    el.type = "application/ld+json";
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(Array.isArray(data) ? data : [data], null, 0);
}

/**
 * Dynamically update page metadata for SEO and social sharing.
 * Call once per page component.
 */
export function useSEO({
  title,
  description,
  canonical,
  noindex = false,
  ogType = "website",
  ogImage = DEFAULT_OG_IMAGE,
  structuredData,
}: SEOOptions = {}) {
  useEffect(() => {
    const fullTitle = title
      ? `${title} | ${SITE_NAME}`
      : `${SITE_NAME} — AI Wine Recommendations for Hosts, Humans & Agents`;

    const canonicalUrl = `${BASE_URL}${canonical ?? window.location.pathname}`;

    // Title
    document.title = fullTitle;

    // Primary meta
    upsertMeta('meta[name="description"]', "content", description ?? "");
    upsertMeta('meta[name="robots"]', "content", noindex ? "noindex, nofollow" : "index, follow");

    // Canonical
    upsertLink("canonical", canonicalUrl);

    // Open Graph
    upsertMeta('meta[property="og:title"]', "content", fullTitle);
    upsertMeta('meta[property="og:description"]', "content", description ?? "");
    upsertMeta('meta[property="og:url"]', "content", canonicalUrl);
    upsertMeta('meta[property="og:type"]', "content", ogType);
    upsertMeta('meta[property="og:image"]', "content", ogImage);

    // Twitter
    upsertMeta('meta[name="twitter:title"]', "content", fullTitle);
    upsertMeta('meta[name="twitter:description"]', "content", description ?? "");
    upsertMeta('meta[name="twitter:image"]', "content", ogImage);

    // Page-level structured data
    if (structuredData) {
      upsertStructuredData("page-ld-json", structuredData);
    } else {
      document.getElementById("page-ld-json")?.remove();
    }
  }, [title, description, canonical, noindex, ogType, ogImage, structuredData]);
}

/** Track a GA4 event */
export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", name, params ?? {});
  }
}
