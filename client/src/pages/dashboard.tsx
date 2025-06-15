import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Wine, BookOpen, Camera, User, Crown, Star, TrendingUp, Calendar, LogOut } from "lucide-react";
import { useAuth, useLogout } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import WineRecommendations from "@/components/wine-recommendations";
import WineScanner from "@/components/wine-scanner";
import WineLibrary from "@/components/wine-library";
import PaymentDialog from "@/components/payment-dialog";

export default function Dashboard() {
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const logoutMutation = useLogout();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Handle Stripe checkout success/failure
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const upgrade = urlParams.get('upgrade');
    
    if (upgrade === 'success') {
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

        {/* Usage Status Card */}
        {!user.isPremium && (
          <Card className="mb-8 border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="text-orange-800">Your Usage Status</span>
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
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-orange-700">Free Recommendations Used:</span>
                  <span className="font-semibold text-orange-800">
                    {user.recommendationCount || 0} / 3
                  </span>
                </div>
                <div className="w-full bg-orange-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-amber-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${usagePercentage}%` }}
                  ></div>
                </div>
                {(user.recommendationCount || 0) >= 3 && (
                  <div className="text-sm text-orange-700 font-medium">
                    You've reached your free limit. Upgrade for unlimited recommendations!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
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
                    {user.isPremium ? "" : " / 3"}
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
                  <p className="text-2xl font-bold text-gray-900">0</p>
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
        <Tabs defaultValue="recommendations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
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
                <WineLibrary />
              </CardContent>
            </Card>
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
                      Upgrade Now - $9.99
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
      </div>
    </div>
  );
}