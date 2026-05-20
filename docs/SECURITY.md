# 🔒 FasoCare Security Guidelines

## Sensitive Data Protection

### Patient Data (PII - Personally Identifiable Information)
- ✅ **ALWAYS ENCRYPT** at rest and in transit
- ✅ **TLS 1.3+** for all API communications
- ✅ **AES-256** for database encryption
- ✅ **SHA-256** for password hashing with bcrypt (min 10 rounds)
- ✅ Implement **encryption key rotation** policy

### Medical Records
- 🔐 **Triple-double encryption**: DB encryption + field-level encryption
- 📋 **Audit every access**: Log all reads to medical data
- ⚠️ **Never** store SSN/national ID in plaintext
- ⚠️ **Never** commit production data in code/git

### API Keys & Secrets
- 🔑 **Generate** 32+ character random keys
- 🔑 **Store** in environment variables only (not .env in git)
- 🔑 **Rotate** at least monthly
- 🔑 **Never** log or expose API keys
- 🔑 Use **AWS Secrets Manager** or **HashiCorp Vault** in production

---

## Authentication & Authorization

### JWT Implementation
```typescript
// ✅ DO: Use ConfigService for secrets
const jwtSecret = this.configService.get('JWT_SECRET');

// ❌ DON'T: Hardcode or use defaults
const jwtSecret = 'secret_key' || 'fallback_secret';
```

### Token Expiration
- **Access Token**: 15 minutes (short-lived)
- **Refresh Token**: 7 days (used to get new access token)
- **Password Reset**: 1 hour (one-time use)
- **Email Verification**: 24 hours

### RBAC - Role-Based Access Control
```typescript
// Roles in FasoCare
enum Role {
  ADMIN = 'ADMIN',              // Full system access
  DOCTOR = 'DOCTOR',            // Medical records, consultations
  PHARMACIST = 'PHARMACIST',    // Pharmacy operations
  PATIENT = 'PATIENT',          // Own medical records only
  LAB_TECH = 'LAB_TECH',        // Lab test results
  ADMIN_NURSE = 'ADMIN_NURSE'   // Administrative tasks
}
```

### Authorization Pattern
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.DOCTOR, Role.ADMIN)
@Get(':id/medical-history')
getMedicalHistory(@Param('id') patientId: string) {
  // Only doctors and admins can access
}
```

---

## Database Security

### Connection Security
```env
# Use TLS for database connections
DB_SSL=true
DB_REJECTUNAUTHORIZED=false  # Only in dev!
```

### Query Injection Prevention
```typescript
// ✅ DO: Use parameterized queries (TypeORM handles this)
const user = await this.userRepository.find({
  where: { email: userInput }
});

// ❌ DON'T: String concatenation
const query = `SELECT * FROM users WHERE email = '${userInput}'`;
```

### Data Minimization
- Store only necessary patient data
- Implement data retention policies
- GDPR Right to be Forgotten compliance

---

## Password Security

### Requirements
- ✅ Minimum 12 characters
- ✅ Numbers, uppercase, lowercase, special chars
- ✅ Not in common password lists
- ✅ Not repeating previous 5 passwords

### Hashing
```typescript
// Use bcrypt with minimum 10 rounds
const hashedPassword = await bcrypt.hash(password, 10);
```

### Password Reset Flow
1. User requests reset → sends email with secure token
2. Token expires after 1 hour
3. User sets new password
4. Invalidate all existing sessions
5. Log password reset attempt (audit trail)

---

## API Security

### CORS Configuration
```typescript
// Only allow trusted origins
enableCors({
  origin: ['https://dashboard.ans.bf', 'https://mobile.ans.bf'],
  credentials: true,
});
```

### Rate Limiting
```typescript
// Prevent brute force attacks
@Throttle({
  default: { limit: 100, ttl: 60000 },  // 100 requests per minute
})
@Post('/login')
login() { }
```

### Input Validation
```typescript
// Validate all inputs
class LoginDto {
  @IsPhoneNumber('BF')
  phone: string;

