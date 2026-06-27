import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Loader2, Calendar, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import Header from "@/components/header";
import { useTheme } from "@/contexts/theme-context";
import type { BlogPost } from "@shared/schema";

export default function Blog() {
  const [, setLocation] = useLocation();
  const { colors: c } = useTheme();
  const BG = c.isDark ? "#120810" : "#FAF5EC";

  const { data, isLoading, error } = useQuery<{ posts: BlogPost[] }>({
    queryKey: ["/api/blog"],
    queryFn: async () => {
      const res = await fetch("/api/blog");
      if (!res.ok) throw new Error("Failed to load blog posts");
      return res.json();
    },
  });

  const posts = data?.posts ?? [];

  useEffect(() => {
    document.title = "The Cellar | What the Wine Blog";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Wine guides, tasting notes, pairing tips, and stories from What the Wine — discover your next favorite bottle."
      );
    }
  }, []);

  return (
    <div className="min-h-screen" style={{ background: BG }}>
      <Header onScrollTo={() => setLocation("/")} />

      <main className="pt-16">
        {/* Hero */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10 text-center">
          <p
            className="text-xs uppercase tracking-[0.3em] mb-4"
            style={{ color: c.gold }}
          >
            What the Wine
          </p>
          <h1
            className="font-playfair text-4xl md:text-6xl font-bold"
            style={{ color: c.textPrimary }}
          >
            The Cellar
          </h1>
          <p
            className="mt-4 max-w-2xl mx-auto text-sm md:text-base"
            style={{ color: c.textSubtle }}
          >
            Tasting notes, pairing guides, and stories for the curious palate.
          </p>
        </section>

        {/* Content */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[40vh]">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: c.gold }} />
            </div>
          ) : error ? (
            <p className="text-center" style={{ color: c.textSubtle }}>
              Unable to load posts right now. Please check back soon.
            </p>
          ) : posts.length === 0 ? (
            <p className="text-center" style={{ color: c.textSubtle }}>
              No posts yet. Our first pour is on the way.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col overflow-hidden transition-transform duration-200 hover:-translate-y-1"
                  style={{
                    background: c.isDark ? "#1a0e18" : "#FFFFFF",
                    border: `1px solid ${c.goldBorder}`,
                  }}
                >
                  {post.thumbnail && (
                    <div className="w-full overflow-hidden" style={{ aspectRatio: "16 / 9" }}>
                      <img
                        src={post.thumbnail}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="flex flex-col flex-1 p-6">
                    <div
                      className="flex items-center gap-2 text-xs mb-3"
                      style={{ color: c.gold }}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <time dateTime={String(post.publishedAt)}>
                        {format(new Date(post.publishedAt), "MMMM d, yyyy")}
                      </time>
                    </div>
                    <h2
                      className="font-playfair text-xl font-semibold leading-snug mb-3"
                      style={{ color: c.textPrimary }}
                    >
                      {post.title}
                    </h2>
                    <p
                      className="text-sm leading-relaxed flex-1"
                      style={{ color: c.textMuted }}
                    >
                      {post.excerpt}
                    </p>
                    <span
                      className="inline-flex items-center gap-1.5 mt-5 text-xs uppercase tracking-widest font-medium"
                      style={{ color: c.gold }}
                    >
                      Read More
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
