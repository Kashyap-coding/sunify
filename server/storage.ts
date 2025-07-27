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
    const sampleInstallations: InsertSolarInstallation[] = [
      {
        deviceId: "DEVICE_001",
        location: "Community Solar Park A",
        district: "Bengaluru Urban",
        state: "Karnataka",
        latitude: 12.9716,
        longitude: 77.5946,
        annualMoneySaved: 285400,
        annualElectricitySaved: 42800,
        annualSolarEnergyUsage: 38520,
        surfaceArea: 450,
        costPerSquareMeter: 15200,
        currentPower: 12.5,
        voltage: 24.8,
        current: 0.5,
        irradiance: 850,
        status: "active",
        isOnline: true,
      },
      {
        deviceId: "DEVICE_002",
        location: "Rural Installation B",
        district: "Mysuru",
        state: "Karnataka",
        latitude: 12.2958,
        longitude: 76.6394,
        annualMoneySaved: 142700,
        annualElectricitySaved: 21400,
        annualSolarEnergyUsage: 19260,
        surfaceArea: 225,
        costPerSquareMeter: 14800,
        currentPower: 6.2,
        voltage: 24.1,
        current: 0.26,
        irradiance: 780,
        status: "active",
        isOnline: true,
      },
      {
        deviceId: "DEVICE_003",
        location: "Coastal Solar Farm C",
        district: "Mangaluru",
        state: "Karnataka",
        latitude: 12.9141,
        longitude: 74.8560,
        annualMoneySaved: 375200,
        annualElectricitySaved: 56280,
        annualSolarEnergyUsage: 50652,
        surfaceArea: 590,
        costPerSquareMeter: 16500,
        currentPower: 15.8,
        voltage: 25.2,
        current: 0.63,
        irradiance: 920,
        status: "maintenance",
        isOnline: false,
      },
    ];

    sampleInstallations.forEach(installation => {
      const id = randomUUID();
      const fullInstallation: SolarInstallation = {
        ...installation,
        id,
        lastUpdate: new Date(),
      };
      this.installations.set(id, fullInstallation);
    });
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
