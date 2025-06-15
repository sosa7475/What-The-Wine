# What the Wine - AI Wine Recommendation Application

## Overview

What the Wine is a full-stack web application that provides personalized wine recommendations powered by OpenAI's GPT-4. The application features an elegant, wine-themed user interface with custom branding (WTW logo) built with React and shadcn/ui components, with a Node.js/Express backend for API services and PostgreSQL database integration using Drizzle ORM.

## System Architecture

The application follows a modern full-stack architecture with clear separation between client and server:

- **Frontend**: React SPA with TypeScript, built using Vite
- **Backend**: Node.js with Express server handling API requests
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **AI Integration**: OpenAI GPT-4 for wine recommendations and bottle analysis
- **UI Framework**: shadcn/ui components with Tailwind CSS for styling
- **State Management**: React Query for server state management

## Key Components

### Frontend Architecture
- **React Router**: Uses Wouter for lightweight client-side routing
- **Component Structure**: 
  - Page components in `client/src/pages/`
  - Reusable UI components in `client/src/components/`
  - shadcn/ui component library in `client/src/components/ui/`
- **Styling**: Tailwind CSS with custom wine-themed color palette (burgundy and cream)
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: React Query with custom API client utilities

### Backend Architecture
- **Express Server**: RESTful API with middleware for logging and error handling
- **Database Layer**: Drizzle ORM with PostgreSQL dialect
- **Storage Abstraction**: Interface-based storage layer supporting both memory and database implementations
- **File Upload**: Multer middleware for handling wine bottle image uploads
- **AI Integration**: OpenAI client for GPT-4 powered recommendations and image analysis

### Database Schema
The application uses four main database tables:
- **users**: User authentication and profile data
- **wines**: Wine catalog with detailed metadata (name, winery, region, ratings, etc.)
- **userWineLibrary**: User's personal wine collection
- **wineRecommendations**: Historical recommendation requests and results

## Data Flow

1. **Wine Recommendations**: Users fill out preference forms → Frontend sends to `/api/recommendations` → Backend calls OpenAI GPT-4 → AI generates wine suggestions → Wines saved to database → Response sent to frontend
2. **Bottle Scanning**: Users upload wine bottle images → Frontend sends to `/api/analyze-bottle` → Backend processes image with OpenAI Vision → Wine details extracted → Results returned to user
3. **Personal Library**: Users can save wines → Frontend calls library APIs → Backend manages user-wine relationships → Data persisted in PostgreSQL

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database driver optimized for serverless environments
- **drizzle-orm**: Type-safe ORM for database operations
- **OpenAI**: AI service integration for recommendations and image analysis
- **@tanstack/react-query**: Server state management and caching
- **react-hook-form**: Form handling with validation
- **@radix-ui/***: Accessible UI component primitives

### UI and Styling
- **tailwindcss**: Utility-first CSS framework
- **shadcn/ui**: Pre-built component library
- **lucide-react**: Icon library
- **class-variance-authority**: Type-safe component variants

## Deployment Strategy

The application is configured for deployment on Replit with the following setup:
- **Development**: `npm run dev` starts both frontend and backend in development mode
- **Build**: `npm run build` creates production builds for both client and server
- **Production**: `npm run start` runs the production server
- **Database**: PostgreSQL module enabled in Replit environment
- **Environment Variables**: Requires `DATABASE_URL` and `OPENAI_API_KEY` configuration

The Vite configuration includes Replit-specific plugins for development tooling and error handling. The server serves static files in production and uses Vite's development server in development mode.

## Changelog

```
Changelog:
- June 14, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```