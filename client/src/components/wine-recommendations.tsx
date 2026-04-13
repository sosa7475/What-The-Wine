import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { winePreferencesSchema, type WinePreferences, type Wine } from "@shared/schema";
import WineCard from "./wine-card";
import AuthDialog from "./auth-dialog";
import PaymentDialog from "./payment-dialog";

export default function WineRecommendations() {
  const [recommendations, setRecommendations] = useState<Wine[]>([]);
  const [savedWines, setSavedWines] = useState<Set<number>>(new Set());
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [guestRecommendationCount, setGuestRecommendationCount] = useState(() => {
    // Get guest recommendation count from localStorage
    const count = localStorage.getItem('guestRecommendationCount');
    return count ? parseInt(count, 10) : 0;
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isLoading } = useAuth();

  // Clear guest count when user signs in
  useEffect(() => {
    if (isAuthenticated && guestRecommendationCount > 0) {
      setGuestRecommendationCount(0);
      localStorage.removeItem('guestRecommendationCount');
    }
  }, [isAuthenticated, guestRecommendationCount]);

  const form = useForm<WinePreferences>({
    resolver: zodResolver(winePreferencesSchema),
    defaultValues: {
      occasion: "",
      budget: "",
      foodPairing: "",
      wineType: "",
      preferences: "",
    },
  });

  const recommendationMutation = useMutation({
    mutationFn: async (data: WinePreferences) => {
      const requestData = isAuthenticated ? data : { ...data, guestUsageCount: guestRecommendationCount };
      const response = await apiRequest("POST", "/api/recommendations", requestData);
      return response.json();
    },
    onSuccess: (data) => {
      setRecommendations(data.wines);
      
      // Handle guest users
      if (data.isGuest) {
        const newCount = data.guestRecommendationsUsed;
        setGuestRecommendationCount(newCount);
        localStorage.setItem('guestRecommendationCount', newCount.toString());
        
        toast({
          title: "Recommendations Generated",
          description: `Found ${data.wines.length} wines for you! ${data.guestRecommendationsRemaining} free recommendations remaining.`,
        });
        
        // Show auth prompt after using both free recommendations
        if (data.guestRecommendationsRemaining === 0) {
          setTimeout(() => {
            setShowAuthDialog(true);
          }, 2000);
        }
      } else {
        // Handle authenticated users
        toast({
          title: "Recommendations Generated",
          description: `Found ${data.wines.length} perfect wines for you!`,
        });
        // Invalidate auth to get updated recommendation count
        queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      }
    },
    onError: (error: any) => {
      if (error.message?.includes("Usage limit reached")) {
        setShowPaymentDialog(true);
        toast({
          title: "Usage Limit Reached",
          description: "You've used your 5 free recommendations. Upgrade to premium for unlimited access.",
          variant: "destructive",
        });
      } else if (error.message?.includes("Guest limit reached")) {
        setShowAuthDialog(true);
        toast({
          title: "Free Trial Complete",
          description: "You've used your 2 free guest recommendations. Sign up for 5 more free recommendations!",
        });
      } else if (error.message?.includes("Authentication required")) {
        setShowAuthDialog(true);
        toast({
          title: "Sign In Required",
          description: "Please sign in to get wine recommendations.",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to get recommendations",
          variant: "destructive",
        });
      }
    },
  });

  const saveWineMutation = useMutation({
    mutationFn: async ({ wineId }: { wineId: number }) => {
      if (!isAuthenticated) {
        throw new Error("Please sign in to save wines to your library");
      }
      const response = await apiRequest("POST", "/api/library", { wineId });
      return response.json();
    },
    onSuccess: (_, { wineId }) => {
      setSavedWines(prev => new Set(Array.from(prev).concat(wineId)));
      queryClient.invalidateQueries({ queryKey: ["/api/library"] });
      toast({
        title: "Wine Saved",
        description: "Added to your wine library!",
      });
    },
    onError: (error: any) => {
      if (error.message?.includes("sign in")) {
        setShowAuthDialog(true);
        toast({
          title: "Sign In Required",
          description: "Create an account to save wines to your library.",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to save wine",
          variant: "destructive",
        });
      }
    },
  });

  const onSubmit = (data: WinePreferences) => {
    // Check if guest user has reached limit
    if (!isAuthenticated && guestRecommendationCount >= 2) {
      setShowAuthDialog(true);
      toast({
        title: "Sign up required",
        description: "You've used your 2 free guest recommendations. Sign up for 5 more free recommendations!",
      });
      return;
    }
    
    recommendationMutation.mutate(data);
  };

  const handleSaveWine = (wineId: number) => {
    if (!savedWines.has(wineId)) {
      saveWineMutation.mutate({ wineId });
    }
  };

  return (
    <section id="recommendations" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Usage strip — authenticated premium */}
        {isAuthenticated && user?.isPremium && (
          <div className="flex items-center justify-center gap-3 mb-10 text-xs uppercase tracking-widest text-[#722F37]">
            <Crown className="w-3.5 h-3.5" />
            <span>Unlimited · Premium Member</span>
          </div>
        )}

        {/* Usage strip — authenticated free, approaching limit */}
        {isAuthenticated && user && !user.isPremium && (
          <div className="max-w-4xl mx-auto mb-10">
            {(user.recommendationCount || 0) >= 5 ? (
              <div className="flex items-center justify-between px-6 py-4 border border-[#722F37]/20 bg-[#722F37]/5">
                <span className="text-sm text-[#722F37]">You've used your 5 complimentary selections.</span>
                <Button
                  onClick={() => setShowPaymentDialog(true)}
                  size="sm"
                  className="bg-[#722F37] hover:bg-[#5d252a] text-white rounded-none text-xs tracking-wider px-5"
                >
                  <Crown className="w-3 h-3 mr-1.5" />
                  Unlock Unlimited — $3.99
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between px-6 py-3 border-b border-[#722F37]/15">
                <span className="text-xs uppercase tracking-widest text-gray-400">
                  Complimentary selections
                </span>
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="w-5 h-0.5 transition-colors duration-300"
                        style={{ background: i < (user.recommendationCount || 0) ? "#722F37" : "#E5E7EB" }}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">{user.recommendationCount || 0} / 5</span>
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
                <span className="text-sm text-[#722F37]">You've used your 2 complimentary guest selections.</span>
                <AuthDialog defaultMode="register">
                  <Button size="sm" className="bg-[#722F37] hover:bg-[#5d252a] text-white rounded-none text-xs tracking-wider px-5">
                    Create Account — Free
                  </Button>
                </AuthDialog>
              </div>
            ) : (
              <div className="flex items-center justify-between px-6 py-3 border-b border-[#722F37]/15">
                <span className="text-xs uppercase tracking-widest text-gray-400">
                  Guest selections remaining
                </span>
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    {[...Array(2)].map((_, i) => (
                      <div
                        key={i}
                        className="w-5 h-0.5 transition-colors duration-300"
                        style={{ background: i < guestRecommendationCount ? "#722F37" : "#E5E7EB" }}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">{2 - guestRecommendationCount} remaining</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Preference Form */}
        <Card className="bg-creme-50 rounded-2xl p-8 mb-12 max-w-4xl mx-auto shadow-sm">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="occasion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Occasion</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white border-creme-300 focus:ring-burgundy-500">
                            <SelectValue placeholder="Select occasion..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="romantic dinner">Romantic dinner</SelectItem>
                          <SelectItem value="business dinner">Business dinner</SelectItem>
                          <SelectItem value="casual evening">Casual evening</SelectItem>
                          <SelectItem value="special celebration">Special celebration</SelectItem>
                          <SelectItem value="wine tasting">Wine tasting</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Budget</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white border-creme-300 focus:ring-burgundy-500">
                            <SelectValue placeholder="Select budget..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="under-25">Under $25</SelectItem>
                          <SelectItem value="25-50">$25 – $50</SelectItem>
                          <SelectItem value="50-100">$50 – $100</SelectItem>
                          <SelectItem value="100+">$100+</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="foodPairing"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Food Pairing</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white border-creme-300 focus:ring-burgundy-500">
                            <SelectValue placeholder="Select food pairing..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="red meat">Red meat</SelectItem>
                          <SelectItem value="seafood">Seafood</SelectItem>
                          <SelectItem value="poultry">Poultry</SelectItem>
                          <SelectItem value="vegetarian">Vegetarian</SelectItem>
                          <SelectItem value="cheese">Cheese & charcuterie</SelectItem>
                          <SelectItem value="dessert">Dessert</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="wineType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Wine Style</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white border-creme-300 focus:ring-burgundy-500">
                            <SelectValue placeholder="No preference" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="no-preference">No preference</SelectItem>
                          <SelectItem value="red">Red</SelectItem>
                          <SelectItem value="white">White</SelectItem>
                          <SelectItem value="rose">Rosé</SelectItem>
                          <SelectItem value="sparkling">Sparkling</SelectItem>
                          <SelectItem value="dessert">Dessert</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="preferences"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        className="bg-white border-creme-300 focus:ring-burgundy-500 h-24"
                        placeholder="Favourite regions, grapes, or anything else worth knowing..."
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="text-center">
                <Button
                  type="submit"
                  disabled={recommendationMutation.isPending || (!isAuthenticated && guestRecommendationCount >= 2)}
                  className="bg-burgundy-600 hover:bg-burgundy-700 text-white font-medium px-8 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {recommendationMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Curating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Reveal My Selections
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </Card>

        {/* Wine Recommendations Display */}
        {recommendations.length > 0 && (
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {recommendations.map((wine) => (
              <WineCard
                key={wine.id}
                wine={wine}
                onSave={() => handleSaveWine(wine.id)}
                isSaved={savedWines.has(wine.id)}
              />
            ))}
          </div>
        )}

        {/* Payment Dialog */}
        <PaymentDialog
          isOpen={showPaymentDialog}
          onClose={() => setShowPaymentDialog(false)}
        />

        {/* Auth Dialog for Guest Users */}
        {showAuthDialog && (
          <AuthDialog
            open={showAuthDialog}
            onOpenChange={setShowAuthDialog}
            defaultMode="register"
          >
            <Button style={{ display: 'none' }}>Hidden</Button>
          </AuthDialog>
        )}
      </div>
    </section>
  );
}
