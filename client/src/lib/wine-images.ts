import type { Wine } from "@shared/schema";

// Generate wine bottle image URL based on wine characteristics
export function generateWineImageUrl(wine: Wine | any): string {
  const wineType = wine.type?.toLowerCase() || 'wine';
  
  // Generate a consistent image based on wine characteristics
  const imageId = Math.abs(
    (wine.name?.charCodeAt(0) || 0) + 
    (wine.winery?.charCodeAt(0) || 0) + 
    (wine.region?.charCodeAt(0) || 0)
  ) % 5;
  
  const wineImages = {
    red: [
      'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1568213816046-0ee1c42bd559?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1596142332133-327e2a4ceb13?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=400&h=600&fit=crop'
    ],
    white: [
      'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1564424224827-cd24b8915874?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1568213816046-0ee1c42bd559?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=600&fit=crop'
    ],
    rose: [
      'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1564424224827-cd24b8915874?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1568213816046-0ee1c42bd559?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=600&fit=crop'
    ],
    sparkling: [
      'https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1542051838130-2e2c8a20c045?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1569275513865-77a7d5eb1b5c?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=400&h=600&fit=crop'
    ]
  };
  
  const typeImages = wineImages[wineType as keyof typeof wineImages] || wineImages.red;
  return typeImages[imageId % typeImages.length];
}