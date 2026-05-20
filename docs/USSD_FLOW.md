# 🇧🇫 FasoCare USSD Menu System

## Overview

**USSD** (Unstructured Supplementary Service Data) is a telecommunications protocol used for structured communication between devices and services. In Burkina Faso, USSD enables health access via simple phone menus without requiring:
- Smartphone
- Internet connection
- Mobile app installation

**Dial**: `*226*201#` (Africa's Talking service code)

---

## Menu Hierarchy

### Level 0: Main Menu
```
Welcome to FasoCare 🇧🇫

1. My Health Record
2. Book Appointment
3. Pharmacy
4. Report Symptoms
5. SOS Emergency
0. Exit
```

---

### 1. My Health Record (1)

**Purpose**: View vaccination status, past appointments, active prescriptions

#### 1.1 Vaccination Status (1*1)
```
VACCINATION

Last vaccine:
[Vaccine Name]

Date: DD/MM/YYYY

Next dose: DD/MM/YYYY
```
**API Call**: `GET /vaccination/latest?patientId={userId}`

#### 1.2 Past Appointments (1*2)
```
LATEST APPOINTMENT:

Date: DD/MM/YYYY
Doctor: Dr. [Name]
Reason: [Chief complaint]
Diagnosis: [Result]
```
**API Call**: `GET /medical/consultations?patientId={userId}`

#### 1.3 Active Prescriptions (1*3)
```
ACTIVE PRESCRIPTIONS:

[None found] or
1. Paracétamol 500mg - 2x daily
2. Antibiotic Amox - 3x daily
```
**API Call**: `GET /pharmacy/prescriptions?patientId={userId}&active=true`

---

### 2. Book Appointment (2)

**Purpose**: Schedule consultation or vaccination appointment

#### Step 1: Select Facility (2)
```
Book Appointment:

1. CSPS Pissy
2. CMA Koudougou
3. CHU Bobo
4. Private Clinic
0. Back
```

#### Step 2: Select Specialist (2*[facility])
```
Which Specialist?

1. General Practitioner
2. Pediatrician
3. Obstetrician
4. Surgeon
```

#### Step 3: Select Date (2*[facility]*[specialist])
```
When do you prefer?

1. Tomorrow
2. Day after tomorrow
3. This week
```

#### Confirmation (2*[facility]*[specialist]*[date])
```END
APPOINTMENT CONFIRMED ✅

Facility: [Name]
Specialist: [Type]
Date: [Selected date]

Confirmation SMS: AP123456
```
**API Calls**:
- `POST /appointments/create` with facility, specialist, date
- `POST /telecom/sms/send` with confirmation details

---

### 3. Pharmacy (3)

**Purpose**: Find pharmacies, check stock, order medicines

#### 3.1 Nearby Pharmacies (3*1)
```
NEARBY PHARMACIES:

1. Pharma Burkina - Pissy
   📍 +226 70 123 456

2. Pharmacie du Faso
   📍 +226 71 234 567

3. Pharma Central
   📍 +226 72 345 678
```
**API Call**: `GET /pharmacy/nearby?latitude={user.lat}&longitude={user.lng}&radius=5`

#### 3.2 Available Stock (3*2)
```
AVAILABLE STOCK:

✅ Paracétamol 500mg
✅ Antibiotic Amoxicillin
✅ Anti-malaria Artemether
❌ Insulin (unavailable)

Call pharmacy for details.
```
**API Call**: `GET /pharmacy/stock?available=true`

#### 3.3 Order Medicine (3*3)
```END
ORDER RECEIVED

You'll receive SMS when ready.

Thank you for using FasoCare.
```
**API Call**: `POST /pharmacy/orders/create`

---

### 4. Report Symptoms (4)

**Purpose**: Report health symptoms or suspected cases to health authorities

#### 4.1 Choose Symptom (4*1)
```
Report Symptoms:

1. Fever + Cough
2. Malaise
3. Nausea + Vomiting
4. Other
```

#### 4.2 Symptoms Detail (4*1*[symptom])
```END
SYMPTOMS REPORTED ✅

Reference: SY20240115001

Health authorities will contact you.
```
**API Call**: `POST /medical/symptom-report` with symptom data

#### 4.3 Suspect Case (4*2)
```END
SUSPECTED CASE REPORTED ✅

Reference: CS20240115001

Authorities will investigate.
```
**API Call**: `POST /public-health/suspected-case` with contact info

---

### 5. SOS Emergency (5)

**Purpose**: Emergency alert for life-threatening situations

```END
🚨 SOS ALERT

Emergency team notified.
Your location: [Phone-based GPS]

Stay calm. Help arriving.

Call 112 immediately.
```
**API Calls**:
- `POST /emergency/alert` with user location
- `POST /telecom/sms/send` to nearest health facility
- `POST /telecom/sms/send` to emergency contacts

---

## Technical Implementation

### Request Format (Africa's Talking)

```json
{
  "phoneNumber": "+226XX123456",
  "text": "1*1",
  "sessionId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "serviceCode": "201",
  "networkCode": "63902"
}
```

### Response Format

**CONTINUE Session** (More input needed):
```
CON [Message with menu options]
```

**END Session** (Final response):
```
END [Final message/result]
```

### Session State Machine

```
START
  ↓
MAIN_MENU → (user selects 1-5)
  ├─→ HEALTH_MENU → (1-4 selections)
  ├─→ APPOINTMENT_MENU → (facility selection)
  ├─→ PHARMACY_MENU → (3-way selection)
  ├─→ REPORT_MENU → (symptom/case selection)
  └─→ EXIT
  ↓
END
```

**Session Timeout**: 10 minutes of inactivity

---

## OTP (One-Time Password) Flow

### 1. OTP Generation

**Trigger**: Phone verification, Login without password

```
POST /auth/request-otp
{
  "phoneNumber": "+226XXXXXXXX",
  "purpose": "PHONE_VERIFICATION"
}

Response:
{
  "statusCode": 201,
  "success": true,
  "message": "OTP sent to phone",
  "expiresIn": 600
}
```

**SMS Message**:
```
Your FasoCare verification code is: 123456
Valid for 10 minutes. Don't share with anyone.
```

### 2. OTP Verification

**Steps**:
1. User receives 6-digit code via SMS
2. User enters code on USSD or app
3. System verifies code matches & hasn't expired
4. Code is marked as used (one-time only)

```
POST /auth/verify-otp
{
  "phoneNumber": "+226XXXXXXXX",
  "code": "123456",
  "purpose": "PHONE_VERIFICATION"
}

Response:
{
  "statusCode": 200,
  "success": true,
  "message": "OTP verified",
  "token": "eyJhbGc..."
}
```

### Security Features

- **Rate Limiting**: Max 3 OTPs per phone per hour
- **Attempt Limiting**: Max 5 verification attempts per OTP
- **Expiration**: 10 minutes validity
- **One-Time Use**: Code can't be reused after verification
- **Phone Normalization**: Handles various phone formats

### OTP Purposes

| Purpose | Use Case | Validity |
|---------|----------|----------|
| PHONE_VERIFICATION | Account registration | 10 min |
| LOGIN | Passwordless login | 10 min |
| PASSWORD_RESET | Account recovery | 10 min |
| TRANSACTION | High-risk actions | 10 min |

---

## SMS Integration

### Outbound SMS Types

#### 1. OTP Codes
```
Your FasoCare verification code is: 123456
Valid for 10 minutes. Don't share with anyone.
```

#### 2. Appointment Confirmations
```
APPOINTMENT CONFIRMED - FasoCare

Reference: AP123456
Facility: CSPS Pissy
Date: 15/01/2024
Time: 14:00

You'll receive a reminder SMS 24 hours before.
```

#### 3. Health Alerts
```
🏥 VACCINATION REMINDER - FasoCare

Your child's next vaccine is due on: 20/01/2024
Location: CSPS Pissy

Book now: *226*201#
```

#### 4. Pharmacy Notifications
```
📦 PRESCRIPTION READY - FasoCare

Your medicine is ready to pick up at:
Pharma Burkina, Pissy

Reference: PH123456
```

### SMS Service API

```typescript
// Send OTP
await smsService.sendOtp(phoneNumber: string, code: string)

// Send appointment confirmation
await smsService.sendAppointmentConfirmation(phoneNumber, {
  referenceCode: 'AP123456',
  facilityName: 'CSPS Pissy',
  date: '15/01/2024',
  time: '14:00'
})

// Send health alert
await smsService.sendHealthAlert(phoneNumber, {
  title: 'VACCINATION REMINDER',
  message: 'Your child's next vaccine is due on 20/01/2024',
  actionUrl: '*226*201#'
})

// Broadcast to multiple recipients
await smsService.broadcast(recipients, message)
```

---

## API Endpoints Summary

### USSD

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/ussd/callback` | Handle Africa's Talking callback |
| POST | `/ussd/test` | Test USSD flow (development) |

### OTP

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/auth/request-otp` | Generate OTP |
| POST | `/auth/verify-otp` | Verify OTP code |
| POST | `/auth/invalidate-otp` | Cancel OTP |

### SMS

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/telecom/sms/send` | Send SMS |
| POST | `/telecom/sms/broadcast` | Broadcast SMS |
| GET | `/telecom/sms/balance` | Check SMS balance |

---

## Testing USSD

### Test via API (Development)

```bash
# Initial request (empty text)
curl -X POST http://localhost:3000/ussd/test \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+226XX123456",
    "text": "",
    "sessionId": "test-session-1"
  }'

