# 🧪 USSD & OTP Testing Guide

Base URL actuelle du backend: `http://localhost:3001/api/v1`

## Quick Start

### 1. Development Setup

```bash
cd backend
npm install

# Configure environment variables
cp .env.example .env

# Update .env with Africa's Talking credentials
AT_API_KEY=your_api_key
AT_USERNAME=your_username
```

### 2. Start Backend Server

```bash
npm run start:dev
# Server runs on http://localhost:3001/api/v1
```

---

## OTP Testing

### Test 1: Request OTP

**Endpoint**: `POST /auth/request-otp`

```bash
curl -X POST http://localhost:3001/api/v1/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+226XX123456"
  }'
```

**Expected Response** (201):
```json
{
  "statusCode": 201,
  "success": true,
  "message": "Code de vérification envoyé à votre téléphone",
  "expiresIn": 600
}
```

**What Happens**:
✅ OTP code generated (6 digits)
✅ SMS sent to phone (in development mode, logged to console)
✅ Code stored in memory with 10-minute expiry

### Test 2: Verify OTP

**Endpoint**: `POST /auth/verify-otp`

```bash
# First request OTP to get code
curl -X POST http://localhost:3001/api/v1/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+226XX123456"}'

# Check console for OTP code (e.g., 123456)

# Then verify it
curl -X POST http://localhost:3001/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+226XX123456",
    "code": "123456"
  }'
```

**Expected Response** (200):
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Téléphone vérifié avec succès",
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "phone": "+226XX123456",
    "role": "PATIENT",
    "isVerified": true
  }
}
```

**What Happens**:
✅ Code checked against stored OTP
✅ Expiration verified (not expired)
✅ Attempts counted (max 5 wrong attempts)
✅ Code marked as used (can't reuse)
✅ New user created if doesn't exist
✅ JWT tokens generated

### Test 3: Wrong OTP Code

```bash
curl -X POST http://localhost:3001/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+226XX123456",
    "code": "999999"
  }'
```

**Expected Response** (400):
```json
{
  "statusCode": 400,
  "message": "Code incorrect. 4 tentatives restantes."
}
```

### Test 4: OTP Expiration

```bash
# Request OTP
curl -X POST http://localhost:3001/api/v1/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+226XX123456"}'

# Wait 10+ minutes, then try to verify
curl -X POST http://localhost:3001/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+226XX123456",
    "code": "123456"
  }'
```

**Expected Response** (400):
```json
{
  "statusCode": 400,
  "message": "OTP expiré. Veuillez en demander un nouveau."
}
```

### Test 5: Passwordless Login

**Endpoint**: `POST /auth/login-otp`

```bash
# Step 1: Request login OTP
curl -X POST http://localhost:3001/api/v1/auth/request-login-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+226XX123456"}'

# Step 2: Verify login code (from SMS or console)
curl -X POST http://localhost:3001/api/v1/auth/login-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+226XX123456",
    "code": "123456"
  }'
```

**Expected Response**:
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Connecté avec succès",
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc..."
}
```

### Test 6: Rate Limiting

```bash
# Request OTP 4 times for same phone in 1 hour
for i in {1..4}; do
  curl -X POST http://localhost:3001/api/v1/auth/request-otp \
    -H "Content-Type: application/json" \
    -d '{"phoneNumber": "+226XX123456"}'
done

# Fourth request should fail
```

**Expected Response** (400):
```json
{
  "statusCode": 400,
  "message": "Trop de demandes OTP. Veuillez réessayer dans 1 heure."
}
```

---

## USSD Testing

### Test 1: Initial USSD Request (Main Menu)

**Endpoint**: `POST /ussd/test`

```bash
curl -X POST http://localhost:3001/api/v1/ussd/test \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+226XX123456",
    "text": "",
    "sessionId": "session-001"
  }'
```

**Expected Response**:
```json
{
  "message": "CON Bienvenue FasoCare 🇧🇫\n\n1. My Health Record\n2. Book Appointment\n3. Pharmacy\n4. Report Symptoms\n5. SOS Emergency\n0. Exit"
}
```

### Test 2: Health Record Menu (1)

```bash
curl -X POST http://localhost:3001/api/v1/ussd/test \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+226XX123456",
    "text": "1",
    "sessionId": "session-001"
  }'
```

**Expected Response**:
```json
{
  "message": "CON Health Record:\n\n1. Vaccination\n2. My Appointments\n3. Active Prescriptions\n4. Back"
}
```

