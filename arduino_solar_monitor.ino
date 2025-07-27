// Arduino Solar Monitor Code for Karnataka Solar Energy Monitoring System
// This code connects your Arduino to the web application via WebSocket

#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>

// WiFi credentials - UPDATE THESE WITH YOUR NETWORK
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// WebSocket server details - UPDATE WITH YOUR COMPUTER'S IP ADDRESS
const char* websocket_server = "192.168.1.100";  // Replace with your computer's IP
const int websocket_port = 5000;
const char* websocket_path = "/ws";

WebSocketsClient webSocket;

// Sensor pins and variables
const int voltageSensorPin = A0;
const int currentSensorPin = A1;
const int irradianceSensorPin = A2;
const int angleSensorPin = A3;
const int lightSensorPin = A4;

// Your device configuration - UPDATE THESE
const char* deviceId = "MY_ARDUINO_001";
const char* location = "My Solar Installation";
const char* district = "Bengaluru Urban";  // Your district in Karnataka
const float latitude = 12.9716;   // Your GPS coordinates
const float longitude = 77.5946;

void setup() {
  Serial.begin(115200);
  Serial.println("Starting Karnataka Solar Monitor...");
  
  // Initialize WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.println("WiFi connected!");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
  
  // Initialize WebSocket
  webSocket.begin(websocket_server, websocket_port, websocket_path);
  webSocket.onEvent(webSocketEvent);
  webSocket.setReconnectInterval(5000);
  
  Serial.println("WebSocket configured. Attempting connection...");
}

void loop() {
  webSocket.loop();
  
  // Read sensor values (adjust these calculations based on your sensors)
  float voltage = analogRead(voltageSensorPin) * (25.0 / 1023.0);          // 0-25V range
  float current = analogRead(currentSensorPin) * (5.0 / 1023.0);           // 0-5A range
  float irradiance = analogRead(irradianceSensorPin) * (1200.0 / 1023.0);  // 0-1200 W/m²
  float panelAngle = analogRead(angleSensorPin) * (90.0 / 1023.0);         // 0-90 degrees
  float sunlightIntensity = analogRead(lightSensorPin) * (100000.0 / 1023.0); // 0-100k lux
  float power = voltage * current;
  
  // Create JSON message for the web application
  StaticJsonDocument<400> doc;
  doc["type"] = "arduino_data";
  doc["deviceId"] = deviceId;
  doc["location"] = location;
  doc["district"] = district;
  doc["latitude"] = latitude;
  doc["longitude"] = longitude;
  doc["power"] = power;
  doc["voltage"] = voltage;
  doc["current"] = current;
  doc["irradiance"] = irradiance;
  doc["panelAngle"] = panelAngle;
  doc["sunlightIntensity"] = sunlightIntensity;
  doc["temperature"] = 25.0;  // Add temperature sensor reading if available
  
  String message;
  serializeJson(doc, message);
  
  // Send data to web application
  if (webSocket.isConnected()) {
    webSocket.sendTXT(message);
    Serial.println("Data sent: " + message);
  } else {
    Serial.println("WebSocket not connected, attempting reconnection...");
  }
  
  // Send data every 10 seconds
  delay(10000);
}

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
  switch(type) {
    case WStype_DISCONNECTED:
      Serial.println("WebSocket Disconnected");
      break;
      
    case WStype_CONNECTED:
      Serial.printf("WebSocket Connected to: %s\n", payload);
      Serial.println("Your Arduino is now connected to Karnataka Solar Monitor!");
      break;
      
    case WStype_TEXT:
      Serial.printf("Received message: %s\n", payload);
      break;
      
    case WStype_ERROR:
      Serial.println("WebSocket Error occurred");
      break;
      
    default:
      break;
  }
}

// Helper function to print sensor readings to serial monitor
void printSensorReadings() {
  Serial.println("=== Current Sensor Readings ===");
  Serial.println("Voltage: " + String(analogRead(voltageSensorPin) * (25.0 / 1023.0)) + " V");
  Serial.println("Current: " + String(analogRead(currentSensorPin) * (5.0 / 1023.0)) + " A");
  Serial.println("Irradiance: " + String(analogRead(irradianceSensorPin) * (1200.0 / 1023.0)) + " W/m²");
  Serial.println("Panel Angle: " + String(analogRead(angleSensorPin) * (90.0 / 1023.0)) + "°");
  Serial.println("Light Intensity: " + String(analogRead(lightSensorPin) * (100000.0 / 1023.0)) + " lux");
  Serial.println("===============================");
}