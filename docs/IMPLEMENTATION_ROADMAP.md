# 🎯 FASO-CARE - IMPLEMENTATION ROADMAP (IMMEDIATE FIXES)

**Status**: 🔴 **CRITICAL PHASE**  
**Timeline**: Next 4 weeks  
**Team Velocity**: 1 developer (~20hrs/week)

---

## 🚀 WEEK 1: Frontend-Backend Connection (HIGHEST PRIORITY)

### Goal: Make Dashboard Display Real Data

```
BEFORE:                          AFTER:
┌─────────────────────┐         ┌─────────────────────┐
│ Citizens: 1,245,600 │         │ Citizens: 1,241,892 │ ✅ Real data
│ Vaccination: 84.2%  │         │ Vaccination: 84.2%  │ ✅ From API
│ Consultations: 342  │         │ Consultations: 342  │ ✅ Live count
└─────────────────────┘         └─────────────────────┘
❌ Hardcoded                    ✅ Connected
```

### Tasks

#### Task 1.1: Setup API Client [2 hours]
```bash
# In /app or /components/

apps/
├── config/
│   └── api.ts                 # NEW: API configuration
│       ├─ baseURL: 'http://localhost:3001/api/v1'
│       ├─ timeout: 10000
│       └─ headers: {Authorization: `Bearer ${token}`}
└── hooks/
    └── useApi.ts              # NEW: Data fetching hook
        ├─ useCitizensStats()
        ├─ useVaccinationStats()
        └─ useConsultationStats()
```

**Code to Create**:
```typescript
// lib/api.ts
import axios from 'axios'

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
  timeout: 10000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('access_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)
```

#### Task 1.2: Remove Hardcoded Dashboard Data [1 hour]

**File**: `/app/admin/dashboard/page.tsx`

```typescript
// REMOVE THIS:
const DASHBOARD_DATA = {
  citizens: "1,245,600",
  vaccination: "84.2%",
  consultations: "342",
}

// REPLACE WITH:
'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    api.get('/stats/dashboard')
      .then(res => setStats(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])
  
  return (
    <div>
      {loading ? <div>Loading...</div> : (
        <>
          <KpiCard title="Citizens" value={stats?.citizens} />
          <KpiCard title="Vaccination Rate" value={stats?.vaccinationRate} />
          <KpiCard title="Consultations" value={stats?.consultations} />
        </>
      )}
    </div>
  )
}
```

#### Task 1.3: Connect Users Table to API [1.5 hours]

**File**: `/app/admin/users/page.tsx`

```typescript
// REMOVE:
const INITIAL_USERS = [
  { id: '1', name: 'Dr. Ouédraogo', role: 'DOCTOR', status: 'active' },
  // ...
]

// REPLACE WITH:
'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  
  useEffect(() => {
    api.get('/users', {
      params: { search, limit: 100 }
    })
    .then(res => setUsers(res.data.users))
    .catch(err => toast.error('Failed to fetch users'))
  }, [search])
  
  return (
    <div>
      <input 
        onChange={(e) => setSearch(e.target.value)} 
        placeholder="Search users..."
      />
      <table>
        {users.map(user => (
          <tr key={user.id}>
            <td>{user.name}</td>
            <td>{user.role}</td>
            <td>{user.status}</td>
          </tr>
        ))}
      </table>
    </div>
  )
}
```

#### Task 1.4: Create Medical History Page [2 hours]

**File**: `/app/admin/medical/page.tsx` (NEW)

```typescript
'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

export default function MedicalHistoryPage() {
  const [consultations, setConsultations] = useState([])
  
  useEffect(() => {
    api.get('/medical/consultations')
      .then(res => setConsultations(res.data))
  }, [])
  
  return (
    <div>
      <h1>Medical Consultations</h1>
      {consultations.map(c => (
        <div key={c.id} className="border p-4 mb-2">
          <p><b>Date:</b> {c.date}</p>
          <p><b>Doctor:</b> {c.doctorName}</p>
          <p><b>Reason:</b> {c.reason}</p>
          <p><b>Diagnosis:</b> {c.diagnosis}</p>
          <p><b>Prescription:</b> {c.prescription}</p>
        </div>
      ))}
    </div>
  )
}
```

