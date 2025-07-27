import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { Satellite, Globe, CloudSun } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface IndiaMapProps {
  isVisible: boolean;
}

export default function IndiaMap({ isVisible }: IndiaMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [showPVGIS, setShowPVGIS] = useState(true);
  const [showGoogleSolar, setShowGoogleSolar] = useState(true);
  const [showWeather, setShowWeather] = useState(true);
  const [nationalStats, setNationalStats] = useState({
    capacity: "75.2 GW",
    target: "500 GW",
    avgIrradiance: "5.2 kWh/m²",
    peakMonth: "May",
    optimalTilt: "23°",
    variability: "±15%",
    cloudCover: "25%",
    uvIndex: "8.2",
    forecastProduction: "85% Normal",
  });
  const { toast } = useToast();

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current || !isVisible) return;

    // Initialize map centered on India
    mapRef.current = L.map(mapContainerRef.current).setView([20.5937, 78.9629], 5);

    // Add tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© OpenStreetMap contributors',
    }).addTo(mapRef.current);

    // Add sample markers for major solar installations
    const majorInstallations = [
      { name: "Rajasthan Solar Park", lat: 27.0238, lng: 74.2179, capacity: "18.4 GW" },
      { name: "Karnataka Solar", lat: 15.3173, lng: 75.7139, capacity: "8.8 GW" },
      { name: "Tamil Nadu Solar", lat: 11.1271, lng: 78.6569, capacity: "5.6 GW" },
      { name: "Gujarat Solar", lat: 23.0225, lng: 72.5714, capacity: "4.2 GW" },
    ];

    majorInstallations.forEach((installation, index) => {
      const colors = ["#2563EB", "#10B981", "#F59E0B", "#EF4444"];
      
      const customIcon = L.divIcon({
        html: `
          <div style="
            background-color: ${colors[index]};
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <i class="fas fa-solar-panel" style="color: white; font-size: 10px;"></i>
          </div>
        `,
        className: "custom-div-icon",
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([installation.lat, installation.lng], {
        icon: customIcon,
      });

      const popupContent = `
        <div class="p-3" style="min-width: 200px;">
          <h4 class="font-semibold text-gray-900" style="margin-bottom: 8px;">${installation.name}</h4>
          <p class="text-sm text-gray-600" style="margin-bottom: 12px;">Capacity: ${installation.capacity}</p>
          <button 
            id="load-data-${index}"
            class="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
            style="cursor: pointer; border: none; outline: none;"
          >
            Load Solar Data
          </button>
          <div id="data-display-${index}" style="margin-top: 10px; display: none;">
            <div class="text-xs text-gray-600">
              <div style="margin: 4px 0;"><strong>Weather:</strong> <span id="weather-${index}">Loading...</span></div>
              <div style="margin: 4px 0;"><strong>Temperature:</strong> <span id="temp-${index}">Loading...</span></div>
              <div style="margin: 4px 0;"><strong>Solar Potential:</strong> <span id="solar-${index}">Loading...</span></div>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      // Add event listener after popup opens
      marker.on('popupopen', () => {
        const button = document.getElementById(`load-data-${index}`);
        if (button) {
          button.addEventListener('click', async () => {
            button.textContent = 'Loading...';
            button.disabled = true;
            
            try {
              const [weatherData, solarData] = await Promise.all([
                api.external.getWeatherData(installation.lat, installation.lng),
                api.external.getSolarInsight(installation.lat, installation.lng)
              ]);
              
              const dataDisplay = document.getElementById(`data-display-${index}`);
              const weatherSpan = document.getElementById(`weather-${index}`);
              const tempSpan = document.getElementById(`temp-${index}`);
              const solarSpan = document.getElementById(`solar-${index}`);
              
              if (dataDisplay && weatherSpan && tempSpan && solarSpan) {
                weatherSpan.textContent = weatherData.weather[0]?.description || 'N/A';
                tempSpan.textContent = `${weatherData.main?.temp}°C` || 'N/A';
                solarSpan.textContent = `${solarData.solarPotential?.yearlyEnergyDcKwh || 1500} kWh/year`;
                dataDisplay.style.display = 'block';
              }
              
              button.textContent = 'Data Loaded';
              
              toast({
                title: "Solar Data Loaded",
                description: `Data loaded for ${installation.name}`,
              });
              
            } catch (error) {
              console.error('Error loading data:', error);
              button.textContent = 'Error - Retry';
              button.disabled = false;
              
              toast({
                title: "Error Loading Data",
                description: "Failed to load solar data. Please try again.",
                variant: "destructive",
              });
            }
          });
        }
      });

      marker.addTo(mapRef.current!);
    });

    // Event listeners are now handled per marker popup

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [isVisible, toast]);

  const togglePVGIS = () => setShowPVGIS(!showPVGIS);
  const toggleGoogleSolar = () => setShowGoogleSolar(!showGoogleSolar);
  const toggleWeather = () => setShowWeather(!showWeather);

  if (!isVisible) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* India Map Section */}
      <div>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900">India Solar Irradiance Map</h3>
            <p className="text-sm text-gray-600">PVGIS & Google Solar API Integration</p>
          </div>
          <div className="relative">
            <div ref={mapContainerRef} className="h-96" />
            
            {/* API Status Indicators */}
            <div className="absolute top-4 left-4 space-y-2">
              <div className={`bg-white px-3 py-1 rounded-full shadow-md border border-gray-200 flex items-center space-x-2 ${showPVGIS ? 'opacity-100' : 'opacity-50'}`}>
                <div className="w-2 h-2 bg-secondary rounded-full"></div>
                <span className="text-xs text-gray-600">PVGIS API</span>
              </div>
              <div className={`bg-white px-3 py-1 rounded-full shadow-md border border-gray-200 flex items-center space-x-2 ${showGoogleSolar ? 'opacity-100' : 'opacity-50'}`}>
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-xs text-gray-600">Google Solar</span>
              </div>
              <div className={`bg-white px-3 py-1 rounded-full shadow-md border border-gray-200 flex items-center space-x-2 ${showWeather ? 'opacity-100' : 'opacity-50'}`}>
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <span className="text-xs text-gray-600">OpenWeather</span>
              </div>
            </div>
          </div>
        </div>

        {/* API Controls */}
        <div className="mt-4 grid grid-cols-3 gap-4">
          <Button
            variant={showPVGIS ? "default" : "outline"}
            onClick={togglePVGIS}
            className="p-3 h-auto flex flex-col items-center space-y-1"
          >
            <Satellite className="h-5 w-5" />
            <span className="text-sm font-medium">PVGIS Data</span>
          </Button>
          <Button
            variant={showGoogleSolar ? "default" : "outline"}
            onClick={toggleGoogleSolar}
            className="p-3 h-auto flex flex-col items-center space-y-1"
          >
            <Globe className="h-5 w-5" />
            <span className="text-sm font-medium">Solar API</span>
          </Button>
          <Button
            variant={showWeather ? "default" : "outline"}
            onClick={toggleWeather}
            className="p-3 h-auto flex flex-col items-center space-y-1"
          >
            <CloudSun className="h-5 w-5" />
            <span className="text-sm font-medium">Weather</span>
          </Button>
        </div>
      </div>

      {/* India Analytics */}
      <div className="space-y-6">
        {/* National Stats */}
        <Card className="bg-gradient-to-r from-secondary to-green-600 text-white">
          <CardHeader>
            <CardTitle className="text-lg">National Solar Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold">{nationalStats.capacity}</div>
                <div className="text-green-100 text-sm">Installed Capacity</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{nationalStats.target}</div>
                <div className="text-green-100 text-sm">2030 Target</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Solar Irradiance Data */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Solar Irradiance Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Average Daily Irradiance</span>
              <span className="font-semibold text-gray-900">{nationalStats.avgIrradiance}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Peak Month</span>
              <span className="font-semibold text-gray-900">{nationalStats.peakMonth}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Optimal Tilt Angle</span>
              <span className="font-semibold text-gray-900">{nationalStats.optimalTilt}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Annual Variability</span>
              <span className="font-semibold text-gray-900">{nationalStats.variability}</span>
            </div>
          </CardContent>
        </Card>

        {/* State-wise Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Solar States</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <span className="text-sm text-gray-900">Rajasthan</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">18.4 GW</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-secondary rounded-full"></div>
                <span className="text-sm text-gray-900">Karnataka</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">8.8 GW</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-accent rounded-full"></div>
                <span className="text-sm text-gray-900">Tamil Nadu</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">5.6 GW</span>
            </div>
          </CardContent>
        </Card>

        {/* Weather Integration */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Current Weather Impact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Cloud Cover</span>
              <span className="font-semibold text-gray-900">{nationalStats.cloudCover}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">UV Index</span>
              <span className="font-semibold text-gray-900">{nationalStats.uvIndex}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Production Forecast</span>
              <span className="font-semibold text-secondary">{nationalStats.forecastProduction}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
