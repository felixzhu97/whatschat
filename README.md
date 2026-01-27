# WhatsChat

A modern instant messaging application built with React and TypeScript, supporting real-time chat, voice/video calls, file sharing, and more.

## ✨ Features

- 🔥 **Real-time Chat** - Support for text, emoji, and voice messages
- 📞 **Voice/Video Calls** - High-quality calls based on WebRTC and AWS Chime SDK
- 📎 **File Sharing** - Support for images, documents, and other file types
- 👥 **Contact Management** - Add, delete, and search contacts
- 🔍 **Message Search** - Full-text search of chat history
- 📱 **Responsive Design** - Support for desktop and mobile devices
- 🔐 **Complete Authentication System** - Registration, login, JWT token management

## 🛠️ Tech Stack

**Frontend Web**: Next.js 15, React 19, TypeScript, Tailwind CSS, Radix UI, Zustand  
**Frontend Mobile**: React Native, Expo, TypeScript, Zustand  
**Backend**: NestJS 10, TypeScript, Prisma, PostgreSQL, Redis  
**Authentication**: JWT, Passport, bcrypt  
**Communication**: WebSocket (Socket.IO, AWS API Gateway WebSocket), WebRTC (Native, AWS Chime SDK)  
**AWS Services**: API Gateway WebSocket, Chime SDK, S3, SES, SNS, SQS, Lambda, Cognito, CloudWatch  
**Testing**: Vitest, React Testing Library  
**Tools**: Turborepo, PNPM, ESLint, Prettier  
**Monorepo**: Shared packages for analytics, AV SDK, i18n, performance monitoring, and more

## 📁 Project Structure

```
whatschat/
├── apps/
│   ├── web/              # Next.js Web Application
│   │   ├── app/          # Next.js App Router pages
│   │   ├── src/
│   │   │   ├── domain/      # Domain layer (entities, interfaces)
│   │   │   ├── application/ # Application layer (services, DTOs)
│   │   │   ├── infrastructure/ # Infrastructure layer (adapters, storage)
│   │   │   └── presentation/ # Presentation layer (components, hooks, styles)
│   │   └── public/       # Static assets
│   ├── mobile/           # React Native mobile application
│   │   ├── src/
│   │   │   ├── domain/      # Domain layer (entities, interfaces)
│   │   │   ├── application/ # Application layer (services, DTOs)
│   │   │   ├── infrastructure/ # Infrastructure layer (adapters, storage)
│   │   │   └── presentation/ # Presentation layer (components, screens, navigation, state management)
│   │   └── app/          # Expo Router pages
│   └── server/           # NestJS server application (Clean Architecture)
│       └── src/
│           ├── domain/      # Domain layer (entities, interfaces)
│           ├── application/ # Application layer (services, DTOs)
│           ├── infrastructure/ # Infrastructure layer (database, external services)
│           ├── presentation/ # Presentation layer (controllers, gateways)
│           └── shared/     # Shared utilities
├── packages/             # Shared packages (monorepo)
│   ├── analytics-core/   # Analytics core library
│   ├── analytics-web/   # Web analytics implementation
│   ├── analytics-react-native/ # React Native analytics
│   ├── av-sdk-core/      # Audio/Video SDK core
│   ├── av-sdk-web/       # Web AV SDK implementation
│   ├── av-sdk-react-native/ # React Native AV SDK
│   ├── av-sdk-codec/     # Codec management
│   ├── av-sdk-filter/    # Video filter effects
│   ├── av-sdk-database/  # AV SDK database adapter
│   ├── aws-integration/  # AWS services integration
│   ├── i18n-core/        # Internationalization core
│   ├── performance-utils/ # Performance monitoring utilities
│   ├── sdk-communication/ # Communication SDK
│   ├── sdk-media/        # Media SDK
│   ├── sdk-processing/   # Media processing SDK
│   ├── sdk-recording/    # Recording SDK
│   ├── sdk-storage/      # Storage SDK
│   ├── sdk-web/          # Web SDK
│   ├── sdk-react-native/ # React Native SDK
│   └── test-utils/       # Testing utilities
├── docs/                 # Documentation and architecture diagrams
│   ├── api/              # API documentation
│   ├── architecture/     # Architecture diagrams (TOGAF, distributed systems)
│   ├── distributed-systems/ # Distributed systems diagrams
│   ├── user-journey-map/ # User journey and persona maps
│   └── wardley-map/      # Wardley maps
├── turbo.json           # Turborepo configuration
└── package.json         # Workspace configuration
```

