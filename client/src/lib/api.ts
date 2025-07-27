import { apiRequest } from "./queryClient";

export interface WeatherData {
  main: {
    temp: number;
    humidity: number;
  };
  weather: Array<{
    main: string;
    description: string;
  }>;
  clouds: {
    all: number;
  };
}

export interface PVGISData {
  outputs: {
    totals: {
      fixed: {
        "E_y": number;
        "H(i)_y": number;
      };
    };
  };
}

export const api = {
  installations: {
    getAll: () => apiRequest("GET", "/api/installations"),
    getByDistrict: (district: string) => apiRequest("GET", `/api/installations/district/${district}`),
    getByState: (state: string) => apiRequest("GET", `/api/installations/state/${state}`),
  },
  
  readings: {
    getLatest: (limit = 10) => apiRequest("GET", `/api/readings/latest?limit=${limit}`),
    getByDevice: (deviceId: string, limit = 10) => apiRequest("GET", `/api/readings/device/${deviceId}?limit=${limit}`),
  },

  external: {
    getPVGISData: async (lat: number, lng: number): Promise<PVGISData> => {
      try {
        const response = await apiRequest("GET", `/api/pvgis/${lat}/${lng}`);
        return response.json();
      } catch (error) {
        console.warn('PVGIS API failed, using fallback data:', error);
        // Return fallback data
        return {
          outputs: {
            totals: {
              fixed: {
                "E_y": 1500,
                "H(i)_y": 1800
              }
            }
          }
        };
      }
    },
    
    getWeatherData: async (lat: number, lng: number): Promise<WeatherData> => {
      try {
        const response = await apiRequest("GET", `/api/weather/${lat}/${lng}`);
        return response.json();
      } catch (error) {
        console.warn('Weather API failed, using fallback data:', error);
        // Return fallback data
        return {
          main: { temp: 25, humidity: 60 },
          weather: [{ main: "Clear", description: "clear sky" }],
          clouds: { all: 10 }
        };
      }
    },
    
    getSolarInsight: async (lat: number, lng: number) => {
      try {
        const response = await apiRequest("GET", `/api/solar-insight/${lat}/${lng}`);
        return response.json();
      } catch (error) {
        console.warn('Solar Insight API failed, using fallback data:', error);
        // Return fallback data
        return {
          solarPotential: {
            yearlyEnergyDcKwh: 1500,
            roofSegmentSummaries: [
              {
                yearlyEnergyDcKwh: 1500,
                segmentIndex: 0
              }
            ]
          }
        };
      }
    },
  },
};
