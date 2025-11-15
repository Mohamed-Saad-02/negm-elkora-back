# Najm ElKora Backend

A comprehensive backend API for a football talent discovery platform connecting players, scouts, and football enthusiasts. Built with NestJS, TypeORM, and PostgreSQL, featuring JWT authentication, role-based access control, and a complete social media ecosystem for the football community.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation Instructions](#installation-instructions)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Architecture / Structure](#architecture--structure)
- [Future Improvements](#future-improvements)
- [Author and Contact Info](#author-and-contact-info)

## Features

### Authentication & Authorization

- **JWT Authentication**: Secure access and refresh token system
- **Role-Based Access Control**: Three distinct roles (Player, Scout, User) with granular permissions
- **Password Security**: Bcrypt hashing for secure password storage
- **Token Management**: Automatic token refresh and secure logout

### User Management

- **User Registration**: Multi-role registration with email validation
- **User Profiles**: Comprehensive profiles with bio, country, date of birth
- **User Verification**: Account verification system
- **Profile Management**: View and manage user profiles

### Video Management

- **Video Upload**: Upload videos with thumbnails and captions
- **Video Feed**: Paginated feed with infinite scroll support
- **Share Cooldown**: 1-hour cooldown between video shares
- **Video Statistics**: Like counts, comment counts, and engagement metrics
- **Player Videos**: View all videos by specific players

### Comments System

- **Video Comments**: Comment on videos (one comment per user per video)
- **Nested Comments**: Reply to comments with unlimited nesting
- **Comment Management**: Edit and delete own comments
- **Comment Threading**: View comment threads with replies

### Social Features

- **Follow System**: Follow/unfollow users
- **Follower Management**: View followers and following lists
- **Social Graph**: Track user connections and relationships

### Scout Features

- **Player Feedback**: Leave detailed feedback for players (rating, strengths, weaknesses, notes)
- **Tryout Requests**: Request tryouts from players
- **Feedback Management**: View and manage scout feedback
- **Player Discovery**: Browse player profiles and videos

### Player Features

- **Comment Responses**: Respond to comments on own videos
- **Feedback Viewing**: View all feedback from scouts
- **Tryout Management**: Accept or reject tryout requests
- **Profile Showcase**: Showcase videos and profile information

### Reporting System

- **Content Reporting**: Report inappropriate videos or comments
- **Reason-Based Reports**: Detailed reporting with reason specification
- **Report Management**: Track and manage user reports

## Technologies Used

### Core Framework

- **NestJS** (v11.0.1) - Progressive Node.js framework for building efficient server-side applications
- **TypeScript** (v5.7.3) - Typed superset of JavaScript

### Database & ORM

- **PostgreSQL** (v12+) - Advanced open-source relational database
- **TypeORM** (v0.3.20) - Object-Relational Mapping framework
- **pg** (v8.12.0) - PostgreSQL client for Node.js

### Authentication & Security

- **@nestjs/jwt** (v11.0.1) - JWT module for NestJS
- **@nestjs/passport** (v11.0.5) - Passport integration for NestJS
- **passport-jwt** (v4.0.1) - JWT strategy for Passport
- **bcrypt** (v6.0.0) - Password hashing library

### Validation & Transformation

- **class-validator** (v0.14.1) - Decorator-based validation
- **class-transformer** (v0.5.1) - Object transformation library

### API Documentation

- **@nestjs/swagger** (v11.2.1) - Swagger/OpenAPI integration

### Rate Limiting

- **@nestjs/throttler** (v6.4.0) - Rate limiting and throttling

### Configuration

- **@nestjs/config** (v4.0.2) - Configuration management
- **dotenv** (v17.2.3) - Environment variable management

### Development Tools

- **ESLint** (v9.18.0) - Code linting
- **Prettier** (v3.4.2) - Code formatting
- **Jest** (v29.7.0) - Testing framework
- **SWC** - Fast TypeScript/JavaScript compiler

## Installation Instructions

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **PostgreSQL** (v12 or higher)
- **pnpm** (or npm/yarn)
- **Git**

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd negm-elkora
```

### Step 2: Install Dependencies

```bash
pnpm install
```

Or using npm:

```bash
npm install
```

### Step 3: Environment Configuration

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=najm_elkora

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_ACCESS_TOKEN_EXPIRATION=15m
JWT_REFRESH_TOKEN_EXPIRATION=7d

# Application Configuration
PORT=3000
NODE_ENV=development

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=10
```

### Step 4: Database Setup

Create the PostgreSQL database:

```bash
createdb najm_elkora
```

Or using psql:

```sql
CREATE DATABASE najm_elkora;
```

### Step 5: Run Migrations

```bash
pnpm run migration:run
```

### Step 6: Seed Database (Optional)

Populate the database with initial test data:

```bash
pnpm run seed
```

This will create sample users:

- **Player**: `player@example.com` / `password123`
- **Scout**: `scout@example.com` / `password123`
- **User**: `user@example.com` / `password123`

### Step 7: Start the Application

**Development mode:**

```bash
pnpm run start:dev
```

**Production mode:**

```bash
pnpm run build
pnpm run start:prod
```

The application will be available at:

- **API**: `http://localhost:3000`
- **Swagger Documentation**: `http://localhost:3000/api`

## Usage

### Starting the Development Server

```bash
pnpm run start:dev
```

The server will start with hot-reload enabled, automatically restarting on file changes.

### Building for Production

```bash
pnpm run build
```

This compiles TypeScript to JavaScript in the `dist/` directory.

### Running Tests

```bash
# Run all tests
pnpm run test

# Run tests in watch mode
pnpm run test:watch

# Run tests with coverage
pnpm run test:cov

# Run e2e tests
pnpm run test:e2e
```

### Database Migrations

```bash
# Generate a new migration
pnpm run migration:generate -- -n MigrationName

# Run pending migrations
pnpm run migration:run

# Revert the last migration
pnpm run migration:revert
```

### Code Quality

```bash
# Run linter
pnpm run lint

# Format code
pnpm run format
```

## API Endpoints

### Authentication Endpoints

#### Register User

```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "player",
  "bio": "Professional football player",
  "country": "USA",
  "dateOfBirth": "2000-01-15"
}
```

**Response:**

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "player"
  },
  "accessToken": "jwt-access-token",
  "refreshToken": "jwt-refresh-token"
}
```

#### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "player"
  },
  "accessToken": "jwt-access-token",
  "refreshToken": "jwt-refresh-token"
}
```

#### Refresh Token

```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

**Response:**

```json
{
  "accessToken": "new-jwt-access-token",
  "refreshToken": "new-jwt-refresh-token"
}
```

#### Logout

```http
POST /auth/logout
Authorization: Bearer <access-token>
```

**Response:**

```json
{
  "message": "Logged out successfully"
}
```

### User Endpoints

#### Get Current User Profile

```http
GET /users/profile
Authorization: Bearer <access-token>
```

#### Get User by ID

```http
GET /users/:id
Authorization: Bearer <access-token>
```

### Video Endpoints

#### Upload Video

```http
POST /videos
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "videoUrl": "https://example.com/video.mp4",
  "thumbnailUrl": "https://example.com/thumbnail.jpg",
  "caption": "My awesome video"
}
```

#### Get Video Feed

```http
GET /videos/feed?page=1&limit=10
Authorization: Bearer <access-token>
```

#### Get Videos by User

```http
GET /videos/user/:userId
Authorization: Bearer <access-token>
```

#### Get Video by ID

```http
GET /videos/:id
Authorization: Bearer <access-token>
```

#### Delete Video

```http
DELETE /videos/:id
Authorization: Bearer <access-token>
```

#### Check Share Cooldown

```http
GET /videos/share/cooldown
Authorization: Bearer <access-token>
```

### Comment Endpoints

#### Create Comment

```http
POST /comments
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "videoId": "video-uuid",
  "text": "Great video!",
  "parentCommentId": "optional-parent-comment-uuid"
}
```

#### Get Comments by Video

```http
GET /comments/video/:videoId
Authorization: Bearer <access-token>
```

#### Get Comment by ID

```http
GET /comments/:id
Authorization: Bearer <access-token>
```

#### Delete Comment

```http
DELETE /comments/:id
Authorization: Bearer <access-token>
```

### Like Endpoints

#### Toggle Like on Video

```http
POST /likes/video/:videoId
Authorization: Bearer <access-token>
```

**Response:**

```json
{
  "liked": true
}
```

#### Get Likes by Video

```http
GET /likes/video/:videoId
Authorization: Bearer <access-token>
```

### Follow Endpoints

#### Follow User

```http
POST /follows
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "followingId": "user-uuid"
}
```

#### Unfollow User

```http
DELETE /follows/:followingId
Authorization: Bearer <access-token>
```

#### Get Followers

```http
GET /follows/followers/:userId
Authorization: Bearer <access-token>
```

#### Get Following

```http
GET /follows/following/:userId
Authorization: Bearer <access-token>
```

### Feedback Endpoints (Scout Only)

#### Create Feedback

```http
POST /feedback
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "playerId": "player-uuid",
  "rating": 5,
  "strengths": "Great speed and agility",
  "weaknesses": "Needs improvement in passing",
  "notes": "Overall good performance",
  "isPublic": false
}
```

#### Get Feedback by Player

```http
GET /feedback/player/:playerId
Authorization: Bearer <access-token>
```

#### Get Feedback by Scout

```http
GET /feedback/scout
Authorization: Bearer <access-token>
```

#### Delete Feedback

```http
DELETE /feedback/:id
Authorization: Bearer <access-token>
```

### Tryout Endpoints

#### Request Tryout (Scout Only)

```http
POST /tryouts
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "playerId": "player-uuid",
  "message": "I would like to invite you for a tryout"
}
```

#### Update Tryout Status (Player Only)

```http
PATCH /tryouts/:id/status
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "status": "accepted",
  "message": "I accept the invitation"
}
```

#### Get Tryouts for Player

```http
GET /tryouts/player
Authorization: Bearer <access-token>
```

#### Get Tryouts by Scout

```http
GET /tryouts/scout
Authorization: Bearer <access-token>
```

### Report Endpoints

#### Create Report

```http
POST /reports
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "videoId": "video-uuid",
  "reason": "Inappropriate content"
}
```

Or for comments:

```json
{
  "commentId": "comment-uuid",
  "reason": "Spam or harassment"
}
```

#### Get All Reports

```http
GET /reports
Authorization: Bearer <access-token>
```

## Architecture / Structure

### Project Structure

```
negm-elkora/
├── src/
│   ├── modules/                    # Feature modules
│   │   ├── auth/                   # Authentication module
│   │   │   ├── dto/                # Data Transfer Objects
│   │   │   ├── strategies/         # JWT strategies
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.module.ts
│   │   ├── users/                  # User management
│   │   │   ├── dto/
│   │   │   ├── entities/
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   └── users.module.ts
│   │   ├── videos/                 # Video management
│   │   ├── comments/               # Comments system
│   │   ├── likes/                  # Like functionality
│   │   ├── follows/                # Follow system
│   │   ├── feedback/               # Scout feedback
│   │   ├── tryouts/                # Tryout requests
│   │   └── reports/                # Reporting system
│   ├── common/                     # Shared utilities
│   │   ├── decorators/             # Custom decorators (@Roles, @CurrentUser, @Public)
│   │   ├── guards/                 # Authentication and authorization guards
│   │   ├── filters/                # Exception filters
│   │   ├── helpers/                # Helper functions (pagination, etc.)
│   │   └── enums/                  # Enumerations (UserRole, TryoutStatus)
│   ├── config/                     # Configuration files
│   │   ├── database.config.ts
│   │   └── jwt.config.ts
│   ├── database/
│   │   ├── migrations/             # Database migrations
│   │   ├── seeds/                  # Database seeds
│   │   └── data-source.ts          # TypeORM data source
│   ├── app.module.ts               # Root application module
│   └── main.ts                     # Application entry point
├── test/                           # Test files
├── .env.example                    # Environment variables template
├── package.json                    # Dependencies and scripts
├── tsconfig.json                   # TypeScript configuration
└── README.md                       # This file
```

### Architecture Patterns

#### Module-Based Architecture

The application follows NestJS's modular architecture, where each feature is encapsulated in its own module with:

- **Controller**: Handles HTTP requests and responses
- **Service**: Contains business logic
- **Module**: Wires everything together
- **DTOs**: Data validation and transformation
- **Entities**: Database models

#### Clean Architecture Principles

- **Separation of Concerns**: Each module is self-contained
- **Dependency Injection**: Services are injected via constructors
- **Repository Pattern**: TypeORM repositories abstract database access
- **DTO Pattern**: Data validation at the API boundary

#### Security Layers

1. **Authentication**: JWT-based authentication with refresh tokens
2. **Authorization**: Role-based access control (RBAC)
3. **Validation**: Input validation using class-validator
4. **Rate Limiting**: Protection against abuse
5. **Exception Filtering**: Centralized error handling

### Database Schema

#### Entity Relationships

```
Users (1) ──< (N) Videos
Users (1) ──< (N) Comments
Users (1) ──< (N) Likes
Users (1) ──< (N) Follows (as follower)
Users (1) ──< (N) Follows (as following)
Users (1) ──< (N) Feedback (as scout)
Users (1) ──< (N) Feedback (as player)
Users (1) ──< (N) Tryouts (as scout)
Users (1) ──< (N) Tryouts (as player)
Users (1) ──< (N) Reports

