import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code, Wifi, AlertCircle, CheckCircle } from "lucide-react";
import { useWebSocket } from "@/hooks/useWebSocket";

export default function ArduinoConnectionGuide() {
  const { isConnected } = useWebSocket();

  const arduinoCode = `// Arduino Solar Monitor Code
#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>

// WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// WebSocket server details
const char* websocket_server = "YOUR_SERVER_IP";
const int websocket_port = 5000;
const char* websocket_path = "/ws";

WebSocketsClient webSocket;

// Sensor pins and variables
const int voltageSensorPin = A0;
const int currentSensorPin = A1;
const int irradianceSensorPin = A2;
const int angleSensorPin = A3;
const int lightSensorPin = A4;

void setup() {
  Serial.begin(115200);
  
  // Initialize WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("WiFi connected");
  
  // Initialize WebSocket
  webSocket.begin(websocket_server, websocket_port, websocket_path);
  webSocket.onEvent(webSocketEvent);
  webSocket.setReconnectInterval(5000);
}

void loop() {
  webSocket.loop();
  
  // Read sensor values
  float voltage = analogRead(voltageSensorPin) * (25.0 / 1023.0);
  float current = analogRead(currentSensorPin) * (5.0 / 1023.0);
  float irradiance = analogRead(irradianceSensorPin) * (1200.0 / 1023.0);
  float panelAngle = analogRead(angleSensorPin) * (90.0 / 1023.0);
  float sunlightIntensity = analogRead(lightSensorPin) * (100000.0 / 1023.0);
  float power = voltage * current;
  
  // Create JSON message
  StaticJsonDocument<300> doc;
  doc["type"] = "arduino_data";
  doc["deviceId"] = "YOUR_DEVICE_ID";
  doc["location"] = "Your Location Name";
  doc["district"] = "Your District";
  doc["latitude"] = 12.9716;  // Your GPS coordinates
  doc["longitude"] = 77.5946;
  doc["power"] = power;
  doc["voltage"] = voltage;
  doc["current"] = current;
  doc["irradiance"] = irradiance;
  doc["panelAngle"] = panelAngle;
  doc["sunlightIntensity"] = sunlightIntensity;
  doc["temperature"] = 25.0;  // Add temperature sensor if available
  
  String message;
  serializeJson(doc, message);
  
  // Send data every 10 seconds
  webSocket.sendTXT(message);
  delay(10000);
}

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
  switch(type) {
    case WStype_DISCONNECTED:
      Serial.println("WebSocket Disconnected");
      break;
    case WStype_CONNECTED:
      Serial.println("WebSocket Connected");
      break;
    case WStype_TEXT:
      Serial.printf("Received: %s\\n", payload);
      break;
  }
}`;

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Arduino Connection Guide</CardTitle>
          <Badge 
            variant={isConnected ? "default" : "secondary"}
            className={isConnected ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
          >
            {isConnected ? (
              <>
                <CheckCircle className="w-3 h-3 mr-1" />
                WebSocket Ready
              </>
            ) : (
              <>
                <AlertCircle className="w-3 h-3 mr-1" />
                Waiting for Connection
              </>
            )}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Connection Steps */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Connection Steps:</h4>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-medium">1</div>
              <div>
                <p className="text-sm font-medium text-gray-900">Install Required Libraries</p>
                <p className="text-xs text-gray-600">WebSocketsClient, ArduinoJson, WiFi</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-medium">2</div>
              <div>
                <p className="text-sm font-medium text-gray-900">Configure Your WiFi</p>
                <p className="text-xs text-gray-600">Update SSID and password in the code</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-medium">3</div>
              <div>
                <p className="text-sm font-medium text-gray-900">Set Server Address</p>
                <p className="text-xs text-gray-600">Use your computer's IP address for websocket_server</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-medium">4</div>
              <div>
                <p className="text-sm font-medium text-gray-900">Connect Sensors</p>
                <p className="text-xs text-gray-600">Voltage, current, irradiance, angle, and light sensors</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-medium">5</div>
              <div>
                <p className="text-sm font-medium text-gray-900">Upload Code</p>
                <p className="text-xs text-gray-600">Flash the Arduino code and monitor serial output</p>
              </div>
            </div>
          </div>
        </div>

        {/* Required Sensors */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Required Sensors:</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Voltage Sensor:</span>
              <span className="font-medium">Pin A0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Current Sensor:</span>
              <span className="font-medium">Pin A1</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Irradiance Sensor:</span>
              <span className="font-medium">Pin A2</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Angle Sensor:</span>
              <span className="font-medium">Pin A3</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Light Sensor:</span>
              <span className="font-medium">Pin A4</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Temperature (optional):</span>
              <span className="font-medium">Digital Pin</span>
            </div>
          </div>
        </div>

        {/* Arduino Code */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <Code className="h-4 w-4 text-gray-600" />
            <h4 className="font-medium text-gray-900">Arduino Code Template:</h4>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
            <pre className="text-green-400 text-xs font-mono whitespace-pre-wrap">
              {arduinoCode}
            </pre>
          </div>
        </div>

        {/* Network Info */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Wifi className="h-4 w-4 text-blue-600" />
            <h4 className="font-medium text-blue-900">Network Information:</h4>
          </div>
          <div className="text-sm text-blue-800 space-y-1">
            <p>WebSocket URL: <code className="bg-blue-100 px-1 rounded">ws://YOUR_IP:5000/ws</code></p>
            <p>Make sure your Arduino and computer are on the same WiFi network</p>
            <p>Check firewall settings if connection fails</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}