  @IsString()
  @MinLength(8)
  password: string;
}
```

---

## Audit Logging

### What to Log
- ✅ User login/logout
- ✅ Access to medical records
- ✅ Data modifications (create, update, delete)
- ✅ Permission changes
- ✅ API errors (4xx, 5xx)
- ✅ Security events (failed login, unauthorized access)

### Audit Entry Format
```typescript
interface AuditLogEntry {
  timestamp: Date;
  userId: string;
  action: string;        // 'CREATE', 'READ', 'UPDATE', 'DELETE'
  resource: string;      // 'medical_record', 'prescription'
  resourceId: string;
  changes?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
}
```

### Implementation
```typescript
@Injectable()
@UseInterceptors(AuditInterceptor)
export class MedicalController {
  // All requests automatically audited
}
```

---

## Deployment Security

### Environment Setup
```bash
# Production checklist
- Set NODE_ENV=production
- Enable database SSL
- Use strong JWT secrets (32+ chars)
- Enable HTTPS/TLS
- Configure HSTS headers
- Enable CSP headers
- Set secure cookie flags
```

### Secrets Management
```bash
# ✅ DO: Use environment-specific secrets
docker run -e JWT_SECRET=$JWT_SECRET fasocare-api

# ❌ DON'T: Bake secrets into images
docker build --build-arg JWT_SECRET=secret .
```

### Database Backups
- Daily automated backups
- Encrypted backup storage
- Test restore procedures monthly
- Retain backups for 90 days minimum

---

## Third-Party Integrations

### Africa's Talking (SMS/USSD)
- ✅ API key in env variables only
- ✅ Rate limit SMS per phone number
- ✅ Validate phone numbers (format, country)
- ✅ Never store API responses with sensitive data

### Example: Secure SMS Integration
```typescript
@Injectable()
export class SmsService {
  constructor(private configService: AppConfigService) {}

  async sendOtp(phone: string): Promise<void> {
    const apiKey = this.configService.atApiKey;  // From env
    const otp = this.generateSecureOtp();
    
    await this.africastalking.sms.send({
      recipients: [phone],
      message: `Your FasoCare OTP: ${otp}. Valid for 10 minutes.`,
      from: 'FasoCare'
    });
    
    // Store hashed OTP, not plaintext
    await this.otpRepository.save({
      phone,
      hashedOtp: await bcrypt.hash(otp, 10),
      expiresAt: new Date(Date.now() + 10 * 60000)
    });
  }
}
```

---

## Incident Response

### Security Incident Steps
1. **Identify**: Detect suspicious activity
2. **Isolate**: Disable affected account/system
3. **Investigate**: Audit logs, database records
4. **Contain**: Limit damage spread
5. **Eradicate**: Remove root cause
6. **Recover**: Restore normal operations
7. **Review**: Post-mortem and improvements

### Reporting Security Issues
- Email: `security@ans.bf`
- Responsible disclosure: 30-day grace period
- Bounty program available for critical issues

---

## Compliance

### GDPR Requirements
- ✅ Right to Access: Provide data export
- ✅ Right to Erasure: Secure data deletion
- ✅ Right to Data Portability: Standard formats
- ✅ Privacy by Design: Encrypt by default

### Audit Requirements
- ✅ Keep audit logs for 2 years minimum
- ✅ Implement audit log tamper detection
- ✅ Regular security assessments (quarterly)
- ✅ Incident response testing (annually)

---

## Security Checklist

Before the production deployment:

- [ ] All secrets in environment variables
- [ ] TLS/HTTPS enabled
- [ ] Database encrypted and backed up
- [ ] API keys rotated
- [ ] CORS configured (not wildcard)
- [ ] Rate limiting enabled
- [ ] Audit logging in place
- [ ] Security headers configured
- [ ] Input validation on all endpoints
- [ ] Database connection uses SSL
- [ ] Password policy enforced
- [ ] JWT expiration set appropriately
- [ ] Error messages don't expose system details
- [ ] Dependencies updated and tested
- [ ] Security headers configured (HSTS, CSP, X-Frame-Options)

---

**Last Updated**: 11 Apr 2026  
**Next Review**: 18 Apr 2026  
**Security Lead**: Agence Numérique de Santé (ANS)
