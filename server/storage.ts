import { 
  users, wines, userWineLibrary, wineRecommendations, emailSubscriptions,
  wineReviews, communityRecommendations, reviewComments, recommendationComments, recommendationLikes,
  type User, type InsertUser, 
  type Wine, type InsertWine,
  type UserWineLibrary, type InsertUserWineLibrary,
  type WineRecommendation, type InsertWineRecommendation,
  type EmailSubscription, type InsertEmailSubscription,
  type WineReview, type InsertWineReview,
  type CommunityRecommendation, type InsertCommunityRecommendation,
  type ReviewComment, type InsertReviewComment,
  type RecommendationComment, type InsertRecommendationComment,
  type RecommendationLike, type InsertRecommendationLike
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

  // Wine review operations
  createWineReview(review: InsertWineReview): Promise<WineReview>;
  getWineReviews(wineId: number): Promise<(WineReview & { user: { username: string; firstName: string } })[]>;
  getUserReviews(userId: number): Promise<(WineReview & { wine: Wine })[]>;
  updateWineReview(reviewId: number, userId: number, review: Partial<InsertWineReview>): Promise<WineReview | null>;
  deleteWineReview(reviewId: number, userId: number): Promise<boolean>;

  // Review comment operations
  createReviewComment(comment: InsertReviewComment): Promise<ReviewComment>;
  getReviewComments(reviewId: number): Promise<(ReviewComment & { user: { username: string; firstName: string } })[]>;
  deleteReviewComment(commentId: number, userId: number): Promise<boolean>;

  // Community recommendation operations
  createCommunityRecommendation(recommendation: InsertCommunityRecommendation): Promise<CommunityRecommendation>;
  getCommunityRecommendations(limit?: number, offset?: number): Promise<(CommunityRecommendation & { user: { username: string; firstName: string }; wine: Wine })[]>;
  getUserCommunityRecommendations(userId: number): Promise<(CommunityRecommendation & { wine: Wine })[]>;
  updateCommunityRecommendation(recommendationId: number, userId: number, recommendation: Partial<InsertCommunityRecommendation>): Promise<CommunityRecommendation | null>;
  deleteCommunityRecommendation(recommendationId: number, userId: number): Promise<boolean>;

  // Recommendation comment operations
  createRecommendationComment(comment: InsertRecommendationComment): Promise<RecommendationComment>;
  getRecommendationComments(recommendationId: number): Promise<(RecommendationComment & { user: { username: string; firstName: string } })[]>;
  deleteRecommendationComment(commentId: number, userId: number): Promise<boolean>;

  // Recommendation like operations
  toggleRecommendationLike(userId: number, recommendationId: number): Promise<boolean>; // returns true if liked, false if unliked
  getRecommendationLikes(recommendationId: number): Promise<RecommendationLike[]>;
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

  // Wine review operations
  async createWineReview(review: InsertWineReview): Promise<WineReview> {
    const [newReview] = await db
      .insert(wineReviews)
      .values(review)
      .returning();
    return newReview;
  }

  async getWineReviews(wineId: number): Promise<(WineReview & { user: { username: string; firstName: string } })[]> {
    const reviews = await db
      .select({
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
          firstName: users.firstName,
        },
      })
      .from(wineReviews)
      .leftJoin(users, eq(wineReviews.userId, users.id))
      .where(eq(wineReviews.wineId, wineId))
      .orderBy(desc(wineReviews.createdAt));
    return reviews;
  }

  async getUserReviews(userId: number): Promise<(WineReview & { wine: Wine })[]> {
    const reviews = await db
      .select({
        id: wineReviews.id,
        userId: wineReviews.userId,
        wineId: wineReviews.wineId,
        rating: wineReviews.rating,
        title: wineReviews.title,
        content: wineReviews.content,
        createdAt: wineReviews.createdAt,
        updatedAt: wineReviews.updatedAt,
        wine: wines,
      })
      .from(wineReviews)
      .leftJoin(wines, eq(wineReviews.wineId, wines.id))
      .where(eq(wineReviews.userId, userId))
      .orderBy(desc(wineReviews.createdAt));
    return reviews;
  }

  async updateWineReview(reviewId: number, userId: number, review: Partial<InsertWineReview>): Promise<WineReview | null> {
    const [updatedReview] = await db
      .update(wineReviews)
      .set({ ...review, updatedAt: new Date() })
      .where(and(eq(wineReviews.id, reviewId), eq(wineReviews.userId, userId)))
      .returning();
    return updatedReview || null;
  }

  async deleteWineReview(reviewId: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(wineReviews)
      .where(and(eq(wineReviews.id, reviewId), eq(wineReviews.userId, userId)));
    return (result.rowCount || 0) > 0;
  }

  // Review comment operations
  async createReviewComment(comment: InsertReviewComment): Promise<ReviewComment> {
    const [newComment] = await db
      .insert(reviewComments)
      .values(comment)
      .returning();
    return newComment;
  }

  async getReviewComments(reviewId: number): Promise<(ReviewComment & { user: { username: string; firstName: string } })[]> {
    const comments = await db
      .select({
        id: reviewComments.id,
        userId: reviewComments.userId,
        reviewId: reviewComments.reviewId,
        content: reviewComments.content,
        createdAt: reviewComments.createdAt,
        user: {
          username: users.username,
          firstName: users.firstName,
        },
      })
      .from(reviewComments)
      .leftJoin(users, eq(reviewComments.userId, users.id))
      .where(eq(reviewComments.reviewId, reviewId))
      .orderBy(reviewComments.createdAt);
    return comments;
  }

  async deleteReviewComment(commentId: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(reviewComments)
      .where(and(eq(reviewComments.id, commentId), eq(reviewComments.userId, userId)));
    return result.rowCount > 0;
  }

  // Community recommendation operations
  async createCommunityRecommendation(recommendation: InsertCommunityRecommendation): Promise<CommunityRecommendation> {
    const [newRecommendation] = await db
      .insert(communityRecommendations)
      .values(recommendation)
      .returning();
    return newRecommendation;
  }

  async getCommunityRecommendations(limit = 20, offset = 0): Promise<(CommunityRecommendation & { user: { username: string; firstName: string }; wine: Wine })[]> {
    const recommendations = await db
      .select({
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
          firstName: users.firstName,
        },
        wine: wines,
      })
      .from(communityRecommendations)
      .leftJoin(users, eq(communityRecommendations.userId, users.id))
      .leftJoin(wines, eq(communityRecommendations.wineId, wines.id))
      .orderBy(desc(communityRecommendations.createdAt))
      .limit(limit)
      .offset(offset);
    return recommendations;
  }

  async getUserCommunityRecommendations(userId: number): Promise<(CommunityRecommendation & { wine: Wine })[]> {
    const recommendations = await db
      .select({
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
        wine: wines,
      })
      .from(communityRecommendations)
      .leftJoin(wines, eq(communityRecommendations.wineId, wines.id))
      .where(eq(communityRecommendations.userId, userId))
      .orderBy(desc(communityRecommendations.createdAt));
    return recommendations;
  }

  async updateCommunityRecommendation(recommendationId: number, userId: number, recommendation: Partial<InsertCommunityRecommendation>): Promise<CommunityRecommendation | null> {
    const [updatedRecommendation] = await db
      .update(communityRecommendations)
      .set({ ...recommendation, updatedAt: new Date() })
      .where(and(eq(communityRecommendations.id, recommendationId), eq(communityRecommendations.userId, userId)))
      .returning();
    return updatedRecommendation || null;
  }

  async deleteCommunityRecommendation(recommendationId: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(communityRecommendations)
      .where(and(eq(communityRecommendations.id, recommendationId), eq(communityRecommendations.userId, userId)));
    return result.rowCount > 0;
  }

  // Recommendation comment operations
  async createRecommendationComment(comment: InsertRecommendationComment): Promise<RecommendationComment> {
    const [newComment] = await db
      .insert(recommendationComments)
      .values(comment)
      .returning();
    return newComment;
  }

  async getRecommendationComments(recommendationId: number): Promise<(RecommendationComment & { user: { username: string; firstName: string } })[]> {
    const comments = await db
      .select({
        id: recommendationComments.id,
        userId: recommendationComments.userId,
        recommendationId: recommendationComments.recommendationId,
        content: recommendationComments.content,
        createdAt: recommendationComments.createdAt,
        user: {
          username: users.username,
          firstName: users.firstName,
        },
      })
      .from(recommendationComments)
      .leftJoin(users, eq(recommendationComments.userId, users.id))
      .where(eq(recommendationComments.recommendationId, recommendationId))
      .orderBy(recommendationComments.createdAt);
    return comments;
  }

  async deleteRecommendationComment(commentId: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(recommendationComments)
      .where(and(eq(recommendationComments.id, commentId), eq(recommendationComments.userId, userId)));
    return result.rowCount > 0;
  }

  // Recommendation like operations
  async toggleRecommendationLike(userId: number, recommendationId: number): Promise<boolean> {
    const existingLike = await db
      .select()
      .from(recommendationLikes)
      .where(and(eq(recommendationLikes.userId, userId), eq(recommendationLikes.recommendationId, recommendationId)));

    if (existingLike.length > 0) {
      // Unlike
      await db
        .delete(recommendationLikes)
        .where(and(eq(recommendationLikes.userId, userId), eq(recommendationLikes.recommendationId, recommendationId)));
      
      // Decrement likes count
      await db
        .update(communityRecommendations)
        .set({ likesCount: sql`${communityRecommendations.likesCount} - 1` })
        .where(eq(communityRecommendations.id, recommendationId));
      
      return false;
    } else {
      // Like
      await db
        .insert(recommendationLikes)
        .values({ userId, recommendationId });
      
      // Increment likes count
      await db
        .update(communityRecommendations)
        .set({ likesCount: sql`${communityRecommendations.likesCount} + 1` })
        .where(eq(communityRecommendations.id, recommendationId));
      
      return true;
    }
  }

  async getRecommendationLikes(recommendationId: number): Promise<RecommendationLike[]> {
    const likes = await db
      .select()
      .from(recommendationLikes)
      .where(eq(recommendationLikes.recommendationId, recommendationId));
    return likes;
  }
}

export const storage = new DatabaseStorage();