## 🔧 Quick Start

### Requirements

- Node.js >= 18.0.0
- PNPM >= 9.0.0
- PostgreSQL >= 13
- Redis >= 6.0

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/whatschat.git
cd whatschat
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Setup Development Environment

After installing dependencies, you need to build the AWS integration package and generate Prisma client:

```bash
pnpm setup
```

Or manually:
```bash
# Build AWS integration package
pnpm --filter @whatschat/aws-integration build

# Generate Prisma client
cd apps/server
pnpm db:generate
cd ../..
```

### 4. Environment Configuration

#### Backend Configuration

```bash
cd apps/server
cp .env.example .env
```

Edit the `apps/server/.env` file (refer to `env.example`):

```env
# Server Configuration
NODE_ENV=development
PORT=3001
HOST=localhost

# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/whatschat?schema=public"

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=

# JWT Configuration (minimum 32 characters, use strong keys in production)
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production-min-32-chars
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here-change-in-production-min-32-chars
JWT_REFRESH_EXPIRES_IN=30d

# Security Configuration
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Storage Configuration (AWS S3) - Optional
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=whatschat-files

# Email Service Configuration - Optional
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-email-password
SMTP_FROM=noreply@whatschat.com

# AWS Chime SDK Configuration (Optional)
AWS_CHIME_ENABLED=false
AWS_CHIME_REGION=us-east-1
AWS_CHIME_MEDIA_REGION=us-east-1

# AWS API Gateway WebSocket Configuration (Optional)
AWS_API_GATEWAY_WEBSOCKET_ENABLED=false
AWS_API_GATEWAY_WEBSOCKET_ENDPOINT=https://your-api-id.execute-api.us-east-1.amazonaws.com/production

# Logging Configuration
LOG_LEVEL=info
LOG_FILE_PATH=logs/app.log
```

For more configuration options, refer to the `apps/server/env.example` file.

### AWS Integration

For detailed AWS integration setup instructions, see [AWS Integration Guide](docs/aws-integration.md).

**Quick Setup:**

1. **Enable Chime SDK** (for video calls):
   ```env
   AWS_CHIME_ENABLED=true
   AWS_CHIME_REGION=us-east-1
   ```

2. **Enable API Gateway WebSocket** (for scalable WebSocket):
   ```env
   AWS_API_GATEWAY_WEBSOCKET_ENABLED=true
   AWS_API_GATEWAY_WEBSOCKET_ENDPOINT=https://your-api-id.execute-api.us-east-1.amazonaws.com/production
   ```

#### Frontend Configuration

```bash
cd apps/web
```

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1

# WebSocket Configuration (Optional)
NEXT_PUBLIC_WEBSOCKET_MODE=socketio  # Options: socketio, apigateway, simulated
NEXT_PUBLIC_API_GATEWAY_WEBSOCKET_ENDPOINT=https://your-api-id.execute-api.us-east-1.amazonaws.com/production

# WebRTC Configuration (Optional)
NEXT_PUBLIC_WEBRTC_MODE=native  # Options: native, chime, simulated
```

### 5. Database Setup

#### Using Docker (Recommended)

```bash
cd apps/server

# Start database services (PostgreSQL + Redis)
./docker-start.sh dev

# Generate Prisma client
pnpm db:generate

# Run database migrations
pnpm migrate

# Seed test data
pnpm db:seed
```

#### Manual Setup

If you already have PostgreSQL and Redis services:

```bash
cd apps/server

