import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut, Crown, Camera, Bookmark, Wine } from "lucide-react";
import { useAuth, useLogout } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import AuthDialog from "./auth-dialog";
import logoPath from "@assets/cropped_1749956607943.png";

const GOLD = "#C9A84C";
const GOLD_BORDER = "rgba(201, 168, 76, 0.18)";
const CHAMPAGNE = "#F5EDD6";
const CHAMPAGNE_MUTED = "#C5B59A";
const CHAMPAGNE_SUBTLE = "#7A6A5A";
const INK_950 = "#050203";
const INK_900 = "#0a0408";
const INK_800 = "#130810";

interface HeaderProps {
  onScrollTo: (section: string) => void;
}

export default function Header({ onScrollTo }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const { user, isAuthenticated, isLoading } = useAuth();
  const logoutMutation = useLogout();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();

  const isSupportPage =
    location.includes("/help") ||
    location.includes("/contact") ||
    location.includes("/privacy") ||
    location.includes("/terms") ||
    location.includes("/for-agents");

  const navigation = isAuthenticated
    ? [{ name: "Dashboard", id: "dashboard", isRoute: true }]
    : [
        { name: "Recommendations", id: "recommendations" },
        { name: "Scanner", id: "scanner" },
        { name: "Library", id: "library" },
      ];

  const handleNavigation = (item: { name: string; id: string; isRoute?: boolean }) => {
    if (item.isRoute) {
      setLocation(`/${item.id}`);
    } else if (isSupportPage) {
      setLocation("/");
    } else if (isAuthenticated) {
      setLocation("/dashboard");
    } else {
      try {
        onScrollTo(item.id);
      } catch {
        toast({
          title: "Sign In Required",
          description: `Please sign in to access the ${item.name.toLowerCase()} feature.`,
          variant: "destructive",
        });
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      setLocation("/");
      toast({ title: "Logged out", description: "You've been successfully logged out." });
    } catch {
      toast({ title: "Error", description: "Failed to log out. Please try again.", variant: "destructive" });
    }
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: INK_950,
        borderBottom: `1px solid ${GOLD_BORDER}`,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <button
            onClick={() => (isSupportPage ? setLocation("/") : onScrollTo("hero"))}
            className="flex items-center gap-3 focus:outline-none group"
          >
            <img
              src={logoPath}
              alt="What the Wine"
              className="h-9 w-auto object-contain transition-opacity group-hover:opacity-80"
            />
            <span
              className="font-playfair text-base font-semibold hidden sm:block tracking-wide"
              style={{ color: CHAMPAGNE }}
            >
              What the Wine
            </span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item)}
                className="text-xs uppercase tracking-widest font-medium transition-colors duration-200"
                style={{ color: CHAMPAGNE_SUBTLE }}
                onMouseEnter={(e) => (e.currentTarget.style.color = CHAMPAGNE_MUTED)}
                onMouseLeave={(e) => (e.currentTarget.style.color = CHAMPAGNE_SUBTLE)}
              >
                {item.name}
              </button>
            ))}

            {isLoading ? (
              <div className="w-8 h-8 rounded-full animate-pulse" style={{ background: INK_800 }} />
            ) : isAuthenticated && user ? (
              <div className="flex items-center gap-5">
                <div className="flex items-center gap-2 text-xs" style={{ color: CHAMPAGNE_MUTED }}>
                  <User className="w-3.5 h-3.5" />
                  <span>{user.firstName}</span>
                  {user.isPremium && <Crown className="w-3.5 h-3.5" style={{ color: GOLD }} />}
                </div>
                <button
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  className="text-xs uppercase tracking-widest transition-colors duration-200"
                  style={{ color: CHAMPAGNE_SUBTLE }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = CHAMPAGNE_MUTED)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = CHAMPAGNE_SUBTLE)}
                >
                  <LogOut className="w-3.5 h-3.5 inline mr-1.5" />
                  {logoutMutation.isPending ? "…" : "Sign Out"}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <AuthDialog defaultMode="login">
                  <button
                    className="text-xs uppercase tracking-widest font-medium transition-colors duration-200"
                    style={{ color: CHAMPAGNE_SUBTLE }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = CHAMPAGNE_MUTED)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = CHAMPAGNE_SUBTLE)}
                  >
                    Sign In
                  </button>
                </AuthDialog>
                <AuthDialog defaultMode="register">
                  <button
                    className="text-xs uppercase tracking-widest font-medium px-5 py-2 transition-all duration-200"
                    style={{
                      border: `1px solid ${GOLD_BORDER}`,
                      color: GOLD,
                      background: "transparent",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(201,168,76,0.08)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    Get Started
                  </button>
                </AuthDialog>
              </div>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 transition-colors"
            style={{ color: CHAMPAGNE_SUBTLE }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 md:hidden"
            style={{ background: "rgba(5,2,3,0.7)", backdropFilter: "blur(4px)" }}
            onClick={() => setIsMenuOpen(false)}
          />
          <div
            className="fixed top-16 left-4 right-4 z-50 md:hidden"
            style={{ background: INK_800, border: `1px solid ${GOLD_BORDER}` }}
          >
            <nav className="p-6 space-y-1">
              {navigation.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { handleNavigation(item); setIsMenuOpen(false); }}
                  className="w-full text-left px-4 py-3 text-xs uppercase tracking-widest font-medium transition-colors duration-200 flex items-center gap-3"
                  style={{ color: CHAMPAGNE_SUBTLE }}
                >
                  {item.name === "Dashboard" && <User className="w-3.5 h-3.5" />}
                  {item.name === "Recommendations" && <Wine className="w-3.5 h-3.5" />}
                  {item.name === "Scanner" && <Camera className="w-3.5 h-3.5" />}
                  {item.name === "Library" && <Bookmark className="w-3.5 h-3.5" />}
                  {item.name}
                </button>
              ))}
            </nav>

            <div className="px-6 pb-6 pt-2" style={{ borderTop: `1px solid ${GOLD_BORDER}` }}>
              {isAuthenticated && user ? (
                <div className="space-y-4 pt-4">
                  <div
                    className="flex items-center gap-3 px-4 py-3"
                    style={{ background: "rgba(201,168,76,0.06)", border: `1px solid ${GOLD_BORDER}` }}
                  >
                    <div
                      className="w-8 h-8 flex items-center justify-center"
                      style={{ background: "rgba(201,168,76,0.1)" }}
                    >
                      <User className="w-4 h-4" style={{ color: GOLD }} />
                    </div>
                    <div>
                      <p className="text-xs font-medium" style={{ color: CHAMPAGNE }}>
                        {user.firstName}
                        {user.isPremium && <Crown className="w-3 h-3 inline ml-1.5" style={{ color: GOLD }} />}
                      </p>
                      <p className="text-xs" style={{ color: CHAMPAGNE_SUBTLE }}>{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                    disabled={logoutMutation.isPending}
                    className="w-full py-3 text-xs uppercase tracking-widest text-center transition-colors"
                    style={{ border: `1px solid ${GOLD_BORDER}`, color: CHAMPAGNE_SUBTLE }}
                  >
                    <LogOut className="w-3.5 h-3.5 inline mr-2" />
                    {logoutMutation.isPending ? "Signing out…" : "Sign Out"}
                  </button>
                </div>
              ) : (
                <div className="space-y-3 pt-4">
                  <button
                    onClick={() => { setAuthMode("login"); setShowAuthDialog(true); setIsMenuOpen(false); }}
                    className="w-full py-3 text-xs uppercase tracking-widest text-center transition-colors"
                    style={{ border: `1px solid ${GOLD_BORDER}`, color: CHAMPAGNE_MUTED, background: "transparent" }}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => { setAuthMode("register"); setShowAuthDialog(true); setIsMenuOpen(false); }}
                    className="w-full py-3 text-xs uppercase tracking-widest font-semibold text-center"
                    style={{ background: GOLD, color: INK_950 }}
                  >
                    Get Started
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Standalone AuthDialog for mobile */}
      <AuthDialog
        defaultMode={authMode}
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
      >
        <div />
      </AuthDialog>
    </header>
  );
}
