import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Wine, BookOpen, Camera, User, Crown, Star, LogOut, ChevronDown, ChevronUp, Users } from "lucide-react";
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
import { useSEO } from "@/hooks/useSEO";
import { useTheme } from "@/contexts/theme-context";

const TABS = [
  { id: "recommendations", label: "Recommendations", shortLabel: "Recs", icon: Star },
  { id: "scanner", label: "Scanner", shortLabel: "Scan", icon: Camera },
  { id: "library", label: "My Library", shortLabel: "Library", icon: BookOpen },
  { id: "community", label: "Community", shortLabel: "Community", icon: Users },
  { id: "account", label: "Account", shortLabel: "Account", icon: User },
];

export default function Dashboard() {
  useSEO({ title: "My Dashboard", canonical: "/dashboard", noindex: true });

  const { colors: c } = useTheme();
  const GOLD = c.gold;
  const GOLD_BRIGHT = c.goldBright;
  const CHAMPAGNE = c.textPrimary;
  const CHAMPAGNE_MUTED = c.textMuted;
  const CHAMPAGNE_SUBTLE = c.textSubtle;
  const INK_950 = c.shade950;
  const INK_900 = c.shade900;
  const INK_800 = c.shade800;
  const INK_700 = c.shade700;
  const GOLD_BORDER = c.goldBorder;

  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isUsageOpen, setIsUsageOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("recommendations");
  const { user, isAuthenticated } = useAuth();
  const logoutMutation = useLogout();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: libraryData } = useQuery({
    queryKey: ["/api/library"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/library");
      return response.json();
    },
    enabled: isAuthenticated,
  });

  const { data: subscriptionData } = useQuery({
    queryKey: ["/api/subscription-details"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/subscription-details");
      return response.json();
    },
    enabled: isAuthenticated && user?.isPremium,
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const upgrade = urlParams.get("upgrade");
    const sessionId = urlParams.get("session_id");

    if (upgrade === "success" && sessionId) {
      const verifySubscription = async () => {
        try {
          const response = await apiRequest("POST", "/api/check-subscription", { sessionId });
          const result = await response.json();
          if (result.success && result.isPremium) {
            toast({ title: "Welcome to Premium!", description: "Your subscription is now active. Enjoy unlimited wine recommendations!" });
            queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
            setTimeout(() => window.location.reload(), 1000);
          } else {
            toast({ title: "Subscription Verification", description: "Please refresh the page to see your updated subscription status." });
          }
        } catch {
          toast({ title: "Subscription Update", description: "Your payment was successful. Please refresh the page to see your premium status." });
        }
      };
      verifySubscription();
      window.history.replaceState({}, "", "/dashboard");
    } else if (upgrade === "success") {
      toast({ title: "Welcome to Premium!", description: "Your subscription is now active. Enjoy unlimited wine recommendations!" });
      window.history.replaceState({}, "", "/dashboard");
    } else if (upgrade === "cancelled") {
      toast({ title: "Upgrade Cancelled", description: "You can upgrade to premium anytime from your dashboard.", variant: "destructive" });
      window.history.replaceState({}, "", "/dashboard");
    }
  }, [toast]);

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      setLocation("/");
      toast({ title: "Logged out", description: "You've been successfully logged out." });
    } catch {
      toast({ title: "Error", description: "Failed to log out. Please try again.", variant: "destructive" });
    }
  };

  const handleCancelPlan = async () => {
    try {
      const response = await apiRequest("POST", "/api/cancel-subscription");
      const result = await response.json();
      if (result.success) {
        toast({ title: "Subscription Cancelled", description: result.message });
        queryClient.invalidateQueries({ queryKey: ["/api/subscription-details"] });
        setShowCancelDialog(false);
      } else {
        toast({ title: "Cancellation Failed", description: result.error || "Unable to cancel subscription", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to cancel subscription. Please try again.", variant: "destructive" });
    }
  };

  const handleReactivatePlan = async () => {
    try {
      const response = await apiRequest("POST", "/api/reactivate-subscription");
      const result = await response.json();
      if (result.success) {
        toast({ title: "Subscription Reactivated", description: result.message });
        queryClient.invalidateQueries({ queryKey: ["/api/subscription-details"] });
      } else {
        toast({ title: "Reactivation Failed", description: result.error || "Unable to reactivate subscription", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to reactivate subscription. Please try again.", variant: "destructive" });
    }
  };

  if (!isAuthenticated || !user) return null;

  const usedRecs = user.recommendationCount || 0;
  const usagePercent = Math.min((usedRecs / 5) * 100, 100);
  const wineCount = libraryData?.library?.length || 0;

  return (
    <div className="min-h-screen pt-16" style={{ background: INK_900 }}>

      {/* ── GREETING BAR ── */}
      <div style={{ background: INK_800, borderBottom: `1px solid ${GOLD_BORDER}` }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="font-playfair text-2xl md:text-3xl font-bold" style={{ color: CHAMPAGNE }}>
                  Welcome back, {user.firstName}
                </h1>
                {user.isPremium && (
                  <Badge
                    className="text-xs px-3 py-1 font-medium uppercase tracking-wider rounded-none"
                    style={{ background: `rgba(201,168,76,0.15)`, color: GOLD, border: `1px solid ${GOLD_BORDER}` }}
                  >
                    <Crown className="w-3 h-3 mr-1.5" />
                    Premium
                  </Badge>
                )}
              </div>
              <p className="text-sm" style={{ color: CHAMPAGNE_SUBTLE }}>
                Your personal wine intelligence dashboard
              </p>
            </div>
            <Button
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="rounded-none text-xs uppercase tracking-widest px-6 py-2.5"
              style={{ border: `1px solid ${GOLD_BORDER}`, color: CHAMPAGNE_MUTED, background: "transparent" }}
            >
              <LogOut className="w-3.5 h-3.5 mr-2" />
              {logoutMutation.isPending ? "Signing out…" : "Sign Out"}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* ── STATS ROW ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: <Wine className="w-5 h-5" />,
              label: "Recommendations",
              value: user.isPremium ? String(usedRecs) : `${usedRecs} / 5`,
              sub: user.isPremium ? "Unlimited" : `${Math.max(0, 5 - usedRecs)} remaining`,
            },
            {
              icon: <BookOpen className="w-5 h-5" />,
              label: "Cellar Size",
              value: String(wineCount),
              sub: wineCount === 1 ? "bottle saved" : "bottles saved",
            },
            {
              icon: <Crown className="w-5 h-5" />,
              label: "Membership",
              value: user.isPremium ? "Premium" : "Free",
              sub: user.isPremium ? "All features unlocked" : "Upgrade for unlimited",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="px-6 py-5 flex items-center gap-5"
              style={{ background: INK_800, border: `1px solid ${GOLD_BORDER}` }}
            >
              <div
                className="w-10 h-10 flex items-center justify-center flex-shrink-0"
                style={{ background: `rgba(201,168,76,0.1)`, color: GOLD }}
              >
                {stat.icon}
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest mb-1" style={{ color: CHAMPAGNE_SUBTLE }}>
                  {stat.label}
                </p>
                <p className="font-playfair text-2xl font-bold" style={{ color: CHAMPAGNE }}>
                  {stat.value}
                </p>
                <p className="text-xs mt-0.5" style={{ color: CHAMPAGNE_SUBTLE }}>
                  {stat.sub}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ── FREE USAGE BANNER ── */}
        {!user.isPremium && (
          <Collapsible open={isUsageOpen} onOpenChange={setIsUsageOpen}>
            <div style={{ background: INK_800, border: `1px solid rgba(201,168,76,0.25)` }}>
              <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <CollapsibleTrigger asChild>
                  <button
                    className="flex items-center gap-2 text-left text-sm font-medium uppercase tracking-widest"
                    style={{ color: GOLD }}
                  >
                    {isUsageOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    Free Tier Usage
                  </button>
                </CollapsibleTrigger>
                <Button
                  onClick={() => setShowPaymentDialog(true)}
                  className="rounded-none text-xs uppercase tracking-widest px-6 py-2.5 font-semibold"
                  style={{ background: GOLD, color: INK_950 }}
                >
                  <Crown className="w-3.5 h-3.5 mr-2" />
                  Upgrade — $3.99/mo
                </Button>
              </div>
              <CollapsibleContent>
                <div className="px-6 pb-5 space-y-3">
                  <div className="flex justify-between text-sm" style={{ color: CHAMPAGNE_MUTED }}>
                    <span>Recommendations used</span>
                    <span style={{ color: CHAMPAGNE }}>{usedRecs} of 5</span>
                  </div>
                  <div className="w-full h-1 rounded-full" style={{ background: `rgba(201,168,76,0.1)` }}>
                    <div
                      className="h-1 rounded-full transition-all duration-500"
                      style={{ width: `${usagePercent}%`, background: `linear-gradient(to right, ${GOLD}, ${GOLD_BRIGHT})` }}
                    />
                  </div>
                  {usedRecs >= 5 && (
                    <p className="text-xs" style={{ color: "#e07b40" }}>
                      You've reached your free limit. Upgrade for unlimited recommendations.
                    </p>
                  )}
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        )}

        {/* ── TAB NAVIGATION ── */}
        <div style={{ borderBottom: `1px solid ${GOLD_BORDER}` }}>
          <div className="flex overflow-x-auto">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center gap-2 px-6 py-4 text-xs uppercase tracking-widest font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0"
                  style={{
                    color: isActive ? GOLD : CHAMPAGNE_SUBTLE,
                    borderBottom: isActive ? `2px solid ${GOLD}` : "2px solid transparent",
                    background: "transparent",
                    marginBottom: "-1px",
                  }}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── TAB CONTENT ── */}
        {activeTab === "recommendations" && (
          <div style={{ background: INK_800, border: `1px solid ${GOLD_BORDER}` }}>
            <div className="px-6 py-5" style={{ borderBottom: `1px solid ${GOLD_BORDER}` }}>
              <div className="flex items-center gap-3">
                <Star className="w-4 h-4" style={{ color: GOLD }} />
                <h2 className="font-playfair text-lg font-bold" style={{ color: CHAMPAGNE }}>
                  Wine Recommendations
                </h2>
              </div>
            </div>
            <WineRecommendations />
          </div>
        )}

        {activeTab === "scanner" && (
          <div style={{ background: INK_800, border: `1px solid ${GOLD_BORDER}` }}>
            <div className="px-6 py-5" style={{ borderBottom: `1px solid ${GOLD_BORDER}` }}>
              <div className="flex items-center gap-3">
                <Camera className="w-4 h-4" style={{ color: GOLD }} />
                <h2 className="font-playfair text-lg font-bold" style={{ color: CHAMPAGNE }}>
                  Bottle Scanner
                </h2>
              </div>
            </div>
            <WineScanner />
          </div>
        )}

        {activeTab === "library" && (
          <div style={{ background: INK_800, border: `1px solid ${GOLD_BORDER}` }}>
            <div className="px-6 py-5" style={{ borderBottom: `1px solid ${GOLD_BORDER}` }}>
              <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4" style={{ color: GOLD }} />
                <h2 className="font-playfair text-lg font-bold" style={{ color: CHAMPAGNE }}>
                  My Wine Library
                </h2>
              </div>
            </div>
            <WineLibrary onNavigateToRecommendations={() => setActiveTab("recommendations")} />
          </div>
        )}

        {activeTab === "community" && (
          <div style={{ background: INK_800, border: `1px solid ${GOLD_BORDER}` }}>
            <div className="px-6 py-5" style={{ borderBottom: `1px solid ${GOLD_BORDER}` }}>
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4" style={{ color: GOLD }} />
                <h2 className="font-playfair text-lg font-bold" style={{ color: CHAMPAGNE }}>
                  Community
                </h2>
              </div>
            </div>
            <CommunityHub />
          </div>
        )}

        {activeTab === "account" && (
          <div className="space-y-6">
            {/* Subscription status banner */}
            {user.isPremium && subscriptionData && (
              <div
                className="px-6 py-5"
                style={{ background: INK_800, border: `1px solid rgba(201,168,76,0.3)` }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Crown className="w-5 h-5" style={{ color: GOLD }} />
                    <div>
                      <p className="font-semibold text-sm" style={{ color: CHAMPAGNE }}>
                        Premium Monthly — $3.99/month
                      </p>
                      {subscriptionData.currentPeriodEnd && (
                        <p className="text-xs mt-0.5" style={{ color: CHAMPAGNE_SUBTLE }}>
                          {subscriptionData.cancelAtPeriodEnd ? "Cancels" : "Next billing"}:{" "}
                          {new Date(subscriptionData.currentPeriodEnd).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  {subscriptionData.cancelAtPeriodEnd ? (
                    <div className="flex items-center gap-3">
                      <span className="text-xs px-3 py-1.5 uppercase tracking-widest" style={{ color: "#e07b40", border: "1px solid rgba(224,123,64,0.3)" }}>
                        Cancelling
                      </span>
                      <Button
                        onClick={handleReactivatePlan}
                        className="rounded-none text-xs uppercase tracking-widest px-5 py-2"
                        style={{ background: GOLD, color: INK_950 }}
                      >
                        Reactivate
                      </Button>
                    </div>
                  ) : null}
                </div>
              </div>
            )}

            {/* Account info */}
            <div style={{ background: INK_800, border: `1px solid ${GOLD_BORDER}` }}>
              <div className="px-6 py-5" style={{ borderBottom: `1px solid ${GOLD_BORDER}` }}>
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4" style={{ color: GOLD }} />
                  <h2 className="font-playfair text-lg font-bold" style={{ color: CHAMPAGNE }}>
                    Account Information
                  </h2>
                </div>
              </div>
              <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: "First Name", value: user.firstName },
                  { label: "Email", value: user.email },
                  { label: "Username", value: user.username },
                  { label: "Membership", value: user.isPremium ? "Premium" : "Free" },
                ].map((field) => (
                  <div key={field.label}>
                    <p className="text-xs uppercase tracking-widest mb-1.5" style={{ color: CHAMPAGNE_SUBTLE }}>
                      {field.label}
                    </p>
                    <p className="text-sm font-medium" style={{ color: CHAMPAGNE }}>
                      {field.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Premium benefits */}
            {user.isPremium ? (
              <div style={{ background: INK_800, border: `1px solid rgba(201,168,76,0.25)` }}>
                <div className="px-6 py-5" style={{ borderBottom: `1px solid ${GOLD_BORDER}` }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Crown className="w-4 h-4" style={{ color: GOLD }} />
                      <h2 className="font-playfair text-lg font-bold" style={{ color: CHAMPAGNE }}>
                        Premium Benefits
                      </h2>
                    </div>
                    {!subscriptionData?.cancelAtPeriodEnd ? (
                      <button
                        onClick={() => setShowCancelDialog(true)}
                        className="text-xs uppercase tracking-widest transition-colors"
                        style={{ color: CHAMPAGNE_SUBTLE }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#e07b40")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = CHAMPAGNE_SUBTLE)}
                      >
                        Cancel plan
                      </button>
                    ) : (
                      <Button
                        onClick={handleReactivatePlan}
                        className="rounded-none text-xs uppercase tracking-widest px-5 py-2"
                        style={{ border: `1px solid ${GOLD_BORDER}`, color: GOLD, background: "transparent" }}
                      >
                        Reactivate
                      </Button>
                    )}
                  </div>
                </div>
                <div className="px-6 py-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    "Unlimited wine recommendations",
                    "Advanced bottle scanning",
                    "Personal wine library",
                    "Expert wine insights",
                    "Community access",
                    "Priority support",
                  ].map((benefit) => (
                    <div key={benefit} className="flex items-center gap-3">
                      <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: GOLD }} />
                      <span className="text-sm" style={{ color: CHAMPAGNE_MUTED }}>
                        {benefit}
                      </span>
                    </div>
                  ))}
                </div>
                {subscriptionData?.cancelAtPeriodEnd && (
                  <div className="mx-6 mb-6 px-4 py-3 text-xs" style={{ background: `rgba(201,168,76,0.08)`, border: `1px solid ${GOLD_BORDER}`, color: CHAMPAGNE_MUTED }}>
                    You'll retain full access until the end of your current billing period. You can reactivate anytime.
                  </div>
                )}
              </div>
            ) : (
              <div style={{ background: INK_800, border: `1px solid rgba(201,168,76,0.3)` }}>
                <div className="px-6 py-5" style={{ borderBottom: `1px solid ${GOLD_BORDER}` }}>
                  <div className="flex items-center gap-3">
                    <Crown className="w-4 h-4" style={{ color: GOLD }} />
                    <h2 className="font-playfair text-lg font-bold" style={{ color: CHAMPAGNE }}>
                      Upgrade to Premium
                    </h2>
                  </div>
                </div>
                <div className="px-6 py-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                    {[
                      "Unlimited wine recommendations",
                      "Advanced food pairing",
                      "Bottle scanning",
                      "Unlimited library storage",
                      "Community features",
                      "Priority support",
                    ].map((benefit) => (
                      <div key={benefit} className="flex items-center gap-3">
                        <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: GOLD }} />
                        <span className="text-sm" style={{ color: CHAMPAGNE_MUTED }}>
                          {benefit}
                        </span>
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={() => setShowPaymentDialog(true)}
                    className="w-full rounded-none py-4 font-semibold text-sm uppercase tracking-widest"
                    style={{ background: GOLD, color: INK_950 }}
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade Now — $3.99/month
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── PAYMENT DIALOG ── */}
      <PaymentDialog isOpen={showPaymentDialog} onClose={() => setShowPaymentDialog(false)} />

      {/* ── CANCEL DIALOG ── */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent
          className="sm:max-w-md rounded-none"
          style={{ background: INK_800, border: `1px solid ${GOLD_BORDER}` }}
        >
          <DialogHeader>
            <DialogTitle className="font-playfair text-xl" style={{ color: CHAMPAGNE }}>
              Cancel Premium Plan
            </DialogTitle>
            <DialogDescription style={{ color: CHAMPAGNE_SUBTLE }}>
              You'll lose access to all premium features. You can reactivate at any time.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            {["Unlimited wine recommendations", "Advanced bottle scanning", "Personal wine library", "Expert wine insights"].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: "#e07b40" }} />
                <span className="text-sm" style={{ color: CHAMPAGNE_MUTED }}>{item}</span>
              </div>
            ))}
          </div>
          <div
            className="px-4 py-3 mb-4 text-xs"
            style={{ background: `rgba(201,168,76,0.06)`, border: `1px solid ${GOLD_BORDER}`, color: CHAMPAGNE_MUTED }}
          >
            You'll keep access until the end of your current billing period.
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
              className="flex-1 rounded-none"
              style={{ border: `1px solid ${GOLD_BORDER}`, color: CHAMPAGNE_MUTED, background: "transparent" }}
            >
              Keep Premium
            </Button>
            <Button
              onClick={handleCancelPlan}
              className="flex-1 rounded-none"
              style={{ background: "transparent", border: "1px solid rgba(224,123,64,0.5)", color: "#e07b40" }}
            >
              Cancel Plan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
