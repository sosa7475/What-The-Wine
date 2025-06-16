import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Wine, BookOpen, Camera, User, Crown, Star, TrendingUp, Calendar, LogOut, ChevronDown, ChevronUp, Users } from "lucide-react";
import { useAuth, useLogout } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import WineRecommendations from "@/components/wine-recommendations";
import WineScanner from "@/components/wine-scanner";
import WineLibrary from "@/components/wine-library";
import CommunityHub from "@/components/community-hub";
import PaymentDialog from "@/components/payment-dialog";

export default function Dashboard() {
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isUsageStatsOpen, setIsUsageStatsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("recommendations");
  const { user, isAuthenticated } = useAuth();
  const logoutMutation = useLogout();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // Fetch library data for wine count
  const { data: libraryData } = useQuery({
    queryKey: ["/api/library"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/library");
      return response.json();
    },
    enabled: isAuthenticated,
  });

  // Fetch subscription details for premium users
  const { data: subscriptionData } = useQuery({
    queryKey: ["/api/subscription-details"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/subscription-details");
      return response.json();
    },
    enabled: isAuthenticated && user?.isPremium,
  });

  // Handle Stripe checkout success/failure and verify subscription
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const upgrade = urlParams.get('upgrade');
    const sessionId = urlParams.get('session_id');
    
    if (upgrade === 'success' && sessionId) {
      // Verify subscription with backend
      const verifySubscription = async () => {
        try {
          const response = await apiRequest("POST", "/api/check-subscription", {
            sessionId: sessionId
          });
          const result = await response.json();
          
          if (result.success && result.isPremium) {
            toast({
              title: "Welcome to Premium!",
              description: "Your subscription is now active. Enjoy unlimited wine recommendations!",
            });
            // Invalidate auth cache to refresh user data
            queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
            // Refresh page to ensure all components update
            setTimeout(() => window.location.reload(), 1000);
          } else {
            toast({
              title: "Subscription Verification",
              description: "Please refresh the page to see your updated subscription status.",
            });
          }
        } catch (error) {
          console.error("Error verifying subscription:", error);
          toast({
            title: "Subscription Update",
            description: "Your payment was successful. Please refresh the page to see your premium status.",
          });
        }
      };
      
      verifySubscription();
      // Clean up URL
      window.history.replaceState({}, '', '/dashboard');
    } else if (upgrade === 'success') {
      toast({
        title: "Welcome to Premium!",
        description: "Your subscription is now active. Enjoy unlimited wine recommendations!",
      });
      // Clean up URL
      window.history.replaceState({}, '', '/dashboard');
    } else if (upgrade === 'cancelled') {
      toast({
        title: "Upgrade Cancelled",
        description: "You can upgrade to premium anytime from your dashboard.",
        variant: "destructive",
      });
      // Clean up URL
      window.history.replaceState({}, '', '/dashboard');
    }
  }, [toast]);

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      setLocation("/");
      toast({
        title: "Logged out",
        description: "You've been successfully logged out.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancelPlan = async () => {
    try {
      const response = await apiRequest("POST", "/api/cancel-subscription");
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Subscription Cancelled",
          description: result.message,
        });
        
        // Refresh subscription data
        queryClient.invalidateQueries({ queryKey: ["/api/subscription-details"] });
        setShowCancelDialog(false);
      } else {
        toast({
          title: "Cancellation Failed",
          description: result.error || "Unable to cancel subscription",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast({
        title: "Error",
        description: "Failed to cancel subscription. Please try again.",
        variant: "destructive",
      });
    }
  };



  if (!isAuthenticated || !user) {
    return null; // This will be handled by routing
  }

  const usagePercentage = Math.min(((user.recommendationCount || 0) / 3) * 100, 100);

  return (
    <div className="min-h-screen bg-creme-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-burgundy-700 mb-2">
                Welcome back, {user.firstName}!
                {user.isPremium && <Crown className="inline w-6 h-6 text-yellow-500 ml-2" />}
              </h1>
              <p className="text-gray-600">
                Discover exceptional wines tailored to your taste
              </p>
            </div>
            <div className="flex items-center gap-4">
              {user.isPremium && (
                <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900 px-4 py-2">
                  <Crown className="w-4 h-4 mr-2" />
                  Premium Member
                </Badge>
              )}
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="border-burgundy-300 text-burgundy-700 hover:bg-burgundy-50"
                disabled={logoutMutation.isPending}
              >
                <LogOut className="w-4 h-4 mr-2" />
                {logoutMutation.isPending ? "Logging out..." : "Logout"}
              </Button>
            </div>
          </div>
        </div>

        {/* Premium Subscription Management */}
        {user.isPremium && subscriptionData?.hasSubscription && (
          <Card className="mb-8 border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-800">
                <Crown className="w-5 h-5" />
                Premium Subscription
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Plan Details</p>
                  <p className="font-semibold">Premium Monthly - $3.99/month</p>
                  <p className="text-sm text-gray-600">
                    Next billing: {new Date(subscriptionData.currentPeriodEnd).toLocaleDateString()}
                  </p>
                  {subscriptionData.cancelAtPeriodEnd && (
                    <p className="text-sm text-orange-600 font-medium mt-1">
                      Cancels on {new Date(subscriptionData.currentPeriodEnd).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex items-end justify-end">
                  {!subscriptionData.cancelAtPeriodEnd ? (
                    <Button
                      onClick={() => setShowCancelDialog(true)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      Cancel Subscription
                    </Button>
                  ) : (
                    <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                      Cancelled
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Usage Status Card - Collapsible */}
        {!user.isPremium && (
          <Collapsible open={isUsageStatsOpen} onOpenChange={setIsUsageStatsOpen}>
            <Card className="mb-8 border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-2 text-orange-800 hover:bg-orange-100 p-0 h-auto font-bold text-lg"
                    >
                      {isUsageStatsOpen ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                      Your Usage Status
                    </Button>
                  </CollapsibleTrigger>
                  <Button
                    onClick={() => setShowPaymentDialog(true)}
                    size="sm"
                    className="bg-burgundy-600 hover:bg-burgundy-700 text-white"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade to Premium
                  </Button>
                </CardTitle>
              </CardHeader>
              <CollapsibleContent>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-orange-700">Free Recommendations Used:</span>
                      <span className="font-semibold text-orange-800">
                        {user.recommendationCount || 0} / 5
                      </span>
                    </div>
                    <div className="w-full bg-orange-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-orange-500 to-amber-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, ((user.recommendationCount || 0) / 5) * 100)}%` }}
                      ></div>
                    </div>
                    {(user.recommendationCount || 0) >= 5 && (
                      <div className="text-sm text-orange-700 font-medium">
                        You've reached your free limit. Upgrade for unlimited recommendations!
                      </div>
                    )}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        )}

        {/* Subscription Details Card */}
        {user.isPremium && (
          <div className="mb-8 space-y-4">
            {/* Subscription Status */}
            <Card className="border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-amber-600" />
                    <span className="text-amber-800">Premium Subscription</span>
                  </div>
                  {subscriptionData?.cancelAtPeriodEnd && (
                    <span className="px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full">
                      Cancelled
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Plan Details</span>
                    <span className="text-sm font-medium">Premium Monthly - $3.99/month</span>
                  </div>
                  {subscriptionData?.currentPeriodEnd && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        {subscriptionData.cancelAtPeriodEnd ? 'Cancels on' : 'Next billing'}
                      </span>
                      <span className="text-sm font-medium">
                        {new Date(subscriptionData.currentPeriodEnd).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {subscriptionData?.cancelAtPeriodEnd && (
                    <div className="mt-3 p-3 bg-yellow-100 rounded-lg">
                      <p className="text-sm text-amber-800">
                        You'll continue to have access until the end of your current billing period. 
                        You can reactivate anytime.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Premium Features */}
            <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-yellow-500" />
                    <span className="text-green-800">Premium Active</span>
                  </div>
                  {!subscriptionData?.cancelAtPeriodEnd && (
                    <Button
                      onClick={() => setShowCancelDialog(true)}
                      variant="outline"
                      size="sm"
                      className="border-red-300 text-red-700 hover:bg-red-50"
                    >
                      Cancel Plan
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-700">Unlimited wine recommendations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-700">Advanced bottle scanning</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-700">Personal wine library</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-700">Expert wine insights</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-burgundy-100">
                  <Wine className="w-6 h-6 text-burgundy-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Recommendations Used</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {user.recommendationCount || 0}
                    {user.isPremium ? "" : " / 5"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Wines in Library</p>
                  <p className="text-2xl font-bold text-gray-900">{libraryData?.library?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Account Status</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {user.isPremium ? "Premium" : "Free"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5">
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              <span className="hidden sm:inline">Recommendations</span>
            </TabsTrigger>
            <TabsTrigger value="scanner" className="flex items-center gap-2">
              <Camera className="w-4 h-4" />
              <span className="hidden sm:inline">Scanner</span>
            </TabsTrigger>
            <TabsTrigger value="library" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">My Library</span>
            </TabsTrigger>
            <TabsTrigger value="community" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Community</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recommendations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-burgundy-600" />
                  Wine Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <WineRecommendations />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scanner" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-burgundy-600" />
                  Wine Bottle Scanner
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <WineScanner />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="library" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-burgundy-600" />
                  My Wine Library
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <WineLibrary onNavigateToRecommendations={() => setActiveTab("recommendations")} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="community" className="space-y-6">
            <CommunityHub />
          </TabsContent>

          <TabsContent value="account" className="space-y-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-burgundy-600" />
                    Account Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">First Name</label>
                      <p className="text-gray-900 font-medium">{user.firstName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-gray-900 font-medium">{user.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Username</label>
                      <p className="text-gray-900 font-medium">{user.username}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Account Type</label>
                      <div className="flex items-center gap-2">
                        <p className="text-gray-900 font-medium">
                          {user.isPremium ? "Premium" : "Free"}
                        </p>
                        {user.isPremium && <Crown className="w-4 h-4 text-yellow-500" />}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {!user.isPremium && (
                <Card className="border-2 border-burgundy-200 bg-gradient-to-r from-burgundy-50 to-purple-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-burgundy-700">
                      <Crown className="w-5 h-5 text-yellow-500" />
                      Upgrade to Premium
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Unlimited wine recommendations</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Advanced food pairing suggestions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Priority support</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Unlimited wine library storage</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => setShowPaymentDialog(true)}
                      className="w-full bg-burgundy-600 hover:bg-burgundy-700 text-white"
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade Now - $3.99
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Payment Dialog */}
        <PaymentDialog
          isOpen={showPaymentDialog}
          onClose={() => setShowPaymentDialog(false)}
        />

        {/* Cancel Plan Dialog */}
        <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-red-700">Cancel Premium Plan</DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel your premium subscription? You'll lose access to:
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm">Unlimited wine recommendations</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm">Advanced bottle scanning</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm">Personal wine library</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm">Expert wine insights</span>
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800">
                You'll continue to have access until the end of your current billing period.
                You can reactivate anytime.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowCancelDialog(false)}
                className="flex-1"
              >
                Keep Premium
              </Button>
              <Button
                onClick={handleCancelPlan}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                Cancel Plan
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}