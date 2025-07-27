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
    totalStates: "15",
    totalInstallations: "9,653",
    totalMoneySaved: "₹348.5 Cr",
    totalElectricitySaved: "56.8 GWh",
    avgEfficiency: "19.7%",
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

    // Add sample markers for major solar installations across Indian states
    const majorInstallations = [
      { 
        name: "Rajasthan Solar Park", 
        lat: 27.0238, 
        lng: 74.2179, 
        capacity: "18.4 GW",
        annualMoneySaved: 85000000,
        annualElectricitySaved: 12500000,
        annualSolarEnergyUsage: 15200000,
        installations: 2847,
        avgEfficiency: "22.5%"
      },
      { 
        name: "Karnataka Solar Hub", 
        lat: 15.3173, 
        lng: 75.7139, 
        capacity: "8.8 GW",
        annualMoneySaved: 42000000,
        annualElectricitySaved: 6800000,
        annualSolarEnergyUsage: 8200000,
        installations: 1523,
        avgEfficiency: "21.8%"
      },
      { 
        name: "Tamil Nadu Solar", 
        lat: 11.1271, 
        lng: 78.6569, 
        capacity: "5.6 GW",
        annualMoneySaved: 28500000,
        annualElectricitySaved: 4200000,
        annualSolarEnergyUsage: 5100000,
        installations: 987,
        avgEfficiency: "20.9%"
      },
      { 
        name: "Gujarat Solar", 
        lat: 23.0225, 
        lng: 72.5714, 
        capacity: "4.2 GW",
        annualMoneySaved: 21000000,
        annualElectricitySaved: 3200000,
        annualSolarEnergyUsage: 3800000,
        installations: 756,
        avgEfficiency: "21.2%"
      },
      { 
        name: "Andhra Pradesh Solar", 
        lat: 15.9129, 
        lng: 79.7400, 
        capacity: "3.8 GW",
        annualMoneySaved: 18500000,
        annualElectricitySaved: 2850000,
        annualSolarEnergyUsage: 3400000,
        installations: 642,
        avgEfficiency: "20.5%"
      },
      { 
        name: "Maharashtra Solar", 
        lat: 19.7515, 
        lng: 75.7139, 
        capacity: "3.2 GW",
        annualMoneySaved: 15500000,
        annualElectricitySaved: 2400000,
        annualSolarEnergyUsage: 2900000,
        installations: 523,
        avgEfficiency: "19.8%"
      },
      { 
        name: "Punjab Solar", 
        lat: 31.1471, 
        lng: 75.3412, 
        capacity: "2.8 GW",
        annualMoneySaved: 13200000,
        annualElectricitySaved: 2100000,
        annualSolarEnergyUsage: 2500000,
        installations: 445,
        avgEfficiency: "20.1%"
      },
      { 
        name: "Madhya Pradesh Solar", 
        lat: 22.9734, 
        lng: 78.6569, 
        capacity: "2.5 GW",
        annualMoneySaved: 11800000,
        annualElectricitySaved: 1850000,
        annualSolarEnergyUsage: 2200000,
        installations: 398,
        avgEfficiency: "19.5%"
      },
      { 
        name: "Uttar Pradesh Solar", 
        lat: 26.8467, 
        lng: 80.9462, 
        capacity: "2.1 GW",
        annualMoneySaved: 9800000,
        annualElectricitySaved: 1600000,
        annualSolarEnergyUsage: 1900000,
        installations: 334,
        avgEfficiency: "18.9%"
      },
      { 
        name: "Haryana Solar", 
        lat: 29.0588, 
        lng: 76.0856, 
        capacity: "1.8 GW",
        annualMoneySaved: 8200000,
        annualElectricitySaved: 1350000,
        annualSolarEnergyUsage: 1600000,
        installations: 289,
        avgEfficiency: "19.2%"
      },
      { 
        name: "Odisha Solar", 
        lat: 20.9517, 
        lng: 85.0985, 
        capacity: "1.6 GW",
        annualMoneySaved: 7500000,
        annualElectricitySaved: 1200000,
        annualSolarEnergyUsage: 1400000,
        installations: 245,
        avgEfficiency: "18.7%"
      },
      { 
        name: "Telangana Solar", 
        lat: 18.1124, 
        lng: 79.0193, 
        capacity: "1.4 GW",
        annualMoneySaved: 6800000,
        annualElectricitySaved: 1100000,
        annualSolarEnergyUsage: 1300000,
        installations: 212,
        avgEfficiency: "19.1%"
      },
      { 
        name: "Kerala Solar", 
        lat: 10.8505, 
        lng: 76.2711, 
        capacity: "1.1 GW",
        annualMoneySaved: 5200000,
        annualElectricitySaved: 850000,
        annualSolarEnergyUsage: 1000000,
        installations: 167,
        avgEfficiency: "18.3%"
      },
      { 
        name: "West Bengal Solar", 
        lat: 22.9868, 
        lng: 87.8550, 
        capacity: "0.9 GW",
        annualMoneySaved: 4100000,
        annualElectricitySaved: 680000,
        annualSolarEnergyUsage: 800000,
        installations: 134,
        avgEfficiency: "17.8%"
      },
      { 
        name: "Himachal Pradesh Solar", 
        lat: 31.1048, 
        lng: 77.1734, 
        capacity: "0.7 GW",
        annualMoneySaved: 3200000,
        annualElectricitySaved: 520000,
        annualSolarEnergyUsage: 620000,
        installations: 98,
        avgEfficiency: "19.8%"
      }
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

      const formatMoney = (amount) => {
        if (amount >= 10000000) {
          return `₹${(amount / 10000000).toFixed(1)} Cr`;
        } else if (amount >= 100000) {
          return `₹${(amount / 100000).toFixed(1)} L`;
        }
        return `₹${amount.toLocaleString()}`;
      };

      const formatEnergy = (energy) => {
        if (energy >= 1000000) {
          return `${(energy / 1000000).toFixed(1)} GWh`;
        } else if (energy >= 1000) {
          return `${(energy / 1000).toFixed(1)} MWh`;
        }
        return `${energy.toLocaleString()} kWh`;
      };

      const popupContent = `
        <div class="p-4" style="min-width: 280px; max-width: 320px;">
          <h4 class="font-semibold text-gray-900" style="margin-bottom: 12px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">${installation.name}</h4>
          
          <div style="margin-bottom: 16px;">
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div style="background: #f3f4f6; padding: 8px; border-radius: 6px;">
                <div style="color: #6b7280; margin-bottom: 2px;">Total Capacity</div>
                <div style="font-weight: 600; color: #1f2937;">${installation.capacity}</div>
              </div>
              <div style="background: #f3f4f6; padding: 8px; border-radius: 6px;">
                <div style="color: #6b7280; margin-bottom: 2px;">Installations</div>
                <div style="font-weight: 600; color: #1f2937;">${installation.installations.toLocaleString()}</div>
              </div>
            </div>
          </div>

          <div style="margin-bottom: 16px;">
            <div style="color: #6b7280; font-size: 11px; margin-bottom: 8px; font-weight: 500;">ANNUAL SAVINGS</div>
            <div style="margin-bottom: 6px;">
              <div style="color: #059669; font-weight: 600; font-size: 13px;">💰 Money Saved: ${formatMoney(installation.annualMoneySaved)}</div>
            </div>
            <div style="margin-bottom: 6px;">
              <div style="color: #0369a1; font-weight: 600; font-size: 13px;">⚡ Electricity Saved: ${formatEnergy(installation.annualElectricitySaved)}</div>
            </div>
            <div style="margin-bottom: 6px;">
              <div style="color: #dc2626; font-weight: 600; font-size: 13px;">☀️ Solar Energy Used: ${formatEnergy(installation.annualSolarEnergyUsage)}</div>
            </div>
            <div>
              <div style="color: #7c3aed; font-weight: 600; font-size: 13px;">📊 Avg Efficiency: ${installation.avgEfficiency}</div>
            </div>
          </div>
          
          <button 
            id="load-data-${index}"
            class="w-full px-3 py-2 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
            style="cursor: pointer; border: none; outline: none; transition: background-color 0.2s;"
          >
            Load Live Weather Data
          </button>
          
          <div id="data-display-${index}" style="margin-top: 12px; display: none;">
            <div style="background: #f9fafb; padding: 10px; border-radius: 6px; border: 1px solid #e5e7eb;">
              <div style="color: #6b7280; font-size: 10px; margin-bottom: 6px; font-weight: 500;">LIVE WEATHER DATA</div>
              <div style="margin: 4px 0; font-size: 11px;"><strong>Weather:</strong> <span id="weather-${index}">Loading...</span></div>
              <div style="margin: 4px 0; font-size: 11px;"><strong>Temperature:</strong> <span id="temp-${index}">Loading...</span></div>
              <div style="margin: 4px 0; font-size: 11px;"><strong>Solar Potential:</strong> <span id="solar-${index}">Loading...</span></div>
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
              
              button.textContent = '✓ Live Data Loaded';
              button.style.backgroundColor = '#10b981';
              
              toast({
                title: "Live Weather Data Loaded",
                description: `Real-time data loaded for ${installation.name}`,
              });
              
            } catch (error) {
              console.error('Error loading data:', error);
              button.textContent = '⚠️ Error - Retry';
              button.style.backgroundColor = '#ef4444';
              button.disabled = false;
              
              toast({
                title: "Error Loading Live Data",
                description: "Failed to load weather data. Please try again.",
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
                <div className="text-2xl font-bold">{nationalStats.totalStates}</div>
                <div className="text-green-100 text-sm">Active States</div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-green-400">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-lg font-bold">{nationalStats.totalMoneySaved}</div>
                  <div className="text-green-100 text-xs">Annual Money Saved</div>
                </div>
                <div>
                  <div className="text-lg font-bold">{nationalStats.totalElectricitySaved}</div>
                  <div className="text-green-100 text-xs">Annual Electricity Saved</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Installation Performance Data */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Installation Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Installations</span>
              <span className="font-semibold text-gray-900">{nationalStats.totalInstallations}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Average Efficiency</span>
              <span className="font-semibold text-gray-900">{nationalStats.avgEfficiency}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">States with Solar</span>
              <span className="font-semibold text-gray-900">{nationalStats.totalStates}/28</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Forecast Production</span>
              <span className="font-semibold text-secondary">{nationalStats.forecastProduction}</span>
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