# Generate Prisma client
pnpm db:generate

# Run database migrations
pnpm migrate

# Seed test data
pnpm db:seed
```

### 6. Start the Application

#### Method 1: Start Separately (Recommended for Development)

```bash
# Start backend server (Terminal 1)
cd apps/server
pnpm dev

# Start frontend application (Terminal 2)
cd apps/web
pnpm dev
```

#### Method 2: Start All Services Together

```bash
# In the project root directory
pnpm dev
```

### 6. Access the Application

- **Frontend Application**: http://localhost:3000
- **Backend API**: http://localhost:3001/api/v1
- **API Documentation (Swagger)**: http://localhost:3001/api/docs (development environment)
- **Health Check**: http://localhost:3001/api/v1/health

## 🧪 Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Generate test coverage reports
cd apps/server && pnpm test:coverage
cd apps/web && pnpm test:coverage
```

### Testing Frameworks

- **Backend**: Vitest + Supertest
- **Frontend**: Vitest + React Testing Library

## 👤 Test Accounts

The database seed will create the following test accounts:

- **Admin**: admin@whatschat.com / 123456
- **Alice**: alice@example.com / 123456
- **Bob**: bob@example.com / 123456
- **Charlie**: charlie@example.com / 123456

## 🔐 Authentication Features

### Implemented Features

- ✅ User registration (username, email, phone number, password)
- ✅ User login (email/password)
- ✅ JWT access tokens and refresh tokens
- ✅ Automatic token refresh
- ✅ User logout
- ✅ Get current user information
- ✅ Update user profile
- ✅ Change password
- ✅ Forgot password (basic implementation)
- ✅ Password reset (basic implementation)
- ✅ Frontend authentication state management
- ✅ Route protection
- ✅ Form validation

### API Endpoints

All API endpoints are prefixed with `/api/v1`:

```
POST /api/v1/auth/register      # User registration
POST /api/v1/auth/login         # User login
POST /api/v1/auth/logout        # User logout
GET  /api/v1/auth/me           # Get current user
PUT  /api/v1/auth/profile      # Update user profile
PUT  /api/v1/auth/change-password  # Change password
POST /api/v1/auth/refresh-token    # Refresh token
POST /api/v1/auth/forgot-password  # Forgot password
POST /api/v1/auth/reset-password   # Reset password
```

**API Documentation**: Visit http://localhost:3001/api/docs in the development environment to view the complete Swagger API documentation.

## 🛠️ Development Tools

### Database Management

```bash
cd apps/server

# Open Prisma Studio
pnpm db:studio

# Reset database
pnpm db:reset

# Push schema changes
pnpm db:push
```

### Code Quality

```bash
# Code linting
pnpm lint

# Auto-fix issues
pnpm lint:fix

# Format code
pnpm format

# Type checking
pnpm check-types
```

## 🏗️ Architecture Design

View architecture diagrams and documentation in the `docs/` folder:

### TOGAF Architecture Diagrams

- [TOGAF Overview](docs/architecture/togaf/overview.puml)
- [Business Architecture](docs/architecture/togaf/business-architecture.puml)
- [Application Architecture](docs/architecture/togaf/application-architecture.puml)
- [Data Architecture](docs/architecture/togaf/data-architecture.puml)
- [Technology Architecture](docs/architecture/togaf/technology-architecture.puml)

### Distributed Systems Diagrams

- [Distributed Architecture](docs/distributed-systems/distributed-architecture.puml)
- [Data Flow](docs/distributed-systems/data-flow.puml)
- [Service Communication](docs/distributed-systems/service-communication-sequence.puml)
- [Message Queue](docs/distributed-systems/message-queue.puml)

### Other Diagrams

- [User Journey Map](docs/user-journey-map/user-journey-map.puml)
- [Wardley Map](docs/wardley-map/wardley-map.puml)

### AWS Integration

- [AWS Integration Guide](docs/aws-integration.md) - Complete guide for setting up AWS API Gateway WebSocket and Chime SDK

For more details, see the [Documentation README](docs/README.md).

