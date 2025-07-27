import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { SolarInstallation } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { ExpandIcon, HomeIcon } from "lucide-react";

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

export default function KarnatakaMap({ installations, onInstallationSelect, isLoading }: KarnatakaMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.LayerGroup>(new L.LayerGroup());

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

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !installations.length) return;

    // Clear existing markers
    markersRef.current.clearLayers();

    // Add markers for each installation
    installations.forEach((installation) => {
      const statusColor = installation.status === "active" ? "green" : 
                         installation.status === "maintenance" ? "orange" : "red";
      
      const customIcon = L.divIcon({
        html: `
          <div style="
            background-color: ${statusColor};
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <i class="fas fa-solar-panel" style="color: white; font-size: 8px;"></i>
          </div>
        `,
        className: "custom-div-icon",
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      const marker = L.marker([installation.latitude, installation.longitude], {
        icon: customIcon,
      });

      marker.bindPopup(`
        <div class="p-3 min-w-64">
          <h4 class="font-semibold text-gray-900 mb-2">${installation.location}</h4>
          <p class="text-sm text-gray-600 mb-2">${installation.district}</p>
          <div class="space-y-1 text-xs">
            <div class="flex justify-between">
              <span>Annual Savings:</span>
              <span class="font-medium">₹${installation.annualMoneySaved.toLocaleString()}</span>
            </div>
            <div class="flex justify-between">
              <span>Energy Saved:</span>
              <span class="font-medium">${installation.annualElectricitySaved.toLocaleString()} kWh</span>
            </div>
            <div class="flex justify-between">
              <span>Surface Area:</span>
              <span class="font-medium">${installation.surfaceArea} m²</span>
            </div>
            <div class="flex justify-between">
              <span>Status:</span>
              <span class="font-medium capitalize" style="color: ${statusColor}">${installation.status}</span>
            </div>
          </div>
          <button 
            onclick="window.selectInstallation('${installation.id}')"
            class="mt-2 w-full px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
          >
            View Details
          </button>
        </div>
      `);

      marker.addTo(markersRef.current);
    });

    // Global function for popup button clicks
    (window as any).selectInstallation = (id: string) => {
      const installation = installations.find(inst => inst.id === id);
      if (installation) {
        onInstallationSelect(installation);
      }
    };
  }, [installations, onInstallationSelect]);

  const resetMapView = () => {
    if (mapRef.current) {
      mapRef.current.setView([15.3173, 75.7139], 7);
    }
  };

  const toggleFullscreen = () => {
    if (mapContainerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        mapContainerRef.current.requestFullscreen();
      }
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900">Karnataka Districts Map</h3>
        <p className="text-sm text-gray-600">Click on district markers to view community data</p>
      </div>
      <div className="relative">
        <div ref={mapContainerRef} className="h-96" />
        
        {/* Map Controls */}
        <div className="absolute top-4 right-4 space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={resetMapView}
            className="bg-white hover:bg-gray-50"
          >
            <HomeIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleFullscreen}
            className="bg-white hover:bg-gray-50"
          >
            <ExpandIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="text-sm text-gray-600">Loading district data...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
