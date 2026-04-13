import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { winePreferencesSchema, type WinePreferences, type Wine } from "@shared/schema";
import WineCard from "./wine-card";
import AuthDialog from "./auth-dialog";
import PaymentDialog from "./payment-dialog";

const OCCASIONS = [
  { value: "romantic dinner",     label: "Romantic" },
  { value: "business dinner",     label: "Business" },
  { value: "casual evening",      label: "Casual" },
  { value: "special celebration", label: "Celebration" },
  { value: "wine tasting",        label: "Tasting" },
];

const BUDGETS = [
  { value: "under-25", label: "Under $25" },
  { value: "25-50",    label: "$25 – $50" },
  { value: "50-100",   label: "$50 – $100" },
  { value: "100+",     label: "$100+" },
];

const FOOD_PAIRINGS = [
  { value: "red meat",    label: "Red Meat" },
  { value: "seafood",     label: "Seafood" },
  { value: "poultry",     label: "Poultry" },
  { value: "vegetarian",  label: "Vegetarian" },
  { value: "cheese",      label: "Cheese" },
  { value: "dessert",     label: "Dessert" },
];

const WINE_STYLES = [
  { value: "no-preference", label: "Any Style", dot: null },
  { value: "red",           label: "Red",       dot: "#722F37" },
  { value: "white",         label: "White",     dot: "#D4C4A8" },
  { value: "rose",          label: "Rosé",      dot: "#E8A0A0" },
  { value: "sparkling",     label: "Sparkling", dot: "#C9A84C" },
  { value: "dessert",       label: "Dessert",   dot: "#B8720A" },
];

