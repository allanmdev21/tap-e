import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, loginSchema, insertWalkSchema, insertFriendshipSchema, type RankingEntry } from "@shared/schema";

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
      
      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(400).json({ error: "Invalid data" });
    }
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
    const friendships = await storage.getFriendships(req.params.userId);
    const pendingRequests = friendships.filter(
      f => f.friendId === req.params.userId && f.status === "pending"
    );
    res.json(pendingRequests);
  });

  const httpServer = createServer(app);
  return httpServer;
}
