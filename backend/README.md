# 🏥 FasoCare Core Backend API

**Plateforme Nationale de Santé Numérique du Burkina Faso**

Backend API service built with NestJS, PostgreSQL, and Redis.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development server
npm run start:dev

# API available at: http://localhost:3001/api/v1
# Swagger docs: http://localhost:3001/api/docs
```

## 📋 Scripts

```bash
npm run build              # Compile TypeScript
npm run start              # Run production build
npm run start:dev          # Development with watch mode
npm run start:debug        # Debug mode with inspector
npm run lint               # Run ESLint
npm run test               # Run unit tests
npm run test:watch        # Watch mode for tests
npm run test:cov          # Generate coverage report
npm run test:e2e          # Run end-to-end tests
npm run format             # Format code with Prettier
npm run migration:create   # Create new migration
npm run migration:generate # Generate migration from entities
npm run migration:run      # Run pending migrations
npm run migration:revert   # Revert last migration
```

## 🗄️ Database

### PostgreSQL Setup

```bash
# Using Docker Compose
docker compose up postgres

# Manual connection
psql -h localhost -U fasocare -d fasocare_db
```

### Migrations

```bash
# Generate migration from entity changes
npm run migration:generate -- -n AddNewField

# Run migrations
npm run migration:run

# Revert to previous migration
npm run migration:revert

# View migration status
npm run migration:show
```

### Database Schema

Schema is managed through TypeORM entities in `src/*/entities/`.

```
src/
├── auth/entities/
├── medical/entities/
├── pharmacy/entities/
├── users/entities/
└── ...
```

## 🔐 Security

### Environment Variables

**Required:**
- `JWT_SECRET` - JWT signing key (min 32 chars)
- `JWT_REFRESH_SECRET` - Refresh token key (min 32 chars)
- `DB_PASSWORD` - Database password

**Optional:**
- `ENCRYPTION_KEY` - Field-level encryption key
- `AT_API_KEY` - Africa's Talking API key
- `REDIS_HOST` - Redis connection host

See [docs/SECURITY.md](../docs/SECURITY.md) for detailed security guidelines.

## 🧪 Testing

```bash
# Unit tests
npm run test

# Generate coverage report
npm run test:cov

# E2E tests
npm run test:e2e

# Watch mode for development
npm run test:watch
```

**Coverage Goals:**
- Auth module: 90%+
- Medical module: 80%+
- Pharmacy module: 80%+
- Common utilities: 75%+

## 📚 API Documentation

Full API documentation is available at `/api/docs` when running the server.

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | User login |
| POST | `/api/v1/auth/refresh` | Refresh JWT token |
| GET | `/api/v1/medical/records/:id` | Get patient medical history |
| POST | `/api/v1/medical/consultation` | Create consultation |
| GET | `/api/v1/pharmacy/medications` | List medications |
| POST | `/api/v1/pharmacy/prescription` | Fill prescription |
| GET | `/api/v1/health` | Health check |

## 🏗️ Architecture

### Modules

- **auth** - JWT authentication and authorization
- **users** - User management and RBAC
- **medical** - Medical records and consultations
- **pharmacy** - Prescription and medication management
- **laboratory** - Lab test management
- **vaccination** - Vaccination records
- **ussd** - USSD/SMS integration
- **telecom** - Africa's Talking integration
- **consent** - Consent management
- **monitoring** - Logging and monitoring
- **health** - Health checks and liveness probes

### Request/Response Pattern

All API responses follow this pattern:

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": { /* resource */ },
  "timestamp": "2026-04-11T10:30:00Z"
}
```

Error responses:

```json
{
  "statusCode": 400,
  "message": "Invalid input",
  "error": "Bad Request",
  "details": [/* validation errors */]
}
```

## 🔧 Configuration

### ConfigService

Access configuration via `AppConfigService`:

```typescript
@Injectable()
export class MyService {
  constructor(private config: AppConfigService) {}

  doSomething() {
    const apiKey = this.config.atApiKey;
    const isDev = this.config.isDevelopment;
  }
}
```

## 📝 Logging

Centralized logging with Winston:

```typescript
import { logger } from './config/logger';

// Use logger anywhere
logger.info('User logged in', { userId: user.id });
logger.error('Database connection failed', { error: err });
logger.warn('Rate limit approaching for IP', { ip: request.ip });
```

Logs are written to:
- Console (stdout)
- `logs/error.log` (errors only)
- `logs/combined.log` (all logs)
- `logs/debug.log` (development only)

## 🚦 Rate Limiting

API endpoints are protected with rate limiting:

```
Default:     100 requests per minute per IP
Login:       10 attempts per 15 minutes per IP
SMS/USSD:    5 requests per hour per phone number
```

Configure in environment:

```env
RATE_LIMIT_MAX=100
RATE_LIMIT_TTL=60000
```

## 🐛 Debugging

### Enable Debug Mode

```bash
npm run start:debug

# Open chrome://inspect in Chrome DevTools
```

### Inspect Requests

```typescript
// Add logging decorator
@Injectable()
@UseInterceptors(LoggingInterceptor)
export class MedicalController { }
```

## 📦 Dependencies

- **Framework**: NestJS 11.x
- **Database**: TypeORM + PostgreSQL
- **Auth**: JWT + Passport
- **Validation**: class-validator + class-transformer
- **Queue**: BullMQ + Redis
- **Monitoring**: Prometheus + Winston
- **Documentation**: Swagger/OpenAPI

## 🚢 Deployment

### Docker Build

```bash
# Build image
docker build -t fasocare-api:latest .

# Run container
docker run -p 3001:3001 \
  -e JWT_SECRET=your_secret \
  -e DB_HOST=postgres \
  fasocare-api:latest
```

### Production Checklist

- [ ] Database backups configured
- [ ] Environment variables set securely
- [ ] JWT secrets strong (32+ chars)
- [ ] Database SSL enabled
- [ ] Monitoring/logging configured
- [ ] Rate limiting tuned
- [ ] Health checks verified

## 📖 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Guide](https://typeorm.io/)
- [Security Guidelines](../docs/SECURITY.md)
- [Improvements Log](../docs/IMPROVEMENTS.md)
- [Commit Convention](../docs/COMMIT_GUIDE.md)

## 🤝 Contributing

1. Follow [Conventional Commits](../docs/COMMIT_GUIDE.md)
2. Add tests for new features
3. Ensure linting passes: `npm run lint`
4. Update documentation
5. Submit PR with clear description

## 📄 License

© 2026 Gouvernement du Burkina Faso. All rights reserved.

---

**Last Updated**: 11 Apr 2026  
**Maintained by**: Agence Numérique de Santé (ANS)
