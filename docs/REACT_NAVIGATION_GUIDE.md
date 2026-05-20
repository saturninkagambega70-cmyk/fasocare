# 📱 React Navigation Setup Guide - FasoCare Mobile

## Overview

**React Navigation** manages all app navigation flows:
- **Auth Stack**: 6 screens for authentication
- **Main Stack**: 4 core tabs for different user roles (Patient, Doctor, Pharmacist, Parent)
- **Modal Stack**: 7 overlay screens for doctor, pharmacy, medical interactions

**Status**: ✅ Fully Configured & Ready

---

## Architecture

### Navigation Hierarchy

```
App (Root)
├─ Auth Stack (when not authenticated)
│  ├─ Welcome
│  ├─ Login (NEW: Password + OTP modes)
│  ├─ Register
│  ├─ OtpVerification (NEW)
│  ├─ ForgotPassword
│  └─ ResetPassword
│
└─ Main Stack (when authenticated)
   ├─ MainTabs (Bottom Tab Navigator - role-based)
   │  ├─ Patient Tabs
   │  │  ├─ Mon QR (Home)
   │  │  ├─ Dossier (Medical Record)
   │  │  └─ Urgences (Emergency)
   │  ├─ Doctor Tabs
   │  │  ├─ Clinique (Dashboard)
   │  │  ├─ Téléconsult. (Consultation)
   │  │  ├─ Messagerie (Messaging)
   │  │  └─ Ordonnances (Prescriptions)
   │  ├─ Pharmacist Tabs
   │  │  ├─ Scanner (QR Scanner)
   │  │  └─ Stocks (Inventory)
   │  └─ Parent Tabs
   │     ├─ Enfants (Children)
   │     └─ Vaccins (Vaccination)
   │
   ├─ Profile (Modal)
   ├─ PrescriptionList (Modal)
   ├─ PharmacyDiscovery (Modal)
   ├─ Meeting (Video Call)
   ├─ PatientRecord (Doctor View)
   └─ EpidemicReport (Reporting)
```

---

## Stack Navigator Configuration

### 1. Auth Stack

**Location**: `mobile/App.js`

```javascript
<Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Welcome">
  <Stack.Screen name="Welcome" component={WelcomeScreen} />
  <Stack.Screen name="Login" component={LoginScreen} />           // Password + OTP
  <Stack.Screen name="Register" component={RegisterScreen} />
  <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
  <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />  // NEW
</Stack.Navigator>
```

**Flow**:
```
Welcome → Login (password or OTP) → OtpVerification (if OTP) → Main App
        └→ Register → Main App
```

### 2. Main App Stack

**Location**: `mobile/src/navigation/AppNavigator.js`

```javascript
<Stack.Navigator>
  <Stack.Screen 
    name="MainTabs" 
    component={RoleTabNavigator}      // Dynamic tabs based on user role
    options={{ headerShown: false }}
  />
  <Stack.Group screenOptions={{ presentation: 'modal' }}>
    <Stack.Screen name="Profile" component={ProfileScreen} />
    <Stack.Screen name="PrescriptionList" component={PrescriptionListScreen} />
    <Stack.Screen name="PharmacyDiscovery" component={PharmacyDiscoveryScreen} />
    {/* ... other modals ... */}
  </Stack.Group>
</Stack.Navigator>
```

### 3. Role-Based Tab Navigator

**Location**: `mobile/src/navigation/RoleTabNavigator.js`

```javascript
// Renders different tabs based on user role
const role = user?.role || 'PATIENT';  // PATIENT | DOCTOR | PHARMACIST | PARENT

if (role === 'PATIENT') {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Mon QR" component={PatientDashboard} />
      <Tab.Screen name="Dossier" component={MedicalRecordScreen} />
      <Tab.Screen name="Urgences" component={EmergencyScreen} />
    </Tab.Navigator>
  );
}
// Similar for DOCTOR, PHARMACIST, PARENT...
```

---

## Authentication Flow (with OTP)

### Traditional Flow (Password Login)

