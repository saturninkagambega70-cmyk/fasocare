# 🐛 Troubleshooting Guide

Common issues and their solutions for FasoCare development.

## Backend Issues

### 1. Environment Validation Error

**Error**
```
Error: JWT_SECRET must be at least 32 characters in production
```

**Solution**
```bash
# Generate a secure JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Add to .env.local
JWT_SECRET=<generated_value>
JWT_REFRESH_SECRET=<generated_value>

# Restart server
npm run start:dev
```

### 2. Database Connection Failed

**Error**
```
fatal: password authentication failed for user "fasocare"
```

**Solution**
```bash
# Check Docker container is running
docker ps | grep postgres

# If not running, start it
docker compose up -d postgres

# Check credentials in .env.local
# Default:
# DB_HOST=localhost
# DB_PORT=5432
# DB_USERNAME=fasocare
# DB_PASSWORD=fasocare_password
# DB_DATABASE=fasocare_db

# Test connection
psql -h localhost -U fasocare -d fasocare_db
```

### 3. Redis Connection Refused

**Error**
```
Error: connect ECONNREFUSED 127.0.0.1:6379
```

**Solution**
```bash
# Start Redis
docker compose up -d redis

# Or create Redis container manually
docker run --name fasocare-redis -p 6379:6379 -d redis:7-alpine

# Test connection
redis-cli ping  # Should return PONG
```

### 4. Module Resolution Error

**Error**
```
Cannot find module '@nestjs/core'
```

**Solution**
```bash
# Reinstall dependencies
cd backend
rm -rf node_modules package-lock.json
npm install

# If still failing, clear npm cache
npm cache clean --force
npm install
```

### 5. TypeScript Compilation Error

**Error**
```
src/auth/auth.service.ts:15:5 - error TS2339: Property 'user' does not exist
```

**Solution**
```bash
# Rebuild TypeScript
npm run build

# Check for type errors
npx tsc --noEmit

# Update types if needed
npm install --save-dev @types/node@latest

# Clear .next and dist
rm -rf dist .next
npm run build
```

---

## Frontend Issues

### 1. Port 3000 Already in Use

**Error**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution**
```bash
# Find process using port 3000
lsof -i :3000

# Kill it
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

### 2. Build Optimization Issues

**Error**
```
warning: you currently have the "ignoreUnknownElementsWarnings" setting
```

**Solution**
```typescript
// Update next.config.mjs
typescript: {
  ignoreBuildErrors: false,  // Fix TypeScript errors
}
```

### 3. CORS Error in Browser

**Error**
```
Access to XMLHttpRequest from origin 'http://localhost:3000' 
has been blocked by CORS policy
```

**Solution**
```bash
# Add origin to CORS_ORIGINS
# In .env or docker-compose.yml:
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# Or in docker-compose.yml
environment:
  - CORS_ORIGINS=http://localhost:3000
```

---

## Docker Issues

### 1. Docker Compose Services Won't Start

**Error**
```
ERROR: Cannot connect to Docker daemon
```

**Solution**
```bash
# Start Docker service
sudo systemctl start docker

# Or on Mac
open /Applications/Docker.app

# Check Docker status
docker ps
```

### 2. Database Port Already in Use

**Error**
```
Bind for 0.0.0.0:5432 failed: port is already allocated
```

**Solution**
```bash
# Find what's using port 5432
lsof -i :5432

# Stop existing container
docker stop <container_id>

# Remove it
docker rm <container_id>

# Start fresh
docker compose up -d
```

### 3. Out of Disk Space

**Error**
```
Error response from daemon: mkdir /var/lib/docker/containers: 
no space left on device
```

**Solution**
```bash
# Clean up Docker
docker system prune -a

# Remove unused volumes
docker volume prune

# Check disk space
df -h

# Remove old logs
docker logs --follow service_name > /dev/null 2>&1
```

---

## Testing Issues

### 1. Tests Timing Out

**Error**
```
Jest did not exit one second after the test run has completed
```

**Solution**
```typescript
// Increase timeout for e2e tests
jest.setTimeout(30000);

// Or in jest.config.js
module.exports = {
  testTimeout: 30000,
};

// Close database connections
afterEach(async () => {
  await app.close();
});
```

### 2. Test Database Issues

**Error**
```
Cannot create a new database with such name: fasocare_test
```

**Solution**
```bash
# Create test database
psql -U fasocare -d postgres -c \
  "CREATE DATABASE fasocare_test OWNER fasocare;"

