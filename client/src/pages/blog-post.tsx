import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation, Link } from "wouter";
import { Loader2, Calendar, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import Header from "@/components/header";
import { useTheme } from "@/contexts/theme-context";
import type { BlogPost as BlogPostType } from "@shared/schema";

const SITE_URL = "https://what-the-wine.vercel.app";

// Remove any <h1>...</h1> from the body so the page has exactly one H1 (the title)
function stripH1(html: string): string {
  return html.replace(/<h1\b[^>]*>[\s\S]*?<\/h1>/gi, "");
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [location, setLocation] = useLocation();
  const { colors: c } = useTheme();
  const BG = c.isDark ? "#120810" : "#FAF5EC";

  const { data, isLoading, error } = useQuery<{ post: BlogPostType }>({
    queryKey: ["/api/blog", slug],
    queryFn: async () => {
      const res = await fetch(`/api/blog/${slug}`);
      if (!res.ok) throw new Error("Blog post not found");
      return res.json();
    },
    enabled: !!slug,
  });

  const post = data?.post;

  useEffect(() => {
    if (!post) return;

    document.title = `${post.title} | What the Wine Blog`;

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", post.metaDescription);
    }

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${SITE_URL}${location}`);

    const setOg = (property: string, content: string) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("property", property);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    };

    setOg("og:title", post.title);
    setOg("og:description", post.metaDescription);
    setOg("og:type", "article");
    setOg("og:url", `${SITE_URL}${location}`);
    if (post.thumbnail) {
      setOg("og:image", `${SITE_URL}${post.thumbnail}`);
    }

    const existingSchema = document.querySelector("script[data-blog-schema]");
    if (existingSchema) existingSchema.remove();

    const articleSchema = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: post.title,
      description: post.metaDescription,
      image: post.thumbnail ? `${SITE_URL}${post.thumbnail}` : undefined,
      datePublished: post.publishedAt,
      dateModified: post.publishedAt,
      author: {
        "@type": "Organization",
        name: "What the Wine",
        url: SITE_URL,
      },
      publisher: {
        "@type": "Organization",
        name: "What the Wine",
        url: SITE_URL,
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `${SITE_URL}${location}`,
      },
    };

    const schemaScript = document.createElement("script");
    schemaScript.type = "application/ld+json";
    schemaScript.setAttribute("data-blog-schema", "true");
    schemaScript.textContent = JSON.stringify(articleSchema);
    document.head.appendChild(schemaScript);

    return () => {
      const schemaToRemove = document.querySelector("script[data-blog-schema]");
      if (schemaToRemove) schemaToRemove.remove();
    };
  }, [post, location]);

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ background: BG }}>
        <Header onScrollTo={() => setLocation("/")} />
        <div className="pt-20 flex justify-center items-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: c.gold }} />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen" style={{ background: BG }}>
        <Header onScrollTo={() => setLocation("/")} />
        <div className="pt-20 flex flex-col justify-center items-center min-h-[60vh] gap-4">
          <h1 className="font-playfair text-2xl font-bold" style={{ color: c.textPrimary }}>
            Blog Post Not Found
          </h1>
          <Link href="/blog" className="text-sm hover:underline" style={{ color: c.gold }}>
            ← Back to The Cellar
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: BG }}>
      <Header onScrollTo={() => setLocation("/")} />

      <article className="pt-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm transition-colors mb-8"
            style={{ color: c.textSubtle }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to The Cellar
          </Link>

          {post.thumbnail && (
            <div
              className="w-full mb-8 overflow-hidden"
              style={{ border: `1px solid ${c.goldBorder}` }}
            >
              <img
                src={post.thumbnail}
                alt={post.title}
                className="w-full h-auto object-cover max-h-[420px]"
              />
            </div>
          )}

          <header className="mb-8">
            <div
              className="flex items-center gap-2 text-sm mb-4"
              style={{ color: c.gold }}
            >
              <Calendar className="w-4 h-4" />
              <time dateTime={String(post.publishedAt)}>
                {format(new Date(post.publishedAt), "MMMM d, yyyy")}
              </time>
            </div>
            <h1
              className="font-playfair text-3xl md:text-5xl font-bold leading-tight"
              style={{ color: c.textPrimary }}
            >
              {post.title}
            </h1>
          </header>

          <div
            className={`prose prose-lg max-w-none wtw-prose ${c.isDark ? "prose-invert" : ""}`}
            dangerouslySetInnerHTML={{ __html: stripH1(post.content) }}
          />
        </div>
      </article>

      {/* Readable prose that respects the active theme */}
      <style>{`
        .wtw-prose {
          color: ${c.textMuted};
        }
        .wtw-prose h2,
        .wtw-prose h3,
        .wtw-prose h4 {
          color: ${c.textPrimary};
          font-family: 'Playfair Display', serif;
        }
        .wtw-prose strong { color: ${c.textPrimary}; }
        .wtw-prose a {
          color: ${c.gold};
          text-decoration: underline;
        }
        .wtw-prose a:hover { color: ${c.goldBright}; }
        .wtw-prose blockquote {
          color: ${c.textMuted};
          border-left-color: ${c.gold};
        }
        .wtw-prose ul > li::marker,
        .wtw-prose ol > li::marker { color: ${c.gold}; }
      `}</style>
    </div>
  );
}