```
1. User clicks "Login"
   ↓
2. Enter phone + password
   ↓
3. POST /auth/login with credentials
   ↓
4. Backend validates password
   ↓
5. If valid: return access_token + user
   ↓
6. Store token in auth store
   ↓
7. Navigate to Main App
```

### New OTP Flow (Passwordless)

```
1. User clicks "Login" → toggles to OTP mode
   ↓
2. Enter phone number only
   ↓
3. Click "Receive OTP"
   ↓
4. POST /auth/request-login-otp with phone
   ↓
5. Backend generates 6-digit code, sends SMS
   ↓
6. Navigate to OtpVerificationScreen
   ↓
7. User receives SMS with code
   ↓
8. Enter 6-digit code
   ↓
9. POST /auth/login-otp with phone + code
   ↓
10. Backend verifies code
    ↓
11. If valid: return access_token + user
    ↓
12. Store token in auth store
    ↓
13. Navigate to Main App
```

### Components

```
LoginScreen
├─ Mode Toggle: "Password" ↔ "OTP"
├─ Phone Input: "+226XXXXXXXX"
└─ Conditional:
   ├─ Password Mode: Password input + Login button
   └─ OTP Mode: OTP button → navigate to OtpVerificationScreen

OtpVerificationScreen
├─ Title: "Vérification OTP"
├─ OTP Input: 6-digit code
├─ Timer: Shows 10-min countdown
├─ Attempt Counter: "5 attempts remaining"
├─ Resend Button: Available after expiry or every 30s
├─ Error Messages: Clear feedback on failures
└─ Verify Button: Confirms OTP
```

---

## Screen Organization

### Authentication Screens (Auth Stack)

| Screen | Purpose | Features |
|--------|---------|----------|
| WelcomeScreen | App intro | Animated onboarding, language selection |
| LoginScreen | User login | Password + OTP modes |
| **OtpVerificationScreen** | OTP input | 6-digit input, timer, attempts, resend |
| RegisterScreen | Account creation | Phone, name, role selection |
| ForgotPasswordScreen | Password recovery | Phone input → SMS |
| ResetPasswordScreen | New password | OTP + new password |

### Patient Screens (Main Stack - Patient Role)

| Tab | Screen | Features |
|-----|--------|----------|
| Mon QR | PatientDashboard | Health summary, QR code, quick actions |
| Dossier | MedicalRecordScreen | Consultations, labs, vaccinations, trends |
| Urgences | EmergencyScreen | SOS button, emergency contacts, alerts |

### Doctor Screens (Main Stack - Doctor Role)

| Tab | Screen | Features |
|-----|--------|----------|
| Clinique | DoctorDashboard | Patient queue, consultations, analytics |
| Téléconsult. | ConsultationScreen | Video calls, chat, prescriptions |
| Messagerie | DoctorMessagingScreen | Patient messages, notifications |
| Ordonnances | PrescriptionScreen | Active prescriptions, QR codes |

### Pharmacist Screens (Main Stack - Pharmacist Role)

| Tab | Screen | Features |
|-----|--------|----------|
| Scanner | PharmacyScannerScreen | QR scan, prescription validation |
| Stocks | InventoryScreen | Stock levels, low-stock alerts |

### Parent Screens (Main Stack - Parent Role)

| Tab | Screen | Features |
|-----|--------|----------|
| Enfants | ParentDashboard | Child list, health summary |
| Vaccins | VaccineBookScreen | Vaccination schedule, reminders |

### Modal Screens (Overlays)

| Screen | Purpose | Trigger |
|--------|---------|---------|
| Profile | User profile | Tap account icon in tabs |
| PrescriptionList | Prescription details | Tap prescription item |
| PharmacyDiscovery | Find pharmacies | "Find pharmacy" button |
| Meeting | Video consultation | Join video call |
| PatientRecord | Patient details | Doctor views patient |
| EpidemicReport | Report symptoms | "Report" button |

---

## API Integration

### Authentication APIs

