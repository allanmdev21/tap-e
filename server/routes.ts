import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, loginSchema, insertWalkSchema, insertFriendshipSchema } from "@shared/schema";
import { z } from "zod";

const createStoreSchema = z.object({
  ownerUsername: z.string().min(3),
  name: z.string().min(1),
  location: z.string().min(1),
  kineticFloors: z.coerce.number().int().min(0).default(0),
  ledTotems: z.coerce.number().int().min(0).default(0),
  energyToday: z.coerce.number().min(0).default(0),
  dailyFootTraffic: z.coerce.number().int().min(0).default(0),
  logo: z.string().nullable().optional(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      
      const existingUser = await storage.getUserByUsername(data.username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }
      
      const user = await storage.createUser(data);
      const { password, ...userWithoutPassword } = user;
      
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(400).json({ error: "Invalid data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);
      
      const user = await storage.verifyPassword(data.username, data.password);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Regenerate session to prevent fixation attacks
      req.session.regenerate((err) => {
        if (err) {
          return res.status(500).json({ error: "Session error" });
        }

        // Store user info in server-side session
        req.session.userId = user.id;
        req.session.role = user.role;
        
        const { password, ...userWithoutPassword } = user;
        res.json({ user: userWithoutPassword });
      });
    } catch (error) {
      res.status(400).json({ error: "Invalid data" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.clearCookie('connect.sid');
      res.json({ message: "Logged out successfully" });
    });
  });

  // User routes
  app.get("/api/users/:id", async (req, res) => {
    const user = await storage.getUser(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const { password, ...userWithoutPassword } = user;
    const stats = await storage.getUserTotalStats(user.id);
    const friends = await storage.getFriends(user.id);
    
    res.json({
      user: userWithoutPassword,
      ...stats,
      friendsCount: friends.length,
    });
  });

  app.get("/api/users/by-username/:username", async (req, res) => {
    const user = await storage.getUserByUsername(req.params.username);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  // Walk routes
  app.post("/api/walks", async (req, res) => {
    try {
      const data = insertWalkSchema.parse(req.body);
      const walk = await storage.createWalk(data);
      res.json(walk);
    } catch (error) {
      res.status(400).json({ error: "Invalid data" });
    }
  });

  app.get("/api/walks/user/:userId", async (req, res) => {
    const walks = await storage.getWalksByUser(req.params.userId);
    res.json(walks);
  });

  // Ranking routes
  app.get("/api/ranking", async (req, res) => {
    const friendsOnly = req.query.friendsOnly === "true";
    const userId = req.query.userId as string | undefined;
    
    const rankings = await storage.getRankingData(friendsOnly, userId);
    res.json(rankings);
  });

  // Friend routes
  app.post("/api/friends/request", async (req, res) => {
    try {
      const data = insertFriendshipSchema.parse(req.body);
      const friendship = await storage.createFriendship(data);
      res.json(friendship);
    } catch (error) {
      res.status(400).json({ error: "Invalid data" });
    }
  });

  app.put("/api/friends/:id/accept", async (req, res) => {
    await storage.updateFriendshipStatus(req.params.id, "accepted");
    res.json({ success: true });
  });

  app.put("/api/friends/:id/reject", async (req, res) => {
    await storage.updateFriendshipStatus(req.params.id, "rejected");
    res.json({ success: true });
  });

  app.delete("/api/friends/:userId/:friendId", async (req, res) => {
    await storage.removeFriendship(req.params.userId, req.params.friendId);
    res.json({ success: true });
  });

  app.get("/api/friends/:userId", async (req, res) => {
    const friends = await storage.getFriends(req.params.userId);
    const friendsWithoutPasswords = friends.map(({ password, ...friend }) => friend);
    res.json(friendsWithoutPasswords);
  });

  app.get("/api/friends/:userId/requests", async (req, res) => {
    try {
      const friendships = await storage.getFriendships(req.params.userId);
      const pendingRequests = friendships.filter(
        f => f.friendId === req.params.userId && f.status === "pending"
      );
      
      // Enrich with requester details
      const requestsWithDetails = await Promise.all(
        pendingRequests.map(async (request) => {
          const requester = await storage.getUser(request.userId);
          return {
            ...request,
            requesterName: requester?.displayName || "Usuário Desconhecido",
            requesterUsername: requester?.username || "unknown",
          };
        })
      );
      
      res.json(requestsWithDetails);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch requests" });
    }
  });

  app.get("/api/city/stats", async (req, res) => {
    try {
      const stats = await storage.getCityStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch city stats" });
    }
  });

  // Middleware to check authentication via server-side session
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Unauthorized - Please log in" });
    }
    req.userId = req.session.userId;
    req.userRole = req.session.role;
    next();
  };

  // Get all stores - ONLY for city_admin
  app.get("/api/stores", requireAuth, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.userId);
      if (!user || user.role !== "city_admin") {
        return res.status(403).json({ error: "Forbidden: Only city admins can view all stores" });
      }
      const stores = await storage.getAllStores();
      res.json(stores);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stores" });
    }
  });

  // Get own store - for authenticated store_owner
  app.get("/api/stores/my-store", requireAuth, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.userId);
      if (!user || user.role !== "store_owner") {
        return res.status(403).json({ error: "Forbidden: Only store owners can access this" });
      }
      const store = await storage.getStoreByUserId(req.userId);
      if (!store) {
        return res.status(404).json({ error: "Store not found" });
      }
      res.json(store);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch store" });
    }
  });

  app.post("/api/stores", requireAuth, async (req: any, res) => {
    try {
      const requester = await storage.getUser(req.userId);
      if (!requester || requester.role !== "city_admin") {
        return res.status(403).json({ error: "Forbidden: Only city admins can create stores" });
      }

      const payload = createStoreSchema.parse(req.body);
      const owner = await storage.getUserByUsername(payload.ownerUsername);

      if (!owner) {
        return res.status(404).json({ error: "Owner not found" });
      }

      if (owner.role !== "store_owner") {
        return res.status(400).json({ error: "O usuário informado não é um lojista" });
      }

      const existingStore = await storage.getStoreByUserId(owner.id);
      if (existingStore) {
        return res.status(400).json({ error: "Este lojista já possui uma loja cadastrada" });
      }

      const store = await storage.createStore({
        userId: owner.id,
        name: payload.name,
        location: payload.location,
        kineticFloors: payload.kineticFloors,
        ledTotems: payload.ledTotems,
        energyToday: payload.energyToday,
        dailyFootTraffic: payload.dailyFootTraffic,
        logo: payload.logo ?? null,
      });

      res.status(201).json(store);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create store" });
    }
  });

  // Get store stats - verify ownership
  app.get("/api/stores/:storeId/stats", requireAuth, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.userId);
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // City admin can see any store stats
      if (user.role === "city_admin") {
        const stats = await storage.getStoreStats(req.params.storeId);
        return res.json(stats);
      }

      // Store owner can only see their own store stats
      if (user.role === "store_owner") {
        const store = await storage.getStoreByUserId(req.userId);
        if (!store || store.id !== req.params.storeId) {
          return res.status(403).json({ error: "Forbidden: Can only view own store stats" });
        }
        const stats = await storage.getStoreStats(req.params.storeId);
        return res.json(stats);
      }

      return res.status(403).json({ error: "Forbidden" });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch store stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