response: {
  "message": "CON Bienvenue FasoCare 🇧🇫\n\n1. My Health Record\n..."
}

# Select option 1
curl -X POST http://localhost:3000/ussd/test \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+226XX123456",
    "text": "1",
    "sessionId": "test-session-1"
  }'

response: {
  "message": "CON Health Menu:\n1. Vaccination\n2. My Appointments\n..."
}

# Select vaccination (1*1)
curl -X POST http://localhost:3000/ussd/test \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+226XX123456",
    "text": "1*1",
    "sessionId": "test-session-1"
  }'

response: {
  "message": "END VACCINATION\n\nLast vaccine: Polio\nDate: 15/01/2024\nNext: 15/02/2024"
}
```

### Test with Africa's Talking Sandbox

1. **Configure Webhook**: Set USSD callback URL in AT dashboard
   ```
   POST https://your-domain.com/ussd/callback
   ```

2. **Simulate USSD Request**: Use Africa's Talking Sandbox
   ```
   Dial: *126*201#
   ```

3. **Follow Menu**: Navigate through options like normal user

---

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Number unknown" | User not registered | Register via app or CSPS |
| "Invalid option" | User selected wrong number | Show menu again |
| "OTP expired" | User took >10 min to verify | Request new OTP |
| "Max attempts exceeded" | 5 wrong code attempts | Request new OTP |
| "Service unavailable" | Backend/database error | Try again later |

### Error Response Format

```
END [Error message in French]

