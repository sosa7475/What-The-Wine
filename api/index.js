var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/vercel-entry.ts
import express from "express";

// server/routes.ts
import { createServer } from "http";
import multer from "multer";
import Stripe from "stripe";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  communityRecommendations: () => communityRecommendations,
  emailSubscriptions: () => emailSubscriptions,
  insertCommunityRecommendationSchema: () => insertCommunityRecommendationSchema,
  insertEmailSubscriptionSchema: () => insertEmailSubscriptionSchema,
  insertRecommendationCommentSchema: () => insertRecommendationCommentSchema,
  insertRecommendationLikeSchema: () => insertRecommendationLikeSchema,
  insertReviewCommentSchema: () => insertReviewCommentSchema,
  insertUserSchema: () => insertUserSchema,
  insertUserWineLibrarySchema: () => insertUserWineLibrarySchema,
  insertWineRecommendationSchema: () => insertWineRecommendationSchema,
  insertWineReviewSchema: () => insertWineReviewSchema,
  insertWineSchema: () => insertWineSchema,
  loginUserSchema: () => loginUserSchema,
  recommendationComments: () => recommendationComments,
  recommendationLikes: () => recommendationLikes,
  registerUserSchema: () => registerUserSchema,
  reviewComments: () => reviewComments,
  userWineLibrary: () => userWineLibrary,
  users: () => users,
  winePreferencesSchema: () => winePreferencesSchema,
  wineRecommendations: () => wineRecommendations,
  wineReviews: () => wineReviews,
  wines: () => wines
});
import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  isPremium: boolean("is_premium").default(false),
  recommendationCount: integer("recommendation_count").default(0),
  stripeCustomerId: text("stripe_customer_id"),
  createdAt: timestamp("created_at").defaultNow()
});
var wines = pgTable("wines", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  // Optional - wines can be global or user-specific
  name: text("name").notNull(),
  winery: text("winery").notNull(),
  region: text("region").notNull(),
  country: text("country").notNull(),
  vintage: integer("vintage"),
  type: text("type").notNull(),
  // red, white, rose, sparkling, dessert
  price: real("price"),
  rating: real("rating"),
  description: text("description"),
  tasteProfile: text("taste_profile"),
  foodPairings: text("food_pairings").array(),
  imageUrl: text("image_url"),
  alcoholContent: real("alcohol_content"),
  servingTemp: text("serving_temp"),
  source: text("source").notNull().default("recommendation")
  // recommendation, scanned, manual
});
var userWineLibrary = pgTable("user_wine_library", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  wineId: integer("wine_id").notNull(),
  dateAdded: timestamp("date_added").defaultNow(),
  personalNotes: text("personal_notes")
});
var wineRecommendations = pgTable("wine_recommendations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  occasion: text("occasion"),
  budget: text("budget"),
  foodPairing: text("food_pairing"),
  wineType: text("wine_type"),
  preferences: text("preferences"),
  recommendations: text("recommendations"),
  // JSON string of wine IDs
  createdAt: timestamp("created_at").defaultNow()
});
var emailSubscriptions = pgTable("email_subscriptions", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  subscribedAt: timestamp("subscribed_at").defaultNow(),
  isActive: boolean("is_active").default(true)
});
var wineReviews = pgTable("wine_reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  wineId: integer("wine_id").notNull(),
  rating: integer("rating").notNull(),
  // 1-5 stars
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var communityRecommendations = pgTable("community_recommendations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  wineId: integer("wine_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  occasion: text("occasion"),
  foodPairing: text("food_pairing"),
  priceValue: integer("price_value"),
  // 1-5 scale
  likesCount: integer("likes_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var reviewComments = pgTable("review_comments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  reviewId: integer("review_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var recommendationComments = pgTable("recommendation_comments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  recommendationId: integer("recommendation_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var recommendationLikes = pgTable("recommendation_likes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  recommendationId: integer("recommendation_id").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var insertUserSchema = createInsertSchema(users).pick({
  email: true,
  username: true,
  password: true,
  firstName: true,
  lastName: true
});
var loginUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});
var registerUserSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1)
});
var insertWineSchema = createInsertSchema(wines).omit({
  id: true
});
var insertUserWineLibrarySchema = createInsertSchema(userWineLibrary).omit({
  id: true,
  dateAdded: true
});
var insertWineRecommendationSchema = createInsertSchema(wineRecommendations).omit({
  id: true,
  createdAt: true
});
var insertEmailSubscriptionSchema = createInsertSchema(emailSubscriptions).omit({
  id: true,
  subscribedAt: true
});
var insertWineReviewSchema = createInsertSchema(wineReviews).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true
});
var insertCommunityRecommendationSchema = createInsertSchema(communityRecommendations).omit({
  id: true,
  userId: true,
  likesCount: true,
  createdAt: true,
  updatedAt: true
});
var insertReviewCommentSchema = createInsertSchema(reviewComments).omit({
  id: true,
  createdAt: true
});
var insertRecommendationCommentSchema = createInsertSchema(recommendationComments).omit({
  id: true,
  createdAt: true
});
var insertRecommendationLikeSchema = createInsertSchema(recommendationLikes).omit({
  id: true,
  createdAt: true
});
var winePreferencesSchema = z.object({
  occasion: z.string().optional(),
  budget: z.string().optional(),
  foodPairing: z.string().optional(),
  wineType: z.string().optional(),
  preferences: z.string().optional()
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq, and, desc, sql, ilike, or } from "drizzle-orm";
var DatabaseStorage = class {
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || void 0;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || void 0;
  }
  async getUserByEmail(email) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || void 0;
  }
  async getUserByStripeCustomerId(stripeCustomerId) {
    const [user] = await db.select().from(users).where(eq(users.stripeCustomerId, stripeCustomerId));
    return user || void 0;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  async updateUserRecommendationCount(userId) {
    const [user] = await db.update(users).set({ recommendationCount: sql`${users.recommendationCount} + 1` }).where(eq(users.id, userId)).returning();
    return user;
  }
  async updateUserPremiumStatus(userId, isPremium) {
    const [user] = await db.update(users).set({ isPremium }).where(eq(users.id, userId)).returning();
    return user;
  }
  async updateUserStripeCustomerId(userId, customerId) {
    const [user] = await db.update(users).set({ stripeCustomerId: customerId }).where(eq(users.id, userId)).returning();
    return user;
  }
  async getWine(id) {
    const [wine] = await db.select().from(wines).where(eq(wines.id, id));
    return wine || void 0;
  }
  async getWines(limit = 50, offset = 0) {
    return await db.select().from(wines).limit(limit).offset(offset);
  }
  async createWine(insertWine) {
    const [wine] = await db.insert(wines).values(insertWine).returning();
    return wine;
  }
  async createUserWine(insertWine, userId) {
    const [wine] = await db.insert(wines).values({ ...insertWine, userId }).returning();
    return wine;
  }
  async searchWines(query) {
    const searchTerm = `%${query.toLowerCase()}%`;
    return await db.select().from(wines).where(
      or(
        ilike(wines.name, searchTerm),
        ilike(wines.winery, searchTerm),
        ilike(wines.region, searchTerm),
        ilike(wines.type, searchTerm)
      )
    );
  }
  async getWinesByType(type) {
    return await db.select().from(wines).where(eq(wines.type, type));
  }
  async getUserWines(userId) {
    return await db.select().from(wines).where(eq(wines.userId, userId));
  }
  async getUserWineLibrary(userId) {
    return await db.select().from(userWineLibrary).leftJoin(wines, eq(userWineLibrary.wineId, wines.id)).where(eq(userWineLibrary.userId, userId)).then(
      (results) => results.map((result) => ({
        ...result.user_wine_library,
        wine: result.wines
      }))
    );
  }
  async addWineToLibrary(entry) {
    const [libraryEntry] = await db.insert(userWineLibrary).values(entry).returning();
    return libraryEntry;
  }
  async removeWineFromLibrary(userId, wineId) {
    const result = await db.delete(userWineLibrary).where(
      and(
        eq(userWineLibrary.userId, userId),
        eq(userWineLibrary.wineId, wineId)
      )
    );
    return (result.rowCount || 0) > 0;
  }
  async isWineInLibrary(userId, wineId) {
    const [entry] = await db.select().from(userWineLibrary).where(
      and(
        eq(userWineLibrary.userId, userId),
        eq(userWineLibrary.wineId, wineId)
      )
    );
    return !!entry;
  }
  async saveWineRecommendation(recommendation) {
    const [rec] = await db.insert(wineRecommendations).values(recommendation).returning();
    return rec;
  }
  async getUserRecommendations(userId) {
    return await db.select().from(wineRecommendations).where(eq(wineRecommendations.userId, userId)).orderBy(desc(wineRecommendations.createdAt));
  }
  async getSubscriptionByEmail(email) {
    const [subscription] = await db.select().from(emailSubscriptions).where(eq(emailSubscriptions.email, email));
    return subscription;
  }
  async createSubscription(subscription) {
    const [newSubscription] = await db.insert(emailSubscriptions).values(subscription).returning();
    return newSubscription;
  }
  // Wine review operations
  async createWineReview(review, userId) {
    const [newReview] = await db.insert(wineReviews).values({ ...review, userId }).returning();
    return newReview;
  }
  async getWineReviews(wineId) {
    const reviews = await db.select({
      id: wineReviews.id,
      userId: wineReviews.userId,
      wineId: wineReviews.wineId,
      rating: wineReviews.rating,
      title: wineReviews.title,
      content: wineReviews.content,
      createdAt: wineReviews.createdAt,
      updatedAt: wineReviews.updatedAt,
      user: {
        username: users.username,
        firstName: users.firstName
      }
    }).from(wineReviews).leftJoin(users, eq(wineReviews.userId, users.id)).where(eq(wineReviews.wineId, wineId)).orderBy(desc(wineReviews.createdAt));
    return reviews;
  }
  async getUserReviews(userId) {
    const reviews = await db.select({
      id: wineReviews.id,
      userId: wineReviews.userId,
      wineId: wineReviews.wineId,
      rating: wineReviews.rating,
      title: wineReviews.title,
      content: wineReviews.content,
      createdAt: wineReviews.createdAt,
      updatedAt: wineReviews.updatedAt,
      wine: wines
    }).from(wineReviews).leftJoin(wines, eq(wineReviews.wineId, wines.id)).where(eq(wineReviews.userId, userId)).orderBy(desc(wineReviews.createdAt));
    return reviews;
  }
  async updateWineReview(reviewId, userId, review) {
    const [updatedReview] = await db.update(wineReviews).set({ ...review, updatedAt: /* @__PURE__ */ new Date() }).where(and(eq(wineReviews.id, reviewId), eq(wineReviews.userId, userId))).returning();
    return updatedReview || null;
  }
  async deleteWineReview(reviewId, userId) {
    const result = await db.delete(wineReviews).where(and(eq(wineReviews.id, reviewId), eq(wineReviews.userId, userId)));
    return (result.rowCount || 0) > 0;
  }
  // Review comment operations
  async createReviewComment(comment) {
    const [newComment] = await db.insert(reviewComments).values(comment).returning();
    return newComment;
  }
  async getReviewComments(reviewId) {
    const comments = await db.select({
      id: reviewComments.id,
      userId: reviewComments.userId,
      reviewId: reviewComments.reviewId,
      content: reviewComments.content,
      createdAt: reviewComments.createdAt,
      user: {
        username: users.username,
        firstName: users.firstName
      }
    }).from(reviewComments).leftJoin(users, eq(reviewComments.userId, users.id)).where(eq(reviewComments.reviewId, reviewId)).orderBy(reviewComments.createdAt);
    return comments;
  }
  async deleteReviewComment(commentId, userId) {
    const result = await db.delete(reviewComments).where(and(eq(reviewComments.id, commentId), eq(reviewComments.userId, userId)));
    return (result.rowCount || 0) > 0;
  }
  // Community recommendation operations
  async createCommunityRecommendation(recommendation, userId) {
    const [newRecommendation] = await db.insert(communityRecommendations).values({ ...recommendation, userId }).returning();
    return newRecommendation;
  }
  async getCommunityRecommendations(limit = 20, offset = 0) {
    const recommendations = await db.select({
      id: communityRecommendations.id,
      userId: communityRecommendations.userId,
      wineId: communityRecommendations.wineId,
      title: communityRecommendations.title,
      description: communityRecommendations.description,
      occasion: communityRecommendations.occasion,
      foodPairing: communityRecommendations.foodPairing,
      priceValue: communityRecommendations.priceValue,
      likesCount: communityRecommendations.likesCount,
      createdAt: communityRecommendations.createdAt,
      updatedAt: communityRecommendations.updatedAt,
      user: {
        username: users.username,
        firstName: users.firstName
      },
      wine: wines
    }).from(communityRecommendations).leftJoin(users, eq(communityRecommendations.userId, users.id)).leftJoin(wines, eq(communityRecommendations.wineId, wines.id)).orderBy(desc(communityRecommendations.createdAt)).limit(limit).offset(offset);
    return recommendations;
  }
  async getUserCommunityRecommendations(userId) {
    const recommendations = await db.select({
      id: communityRecommendations.id,
      userId: communityRecommendations.userId,
      wineId: communityRecommendations.wineId,
      title: communityRecommendations.title,
      description: communityRecommendations.description,
      occasion: communityRecommendations.occasion,
      foodPairing: communityRecommendations.foodPairing,
      priceValue: communityRecommendations.priceValue,
      likesCount: communityRecommendations.likesCount,
      createdAt: communityRecommendations.createdAt,
      updatedAt: communityRecommendations.updatedAt,
      wine: wines
    }).from(communityRecommendations).leftJoin(wines, eq(communityRecommendations.wineId, wines.id)).where(eq(communityRecommendations.userId, userId)).orderBy(desc(communityRecommendations.createdAt));
    return recommendations;
  }
  async updateCommunityRecommendation(recommendationId, userId, recommendation) {
    const [updatedRecommendation] = await db.update(communityRecommendations).set({ ...recommendation, updatedAt: /* @__PURE__ */ new Date() }).where(and(eq(communityRecommendations.id, recommendationId), eq(communityRecommendations.userId, userId))).returning();
    return updatedRecommendation || null;
  }
  async deleteCommunityRecommendation(recommendationId, userId) {
    const result = await db.delete(communityRecommendations).where(and(eq(communityRecommendations.id, recommendationId), eq(communityRecommendations.userId, userId)));
    return (result.rowCount || 0) > 0;
  }
  // Recommendation comment operations
  async createRecommendationComment(comment) {
    const [newComment] = await db.insert(recommendationComments).values(comment).returning();
    return newComment;
  }
  async getRecommendationComments(recommendationId) {
    const comments = await db.select({
      id: recommendationComments.id,
      userId: recommendationComments.userId,
      recommendationId: recommendationComments.recommendationId,
      content: recommendationComments.content,
      createdAt: recommendationComments.createdAt,
      user: {
        username: users.username,
        firstName: users.firstName
      }
    }).from(recommendationComments).leftJoin(users, eq(recommendationComments.userId, users.id)).where(eq(recommendationComments.recommendationId, recommendationId)).orderBy(recommendationComments.createdAt);
    return comments;
  }
  async deleteRecommendationComment(commentId, userId) {
    const result = await db.delete(recommendationComments).where(and(eq(recommendationComments.id, commentId), eq(recommendationComments.userId, userId)));
    return (result.rowCount || 0) > 0;
  }
  // Recommendation like operations
  async toggleRecommendationLike(userId, recommendationId) {
    const existingLike = await db.select().from(recommendationLikes).where(and(eq(recommendationLikes.userId, userId), eq(recommendationLikes.recommendationId, recommendationId)));
    if (existingLike.length > 0) {
      await db.delete(recommendationLikes).where(and(eq(recommendationLikes.userId, userId), eq(recommendationLikes.recommendationId, recommendationId)));
      await db.update(communityRecommendations).set({ likesCount: sql`${communityRecommendations.likesCount} - 1` }).where(eq(communityRecommendations.id, recommendationId));
      return false;
    } else {
      await db.insert(recommendationLikes).values({ userId, recommendationId });
      await db.update(communityRecommendations).set({ likesCount: sql`${communityRecommendations.likesCount} + 1` }).where(eq(communityRecommendations.id, recommendationId));
      return true;
    }
  }
  async getRecommendationLikes(recommendationId) {
    const likes = await db.select().from(recommendationLikes).where(eq(recommendationLikes.recommendationId, recommendationId));
    return likes;
  }
};
var storage = new DatabaseStorage();

