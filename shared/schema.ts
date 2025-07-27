import { sql } from "drizzle-orm";
import { pgTable, text, varchar, real, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const solarInstallations = pgTable("solar_installations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  deviceId: text("device_id").notNull().unique(),
  location: text("location").notNull(),
  district: text("district").notNull(),
  state: text("state").notNull().default("Karnataka"),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  annualMoneySaved: real("annual_money_saved").notNull(),
  annualElectricitySaved: real("annual_electricity_saved").notNull(),
  annualSolarEnergyUsage: real("annual_solar_energy_usage").notNull(),
  surfaceArea: real("surface_area").notNull(),
  costPerSquareMeter: real("cost_per_square_meter").notNull(),
  currentPower: real("current_power").default(0),
  voltage: real("voltage").default(0),
  current: real("current").default(0),
  irradiance: real("irradiance").default(0),
  panelAngle: real("panel_angle").default(0),
  sunlightIntensity: real("sunlight_intensity").default(0),
  status: text("status").notNull().default("active"),
  lastUpdate: timestamp("last_update").defaultNow(),
  isOnline: boolean("is_online").default(false),
});

export const solarReadings = pgTable("solar_readings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  deviceId: text("device_id").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  location: text("location").notNull(),
  power: real("power").notNull(),
  voltage: real("voltage").notNull(),
  current: real("current").notNull(),
  irradiance: real("irradiance").notNull(),
  panelAngle: real("panel_angle").notNull(),
  sunlightIntensity: real("sunlight_intensity").notNull(),
  temperature: real("temperature"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertSolarInstallationSchema = createInsertSchema(solarInstallations).omit({
  id: true,
  lastUpdate: true,
});

export const insertSolarReadingSchema = createInsertSchema(solarReadings).omit({
  id: true,
  timestamp: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertSolarInstallation = z.infer<typeof insertSolarInstallationSchema>;
export type SolarInstallation = typeof solarInstallations.$inferSelect;
export type InsertSolarReading = z.infer<typeof insertSolarReadingSchema>;
export type SolarReading = typeof solarReadings.$inferSelect;