Videos (1) ──< (N) Comments
Videos (1) ──< (N) Likes
Videos (1) ──< (N) Reports

Comments (1) ──< (N) Comments (as replies)
Comments (1) ──< (N) Reports
```

## Future Improvements

### Short-term Enhancements

- **Email Verification**: Implement email verification system for user accounts
- **Password Reset**: Add forgot password and reset password functionality
- **File Upload**: Integrate cloud storage (AWS S3, Cloudinary) for video and image uploads
- **Real-time Notifications**: WebSocket support for real-time notifications
- **Search Functionality**: Full-text search for users, videos, and content
- **Video Processing**: Video transcoding and thumbnail generation
- **Analytics Dashboard**: User engagement and content analytics

### Medium-term Features

- **Social Features**:
  - Direct messaging between users
  - Groups and communities
  - Event creation and management
  - News feed algorithm optimization

- **Advanced Scout Features**:
  - Player statistics tracking
  - Performance analytics
  - Comparison tools
  - Scouting reports export

- **Player Features**:
  - Portfolio builder
  - Highlight reel creation
  - Achievement badges
  - Career timeline

### Long-term Vision

- **Mobile App**: Native iOS and Android applications
- **AI Integration**:
  - Video analysis using computer vision
  - Player performance prediction
  - Content recommendation engine
- **Internationalization**: Multi-language support
- **Payment Integration**: Premium features and subscriptions
- **API Versioning**: Support for multiple API versions
- **Microservices Migration**: Split into microservices for scalability
- **Caching Layer**: Redis integration for improved performance
- **CDN Integration**: Content delivery network for media files

### Technical Improvements

- **Testing**: Increase test coverage (unit, integration, e2e)
- **Documentation**: API documentation improvements
- **Monitoring**: Application performance monitoring (APM)
- **Logging**: Structured logging with ELK stack
- **CI/CD**: Continuous integration and deployment pipeline
- **Containerization**: Docker and Kubernetes support
- **Database Optimization**: Query optimization and indexing strategies

## Author and Contact Info

### Project Information

- **Project Name**: Najm ElKora Backend
- **Version**: 0.0.1
- **License**: Private and Proprietary

### Development Team

For questions, suggestions, or contributions, please contact the development team.

### Support

For technical support or bug reports, please open an issue in the repository or contact the development team directly.

---

**Note**: This is a private project. Unauthorized access, distribution, or modification is prohibited.
