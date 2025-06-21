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
- June 21, 2025. Updated main header banner text to "Want to Impress Your Guests with the Perfect Wine—Every Time?" for improved guest-focused messaging
- June 21, 2025. Fixed mobile font sizing for header banner with responsive typography (text-3xl on mobile, scaling up to text-6xl on desktop) and improved line spacing
- June 21, 2025. Added relatable story section below banner featuring emotional journey from dinner planning to wine selection hesitation, positioning app as personal wine stylist solution
- June 21, 2025. Updated banner subheading to "Discover the Secret Sophisticated Women Use to Pair the Right Bottle with Every Dish & Occasion" for improved targeting and exclusivity messaging
- June 21, 2025. Made language gender-neutral throughout landing page by replacing "women" with "hosts" and "woman" with "host" to be inclusive for all users
- June 21, 2025. Changed wine recommendations section title from "AI Wine Recommendations" to "How It Works" for clearer user guidance
- June 21, 2025. Updated wine scanner description copy to emphasize instant insights with "Snap a photo of any wine bottle and get instant insights—flavor notes, perfect food pairings, and when to serve it"
- June 21, 2025. Updated wine library section with new heading "Your Personal Wine Library" and enhanced copy emphasizing tracking loved wines, bringing/pouring/gifting confidence, and signature wine list curation
- June 21, 2025. Replaced "Why Choose What the Wine" section with "Confident Recommendations, Powered by AI" featuring enhanced copy about smart wine assistant, point-shoot-impress scanning, and saving favorite wines for memorable occasions
- June 21, 2025. Updated first feature card to "Why Choose What The Wine?" emphasizing not needing to be a wine expert to serve like one, focusing on removing guesswork for effortless elegance
- June 21, 2025. Switched content between main section and first feature card: section header now shows "Why Choose What The Wine?" while first card shows "Confident Recommendations, Powered by AI"
- June 21, 2025. Moved tagline "From casual brunch to elegant dinner, we've got your bottle" from section header to underneath first feature card content
- June 16, 2025. Added Google Analytics gtag.js (G-QQV6YL3FJ7) alongside Google Tag Manager for comprehensive tracking
- June 16, 2025. Installed Google Tag Manager (GTM-PDCNGPD9) for tracking page views and user interactions
- June 16, 2025. Added custom dessert wine image to wine recommendation display system
- June 16, 2025. Fixed wine image system to use curated project images instead of unreliable external URLs preventing random images like speakers
- June 16, 2025. Fixed mobile responsiveness for price indicators in community recommendations and dashboard upgrade button layouts
- June 16, 2025. Removed premium subscription banner from main dashboard, only showing upgrade banner for free tier users
- June 16, 2025. Added subscription reactivation functionality with backend API and frontend buttons
- June 16, 2025. Removed redundant subscription details section and streamlined Account tab layout
- June 16, 2025. Added clean subscription status banner to Account tab showing key billing information
- June 16, 2025. Moved subscription management interface from main dashboard to Account tab for less prominent access
- June 16, 2025. Fixed subscription cancellation date conversion errors causing API failures
- June 16, 2025. Updated subscription details to use proper Stripe billing cycle data instead of undefined fields
- June 15, 2025. Enhanced header navigation to redirect users to home page when clicking logo or navigation items from support pages
- June 15, 2025. Finalized support page navigation with consistent headers, back buttons, and footers across all pages
- June 15, 2025. Removed phone contact option from Contact Us page, maintaining email-only support (support@whatthewine.com)
- June 15, 2025. Added complete navigation infrastructure to Help Center, Contact Us, Privacy Policy, and Terms of Service
- June 15, 2025. Created comprehensive support page system with Help Center, Contact Us, Privacy Policy, and Terms of Service
- June 15, 2025. Added professional FAQ sections covering all app features and premium subscription details
- June 15, 2025. Implemented contact form with subject categorization and success confirmation workflow
- June 15, 2025. Added complete legal documentation with privacy protection details and terms compliance
- June 15, 2025. Updated footer navigation to link to all new support pages for better user accessibility
- June 15, 2025. Fixed "Get Started" button visibility issue by adding transparent background for white text contrast
- June 15, 2025. Changed subscription pricing from $6.95 to $3.99 across all displays and Stripe functionality
- June 15, 2025. Updated wine image system to use custom uploaded wine type images (red, white, rosé, sparkling)
- June 15, 2025. Enhanced wine bottle scanner to automatically save scanned wines to user's library for authenticated users
- June 15, 2025. Fixed password field input issue in authentication dialog using direct React Hook Form registration
- June 15, 2025. Increased free recommendation limit from 3 to 5 recommendations before requiring premium upgrade
- June 15, 2025. Fixed "Get Recommendations" button to properly switch dashboard tabs instead of scrolling
- June 15, 2025. Fixed wine image system to display proper wine bottles and glasses matching wine type/color instead of random images
- June 15, 2025. Updated wine image generation with curated, wine-specific photos for red, white, rosé, and sparkling wines
- June 15, 2025. Enhanced wine cards with professional wine bottle imagery and consistent image mapping
- June 15, 2025. Fixed critical review posting authentication errors by correcting userId handling in all community routes
- June 15, 2025. Resolved write review button crash with proper TypeScript array type safety validation
- June 15, 2025. Updated Zod schemas to properly omit userId fields from request validation while adding them on backend
- June 15, 2025. Implemented comprehensive wine community features including reviews, recommendations, and commenting system
- June 15, 2025. Added Community tab to dashboard with wine review and recommendation creation forms
- June 15, 2025. Created complete backend API for community features with proper authentication and data validation
- June 15, 2025. Removed promotional banner from home page, kept discount pricing only in payment dialogs and upgrade prompts
- June 15, 2025. Made Usage Stats section collapsible in dashboard with chevron toggle and smooth animations
- June 15, 2025. Added promotional pricing: $9.99 crossed out, $6.95 sale price with "Limited Time Offer" messaging
- June 15, 2025. Removed Replit Auth option, keeping only email/password authentication
- June 15, 2025. Implemented user-specific wine linking for recommendations and bottle scanning
- June 15, 2025. Updated subscription pricing to $6.95/month with Stripe secure checkout integration
- June 15, 2025. Enhanced background color for better text contrast in call-to-action section
- June 15, 2025. Complete email subscription system with database storage and user notifications
- June 15, 2025. Comprehensive user dashboard implemented with seamless tab navigation
- June 15, 2025. Added email signup section and secondary call-to-action on home page
- June 15, 2025. Complete authentication and payment system implemented with Stripe integration
- June 15, 2025. Rebranded application to "What the Wine" with custom WTW logo
- June 14, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
App branding: "What the Wine" with custom WTW logo (WtW_1749955950754.png)
```