#### Task 1.5: Add Loading & Error States [1.5 hours]

```typescript
// Create /components/LoadingState.tsx
export function LoadingState() {
  return <div className="animate-spin">⚙️ Loading...</div>
}

// Create /components/ErrorState.tsx
export function ErrorState({ message }) {
  return <div className="text-red-600 p-4">{message}</div>
}

// Use in pages:
{loading && <LoadingState />}
{error && <ErrorState message={error.message} />}
{!loading && !error && <div>Content...</div>}
```

#### Task 1.6: Test Dashboard Endpoints [1 hour]

```bash
# First, verify backend is running:
cd backend && npm run start

# Test in browser:
curl -H "Authorization: Bearer <token>" \
  http://localhost:3001/api/v1/stats/dashboard

# Expected response:
{
  "citizens": 1241892,
  "vaccinationRate": 84.2,
  "consultations": 342,
  "alertCount": 14
}

# Test users endpoint:
curl -H "Authorization: Bearer <token>" \
  http://localhost:3001/api/v1/users?limit=100

# Expected response:
{
  "users": [
    { "id": "...", "name": "...", "role": "...", "status": "..." }
  ],
  "total": 3
}
```

### Deliverables by End of Week 1:
- ✅ API client setup
- ✅ Dashboard showing real KPIs
- ✅ Users table connected
- ✅ Medical history page working
- ✅ Loading/error states shown

### Time Budget: **10 hours**

---

## 🚀 WEEK 2: Mobile & USSD Foundation

### Goal: App Can Be Navigated & Accepts USSD Requests

#### Task 2.1: React Navigation Setup [2 hours]

```bash
npm install @react-navigation/native @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context
```

**File**: `/mobile/src/navigation/MainNavigator.tsx` (NEW)

```typescript
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { HomeScreen } from '../screens/Home/HomeScreen'
import { MedicalScreen } from '../screens/Medical/MedicalScreen'
import { PharmacyScreen } from '../screens/Pharmacy/PharmacyScreen'
import { ProfileScreen } from '../screens/Profile/ProfileScreen'

const Tab = createBottomTabNavigator()

export function MainNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarLabelPosition: 'below-icon',
          tabBarActiveTintColor: '#0d6e3f',
          headerShown: false,
        }}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeScreen}
          options={{
            tabBarIcon: ({ color }) => <HomeIcon color={color} />,
          }}
        />
        <Tab.Screen 
          name="Medical" 
          component={MedicalScreen}
          options={{
            tabBarIcon: ({ color }) => <HeartIcon color={color} />,
          }}
        />
        <Tab.Screen 
          name="Pharmacy" 
          component={PharmacyScreen}
          options={{
            tabBarIcon: ({ color }) => <PillIcon color={color} />,
          }}
        />
        <Tab.Screen 
          name="Profile" 
          component={ProfileScreen}
          options={{
            tabBarIcon: ({ color }) => <UserIcon color={color} />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  )
}
```

#### Task 2.2: Implement USSD Endpoints [3 hours]

**File**: `/backend/src/ussd/ussd.controller.ts`

```typescript
import { Controller, Post, Body } from '@nestjs/common'
import { UssdService } from './ussd.service'

@Controller('ussd')
export class UssdController {
  constructor(private ussdService: UssdService) {}

  @Post('callback')
  async handleUssdCallback(@Body() body: {
    sessionId: string
    phoneNumber: string
    text: string
    serviceCode: string
  }) {
    return this.ussdService.handleUssdRequest(
      body.phoneNumber,
      body.text,
      body.sessionId
    )
  }

  @Post('sms/callback')
  async handleSmsCallback(@Body() body: {
    from: string
    text: string
  }) {
    return this.ussdService.handleSmsCallback(body.from, body.text)
  }
}
```

