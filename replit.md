# Karnataka Solar Energy Monitoring System

## Overview

This is a comprehensive solar energy monitoring platform specifically designed for Karnataka state in India. The application provides real-time monitoring of solar installations across various districts through Arduino device integration, interactive maps, and data visualization. It features a modern web interface built with React and TypeScript, backed by a Node.js/Express server with PostgreSQL database integration.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **UI Library**: Shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: TanStack Query for server state management
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESM modules
- **API Pattern**: RESTful API with WebSocket support for real-time updates
- **Middleware**: Express middleware for logging, JSON parsing, and error handling

### Database Architecture
- **Database**: PostgreSQL (configured for Neon Database)
- **ORM**: Drizzle ORM with Drizzle Kit for migrations
- **Schema**: Three main tables - users, solar_installations, and solar_readings
- **Connection**: Serverless connection via @neondatabase/serverless

## Key Components

### Data Models
1. **Solar Installations**: Device metadata, location data, energy metrics, and real-time status
2. **Solar Readings**: Time-series data from Arduino devices including power, voltage, current, and irradiance
3. **Users**: Basic authentication system (currently minimal implementation)

### Interactive Maps
- **Karnataka Map**: Focused view of Karnataka state with installation markers
- **India Map**: National view with major solar installations and external API integrations
- **Map Technology**: Leaflet.js for interactive mapping

### Real-time Features
- **WebSocket Integration**: Live data updates from Arduino devices
- **Device Status Monitoring**: Online/offline status tracking
- **Data Streaming**: Real-time solar readings display

### External Integrations
- **PVGIS API**: Solar irradiance and photovoltaic potential data
- **Weather API**: Current weather conditions affecting solar performance
- **Google Solar API**: Additional solar potential analysis

## Data Flow

1. **Arduino Devices** → WebSocket Server → Database (real-time readings)
2. **Database** → REST API → React Frontend (historical data and installations)
3. **External APIs** → Backend Proxy → Frontend (weather and solar potential data)
4. **WebSocket Server** → Frontend (live updates and notifications)

### Storage Strategy
- **Development**: In-memory storage with sample data initialization
- **Production**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Migrations**: Automated schema management through Drizzle Kit

## External Dependencies

### Core Dependencies
- **@tanstack/react-query**: Server state management and caching
- **drizzle-orm & drizzle-zod**: Database ORM with type validation
- **axios**: HTTP client for external API calls
- **leaflet**: Interactive mapping library
- **ws**: WebSocket implementation for real-time communication

### UI Dependencies
- **@radix-ui/***: Headless UI components for accessibility
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **wouter**: Lightweight routing

### Development Dependencies
- **vite**: Fast build tool and dev server
- **typescript**: Type safety and developer experience
- **esbuild**: Production bundling for server code

## Deployment Strategy

### Development Environment
- **Dev Server**: Vite dev server with hot module replacement
- **API Server**: Express server with auto-restart via tsx
- **Database**: Local or cloud PostgreSQL instance
- **WebSocket**: Integrated with Express server

### Production Build
1. **Frontend**: Vite builds optimized React bundle to `dist/public`
2. **Backend**: esbuild bundles Express server to `dist/index.js`
3. **Static Serving**: Express serves built frontend in production
4. **Database**: Uses environment variable `DATABASE_URL` for connection

### Environment Configuration
- **NODE_ENV**: Controls development vs production behavior
- **DATABASE_URL**: PostgreSQL connection string (required)
- **Replit Integration**: Special handling for Replit environment with banner injection

### Scalability Considerations
- **Serverless Ready**: Uses serverless PostgreSQL connection
- **Stateless Backend**: No server-side sessions, WebSocket state is ephemeral
- **CDN Ready**: Static assets can be served from CDN
- **Horizontal Scaling**: RESTful API design supports load balancing

The application is designed for monitoring solar energy systems across Karnataka with a focus on community-based energy tracking, district-wise analysis, and real-time Arduino device integration. The architecture supports both development and production environments with clear separation of concerns and modern web development practices.