### Test 3: Vaccination Status (1*1)

```bash
curl -X POST http://localhost:3001/api/v1/ussd/test \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+226XX123456",
    "text": "1*1",
    "sessionId": "session-001"
  }'
```

**Expected Response**:
```json
{
  "message": "END VACCINATION\n\nLast vaccine:\nPolio\n\nDate: 15/01/2024\n\nNext dose: 15/02/2024"
}
```

### Test 4: Appointment Booking (2)

```bash
# Step 1: Select facility
curl -X POST http://localhost:3000/ussd/test \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+226XX123456",
    "text": "2",
    "sessionId": "session-002"
  }'

# Response: CON with facility options

# Step 2: Select specialist
curl -X POST http://localhost:3000/ussd/test \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+226XX123456",
    "text": "2*1",
    "sessionId": "session-002"
  }'

# Response: CON with specialist options

# Step 3: Select date
curl -X POST http://localhost:3000/ussd/test \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+226XX123456",
    "text": "2*1*1",
    "sessionId": "session-002"
  }'

# Response: CON with date options

# Step 4: Confirm booking
curl -X POST http://localhost:3000/ussd/test \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+226XX123456",
    "text": "2*1*1*1",
    "sessionId": "session-002"
  }'
```

**Final Response**:
```json
{
  "message": "END APPOINTMENT CONFIRMED ✅\n\nFacility: CSPS Pissy\nSpecialist: General Practitioner\nDate: Tomorrow\n\nYou will receive a confirmation SMS.\nReference Code: AP123456"
}
```

### Test 5: Emergency SOS (5)

```bash
curl -X POST http://localhost:3000/ussd/test \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+226XX123456",
    "text": "5",
    "sessionId": "session-003"
  }'
```

**Expected Response**:
```json
{
  "message": "END 🚨 SOS ALERT\n\nEmergency team notified.\nYour location: [Phone-based GPS]\n\nStay calm. Help arriving.\n\nCall 112 immediately."
}
```

### Test 6: Report Symptoms (4)

```bash
curl -X POST http://localhost:3000/ussd/test \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+226XX123456",
    "text": "4*1*1",
    "sessionId": "session-004"
  }'
```

**Expected Response**:
```json
{
  "message": "END SYMPTOMS REPORTED ✅\n\nReference: SY20240115001\n\nHealth authorities will contact you."
}
```

### Test 7: USSD Session Timeout

```bash
# Session expires after 10 minutes of inactivity
# Old session ID won't be found, new session starts

curl -X POST http://localhost:3000/ussd/test \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+226XX123456",
    "text": "1*1",
    "sessionId": "old-session-id-from-10min-ago"
  }'

# Response: will treat as main menu (empty text)
```

### Test 8: Multiple Users (Concurrent Sessions)

```bash
# Simulate 3 different users interacting simultaneously

# User 1
curl -X POST http://localhost:3000/ussd/test \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+226XX111111",
    "text": "1",
    "sessionId": "session-user1"
  }'

# User 2
curl -X POST http://localhost:3000/ussd/test \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+226XX222222",
    "text": "2",
    "sessionId": "session-user2"
  }'

# User 3
curl -X POST http://localhost:3000/ussd/test \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+226XX333333",
    "text": "4*1",
    "sessionId": "session-user3"
  }'
```

**Verification**: Each user's session maintained independently

---

## Integration Testing

### Test 1: OTP → Login → USSD Flow

```bash
# Step 1: User requests OTP
curl -X POST http://localhost:3000/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+226XX123456"}'

# Step 2: User verifies OTP and gets access token
OTP_RESPONSE=$(curl -X POST http://localhost:3000/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+226XX123456",
    "code": "123456"
  }')

ACCESS_TOKEN=$(echo $OTP_RESPONSE | jq -r '.access_token')

# Step 3: User uses token to access protected endpoints
curl -X GET http://localhost:3000/stats/dashboard \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

### Test 2: USSD → Data Retrieval

```bash
# Start USSD session to request vaccination info
curl -X POST http://localhost:3000/ussd/test \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+226XX123456",
    "text": "1*1",
    "sessionId": "session-vax"
  }'

# Verify backend fetched real vaccination data from database
# Expected: Last vaccination date from DB, not hardcoded
```

---

## Load Testing

### Simulate 100 Concurrent USSD Users

```bash
#!/bin/bash

echo "Starting load test with 100 users..."

