# 🧪 WEEK 1 TESTING GUIDE - API Verification

**Purpose**: Verify all new endpoints are working correctly  
**Time**: ~30 minutes for full test suite

---

## 📋 Prerequisites

```bash
# 1. Database running
docker compose up -d

# 2. Both servers running in separate terminals
cd backend && npm run start:dev   # Terminal 1
npm run dev                        # Terminal 2 (frontend)

# 3. Have a valid JWT token from authentication
# Login at http://localhost:3000/login and grab token from localStorage
```

---

## 🔑 Getting a Test Token

### Option A: From Browser
```javascript
// Open browser console at http://localhost:3000/login after login
localStorage.getItem('access_token')   // Copy this value
localStorage.getItem('refresh_token')  // Backup token
```

### Option B: Via API
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "+226XXXXXXXXX", "password": "password"}'

# Response will include:
# {
#   "access_token": "eyJhbGciOiJIUzI1...",
#   "refresh_token": "eyJhbGciOiJIUzI1..."
# }
```

---

## ✅ Test Cases

### 1️⃣ STATS ENDPOINTS (Dashboard Data)

#### `GET /stats/dashboard` - All KPIs
```bash
TOKEN="your_jwt_token"

curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/v1/stats/dashboard
```

**Expected Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "data": {
    "citizens": 42,
    "vaccinationRate": 84.2,
    "consultations": 15,
    "stockAlerts": 3,
    "trends": {
      "citizens": "+12%",
      "vaccination": "+5.4%",
      "consultations": "+18%",
      "alerts": "-2%"
    }
  }
}
```

**In Frontend**: Dashboard at `http://localhost:3000/admin/dashboard` should display these values

---

#### `GET /stats/citizens` - Citizen Count
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/v1/stats/citizens
```

**Expected:** `{ "statusCode": 200, "data": { "count": 42 } }`

---

#### `GET /stats/vaccination` - Vaccination Rate
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/v1/stats/vaccination
```

**Expected:** `{ "statusCode": 200, "data": { "rate": 84.2 } }`

---

#### `GET /stats/consultations` - Consultations
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/v1/stats/consultations
```

**Expected:** `{ "statusCode": 200, "data": { "count": 15 } }`

---

#### `GET /stats/stock-alerts` - Low Stock Alerts
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/v1/stats/stock-alerts
```

**Expected:** `{ "statusCode": 200, "data": { "count": 3 } }`

---

### 2️⃣ USERS ENDPOINTS

#### `GET /users?search=name` - List Users
```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3001/api/v1/users?search=&limit=10"
```

**Expected Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid-1",
        "name": "Dr. John Doe",
        "email": "john@example.com",
        "phone": "+226XXXXXXXXX",
        "role": "DOCTOR",
        "status": "active",
        "establishment": "CMA Koudougou",
        "createdAt": "2026-01-15T10:30:00Z"
      }
    ],
    "total": 1
  }
}
```

**In Frontend**: Users page at `http://localhost:3000/admin/users` should show this list

---

#### `POST /users/:id/validate` - Validate User
```bash
USERID="user-uuid-here"

curl -X POST -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/v1/users/$USERID/validate
```

**Expected:** `{ "statusCode": 200, "success": true, "data": { ...updatedUser } }`

---

#### `POST /users/:id/suspend` - Suspend User
```bash
curl -X POST -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/v1/users/$USERID/suspend
```

**Expected:** `{ "statusCode": 200, "success": true }`

---

### 3️⃣ MEDICAL ENDPOINTS (NEW)

#### `GET /medical/consultations` - List All Consultations
```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3001/api/v1/medical/consultations?limit=10"
```

**Expected Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "data": {
    "consultations": [
      {
        "id": "consult-uuid",
        "patientId": "patient-uuid",
        "patientName": "Josias Kaboré",
        "doctorId": "doctor-uuid",
        "doctorName": "Dr. Marc Ouédraogo",
        "date": "2026-01-20",
        "reason": "Malaria screening",
        "diagnosis": "Malaria positive",
        "prescription": "Artemether 80mg x3",
        "status": "completed",
        "createdAt": "2026-01-20T15:30:00Z"
      }
    ],
    "total": 5
  }
}
```

**In Frontend**: Medical page at `http://localhost:3000/admin/medical` should show these consultations

---

#### `GET /medical/consultations/:id` - Get Single Consultation
```bash
CONSULTID="consultation-uuid"

curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/v1/medical/consultations/$CONSULTID
```

**Expected:** Single consultation object with same fields

---

