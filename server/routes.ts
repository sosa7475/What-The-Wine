import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import Stripe from "stripe";
import { storage } from "./storage";
import { getWineRecommendations, analyzeWineBottle } from "./openai";
import { 
  winePreferencesSchema, 
  insertUserWineLibrarySchema, 
  registerUserSchema, 
  loginUserSchema,
  insertWineReviewSchema,
  insertCommunityRecommendationSchema,
  insertReviewCommentSchema,
  insertRecommendationCommentSchema
} from "@shared/schema";
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
      if (!user.isPremium && (user.recommendationCount || 0) >= 5) {
        return res.status(402).json({ 
          error: "Usage limit reached",
          message: "You've used your 5 free recommendations. Upgrade to premium for unlimited access.",
          requiresPayment: true
        });
      }

      const preferences = winePreferencesSchema.parse(req.body);
      const recommendedWines = await getWineRecommendations(preferences);
      
      // Save wines to storage linked to user
      const savedWines = [];
      for (const wine of recommendedWines) {
        const savedWine = await storage.createUserWine(wine, user.id);
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
  app.post("/api/analyze-bottle", requireAuth, upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const base64Image = req.file.buffer.toString('base64');
      const analyzedWine = await analyzeWineBottle(base64Image);
      
      // Save analyzed wine linked to user
      const savedWine = await storage.createUserWine(analyzedWine, userId);
      
      res.json({ wine: savedWine });
    } catch (error) {
      console.error("Error analyzing bottle:", error);
      res.status(500).json({ 
        error: "Failed to analyze wine bottle",
        message: (error as Error).message 
      });
    }
  });

  // Get all wines (public wines only)
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

  // Get user-specific wines
  app.get("/api/user/wines", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const wines = await storage.getUserWines(userId);
      res.json({ wines });
    } catch (error) {
      console.error("Error fetching user wines:", error);
      res.status(500).json({ error: "Failed to fetch user wines" });
    }
  });

  // Stripe checkout session for premium subscription
  app.post("/api/create-checkout-session", requireAuth, async (req, res) => {
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'What the Wine Premium',
                description: 'Unlimited wine recommendations and premium features',
              },
              unit_amount: 695, // $6.95 in cents
              recurring: {
                interval: 'month',
              },
            },
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${req.headers.origin}/dashboard?upgrade=success`,
        cancel_url: `${req.headers.origin}/dashboard?upgrade=cancelled`,
        metadata: {
          userId: req.session.userId?.toString() || '',
        },
      });

      res.json({ url: session.url });
    } catch (error) {
      console.error('Error creating checkout session:', error);
      res.status(500).json({ error: 'Failed to create checkout session' });
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

  // Community Features - Wine Reviews
  app.post("/api/community/reviews", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user!.id;
      const reviewData = insertWineReviewSchema.parse(req.body);
      
      const review = await storage.createWineReview(reviewData, userId);
      
      res.json(review);
    } catch (error) {
      console.error("Error creating wine review:", error);
      res.status(500).json({ error: "Failed to create wine review" });
    }
  });

  app.get("/api/community/reviews/wine/:wineId", async (req, res) => {
    try {
      const wineId = parseInt(req.params.wineId);
      const reviews = await storage.getWineReviews(wineId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching wine reviews:", error);
      res.status(500).json({ error: "Failed to fetch wine reviews" });
    }
  });

  app.get("/api/community/reviews/user", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user!.id;
      const reviews = await storage.getUserReviews(userId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching user reviews:", error);
      res.status(500).json({ error: "Failed to fetch user reviews" });
    }
  });

  // Community Features - Wine Recommendations
  app.post("/api/community/recommendations", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user!.id;
      const recommendationData = insertCommunityRecommendationSchema.parse(req.body);
      
      const recommendation = await storage.createCommunityRecommendation(recommendationData, userId);
      
      res.json(recommendation);
    } catch (error) {
      console.error("Error creating community recommendation:", error);
      res.status(500).json({ error: "Failed to create community recommendation" });
    }
  });

  app.get("/api/community/recommendations", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const recommendations = await storage.getCommunityRecommendations(limit, offset);
      res.json(recommendations);
    } catch (error) {
      console.error("Error fetching community recommendations:", error);
      res.status(500).json({ error: "Failed to fetch community recommendations" });
    }
  });

  app.get("/api/community/recommendations/user", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user!.id;
      const recommendations = await storage.getUserCommunityRecommendations(userId);
      res.json(recommendations);
    } catch (error) {
      console.error("Error fetching user recommendations:", error);
      res.status(500).json({ error: "Failed to fetch user recommendations" });
    }
  });

  app.post("/api/community/recommendations/:id/like", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user!.id;
      const recommendationId = parseInt(req.params.id);
      
      const liked = await storage.toggleRecommendationLike(userId, recommendationId);
      res.json({ liked });
    } catch (error) {
      console.error("Error toggling recommendation like:", error);
      res.status(500).json({ error: "Failed to toggle recommendation like" });
    }
  });

  // Community Features - Comments
  app.post("/api/community/reviews/:reviewId/comments", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user!.id;
      const reviewId = parseInt(req.params.reviewId);
      const commentData = insertReviewCommentSchema.parse(req.body);
      
      const comment = await storage.createReviewComment({
        ...commentData,
        userId,
        reviewId,
      });
      
      res.json(comment);
    } catch (error) {
      console.error("Error creating review comment:", error);
      res.status(500).json({ error: "Failed to create review comment" });
    }
  });

  app.get("/api/community/reviews/:reviewId/comments", async (req, res) => {
    try {
      const reviewId = parseInt(req.params.reviewId);
      const comments = await storage.getReviewComments(reviewId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching review comments:", error);
      res.status(500).json({ error: "Failed to fetch review comments" });
    }
  });

  app.post("/api/community/recommendations/:recommendationId/comments", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user!.id;
      const recommendationId = parseInt(req.params.recommendationId);
      const commentData = insertRecommendationCommentSchema.parse(req.body);
      
      const comment = await storage.createRecommendationComment({
        ...commentData,
        userId,
        recommendationId,
      });
      
      res.json(comment);
    } catch (error) {
      console.error("Error creating recommendation comment:", error);
      res.status(500).json({ error: "Failed to create recommendation comment" });
    }
  });

  app.get("/api/community/recommendations/:recommendationId/comments", async (req, res) => {
    try {
      const recommendationId = parseInt(req.params.recommendationId);
      const comments = await storage.getRecommendationComments(recommendationId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching recommendation comments:", error);
      res.status(500).json({ error: "Failed to fetch recommendation comments" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
