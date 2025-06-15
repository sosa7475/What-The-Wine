import { pgTable, text, serial, integer, boolean, timestamp, real, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  isPremium: boolean("is_premium").default(false),
  recommendationCount: integer("recommendation_count").default(0),
  stripeCustomerId: text("stripe_customer_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const wines = pgTable("wines", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"), // Optional - wines can be global or user-specific
  name: text("name").notNull(),
  winery: text("winery").notNull(),
  region: text("region").notNull(),
  country: text("country").notNull(),
  vintage: integer("vintage"),
  type: text("type").notNull(), // red, white, rose, sparkling, dessert
  price: real("price"),
  rating: real("rating"),
  description: text("description"),
  tasteProfile: text("taste_profile"),
  foodPairings: text("food_pairings").array(),
  imageUrl: text("image_url"),
  alcoholContent: real("alcohol_content"),
  servingTemp: text("serving_temp"),
  source: text("source").notNull().default("recommendation"), // recommendation, scanned, manual
});

export const userWineLibrary = pgTable("user_wine_library", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  wineId: integer("wine_id").notNull(),
  dateAdded: timestamp("date_added").defaultNow(),
  personalNotes: text("personal_notes"),
});

export const wineRecommendations = pgTable("wine_recommendations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  occasion: text("occasion"),
  budget: text("budget"),
  foodPairing: text("food_pairing"),
  wineType: text("wine_type"),
  preferences: text("preferences"),
  recommendations: text("recommendations"), // JSON string of wine IDs
  createdAt: timestamp("created_at").defaultNow(),
});

export const emailSubscriptions = pgTable("email_subscriptions", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  subscribedAt: timestamp("subscribed_at").defaultNow(),
  isActive: boolean("is_active").default(true),
});

export const wineReviews = pgTable("wine_reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  wineId: integer("wine_id").notNull(),
  rating: integer("rating").notNull(), // 1-5 stars
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const communityRecommendations = pgTable("community_recommendations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  wineId: integer("wine_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  occasion: text("occasion"),
  foodPairing: text("food_pairing"),
  priceValue: integer("price_value"), // 1-5 scale
  likesCount: integer("likes_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const reviewComments = pgTable("review_comments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  reviewId: integer("review_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const recommendationComments = pgTable("recommendation_comments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  recommendationId: integer("recommendation_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const recommendationLikes = pgTable("recommendation_likes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  recommendationId: integer("recommendation_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  username: true,
  password: true,
  firstName: true,
  lastName: true,
});

export const loginUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerUserSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

export const insertWineSchema = createInsertSchema(wines).omit({
  id: true,
});

export const insertUserWineLibrarySchema = createInsertSchema(userWineLibrary).omit({
  id: true,
  dateAdded: true,
});

export const insertWineRecommendationSchema = createInsertSchema(wineRecommendations).omit({
  id: true,
  createdAt: true,
});

export const insertEmailSubscriptionSchema = createInsertSchema(emailSubscriptions).omit({
  id: true,
  subscribedAt: true,
});

export const insertWineReviewSchema = createInsertSchema(wineReviews).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCommunityRecommendationSchema = createInsertSchema(communityRecommendations).omit({
  id: true,
  userId: true,
  likesCount: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReviewCommentSchema = createInsertSchema(reviewComments).omit({
  id: true,
  createdAt: true,
});

export const insertRecommendationCommentSchema = createInsertSchema(recommendationComments).omit({
  id: true,
  createdAt: true,
});

export const insertRecommendationLikeSchema = createInsertSchema(recommendationLikes).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertWine = z.infer<typeof insertWineSchema>;
export type Wine = typeof wines.$inferSelect;

export type InsertUserWineLibrary = z.infer<typeof insertUserWineLibrarySchema>;
export type UserWineLibrary = typeof userWineLibrary.$inferSelect;

export type InsertWineRecommendation = z.infer<typeof insertWineRecommendationSchema>;
export type WineRecommendation = typeof wineRecommendations.$inferSelect;

export type InsertEmailSubscription = z.infer<typeof insertEmailSubscriptionSchema>;
export type EmailSubscription = typeof emailSubscriptions.$inferSelect;

export type InsertWineReview = z.infer<typeof insertWineReviewSchema>;
export type WineReview = typeof wineReviews.$inferSelect;

export type InsertCommunityRecommendation = z.infer<typeof insertCommunityRecommendationSchema>;
export type CommunityRecommendation = typeof communityRecommendations.$inferSelect;

export type InsertReviewComment = z.infer<typeof insertReviewCommentSchema>;
export type ReviewComment = typeof reviewComments.$inferSelect;

export type InsertRecommendationComment = z.infer<typeof insertRecommendationCommentSchema>;
export type RecommendationComment = typeof recommendationComments.$inferSelect;

export type InsertRecommendationLike = z.infer<typeof insertRecommendationLikeSchema>;
export type RecommendationLike = typeof recommendationLikes.$inferSelect;

// Preference schema for recommendations
export const winePreferencesSchema = z.object({
  occasion: z.string().optional(),
  budget: z.string().optional(),
  foodPairing: z.string().optional(),
  wineType: z.string().optional(),
  preferences: z.string().optional(),
});

export type WinePreferences = z.infer<typeof winePreferencesSchema>;
