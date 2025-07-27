import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { CloudSun, MapPin, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import KarnatakaMap from "@/components/KarnatakaMap";
import IndiaMap from "@/components/IndiaMap";
import SolarDataTable from "@/components/SolarDataTable";
import ArduinoStatus from "@/components/ArduinoStatus";
import { SolarInstallation } from "@shared/schema";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"karnataka" | "india">("karnataka");
  const [selectedInstallation, setSelectedInstallation] = useState<SolarInstallation | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const {
    data: installations = [],
    isLoading,
    refetch,
  } = useQuery<SolarInstallation[]>({
    queryKey: ["/api/installations"],
  });

  const karnatakaStats = {
    totalInstallations: installations.length,
    activeDistricts: new Set(installations.map(inst => inst.district)).size,
    totalEnergySaved: installations.reduce((sum, inst) => sum + inst.annualElectricitySaved, 0),
    totalMoneySaved: installations.reduce((sum, inst) => sum + inst.annualMoneySaved, 0),
    activeDevices: installations.filter(inst => inst.isOnline).length,
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata'
    }) + ' IST';
  };

  const formatLargeNumber = (num: number, unit: string) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)} M${unit}`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)} K${unit}`;
    }
    return `${num.toLocaleString()} ${unit}`;
  };

  const formatMoney = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)} Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)} L`;
    }
    return `₹${amount.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <CloudSun className="h-8 w-8 text-accent" />
                <h1 className="text-xl font-bold text-gray-900">Karnataka Solar Monitor</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-secondary rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Arduino Connected</span>
              </div>
              <div className="text-sm text-gray-500">
                <span>{formatTime(currentTime)}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              <Button
                variant={activeTab === "karnataka" ? "default" : "ghost"}
                onClick={() => setActiveTab("karnataka")}
                className="px-6 py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Karnataka Districts
              </Button>
              <Button
                variant={activeTab === "india" ? "default" : "ghost"}
                onClick={() => setActiveTab("india")}
                className="px-6 py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
              >
                <Activity className="h-4 w-4 mr-2" />
                India Overview
              </Button>
            </nav>
          </div>

          {/* Karnataka Tab */}
          {activeTab === "karnataka" && (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Map Section */}
                <div className="lg:col-span-2">
                  <KarnatakaMap
                    installations={installations}
                    onInstallationSelect={setSelectedInstallation}
                    isLoading={isLoading}
                  />

                  {/* Navigation Breadcrumb */}
                  <div className="mt-4 flex items-center space-x-2 text-sm">
                    <span className="text-gray-500">Navigation:</span>
                    <span className="text-gray-700">Karnataka</span>
                    <span className="text-gray-400">›</span>
                    <span className="text-primary font-medium">
                      {selectedInstallation ? selectedInstallation.district : "Select District"}
                    </span>
                  </div>
                </div>

                {/* Data Panel */}
                <div className="space-y-6">
                  {/* Current Selection Info */}
                  <Card className="bg-gradient-to-r from-primary to-blue-600 text-white">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-lg">Selected Location</h4>
                      <p className="text-blue-100">
                        {selectedInstallation ? 
                          `${selectedInstallation.district} - ${selectedInstallation.location}` : 
                          "Click on a district marker"
                        }
                      </p>
                      <div className="mt-2 text-sm text-blue-200">
                        <span>{karnatakaStats.activeDevices}</span> active devices
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Stats */}
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Karnataka Overview</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Total Installations</span>
                          <span className="font-semibold text-gray-900">{karnatakaStats.totalInstallations.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Active Districts</span>
                          <span className="font-semibold text-gray-900">{karnatakaStats.activeDistricts}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Total Energy Saved</span>
                          <span className="font-semibold text-secondary">
                            {formatLargeNumber(karnatakaStats.totalEnergySaved, 'Wh')}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Money Saved (Annual)</span>
                          <span className="font-semibold text-accent">
                            {formatMoney(karnatakaStats.totalMoneySaved)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Device Updates */}
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Recent Updates</h4>
                      <div className="space-y-2">
                        {installations
                          .filter(inst => inst.isOnline)
                          .slice(0, 3)
                          .map((installation) => (
                            <div key={installation.id} className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50">
                              <div className="w-2 h-2 bg-secondary rounded-full"></div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-900 truncate">
                                  {installation.district} - {installation.location}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {installation.lastUpdate ? 
                                    new Date(installation.lastUpdate).toLocaleTimeString() : 
                                    'No recent updates'
                                  }
                                </p>
                              </div>
                            </div>
                          ))
                        }
                        {installations.filter(inst => inst.isOnline).length === 0 && (
                          <p className="text-sm text-gray-500 text-center py-4">No recent updates</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Data Table */}
              <div className="mt-6">
                <SolarDataTable
                  installations={installations}
                  onRefresh={() => refetch()}
                  isLoading={isLoading}
                />
              </div>
            </div>
          )}

          {/* India Tab */}
          {activeTab === "india" && (
            <div className="p-6">
              <IndiaMap isVisible={activeTab === "india"} />
            </div>
          )}
        </div>
      </div>

      {/* Arduino Status */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <ArduinoStatus
          installations={installations}
          onRefresh={() => refetch()}
        />
      </div>
    </div>
  );
}
