# 🎨 FasoCare Code Style & Best Practices

## TypeScript

### Type Safety

**✅ DO**
```typescript
// Explicit types
const userId: string = user.id;
const count: number = items.length;

// Generic types
const cache: Map<string, User> = new Map();
const response: Promise<ApiResponse> = fetch(url);

// Type inference for complex cases
const [name, setName] = useState<string>('');
```

**❌ DON'T**
```typescript
// Implicit any
const userId = user.id;  // any type
let data: any = {};      // avoid any
```

### Interfaces vs Types

**✅ DO Use Interfaces for objects**
```typescript
interface User {
  id: string;
  email: string;
  role: Role;
}

// Can extend
interface Doctor extends User {
  licenseNumber: string;
  specialization: string;
}
```

**✅ DO Use Types for unions/tuples**
```typescript
type PhoneNumber = string | number;
type ApiResponse = { success: true; data: any } | { success: false; error: string };
type Coordinates = [number, number];
```

## NestJS

### Modules

**✅ DO**
```typescript
@Module({
  imports: [AuthModule, ConfigModule],
  providers: [MedicalService],
  controllers: [MedicalController],
  exports: [MedicalService],  // For other modules
})
export class MedicalModule {}
```

### Services (Business Logic)

**✅ DO**
```typescript
@Injectable()
export class MedicalService {
  constructor(
    @InjectRepository(Consultation)
    private consultationRepo: Repository<Consultation>,
    private logger: Logger,
    private configService: AppConfigService,
  ) {}

  async createConsultation(dto: CreateConsultationDto): Promise<Consultation> {
    // Validation
    if (!dto.patientId) throw new BadRequestException('Patient ID required');
    
    // Business logic
    const consultation = this.consultationRepo.create(dto);
    
    // Logging
    this.logger.log(`Created consultation for patient ${dto.patientId}`);
    
    return await this.consultationRepo.save(consultation);
  }
}
```

### Controllers (HTTP Layer)

**✅ DO**
```typescript
@Controller('api/v1/medical')
export class MedicalController {
  constructor(private medicalService: MedicalService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOCTOR, Role.ADMIN)
  @Post('consultation')
  @ApiOperation({ summary: 'Create consultation' })
  @ApiResponse({ status: 201, type: Consultation })
  async create(@Body() dto: CreateConsultationDto): Promise<Consultation> {
    return this.medicalService.createConsultation(dto);
  }
}
```

### DTOs (Data Transfer Objects)

**✅ DO**
```typescript
export class CreateConsultationDto {
  @IsUUID()
  @IsNotEmpty()
  patientId: string;

  @IsString()
  @MinLength(10)
  notes: string;

  @IsDate()
  @IsPast()  // Can't schedule in past
  consultationDate: Date;

  @IsEnum(ConsultationType)
  type: ConsultationType;
}
```

### Error Handling

**✅ DO**
```typescript
try {
  const user = await this.userRepo.findOne(id);
  if (!user) throw new NotFoundException('User not found');
  
  return user;
} catch (error) {
  this.logger.error(`Failed to get user ${id}:`, error);
  throw new InternalServerErrorException('Database error');
}
```

## React/Next.js

### Component Structure

**✅ DO**
```typescript
interface DashboardProps {
  userId: string;
  onRefresh?: () => void;
}

export function Dashboard({ userId, onRefresh }: DashboardProps) {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="dashboard">
      {/* JSX */}
    </div>
  );
}

export default Dashboard;
```

### Hooks Usage

**✅ DO**
```typescript
function usePatientData(patientId: string) {
  const [data, setData] = useState<Patient | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPatientData(patientId)
      .then(setData)
      .catch((err) => setError(err.message));
  }, [patientId]);

  return { data, error };
}
```

**❌ DON'T**
```typescript
// DON'T call hooks conditionally
function BadComponent() {
  if (condition) {
    useEffect(() => {});  // ❌ WRONG!
  }
}
```

## Database (TypeORM)

### Entities

**✅ DO**
```typescript
@Entity('consultations')
export class Consultation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.consultations)
  @JoinColumn({ name: 'patient_id' })
  patient: User;

  @Index()  // For frequent queries
  @Column()
  patientId: string;

  @Column({ type: 'text' })
  notes: string;
}
```

