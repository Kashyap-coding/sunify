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
      const url = `https://re.jrc.ec.europa.eu/api/v5_2/PVcalc?lat=${lat}&lon=${lng}&raddatabase=PVGIS-SARAH2&browser=0&outputformat=json`;
      console.log(`Making PVGIS API request to: ${url}`);
      
      const response = await axios.get(url, { timeout: 15000 });
      res.json(response.data);
    } catch (error: any) {
      console.error("PVGIS API error:", error.response?.data || error.message);
      res.status(500).json({ 
        error: "Failed to fetch PVGIS data",
        details: error.response?.data || error.message,
        status: error.response?.status
      });
    }
  });

  app.get("/api/weather/:lat/:lng", async (req, res) => {
    try {
      const { lat, lng } = req.params;
      const apiKey = process.env.OPENWEATHER_API_KEY;
      
      if (!apiKey || apiKey === "demo_key") {
        return res.status(400).json({ 
          error: "OpenWeather API key not configured", 
          details: "Please provide a valid OPENWEATHER_API_KEY" 
        });
      }

      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`;
      console.log(`Making weather API request to: ${url.replace(apiKey, '[API_KEY]')}`);
      
      const response = await axios.get(url, { timeout: 10000 });
      res.json(response.data);
    } catch (error: any) {
      console.error("Weather API error:", error.response?.data || error.message);
      res.status(500).json({ 
        error: "Failed to fetch weather data",
        details: error.response?.data?.message || error.message,
        status: error.response?.status
      });
    }
  });

  app.get("/api/solar-insight/:lat/:lng", async (req, res) => {
    try {
      const { lat, lng } = req.params;
      const apiKey = process.env.GOOGLE_SOLAR_API_KEY;
      
      if (!apiKey || apiKey === "demo_key") {
        return res.status(400).json({ 
          error: "Google Solar API key not configured", 
          details: "Please provide a valid GOOGLE_SOLAR_API_KEY" 
        });
      }

      const url = `https://solar.googleapis.com/v1/buildingInsights:findClosest?location.latitude=${lat}&location.longitude=${lng}&key=${apiKey}`;
      console.log(`Making Google Solar API request to: ${url.replace(apiKey, '[API_KEY]')}`);
      
      const response = await axios.get(url, { timeout: 15000 });
      res.json(response.data);
    } catch (error: any) {
      console.error("Google Solar API error:", error.response?.data || error.message);
      res.status(500).json({ 
        error: "Failed to fetch Google Solar data",
        details: error.response?.data?.error?.message || error.message,
        status: error.response?.status
      });
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
            location: message.location,
            power: message.power,
            voltage: message.voltage,
            current: message.current,
            irradiance: message.irradiance,
            panelAngle: message.panelAngle,
            sunlightIntensity: message.sunlightIntensity,
            temperature: message.temperature,
          });

          await storage.addReading(reading);

          // Update installation status
          let installation = await storage.getInstallationByDeviceId(message.deviceId);
          if (installation) {
            await storage.updateInstallation(installation.id, {
              currentPower: message.power,
              voltage: message.voltage,
              current: message.current,
              irradiance: message.irradiance,
              panelAngle: message.panelAngle,
              sunlightIntensity: message.sunlightIntensity,
              isOnline: true,
              lastUpdate: new Date(),
            });
          } else {
            // Create new installation if device doesn't exist
            const newInstallation = await storage.createInstallation({
              deviceId: message.deviceId,
              location: message.location || "Arduino Device Location",
              district: message.district || "Unknown District",
              state: "Karnataka",
              latitude: message.latitude || 15.3173,
              longitude: message.longitude || 75.7139,
              annualMoneySaved: 0,
              annualElectricitySaved: 0,
              annualSolarEnergyUsage: 0,
              surfaceArea: 0,
              costPerSquareMeter: 0,
              currentPower: message.power,
              voltage: message.voltage,
              current: message.current,
              irradiance: message.irradiance,
              panelAngle: message.panelAngle,
              sunlightIntensity: message.sunlightIntensity,
              status: "active",
              isOnline: true,
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
