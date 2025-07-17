# Remote MCP Coding & Testing Guidelines

## 1. Coding Standards & Best Practices

### 1.1 TypeScript Configuration
```json
// tsconfig.json - Enhanced for remote MCP
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "allowJs": true,
    "outDir": "./build",
    "rootDir": "./src",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noImplicitReturns": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "exactOptionalPropertyTypes": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "build", "tests"]
}
```

### 1.2 Code Organization Structure
```
src/
├── index.ts                 # Main server entry point
├── auth/
│   ├── oauth.ts            # OAuth 2.1 implementation
│   ├── pkce.ts             # PKCE utilities
│   ├── tokens.ts           # Token management
│   └── middleware.ts       # Authentication middleware
├── transport/
│   ├── sse.ts              # SSE transport implementation
│   ├── http.ts             # HTTP endpoint handlers
│   └── connections.ts      # Connection management├── tools/
│   ├── tasks.ts            # Google Tasks tools (5 tools)
│   ├── calendar.ts         # Google Calendar tools (5 tools)
│   ├── base.ts             # Common tool functionality
│   └── types.ts            # Tool interface definitions
├── google/
│   ├── client.ts           # Google API client setup
│   ├── auth.ts             # Google OAuth2 management
│   └── errors.ts           # Google API error handling
├── config/
│   ├── environment.ts      # Environment variable validation
│   ├── server.ts           # Server configuration
│   └── constants.ts        # Application constants
└── utils/
    ├── logging.ts          # Structured logging
    ├── validation.ts       # Input validation
    ├── errors.ts           # Error classes
    └── helpers.ts          # Utility functions
```

### 1.3 Environment Variable Management
```typescript
// src/config/environment.ts
import { z } from 'zod';

const EnvironmentSchema = z.object({
  // Google API Credentials (existing)
  GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID is required'),
  GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET is required'),
  GOOGLE_REFRESH_TOKEN: z.string().min(1, 'GOOGLE_REFRESH_TOKEN is required'),
  
  // OAuth 2.1 Security (new)
  OAUTH_SIGNING_KEY: z.string().min(1, 'OAUTH_SIGNING_KEY is required'),
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 characters'),
  
  // Application Settings
  NODE_ENV: z.enum(['development', 'production', 'test']).default('production'),
  PORT: z.coerce.number().default(3001),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  
  // CORS Configuration
  CORS_ORIGINS: z.string().default('https://claude.ai,https://api.anthropic.com'),
});

export type Environment = z.infer<typeof EnvironmentSchema>;

export function validateEnvironment(): Environment {
  try {
    return EnvironmentSchema.parse(process.env);
  } catch (error) {
    console.error('Environment validation failed:', error);
    process.exit(1);
  }
}
```
### 1.4 Error Handling Patterns
```typescript
// src/utils/errors.ts
export class McpError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'McpError';
  }
}

export class OAuth2Error extends Error {
  constructor(
    public error: string,
    public error_description: string,
    public statusCode: number = 400
  ) {
    super(error_description);
    this.name = 'OAuth2Error';
  }
}

export class GoogleApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public quotaExceeded: boolean = false
  ) {
    super(message);
    this.name = 'GoogleApiError';
  }
}
```

## 2. OAuth 2.1 Implementation Guidelines

### 2.1 PKCE Implementation
```typescript
// src/auth/pkce.ts
import crypto from 'crypto';

export class PKCEUtils {
  static generateCodeVerifier(): string {
    return crypto.randomBytes(32).toString('base64url');
  }

  static generateCodeChallenge(verifier: string): string {
    return crypto
      .createHash('sha256')
      .update(verifier)
      .digest('base64url');
  }

  static verifyChallenge(verifier: string, challenge: string): boolean {
    const computed = this.generateCodeChallenge(verifier);
    return crypto.timingSafeEqual(
      Buffer.from(computed),
      Buffer.from(challenge)
    );
  }
}
```