**File**: `/backend/src/ussd/ussd.service.ts`

```typescript
import { Injectable } from '@nestjs/common'
import { AfricasTalkingService } from '../common/services/africas-talking.service'

@Injectable()
export class UssdService {
  constructor(private apigateway: AfricasTalkingService) {}

  async handleUssdRequest(
    phoneNumber: string,
    text: string,
    sessionId: string
  ): Promise<string> {
    const input = text.trim()

    if (input === '') {
      // Main menu
      return this.getMainMenu()
    } else if (input === '1') {
      // My Health
      return this.getHealthMenu()
    } else if (input === '2') {
      // Appointments
      return this.getAppointmentsMenu(phoneNumber)
    } else if (input === '3') {
      // Pharmacy
      return this.getPharmacyMenu()
    } else if (input === '4') {
      // Report Symptoms
      return this.getSymptomReportMenu()
    }

    return "Invalid input. Try again."
  }

  private getMainMenu(): string {
    return `FasoCare
1. My Health Records
2. Book Appointment
3. Get Medicines
4. Report Symptoms
0. Exit`
  }

  private getHealthMenu(): string {
    return `Your Health Records
1. Vaccinations
2. Medical History
3. Lab Results
0. Back`
  }

  private async getAppointmentsMenu(phoneNumber: string): Promise<string> {
    return `Appointments
1. Next Appointment
2. Available Doctors
3. Cancel Appointment
0. Back`
  }

  private getPharmacyMenu(): string {
    return `Pharmacies
1. Find Nearby
2. My Prescriptions
3. Refill Medicine
0. Back`
  }

  private getSymptomReportMenu(): string {
    return `Report Symptoms
Please describe:
(Your response will be reviewed)`
  }

  async handleSmsCallback(from: string, text: string): Promise<void> {
    // Handle SMS responses (OTP, confirmations, etc)
    console.log(`SMS from ${from}: ${text}`)
  }
}
```

#### Task 2.3: OTP SMS Flow [2 hours]

**File**: `/backend/src/auth/otp.service.ts` (NEW)

```typescript
import { Injectable } from '@nestjs/common'
import { AfricasTalkingService } from '../common/services/africas-talking.service'

@Injectable()
export class OtpService {
  constructor(private at: AfricasTalkingService) {}

  async sendOtp(phoneNumber: string): Promise<string> {
    const otp = Math.random().toString().slice(2, 8)
    
    await this.at.sendSms({
      recipients: [phoneNumber],
      message: `FasoCare OTP: ${otp}. Valid for 10 minutes.`,
    })

    // Store OTP in Redis with 10min expiry
    await this.storeOtpInRedis(phoneNumber, otp)
    
    return otp
  }

  async verifyOtp(phoneNumber: string, otp: string): Promise<boolean> {
    const stored = await this.getOtpFromRedis(phoneNumber)
    return stored === otp
  }

  private async storeOtpInRedis(phone: string, otp: string) {
    // Implementation with redis client
  }

  private async getOtpFromRedis(phone: string): Promise<string | null> {
    // Implementation with redis client
  }
}
```

#### Task 2.4: Test USSD Locally [1 hour]

```bash
# Using simulator from script/simulate-ussd.js
node scripts/simulate-ussd.js +226 70123456

# Expected output:
"FasoCare
1. My Health Records
2. Book Appointment
3. Get Medicines
4. Report Symptoms
0. Exit"

# Test pressing 1:
node scripts/simulate-ussd.js +226 70123456 "1"

# Expected:
"Your Health Records
1. Vaccinations
2. Medical History
3. Lab Results
0. Back"
```

