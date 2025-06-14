import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Wine, Brain, Camera, Bookmark } from "lucide-react";
import Header from "@/components/header";
import WineRecommendations from "@/components/wine-recommendations";
import WineScanner from "@/components/wine-scanner";
import WineLibrary from "@/components/wine-library";

export default function Home() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-creme-50">
      <Header onScrollTo={scrollToSection} />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-burgundy-600 to-burgundy-900 text-white">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080" 
            alt="Luxury wine cellar background" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="font-playfair text-5xl sm:text-6xl font-bold mb-6">
              Discover Your Perfect Wine
            </h2>
            <p className="text-xl text-gray-100 mb-8 leading-relaxed">
              Let our AI sommelier guide you to exceptional wines tailored to your taste, occasion, and culinary preferences
            </p>
            <Button
              onClick={() => scrollToSection('recommendations')}
              className="bg-gold-400 hover:bg-gold-500 text-burgundy-900 font-semibold px-8 py-4 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Get Wine Recommendations
            </Button>
          </div>
        </div>
      </section>

      {/* Wine Recommendations Section */}
      <WineRecommendations />

      {/* Wine Scanner Section */}
      <WineScanner />

      {/* Wine Library Section */}
      <WineLibrary />

      {/* Features Section */}
      <section className="py-20 bg-creme-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="font-playfair text-4xl font-bold text-burgundy-700 mb-4">
              Why Choose Sommelier AI?
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

      {/* Footer */}
      <footer className="bg-burgundy-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <Wine className="text-gold-400 h-8 w-8" />
                <h4 className="font-playfair text-2xl font-bold">Sommelier AI</h4>
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
                    className="hover:text-gold-400 transition-colors"
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
                <li><a href="#" className="hover:text-gold-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-gold-400 transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-gold-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-gold-400 transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-burgundy-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Sommelier AI. All rights reserved. Elevating your wine experience with artificial intelligence.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
