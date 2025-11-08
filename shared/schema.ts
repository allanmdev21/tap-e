import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  avatar: text("avatar"),
  role: text("role").notNull().default("user"), // user, store_owner, city_admin
});

export const walks = pgTable("walks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  distance: real("distance").notNull(),
  energy: real("energy").notNull(),
  duration: integer("duration").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const friendships = pgTable("friendships", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  friendId: varchar("friend_id").notNull(),
  status: text("status").notNull().default("pending"), // pending, accepted, rejected
  createdAt: timestamp("created_at").defaultNow(),
});

export const stores = pgTable("stores", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(), // Owner of the store
  name: text("name").notNull(),
  location: text("location").notNull(),
  logo: text("logo"),
  kineticFloors: integer("kinetic_floors").default(0), // Number of kinetic floor tiles
  ledTotems: integer("led_totems").default(0), // Number of LED totems
  energyToday: real("energy_today").default(0),
  dailyFootTraffic: integer("daily_foot_traffic").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const storeTraffic = pgTable("store_traffic", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  storeId: varchar("store_id").notNull(),
  pedestrians: integer("pedestrians").notNull(),
  energyGenerated: real("energy_generated").notNull(),
  date: timestamp("date").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});

export const insertWalkSchema = createInsertSchema(walks).omit({
  id: true,
  createdAt: true,
});

export const insertFriendshipSchema = createInsertSchema(friendships).omit({
  id: true,
  createdAt: true,
  status: true,
});

export const insertStoreSchema = createInsertSchema(stores).omit({
  id: true,
  createdAt: true,
});

export const insertStoreTrafficSchema = createInsertSchema(storeTraffic).omit({
  id: true,
  date: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type LoginCredentials = z.infer<typeof loginSchema>;
export type InsertWalk = z.infer<typeof insertWalkSchema>;
export type Walk = typeof walks.$inferSelect;
export type InsertFriendship = z.infer<typeof insertFriendshipSchema>;
export type Friendship = typeof friendships.$inferSelect;
export type InsertStore = z.infer<typeof insertStoreSchema>;
export type Store = typeof stores.$inferSelect;
export type InsertStoreTraffic = z.infer<typeof insertStoreTrafficSchema>;
export type StoreTraffic = typeof storeTraffic.$inferSelect;

export type RankingEntry = {
  id: string;
  position: number;
  name: string;
  distance: number;
  energy: number;
  avatar?: string;
  isFriend?: boolean;
};

export type UserProfile = {
  user: User;
  totalWalks: number;
  totalDistance: number;
  totalEnergy: number;
  friendsCount: number;
};
