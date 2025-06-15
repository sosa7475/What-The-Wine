import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2, Crown, Lock } from "lucide-react";
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
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isLoading } = useAuth();

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
      const response = await apiRequest("POST", "/api/recommendations", data);
      return response.json();
    },
    onSuccess: (data) => {
      setRecommendations(data.wines);
      toast({
        title: "Recommendations Generated",
        description: `Found ${data.wines.length} perfect wines for you!`,
      });
      // Invalidate auth to get updated recommendation count
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
    onError: (error: any) => {
      if (error.message?.includes("Usage limit reached")) {
        setShowPaymentDialog(true);
        toast({
          title: "Usage Limit Reached",
          description: "You've used your 3 free recommendations. Upgrade to premium for unlimited access.",
          variant: "destructive",
        });
      } else if (error.message?.includes("Authentication required")) {
        toast({
          title: "Sign In Required",
          description: "Please sign in to get wine recommendations.",
          variant: "destructive",
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
      toast({
        title: "Error",
        description: error.message || "Failed to save wine",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: WinePreferences) => {
    recommendationMutation.mutate(data);
  };

  const handleSaveWine = (wineId: number) => {
    if (!savedWines.has(wineId)) {
      saveWineMutation.mutate({ wineId });
    }
  };

  return (
    <section id="recommendations" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h3 className="font-playfair text-4xl font-bold text-burgundy-700 mb-4">
            AI Wine Recommendations
          </h3>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Tell us about your preferences and we'll suggest three perfect wines for you
          </p>
        </div>

        {/* Authentication prompt for non-authenticated users */}
        {!isAuthenticated && !isLoading && (
          <Card className="bg-gradient-to-r from-[#722F37]/10 to-[#F5F5DC]/20 rounded-2xl p-6 mb-8 max-w-4xl mx-auto border-2 border-[#722F37]/10">
            <CardContent className="text-center">
              <Lock className="w-12 h-12 text-[#722F37] mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-[#722F37] mb-2">Sign In Required</h4>
              <p className="text-gray-600 mb-4">
                Please sign in to get personalized wine recommendations and save wines to your library.
              </p>
              <AuthDialog defaultMode="register">
                <Button className="bg-[#722F37] hover:bg-[#5d252a] text-white">
                  Get Started - It's Free
                </Button>
              </AuthDialog>
            </CardContent>
          </Card>
        )}

        {/* Usage Status for Authenticated Users */}
        {isAuthenticated && user && (
          <Card className="bg-gradient-to-r from-[#722F37]/10 to-[#F5F5DC]/20 rounded-2xl p-6 mb-8 max-w-4xl mx-auto border-2 border-[#722F37]/10">
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-[#722F37]">Welcome back, {user.firstName}!</h4>
                {user.isPremium && <Crown className="w-6 h-6 text-yellow-500" />}
              </div>
              {user.isPremium ? (
                <div className="flex items-center gap-2 text-green-600">
                  <Crown className="w-5 h-5" />
                  <span>Premium Member - Unlimited Recommendations</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Free Recommendations Used:</span>
                    <span className="font-semibold text-[#722F37]">{user.recommendationCount || 0} / 3</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-[#722F37] to-[#8B4513] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(((user.recommendationCount || 0) / 3) * 100, 100)}%` }}
                    ></div>
                  </div>
                  {(user.recommendationCount || 0) >= 3 && (
                    <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-center gap-2 text-orange-700 mb-2">
                        <Lock className="w-4 h-4" />
                        <span className="font-medium">Usage limit reached</span>
                      </div>
                      <p className="text-sm text-orange-600 mb-3">
                        Upgrade to premium for unlimited wine recommendations and advanced features.
                      </p>
                      <Button 
                        onClick={() => setShowPaymentDialog(true)}
                        className="bg-[#722F37] hover:bg-[#5d252a] text-white"
                        size="sm"
                      >
                        <Crown className="w-4 h-4 mr-2" />
                        Upgrade to Premium - $6.95
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Preference Form */}
        <Card className="bg-creme-50 rounded-2xl p-8 mb-12 max-w-4xl mx-auto shadow-sm">
          <h4 className="font-playfair text-2xl font-semibold text-burgundy-700 mb-6 text-center">
            Your Preferences
          </h4>
          
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
                      <FormLabel className="text-sm font-medium text-gray-700">Budget Range</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white border-creme-300 focus:ring-burgundy-500">
                            <SelectValue placeholder="Select budget..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="under-25">Under $25</SelectItem>
                          <SelectItem value="25-50">$25 - $50</SelectItem>
                          <SelectItem value="50-100">$50 - $100</SelectItem>
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
                      <FormLabel className="text-sm font-medium text-gray-700">Wine Type Preference</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white border-creme-300 focus:ring-burgundy-500">
                            <SelectValue placeholder="No preference" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="no-preference">No preference</SelectItem>
                          <SelectItem value="red">Red wine</SelectItem>
                          <SelectItem value="white">White wine</SelectItem>
                          <SelectItem value="rose">Rosé</SelectItem>
                          <SelectItem value="sparkling">Sparkling</SelectItem>
                          <SelectItem value="dessert">Dessert wine</SelectItem>
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
                    <FormLabel className="text-sm font-medium text-gray-700">Additional Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        className="bg-white border-creme-300 focus:ring-burgundy-500 h-24"
                        placeholder="Tell us more about your taste preferences, favorite regions, or any specific requirements..."
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="text-center">
                <Button
                  type="submit"
                  disabled={recommendationMutation.isPending}
                  className="bg-burgundy-600 hover:bg-burgundy-700 text-white font-medium px-8 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  {recommendationMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Get My Recommendations
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
      </div>
    </section>
  );
}
