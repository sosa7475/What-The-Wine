import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
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

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertWine = z.infer<typeof insertWineSchema>;
export type Wine = typeof wines.$inferSelect;

export type InsertUserWineLibrary = z.infer<typeof insertUserWineLibrarySchema>;
export type UserWineLibrary = typeof userWineLibrary.$inferSelect;

export type InsertWineRecommendation = z.infer<typeof insertWineRecommendationSchema>;
export type WineRecommendation = typeof wineRecommendations.$inferSelect;

// Preference schema for recommendations
export const winePreferencesSchema = z.object({
  occasion: z.string().optional(),
  budget: z.string().optional(),
  foodPairing: z.string().optional(),
  wineType: z.string().optional(),
  preferences: z.string().optional(),
});

export type WinePreferences = z.infer<typeof winePreferencesSchema>;