for i in {1..100}; do
  PHONE="+226XX$(printf '%06d\n' $((100000 + i)))"
  SESSION="session-$i"
  
  curl -X POST http://localhost:3000/ussd/test \
    -H "Content-Type: application/json" \
    -d "{
      \"phoneNumber\": \"$PHONE\",
      \"text\": \"1\",
      \"sessionId\": \"$SESSION\"
    }" &
done

wait
echo "Load test completed"
```

**Expected**: All requests return <500ms response time

---

## SMS Testing (Development Mode)

### Verify SMS Logs

When SMS is sent in development (no Africa's Talking API key):

```bash
# Check backend logs
npm run start:dev | grep "SMS"

# Expected output:
# SMS (TEST MODE): To +226XX123456 - Your FasoCare verification code is: 123456
```

### Real SMS Testing (with API Key)

1. **Get API Key**: https://africastalking.com/sms/sandbox
2. **Update .env**:
   ```
   AFRICA_TALKING_API_KEY=your_real_api_key
   AFRICA_TALKING_USERNAME=your_username
   ```
3. **Test SMS**:
   ```bash
   curl -X POST http://localhost:3000/auth/request-otp \
     -H "Content-Type: application/json" \
     -d '{"phoneNumber": "+226XX123456"}'
   
   # SMS should arrive on your phone within 1 second
   ```

---

## Troubleshooting

### Issue: "Number unknown" in USSD

**Cause**: User not registered in database

**Solution**:
```bash
# First time users should receive:
# "END Number unknown. Register via FasoCare app or nearest CSPS."

# Then:
1. Download FasoCare app
2. Register with phone number + password
3. Try USSD again
```

### Issue: OTP Code Not Received

**Possible Causes**:
1. Running in development mode (SMS not actually sent)
   - Check backend console logs for code
   - Use that code to verify
   
2. Wrong phone number format
   - Use E.164 format: +226XXXXXXXX
   - Or: 0XXXXXXXX (will be normalized)

3. Exceeded rate limit (3 OTPs/hour)
   - Wait 1 hour or use different phone number

**Solution**:
```bash
# Check OTP service logs
npm run start:dev | grep OTP

# Expected:
# OTP Generated: Phone=+226XX123456, Purpose=PHONE_VERIFICATION, Code=123456
```

### Issue: USSD Session Not Found

**Cause**: Session expired (10 minutes) or wrong sessionId

**Solution**: Use new sessionId or check session timeout logic

```bash
# Verify session cleanup runs
npm run start:dev | grep "cleanup\|expir"
```

### Issue: SMS Service Not Working

**Cause**: Africa's Talking API key not configured

**Solution**:
1. Get API key: https://africastalking.com
2. Update `.env`:
   ```
   AFRICA_TALKING_API_KEY=your_key
   AFRICA_TALKING_USERNAME=your_username
   ```
3. Restart server: `npm run start:dev`

---

## Performance Metrics

### Expected Response Times

| Endpoint | Time | Notes |
|----------|------|-------|
| POST /ussd/test | <100ms | In-memory operations |
| POST /auth/request-otp | <200ms | SMS sent async |
| POST /auth/verify-otp | <150ms | Database lookup |
| POST /ussd/callback | <150ms | Africa's Talking webhook |

### Resource Usage

| Metric | Expected | Notes |
|--------|----------|-------|
| Memory/100 users | <50MB | Session map + OTP storage |
| Concurrent Sessions | 1000+ | Depends on server RAM |
| OTP Cleanup | Every 1 min | Removes expired codes |

---

## Monitoring

### Check Service Health

```bash
# USSD health
curl http://localhost:3000/health

# Expected:
# { "status": "ok", "timestamp": "2024-01-15T10:00:00Z" }
```

### View Active Sessions

```bash
# Backend logs should show:
# Session created: session-001
# Session cleaned: session-001 (expired)
```

### Database Verification

```sql
-- Check users created via OTP
SELECT phone, role, is_verified, created_at 
FROM users 
WHERE is_verified = true 
ORDER BY created_at DESC 
LIMIT 10;
```

---

## Next Steps

1. **Mobile Integration**: Test USSD from actual phone
2. **Africa's Talking Live**: Switch to production credentials
3. **Analytics**: Track USSD usage patterns
4. **Optimization**: Cache frequent queries (vaccination status, nearby pharmacies)

---

**Last Updated**: January 2024
**Version**: 1.0
**Status**: Ready for Testing