### Repositories

**✅ DO**
```typescript
@Injectable()
export class ConsultationRepository extends Repository<Consultation> {
  constructor(private dataSource: DataSource) {
    super(Consultation, dataSource.createEntityManager());
  }

  async findByPatientId(patientId: string): Promise<Consultation[]> {
    return this.find({
      where: { patientId },
      relations: ['doctor'],
      order: { createdAt: 'DESC' },
    });
  }
}
```

## Testing

### Unit Tests

**✅ DO**
```typescript
describe('UserService', () => {
  let service: UserService;
  let repo: Repository<User>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: 'USER_REPO', useValue: mockUserRepo },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  describe('findById', () => {
    it('should return user if exists', async () => {
      const user = { id: '123', name: 'John' };
      jest.spyOn(repo, 'findOne').mockResolvedValue(user);

      const result = await service.findById('123');

      expect(result).toEqual(user);
      expect(repo.findOne).toHaveBeenCalledWith('123');
    });

    it('should throw NotFoundException if not found', async () => {
      jest.spyOn(repo, 'findOne').mockResolvedValue(null);

      await expect(service.findById('999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
```

## Git & Commits

### Branch Naming

```
feature/add-consultation-notes
fix/jwt-token-expiration
docs/api-documentation
refactor/medical-service-optimization
```

### Commit Messages

```
feat(medical): add consultation note encryption

- Encrypt notes using AES-256
- Add decryption on retrieval
- Update migration for note_encrypted field

Closes #234
```

## Logging

**✅ DO**
```typescript
this.logger.log('User registered', { userId: user.id, email: user.email });
this.logger.warn('Rate limit approaching', { ip, requests: 95 });
this.logger.error('Payment failed', { orderId, error: err.message });
```

**❌ DON'T**
```typescript
console.log('User:', user);           // Use logger instead
console.error('Error:', error);       // Use logger instead
```

## Code Comments

**✅ DO**
```typescript
// ✅ Explain WHY
// This caches the result to avoid repeated database queries
// during peak hours. TTL is set to 5 minutes.
const cacheKey = `user:${userId}`;
```

**❌ DON'T**
```typescript
// ❌ Obvious from code
// Set userId to the result of getUserId
const userId = getUserId();

// ❌ Outdated info
// TODO: Remove this after December 2025  (it's April 2026!)
```

## Performance

### Query Optimization

**✅ DO**
```typescript
// Use relations to avoid N+1 queries
const consultations = await this.consultationRepo.find({
  relations: ['doctor', 'patient'],
  where: { status: 'completed' },
});
```

**❌ DON'T**
```typescript
// N+1 query problem
const consultations = await this.consultationRepo.find();
for (const c of consultations) {
  c.doctor = await this.userRepo.findOne(c.doctorId);  // Repeat!
}
```

### React Rendering

**✅ DO**
```typescript
// Use memo for expensive components
const DoctorCard = memo(({ doctor }: { doctor: Doctor }) => {
  return <div>{doctor.name}</div>;
});

// Use useCallback for stable function refs
const handleClick = useCallback(() => {
  onSelect(id);
}, [id, onSelect]);
```

## Error Messages

**✅ DO - Clear and actionable**
```typescript
throw new BadRequestException(
  'Consultation date must be today or in the future. ' +
  `Received: ${consultationDate}`
);
```

**❌ DON'T - Vague**
```typescript
throw new Error('Invalid date');
```

## Security

**✅ DO**
```typescript
// Hash passwords
const hashedPassword = await bcrypt.hash(password, 10);

// Validate input
if (!isValidPhoneNumber(phone)) throw new BadRequestException();

// Use HTTPS only
enableCors({
  origin: process.env.ALLOWED_ORIGINS?.split(','),
});
```

**❌ DON'T**
```typescript
// Store plaintext passwords
user.password = password;

// No validation
const user = await userRepo.findOne(input);
```

---

## Review Checklist

Before submitting a PR, ensure:
- [ ] TypeScript strict mode enabled
- [ ] All tests passing
- [ ] No console.log or debug code
- [ ] Error handling implemented
- [ ] Input validation present
- [ ] Security considerations addressed
- [ ] Documentation updated
- [ ] Code follows this guide

---

**Last Updated**: 11 Apr 2026
