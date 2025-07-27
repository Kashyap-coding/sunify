import { SolarInstallation } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Circle, Wifi, WifiOff, Activity } from "lucide-react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface ArduinoStatusProps {
  installations: SolarInstallation[];
  onRefresh: () => void;
}

export default function ArduinoStatus({ installations, onRefresh }: ArduinoStatusProps) {
  const { isConnected, lastMessage } = useWebSocket();
  const { toast } = useToast();

  useEffect(() => {
    if (lastMessage?.type === 'solar_data_update') {
      toast({
        title: "Device Update",
        description: `New data received from ${lastMessage.data.deviceId}`,
      });
      onRefresh(); // Refresh the installations data
    }
  }, [lastMessage, toast, onRefresh]);

  const connectedDevices = installations.filter(inst => inst.isOnline).length;
  
  const scanDevices = () => {
    toast({
      title: "Scanning for Devices",
      description: "Looking for new Arduino devices on the network...",
    });
    // In a real implementation, this would trigger a network scan
    setTimeout(() => {
      toast({
        title: "Scan Complete",
        description: `Found ${connectedDevices} connected devices`,
      });
    }, 2000);
  };

  const getDeviceSignalStrength = (isOnline: boolean, lastUpdate: Date | null) => {
    if (!isOnline) return "Offline";
    
    const now = new Date();
    const lastUpdateTime = lastUpdate ? new Date(lastUpdate) : now;
    const minutesAgo = Math.floor((now.getTime() - lastUpdateTime.getTime()) / (1000 * 60));
    
    if (minutesAgo < 5) return "Strong";
    if (minutesAgo < 15) return "Good";  
    if (minutesAgo < 30) return "Weak";
    return "Poor";
  };

  const getLastUpdateText = (lastUpdate: Date | null) => {
    if (!lastUpdate) return "Never";
    
    const now = new Date();
    const updateTime = new Date(lastUpdate);
    const minutesAgo = Math.floor((now.getTime() - updateTime.getTime()) / (1000 * 60));
    
    if (minutesAgo < 1) return "Just now";
    if (minutesAgo < 60) return `${minutesAgo} min ago`;
    
    const hoursAgo = Math.floor(minutesAgo / 60);
    if (hoursAgo < 24) return `${hoursAgo} hr ago`;
    
    const daysAgo = Math.floor(hoursAgo / 24);
    return `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Arduino Device Management</CardTitle>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm text-gray-600">
                WebSocket: <span className={`font-semibold ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </span>
            </div>
            <span className="text-sm text-gray-600">
              Connected Devices: <span className="font-semibold text-primary">{connectedDevices}</span>
            </span>
            <Button onClick={scanDevices} size="sm">
              <Search className="h-4 w-4 mr-2" />
              Scan for Devices
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {installations.map((installation) => {
            const signalStrength = getDeviceSignalStrength(installation.isOnline || false, installation.lastUpdate);
            const lastUpdateText = getLastUpdateText(installation.lastUpdate);
            
            return (
              <Card key={installation.id} className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{installation.deviceId}</h4>
                    <Badge
                      variant={installation.isOnline ? "default" : "secondary"}
                      className={
                        installation.isOnline 
                          ? "bg-green-100 text-green-800 hover:bg-green-100" 
                          : "bg-red-100 text-red-800 hover:bg-red-100"
                      }
                    >
                      <Circle className={`w-3 h-3 mr-1 fill-current ${installation.isOnline ? 'text-green-400' : 'text-red-400'}`} />
                      {installation.isOnline ? 'Online' : 'Offline'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-medium truncate ml-2">{installation.district}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Update:</span>
                      <span className="font-medium">{lastUpdateText}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Signal:</span>
                      <span className={`font-medium ${
                        signalStrength === 'Strong' ? 'text-green-600' :
                        signalStrength === 'Good' ? 'text-blue-600' :
                        signalStrength === 'Weak' ? 'text-yellow-600' :
                        signalStrength === 'Poor' ? 'text-orange-600' :
                        'text-red-600'
                      }`}>
                        {signalStrength}
                      </span>
                    </div>
                    
                    {installation.isOnline && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Power:</span>
                          <span className="font-medium font-mono">{installation.currentPower?.toFixed(1)} W</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Voltage:</span>
                          <span className="font-medium font-mono">{installation.voltage?.toFixed(1)} V</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Current:</span>
                          <span className="font-medium font-mono">{installation.current?.toFixed(2)} A</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Irradiance:</span>
                          <span className="font-medium font-mono">{installation.irradiance} W/m²</span>
                        </div>
                      </>
                    )}
                  </div>
                  
                  {installation.isOnline && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Activity className="h-3 w-3" />
                        <span>Real-time monitoring active</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {installations.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No Arduino devices found. Click "Scan for Devices" to search for connected devices.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
