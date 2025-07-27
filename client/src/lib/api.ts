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
      const response = await apiRequest("GET", `/api/pvgis/${lat}/${lng}`);
      return response.json();
    },
    
    getWeatherData: async (lat: number, lng: number): Promise<WeatherData> => {
      const response = await apiRequest("GET", `/api/weather/${lat}/${lng}`);
      return response.json();
    },
    
    getSolarInsight: async (lat: number, lng: number) => {
      const response = await apiRequest("GET", `/api/solar-insight/${lat}/${lng}`);
      return response.json();
    },
  },
};
