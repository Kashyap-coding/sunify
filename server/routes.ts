import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertSolarReadingSchema } from "@shared/schema";
import axios from "axios";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Solar installations API routes
  app.get("/api/installations", async (req, res) => {
    try {
      const installations = await storage.getAllInstallations();
      res.json(installations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch installations" });
    }
  });

  app.get("/api/installations/district/:district", async (req, res) => {
    try {
      const { district } = req.params;
      const installations = await storage.getInstallationsByDistrict(district);
      res.json(installations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch installations by district" });
    }
  });

  app.get("/api/installations/state/:state", async (req, res) => {
    try {
      const { state } = req.params;
      const installations = await storage.getInstallationsByState(state);
      res.json(installations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch installations by state" });
    }
  });

  // Solar readings API routes
  app.get("/api/readings/latest", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const readings = await storage.getLatestReadings(limit);
      res.json(readings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch latest readings" });
    }
  });

  app.get("/api/readings/device/:deviceId", async (req, res) => {
    try {
      const { deviceId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const readings = await storage.getReadingsByDeviceId(deviceId, limit);
      res.json(readings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch device readings" });
    }
  });

  // External API integrations
  app.get("/api/pvgis/:lat/:lng", async (req, res) => {
    try {
      const { lat, lng } = req.params;
      const response = await axios.get(
        `https://re.jrc.ec.europa.eu/api/v5_2/PVcalc?lat=${lat}&lon=${lng}&raddatabase=PVGIS-SARAH2&browser=0&outputformat=json`
      );
      res.json(response.data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch PVGIS data" });
    }
  });

  app.get("/api/weather/:lat/:lng", async (req, res) => {
    try {
      const { lat, lng } = req.params;
      const apiKey = process.env.OPENWEATHER_API_KEY || process.env.VITE_OPENWEATHER_API_KEY || "demo_key";
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`
      );
      res.json(response.data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch weather data" });
    }
  });

  app.get("/api/solar-insight/:lat/:lng", async (req, res) => {
    try {
      const { lat, lng } = req.params;
      const apiKey = process.env.GOOGLE_SOLAR_API_KEY || process.env.VITE_GOOGLE_SOLAR_API_KEY || "demo_key";
      const response = await axios.get(
        `https://solar.googleapis.com/v1/buildingInsights:findClosest?location.latitude=${lat}&location.longitude=${lng}&key=${apiKey}`
      );
      res.json(response.data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch Google Solar data" });
    }
  });

  // WebSocket server for real-time Arduino communication
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws) => {
    console.log('Arduino device connected');

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'arduino_data') {
          // Validate and store Arduino data
          const reading = insertSolarReadingSchema.parse({
            deviceId: message.deviceId,
            power: message.power,
            voltage: message.voltage,
            current: message.current,
            irradiance: message.irradiance,
            temperature: message.temperature,
          });

          await storage.addReading(reading);

          // Update installation status
          const installation = await storage.getInstallationByDeviceId(message.deviceId);
          if (installation) {
            await storage.updateInstallation(installation.id, {
              currentPower: message.power,
              voltage: message.voltage,
              current: message.current,
              irradiance: message.irradiance,
              isOnline: true,
              lastUpdate: new Date(),
            });
          }

          // Broadcast to all connected clients
          wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'solar_data_update',
                data: message,
                timestamp: new Date().toISOString(),
              }));
            }
          });
        }
      } catch (error) {
        console.error('Error processing Arduino data:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Invalid data format',
        }));
      }
    });

    ws.on('close', () => {
      console.log('Arduino device disconnected');
    });

    // Send connection confirmation
    ws.send(JSON.stringify({
      type: 'connection_established',
      message: 'Arduino connected successfully',
    }));
  });

  return httpServer;
}
