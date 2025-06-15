import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import Stripe from "stripe";
import { storage } from "./storage";
import { getWineRecommendations, analyzeWineBottle } from "./openai";
import { winePreferencesSchema, insertUserWineLibrarySchema, registerUserSchema, loginUserSchema } from "@shared/schema";
import { getSession, hashPassword, verifyPassword, requireAuth, optionalAuth } from "./auth";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware
  app.use(getSession());

  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = registerUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(userData.password);
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // Set session
      req.session.userId = user.id;
      req.session.user = user;

      res.json({ user: { id: user.id, email: user.email, username: user.username, firstName: user.firstName, isPremium: user.isPremium, recommendationCount: user.recommendationCount } });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginUserSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user || !(await verifyPassword(password, user.password))) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.userId = user.id;
      req.session.user = user;

      res.json({ user: { id: user.id, email: user.email, username: user.username, firstName: user.firstName, isPremium: user.isPremium, recommendationCount: user.recommendationCount } });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out" });
    });
  });

  app.get("/api/auth/me", optionalAuth, (req, res) => {
    if (req.session.user) {
      const user = req.session.user;
      res.json({ user: { id: user.id, email: user.email, username: user.username, firstName: user.firstName, isPremium: user.isPremium, recommendationCount: user.recommendationCount } });
    } else {
      res.json({ user: null });
    }
  });

  // Wine recommendations endpoint with usage limits
  app.post("/api/recommendations", optionalAuth, async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.session.user) {
        return res.status(401).json({ 
          error: "Authentication required",
          message: "Please sign up or log in to get wine recommendations" 
        });
      }

      const user = req.session.user;

      // Check usage limits for non-premium users
      if (!user.isPremium && (user.recommendationCount || 0) >= 3) {
        return res.status(402).json({ 
          error: "Usage limit reached",
          message: "You've used your 3 free recommendations. Upgrade to premium for unlimited access.",
          requiresPayment: true
        });
      }

      const preferences = winePreferencesSchema.parse(req.body);
      const recommendedWines = await getWineRecommendations(preferences);
      
      // Save wines to storage and return with IDs
      const savedWines = [];
      for (const wine of recommendedWines) {
        const savedWine = await storage.createWine(wine);
        savedWines.push(savedWine);
      }

      // Update user's recommendation count
      await storage.updateUserRecommendationCount(user.id);

      // Save recommendation record
      await storage.saveWineRecommendation({
        userId: user.id,
        occasion: preferences.occasion || null,
        budget: preferences.budget || null,
        foodPairing: preferences.foodPairing || null,
        wineType: preferences.wineType || null,
        preferences: preferences.preferences || null,
        recommendations: JSON.stringify(savedWines.map(w => w.id)),
      });

      res.json({ wines: savedWines });
    } catch (error) {
      console.error("Error getting recommendations:", error);
      res.status(500).json({ 
        error: "Failed to get wine recommendations",
        message: (error as Error).message 
      });
    }
  });

  // Wine bottle analysis endpoint
  app.post("/api/analyze-bottle", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      const base64Image = req.file.buffer.toString('base64');
      const analyzedWine = await analyzeWineBottle(base64Image);
      
      // Save analyzed wine to storage
      const savedWine = await storage.createWine(analyzedWine);
      
      res.json({ wine: savedWine });
    } catch (error) {
      console.error("Error analyzing bottle:", error);
      res.status(500).json({ 
        error: "Failed to analyze wine bottle",
        message: (error as Error).message 
      });
    }
  });

  // Get all wines
  app.get("/api/wines", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const wines = await storage.getWines(limit, offset);
      res.json({ wines });
    } catch (error) {
      console.error("Error fetching wines:", error);
      res.status(500).json({ error: "Failed to fetch wines" });
    }
  });

  // Email subscription endpoint
  app.post("/api/subscribe", async (req, res) => {
    try {
      const { email } = req.body;

      if (!email || !email.includes("@")) {
        return res.status(400).json({ error: "Valid email address is required" });
      }

      // Check if email already exists
      const existingSubscription = await storage.getSubscriptionByEmail(email);
      if (existingSubscription) {
        return res.json({ 
          message: "Email already subscribed",
          alreadySubscribed: true 
        });
      }

      // Add new subscription
      await storage.createSubscription({ email });

      res.json({ 
        message: "Successfully subscribed to our newsletter",
        success: true 
      });
    } catch (error) {
      console.error("Error subscribing email:", error);
      res.status(500).json({ 
        error: "Failed to subscribe", 
        message: (error as Error).message 
      });
    }
  });

  // Search wines
  app.get("/api/wines/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ error: "Search query required" });
      }
      const wines = await storage.searchWines(query);
      res.json({ wines });
    } catch (error) {
      console.error("Error searching wines:", error);
      res.status(500).json({ error: "Failed to search wines" });
    }
  });

  // Get wines by type
  app.get("/api/wines/type/:type", async (req, res) => {
    try {
      const type = req.params.type;
      const wines = await storage.getWinesByType(type);
      res.json({ wines });
    } catch (error) {
      console.error("Error fetching wines by type:", error);
      res.status(500).json({ error: "Failed to fetch wines by type" });
    }
  });

  // Stripe payment routes
  app.post("/api/create-payment-intent", requireAuth, async (req, res) => {
    try {
      const user = req.session.user!;
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: 999, // $9.99 for premium access
        currency: "usd",
        metadata: {
          userId: user.id.toString(),
        },
      });
      
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ error: "Failed to create payment intent" });
    }
  });

  app.post("/api/confirm-payment", requireAuth, async (req, res) => {
    try {
      const { paymentIntentId } = req.body;
      const user = req.session.user!;
      
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status === "succeeded") {
        // Update user to premium
        await storage.updateUserPremiumStatus(user.id, true);
        
        // Update session
        req.session.user = { ...user, isPremium: true };
        
        res.json({ success: true, message: "Payment successful! You now have unlimited access." });
      } else {
        res.status(400).json({ error: "Payment not completed" });
      }
    } catch (error) {
      console.error("Error confirming payment:", error);
      res.status(500).json({ error: "Failed to confirm payment" });
    }
  });

  // Get user wine library (requires auth)
  app.get("/api/library", requireAuth, async (req, res) => {
    try {
      const user = req.session.user!;
      const library = await storage.getUserWineLibrary(user.id);
      res.json({ library });
    } catch (error) {
      console.error("Error fetching wine library:", error);
      res.status(500).json({ error: "Failed to fetch wine library" });
    }
  });

  // Add wine to library (requires auth)
  app.post("/api/library", requireAuth, async (req, res) => {
    try {
      const user = req.session.user!;
      const { wineId, personalNotes } = req.body;
      
      // Check if wine is already in library
      const exists = await storage.isWineInLibrary(user.id, wineId);
      if (exists) {
        return res.status(400).json({ error: "Wine already in library" });
      }
      
      const libraryEntry = await storage.addWineToLibrary({
        userId: user.id,
        wineId,
        personalNotes: personalNotes || null,
      });
      res.json({ entry: libraryEntry });
    } catch (error) {
      console.error("Error adding wine to library:", error);
      res.status(500).json({ error: "Failed to add wine to library" });
    }
  });

  // Remove wine from library (requires auth)
  app.delete("/api/library/:wineId", requireAuth, async (req, res) => {
    try {
      const user = req.session.user!;
      const wineId = parseInt(req.params.wineId);
      
      if (isNaN(wineId)) {
        return res.status(400).json({ error: "Invalid wine ID" });
      }
      
      const removed = await storage.removeWineFromLibrary(user.id, wineId);
      if (!removed) {
        return res.status(404).json({ error: "Wine not found in library" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing wine from library:", error);
      res.status(500).json({ error: "Failed to remove wine from library" });
    }
  });

  // Get user recommendations history
  app.get("/api/recommendations/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      
      const recommendations = await storage.getUserRecommendations(userId);
      res.json({ recommendations });
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      res.status(500).json({ error: "Failed to fetch recommendations" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