**Used in Mobile**:
```javascript
// New OTP endpoints (Week 2)
authService.requestLoginOtp(phoneNumber)    // POST /auth/request-login-otp
authService.loginWithOtp(phoneNumber, code) // POST /auth/login-otp
authService.requestOtp(phoneNumber)         // POST /auth/request-otp
authService.verifyOtp(phoneNumber, code)    // POST /auth/verify-otp

// Traditional endpoints
authService.login(phone, password)          // POST /auth/login
authService.register(...)                   // POST /auth/register
authService.forgotPassword(phone)           // POST /auth/forgot-password
authService.resetPassword(phone, otp, pass) // POST /auth/reset-password
```

**Request Headers** (Automatically added):
```javascript
// Interceptor in api.js adds JWT token
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Data APIs

```javascript
// Medical
medicalService.getHistory()                 // GET /medical/history
medicalService.getLatestPatients()          // GET /medical/patients/latest
medicalService.getNotifications()           // GET /medical/notifications
medicalService.sendSOS(payload)             // POST /medical/emergency/sos

// Pharmacy
pharmacyService.getStockAlerts()            // GET /pharmacies/low-stock-alerts
pharmacyService.getMyPharmacies()           // GET /pharmacies/my-pharmacies

// Vaccination
vaccinationService.getRecords(childId)      // GET /vaccination/child/{childId}

// Users
userService.getChildren()                   // GET /users/children
userService.addChild(childPhone)            // POST /users/children/add
```

---

## State Management

### Auth Store (Zustand)

**Location**: `mobile/src/store/useAuthStore.js`

```javascript
const { 
  user,              // Current user profile
  token,             // JWT access token
  refreshToken,      // Refresh token (for token renewal)
  isAuthenticated,   // Login status
  setUser,           // Update user
  setToken,          // Save access token
  setRefreshToken,   // Save refresh token
  logout             // Clear auth
} = useAuthStore();
```

### Theme Store

```javascript
const { 
  isDarkMode,        // Dark/light mode
  colors,            // Color palette
} = useTheme();
```

---

## Navigation Patterns

### Push New Screen

```javascript
// Navigate to new screen (adds to stack)
navigation.navigate('PrescriptionList', { prescriptionId: '123' });
```

### Replace (Auth Screen)

```javascript
// Replace current screen (don't add to stack)
navigation.replace('Login');
```

### Go Back

```javascript
navigation.goBack();
```

### Reset to Home

```javascript
navigation.reset({
  index: 0,
  routes: [{ name: 'MainTabs' }],
});
```

### Open Modal

```javascript
// Use presentation: 'modal' in navigator
navigation.navigate('Profile');
```

---

## Deep Linking (Future)

### Supported Routes

```
fasocare://home
fasocare://medical-record/:patientId
fasocare://prescription/:prescriptionId
fasocare://pharmacy/:pharmacyId
fasocare://consultation/:doctorId
```

### Configuration (In AppNavigator.js)

```javascript
const linking = {
  prefixes: ['fasocare://', 'https://app.fasocare.bf'],
  config: {
    screens: {
      MainTabs: 'home',
      Profile: 'profile/:userId',
      PrescriptionList: 'prescription/:prescriptionId',
      // ... other routes
    },
  },
};

<NavigationContainer linking={linking}>
  {/* Navigator */}
</NavigationContainer>
```

---

## Performance Optimization

### Screen Lazy Loading

```javascript
// Only load screens when needed
const PatientDashboard = React.lazy(() => import('./screens/Patient/...'));

// Suspense boundary for loading
<Suspense fallback={<LoadingScreen />}>
  <PatientDashboard />
</Suspense>
```

### Memoization

```javascript
// Prevent unnecessary re-renders
const PatientScreen = React.memo(({ route }) => {
  // Component logic
});
```

### Navigation Event Listeners

```javascript
// Optimize by listening to focus events
const unsubscribe = navigation.addListener('focus', () => {
  // Reload data when screen is focused
  loadPatientData();
});

