import OpenAI from "openai";
import type { Wine, WinePreferences, InsertWine } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

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
      "imageUrl": "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=400",
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

Please provide real, high-quality wine recommendations that match these preferences. Include accurate pricing, ratings, and detailed tasting notes. For imageUrl, provide actual wine bottle image URLs from reputable sources like wine retailers or producers' websites.`;

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
    return result.wines || [];
  } catch (error) {
    console.error("Error getting wine recommendations:", error);
    throw new Error("Failed to get wine recommendations: " + (error as Error).message);
  }
}

export async function analyzeWineBottle(base64Image: string): Promise<InsertWine> {
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
  "imageUrl": "",
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
      imageUrl: result.imageUrl || "",
      alcoholContent: result.alcoholContent && !isNaN(parseFloat(result.alcoholContent)) ? parseFloat(result.alcoholContent) : 12.5,
      servingTemp: result.servingTemp || "Serve at cellar temperature",
      source: "scanned"
    } as Omit<Wine, 'id'>;
    
    return validatedWine;
  } catch (error) {
    console.error("Error analyzing wine bottle:", error);
    throw new Error("Failed to analyze wine bottle: " + (error as Error).message);
  }
}