### Deliverables by End of Week 2:
- ✅ React Navigation setup
- ✅ Mobile app navigable (can switch tabs)
- ✅ USSD main menu working
- ✅ OTP SMS sending
- ✅ Basic USSD flow tested

### Time Budget: **8 hours**

---

## 🚀 WEEK 3: Offline Sync & State Management

### Goal: App Works Without Internet

#### Task 3.1: Redux Setup [2 hours]

```bash
npm install @reduxjs/toolkit react-redux redux-persist
```

**File**: `/mobile/src/store/store.ts` (NEW)

```typescript
import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import AsyncStorage from '@react-native-async-storage/async-storage'
import authReducer from './slices/authSlice'
import medicalReducer from './slices/medicalSlice'
import pharmacyReducer from './slices/pharmacySlice'

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'medical', 'pharmacy'],
}

const persistedReducer = persistReducer(persistConfig, combineReducers({
  auth: authReducer,
  medical: medicalReducer,
  pharmacy: pharmacyReducer,
}))

export const store = configureStore({
  reducer: persistedReducer,
})

export const persistor = persistStore(store)
```

#### Task 3.2: Offline Detection [1 hour]

**File**: `/mobile/src/hooks/useNetworkStatus.ts` (NEW)

```typescript
import { useEffect, useState } from 'react'
import NetInfo from '@react-native-community/netinfo'

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? true)
    })

    return () => unsubscribe()
  }, [])

  return isOnline
}
```

#### Task 3.3: Differential Sync [2 hours]

**File**: `/mobile/src/sync/syncEngine.ts` (NEW)

```typescript
import { api } from '../config/api'
import { store } from '../store/store'

export class SyncEngine {
  private syncQueue = []
  private lastSyncTime = 0

  async sync() {
    const isOnline = await this.checkNetworkStatus()
    if (!isOnline) {
      console.log('Offline - queuing changes')
      return
    }

    console.log('Online - syncing...')
    
    // Upload pending changes
    await this.uploadPendingChanges()
    
    // Download fresh data
    await this.downloadLatestData()
    
    this.lastSyncTime = Date.now()
  }

  private async uploadPendingChanges() {
    for (const change of this.syncQueue) {
      try {
        await api.post('/sync', change)
        this.syncQueue = this.syncQueue.filter(c => c.id !== change.id)
      } catch (err) {
        console.error('Sync failed:', err)
        return
      }
    }
  }

  private async downloadLatestData() {
    const state = store.getState()
    const timestamp = this.lastSyncTime

    const consultations = await api.get('/medical/consultations', {
      params: { since: timestamp }
    })
    
    const medicines = await api.get('/pharmacy/medicines', {
      params: { since: timestamp }
    })

    // Update Redux store
    store.dispatch(updateMedical(consultations.data))
    store.dispatch(updatePharmacy(medicines.data))
  }

  private async checkNetworkStatus(): Promise<boolean> {
    // Use NetInfo or similar
    return true
  }
}
```

#### Task 3.4: Service Worker [2 hours]

**File**: `/public/sw.js`

```javascript
const CACHE_NAME = 'fasocare-v1'
const URLS_TO_CACHE = [
  '/',
  '/offline.html',
  '/styles/globals.css',
]

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(URLS_TO_CACHE))
  )
})

self.addEventListener('fetch', event => {
  // Try network first, fallback to cache
  event.respondWith(
    fetch(event.request)
      .catch(() => caches.match(event.request))
  )
})
```

### Deliverables by End of Week 3:
- ✅ Redux state management
- ✅ Offline detection
- ✅ Pending changes queue
- ✅ Sync engine working
- ✅ Service Worker caching

### Time Budget: **7 hours**

---

## 🚀 WEEK 4: Data Encryption

### Goal: Patient PII Protected

#### Task 4.1: Field-Level Encryption [2 hours]

**File**: `/backend/src/common/encryption/field-encryption.ts` (NEW)

