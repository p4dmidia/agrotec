# Dr. Agro - Intelligent Agricultural Platform

## Overview

Dr. Agro is a comprehensive agricultural management platform built as a full-stack web application. It combines artificial intelligence, educational content, calendar management, weather forecasting, and e-commerce features to serve farmers and agricultural professionals. The platform uses a modern tech stack with React frontend, Express.js backend, and PostgreSQL database.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack React Query for server state management
- **Routing**: Wouter for client-side navigation
- **Build Tool**: Vite for development and production builds
- **Authentication**: JWT-based authentication with localStorage token storage

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Authentication**: JWT tokens with bcrypt password hashing
- **Database Provider**: Neon Database (PostgreSQL)
- **API Design**: RESTful API with role-based access control

### Database Architecture
- **Primary Database**: PostgreSQL via Supabase (Connection Pooler URL)
- **Schema Management**: Custom adapter mapping between Supabase UUIDs and application numeric IDs
- **Database Connection**: @neondatabase/serverless with connection pooling
- **Key Tables**: users (with CPF field), fazendas, chats, eventos_calendario
- **Supabase Integration**: Custom SupabaseStorage adapter for seamless data mapping

## Key Components

### Authentication System
- JWT-based authentication with role-based access control
- Three-tier subscription model (gratuito, pro, premium)
- User management with CPF-based identification (Brazilian tax ID)
- Account status tracking (adimplente/inadimplente)

### AI Chat System
- Multi-conversation support with consultation and diagnosis modes
- Support for text, image, and document file uploads (.jpg, .jpeg, .png, .pdf, .doc, .docx, .txt)
- File size limit: 2MB per file
- Conversation history and message persistence
- Plan-based usage limitations

### Learning Management
- Structured learning tracks with video content
- Progress tracking and completion status
- Score-based assessments
- Category-based content organization

### Calendar & Event Management
- Agricultural event scheduling (irrigation, fertilization, pruning, harvest)
- Event type categorization with visual indicators
- Date-based event filtering and management

### Weather Integration
- Current weather data display
- Weather alerts and notifications
- Location-based weather information
- Agricultural-specific weather insights

### E-commerce Store
- Product catalog with categories (seeds, fertilizers, tools, pesticides)
- Shopping cart functionality
- Product search and filtering
- Order management system

### Settings & Profile Management
- User profile customization
- Plan management and upgrades
- Usage analytics and limitations
- Account settings and preferences

## Data Flow

### Authentication Flow
1. User registers/logs in with CPF and password
2. Backend validates credentials and generates JWT token
3. Frontend stores token and includes it in subsequent API requests
4. Middleware validates tokens and injects user context

### Chat Flow
1. User selects or creates conversation
2. Messages (text/file) sent to backend
3. AI processing occurs (simulated in current implementation)
4. Response stored and returned to frontend
5. Real-time message updates via React Query

### Learning Flow
1. User browses available learning tracks
2. Video content accessed based on subscription plan
3. Progress tracked and updated in real-time
4. Completion status persisted to database

## External Dependencies

### Frontend Dependencies
- **UI Components**: Radix UI primitives with shadcn/ui
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Styling**: Tailwind CSS with class-variance-authority
- **HTTP Client**: Native fetch API with React Query

### Backend Dependencies
- **Database**: @neondatabase/serverless for PostgreSQL connection
- **Authentication**: bcryptjs for password hashing, jsonwebtoken for JWT
- **Validation**: Zod for schema validation
- **ORM**: Drizzle ORM with drizzle-kit for migrations

### Development Dependencies
- **Build Tools**: Vite, esbuild for production builds
- **Type Checking**: TypeScript with strict configuration
- **Development**: tsx for TypeScript execution, Replit integrations

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with HMR
- **Backend**: tsx for TypeScript execution with file watching
- **Database**: Neon Database cloud instance
- **Environment Variables**: DATABASE_URL, JWT_SECRET

### Production Build
- **Frontend**: Vite build process generating static assets
- **Backend**: esbuild bundling for Node.js deployment
- **Database**: Drizzle migrations for schema updates
- **Deployment**: Configured for Replit deployment with environment-specific settings

### Environment Configuration
- **Development**: Hot reload, development error overlays
- **Production**: Optimized builds, error handling, logging
- **Database**: Connection pooling, SSL configuration

## Changelog