export default function WineRecommendations() {
  const [recommendations, setRecommendations] = useState<Wine[]>([]);
  const [savedWines, setSavedWines] = useState<Set<number>>(new Set());
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [guestRecommendationCount, setGuestRecommendationCount] = useState(() => {
    const count = localStorage.getItem('guestRecommendationCount');
    return count ? parseInt(count, 10) : 0;
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isAuthenticated && guestRecommendationCount > 0) {
      setGuestRecommendationCount(0);
      localStorage.removeItem('guestRecommendationCount');
    }
  }, [isAuthenticated, guestRecommendationCount]);

  const form = useForm<WinePreferences>({
    resolver: zodResolver(winePreferencesSchema),
    defaultValues: { occasion: "", budget: "", foodPairing: "", wineType: "", preferences: "" },
  });

  const watched = form.watch();

  const recommendationMutation = useMutation({
    mutationFn: async (data: WinePreferences) => {
      const requestData = isAuthenticated ? data : { ...data, guestUsageCount: guestRecommendationCount };
      const response = await apiRequest("POST", "/api/recommendations", requestData);
      return response.json();
    },
    onSuccess: (data) => {
      setRecommendations(data.wines);
      if (data.isGuest) {
        const newCount = data.guestRecommendationsUsed;
        setGuestRecommendationCount(newCount);
        localStorage.setItem('guestRecommendationCount', newCount.toString());
        toast({ title: "Selections ready", description: `${data.guestRecommendationsRemaining} guest selections remaining.` });
        if (data.guestRecommendationsRemaining === 0) {
          setTimeout(() => setShowAuthDialog(true), 2000);
        }
      } else {
        toast({ title: "Selections ready", description: `${data.wines.length} wines curated for you.` });
        queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      }
    },
    onError: (error: any) => {
      if (error.message?.includes("Usage limit reached")) {
        setShowPaymentDialog(true);
        toast({ title: "Limit reached", description: "Upgrade to premium for unlimited selections.", variant: "destructive" });
      } else if (error.message?.includes("Guest limit reached")) {
        setShowAuthDialog(true);
        toast({ title: "Guest trial complete", description: "Create an account for 5 more free selections." });
      } else if (error.message?.includes("Authentication required")) {
        setShowAuthDialog(true);
      } else {
        toast({ title: "Error", description: error.message || "Failed to get recommendations", variant: "destructive" });
      }
    },
  });

  const saveWineMutation = useMutation({
    mutationFn: async ({ wineId }: { wineId: number }) => {
      if (!isAuthenticated) throw new Error("Please sign in to save wines to your library");
      const response = await apiRequest("POST", "/api/library", { wineId });
      return response.json();
    },
    onSuccess: (_, { wineId }) => {
      setSavedWines(prev => new Set(Array.from(prev).concat(wineId)));
      queryClient.invalidateQueries({ queryKey: ["/api/library"] });
      toast({ title: "Wine saved", description: "Added to your library." });
    },
    onError: (error: any) => {
      if (error.message?.includes("sign in")) {
        setShowAuthDialog(true);
      } else {
        toast({ title: "Error", description: error.message || "Failed to save wine", variant: "destructive" });
      }
    },
  });

  const onSubmit = (data: WinePreferences) => {
    if (!isAuthenticated && guestRecommendationCount >= 2) {
      setShowAuthDialog(true);
      return;
    }
    recommendationMutation.mutate(data);
  };

  const handleSaveWine = (wineId: number) => {
    if (!savedWines.has(wineId)) saveWineMutation.mutate({ wineId });
  };

  const sel = (field: keyof WinePreferences, value: string) => form.setValue(field, value);

  const GOLD = "#B8922A";
  const isBlocked = !isAuthenticated && guestRecommendationCount >= 2;

  return (
    <section id="recommendations" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Usage strip — authenticated premium */}
        {isAuthenticated && user?.isPremium && (
          <div className="flex items-center justify-center gap-3 mb-10 text-xs uppercase tracking-widest text-[#722F37] dark:text-[#C9A84C]">
            <Crown className="w-3.5 h-3.5" />
            <span>Unlimited · Premium Member</span>
          </div>
        )}

        {/* Usage strip — authenticated free */}
        {isAuthenticated && user && !user.isPremium && (
          <div className="max-w-4xl mx-auto mb-10">
            {(user.recommendationCount || 0) >= 5 ? (
              <div className="flex items-center justify-between px-6 py-4 border border-[#722F37]/20 bg-[#722F37]/5">
                <span className="text-sm text-[#722F37] dark:text-[#C9A84C]">You've used your 5 complimentary selections.</span>
                <Button onClick={() => setShowPaymentDialog(true)} size="sm"
                  className="bg-[#722F37] hover:bg-[#5d252a] text-white rounded-none text-xs tracking-wider px-5">
                  <Crown className="w-3 h-3 mr-1.5" />Unlock Unlimited — $3.99
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between px-6 py-3 border-b border-[#722F37]/15">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">Complimentary selections</span>
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-5 h-0.5 transition-colors duration-300"
                        style={{ background: i < (user.recommendationCount || 0) ? "#722F37" : "var(--border)" }} />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">{user.recommendationCount || 0} / 5</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Usage strip — guest */}
        {!isAuthenticated && !isLoading && (
          <div className="max-w-4xl mx-auto mb-10">
            {guestRecommendationCount >= 2 ? (
              <div className="flex items-center justify-between px-6 py-4 border border-[#722F37]/20 bg-[#722F37]/5">
                <span className="text-sm text-[#722F37] dark:text-[#C9A84C]">You've used your 2 complimentary guest selections.</span>
                <AuthDialog defaultMode="register">
                  <Button size="sm" className="bg-[#722F37] hover:bg-[#5d252a] text-white rounded-none text-xs tracking-wider px-5">
                    Create Account — Free
                  </Button>
                </AuthDialog>
              </div>
            ) : (
              <div className="flex items-center justify-between px-6 py-3 border-b border-[#722F37]/15">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">Guest selections remaining</span>
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="w-5 h-0.5 transition-colors duration-300"
                        style={{ background: i < guestRecommendationCount ? "#722F37" : "var(--border)" }} />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">{2 - guestRecommendationCount} remaining</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Interactive preference form */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-4xl mx-auto space-y-10 mb-14">

          {/* Occasion tiles */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] mb-4 font-medium text-center" style={{ color: GOLD }}>The Occasion</p>
            <div className="flex flex-wrap justify-center gap-3">
              {OCCASIONS.map(o => {
                const active = watched.occasion === o.value;
                return (
                  <button type="button" key={o.value} onClick={() => sel("occasion", o.value)}
                    className={`py-5 px-3 text-center border transition-all duration-200 ${
                      active
                        ? "border-[#722F37] bg-[#722F37]/10 dark:bg-[#722F37]/20"
                        : "border-border hover:border-[#722F37]/50 bg-card"
                    }`}
                  >
                    <span className={`text-[11px] uppercase tracking-wider ${active ? "text-[#722F37] dark:text-[#C9A84C] font-medium" : "text-muted-foreground"}`}>
                      {o.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Budget pills */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] mb-4 font-medium text-center" style={{ color: GOLD }}>Budget</p>
            <div className="flex flex-wrap justify-center gap-2">
              {BUDGETS.map(b => {
                const active = watched.budget === b.value;
                return (
                  <button type="button" key={b.value} onClick={() => sel("budget", b.value)}
                    className={`px-7 py-2.5 text-sm border transition-all duration-200 ${
                      active
                        ? "border-[#722F37] bg-[#722F37] text-white"
                        : "border-border text-foreground hover:border-[#722F37]/50 bg-card"
                    }`}
                  >
                    {b.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Food pairing chips */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] mb-4 font-medium text-center" style={{ color: GOLD }}>Food Pairing</p>
            <div className="flex flex-wrap justify-center gap-2">
              {FOOD_PAIRINGS.map(f => {
                const active = watched.foodPairing === f.value;
                return (
                  <button type="button" key={f.value} onClick={() => sel("foodPairing", f.value)}
                    className={`px-5 py-2.5 text-sm border transition-all duration-200 ${
                      active
                        ? "border-[#722F37] bg-[#722F37]/10 dark:bg-[#722F37]/20 text-[#722F37] dark:text-[#C9A84C]"
                        : "border-border text-foreground hover:border-[#722F37]/40 bg-card"
                    }`}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Wine style with color dots */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] mb-4 font-medium text-center" style={{ color: GOLD }}>Wine Style</p>
            <div className="flex flex-wrap justify-center gap-2">
              {WINE_STYLES.map(w => {
                const active = watched.wineType === w.value;
                return (
                  <button type="button" key={w.value} onClick={() => sel("wineType", w.value)}
                    className={`flex items-center gap-2.5 px-4 py-2.5 text-sm border transition-all duration-200 ${
                      active
                        ? "border-[#722F37] bg-[#722F37]/10 dark:bg-[#722F37]/20 text-[#722F37] dark:text-[#C9A84C]"
                        : "border-border text-foreground hover:border-[#722F37]/40 bg-card"
                    }`}
                  >
                    {w.dot && (
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: w.dot }} />
                    )}
                    <span>{w.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] mb-4 font-medium text-center" style={{ color: GOLD }}>Notes</p>
            <textarea
              {...form.register("preferences")}
              className="w-full bg-card border border-border focus:border-[#722F37] dark:focus:border-[#C9A84C] focus:outline-none p-4 text-sm text-foreground placeholder:text-muted-foreground resize-none transition-colors duration-200 h-20"
              placeholder="Favourite regions, grapes, or anything else worth knowing..."
            />
          </div>

          {/* Submit */}
          <div className="text-center pt-2">
            <Button
              type="submit"
              disabled={recommendationMutation.isPending || isBlocked}
              className="bg-[#722F37] hover:bg-[#5d252a] dark:bg-[#C9A84C] dark:hover:bg-[#B8922A] dark:text-[#120810] text-white font-medium px-12 py-5 rounded-none tracking-wider text-sm transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {recommendationMutation.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Curating your selections…</>
              ) : (
                <><Sparkles className="h-4 w-4 mr-2" />Reveal My Selections</>
              )}
            </Button>
          </div>
        </form>

        {/* Results */}
        {recommendations.length > 0 && (
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {recommendations.map((wine) => (
              <WineCard key={wine.id} wine={wine}
                onSave={() => handleSaveWine(wine.id)}
                isSaved={savedWines.has(wine.id)} />
            ))}
          </div>
        )}

        <PaymentDialog isOpen={showPaymentDialog} onClose={() => setShowPaymentDialog(false)} />

        {showAuthDialog && (
          <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} defaultMode="register">
            <Button style={{ display: "none" }}>Hidden</Button>
          </AuthDialog>
        )}
      </div>
    </section>
  );
}
