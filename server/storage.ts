import { type User, type InsertUser, type Walk, type InsertWalk, type Friendship, type InsertFriendship, type RankingEntry, type Store, type InsertStore, type StoreTraffic, type InsertStoreTraffic } from "@shared/schema";
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
  
  // City stats (for admin dashboard)
  getCityStats(): Promise<{
    totalEnergy: number;
    totalUsers: number;
    activeUsers: number;
    topWalkers: { username: string; displayName: string; distance: number; energy: number }[];
  }>;
  
  // Stores
  createStore(store: InsertStore): Promise<Store>;
  getAllStores(): Promise<Store[]>;
  getStoreByUserId(userId: string): Promise<Store | undefined>;
  getStoreStats(storeId: string): Promise<{
    totalPedestrians: number;
    totalEnergy: number;
    todayPedestrians: number;
    todayEnergy: number;
  }>;
  createStoreTraffic(traffic: InsertStoreTraffic): Promise<StoreTraffic>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private walks: Map<string, Walk>;
  private friendships: Map<string, Friendship>;
  private stores: Map<string, Store>;
  private storeTraffic: Map<string, StoreTraffic>;

  constructor() {
    this.users = new Map();
    this.walks = new Map();
    this.friendships = new Map();
    this.stores = new Map();
    this.storeTraffic = new Map();
    
    // Mock data - todo: remove mock functionality
    this.seedMockData();
  }

  private seedMockData() {
    // Create mock users with hashed passwords
    // Password for all users: "123456"
    const hashedPassword = bcrypt.hashSync("123456", 10);
    
    const mockUsers: User[] = [
      // Usuários originais
      { id: "1", username: "maria.silva", password: hashedPassword, displayName: "Maria Silva", avatar: null, role: "user" },
      { id: "2", username: "joao.santos", password: hashedPassword, displayName: "João Santos", avatar: null, role: "user" },
      { id: "3", username: "ana.costa", password: hashedPassword, displayName: "Ana Costa", avatar: null, role: "user" },
      { id: "4", username: "pedro.lima", password: hashedPassword, displayName: "Pedro Lima", avatar: null, role: "user" },
      { id: "5", username: "carla.mendes", password: hashedPassword, displayName: "Carla Mendes", avatar: null, role: "user" },
      
      // Novos usuários solicitados
      { id: "6", username: "prefeitura.ctba", password: hashedPassword, displayName: "Prefeitura de Curitiba", avatar: null, role: "city_admin" },
      { id: "7", username: "loja.ruaxv", password: hashedPassword, displayName: "Lojista Rua XV", avatar: null, role: "store_owner" },
      { id: "8", username: "carlos.oliveira", password: hashedPassword, displayName: "Carlos Oliveira", avatar: null, role: "user" },
      { id: "9", username: "juliana.rocha", password: hashedPassword, displayName: "Juliana Rocha", avatar: null, role: "user" },
    ];
    
    mockUsers.forEach(user => this.users.set(user.id, user));
    
    // Create mock walks
    const mockWalks = [
      { id: "w1", userId: "1", distance: 45.3, energy: 2265, duration: 180, createdAt: new Date() },
      { id: "w2", userId: "2", distance: 38.7, energy: 1935, duration: 150, createdAt: new Date() },
      { id: "w3", userId: "3", distance: 32.1, energy: 1605, duration: 120, createdAt: new Date() },
      { id: "w4", userId: "4", distance: 28.5, energy: 1425, duration: 110, createdAt: new Date() },
      { id: "w5", userId: "5", distance: 24.9, energy: 1245, duration: 100, createdAt: new Date() },
      { id: "w6", userId: "8", distance: 52.1, energy: 2605, duration: 200, createdAt: new Date() },
      { id: "w7", userId: "9", distance: 41.2, energy: 2060, duration: 160, createdAt: new Date() },
    ];
    
    mockWalks.forEach(walk => this.walks.set(walk.id, walk));
    
    // Create mock stores
    const mockStores: Store[] = [
      {
        id: "s1",
        userId: "7", // loja.ruaxv
        name: "Cafeteria Rua XV",
        location: "Rua XV de Novembro, 1234",
        logo: null,
        kineticFloors: 8,
        ledTotems: 2,
        energyToday: 2340,
        dailyFootTraffic: 487,
        createdAt: new Date(),
      },
      {
        id: "s2",
        userId: "10", // Future store owner
        name: "Boutique Fashion",
        location: "Rua XV de Novembro, 2456",
        logo: null,
        kineticFloors: 6,
        ledTotems: 1,
        energyToday: 1890,
        dailyFootTraffic: 392,
        createdAt: new Date(),
      },
      {
        id: "s3",
        userId: "11", // Future store owner
        name: "Livraria Central",
        location: "Rua XV de Novembro, 3678",
        logo: null,
        kineticFloors: 10,
        ledTotems: 3,
        energyToday: 3120,
        dailyFootTraffic: 625,
        createdAt: new Date(),
      },
    ];
    
    mockStores.forEach(store => this.stores.set(store.id, store));
    
    // Create mock store traffic data
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const mockTraffic: StoreTraffic[] = [
      { id: "t1", storeId: "s1", pedestrians: 487, energyGenerated: 2340, date: today },
      { id: "t2", storeId: "s1", pedestrians: 512, energyGenerated: 2560, date: yesterday },
      { id: "t3", storeId: "s2", pedestrians: 392, energyGenerated: 1890, date: today },
      { id: "t4", storeId: "s2", pedestrians: 425, energyGenerated: 2080, date: yesterday },
      { id: "t5", storeId: "s3", pedestrians: 625, energyGenerated: 3120, date: today },
      { id: "t6", storeId: "s3", pedestrians: 590, energyGenerated: 2950, date: yesterday },
    ];
    
    mockTraffic.forEach(traffic => this.storeTraffic.set(traffic.id, traffic));
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
      avatar: insertUser.avatar ?? null,
      role: insertUser.role ?? "user"
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
    
    const rankings: Omit<RankingEntry, 'position'>[] = await Promise.all(
      usersToRank.map(async (user) => {
        const stats = await this.getUserTotalStats(user.id);
        return {
          id: user.id,
          name: user.displayName,
          energy: stats.totalEnergy,
          distance: stats.totalDistance,
          avatar: user.avatar ?? undefined,
        };
      })
    );
    
    // Sort by energy and assign positions
    rankings.sort((a, b) => b.energy - a.energy);
    
    return rankings.map((entry, index) => ({
      ...entry,
      position: index + 1,
    }));
  }

  async getCityStats(): Promise<{
    totalEnergy: number;
    totalUsers: number;
    activeUsers: number;
    topWalkers: { username: string; displayName: string; distance: number; energy: number }[];
  }> {
    const allUsers = Array.from(this.users.values());
    const totalUsers = allUsers.length;
    
    // Calculate total energy from all walks
    const allWalks = Array.from(this.walks.values());
    const totalEnergy = allWalks.reduce((sum, walk) => sum + walk.energy, 0);
    
    // Active users = users with at least one walk
    const usersWithWalks = new Set(allWalks.map(w => w.userId));
    const activeUsers = usersWithWalks.size;
    
    // Get top 10 walkers
    const userStats = await Promise.all(
      allUsers.map(async (user) => {
        const stats = await this.getUserTotalStats(user.id);
        return {
          username: user.username,
          displayName: user.displayName,
          distance: stats.totalDistance,
          energy: stats.totalEnergy,
        };
      })
    );
    
    // Sort by distance and get top 10
    const topWalkers = userStats
      .filter(u => u.distance > 0)
      .sort((a, b) => b.distance - a.distance)
      .slice(0, 10);
    
    return {
      totalEnergy,
      totalUsers,
      activeUsers,
      topWalkers,
    };
  }

  // Stores
  async createStore(insertStore: InsertStore): Promise<Store> {
    const id = randomUUID();
    const store: Store = {
      ...insertStore,
      id,
      logo: insertStore.logo ?? null,
      kineticFloors: insertStore.kineticFloors ?? 0,
      ledTotems: insertStore.ledTotems ?? 0,
      energyToday: insertStore.energyToday ?? 0,
      dailyFootTraffic: insertStore.dailyFootTraffic ?? 0,
      createdAt: new Date(),
    };
    this.stores.set(id, store);
    return store;
  }

  async getAllStores(): Promise<Store[]> {
    return Array.from(this.stores.values());
  }

  async getStoreByUserId(userId: string): Promise<Store | undefined> {
    return Array.from(this.stores.values()).find(
      (store) => store.userId === userId
    );
  }

  async getStoreStats(storeId: string): Promise<{
    totalPedestrians: number;
    totalEnergy: number;
    todayPedestrians: number;
    todayEnergy: number;
  }> {
    const traffic = Array.from(this.storeTraffic.values()).filter(
      (t) => t.storeId === storeId
    );
    
    const totalPedestrians = traffic.reduce((sum, t) => sum + t.pedestrians, 0);
    const totalEnergy = traffic.reduce((sum, t) => sum + t.energyGenerated, 0);
    
    // Get today's traffic (simplified - in production would use date comparison)
    const todayTraffic = traffic.slice(-1)[0]; // Last entry is "today"
    const todayPedestrians = todayTraffic?.pedestrians ?? 0;
    const todayEnergy = todayTraffic?.energyGenerated ?? 0;
    
    return {
      totalPedestrians,
      totalEnergy,
      todayPedestrians,
      todayEnergy,
    };
  }

  async createStoreTraffic(insertTraffic: InsertStoreTraffic): Promise<StoreTraffic> {
    const id = randomUUID();
    const traffic: StoreTraffic = {
      ...insertTraffic,
      id,
      date: new Date(),
    };
    this.storeTraffic.set(id, traffic);
    return traffic;
  }
}

export const storage = new MemStorage();