#### `GET /medical/patients/:patientId/history` - Patient Medical History
```bash
PATIENTID="patient-uuid"

curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/v1/medical/patients/$PATIENTID/history
```

**Expected:** Array of all consultations for that patient

---

### 4️⃣ NOTIFICATIONS ENDPOINTS

#### `GET /notifications?limit=5` - List Notifications
```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3001/api/v1/notifications?limit=5&unreadOnly=false"
```

**Expected Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif-uuid",
        "type": "alert",
        "title": "Stock Alert",
        "message": "Low stock at CSPS Pissy",
        "timestamp": "2026-01-21T10:15:00Z",
        "read": false
      }
    ],
    "total": 3
  }
}
```

**In Frontend**: Dashboard shows these in "Flux National" section

---

#### `POST /notifications/:id/read` - Mark as Read
```bash
NOTIFID="notification-uuid"

curl -X POST -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/v1/notifications/$NOTIFID/read
```

**Expected:** `{ "statusCode": 200, "success": true }`

---

#### `POST /notifications/read-all` - Mark All Read
```bash
curl -X POST -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/v1/notifications/read-all
```

**Expected:** `{ "statusCode": 200, "success": true }`

---

## 🧪 Frontend Integration Tests

### Test 1: Login and Dashboard
```
1. Navigate to http://localhost:3000/login
2. Enter credentials
3. Should redirect to dashboard
4. Dashboard should show:
   ✅ Real KPI values (not "1,245,600")
   ✅ Loading spinner briefly shows
   ✅ Numbers format correctly 
   ✅ Trends show with +/- icons
```

### Test 2: Users Page
```
1. Click "Accréditations 🔐" or navigate to /admin/users
2. Should show list of real users
3. Search box filters by name/email/establishment
4. Hover shows Validate/Suspend buttons
5. Click Validate → toast appears
6. User status changes after action
```

### Test 3: Medical History
```
1. Navigate to /admin/medical
2. Should show list of consultations
3. Each consultation shows:
   ✅ Patient name
   ✅ Doctor name
   ✅ Date
   ✅ Reason and Diagnosis
   ✅ Prescription (if exists)
4. Search filters by patient/doctor/reason
5. Status badge shows correct style
```

### Test 4: Error Handling
```
1. Stop backend server
2. Refresh dashboard
3. Should show error message with "Réessayer" button
4. Click Réessayer → Wait for reconnect
5. Data loads once backend is back up
```

---

## 🚀 Troubleshooting

### Issue: 401 Unauthorized
**Solution**: 
- Server asking for authentication
- Get new JWT token from login
- Pass in `Authorization: Bearer <token>` header

### Issue: Empty arrays/null values
**Solution**:
- Database doesn't have seed data yet
- Add test data via Swagger UI or direct DB insert
- Or the entities don't have data populated

### Issue: TypeError "Cannot read property X"
**Solution**:
- API response format mismatch
- Check if API is returning `data: { consultations: [] }` or just `[]`
- Verify API type definitions in `lib/api.ts`

### Issue: CORS errors
**Solution**:
- Backend CORS not set for frontend URL
- Check backend `main.ts` has CORS enabled
- Verify `NEXT_PUBLIC_API_URL` matches backend port

---

## 📊 Quick Check:  Full Health Status

```bash
#!/bin/bash
TOKEN="your_token_here"

echo "=== STATS ==="
curl -s -H "Auth: Bearer $TOKEN" http://localhost:3001/api/v1/stats/dashboard | jq '.data | keys'

echo "=== USERS ==="
curl -s -H "Auth: Bearer $TOKEN" http://localhost:3001/api/v1/users | jq '.data.users | length'

echo "=== CONSULTATIONS ==="
curl -s -H "Auth: Bearer $TOKEN" http://localhost:3001/api/v1/medical/consultations | jq '.data.consultations | length'

echo "=== NOTIFICATIONS ==="
curl -s -H "Auth: Bearer $TOKEN" http://localhost:3001/api/v1/notifications | jq '.data.notifications | length'
```

---

## ✅ Success Criteria

All 4 endpoint groups working:
- [ ] Stats endpoints returning real numbers
- [ ] Users endpoints listing actual users
- [ ] Medical endpoints showing consultations
- [ ] Notifications endpoints listing alerts

All 4 frontend pages working:
- [ ] Dashboard displays real KPIs
- [ ] Users table shows real users
- [ ] Medical page shows consultations
- [ ] Error states display correctly

---

**Next**: Add test data to database for verification  
**Alternative**: Run `docker compose up -d && npm run migration:run` to seed initial data
