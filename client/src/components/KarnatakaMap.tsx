import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { SolarInstallation } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, TrendingUp, Zap, Satellite, Globe, CloudSun } from "lucide-react";
import { calculateAnnualSavings } from "@shared/indiaStates";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

// Fix for Leaflet default markers in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface KarnatakaMapProps {
  installations: SolarInstallation[];
  onInstallationSelect: (installation: SolarInstallation) => void;
  isLoading: boolean;
}

interface KarnatakaData {
  weatherData?: any;
  pvgisData?: any;
  solarInsight?: any;
  savings?: ReturnType<typeof calculateAnnualSavings>;
  isLoading: boolean;
}

// Karnataka state coordinates and data
const KARNATAKA_STATE = {
  name: "Karnataka",
  capital: "Bengaluru", 
  latitude: 15.3173,
  longitude: 75.7139,
  averageSolarIrradiance: 5.2,
  estimatedCapacity: 8800,
  populationDensity: 319,
  solarPotential: 'High' as const
};

export default function KarnatakaMap({ installations, onInstallationSelect, isLoading }: KarnatakaMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.LayerGroup>(new L.LayerGroup());
  const [karnatakaData, setKarnatakaData] = useState<KarnatakaData>({
    savings: calculateAnnualSavings(KARNATAKA_STATE.averageSolarIrradiance),
    isLoading: false
  });
  const [showPVGIS, setShowPVGIS] = useState(true);
  const [showGoogleSolar, setShowGoogleSolar] = useState(true);
  const [showWeather, setShowWeather] = useState(true);
  const [isLoadingApis, setIsLoadingApis] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map centered on Karnataka
    mapRef.current = L.map(mapContainerRef.current).setView([15.3173, 75.7139], 7);

    // Add tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© OpenStreetMap contributors',
    }).addTo(mapRef.current);

    // Add markers layer group
    markersRef.current.addTo(mapRef.current);

    // Add Karnataka state marker
    const stateIcon = L.divIcon({
      html: `
        <div style="
          background-color: #10B981;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 4px solid white;
          box-shadow: 0 3px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        ">
          <i class="fas fa-solar-panel" style="color: white; font-size: 14px;"></i>
        </div>
      `,
      className: "custom-div-icon",
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const stateMarker = L.marker([KARNATAKA_STATE.latitude, KARNATAKA_STATE.longitude], {
      icon: stateIcon,
    });

    stateMarker.bindPopup(`
      <div class="p-4 min-w-72">
        <h4 class="font-semibold text-gray-900 mb-2 text-lg">${KARNATAKA_STATE.name} State</h4>
        <p class="text-sm text-gray-600 mb-3">Capital: ${KARNATAKA_STATE.capital}</p>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span>Solar Potential:</span>
            <span class="font-medium text-green-600">${KARNATAKA_STATE.solarPotential}</span>
          </div>
          <div class="flex justify-between">
            <span>Avg. Irradiance:</span>
            <span class="font-medium">${KARNATAKA_STATE.averageSolarIrradiance} kWh/m²/day</span>
          </div>
          <div class="flex justify-between">
            <span>Estimated Capacity:</span>
            <span class="font-medium">${KARNATAKA_STATE.estimatedCapacity.toLocaleString()} MW</span>
          </div>
          <div class="flex justify-between">
            <span>Population Density:</span>
            <span class="font-medium">${KARNATAKA_STATE.populationDensity}/km²</span>
          </div>
        </div>
        <button 
          onclick="window.loadKarnatakaData()"
          class="mt-4 w-full px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 font-medium"
        >
          Load Detailed Analytics
        </button>
      </div>
    `);

    stateMarker.addTo(markersRef.current);

    // Global function for loading Karnataka data
    (window as any).loadKarnatakaData = async () => {
      setIsLoadingApis(true);
      
      setKarnatakaData(prev => ({ ...prev, isLoading: true }));

      try {
        const [pvgisData, weatherData, solarInsight] = await Promise.allSettled([
          showPVGIS ? api.external.getPVGISData(KARNATAKA_STATE.latitude, KARNATAKA_STATE.longitude) : Promise.resolve(null),
          showWeather ? api.external.getWeatherData(KARNATAKA_STATE.latitude, KARNATAKA_STATE.longitude) : Promise.resolve(null),
          showGoogleSolar ? api.external.getSolarInsight(KARNATAKA_STATE.latitude, KARNATAKA_STATE.longitude) : Promise.resolve(null)
        ]);

        setKarnatakaData(prev => ({
          ...prev,
          weatherData: weatherData.status === 'fulfilled' ? weatherData.value : null,
          pvgisData: pvgisData.status === 'fulfilled' ? pvgisData.value : null,
          solarInsight: solarInsight.status === 'fulfilled' ? solarInsight.value : null,
          isLoading: false
        }));

        toast({
          title: "Karnataka Data Loaded",
          description: "Loaded comprehensive solar data for Karnataka state",
        });
        
      } catch (error) {
        toast({
          title: "Error Loading Data",
          description: "Failed to load some data for Karnataka",
          variant: "destructive",
        });
      } finally {
        setIsLoadingApis(false);
      }
    };

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [showPVGIS, showWeather, showGoogleSolar, toast]);

  // Add Arduino device markers if any installations exist
  useEffect(() => {
    if (!mapRef.current) return;

    // Add Arduino device markers for connected devices
    installations.forEach((installation) => {
      const statusColor = installation.status === "active" ? "#10B981" : 
                         installation.status === "maintenance" ? "#F59E0B" : "#EF4444";
      
      const deviceIcon = L.divIcon({
        html: `
          <div style="
            background-color: ${statusColor};
            width: 18px;
            height: 18px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
          ">
            <div style="
              width: 6px;
              height: 6px;
              background-color: white;
              border-radius: 50%;
            "></div>
            ${installation.isOnline ? `
              <div style="
                position: absolute;
                top: -2px;
                right: -2px;
                width: 6px;
                height: 6px;
                background-color: #22C55E;
                border-radius: 50%;
                border: 1px solid white;
              "></div>
            ` : ''}
          </div>
        `,
        className: "custom-div-icon",
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });

      const marker = L.marker([installation.latitude, installation.longitude], {
        icon: deviceIcon,
      });

      marker.bindPopup(`
        <div class="p-3">
          <h4 class="font-semibold text-gray-900">Arduino Device</h4>
          <p class="text-sm text-gray-600">Location: ${installation.location}</p>
          <p class="text-sm text-gray-600">Status: ${installation.status}</p>
          <p class="text-sm text-gray-600">Power: ${installation.currentPower || 0}W</p>
          <p class="text-sm text-gray-600">Irradiance: ${installation.irradiance || 0} W/m²</p>
          <p class="text-sm ${installation.isOnline ? 'text-green-600' : 'text-red-600'}">
            ${installation.isOnline ? '🟢 Online' : '🔴 Offline'}
          </p>
        </div>
      `);

      marker.on("click", () => {
        onInstallationSelect(installation);
      });

      marker.addTo(markersRef.current);
    });
  }, [installations, onInstallationSelect]);

  const togglePVGIS = () => setShowPVGIS(!showPVGIS);
  const toggleGoogleSolar = () => setShowGoogleSolar(!showGoogleSolar);
  const toggleWeather = () => setShowWeather(!showWeather);

  const formatMoney = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} L`;
    return `₹${amount.toLocaleString()}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Karnataka Map Section */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Karnataka Solar Map</h3>
                <p className="text-sm text-gray-600">State-level solar monitoring and analytics</p>
              </div>
              {isLoadingApis && (
                <Badge variant="secondary" className="animate-pulse">
                  Loading APIs...
                </Badge>
              )}
            </div>
          </div>
          <div className="relative">
            <div ref={mapContainerRef} className="h-96" />
            
            {/* API Status Indicators */}
            <div className="absolute top-4 left-4 space-y-2">
              <div className={`bg-white px-3 py-1 rounded-full shadow-md border border-gray-200 flex items-center space-x-2 ${showPVGIS ? 'opacity-100' : 'opacity-50'}`}>
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-xs text-gray-600">PVGIS</span>
              </div>
              <div className={`bg-white px-3 py-1 rounded-full shadow-md border border-gray-200 flex items-center space-x-2 ${showGoogleSolar ? 'opacity-100' : 'opacity-50'}`}>
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-xs text-gray-600">Google Solar</span>
              </div>
              <div className={`bg-white px-3 py-1 rounded-full shadow-md border border-gray-200 flex items-center space-x-2 ${showWeather ? 'opacity-100' : 'opacity-50'}`}>
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-xs text-gray-600">Weather</span>
              </div>
            </div>

            {/* Arduino Device Counter */}
            {installations.length > 0 && (
              <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-md border border-gray-200">
                <div className="text-xs font-medium text-gray-900 mb-1">Connected Devices</div>
                <div className="text-lg font-bold text-green-600">{installations.length}</div>
                <div className="text-xs text-gray-600">Arduino sensors</div>
              </div>
            )}
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

      {/* Analytics Sidebar */}
      <div className="space-y-6">
        {/* Karnataka State Overview */}
        <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <CardTitle className="text-lg">{KARNATAKA_STATE.name}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-green-100">Capital:</span>
                <span className="font-medium">{KARNATAKA_STATE.capital}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-100">Solar Potential:</span>
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {KARNATAKA_STATE.solarPotential}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-green-100">Avg. Irradiance:</span>
                <span className="font-medium">{KARNATAKA_STATE.averageSolarIrradiance} kWh/m²/day</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-100">Est. Capacity:</span>
                <span className="font-medium">{KARNATAKA_STATE.estimatedCapacity.toLocaleString()} MW</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Savings Calculator */}
        {karnatakaData.savings && (
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <CardTitle className="text-base">Annual Savings (5kW System)</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Energy Generation</span>
                <span className="font-semibold text-gray-900">{karnatakaData.savings.annualEnergyGeneration.toLocaleString()} kWh</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Money Saved</span>
                <span className="font-semibold text-green-600">{formatMoney(karnatakaData.savings.annualMoneySaved)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Payback Period</span>
                <span className="font-semibold text-gray-900">{karnatakaData.savings.paybackPeriod} years</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">25-Year Savings</span>
                <span className="font-semibold text-blue-600">{formatMoney(karnatakaData.savings.lifetimeSavings)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">CO₂ Reduction</span>
                <span className="font-semibold text-green-600">{karnatakaData.savings.co2Reduction.toLocaleString()} kg/year</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Weather Data */}
        {karnatakaData.weatherData && (
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <CloudSun className="h-4 w-4 text-blue-600" />
                <CardTitle className="text-base">Current Weather Impact</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Temperature</span>
                <span className="font-semibold text-gray-900">{karnatakaData.weatherData.main?.temp?.toFixed(1)}°C</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Cloud Cover</span>
                <span className="font-semibold text-gray-900">{karnatakaData.weatherData.clouds?.all}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Humidity</span>
                <span className="font-semibold text-gray-900">{karnatakaData.weatherData.main?.humidity}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Conditions</span>
                <span className="font-semibold text-gray-900 capitalize">{karnatakaData.weatherData.weather?.[0]?.description}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* PVGIS Data */}
        {karnatakaData.pvgisData && (
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Satellite className="h-4 w-4 text-purple-600" />
                <CardTitle className="text-base">PVGIS Solar Analysis</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Annual PV Output</span>
                <span className="font-semibold text-gray-900">
                  {karnatakaData.pvgisData.outputs?.totals?.fixed?.["E_y"]?.toFixed(0)} kWh/kWp
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Global Irradiation</span>
                <span className="font-semibold text-gray-900">
                  {karnatakaData.pvgisData.outputs?.totals?.fixed?.["H(i)_y"]?.toFixed(1)} kWh/m²
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Arduino Device Status */}
        {installations.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-yellow-600" />
                <CardTitle className="text-base">Connected Arduino Devices</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Devices</span>
                <span className="font-semibold text-gray-900">{installations.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Online</span>
                <span className="font-semibold text-green-600">
                  {installations.filter(i => i.isOnline).length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active</span>
                <span className="font-semibold text-blue-600">
                  {installations.filter(i => i.status === 'active').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Power</span>
                <span className="font-semibold text-gray-900">
                  {installations.reduce((sum, i) => sum + (i.currentPower || 0), 0).toFixed(1)}W
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}