import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Wine, Menu, X, User, LogOut, Crown, Camera, Bookmark } from "lucide-react";
import { useAuth, useLogout } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import AuthDialog from "./auth-dialog";
import logoPath from "@assets/cropped_1749956607943.png";

interface HeaderProps {
  onScrollTo: (section: string) => void;
}

export default function Header({ onScrollTo }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, isLoading } = useAuth();
  const logoutMutation = useLogout();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const navigation = isAuthenticated ? [
    { name: "Dashboard", id: "dashboard", isRoute: true },
  ] : [
    { name: "Recommendations", id: "recommendations" },
    { name: "Scanner", id: "scanner" },
    { name: "Library", id: "library" },
  ];

  const handleNavigation = (item: { name: string; id: string; isRoute?: boolean }) => {
    if (item.isRoute) {
      setLocation(`/${item.id}`);
    } else if (isAuthenticated) {
      // For authenticated users, redirect to dashboard with the specific tab
      setLocation("/dashboard");
    } else {
      // For unauthenticated users, try to scroll to section if it exists
      try {
        onScrollTo(item.id);
      } catch (error) {
        // If section doesn't exist, show authentication prompt
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

  return (
    <header className="bg-burgundy-700 shadow-sm border-b border-burgundy-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <img 
              src={logoPath} 
              alt="What the Wine" 
              className="h-12 w-auto object-contain"
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item)}
                className="text-white hover:text-creme-100 font-medium transition-colors duration-200"
              >
                {item.name}
              </button>
            ))}

            {/* Authentication Controls */}
            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-burgundy-500 animate-pulse" />
            ) : isAuthenticated && user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm">
                  <User className="w-4 h-4 text-white" />
                  <span className="text-white">
                    {user.firstName}
                    {user.isPremium && <Crown className="w-4 h-4 text-yellow-400 inline ml-1" />}
                  </span>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="border-white text-white hover:bg-white hover:text-burgundy-700"
                  disabled={logoutMutation.isPending}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {logoutMutation.isPending ? "Logging out..." : "Logout"}
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <AuthDialog defaultMode="login">
                  <Button
                    size="sm"
                    className="bg-white text-burgundy-700 hover:bg-creme-100"
                  >
                    Sign In
                  </Button>
                </AuthDialog>
                <AuthDialog defaultMode="register">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white text-white hover:bg-white hover:text-burgundy-700 bg-transparent"
                  >
                    Get Started
                  </Button>
                </AuthDialog>
              </div>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-creme-100"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Overlay */}
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
            
            {/* Floating Menu */}
            <div className="fixed top-20 left-4 right-4 bg-white rounded-2xl shadow-2xl z-50 md:hidden overflow-hidden">
              <div className="p-6">
                {/* Navigation Items */}
                <nav className="space-y-1 mb-6">
                  {navigation.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        handleNavigation(item);
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 rounded-lg text-burgundy-700 hover:bg-burgundy-50 font-medium transition-colors duration-200 flex items-center"
                    >
                      {item.name === "Dashboard" && <User className="w-4 h-4 mr-3" />}
                      {item.name === "Recommendations" && <Wine className="w-4 h-4 mr-3" />}
                      {item.name === "Scanner" && <Camera className="w-4 h-4 mr-3" />}
                      {item.name === "Library" && <Bookmark className="w-4 h-4 mr-3" />}
                      {item.name}
                    </button>
                  ))}
                </nav>

                {/* Authentication Section */}
                <div className="pt-4 border-t border-gray-200">
                  {isAuthenticated && user ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 px-4 py-2 bg-burgundy-50 rounded-lg">
                        <div className="w-8 h-8 bg-burgundy-600 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-burgundy-700">
                            {user.firstName}
                            {user.isPremium && <Crown className="w-4 h-4 text-yellow-500 inline ml-1" />}
                          </p>
                          <p className="text-xs text-burgundy-500">{user.email}</p>
                        </div>
                      </div>
                      <Button
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                        variant="outline"
                        size="sm"
                        className="w-full border-burgundy-300 text-burgundy-700 hover:bg-burgundy-50"
                        disabled={logoutMutation.isPending}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        {logoutMutation.isPending ? "Logging out..." : "Logout"}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <AuthDialog defaultMode="login">
                        <Button
                          size="sm"
                          className="w-full bg-burgundy-600 hover:bg-burgundy-700 text-white"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Sign In
                        </Button>
                      </AuthDialog>
                      <AuthDialog defaultMode="register">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-burgundy-300 text-burgundy-700 hover:bg-burgundy-50"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Get Started
                        </Button>
                      </AuthDialog>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
