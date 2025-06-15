import OpenAI from "openai";
import type { Wine, WinePreferences, InsertWine } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

// Generate wine bottle image URL based on wine characteristics
function generateWineImageUrl(wine: any): string {
  const wineType = wine.type?.toLowerCase() || 'red';
  
  // Generate a consistent image based on wine characteristics
  const imageId = Math.abs(
    (wine.name?.charCodeAt(0) || 0) + 
    (wine.winery?.charCodeAt(0) || 0) + 
    (wine.region?.charCodeAt(0) || 0)
  ) % 5;
  
  // Use curated wine-specific images from reliable sources
  const wineImages = {
    red: [
      'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=600&fit=crop&q=80', // Red wine bottle
      'https://images.unsplash.com/photo-1586370434639-0fe43b2d32d6?w=400&h=600&fit=crop&q=80', // Red wine glass
      'https://images.unsplash.com/photo-1568213816046-0ee1c42bd559?w=400&h=600&fit=crop&q=80', // Red wine bottle
      'https://images.unsplash.com/photo-1596142332133-327e2a4ceb13?w=400&h=600&fit=crop&q=80', // Red wine bottle
      'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=400&h=600&fit=crop&q=80'  // Red wine glass
    ],
    white: [
      'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400&h=600&fit=crop&q=80', // White wine glass
      'https://images.unsplash.com/photo-1564424224827-cd24b8915874?w=400&h=600&fit=crop&q=80', // White wine bottle
      'https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?w=400&h=600&fit=crop&q=80', // White wine glass
      'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=600&fit=crop&q=80', // White wine bottle
      'https://images.unsplash.com/photo-1574870111867-089730e5a72e?w=400&h=600&fit=crop&q=80'  // White wine glass
    ],
    rose: [
      'https://images.unsplash.com/photo-1597877638571-942f3e04e0bd?w=400&h=600&fit=crop&q=80', // Rosé wine glass
      'https://images.unsplash.com/photo-1564424224827-cd24b8915874?w=400&h=600&fit=crop&q=80', // Pink wine bottle
      'https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?w=400&h=600&fit=crop&q=80', // Rosé wine glass
      'https://images.unsplash.com/photo-1574870111867-089730e5a72e?w=400&h=600&fit=crop&q=80', // Light wine glass
      'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400&h=600&fit=crop&q=80'  // Clear wine glass
    ],
    sparkling: [
      'https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=400&h=600&fit=crop&q=80', // Champagne glass
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop&q=80', // Champagne bottle
      'https://images.unsplash.com/photo-1542051838130-2e2c8a20c045?w=400&h=600&fit=crop&q=80', // Champagne flute
      'https://images.unsplash.com/photo-1569275513865-77a7d5eb1b5c?w=400&h=600&fit=crop&q=80', // Sparkling wine
      'https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=400&h=600&fit=crop&q=80'  // Champagne bottle
    ]
  };
  
  const typeImages = wineImages[wineType as keyof typeof wineImages] || wineImages.red;
  return typeImages[imageId % typeImages.length];
}

export async function getWineRecommendations(preferences: WinePreferences): Promise<Wine[]> {
  try {
    const prompt = `You are a professional sommelier. Based on the following preferences, recommend 3 wines with detailed information. Respond with JSON in this exact format:

{
  "wines": [
    {
      "name": "Wine Name",
      "winery": "Winery Name",
      "region": "Region",
      "country": "Country",
      "vintage": 2020,
      "type": "red|white|rose|sparkling|dessert",
      "price": 45.99,
      "rating": 4.2,
      "description": "Detailed description of the wine",
      "tasteProfile": "Taste profile and notes",
      "foodPairings": ["pairing1", "pairing2", "pairing3"],
      "alcoholContent": 13.5,
      "servingTemp": "16-18°C",
      "source": "recommendation"
    }
  ]
}

User preferences:
- Occasion: ${preferences.occasion || 'Any'}
- Budget: ${preferences.budget || 'Any'}
- Food Pairing: ${preferences.foodPairing || 'Any'}
- Wine Type: ${preferences.wineType || 'Any'}
- Additional Preferences: ${preferences.preferences || 'None'}

Please provide real, high-quality wine recommendations that match these preferences. Include accurate pricing, ratings, and detailed tasting notes.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a world-class sommelier with extensive knowledge of wines from around the globe. Provide accurate, detailed wine recommendations."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    const wines = result.wines || [];
    
    // Add wine bottle images to each recommendation
    const winesWithImages = wines.map((wine: any) => ({
      ...wine,
      imageUrl: generateWineImageUrl(wine)
    }));
    
    return winesWithImages;
  } catch (error) {
    console.error("Error getting wine recommendations:", error);
    throw new Error("Failed to get wine recommendations: " + (error as Error).message);
  }
}

export async function analyzeWineBottle(base64Image: string): Promise<any> {
  try {
    const prompt = `Analyze this wine bottle image and provide detailed information about the wine. Respond with JSON in this exact format:

{
  "name": "Wine Name",
  "winery": "Winery Name",
  "region": "Region",
  "country": "Country",
  "vintage": 2020,
  "type": "red|white|rose|sparkling|dessert",
  "price": 45.99,
  "rating": 4.2,
  "description": "Detailed description of the wine",
  "tasteProfile": "Taste profile and notes",
  "foodPairings": ["pairing1", "pairing2", "pairing3"],
  "alcoholContent": 13.5,
  "servingTemp": "16-18°C",
  "source": "scanned"
}

Identify the wine from the label and provide accurate information including tasting notes, food pairings, and market information.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    // Validate and provide fallback values for required fields
    const validatedWine = {
      name: result.name || "Unknown Wine",
      winery: result.winery || "Unknown Winery",
      region: result.region || "Unknown Region",
      country: result.country || "Unknown Country",
      vintage: result.vintage && !isNaN(parseInt(result.vintage)) ? parseInt(result.vintage) : new Date().getFullYear(),
      type: ["red", "white", "rose", "sparkling", "dessert"].includes(result.type) ? result.type : "red",
      price: result.price && !isNaN(parseFloat(result.price)) ? parseFloat(result.price) : 0,
      rating: result.rating && !isNaN(parseFloat(result.rating)) ? Math.min(5, Math.max(0, parseFloat(result.rating))) : 0,
      description: result.description || "Wine details analyzed from bottle image",
      tasteProfile: result.tasteProfile || "Profile not available",
      foodPairings: Array.isArray(result.foodPairings) ? result.foodPairings : ["Various dishes"],
      imageUrl: generateWineImageUrl(result),
      alcoholContent: result.alcoholContent && !isNaN(parseFloat(result.alcoholContent)) ? parseFloat(result.alcoholContent) : 12.5,
      servingTemp: result.servingTemp || "Serve at cellar temperature",
      source: "scanned"
    };
    
    return validatedWine;
  } catch (error) {
    console.error("Error analyzing wine bottle:", error);
    throw new Error("Failed to analyze wine bottle: " + (error as Error).message);
  }
}