Example: "END La base de données n'est pas disponible. Réessayez plus tard."
```

---

## Performance Considerations

### Optimization

- **Session Caching**: Store in-memory map (max 1000 concurrent sessions)
- **Database Queries**: Use indexed lookups by phone number
- **Response Time**: <500ms target for USSD responses
- **SMS Batch**: Send OTPs asynchronously via queue

### Scaling

- Horizontal scaling: Each server instance can handle ~10k concurrent USSD sessions
- Use Redis for session storage in multi-instance setup
- Implement request throttling per phone number

---

## Security

### Data Protection

- **Phone Numbers**: Normalized to E.164 format, salted/hashed in database
- **OTP Codes**: Never logged in debug mode
- **Session Data**: Cleared after timeout or completion
- **Rate Limiting**: Max 3 OTPs per hour per phone

### Compliance

- **Privacy**: GDPR-compliant session cleanup
- **Audit Logs**: All USSD actions logged by timestamp + phone
- **Consent**: User consent collected for SMS opt-in
- **Data Retention**: Session data deleted after 10 minutes

---

## Future Enhancements

1. **Multi-Language Support**: Add Bambara, Mooré language options
2. **Voice USSD**: Support voice prompts for illiterate users
3. **Payment Integration**: Medicine purchase via USSD
4. **Telemedicine**: Consult doctor via USSD voice call
5. **AI Bot**: Natural language menu navigation
6. **Offline Mode**: Cache USSD responses for network outages

---

## References

- **Africa's Talking Documentation**: https://africastalking.com/ussd
- **USSD Protocol**: ITU-T Recommendation E.238
- **E.164 Phone Format**: https://en.wikipedia.org/wiki/E.164

---

**Last Updated**: January 2024
**Version**: 2.0
**Status**: Production Ready
