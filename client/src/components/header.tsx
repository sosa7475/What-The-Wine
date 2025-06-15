import { Wine } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onScrollTo: (section: string) => void;
}

export default function Header({ onScrollTo }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-creme-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <img 
              src="@assets/WtW_1749955950754.png" 
              alt="What the Wine" 
              className="h-10 w-10 object-contain"
            />
            <h1 className="font-playfair text-2xl font-bold text-burgundy-700">What the Wine</h1>
          </div>
          <nav className="hidden md:flex space-x-8">
            <button
              onClick={() => onScrollTo('recommendations')}
              className="text-gray-700 hover:text-burgundy-600 font-medium transition-colors"
            >
              Recommendations
            </button>
            <button
              onClick={() => onScrollTo('scan')}
              className="text-gray-700 hover:text-burgundy-600 font-medium transition-colors"
            >
              Scan Wine
            </button>
            <button
              onClick={() => onScrollTo('library')}
              className="text-gray-700 hover:text-burgundy-600 font-medium transition-colors"
            >
              My Library
            </button>
          </nav>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="hidden md:flex">
              <Wine className="h-4 w-4 mr-2" />
              Profile
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
