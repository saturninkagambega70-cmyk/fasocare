# 📝 Conventional Commits Guide

FasoCare follows **Conventional Commits** pattern for clear, semantic versioning.

## Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

## Types

| Type | Description | Example |
|------|-------------|---------|
| **feat** | New feature | `feat(auth): add JWT refresh token` |
| **fix** | Bug fix | `fix(medical): correct consultation date validation` |
| **docs** | Documentation | `docs(api): add Swagger annotations` |
| **style** | Code style (no logic change) | `style(common): format imports` |
| **refactor** | Code refactoring | `refactor(pharmacy): extract inventory logic` |
| **test** | Tests | `test(auth): add auth service tests` |
| **chore** | Build/deps | `chore(deps): update NestJS to v12` |
| **ci** | CI/CD | `ci(github): add coverage checks` |
| **perf** | Performance | `perf(medical): optimize consultation query` |
| **security** | Security fix | `security(auth): fix JWT secret exposure` |

## Scopes

- **auth** - Authentication & Authorization
- **medical** - Medical records & consultations
- **pharmacy** - Pharmacy operations
- **laboratory** - Lab tests & results
- **vaccination** - Vaccination programs
- **ussd** - USSD/SMS integration
- **telecom** - Telecom provider integration
- **users** - User management
- **monitoring** - Logging & monitoring
- **config** - Configuration
- **common** - Shared utilities
- **deps** - Dependencies
- **db** - Database & migrations
- **api** - API documentation

## Subject Line

- ✅ Use imperative, present tense ("add", not "added")
- ✅ Don't capitalize
- ✅ No period (.) at end
- ✅ Max 50 characters

## Body

- ✅ Explain WHAT and WHY, not HOW
- ✅ Wrap at 72 characters
- ✅ Separate from subject with blank line
- ✅ Use bullet points for multiple changes

## Footer

Include references to Issues and Breaking Changes:

```
Closes #123
Refs #456

BREAKING CHANGE: explain what breaks
```

## Examples

### Good ✅

```
feat(auth): add password reset via SMS

- Add OTP generation and validation
- Integrate with Africa's Talking SMS
- Set 10-minute expiration for OTP

Closes #234
Refs #223
```

### Good ✅

```
fix(medical): prevent duplicate consultation entries

The consultation creation was not checking for
existing records on the same day. Added uniqueness
constraint on (patient_id, consultation_date).

Closes #512
```

### Good ✅

```
docs(api): update Swagger for pharmacy endpoints

Add missing request/response examples for
medication management endpoints.
```

### Bad ❌

```
fixed bug              # Too vague
Added new feature      # Capitalized, past tense
update auth module     # No scope
fix: JWT bug fix       # Redundant
```

## Commit Types by Impact

### 🔴 Breaking Changes
Use `BREAKING CHANGE:` footer
- Database schema changes
- API contract changes
- Security-critical updates

### 🟠 Major Features
Use `feat:` type
- New API endpoints
- New modules
- Significant functionality

### 🟡 Bug Fixes & Updates
Use `fix:` or `test:`
- Bug corrections
- Test additions
- Minor improvements

### 🟢 Chores & Docs
Use `chore:`, `docs:`, `style:`
- Dependency updates
- Documentation
- Code formatting

---

## Commit Workflow

```bash
# 1. Make changes
git add .

# 2. Write conventional commit
git commit -m "feat(medical): add consultation notes"

# 3. Pre-commit hook runs:
#    - Linting
#    - Tests
#    - Blocks if failures

# 4. Push
git push origin feature-branch
```

## IDE Integration

### VS Code
1. Install: [Conventional Commits](https://marketplace.visualstudio.com/items?itemName=vivaxy.vscode-conventional-commits)
2. Press `Ctrl+Shift+P` → "Conventional Commits"

### Benefits
- ✅ Semantic versioning (Major.Minor.Patch)
- ✅ Automated changelog generation
- ✅ Clear git history
- ✅ Better code review experience
- ✅ Automatic CI/CD triggers

---

**Last Updated**: 11 Apr 2026