# Or reset test DB
npm run test:db:reset
```

### 3. Mock Data Not Resetting

**Error**
```
Test failed: User already exists
```

**Solution**
```typescript
// Clear data between tests
beforeEach(async () => {
  await userRepository.clear();
  await consultationRepository.clear();
});

// Or truncate all tables
beforeEach(async () => {
  const entities = connection.entityMetadatas;
  for (const entity of entities) {
    const repository = connection.getRepository(entity.name);
    await repository.query(`TRUNCATE TABLE \"${entity.tableName}\" CASCADE;`);
  }
});
```

---

## API Issues

### 1. Unauthorized Access (401)

**Error**
```
Unauthorized: Invalid or expired token
```

**Solution**
```bash
# Get new token
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"+22670000001","password":"password"}'

# Use token in subsequent requests
curl -H "Authorization: Bearer <token>" http://localhost:3001/api/v1/medical/records
```

### 2. Rate Limited (429)

**Error**
```
Too Many Requests - Rate limit exceeded
```

**Solution**
```bash
# Wait before retrying (check Retry-After header)
sleep 60

# Increase rate limits if needed
RATE_LIMIT_MAX=200 RATE_LIMIT_TTL=60000 npm run start:dev

# Or implement exponential backoff in client
```

### 3. Invalid Request (400)

**Error**
```
Bad Request: Validation failed
```

**Solution**
```bash
# Check request body
# Phone number format: +226XXXXXXXX
# Password: minimum 12 characters
# Required fields present

# View Swagger documentation
http://localhost:3001/api/docs

# Check validation in DTO
cat src/auth/dto/login.dto.ts
```

---

## Performance Issues

### 1. Slow Queries

**Error**
```
Query took 5000ms
```

**Solution**
```typescript
// Add indexes
@Index()
@Column()
patientId: string;

// Add relations query params
await consultationRepo.find({
  relations: ['doctor', 'patient'],
  where: { status: 'completed' },
});

// Paginate large results
const [data, total] = await consultationRepo
  .createQueryBuilder()
  .take(10)
  .skip(0)
  .getManyAndCount();
```

### 2. High Memory Usage

**Error**
```
JavaScript heap out of memory
```

**Solution**
```bash
# Increase Node memory
NODE_OPTIONS=--max-old-space-size=4096 npm run start:dev

# Check for memory leaks
npm run debug

# Profile memory usage
node --prof app.js
node --prof-process isolate-*.log > profile.txt
```

### 3. Slow API Response

**Error**
```
Response time > 1 second
```

**Solution**
```typescript
// Add caching
@Injectable()
export class CacheService {
  private cache = new Map();

  get(key: string) {
    return this.cache.get(key);
  }

  set(key: string, value: any, ttl: number = 300000) {
    this.cache.set(key, value);
    setTimeout(() => this.cache.delete(key), ttl);
  }
}

// Optimize database queries
// Use pagination
// Add indexes
// Cache frequently accessed data
```

---

## Logging & Debugging

### 1. Find Errors in Logs

**Command**
```bash
# View recent errors
tail -f logs/error.log

# Search for specific errors
grep "NotFoundException" logs/combined.log

# Watch logs in real-time with colors
npm run start:dev | grep -i error
```

### 2. Enable Debug Logging

**Method**
```bash
# Enable verbose logging
LOG_LEVEL=debug npm run start:dev

# Or temporarily in code
this.logger.debug('Debug info:', { userId, action });
```

### 3. Inspect Network Requests

**Method**
```bash
# Use curl with verbose output
curl -v http://localhost:3001/api/v1/health

# Use httpie for better formatting
http --auth username:password POST localhost:3001/api/v1/auth/login

# Monitor all requests
npm install -g mitmproxy
mitmproxy -p 8080
```

---

## Getting Help

1. **Check Documentation**
   - [SECURITY.md](SECURITY.md)
   - [CODE_STYLE.md](CODE_STYLE.md)
   - [IMPROVEMENTS.md](IMPROVEMENTS.md)

2. **Search Issues**
   - GitHub Issues
   - Stack Overflow
   - NestJS Docs

3. **Ask Team**
   - Slack: #fasocare-dev
   - Daily standup
   - Code review comments

4. **Contact Support**
   - Email: dev-support@ans.bf
   - Emergency: [On-call Number]

---

**Last Updated**: 11 Apr 2026  
**Maintainer**: Development Team, ANS
