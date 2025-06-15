import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Wine, Menu, X, User, LogOut, Crown } from "lucide-react";
import { useAuth, useLogout } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
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

  const navigation = [
    { name: "Recommendations", id: "recommendations" },
    { name: "Scanner", id: "scanner" },
    { name: "Library", id: "library" },
  ];

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
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
                onClick={() => onScrollTo(item.id)}
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
                    className="border-white text-white hover:bg-white hover:text-burgundy-700"
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

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-burgundy-600">
            <nav className="flex flex-col space-y-3">
              {navigation.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onScrollTo(item.id);
                    setIsMenuOpen(false);
                  }}
                  className="text-left text-white hover:text-creme-100 font-medium transition-colors duration-200 py-2"
                >
                  {item.name}
                </button>
              ))}

              {/* Mobile Authentication */}
              <div className="pt-4 border-t border-burgundy-600">
                {isAuthenticated && user ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm text-white">
                      <User className="w-4 h-4 text-white" />
                      <span>
                        {user.firstName}
                        {user.isPremium && <Crown className="w-4 h-4 text-yellow-400 inline ml-1" />}
                      </span>
                    </div>
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      size="sm"
                      className="w-full border-white text-white hover:bg-white hover:text-burgundy-700"
                      disabled={logoutMutation.isPending}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      {logoutMutation.isPending ? "Logging out..." : "Logout"}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <AuthDialog defaultMode="login">
                      <Button
                        size="sm"
                        className="w-full bg-white text-burgundy-700 hover:bg-creme-100"
                      >
                        Sign In
                      </Button>
                    </AuthDialog>
                    <AuthDialog defaultMode="register">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-white text-white hover:bg-white hover:text-burgundy-700"
                      >
                        Get Started
                      </Button>
                    </AuthDialog>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
