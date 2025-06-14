import { 
  users, wines, userWineLibrary, wineRecommendations,
  type User, type InsertUser, 
  type Wine, type InsertWine,
  type UserWineLibrary, type InsertUserWineLibrary,
  type WineRecommendation, type InsertWineRecommendation
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Wine operations
  getWine(id: number): Promise<Wine | undefined>;
  getWines(limit?: number, offset?: number): Promise<Wine[]>;
  createWine(wine: InsertWine): Promise<Wine>;
  searchWines(query: string): Promise<Wine[]>;
  getWinesByType(type: string): Promise<Wine[]>;

  // User wine library operations
  getUserWineLibrary(userId: number): Promise<(UserWineLibrary & { wine: Wine })[]>;
  addWineToLibrary(entry: InsertUserWineLibrary): Promise<UserWineLibrary>;
  removeWineFromLibrary(userId: number, wineId: number): Promise<boolean>;
  isWineInLibrary(userId: number, wineId: number): Promise<boolean>;

  // Wine recommendation operations
  saveWineRecommendation(recommendation: InsertWineRecommendation): Promise<WineRecommendation>;
  getUserRecommendations(userId: number): Promise<WineRecommendation[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private wines: Map<number, Wine>;
  private userWineLibrary: Map<number, UserWineLibrary>;
  private wineRecommendations: Map<number, WineRecommendation>;
  private currentUserId: number;
  private currentWineId: number;
  private currentLibraryId: number;
  private currentRecommendationId: number;

  constructor() {
    this.users = new Map();
    this.wines = new Map();
    this.userWineLibrary = new Map();
    this.wineRecommendations = new Map();
    this.currentUserId = 1;
    this.currentWineId = 1;
    this.currentLibraryId = 1;
    this.currentRecommendationId = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Wine operations
  async getWine(id: number): Promise<Wine | undefined> {
    return this.wines.get(id);
  }

  async getWines(limit = 50, offset = 0): Promise<Wine[]> {
    const allWines = Array.from(this.wines.values());
    return allWines.slice(offset, offset + limit);
  }

  async createWine(insertWine: InsertWine): Promise<Wine> {
    const id = this.currentWineId++;
    const wine: Wine = { ...insertWine, id };
    this.wines.set(id, wine);
    return wine;
  }

  async searchWines(query: string): Promise<Wine[]> {
    const searchTerm = query.toLowerCase();
    return Array.from(this.wines.values()).filter(wine =>
      wine.name.toLowerCase().includes(searchTerm) ||
      wine.winery.toLowerCase().includes(searchTerm) ||
      wine.region.toLowerCase().includes(searchTerm) ||
      wine.type.toLowerCase().includes(searchTerm)
    );
  }

  async getWinesByType(type: string): Promise<Wine[]> {
    return Array.from(this.wines.values()).filter(wine => 
      wine.type.toLowerCase() === type.toLowerCase()
    );
  }

  // User wine library operations
  async getUserWineLibrary(userId: number): Promise<(UserWineLibrary & { wine: Wine })[]> {
    const libraryEntries = Array.from(this.userWineLibrary.values())
      .filter(entry => entry.userId === userId);
    
    return libraryEntries.map(entry => {
      const wine = this.wines.get(entry.wineId);
      if (!wine) throw new Error(`Wine with id ${entry.wineId} not found`);
      return { ...entry, wine };
    });
  }

  async addWineToLibrary(entry: InsertUserWineLibrary): Promise<UserWineLibrary> {
    const id = this.currentLibraryId++;
    const libraryEntry: UserWineLibrary = { 
      ...entry, 
      id, 
      dateAdded: new Date() 
    };
    this.userWineLibrary.set(id, libraryEntry);
    return libraryEntry;
  }

  async removeWineFromLibrary(userId: number, wineId: number): Promise<boolean> {
    const entry = Array.from(this.userWineLibrary.entries())
      .find(([_, entry]) => entry.userId === userId && entry.wineId === wineId);
    
    if (entry) {
      this.userWineLibrary.delete(entry[0]);
      return true;
    }
    return false;
  }

  async isWineInLibrary(userId: number, wineId: number): Promise<boolean> {
    return Array.from(this.userWineLibrary.values())
      .some(entry => entry.userId === userId && entry.wineId === wineId);
  }

  // Wine recommendation operations
  async saveWineRecommendation(recommendation: InsertWineRecommendation): Promise<WineRecommendation> {
    const id = this.currentRecommendationId++;
    const rec: WineRecommendation = { 
      ...recommendation, 
      id, 
      createdAt: new Date() 
    };
    this.wineRecommendations.set(id, rec);
    return rec;
  }

  async getUserRecommendations(userId: number): Promise<WineRecommendation[]> {
    return Array.from(this.wineRecommendations.values())
      .filter(rec => rec.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }
}

export const storage = new MemStorage();
