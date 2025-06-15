import type { Wine } from "@shared/schema";
import redWineImage from "@assets/red_1749966019645.jpg";
import sparklingWineImage from "@assets/sparkling_1749966019645.jpg";
import roseWineImage from "@assets/rose_1749966019645.png";
import whiteWineImage from "@assets/white_1749966019645.jpeg";

// Generate wine image URL based on wine type using uploaded images
export function generateWineImageUrl(wine: Wine | any): string {
  const wineType = wine.type?.toLowerCase() || 'red';
  
  // Map wine types to the corresponding uploaded images
  const wineImages = {
    red: redWineImage,
    white: whiteWineImage,
    rose: roseWineImage,
    rosé: roseWineImage, // Handle both spellings
    sparkling: sparklingWineImage,
    champagne: sparklingWineImage, // Champagne is sparkling wine
    prosecco: sparklingWineImage,  // Prosecco is sparkling wine
    cava: sparklingWineImage       // Cava is sparkling wine
  };
  
  return wineImages[wineType as keyof typeof wineImages] || wineImages.red;
}