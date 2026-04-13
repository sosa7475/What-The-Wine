import { Button } from "@/components/ui/button";
import { Wine, Brain, Camera, Bookmark, Star, TrendingUp } from "lucide-react";
import logoPath from "@assets/cropped_1749956607943.png";
import Header from "@/components/header";
import WineRecommendations from "@/components/wine-recommendations";
import WineScanner from "@/components/wine-scanner";
import WineLibrary from "@/components/wine-library";
import Testimonials from "@/components/testimonials";
import AuthDialog from "@/components/auth-dialog";
import EmailSubscriptionForm from "@/components/email-subscription";
import { useAuth } from "@/hooks/useAuth";
import { useSEO } from "@/hooks/useSEO";

const GOLD = "#C9A84C";
const GOLD_BRIGHT = "#D4B86A";
const CHAMPAGNE = "#F5EDD6";
const CHAMPAGNE_MUTED = "#C5B59A";
const CHAMPAGNE_SUBTLE = "#7A6A5A";
const INK_950 = "#050203";
const INK_900 = "#0a0408";
const INK_800 = "#130810";
const INK_700 = "#1c0e17";
const GOLD_BORDER = "rgba(201, 168, 76, 0.15)";
const BURGUNDY_GLOW = "rgba(139, 32, 48, 0.4)";

function GoldDivider() {
  return (
    <div className="flex items-center justify-center gap-4 mb-6">
      <div className="h-px w-12" style={{ background: `linear-gradient(to right, transparent, ${GOLD})` }} />
      <div className="w-1.5 h-1.5 rounded-full" style={{ background: GOLD }} />
      <div className="h-px w-12" style={{ background: `linear-gradient(to left, transparent, ${GOLD})` }} />
    </div>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center gap-3 mb-5">
      <div className="h-px w-8" style={{ background: GOLD }} />
      <span className="uppercase tracking-[0.2em] text-[11px] font-medium" style={{ color: GOLD }}>
        {label}
      </span>
      <div className="h-px w-8" style={{ background: GOLD }} />
    </div>
  );
}

