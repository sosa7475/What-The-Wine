import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Wine, Brain, Camera, Bookmark, Crown, LogOut, User, Star, TrendingUp } from "lucide-react";
import logoPath from "@assets/cropped_1749956607943.png";
import Header from "@/components/header";
import WineRecommendations from "@/components/wine-recommendations";
import WineScanner from "@/components/wine-scanner";
import WineLibrary from "@/components/wine-library";
import Testimonials from "@/components/testimonials";
import AuthDialog from "@/components/auth-dialog";
import EmailSubscriptionForm from "@/components/email-subscription";
import { useAuth, useLogout } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const logoutMutation = useLogout();
  const { toast } = useToast();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
    <div className="min-h-screen bg-creme-50">
      <Header onScrollTo={scrollToSection} />
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-burgundy-600 to-burgundy-900 text-white">
        <div className="absolute inset-0 opacity-60">
          <img 
            src="https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080" 
            alt="Luxury wine cellar background" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-burgundy-900/70 to-burgundy-600/70"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-[#391316] leading-tight">Want to Impress Your Guests with the Perfect Wine—Every Time?</h2>
            <p className="text-xl mb-8 leading-relaxed text-[#391316]">Let the AI sommelier guide you to exceptional wines tailored to your taste, occasion, and culinary preferences</p>
            <Button
              onClick={() => scrollToSection('recommendations')}
              className="bg-gold-400 hover:bg-gold-500 text-burgundy-900 font-semibold px-8 py-4 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Get Wine Recommendations
            </Button>
          </div>
        </div>
      </section>

      {/* Relatable Story Section */}
      <section className="py-20 bg-gradient-to-br from-creme-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            <div className="space-y-4 text-lg leading-relaxed text-gray-700">
              <p className="font-medium">You've spent hours planning the meal…</p>
              <p className="font-medium">The table is beautifully set…</p>
              <p className="font-medium">Your friends are laughing in the kitchen…</p>
            </div>
            
            <div className="my-8">
              <div className="w-16 h-0.5 bg-burgundy-300 mx-auto"></div>
            </div>
            
            <div className="space-y-4 text-lg leading-relaxed text-gray-700">
              <p className="font-medium text-burgundy-700">But when it's time to pour the wine—</p>
              <p className="font-medium text-burgundy-700">you hesitate.</p>
            </div>
            
            <div className="bg-burgundy-50 rounded-2xl p-8 my-8">
              <div className="space-y-3 text-burgundy-600 italic">
                <p>"Will this go with the salmon?"</p>
                <p>"Is this too sweet for dinner?"</p>
                <p>"Do they even like red?"</p>
              </div>
            </div>
            
            <div className="space-y-6 text-lg leading-relaxed text-gray-700 max-w-3xl mx-auto">
              <p>
                We get it. You're not trying to be a sommelier—you just want to feel confident 
                that the wine you serve will wow your guests and make you look like the woman 
                who has it all together.
              </p>
              <p className="text-xl font-semibold text-burgundy-700">
                That's why we created What the Wine—your personal wine stylist for every occasion.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Wine Recommendations Section */}
      <div id="recommendations">
        <WineRecommendations />
      </div>
      {/* Wine Scanner Section */}
      <div id="scanner">
        <WineScanner />
      </div>
      {/* Wine Library Section */}
      <div id="library">
        <WineLibrary />
      </div>
      {/* Features Section */}
      <section className="py-20 bg-creme-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="font-playfair text-4xl font-bold text-burgundy-700 mb-4">
              Why Choose What the Wine?
            </h3>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Discover the perfect wine experience with our intelligent recommendations and comprehensive wine knowledge
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm text-center hover:shadow-md transition-shadow duration-200">
              <div className="w-16 h-16 bg-burgundy-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Brain className="text-white h-8 w-8" />
              </div>
              <h4 className="font-playfair text-xl font-semibold text-burgundy-700 mb-4">
                AI-Powered Recommendations
              </h4>
              <p className="text-gray-600">
                Our advanced AI analyzes your preferences, occasion, and food pairings to suggest the perfect wines for any moment.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm text-center hover:shadow-md transition-shadow duration-200">
              <div className="w-16 h-16 bg-burgundy-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Camera className="text-white h-8 w-8" />
              </div>
              <h4 className="font-playfair text-xl font-semibold text-burgundy-700 mb-4">
                Instant Wine Recognition
              </h4>
              <p className="text-gray-600">
                Simply snap a photo of any wine bottle to get detailed information, tasting notes, and expert pairing suggestions.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm text-center hover:shadow-md transition-shadow duration-200">
              <div className="w-16 h-16 bg-burgundy-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bookmark className="text-white h-8 w-8" />
              </div>
              <h4 className="font-playfair text-xl font-semibold text-burgundy-700 mb-4">
                Personal Wine Library
              </h4>
              <p className="text-gray-600">
                Build your personal collection, track your favorite wines, and never forget that perfect bottle you discovered.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Testimonials Section */}
      <Testimonials />
      {/* Secondary Call to Action Section */}
      <section className="py-20 bg-gradient-to-r from-burgundy-800 to-burgundy-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="wine-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="1.5" fill="white" opacity="0.3"/>
                <circle cx="5" cy="5" r="1" fill="white" opacity="0.2"/>
                <circle cx="15" cy="15" r="1" fill="white" opacity="0.2"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#wine-pattern)" />
          </svg>
        </div>
        
        {/* Wine Bottle Silhouettes */}
        <div className="absolute left-10 top-10 opacity-5 transform rotate-12">
          <svg width="60" height="120" viewBox="0 0 60 120" fill="white">
            <path d="M20 0h20v30l5 5v85h-30V35l5-5V0z"/>
          </svg>
        </div>
        <div className="absolute right-16 bottom-16 opacity-5 transform -rotate-12">
          <svg width="60" height="120" viewBox="0 0 60 120" fill="white">
            <path d="M20 0h20v30l5 5v85h-30V35l5-5V0z"/>
          </svg>
        </div>
        
        {/* Grape Vine Pattern */}
        <div className="absolute right-10 top-20 opacity-8">
          <svg width="80" height="100" viewBox="0 0 80 100" fill="white">
            <circle cx="20" cy="20" r="3"/>
            <circle cx="25" cy="25" r="3"/>
            <circle cx="30" cy="20" r="3"/>
            <circle cx="35" cy="25" r="3"/>
            <circle cx="22" cy="30" r="3"/>
            <circle cx="28" cy="32" r="3"/>
            <circle cx="33" cy="30" r="3"/>
            <path d="M25 10 Q30 15 35 10" stroke="white" strokeWidth="2" fill="none"/>
          </svg>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 bg-[391316]">
          <div className="mb-8">
            <h2 className="font-playfair text-4xl font-bold mb-6 text-[#391316]">
              Ready to Discover Your Perfect Wine?
            </h2>
            <p className="text-lg max-w-2xl mx-auto mb-8 text-[#391316]">
              Join thousands of wine enthusiasts who trust What the Wine for personalized recommendations, 
              expert insights, and unforgettable wine experiences.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <AuthDialog defaultMode="register">
              <Button
                size="lg"
                className="hover:bg-creme-100 px-8 py-3 bg-[#68272d] text-[#FFFFFF]"
              >
                <Wine className="w-5 h-5 mr-2" />
                Start Your Wine Journey
              </Button>
            </AuthDialog>
            <AuthDialog defaultMode="login">
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-burgundy-700 px-8 py-3"
              >
                Sign In to Continue
              </Button>
            </AuthDialog>
          </div>
        </div>
      </section>
      {/* Email Signup Section */}
      <section className="py-16 bg-creme-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            <div className="text-center mb-8">
              <h3 className="font-playfair text-3xl font-bold text-burgundy-700 mb-4">
                Stay in the Know
              </h3>
              <p className="text-gray-600 text-lg">
                Get weekly wine recommendations, expert tips, and exclusive offers delivered to your inbox.
              </p>
            </div>
            
            <EmailSubscriptionForm />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 pt-8 border-t border-gray-200">
              <div className="text-center">
                <div className="w-12 h-12 bg-burgundy-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Wine className="w-6 h-6 text-burgundy-600" />
                </div>
                <h4 className="font-semibold text-burgundy-700 mb-2">Weekly Picks</h4>
                <p className="text-sm text-gray-600">Curated wine selections based on trending tastes</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-burgundy-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Star className="w-6 h-6 text-burgundy-600" />
                </div>
                <h4 className="font-semibold text-burgundy-700 mb-2">Expert Tips</h4>
                <p className="text-sm text-gray-600">Professional advice from certified sommeliers</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-burgundy-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-burgundy-600" />
                </div>
                <h4 className="font-semibold text-burgundy-700 mb-2">Exclusive Offers</h4>
                <p className="text-sm text-gray-600">Special discounts and early access to features</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-burgundy-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <img 
                  src={logoPath} 
                  alt="What the Wine" 
                  className="h-8 w-8 object-contain"
                />
                <h4 className="font-playfair text-2xl font-bold">What the Wine</h4>
              </div>
              <p className="text-gray-300 mb-6 max-w-md">
                Your intelligent wine companion for discovering, exploring, and collecting exceptional wines from around the world.
              </p>
            </div>

            <div>
              <h5 className="font-semibold mb-4">Features</h5>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <button 
                    onClick={() => scrollToSection('recommendations')}
                    className="hover:text-gold-400 transition-colors text-left"
                  >
                    Wine Recommendations
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => scrollToSection('scan')}
                    className="hover:text-gold-400 transition-colors"
                  >
                    Bottle Scanner
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => scrollToSection('library')}
                    className="hover:text-gold-400 transition-colors"
                  >
                    Wine Library
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold mb-4">Support</h5>
              <ul className="space-y-2 text-gray-300">
                <li><a href="/help" className="hover:text-gold-400 transition-colors">Help Center</a></li>
                <li><a href="/contact" className="hover:text-gold-400 transition-colors">Contact Us</a></li>
                <li><a href="/privacy" className="hover:text-gold-400 transition-colors">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-gold-400 transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-burgundy-800 pt-8 text-center text-gray-400">
            <p>© 2024 What the Wine. All rights reserved. Elevating your wine experience with artificial intelligence.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
