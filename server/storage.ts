import { type User, type InsertUser, type Walk, type InsertWalk, type Friendship, type InsertFriendship, type RankingEntry } from "@shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  verifyPassword(username: string, password: string): Promise<User | null>;
  
  // Walks
  createWalk(walk: InsertWalk): Promise<Walk>;
  getWalksByUser(userId: string): Promise<Walk[]>;
  getUserTotalStats(userId: string): Promise<{ totalDistance: number; totalEnergy: number; totalWalks: number }>;
  
  // Friendships
  createFriendship(friendship: InsertFriendship): Promise<Friendship>;
  getFriendships(userId: string): Promise<Friendship[]>;
  updateFriendshipStatus(id: string, status: string): Promise<void>;
  removeFriendship(userId: string, friendId: string): Promise<void>;
  getFriends(userId: string): Promise<User[]>;
  
  // Ranking
  getRankingData(friendsOnly: boolean, userId?: string): Promise<RankingEntry[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private walks: Map<string, Walk>;
  private friendships: Map<string, Friendship>;

  constructor() {
    this.users = new Map();
    this.walks = new Map();
    this.friendships = new Map();
    
    // Mock data - todo: remove mock functionality
    this.seedMockData();
  }

  private seedMockData() {
    // Create mock users with hashed passwords
    // Password for all users: "123456"
    const hashedPassword = bcrypt.hashSync("123456", 10);
    
    const mockUsers: User[] = [
      { id: "1", username: "maria.silva", password: hashedPassword, displayName: "Maria Silva", avatar: null },
      { id: "2", username: "joao.santos", password: hashedPassword, displayName: "João Santos", avatar: null },
      { id: "3", username: "ana.costa", password: hashedPassword, displayName: "Ana Costa", avatar: null },
      { id: "4", username: "pedro.lima", password: hashedPassword, displayName: "Pedro Lima", avatar: null },
      { id: "5", username: "carla.mendes", password: hashedPassword, displayName: "Carla Mendes", avatar: null },
    ];
    
    mockUsers.forEach(user => this.users.set(user.id, user));
    
    // Create mock walks
    const mockWalks = [
      { id: "w1", userId: "1", distance: 45.3, energy: 2265, duration: 180, createdAt: new Date() },
      { id: "w2", userId: "2", distance: 38.7, energy: 1935, duration: 150, createdAt: new Date() },
      { id: "w3", userId: "3", distance: 32.1, energy: 1605, duration: 120, createdAt: new Date() },
      { id: "w4", userId: "4", distance: 28.5, energy: 1425, duration: 110, createdAt: new Date() },
      { id: "w5", userId: "5", distance: 24.9, energy: 1245, duration: 100, createdAt: new Date() },
    ];
    
    mockWalks.forEach(walk => this.walks.set(walk.id, walk));
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const user: User = { 
      ...insertUser, 
      id, 
      password: hashedPassword,
      avatar: insertUser.avatar ?? null 
    };
    this.users.set(id, user);
    return user;
  }

  async verifyPassword(username: string, password: string): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    if (!user) {
      return null;
    }
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return null;
    }
    
    return user;
  }

  // Walks
  async createWalk(insertWalk: InsertWalk): Promise<Walk> {
    const id = randomUUID();
    const walk: Walk = { 
      ...insertWalk, 
      id, 
      createdAt: new Date() 
    };
    this.walks.set(id, walk);
    return walk;
  }

  async getWalksByUser(userId: string): Promise<Walk[]> {
    return Array.from(this.walks.values()).filter(
      (walk) => walk.userId === userId
    );
  }

  async getUserTotalStats(userId: string): Promise<{ totalDistance: number; totalEnergy: number; totalWalks: number }> {
    const userWalks = await this.getWalksByUser(userId);
    return {
      totalWalks: userWalks.length,
      totalDistance: userWalks.reduce((sum, walk) => sum + walk.distance, 0),
      totalEnergy: userWalks.reduce((sum, walk) => sum + walk.energy, 0),
    };
  }

  // Friendships
  async createFriendship(insertFriendship: InsertFriendship): Promise<Friendship> {
    const id = randomUUID();
    const friendship: Friendship = {
      ...insertFriendship,
      id,
      status: "pending",
      createdAt: new Date(),
    };
    this.friendships.set(id, friendship);
    return friendship;
  }

  async getFriendships(userId: string): Promise<Friendship[]> {
    return Array.from(this.friendships.values()).filter(
      (f) => f.userId === userId || f.friendId === userId
    );
  }

  async updateFriendshipStatus(id: string, status: string): Promise<void> {
    const friendship = this.friendships.get(id);
    if (friendship) {
      friendship.status = status;
      this.friendships.set(id, friendship);
    }
  }

  async removeFriendship(userId: string, friendId: string): Promise<void> {
    const toRemove = Array.from(this.friendships.values()).find(
      (f) => 
        (f.userId === userId && f.friendId === friendId) ||
        (f.userId === friendId && f.friendId === userId)
    );
    if (toRemove) {
      this.friendships.delete(toRemove.id);
    }
  }

  async getFriends(userId: string): Promise<User[]> {
    const friendships = await this.getFriendships(userId);
    const acceptedFriendships = friendships.filter(f => f.status === "accepted");
    
    const friendIds = acceptedFriendships.map(f => 
      f.userId === userId ? f.friendId : f.userId
    );
    
    return friendIds
      .map(id => this.users.get(id))
      .filter((user): user is User => user !== undefined);
  }

  // Ranking
  async getRankingData(friendsOnly: boolean, userId?: string): Promise<RankingEntry[]> {
    let usersToRank: User[];
    
    if (friendsOnly && userId) {
      const friends = await this.getFriends(userId);
      const currentUser = this.users.get(userId);
      usersToRank = currentUser ? [currentUser, ...friends] : friends;
    } else {
      usersToRank = Array.from(this.users.values());
    }
    
    const rankings: RankingEntry[] = await Promise.all(
      usersToRank.map(async (user) => {
        const stats = await this.getUserTotalStats(user.id);
        return {
          userId: user.id,
          username: user.displayName,
          totalEnergy: stats.totalEnergy,
          totalDistance: stats.totalDistance,
          totalWalks: stats.totalWalks,
        };
      })
    );
    
    return rankings.sort((a, b) => b.totalEnergy - a.totalEnergy);
  }
}

export const storage = new MemStorage();
