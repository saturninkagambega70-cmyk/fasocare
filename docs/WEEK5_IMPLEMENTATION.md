# Week 5: USSD, OTP, and Performance Validation

## Objective
Prepare FasoCare for hard testing on the channels that matter most in production:
- USSD navigation for low-connectivity users
- OTP issuance and verification flows
- rate limiting behavior under repeated requests
- API responsiveness under 100+ concurrent users
- mobile battery and memory verification during extended usage

## Deliverables Added

### Automated backend coverage
- `backend/src/ussd/ussd.service.spec.ts`
  - main menu
  - unknown phone handling
  - vaccination lookup
  - consultation summary
  - appointment confirmation flow
  - invalid option fallback
- `backend/src/telecom/otp.service.spec.ts`
  - OTP generation and verification
  - per-phone request throttling
  - OTP expiry
  - failed-attempt lockout
  - expired record cleanup

### Operator-style test scripts
- `scripts/simulate-ussd.js`
  - simulates a gateway calling `POST /api/v1/ussd/callback`
  - covers anonymous, dossier santé, appointment, and health report flows
- `scripts/load-test.js`
  - runs configurable concurrent HTTP traffic without extra dependencies
  - defaults to `GET /api/v1/health`
  - reports success count, failures, average latency, P50, P95, P99

### Convenience commands
- Root:
  - `npm run test:ussd`
  - `npm run test:load`
- Backend:
  - `npm run test:week5`

## How To Run

### 1. Backend functional checks
```bash
cd backend
npm run test:week5
```

### 2. Manual USSD simulation
```bash
# From repo root
npm run test:ussd
```

Optional overrides:
```bash
USSD_API_URL=http://localhost:3001/api/v1/ussd/callback \
USSD_PHONE=+22601010101 \
USSD_SESSION_ID=week5-session \
npm run test:ussd
```

### 3. Load test for 100+ concurrent users
```bash
# From repo root
LOAD_TEST_USERS=100 \
LOAD_TEST_REQUESTS=5 \
LOAD_TEST_URL=http://localhost:3001/api/v1/health \
npm run test:load
```

To test another endpoint:
```bash
LOAD_TEST_USERS=120 \
LOAD_TEST_REQUESTS=10 \
LOAD_TEST_URL=http://localhost:3001/api/v1/ussd/test \
LOAD_TEST_METHOD=POST \
LOAD_TEST_BODY='{"phoneNumber":"+22601010101","text":"","sessionId":"load-001"}' \
npm run test:load
```

## Week 5 Validation Checklist

### USSD menu flows
- `""` shows the main menu
- `1` opens `Mon Dossier Santé`
- `1*1` shows latest vaccination or no-record message
- `1*2` shows most recent consultation
- `2*1*2*3` confirms an appointment
- `4*2` creates a suspected-case report reference
- invalid selections return a `CON Option invalide` fallback

### OTP delivery and verification
- `POST /api/v1/auth/request-otp`
  - returns `201`
  - logs or sends a 6-digit OTP
  - sets a 10-minute validity
- `POST /api/v1/auth/verify-otp`
  - accepts only the latest active OTP for that purpose
  - rejects expired codes
  - rejects reused codes
- `POST /api/v1/auth/request-login-otp`
  - behaves the same but for passwordless login
- `POST /api/v1/auth/login-otp`
  - returns JWT tokens when verification succeeds

### Rate limiting checks
- OTP requests:
  - maximum `3` generated OTPs per phone per rolling hour
- OTP verification:
  - maximum `5` wrong attempts before cancellation
- API throttler:
  - global throttling is controlled by:
```env
RATE_LIMIT_MAX=20
RATE_LIMIT_TTL=60000
```

## Suggested Success Thresholds

### API performance
- Health endpoint average response time under `300 ms` locally
- P95 under `800 ms` for 100 concurrent users on non-DB endpoints
- zero process crashes during the run
- no unbounded memory growth across repeated load runs

### USSD reliability
- responses always start with `CON` or `END`
- no session bleed across different `sessionId` values
- unknown users exit cleanly without stack traces

### OTP reliability
- no OTP accepted after expiry
- no OTP accepted after a successful verification
- no OTP issued beyond the hourly limit for the same phone number

## Mobile Battery and Memory Checks

Run these checks on an Android test device or emulator while exercising login, dashboard refresh, USSD fallback access, and emergency flows:

### Battery
- record a 15-minute active session
- confirm no abnormal background wakeups
- verify network polling is not continuous when screens are idle

### Memory
- navigate repeatedly between dashboard, medical history, pharmacy, and emergency views
- confirm memory stabilizes after garbage collection
- verify images, charts, and polling screens are not leaking listeners or timers

### Recommended commands
```bash
# Android memory snapshot
adb shell dumpsys meminfo <your.package.name>

# Android battery stats
adb shell dumpsys batterystats | head -n 80

# Focused log stream
adb logcat | rg "FasoCare|ReactNative|JS"
```

## Notes
- The load test script is intentionally simple and dependency-free so it can run in CI or on a developer laptop.
- For public staging, run load against non-destructive endpoints first.
- USSD and OTP tests are currently best covered at the service and API layer; provider-level SMS delivery still depends on valid Africa's Talking credentials and network access.
