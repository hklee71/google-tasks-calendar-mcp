# Claude Code Setup Instructions for Remote MCP Development

## Project Context
You are helping develop a **Google Task Calendar Remote MCP Server** - converting a local MCP server with 10 tools (5 Google Tasks + 5 Google Calendar) to a remote MCP server with Claude AI integration.

## Project Location
- **Windows Path**: `C:\Users\hklee\source\mcp-servers\google-task-calendar`
- **WSL Path**: `/mnt/c/Users/hklee/source/mcp-servers/google-task-calendar`

## Available Documentation
The following comprehensive project documents are available in the `docs/` directory:

### 1. Product Requirements Document (`docs/PRD.md`)
- Complete project overview and requirements
- 10 tools functionality specification (Tasks + Calendar)
- OAuth 2.1 and SSE transport requirements
- Performance, security, and deployment requirements
- Success criteria and risk assessment

### 2. Development Plan (`docs/DEVELOPMENT_PLAN.md`)
- 4-phase implementation roadmap
- Detailed milestones and checkpoints
- Git workflow and Docker development strategy
- Testing and validation procedures

### 3. Coding Guidelines (`docs/CODING_GUIDELINES.md`)
- TypeScript configuration and code organization
- OAuth 2.1 and PKCE implementation patterns
- Error handling and security best practices
- Testing framework and Docker configuration

### 4. Documentation Guidelines (`docs/DOCUMENTATION_GUIDELINES.md`)
- JSDoc documentation standards
- Project maintenance procedures
- Memory graph tracking for development progress

## Current Implementation Analysis
The existing local server is at `src/index.ts` with:
- **10 MCP Tools**: 5 Google Tasks + 5 Google Calendar tools
- **Transport**: StdioServerTransport (needs conversion to SSE)
- **Authentication**: Working Google OAuth2 credentials in `.env`
- **Technology**: MCP SDK v0.6.0 + googleapis v149.0.0

## Development Environment Setup

### Required Dependencies
```bash
# Navigate to project directory in WSL
cd /mnt/c/Users/hklee/source/mcp-servers/google-task-calendar

# Install existing dependencies
npm install

# Install additional dependencies for remote MCP
npm install express cors helmet rate-limiter-flexible
npm install jsonwebtoken uuid
npm install @types/express @types/cors @types/jsonwebtoken @types/uuid
npm install zod winston
```

### Git Workflow
```bash
# Create development branch
git checkout -b feature/remote-mcp-conversion

# Feature-specific branches as needed
git checkout -b oauth-implementation
git checkout -b sse-transport
git checkout -b docker-deployment
```
## Implementation Priorities

### Phase 1: Foundation (Start Here)
1. **Analyze Current Implementation**
   - Review `src/index.ts` - understand all 10 tools
   - Examine existing `.env` file structure
   - Map StdioServerTransport usage patterns

2. **Create Project Structure** 
   ```bash
   mkdir -p src/{auth,transport,tools,google,config,utils}
   mkdir -p tests/{unit,integration,fixtures,helpers}
   ```

3. **Environment Variable Enhancement**
   - Preserve existing Google API credentials
   - Add OAuth 2.1 security variables
   - Create environment validation with Zod

### Phase 2: OAuth 2.1 Implementation
1. **Discovery Endpoints** (RFC 8414)
   - `/.well-known/oauth-authorization-server`
   - `/.well-known/mcp`

2. **PKCE Implementation** (RFC 7636)
   - Code verifier/challenge generation
   - Secure challenge verification
   - Token exchange with PKCE validation

3. **Dynamic Client Registration** (RFC 7591)
   - Claude AI client registration endpoint
   - Client credential management

### Phase 3: SSE Transport Layer
1. **Replace StdioServerTransport**
   - Implement SSEServerTransport from MCP SDK
   - Multi-client connection management
   - Session tracking and cleanup

2. **HTTP Endpoints**
   - `/sse` - Server-Sent Events connection
   - `/messages` - MCP message handling
   - `/health` - Container health checks
   - `/` - Server discovery information

### Phase 4: Tool Preservation
1. **Maintain Tool Functionality**
   - Copy all 10 tool handlers exactly
   - Preserve Google API integration
   - Keep identical input/output schemas

2. **Error Handling Enhancement**
   - Google API quota and rate limit handling
   - OAuth token refresh logic
   - Graceful connection failure recovery

## Critical Requirements

### Authentication Flow
Claude AI will:
1. GET `/.well-known/mcp` → Server discovery
2. POST `/oauth/register` → Register as client
3. GET `/oauth/authorize` → PKCE authorization
4. POST `/oauth/token` → Exchange code for token
5. GET `/sse` → Establish SSE connection (with Bearer token)

### Tool Compatibility
ALL 10 tools must work identically:
- **Google Tasks**: list_task_lists, list_tasks, add_task, update_task, delete_task
- **Google Calendar**: list_calendars, list_events, create_event, update_event, delete_event

