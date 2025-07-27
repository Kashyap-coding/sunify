import { type User, type InsertUser, type SolarInstallation, type InsertSolarInstallation, type SolarReading, type InsertSolarReading } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Solar installations
  getAllInstallations(): Promise<SolarInstallation[]>;
  getInstallation(id: string): Promise<SolarInstallation | undefined>;
  getInstallationByDeviceId(deviceId: string): Promise<SolarInstallation | undefined>;
  getInstallationsByDistrict(district: string): Promise<SolarInstallation[]>;
  getInstallationsByState(state: string): Promise<SolarInstallation[]>;
  createInstallation(installation: InsertSolarInstallation): Promise<SolarInstallation>;
  updateInstallation(id: string, updates: Partial<SolarInstallation>): Promise<SolarInstallation | undefined>;
  
  // Solar readings
  addReading(reading: InsertSolarReading): Promise<SolarReading>;
  getReadingsByDeviceId(deviceId: string, limit?: number): Promise<SolarReading[]>;
  getLatestReadings(limit?: number): Promise<SolarReading[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private installations: Map<string, SolarInstallation>;
  private readings: Map<string, SolarReading>;

  constructor() {
    this.users = new Map();
    this.installations = new Map();
    this.readings = new Map();
    
    // Initialize with sample data for Karnataka
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Start with no devices - wait for user's Arduino to connect
    console.log("Storage initialized - waiting for Arduino devices to connect");
  }

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
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllInstallations(): Promise<SolarInstallation[]> {
    return Array.from(this.installations.values());
  }

  async getInstallation(id: string): Promise<SolarInstallation | undefined> {
    return this.installations.get(id);
  }

  async getInstallationByDeviceId(deviceId: string): Promise<SolarInstallation | undefined> {
    return Array.from(this.installations.values()).find(
      (installation) => installation.deviceId === deviceId,
    );
  }

  async getInstallationsByDistrict(district: string): Promise<SolarInstallation[]> {
    return Array.from(this.installations.values()).filter(
      (installation) => installation.district === district,
    );
  }

  async getInstallationsByState(state: string): Promise<SolarInstallation[]> {
    return Array.from(this.installations.values()).filter(
      (installation) => installation.state === state,
    );
  }

  async createInstallation(installation: InsertSolarInstallation): Promise<SolarInstallation> {
    const id = randomUUID();
    const fullInstallation: SolarInstallation = {
      ...installation,
      id,
      lastUpdate: new Date(),
      state: installation.state || "Karnataka",
    };
    this.installations.set(id, fullInstallation);
    return fullInstallation;
  }

  async updateInstallation(id: string, updates: Partial<SolarInstallation>): Promise<SolarInstallation | undefined> {
    const installation = this.installations.get(id);
    if (!installation) return undefined;

    const updatedInstallation = {
      ...installation,
      ...updates,
      lastUpdate: new Date(),
    };
    this.installations.set(id, updatedInstallation);
    return updatedInstallation;
  }

  async addReading(reading: InsertSolarReading): Promise<SolarReading> {
    const id = randomUUID();
    const fullReading: SolarReading = {
      ...reading,
      id,
      timestamp: new Date(),
      temperature: reading.temperature || null,
    };
    this.readings.set(id, fullReading);
    return fullReading;
  }

  async getReadingsByDeviceId(deviceId: string, limit = 10): Promise<SolarReading[]> {
    return Array.from(this.readings.values())
      .filter((reading) => reading.deviceId === deviceId)
      .sort((a, b) => new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime())
      .slice(0, limit);
  }

  async getLatestReadings(limit = 10): Promise<SolarReading[]> {
    return Array.from(this.readings.values())
      .sort((a, b) => new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime())
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