```
Changelog:
- July 03, 2025. Initial setup with React frontend and Express backend
- July 03, 2025. Migrated from in-memory storage to PostgreSQL database with complete data persistence
- July 04, 2025. Implemented complete file upload system with OpenAI integration
- July 04, 2025. Added audio recording with animations and fixed audio transcription processing
- July 04, 2025. Enhanced diagnostic mode with structured technical reports including producer name, symptoms analysis, and treatment recommendations
- July 04, 2025. Fixed critical bugs: duplicate responses in consultation mode, double report generation in diagnostic mode, modal blank content display, and synchronized typing animation timing
- July 04, 2025. Enhanced diagnostic reports with 4 action buttons: professional PDF download with brand identity, improved print formatting, WhatsApp contact with agronomist, and email report functionality
- July 04, 2025. Updated Dr. Agro logo to custom agricultural design throughout the platform (sidebar, chat header, and message icons)
- July 04, 2025. Enhanced consultation mode to intelligently detect diagnostic requests and guide users to diagnostic mode for comprehensive reports
- July 04, 2025. Implemented comprehensive calendar enhancements: smart task suggestions based on user patterns, activity type classification with color coding, task templates for recurring activities, and contextual agricultural recommendations
- July 05, 2025. Enhanced calendar with image attachments, technical notes field, location tracking, exportable CSV history with filtering, inactivity alert system, and detailed event viewing modal with complete agricultural documentation
- July 05, 2025. Implemented advanced weather monitoring system with comprehensive meteorological data schema, intelligent agricultural alert generation, 7-14 day extended forecasts, GPS-based location services, and context-aware decision-making support for farming activities
- July 05, 2025. Enhanced weather system with intelligent city name extraction from complete addresses, properly handling Brazilian address formats (street, number, city, state) to display city names with state codes in format "CIDADE - UF" in weather card titles
- July 05, 2025. Implemented smart agricultural recommendations system that analyzes weather conditions, crop development stages, and recent farming activities to provide contextual suggestions. Features intelligent decision-making for activities like pruning, irrigation, and fertilization based on weather forecasts and historical farm data
- July 05, 2025. Added comprehensive real-time weather notification system via WhatsApp for Pro/Premium users. Features intelligent alert detection for strong winds (>40km/h), heavy rain (>15mm), and cold/frost conditions (<5°C). Includes automated scheduling, smart messaging, and test functionality with Twilio integration
- July 06, 2025. Successfully integrated with existing Supabase database with complete data mapping between UUIDs and application numeric IDs. Created custom SupabaseStorage adapter supporting users, fazendas, chats and eventos_calendario tables. Fixed authentication system to work seamlessly with Supabase backend using Connection Pooler URL for optimal performance
- July 06, 2025. Added "Banana" as first crop type option in farm registration and weather monitoring forms, making it the default selection. Enhanced navigation by updating "Clima" to "Monitoramento" in sidebar menu to better reflect comprehensive agricultural monitoring capabilities
- July 06, 2025. Updated platform branding back to "Dr Agro" with improved typography (text-lg) for better visual balance with the logo in sidebar
- July 06, 2025. Fixed chat system with hybrid storage approach - using Supabase for user authentication and MemStorage for conversations. Resolved "Nova" conversation button by making title field optional in schema validation and implementing automatic title generation
- July 06, 2025. Restored consultation mode summary functionality with blue-themed UI. Added intelligent detection for consultation reports and implemented consultation summary extraction similar to diagnostic reports. Users now see a concise summary with "Ver Consulta Completa" button for detailed responses in consultation mode
- July 07, 2025. Fixed calendar events persistence issue by replacing broken Drizzle implementation with native Supabase client. All calendar CRUD operations now properly save and retrieve data from Supabase database. Added automatic test user creation for login compatibility with existing database structure
- July 08, 2025. Resolved chat system UUID mapping issues by implementing intelligent caching system. Both diagnostic and consultation modules now work perfectly with proper conversation and message persistence. Fixed UUID generation to create valid database relationships, ensuring seamless chat functionality across all modes
- July 08, 2025. Completely implemented learning tracks system with full Supabase integration. Created learning_tracks, learning_videos, and user_progress tables with 4 bananiculture modules containing 15 real video lessons. Consultation mode restored to simple WhatsApp-style chat while diagnostic mode maintains structured reports with summaries
- July 08, 2025. Enhanced user subscription system with new Supabase fields: plano (mensal/trimestral/anual), trial_ativo (boolean), trial_expira_em (7-day trial expiration), cobranca_agendada (billing scheduled flag), and role (user by default). All users now have comprehensive subscription tracking with trial management capabilities
- July 08, 2025. Implemented trial countdown and subscription cancellation system. Dashboard shows remaining trial days with orange alert design. Settings page includes discrete cancellation button that updates trial_ativo and cobranca_agendada to false. Complete registration flow with plan selection and card validation ready for Stripe integration
- July 09, 2025. Fixed card validation error in registration flow by allowing SetupIntent with 'requires_payment_method' status during trial period. Successfully tested complete registration with real Stripe integration. Moved subscription cancellation button from Preferences tab to Subscription tab for better user experience and logical organization
- July 09, 2025. Implemented comprehensive automatic billing system with trial expiration logic. Features real-time billing verification on login, daily cron job (9:00 AM) for expired trial processing, and Stripe payment integration. System automatically charges users when trial_ativo=true, cobranca_agendada=true, and trial_expira_em < current date. Includes billing service with complete error handling and user status updates
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
CRITICAL RULES:
- NEVER delete any files without explicit permission
- ONLY use Supabase database - NO memory storage allowed
- Avoid rework - fix problems directly instead of rebuilding
- Focus on targeted solutions, not complete rewrites
```