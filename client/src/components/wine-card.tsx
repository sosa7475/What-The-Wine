import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Info, Star, Trash2, Wine } from "lucide-react";
import type { Wine as WineType } from "@shared/schema";

interface WineCardProps {
  wine: WineType;
  onSave?: () => void;
  onRemove?: () => void;
  onViewDetails?: () => void;
  isSaved?: boolean;
  isInLibrary?: boolean;
  showRemove?: boolean;
}

export default function WineCard({
  wine,
  onSave,
  onRemove,
  onViewDetails,
  isSaved = false,
  isInLibrary = false,
  showRemove = false,
}: WineCardProps) {
  const formatPrice = (price: number | null) => {
    if (!price) return "N/A";
    return `$${price.toFixed(0)}`;
  };

  const formatRating = (rating: number | null) => {
    if (!rating) return "N/A";
    return `${rating.toFixed(1)}★`;
  };

  return (
    <Card className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="h-64 bg-gray-50 flex items-center justify-center">
        {wine.imageUrl ? (
          <img
            src={wine.imageUrl}
            alt={`${wine.name} wine bottle`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center text-gray-400">
            <Wine className="h-16 w-16 mb-2" />
            <span className="text-sm">No image available</span>
          </div>
        )}
      </div>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h5 className="font-playfair text-xl font-semibold text-burgundy-700 line-clamp-2">
            {wine.name}
          </h5>
          <div className="flex items-center text-gold-500">
            <Star className="h-4 w-4 mr-1" />
            <span className="font-medium text-sm">{formatRating(wine.rating)}</span>
          </div>
        </div>
        
        <p className="text-gray-600 mb-2">{wine.winery}</p>
        <p className="text-gray-600 mb-2">{wine.region}, {wine.country}</p>
        
        <div className="flex items-center justify-between mb-4">
          <Badge variant="secondary" className="bg-creme-100 text-burgundy-700">
            {wine.type}
          </Badge>
          <span className="text-burgundy-600 font-semibold">{formatPrice(wine.price)}</span>
        </div>
        
        {wine.description && (
          <p className="text-gray-700 text-sm mb-4 line-clamp-3">{wine.description}</p>
        )}
        
        {wine.foodPairings && wine.foodPairings.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-burgundy-700 mb-2">Food Pairings:</p>
            <div className="flex flex-wrap gap-1">
              {wine.foodPairings.slice(0, 3).map((pairing: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {pairing}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex space-x-3">
          {!isInLibrary && onSave && (
            <Button
              onClick={onSave}
              className={`flex-1 transition-colors duration-200 ${
                isSaved
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-burgundy-600 hover:bg-burgundy-700"
              }`}
            >
              <Heart className="h-4 w-4 mr-2" />
              {isSaved ? "Saved" : "Save"}
            </Button>
          )}
          
          {onViewDetails && (
            <Button
              variant="outline"
              onClick={onViewDetails}
              className="flex-1 border-burgundy-600 text-burgundy-600 hover:bg-burgundy-50"
            >
              <Info className="h-4 w-4 mr-2" />
              Details
            </Button>
          )}
          
          {showRemove && onRemove && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRemove}
              className="text-gray-400 hover:text-red-500 border-gray-300 hover:border-red-300"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
