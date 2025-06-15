import { 
  users, wines, userWineLibrary, wineRecommendations, emailSubscriptions,
  type User, type InsertUser, 
  type Wine, type InsertWine,
  type UserWineLibrary, type InsertUserWineLibrary,
  type WineRecommendation, type InsertWineRecommendation,
  type EmailSubscription, type InsertEmailSubscription
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, ilike, or } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserRecommendationCount(userId: number): Promise<User>;
  updateUserPremiumStatus(userId: number, isPremium: boolean): Promise<User>;
  updateUserStripeCustomerId(userId: number, customerId: string): Promise<User>;

  // Wine operations
  getWine(id: number): Promise<Wine | undefined>;
  getWines(limit?: number, offset?: number): Promise<Wine[]>;
  createWine(wine: InsertWine): Promise<Wine>;
  createUserWine(wine: InsertWine, userId: number): Promise<Wine>;
  searchWines(query: string): Promise<Wine[]>;
  getWinesByType(type: string): Promise<Wine[]>;
  getUserWines(userId: number): Promise<Wine[]>;

  // User wine library operations
  getUserWineLibrary(userId: number): Promise<(UserWineLibrary & { wine: Wine })[]>;
  addWineToLibrary(entry: InsertUserWineLibrary): Promise<UserWineLibrary>;
  removeWineFromLibrary(userId: number, wineId: number): Promise<boolean>;
  isWineInLibrary(userId: number, wineId: number): Promise<boolean>;

  // Wine recommendation operations
  saveWineRecommendation(recommendation: InsertWineRecommendation): Promise<WineRecommendation>;
  getUserRecommendations(userId: number): Promise<WineRecommendation[]>;

  // Email subscription operations
  getSubscriptionByEmail(email: string): Promise<EmailSubscription | undefined>;
  createSubscription(subscription: InsertEmailSubscription): Promise<EmailSubscription>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserRecommendationCount(userId: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ recommendationCount: sql`${users.recommendationCount} + 1` })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserPremiumStatus(userId: number, isPremium: boolean): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ isPremium })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserStripeCustomerId(userId: number, customerId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ stripeCustomerId: customerId })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async getWine(id: number): Promise<Wine | undefined> {
    const [wine] = await db.select().from(wines).where(eq(wines.id, id));
    return wine || undefined;
  }

  async getWines(limit = 50, offset = 0): Promise<Wine[]> {
    return await db.select().from(wines).limit(limit).offset(offset);
  }

  async createWine(insertWine: InsertWine): Promise<Wine> {
    const [wine] = await db
      .insert(wines)
      .values(insertWine)
      .returning();
    return wine;
  }

  async createUserWine(insertWine: InsertWine, userId: number): Promise<Wine> {
    const [wine] = await db
      .insert(wines)
      .values({ ...insertWine, userId })
      .returning();
    return wine;
  }

  async searchWines(query: string): Promise<Wine[]> {
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

  async getWinesByType(type: string): Promise<Wine[]> {
    return await db.select().from(wines).where(eq(wines.type, type));
  }

  async getUserWines(userId: number): Promise<Wine[]> {
    return await db.select().from(wines).where(eq(wines.userId, userId));
  }

  async getUserWineLibrary(userId: number): Promise<(UserWineLibrary & { wine: Wine })[]> {
    return await db
      .select()
      .from(userWineLibrary)
      .leftJoin(wines, eq(userWineLibrary.wineId, wines.id))
      .where(eq(userWineLibrary.userId, userId))
      .then(results => 
        results.map(result => ({
          ...result.user_wine_library,
          wine: result.wines!
        }))
      );
  }

  async addWineToLibrary(entry: InsertUserWineLibrary): Promise<UserWineLibrary> {
    const [libraryEntry] = await db
      .insert(userWineLibrary)
      .values(entry)
      .returning();
    return libraryEntry;
  }

  async removeWineFromLibrary(userId: number, wineId: number): Promise<boolean> {
    const result = await db
      .delete(userWineLibrary)
      .where(
        and(
          eq(userWineLibrary.userId, userId),
          eq(userWineLibrary.wineId, wineId)
        )
      );
    return (result.rowCount || 0) > 0;
  }

  async isWineInLibrary(userId: number, wineId: number): Promise<boolean> {
    const [entry] = await db
      .select()
      .from(userWineLibrary)
      .where(
        and(
          eq(userWineLibrary.userId, userId),
          eq(userWineLibrary.wineId, wineId)
        )
      );
    return !!entry;
  }

  async saveWineRecommendation(recommendation: InsertWineRecommendation): Promise<WineRecommendation> {
    const [rec] = await db
      .insert(wineRecommendations)
      .values(recommendation)
      .returning();
    return rec;
  }

  async getUserRecommendations(userId: number): Promise<WineRecommendation[]> {
    return await db
      .select()
      .from(wineRecommendations)
      .where(eq(wineRecommendations.userId, userId))
      .orderBy(desc(wineRecommendations.createdAt));
  }

  async getSubscriptionByEmail(email: string): Promise<EmailSubscription | undefined> {
    const [subscription] = await db
      .select()
      .from(emailSubscriptions)
      .where(eq(emailSubscriptions.email, email));
    return subscription;
  }

  async createSubscription(subscription: InsertEmailSubscription): Promise<EmailSubscription> {
    const [newSubscription] = await db
      .insert(emailSubscriptions)
      .values(subscription)
      .returning();
    return newSubscription;
  }
}

export const storage = new DatabaseStorage();