export default function Home() {
  useSEO({
    title: "AI Wine Recommendations for Every Occasion",
    description: "What the Wine uses AI to recommend the perfect wine for any occasion, food pairing, or budget. Scan labels, build your cellar, and discover wines loved by the community. Free to start.",
    canonical: "/",
  });

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const features = [
    {
      icon: <Brain className="w-7 h-7" />,
      title: "AI Sommelier",
      body: "Our AI learns your palate, the occasion, and what's on the menu — so every recommendation is one your guests will remember.",
    },
    {
      icon: <Camera className="w-7 h-7" />,
      title: "Instant Label Scan",
      body: "Point your camera at any bottle. Get tasting notes, food pairings, serving temperature, and a vintage score in seconds.",
    },
    {
      icon: <Bookmark className="w-7 h-7" />,
      title: "Your Private Cellar",
      body: "Save every bottle that impressed you. Build a personal collection of show-stopping wines, annotated your way.",
    },
  ];

  return (
    <div style={{ background: INK_900 }}>
      <Header onScrollTo={scrollToSection} />

      {/* ── HERO ── */}
      <section className="relative flex items-center justify-center" style={{ minHeight: "100vh" }}>
        {/* Background image */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080"
            alt="Guests raising wine glasses at an elegant dinner party"
            className="w-full h-full object-cover"
            width="1920"
            height="1080"
            fetchPriority="high"
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to bottom, ${INK_950}cc 0%, ${INK_950}99 40%, ${INK_900}f0 100%)`,
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-4 mb-10">
            <div className="h-px w-16" style={{ background: `linear-gradient(to right, transparent, ${GOLD})` }} />
            <span className="uppercase tracking-[0.25em] text-[11px] font-medium" style={{ color: GOLD }}>
              Wine Intelligence
            </span>
            <div className="h-px w-16" style={{ background: `linear-gradient(to left, transparent, ${GOLD})` }} />
          </div>

          <h1
            className="font-playfair font-bold leading-tight mb-8"
            style={{ color: CHAMPAGNE, fontSize: "clamp(2.5rem, 7vw, 5rem)" }}
          >
            The Art of the
            <br />
            <span style={{ color: GOLD }}>Perfect Pour</span>
          </h1>

          <p
            className="text-lg md:text-xl leading-relaxed mb-12 max-w-2xl mx-auto"
            style={{ color: CHAMPAGNE_MUTED, fontFamily: "Inter, sans-serif" }}
          >
            AI-powered wine recommendations for hosts who refuse to guess.
            Discover the perfect bottle for every occasion, every time.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => scrollToSection("recommendations")}
              className="px-10 py-6 text-base font-medium rounded-none transition-all duration-300"
              style={{
                border: `1px solid ${GOLD}`,
                color: GOLD,
                background: "transparent",
                letterSpacing: "0.05em",
              }}
            >
              Discover Your Wine
            </Button>
            <AuthDialog defaultMode="register">
              <Button
                className="px-10 py-6 text-base font-semibold rounded-none transition-all duration-300"
                style={{
                  background: GOLD,
                  color: INK_950,
                  letterSpacing: "0.05em",
                }}
              >
                Start Free →
              </Button>
            </AuthDialog>
          </div>

          <div
            className="mt-16 flex flex-wrap items-center justify-center gap-8 text-xs uppercase tracking-widest"
            style={{ color: CHAMPAGNE_SUBTLE }}
          >
            <span>Free to start</span>
            <span style={{ color: GOLD }}>·</span>
            <span>AI-powered</span>
            <span style={{ color: GOLD }}>·</span>
            <span>No sommelier required</span>
          </div>
        </div>

        {/* Scroll cue */}
        <div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          style={{ color: CHAMPAGNE_SUBTLE }}
        >
          <span className="text-xs uppercase tracking-widest">Explore</span>
          <div className="w-px h-12 animate-pulse" style={{ background: `linear-gradient(to bottom, ${GOLD}, transparent)` }} />
        </div>
      </section>

      {/* ── HOOK ── */}
      <section className="py-28" style={{ background: INK_800 }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <GoldDivider />
          <blockquote
            className="font-playfair text-2xl md:text-3xl leading-relaxed italic mb-10"
            style={{ color: CHAMPAGNE }}
          >
            "Will this go with the salmon? Is it too sweet for dinner? Do they even like red?"
          </blockquote>
          <p className="text-base leading-relaxed mb-6" style={{ color: CHAMPAGNE_MUTED }}>
            You've spent hours on the meal. The table is set. The guests are arriving. And then — the wine question.
          </p>
          <p className="text-lg font-semibold" style={{ color: CHAMPAGNE }}>
            That moment of hesitation ends here.
          </p>
        </div>
      </section>

      {/* ── RECOMMENDATIONS ── */}
      <section className="py-28" style={{ background: INK_900 }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <SectionLabel label="Step One" />
            <h2 className="font-playfair text-4xl md:text-5xl font-bold mb-5" style={{ color: CHAMPAGNE }}>
              Tell Us Your Occasion
            </h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: CHAMPAGNE_MUTED }}>
              Our AI crafts personalised recommendations from your taste, budget, and the moment.
            </p>
          </div>
          <div
            className="overflow-hidden rounded-sm"
            style={{ border: `1px solid ${GOLD_BORDER}`, background: INK_700 }}
          >
            <div id="recommendations">
              <WineRecommendations />
            </div>
          </div>
        </div>
      </section>

      {/* ── SCANNER ── */}
      <section className="py-28" style={{ background: INK_800 }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <SectionLabel label="Step Two" />
            <h2 className="font-playfair text-4xl md:text-5xl font-bold mb-5" style={{ color: CHAMPAGNE }}>
              Scan Any Bottle
            </h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: CHAMPAGNE_MUTED }}>
              Point, shoot, impress. Instant tasting notes, expert pairings, and a vintage score in seconds.
            </p>
          </div>
          <div
            className="overflow-hidden rounded-sm"
            style={{ border: `1px solid ${GOLD_BORDER}`, background: INK_700 }}
          >
            <div id="scanner">
              <WineScanner />
            </div>
          </div>
        </div>
      </section>

      {/* ── LIBRARY ── */}
      <section className="py-28" style={{ background: INK_900 }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <SectionLabel label="Step Three" />
            <h2 className="font-playfair text-4xl md:text-5xl font-bold mb-5" style={{ color: CHAMPAGNE }}>
              Build Your Cellar
            </h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: CHAMPAGNE_MUTED }}>
              Save every favourite. Build a curated collection of wines that have made your evenings memorable.
            </p>
          </div>
          <div
            className="overflow-hidden rounded-sm"
            style={{ border: `1px solid ${GOLD_BORDER}`, background: INK_700 }}
          >
            <div id="library">
              <WineLibrary />
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-28" style={{ background: INK_800 }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-20">
            <SectionLabel label="Why What the Wine" />
            <h2 className="font-playfair text-4xl md:text-5xl font-bold mb-5" style={{ color: CHAMPAGNE }}>
              Crafted for Connoisseurs
            </h2>
            <p className="text-base max-w-2xl mx-auto" style={{ color: CHAMPAGNE_MUTED }}>
              Because great hosts don't guess. WTW removes the uncertainty so you can focus on what matters — unforgettable evenings.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f) => (
              <div
                key={f.title}
                className="p-10 transition-all duration-300 group"
                style={{
                  background: INK_700,
                  borderTop: `2px solid ${GOLD}`,
                  border: `1px solid ${GOLD_BORDER}`,
                  borderTopWidth: "2px",
                  borderTopColor: GOLD,
                }}
              >
                <div className="mb-6" style={{ color: GOLD }}>
                  {f.icon}
                </div>
                <h3 className="font-playfair text-xl font-bold mb-4" style={{ color: CHAMPAGNE }}>
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: CHAMPAGNE_MUTED }}>
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-28" style={{ background: INK_900 }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <SectionLabel label="Members" />
            <h2 className="font-playfair text-4xl md:text-5xl font-bold" style={{ color: CHAMPAGNE }}>
              Voices from the Table
            </h2>
          </div>
          <Testimonials />
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-32 relative overflow-hidden" style={{ background: INK_800 }}>
        {/* Burgundy glow */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div
            className="w-[700px] h-[500px] rounded-full"
            style={{
              background: `radial-gradient(ellipse, ${BURGUNDY_GLOW} 0%, transparent 65%)`,
            }}
          />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <GoldDivider />
          <h2 className="font-playfair text-4xl md:text-5xl font-bold mb-6 leading-tight" style={{ color: CHAMPAGNE }}>
            Ready to Be the Host<br />Who Always Gets It Right?
          </h2>
          <p className="text-base mb-12 leading-relaxed" style={{ color: CHAMPAGNE_MUTED }}>
            Join hosts everywhere using What the Wine to take the stress out of picking bottles
            and add a touch of effortless elegance to every occasion.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <AuthDialog defaultMode="register">
              <Button
                className="px-12 py-6 text-base font-semibold rounded-none transition-all duration-300"
                style={{ background: GOLD, color: INK_950, letterSpacing: "0.05em" }}
              >
                <Wine className="w-4 h-4 mr-2" />
                Start Your Wine Journey
              </Button>
            </AuthDialog>
            <AuthDialog defaultMode="login">
              <Button
                className="px-12 py-6 text-base font-medium rounded-none transition-all duration-300"
                style={{ border: `1px solid ${GOLD}`, color: GOLD, background: "transparent", letterSpacing: "0.05em" }}
              >
                Sign In
              </Button>
            </AuthDialog>
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <section className="py-24" style={{ background: INK_900 }}>
        <div className="max-w-2xl mx-auto px-6">
          <div
            className="p-12"
            style={{ border: `1px solid ${GOLD_BORDER}`, background: INK_800 }}
          >
            <div className="text-center mb-10">
              <SectionLabel label="Stay Informed" />
              <h2 className="font-playfair text-3xl font-bold mb-4" style={{ color: CHAMPAGNE }}>
                Weekly Wine Intelligence
              </h2>
              <p className="text-sm" style={{ color: CHAMPAGNE_MUTED }}>
                Curated picks, expert insights, and exclusive offers — delivered every week.
              </p>
            </div>

            <EmailSubscriptionForm />

            <div className="grid grid-cols-3 gap-6 mt-10 pt-8" style={{ borderTop: `1px solid ${GOLD_BORDER}` }}>
              {[
                { icon: <Wine className="w-5 h-5" />, label: "Weekly Picks" },
                { icon: <Star className="w-5 h-5" />, label: "Expert Tips" },
                { icon: <TrendingUp className="w-5 h-5" />, label: "Exclusive Offers" },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <div className="flex justify-center mb-2" style={{ color: GOLD }}>
                    {item.icon}
                  </div>
                  <p className="text-xs uppercase tracking-widest" style={{ color: CHAMPAGNE_SUBTLE }}>
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-20" style={{ background: INK_950, borderTop: `1px solid ${GOLD_BORDER}` }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-5">
                <img src={logoPath} alt="What the Wine" className="h-8 w-8 object-contain" />
                <span className="font-playfair text-xl font-bold" style={{ color: CHAMPAGNE }}>
                  What the Wine
                </span>
              </div>
              <p className="text-sm leading-relaxed mb-6 max-w-xs" style={{ color: CHAMPAGNE_SUBTLE }}>
                Your personal wine intelligence for every occasion. Powered by AI, guided by taste.
              </p>
              <div className="flex gap-1">
                {[GOLD, GOLD, GOLD, "#7A6A5A", "#7A6A5A"].map((c, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" style={{ color: c }} />
                ))}
                <span className="ml-2 text-xs" style={{ color: CHAMPAGNE_SUBTLE }}>Loved by hosts everywhere</span>
              </div>
            </div>

            <div>
              <h5 className="text-xs uppercase tracking-widest mb-6 font-medium" style={{ color: GOLD }}>
                Features
              </h5>
              <ul className="space-y-3">
                {[
                  { label: "Wine Recommendations", id: "recommendations" },
                  { label: "Bottle Scanner", id: "scanner" },
                  { label: "Wine Library", id: "library" },
                ].map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => scrollToSection(item.id)}
                      className="text-sm transition-colors duration-200"
                      style={{ color: CHAMPAGNE_SUBTLE }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = CHAMPAGNE_MUTED)}
                      onMouseLeave={(e) => (e.currentTarget.style.color = CHAMPAGNE_SUBTLE)}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="text-xs uppercase tracking-widest mb-6 font-medium" style={{ color: GOLD }}>
                Company
              </h5>
              <ul className="space-y-3">
                {[
                  { label: "Help Center", href: "/help" },
                  { label: "Contact Us", href: "/contact" },
                  { label: "For Agents", href: "/for-agents" },
                  { label: "Privacy Policy", href: "/privacy" },
                  { label: "Terms of Service", href: "/terms" },
                ].map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className="text-sm transition-colors duration-200"
                      style={{ color: CHAMPAGNE_SUBTLE }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = CHAMPAGNE_MUTED)}
                      onMouseLeave={(e) => (e.currentTarget.style.color = CHAMPAGNE_SUBTLE)}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div
            className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 text-xs"
            style={{ borderTop: `1px solid ${GOLD_BORDER}`, color: CHAMPAGNE_SUBTLE }}
          >
            <p>© 2024 What the Wine. All rights reserved.</p>
            <p style={{ color: `rgba(201,168,76,0.4)` }}>Elevating wine discovery with artificial intelligence.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