```typescript
import * as crypto from 'crypto'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY // 32-byte hex string

export class FieldEncryption {
  private key = Buffer.from(ENCRYPTION_KEY, 'hex')

  encrypt(data: string): string {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv('aes-256-gcm', this.key, iv)
    
    let encrypted = cipher.update(data, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    const authTag = cipher.getAuthTag()
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
  }

  decrypt(data: string): string {
    const [iv, authTag, encrypted] = data.split(':')
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      this.key,
      Buffer.from(iv, 'hex')
    )
    
    decipher.setAuthTag(Buffer.from(authTag, 'hex'))
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  }
}
```

**Use in User Entity**:

```typescript
@Entity()
export class User {
  @Column()
  @Transform(({ value }) => encryption.encrypt(value))
  phone: string

  @Column()
  @Transform(({ value }) => encryption.encrypt(value))
  name: string

  @Column()
  email: string // Not encrypted if not needed
}
```

#### Task 4.2: Database Encryption [1.5 hours]

```sql
-- Enable encryption at rest (PostgreSQL)
CREATE EXTENSION pgcrypto;

-- Create encrypted user view
CREATE VIEW users_public AS
SELECT
  id,
  pgp_sym_decrypt(phone_encrypted, 'password')::text as phone,
  pgp_sym_decrypt(name_encrypted, 'password')::text as name,
  email,
  role,
  created_at
FROM users;
```

#### Task 4.3: Audit Logging [1 hour]

**File**: `/backend/src/common/audit/audit.service.ts` (NEW)

```typescript
@Injectable()
export class AuditService {
  async logAccess(userId: string, resource: string, action: string) {
    await this.db.audit.create({
      userId,
      resource,
      action,
      timestamp: new Date(),
      ipAddress: // from request
      userAgent: // from request
    })
  }
}
```

#### Task 4.4: Key Rotation Policy [1.5 hours]

**File**: `/backend/src/config/key-rotation.ts` (NEW)

```typescript
// Rotate encryption keys every 90 days
// Require explicit rotation in production

export const KEY_ROTATION_POLICY = {
  rotationInterval: 90 * 24 * 60 * 60 * 1000, // 90 days
  alertBefore: 7 * 24 * 60 * 60 * 1000, // Alert 7 days before
}

// Implementation:
scheduleKeyRotation()
```

### Deliverables by End of Week 4:
- ✅ PII encrypted at rest
- ✅ Database encryption enabled
- ✅ Audit log for data access
- ✅ Key rotation policy enforced

### Time Budget: **6 hours**

---

## 📊 Overall Progress Tracking

```
Week 1 (10h): Frontend-Backend
├─ [ ] API client setup
├─ [ ] Dashboard real data
├─ [ ] Users table connected
├─ [ ] Medical history page
└─ [ ] Testing all endpoints

Week 2 (8h): Mobile & USSD
├─ [ ] React Navigation
├─ [ ] USSD main menu
├─ [ ] OTP SMS flow
├─ [ ] Mobile tabs
└─ [ ] Local USSD testing

Week 3 (7h): Offline Sync
├─ [ ] Redux store
├─ [ ] Network status
├─ [ ] Sync engine
├─ [ ] Service worker
└─ [ ] Test offline mode

Week 4 (6h): Encryption
├─ [ ] Field-level encryption
├─ [ ] Database encryption
├─ [ ] Audit logging
└─ [ ] Key rotation

TOTAL: 31 hours (1.5 weeks for experienced dev)
```

---

## 🎯 Success Metrics

By end of 4 weeks, you should have:

- ✅ Dashboard displays REAL data from API
- ✅ Mobile app is navigable with 5 working screens
- ✅ USSD accepts requests and returns menus
- ✅ App works offline with sync when online
- ✅ Patient PII encrypted

---

**Document Version**: 1.0  
**Last Updated**: 11 Avril 2026  
**Owner**: Development Team