// server/openai.ts
import OpenAI from "openai";
var openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});
function generateWineImageUrl(wine) {
  const wineType = wine.type?.toLowerCase() || "red";
  const wineImages = {
    red: "/attached_assets/red_1749966019645.jpg",
    white: "/attached_assets/white_1749966019645.jpeg",
    rose: "/attached_assets/rose_1749966019645.png",
    ros\u00E9: "/attached_assets/rose_1749966019645.png",
    sparkling: "/attached_assets/sparkling_1749966019645.jpg",
    champagne: "/attached_assets/sparkling_1749966019645.jpg",
    dessert: "/attached_assets/images_1750043730760.jpeg"
  };
  return wineImages[wineType] || wineImages.red;
}
async function getWineRecommendations(preferences) {
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
      "servingTemp": "16-18\xB0C",
      "source": "recommendation"
    }
  ]
}

User preferences:
- Occasion: ${preferences.occasion || "Any"}
- Budget: ${preferences.budget || "Any"}
- Food Pairing: ${preferences.foodPairing || "Any"}
- Wine Type: ${preferences.wineType || "Any"}
- Additional Preferences: ${preferences.preferences || "None"}

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
      temperature: 0.7
    });
    const result = JSON.parse(response.choices[0].message.content || "{}");
    const wines2 = result.wines || [];
    const winesWithImages = wines2.map((wine) => ({
      ...wine,
      imageUrl: generateWineImageUrl(wine)
    }));
    return winesWithImages;
  } catch (error) {
    console.error("Error getting wine recommendations:", error);
    throw new Error("Failed to get wine recommendations: " + error.message);
  }
}
async function analyzeWineBottle(base64Image) {
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
  "servingTemp": "16-18\xB0C",
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
          ]
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1e3
    });
    const result = JSON.parse(response.choices[0].message.content || "{}");
    const validatedWine = {
      name: result.name || "Unknown Wine",
      winery: result.winery || "Unknown Winery",
      region: result.region || "Unknown Region",
      country: result.country || "Unknown Country",
      vintage: result.vintage && !isNaN(parseInt(result.vintage)) ? parseInt(result.vintage) : (/* @__PURE__ */ new Date()).getFullYear(),
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
    throw new Error("Failed to analyze wine bottle: " + error.message);
  }
}