## 🚀 Deployment

### Docker Deployment

```bash
cd apps/server

# Start all services with docker-compose (development environment)
./docker-start.sh dev

# Start all services with docker-compose (production environment)
./docker-start.sh prod

# Stop services
./docker-stop.sh

# Or use docker-compose directly
docker-compose -f docker-compose.dev.yml up -d  # Development environment
docker-compose -f docker-compose.prod.yml up -d # Production environment
```

For more Docker deployment information, see the [Documentation README](docs/README.md) for available documentation.

### Production Environment Considerations

1. Replace JWT_SECRET with a strong key
2. Configure HTTPS
3. Set appropriate CORS policies
4. Configure database connection pooling
5. Set up Redis persistence
6. Configure log rotation
7. Set up monitoring and alerts

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check if PostgreSQL is running
   - Verify DATABASE_URL configuration
   - Ensure the database has been created

2. **Redis Connection Failed**
   - Check if Redis is running
   - Verify REDIS_URL configuration

3. **Frontend Cannot Connect to Backend**
   - Check if the backend server is running on port 3001
   - Verify NEXT_PUBLIC_API_URL configuration
   - Check CORS configuration

4. **Authentication Failed**
   - Check JWT_SECRET configuration
   - Verify if the token has expired
   - Check if the user exists

## 📚 Development Guide

### Backend Development (NestJS Clean Architecture)

The project uses Clean Architecture design, divided into the following layers:

1. **Domain Layer (domain/)**: Entity and interface definitions
   - `entities/`: Domain entities
   - `interfaces/`: Repository and service interfaces

2. **Application Layer (application/)**: Business logic
   - `services/`: Application services
   - `dto/`: Data Transfer Objects

3. **Infrastructure Layer (infrastructure/)**: External dependency implementations
   - `database/`: Database services (Prisma, Redis)
   - `adapters/`: Adapter implementations

4. **Presentation Layer (presentation/)**: API interfaces
   - `controllers/`: REST API controllers
   - `websocket/`: WebSocket gateways
   - `filters/`: Exception filters
   - `interceptors/`: Interceptors

#### Adding New API Endpoints

1. Define entities in `domain/entities/` (if needed)
2. Implement business logic in `application/services/`
3. Define DTOs in `application/dto/`
4. Create controllers and modules in `presentation/`
5. Implement repository adapters in `infrastructure/adapters/` (if needed)
6. Update the API client adapters in `apps/web/src/infrastructure/adapters/api/` if needed

### Frontend Development

1. Create pages in `apps/web/app/` (Next.js App Router)
2. Create components in `apps/web/src/presentation/components/`
3. Add custom hooks in `apps/web/src/presentation/hooks/`
4. Add state management (Zustand) in `apps/web/src/infrastructure/stores/`
5. Update routes and navigation

### Shared Packages Development

The project uses a monorepo structure with shared packages in the `packages/` directory:

- **Analytics Packages**: `analytics-core`, `analytics-web`, `analytics-react-native` - Event tracking and analytics
- **AV SDK Packages**: `av-sdk-core`, `av-sdk-web`, `av-sdk-react-native` - Audio/Video SDK for calls
- **SDK Packages**: `sdk-communication`, `sdk-media`, `sdk-processing`, `sdk-recording`, `sdk-storage` - Core SDK functionality
- **Utilities**: `i18n-core`, `performance-utils`, `test-utils` - Shared utilities
- **AWS Integration**: `aws-integration` - AWS services integration

To work with shared packages:

```bash
# Build all packages
pnpm build

# Build specific package
cd packages/analytics-core && pnpm build

# Run tests for a package
cd packages/i18n-core && pnpm test
```

## 👥 Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Felix Zhu** - _Initial Development_ - [felix zhu](mailto:z1434866867@gmail.com)

## 🙏 Acknowledgments

Thanks to all developers who have contributed to this project.

---

<p align="center">
  <strong>WhatsChat - Connect the World, Communication Without Boundaries</strong>
</p>