return () => unsubscribe();
```

---

## Troubleshooting

### Issue: "Undefined is not an object (evaluating 'navigation.navigate')"

**Cause**: Component not wrapped in NavigationContainer

**Solution**: Ensure component is child of NavigationContainer

```javascript
// ❌ Wrong
export default function App() {
  return <YourScreen />;
}

// ✅ Correct
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={YourScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

### Issue: "Couldn't find a navigation object"

**Cause**: Hook called outside navigation context

**Solution**: Use useNavigation only in screens or components

```javascript
// ✅ Correct
function MyScreen() {
  const navigation = useNavigation();
  // ...
}

// ❌ Wrong (outside navigator)
const navigation = useNavigation();  // Will fail
```

### Issue: Back button doesn't work on Android

**Cause**: Navigator not configured properly

**Solution**: Ensure gesture handler is properly imported

```javascript
// App.js
import 'react-native-gesture-handler';  // Must be first import
```

---

## Testing Navigation

### Test OTP Flow

```javascript
// 1. Start app (not authenticated)
// 2. Tap "Login"
// 3. Toggle to "OTP" mode
// 4. Enter phone: +226XX123456
// 5. Tap "Receive OTP"
// 6. Should navigate to OtpVerificationScreen
// 7. Enter code from console log
// 8. Should navigate to MainTabs
```

### Test Role-Based Navigation

```javascript
// Logout (clear token)
// Login as PATIENT → Should see Patient tabs
// Login as DOCTOR → Should see Doctor tabs
// Login as PHARMACIST → Should see Pharmacist tabs
// Login as PARENT → Should see Parent tabs
```

### Test Deep Links

```bash
# Test deep link (requires app to be installed)
adb shell am start -W -a android.intent.action.VIEW -d "fasocare://prescription/123"
```

---

## File Structure

```
mobile/
├── App.js                           # Root navigator + auth check
├── src/
│  ├── navigation/
│  │  ├── AppNavigator.js           # Main app navigation (Stack)
│  │  └── RoleTabNavigator.js       # Role-based tabs
│  ├── screens/
│  │  ├── Auth/
│  │  │  ├── WelcomeScreen.js
│  │  │  ├── LoginScreen.js         # UPDATED: Password + OTP modes
│  │  │  ├── OtpVerificationScreen.js # NEW
│  │  │  ├── RegisterScreen.js
│  │  │  ├── ForgotPasswordScreen.js
│  │  │  └── ResetPasswordScreen.js
│  │  ├── Patient/
│  │  ├── Doctor/
│  │  ├── Pharmacist/
│  │  ├── Parent/
│  │  └── Home/
│  ├── services/
│  │  └── api.js                    # UPDATED: OTP endpoints
│  ├── store/
│  │  └── useAuthStore.js
│  └── context/
│     └── ThemeContext.js
└── package.json
```

---

## Next Steps

### Week 3 Tasks

1. **Test Navigation**
   - [ ] Test password login flow
   - [ ] Test OTP login flow ← We just built this
   - [ ] Test role-based tab switching
   - [ ] Test modal screens

2. **Mobile Screen Integration**
   - [ ] Connect Patient screens to backend APIs
   - [ ] Connect Doctor screens to backend APIs
   - [ ] Connect Pharmacist screens
   - [ ] Connect Parent screens

3. **Deep Linking Integration**
   - [ ] Set up URL schemes
   - [ ] Test SMS links to app

4. **Performance**
   - [ ] Load test 100+ concurrent users
   - [ ] Measure navigation latency
   - [ ] Optimize render performance

---

## References

- [React Navigation Docs](https://reactnavigation.org/)
- [Stack Navigator](https://reactnavigation.org/docs/stack-navigator)
- [Bottom Tab Navigator](https://reactnavigation.org/docs/bottom-tab-navigator)
- [Deep Linking](https://reactnavigation.org/docs/deep-linking)

---

**Status**: ✅ Complete
**Last Updated**: April 2026
**Version**: 2.0