### Performance Requirements
- Response time: < 2 seconds per tool
- Memory usage: < 256MB
- CPU usage: < 10% on NAS
- Concurrent connections: 5+ simultaneous

## Security Considerations

### Environment Variables
```env
# Existing Google API credentials (preserve exactly)
GOOGLE_CLIENT_ID=existing_value
GOOGLE_CLIENT_SECRET=existing_value
GOOGLE_REFRESH_TOKEN=existing_value

# New OAuth 2.1 security
OAUTH_SIGNING_KEY=rsa_private_key_pem_format
SESSION_SECRET=32_plus_character_random_string
```

### Container Security
- Non-root user execution
- Minimal base image (node:20-alpine)
- No hardcoded credentials
- Health check endpoints
## Docker Development

### Development Dockerfile
```dockerfile
FROM node:20-alpine AS development
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3001
CMD ["npm", "run", "dev"]
```

### Production Multi-stage Build
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json tsconfig.json ./
RUN npm ci --only=production
COPY src/ ./src/
RUN npm run build

FROM node:20-alpine AS production
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
WORKDIR /app
COPY --from=builder --chown=nodejs:nodejs /app/build ./build
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
USER nodejs
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1
CMD ["node", "build/index.js"]
```

### Docker Compose for Development
```yaml
version: '3.8'
services:
  mcp-server:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "3001:3001"
    volumes:
      - .:/app
      - /app/node_modules
    env_file:
      - .env
    command: npm run dev
```

## Testing Strategy

### Unit Tests
```bash
# Run unit tests
npm run test:unit

# Test OAuth components
npm run test:auth

# Test tool functionality
npm run test:tools
```

### Integration Tests
```bash
# End-to-end OAuth flow
npm run test:oauth-flow

# SSE transport testing
npm run test:sse

# Google API integration
npm run test:google-api
```

### Manual Testing
```bash
# Start development server
npm run dev

# Test endpoints
curl http://localhost:3001/.well-known/mcp
curl http://localhost:3001/health
curl -H "Authorization: Bearer test" http://localhost:3001/sse
```

## Deployment Target

### Synology NAS Configuration
- **Port**: 3001 (internal)
- **Domain**: https://task.wandermusings.com
- **Method**: Container Manager + Cloudflare tunnel
- **Resources**: 256MB RAM, 0.5 CPU cores
### Validation Checklist
- [ ] All 10 tools work identically to local version
- [ ] OAuth 2.1 flow completes successfully with Claude AI
- [ ] SSE transport handles multiple connections
- [ ] Container builds and runs on NAS
- [ ] External access via Cloudflare tunnel works
- [ ] Claude AI integration succeeds on web and mobile

## Common Issues & Solutions

### OAuth 2.1 Debugging
```bash
# Test discovery endpoints
curl https://task.wandermusings.com/.well-known/mcp | jq .
curl https://task.wandermusings.com/.well-known/oauth-authorization-server | jq .

# Test client registration
curl -X POST https://task.wandermusings.com/oauth/register \
  -H "Content-Type: application/json" \
  -d '{"client_name":"Test Client","redirect_uris":["http://localhost:8080/callback"]}'
```

### SSE Connection Issues
```bash
# Test SSE endpoint
curl -N -H "Accept: text/event-stream" \
     -H "Authorization: Bearer valid-token" \
     https://task.wandermusings.com/sse

# Check connection logs
docker logs google-tasks-calendar-mcp
```

### Google API Integration
```bash
# Verify credentials
curl -H "Authorization: Bearer $GOOGLE_ACCESS_TOKEN" \
     https://www.googleapis.com/tasks/v1/users/@me/lists
```

## Development Workflow

### Daily Development
1. **Start in WSL**:
   ```bash
   cd /mnt/c/Users/hklee/source/mcp-servers/google-task-calendar
   ```

2. **Check current status**:
   ```bash
   git status
   npm run test
   ```

3. **Implement features** following the phase-by-phase plan

4. **Test continuously**:
   ```bash
   npm run dev  # Start development server
   npm run test:unit  # Run unit tests
   docker-compose up  # Test containerization
   ```

5. **Commit progress**:
   ```bash
   git add .
   git commit -m "feat: implement OAuth discovery endpoints"
   ```

### Key Success Indicators
- OAuth 2.1 discovery endpoints return valid JSON
- PKCE implementation passes security tests
- All 10 Google API tools work via SSE transport
- Container builds without errors
- Claude AI integration test succeeds

## Memory Graph Tracking
Document progress in Claude's memory:
- Implementation decisions and rationale
- Issues encountered and solutions found
- Performance benchmarks and optimizations
- Security considerations and validations
- Deployment configurations and results

This ensures continuity across development sessions and provides context for troubleshooting.