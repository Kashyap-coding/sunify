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
      
      // Validate coordinates
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      
      if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({ error: "Invalid coordinates" });
      }
      
      // Use the correct PVGIS API endpoint with proper parameters
      const response = await axios.get(
        `https://re.jrc.ec.europa.eu/api/v5_2/PVcalc`,
        {
          params: {
            lat: latitude,
            lon: longitude,
            raddatabase: 'PVGIS-SARAH2',
            browser: 0,
            outputformat: 'json',
            peakpower: 1,
            loss: 14,
            mountingplace: 'free',
            angle: 35,
            aspect: 0
          },
          timeout: 10000,
          headers: {
            'User-Agent': 'Karnataka Solar Monitor'
          }
        }
      );
      res.json(response.data);
    } catch (error) {
      console.error('PVGIS API Error:', error.message);
      if (error.response) {
        res.status(error.response.status).json({ 
          error: "PVGIS API error", 
          details: error.response.data 
        });
      } else if (error.code === 'ECONNABORTED') {
        res.status(408).json({ error: "PVGIS API timeout" });
      } else {
        res.status(500).json({ error: "Failed to fetch PVGIS data" });
      }
    }
  });

  app.get("/api/weather/:lat/:lng", async (req, res) => {
    try {
      const { lat, lng } = req.params;
      
      // Validate coordinates
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      
      if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({ error: "Invalid coordinates" });
      }
      
      const apiKey = process.env.OPENWEATHER_API_KEY || process.env.VITE_OPENWEATHER_API_KEY;
      
      if (!apiKey || apiKey === "demo_key") {
        return res.status(200).json({
          main: { temp: 25, humidity: 60 },
          weather: [{ main: "Clear", description: "clear sky" }],
          clouds: { all: 10 }
        });
      }
      
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`,
        {
          timeout: 10000,
          headers: {
            'User-Agent': 'Karnataka Solar Monitor'
          }
        }
      );
      res.json(response.data);
    } catch (error) {
      console.error('Weather API Error:', error.message);
      if (error.response && error.response.status === 401) {
        res.status(401).json({ error: "Invalid OpenWeather API key" });
      } else if (error.code === 'ECONNABORTED') {
        res.status(408).json({ error: "Weather API timeout" });
      } else {
        // Return mock data as fallback
        res.status(200).json({
          main: { temp: 25, humidity: 60 },
          weather: [{ main: "Clear", description: "clear sky" }],
          clouds: { all: 10 }
        });
      }
    }
  });

  app.get("/api/solar-insight/:lat/:lng", async (req, res) => {
    try {
      const { lat, lng } = req.params;
      
      // Validate coordinates
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      
      if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({ error: "Invalid coordinates" });
      }
      
      const apiKey = process.env.GOOGLE_SOLAR_API_KEY || process.env.VITE_GOOGLE_SOLAR_API_KEY;
      
      if (!apiKey || apiKey === "demo_key") {
        return res.status(200).json({
          solarPotential: {
            yearlyEnergyDcKwh: 1500,
            roofSegmentSummaries: [
              {
                yearlyEnergyDcKwh: 1500,
                segmentIndex: 0
              }
            ]
          }
        });
      }
      
      const response = await axios.get(
        `https://solar.googleapis.com/v1/buildingInsights:findClosest?location.latitude=${latitude}&location.longitude=${longitude}&key=${apiKey}`,
        {
          timeout: 10000,
          headers: {
            'User-Agent': 'Karnataka Solar Monitor'
          }
        }
      );
      res.json(response.data);
    } catch (error) {
      console.error('Google Solar API Error:', error.message);
      if (error.response && error.response.status === 403) {
        res.status(403).json({ error: "Invalid Google Solar API key" });
      } else if (error.code === 'ECONNABORTED') {
        res.status(408).json({ error: "Google Solar API timeout" });
      } else {
        // Return mock data as fallback
        res.status(200).json({
          solarPotential: {
            yearlyEnergyDcKwh: 1500,
            roofSegmentSummaries: [
              {
                yearlyEnergyDcKwh: 1500,
                segmentIndex: 0
              }
            ]
          }
        });
      }
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