// server/auth.ts
import bcrypt from "bcryptjs";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import pg from "pg";
function buildSessionPool() {
  const raw = process.env.DATABASE_URL || "";
  let url;
  try {
    const u = new URL(raw);
    u.searchParams.delete("channel_binding");
    url = u.toString();
  } catch {
    url = raw;
  }
  return new pg.Pool({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
    max: 2
  });
}
var PgStore = connectPgSimple(session);
function getSession() {
  return session({
    store: new PgStore({
      pool: buildSessionPool(),
      tableName: "user_sessions",
      createTableIfMissing: true
    }),
    secret: process.env.SESSION_SECRET || "wine-app-secret-key-development",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1e3
      // 1 week
    }
  });
}
async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}
async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}
var requireAuth = async (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  try {
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      req.session.destroy(() => {
      });
      return res.status(401).json({ message: "User not found" });
    }
    req.session.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ message: "Authentication error" });
  }
};
var optionalAuth = async (req, res, next) => {
  if (req.session.userId) {
    try {
      const user = await storage.getUser(req.session.userId);
      if (user) {
        req.session.user = user;
      }
    } catch (error) {
      console.error("Optional auth error:", error);
    }
  }
  next();
};

// server/routes.ts
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing required Stripe secret: STRIPE_SECRET_KEY");
}
var stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
var upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
    // 10MB limit
  }
});
async function registerRoutes(app2) {
  app2.use(getSession());
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const userData = registerUserSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }
      const hashedPassword = await hashPassword(userData.password);
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });
      req.session.userId = user.id;
      req.session.user = user;
      await new Promise((resolve, reject) => {
        req.session.save((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      res.json({ user: { id: user.id, email: user.email, username: user.username, firstName: user.firstName, isPremium: user.isPremium, recommendationCount: user.recommendationCount } });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginUserSchema.parse(req.body);
      const user = await storage.getUserByEmail(email);
      if (!user || !await verifyPassword(password, user.password)) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      req.session.userId = user.id;
      req.session.user = user;
      await new Promise((resolve, reject) => {
        req.session.save((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      res.json({ user: { id: user.id, email: user.email, username: user.username, firstName: user.firstName, isPremium: user.isPremium, recommendationCount: user.recommendationCount } });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });
  app2.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out" });
    });
  });
  app2.get("/api/auth/me", optionalAuth, (req, res) => {
    if (req.session.user) {
      const user = req.session.user;
      res.json({ user: { id: user.id, email: user.email, username: user.username, firstName: user.firstName, isPremium: user.isPremium, recommendationCount: user.recommendationCount } });
    } else {
      res.json({ user: null });
    }
  });
  app2.post("/api/recommendations", optionalAuth, async (req, res) => {
    try {
      const preferences = winePreferencesSchema.parse(req.body);
      const { guestUsageCount } = req.body;
      if (req.session.user) {
        const user = req.session.user;
        if (!user.isPremium && (user.recommendationCount || 0) >= 5) {
          return res.status(402).json({
            error: "Usage limit reached",
            message: "You've used your 5 free recommendations. Upgrade to premium for unlimited access.",
            requiresPayment: true
          });
        }
        const recommendedWines2 = await getWineRecommendations(preferences);
        const savedWines = [];
        for (const wine of recommendedWines2) {
          const savedWine = await storage.createUserWine(wine, user.id);
          savedWines.push(savedWine);
        }
        await storage.updateUserRecommendationCount(user.id);
        await storage.saveWineRecommendation({
          userId: user.id,
          occasion: preferences.occasion || null,
          budget: preferences.budget || null,
          foodPairing: preferences.foodPairing || null,
          wineType: preferences.wineType || null,
          preferences: preferences.preferences || null,
          recommendations: JSON.stringify(savedWines.map((w) => w.id))
        });
        return res.json({ wines: savedWines, isGuest: false });
      }
      const currentGuestCount = guestUsageCount || 0;
      if (currentGuestCount >= 2) {
        return res.status(402).json({
          error: "Guest limit reached",
          message: "You've used your 2 free guest recommendations. Sign up for 5 more free recommendations!",
          requiresAuth: true
        });
      }
      const recommendedWines = await getWineRecommendations(preferences);
      const winesWithImages = recommendedWines.map((wine) => ({
        ...wine,
        imageUrl: `/attached_assets/${wine.type === "red" ? "red_1749966019645.jpg" : wine.type === "white" ? "white_1749966019645.jpeg" : wine.type === "rose" || wine.type === "ros\xE9" ? "rose_1749966019645.png" : wine.type === "sparkling" ? "sparkling_1749966019645.jpg" : wine.type === "dessert" ? "images_1750043730760.jpeg" : "red_1749966019645.jpg"}`
      }));
      res.json({
        wines: winesWithImages,
        isGuest: true,
        guestRecommendationsUsed: currentGuestCount + 1,
        guestRecommendationsRemaining: 2 - (currentGuestCount + 1)
      });
    } catch (error) {
      console.error("Error getting recommendations:", error);
      res.status(500).json({
        error: "Failed to get wine recommendations",
        message: error.message
      });
    }
  });
  app2.post("/api/analyze-bottle", requireAuth, upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      const base64Image = req.file.buffer.toString("base64");
      const analyzedWine = await analyzeWineBottle(base64Image);
      const savedWine = await storage.createUserWine(analyzedWine, userId);
      res.json({ wine: savedWine });
    } catch (error) {
      console.error("Error analyzing bottle:", error);
      res.status(500).json({
        error: "Failed to analyze wine bottle",
        message: error.message
      });
    }
  });
  app2.get("/api/wines", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const offset = parseInt(req.query.offset) || 0;
      const wines2 = await storage.getWines(limit, offset);
      res.json({ wines: wines2 });
    } catch (error) {
      console.error("Error fetching wines:", error);
      res.status(500).json({ error: "Failed to fetch wines" });
    }
  });
  app2.get("/api/user/wines", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      const wines2 = await storage.getUserWines(userId);
      res.json({ wines: wines2 });
    } catch (error) {
      console.error("Error fetching user wines:", error);
      res.status(500).json({ error: "Failed to fetch user wines" });
    }
  });
  app2.post("/api/create-checkout-session", requireAuth, async (req, res) => {
    try {
      const session2 = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "What the Wine Premium",
                description: "Unlimited wine recommendations and premium features"
              },
              unit_amount: 399,
              // $3.99 in cents
              recurring: {
                interval: "month"
              }
            },
            quantity: 1
          }
        ],
        mode: "subscription",
        success_url: `${req.headers.origin}/dashboard?upgrade=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/dashboard?upgrade=cancelled`,
        metadata: {
          userId: req.session.userId?.toString() || ""
        }
      });
      res.json({ url: session2.url });
    } catch (error) {
      console.error("Error creating checkout session:", error);
      res.status(500).json({ error: "Failed to create checkout session" });
    }
  });
  app2.post("/api/check-subscription", requireAuth, async (req, res) => {
    try {
      const user = req.session.user;
      const { sessionId } = req.body;
      if (!sessionId) {
        return res.status(400).json({ error: "Session ID required" });
      }
      const session2 = await stripe.checkout.sessions.retrieve(sessionId);
      if (session2.payment_status === "paid" && session2.mode === "subscription") {
        await storage.updateUserPremiumStatus(user.id, true);
        if (session2.customer) {
          await storage.updateUserStripeCustomerId(user.id, session2.customer);
        }
        req.session.user = { ...user, isPremium: true };
        res.json({ success: true, isPremium: true });
      } else {
        res.json({ success: false, isPremium: false });
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
      res.status(500).json({ error: "Failed to check subscription status" });
    }
  });
  app2.post("/api/cancel-subscription", requireAuth, async (req, res) => {
    try {
      const user = req.session.user;
      if (!user.isPremium || !user.stripeCustomerId) {
        return res.status(400).json({ error: "No active subscription found" });
      }
      const subscriptions = await stripe.subscriptions.list({
        customer: user.stripeCustomerId,
        status: "active"
      });
      if (subscriptions.data.length === 0) {
        return res.status(400).json({ error: "No active subscription found" });
      }
      const subscription = subscriptions.data[0];
      await stripe.subscriptions.update(subscription.id, {
        cancel_at_period_end: true
      });
      const updatedSubscription = await stripe.subscriptions.retrieve(subscription.id);
      let cancelAtDate = null;
      if (updatedSubscription.billing_cycle_anchor) {
        try {
          cancelAtDate = new Date(updatedSubscription.billing_cycle_anchor * 1e3).toISOString();
        } catch (e) {
          console.error("Error converting billing cycle anchor date:", e);
        }
      }
      res.json({
        success: true,
        message: "Subscription will be cancelled at the end of your current billing period",
        cancelAt: cancelAtDate
      });
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      res.status(500).json({ error: "Failed to cancel subscription" });
    }
  });
  app2.post("/api/reactivate-subscription", requireAuth, async (req, res) => {
    try {
      const user = req.session.user;
      if (!user.isPremium || !user.stripeCustomerId) {
        return res.status(400).json({ error: "No subscription found to reactivate" });
      }
      const subscriptions = await stripe.subscriptions.list({
        customer: user.stripeCustomerId,
        status: "active"
      });
      if (subscriptions.data.length === 0) {
        return res.status(400).json({ error: "No active subscription found" });
      }
      const subscription = subscriptions.data[0];
      if (!subscription.cancel_at_period_end) {
        return res.status(400).json({ error: "Subscription is not scheduled for cancellation" });
      }
      await stripe.subscriptions.update(subscription.id, {
        cancel_at_period_end: false
      });
      res.json({
        success: true,
        message: "Your subscription has been reactivated and will continue billing normally"
      });
    } catch (error) {
      console.error("Error reactivating subscription:", error);
      res.status(500).json({ error: "Failed to reactivate subscription" });
    }
  });
  app2.get("/api/subscription-details", requireAuth, async (req, res) => {
    try {
      const user = req.session.user;
      if (!user.isPremium || !user.stripeCustomerId) {
        return res.json({ hasSubscription: false });
      }
      const subscriptions = await stripe.subscriptions.list({
        customer: user.stripeCustomerId,
        status: "active"
      });
      if (subscriptions.data.length === 0) {
        return res.json({ hasSubscription: false });
      }
      const subscription = subscriptions.data[0];
      console.log("Subscription date fields:", {
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
        billing_cycle_anchor: subscription.billing_cycle_anchor,
        cancel_at: subscription.cancel_at,
        created: subscription.created
      });
      let nextBillingDate = null;
      if (subscription.current_period_end) {
        try {
          nextBillingDate = new Date(subscription.current_period_end * 1e3).toISOString();
        } catch (e) {
          console.error("Error converting current_period_end:", e);
        }
      } else if (subscription.billing_cycle_anchor) {
        try {
          const billingAnchor = new Date(subscription.billing_cycle_anchor * 1e3);
          const now = /* @__PURE__ */ new Date();
          let nextBilling = new Date(billingAnchor);
          while (nextBilling <= now) {
            nextBilling.setMonth(nextBilling.getMonth() + 1);
          }
          nextBillingDate = nextBilling.toISOString();
        } catch (e) {
          console.error("Error calculating next billing from anchor:", e);
        }
      }
      let cancellationDate = null;
      if (subscription.cancel_at_period_end && nextBillingDate) {
        cancellationDate = nextBillingDate;
      }
      res.json({
        hasSubscription: true,
        status: subscription.status,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        currentPeriodEnd: nextBillingDate,
        cancellationDate,
        amount: subscription.items.data[0].price.unit_amount,
        currency: subscription.items.data[0].price.currency
      });
    } catch (error) {
      console.error("Error fetching subscription details:", error);
      res.status(500).json({ error: "Failed to fetch subscription details" });
    }
  });
  app2.post("/api/subscribe", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email || !email.includes("@")) {
        return res.status(400).json({ error: "Valid email address is required" });
      }
      const existingSubscription = await storage.getSubscriptionByEmail(email);
      if (existingSubscription) {
        return res.json({
          message: "Email already subscribed",
          alreadySubscribed: true
        });
      }
      await storage.createSubscription({ email });
      res.json({
        message: "Successfully subscribed to our newsletter",
        success: true
      });
    } catch (error) {
      console.error("Error subscribing email:", error);
      res.status(500).json({
        error: "Failed to subscribe",
        message: error.message
      });
    }
  });
  app2.get("/api/wines/search", async (req, res) => {
    try {
      const query = req.query.q;
      if (!query) {
        return res.status(400).json({ error: "Search query required" });
      }
      const wines2 = await storage.searchWines(query);
      res.json({ wines: wines2 });
    } catch (error) {
      console.error("Error searching wines:", error);
      res.status(500).json({ error: "Failed to search wines" });
    }
  });
  app2.get("/api/wines/type/:type", async (req, res) => {
    try {
      const type = req.params.type;
      const wines2 = await storage.getWinesByType(type);
      res.json({ wines: wines2 });
    } catch (error) {
      console.error("Error fetching wines by type:", error);
      res.status(500).json({ error: "Failed to fetch wines by type" });
    }
  });
  app2.post("/api/create-payment-intent", requireAuth, async (req, res) => {
    try {
      const user = req.session.user;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: 999,
        // $9.99 for premium access
        currency: "usd",
        metadata: {
          userId: user.id.toString()
        }
      });
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ error: "Failed to create payment intent" });
    }
  });
  app2.post("/api/confirm-payment", requireAuth, async (req, res) => {
    try {
      const { paymentIntentId } = req.body;
      const user = req.session.user;
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      if (paymentIntent.status === "succeeded") {
        await storage.updateUserPremiumStatus(user.id, true);
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
  app2.get("/api/library", requireAuth, async (req, res) => {
    try {
      const user = req.session.user;
      const library = await storage.getUserWineLibrary(user.id);
      res.json({ library });
    } catch (error) {
      console.error("Error fetching wine library:", error);
      res.status(500).json({ error: "Failed to fetch wine library" });
    }
  });
  app2.post("/api/library", requireAuth, async (req, res) => {
    try {
      const user = req.session.user;
      const { wineId, personalNotes } = req.body;
      const exists = await storage.isWineInLibrary(user.id, wineId);
      if (exists) {
        return res.status(400).json({ error: "Wine already in library" });
      }
      const libraryEntry = await storage.addWineToLibrary({
        userId: user.id,
        wineId,
        personalNotes: personalNotes || null
      });
      res.json({ entry: libraryEntry });
    } catch (error) {
      console.error("Error adding wine to library:", error);
      res.status(500).json({ error: "Failed to add wine to library" });
    }
  });
  app2.delete("/api/library/:wineId", requireAuth, async (req, res) => {
    try {
      const user = req.session.user;
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
  app2.get("/api/recommendations/:userId", async (req, res) => {
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
  app2.post("/api/community/reviews", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user.id;
      const reviewData = insertWineReviewSchema.parse(req.body);
      const review = await storage.createWineReview(reviewData, userId);
      res.json(review);
    } catch (error) {
      console.error("Error creating wine review:", error);
      res.status(500).json({ error: "Failed to create wine review" });
    }
  });
  app2.get("/api/community/reviews/wine/:wineId", async (req, res) => {
    try {
      const wineId = parseInt(req.params.wineId);
      const reviews = await storage.getWineReviews(wineId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching wine reviews:", error);
      res.status(500).json({ error: "Failed to fetch wine reviews" });
    }
  });
  app2.get("/api/community/reviews/user", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user.id;
      const reviews = await storage.getUserReviews(userId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching user reviews:", error);
      res.status(500).json({ error: "Failed to fetch user reviews" });
    }
  });
  app2.post("/api/community/recommendations", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user.id;
      const recommendationData = insertCommunityRecommendationSchema.parse(req.body);
      const recommendation = await storage.createCommunityRecommendation(recommendationData, userId);
      res.json(recommendation);
    } catch (error) {
      console.error("Error creating community recommendation:", error);
      res.status(500).json({ error: "Failed to create community recommendation" });
    }
  });
  app2.get("/api/community/recommendations", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 20;
      const offset = parseInt(req.query.offset) || 0;
      const recommendations = await storage.getCommunityRecommendations(limit, offset);
      res.json(recommendations);
    } catch (error) {
      console.error("Error fetching community recommendations:", error);
      res.status(500).json({ error: "Failed to fetch community recommendations" });
    }
  });
  app2.get("/api/community/recommendations/user", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user.id;
      const recommendations = await storage.getUserCommunityRecommendations(userId);
      res.json(recommendations);
    } catch (error) {
      console.error("Error fetching user recommendations:", error);
      res.status(500).json({ error: "Failed to fetch user recommendations" });
    }
  });
  app2.post("/api/community/recommendations/:id/like", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user.id;
      const recommendationId = parseInt(req.params.id);
      const liked = await storage.toggleRecommendationLike(userId, recommendationId);
      res.json({ liked });
    } catch (error) {
      console.error("Error toggling recommendation like:", error);
      res.status(500).json({ error: "Failed to toggle recommendation like" });
    }
  });
  app2.post("/api/community/reviews/:reviewId/comments", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user.id;
      const reviewId = parseInt(req.params.reviewId);
      const commentData = insertReviewCommentSchema.parse(req.body);
      const comment = await storage.createReviewComment({
        ...commentData,
        userId,
        reviewId
      });
      res.json(comment);
    } catch (error) {
      console.error("Error creating review comment:", error);
      res.status(500).json({ error: "Failed to create review comment" });
    }
  });
  app2.get("/api/community/reviews/:reviewId/comments", async (req, res) => {
    try {
      const reviewId = parseInt(req.params.reviewId);
      const comments = await storage.getReviewComments(reviewId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching review comments:", error);
      res.status(500).json({ error: "Failed to fetch review comments" });
    }
  });
  app2.post("/api/community/recommendations/:recommendationId/comments", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user.id;
      const recommendationId = parseInt(req.params.recommendationId);
      const commentData = insertRecommendationCommentSchema.parse(req.body);
      const comment = await storage.createRecommendationComment({
        ...commentData,
        userId,
        recommendationId
      });
      res.json(comment);
    } catch (error) {
      console.error("Error creating recommendation comment:", error);
      res.status(500).json({ error: "Failed to create recommendation comment" });
    }
  });
  app2.get("/api/community/recommendations/:recommendationId/comments", async (req, res) => {
    try {
      const recommendationId = parseInt(req.params.recommendationId);
      const comments = await storage.getRecommendationComments(recommendationId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching recommendation comments:", error);
      res.status(500).json({ error: "Failed to fetch recommendation comments" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vercel-entry.ts
var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
var initPromise = null;
function init() {
  if (!initPromise) {
    initPromise = registerRoutes(app).then(() => {
    });
  }
  return initPromise;
}
init();
async function handler(req, res) {
  await init();
  app(req, res);
}
export {
  handler as default
};
