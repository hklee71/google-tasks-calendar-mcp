# Remote MCP Development Plan & Implementation Guide

## Overview
This plan provides step-by-step guidance for converting the local Google Task Calendar MCP server to a remote MCP server with Claude AI integration. The plan is optimized for efficient development using git version control and Docker sandbox testing.

## Project Phases & Milestones

### Phase 1: Analysis & Setup (Sprint 1)
**Objective**: Understand current implementation and prepare development environment

#### Milestone 1.1: Code Analysis & Documentation
- [ ] **Analyze existing source code** (`src/index.ts`)
  - Document all 10 tools and their Google API interactions
  - Map current StdioServerTransport usage patterns
  - Identify OAuth2 credential management approach
  - Create tool compatibility matrix

- [ ] **Environment Setup**
  - Create new git branch: `feature/remote-mcp-conversion`
  - Copy existing `.env` file for credential preservation
  - Initialize new directory structure for remote MCP
  - Set up Docker development environment

- [ ] **Dependencies Analysis**
  - Review MCP SDK v0.6.0 capabilities for SSE transport
  - Research OAuth 2.1 implementation libraries
  - Identify additional packages needed for remote MCP
  - Create updated `package.json` with new dependencies

#### Milestone 1.2: Architecture Design
- [ ] **Transport Layer Design**
  - Design SSE transport replacement for StdioServerTransport
  - Plan HTTP endpoint structure for Claude AI compatibility
  - Define authentication flow integration points
  - Create connection management strategy

- [ ] **Docker Configuration**
  - Design multi-stage Dockerfile for production build
  - Plan environment variable management
  - Design health check implementation
  - Create docker-compose.yml for development and production

### Phase 2: Core Implementation (Sprint 2)
**Objective**: Implement OAuth 2.1 and SSE transport layers

#### Milestone 2.1: OAuth 2.1 Foundation
- [ ] **Discovery Endpoints Implementation**
  ```typescript
  // Implement required endpoints
  app.get('/.well-known/oauth-authorization-server', handleOAuthDiscovery);
  app.get('/.well-known/mcp', handleMcpDiscovery);
  ```

- [ ] **Dynamic Client Registration**
  ```typescript
  // Claude AI client registration
  app.post('/oauth/register', handleClientRegistration);
  ```

- [ ] **PKCE Implementation**
  ```typescript
  // Proof Key for Code Exchange support
  app.get('/oauth/authorize', handleAuthorizationWithPKCE);
  app.post('/oauth/token', handleTokenExchangeWithPKCE);
  ```

#### Milestone 2.2: SSE Transport Implementation
- [ ] **SSE Server Setup**
  ```typescript
  // Replace StdioServerTransport with SSEServerTransport
  import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
  
  app.get('/sse', authenticateBearer, handleSSEConnection);
  app.post('/messages', authenticateBearer, handleMcpMessages);
  ```

- [ ] **Connection Management**
  - Implement session tracking for multiple Claude AI clients
  - Create connection cleanup on client disconnect
  - Add connection state validation

- [ ] **Authentication Middleware**
  ```typescript
  // Bearer token validation
  function authenticateBearer(req: Request, res: Response, next: NextFunction) {
    // Validate OAuth access token
    // Set user context for Google API calls
  }
  ```
#### Milestone 2.3: Tool Integration
- [ ] **Preserve Existing Tool Logic**
  - Copy all 10 tool handlers from `src/index.ts`
  - Ensure Google API OAuth2 client initialization
  - Maintain identical input/output schemas
  - Preserve error handling patterns

- [ ] **Tool Router Enhancement**
  ```typescript
  // Enhanced tool routing for remote access
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    // Add request logging
    // Preserve existing tool logic
    // Add response timing metrics
  });
  ```

### Phase 3: Integration & Testing (Sprint 3)
**Objective**: Integrate components and validate functionality

#### Milestone 3.1: Component Integration
- [ ] **Server Assembly**
  ```typescript
  // Main server class combining OAuth + MCP + Tools
  class RemoteGoogleTasksCalendarServer {
    private mcpServer: Server;
    private expressApp: Express;
    private oauthManager: OAuth2Manager;
    
    constructor() {
      this.setupExpress();
      this.setupOAuth();
      this.setupMCP();
      this.setupTools();
    }
  }
  ```

- [ ] **Configuration Management**
  - Environment variable validation
  - Configuration file loading
  - Default value handling
  - Security credential protection
- [ ] **Error Handling**
  - Centralized error logging
  - Google API error translation
  - OAuth error responses
  - MCP protocol error handling

#### Milestone 3.2: Docker Containerization
- [ ] **Production Dockerfile**
  ```dockerfile
  # Multi-stage build for optimization
  FROM node:20-alpine AS builder
  # Build stage implementation
  
  FROM node:20-alpine AS production  
  # Production stage with security hardening
  ```

- [ ] **Docker Compose Configuration**
  ```yaml
  # docker-compose.yml for NAS deployment
  version: '3.8'
  services:
    google-tasks-calendar-mcp:
      build: .
      ports:
        - "3001:3001"
      env_file: .env
      restart: unless-stopped
      healthcheck:
        test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
  ```

#### Milestone 3.3: Testing Implementation
- [ ] **Unit Tests**
  ```typescript
  // OAuth flow testing
  describe('OAuth 2.1 Implementation', () => {
    test('PKCE code challenge generation', () => {});
    test('Token validation', () => {});
    test('Client registration', () => {});
  });
  
  // Tool functionality testing
  describe('MCP Tools', () => {
    test('Google Tasks integration', () => {});
    test('Google Calendar integration', () => {});
    test('Error handling', () => {});
  });
  ```
- [ ] **Integration Tests**
  ```typescript
  // End-to-end OAuth flow
  describe('Claude AI Integration', () => {
    test('Complete authentication flow', () => {});
    test('SSE connection establishment', () => {});
    test('Tool execution via remote MCP', () => {});
  });
  ```

### Phase 4: Deployment & Validation (Sprint 4)
**Objective**: Deploy to production and validate Claude AI integration

#### Milestone 4.1: NAS Deployment
- [ ] **Container Manager Setup**
  - Upload docker-compose.yml to NAS
  - Configure environment variables securely
  - Deploy container via Container Manager UI
  - Verify container health and logs

- [ ] **Cloudflare Integration**
  - Verify tunnel routing to port 3001
  - Test HTTPS endpoint accessibility
  - Validate SSL certificate functionality
  - Confirm DNS resolution

#### Milestone 4.2: Claude AI Integration
- [ ] **Integration Testing**
  - Add remote MCP to Claude.ai integrations
  - Test OAuth flow with Claude AI client
  - Validate all 10 tools functionality
  - Test concurrent access scenarios

- [ ] **Performance Validation**
  - Measure tool execution response times
  - Monitor container resource usage
  - Test connection stability
  - Validate error recovery

#### Milestone 4.3: Documentation & Monitoring
- [ ] **User Documentation**
  - Installation and setup guide
  - Troubleshooting procedures
  - Claude AI integration steps
  - Configuration reference

- [ ] **Operational Documentation**
  - Container management procedures
  - Log analysis guide
  - Security best practices
  - Backup and recovery procedures
## Git Workflow Strategy

### Branch Management
```bash
# Main development branch
git checkout -b feature/remote-mcp-conversion

# Feature-specific branches
git checkout -b oauth-implementation
git checkout -b sse-transport
git checkout -b docker-deployment
```

### Commit Guidelines
```bash
# Atomic commits with descriptive messages
git commit -m "feat: implement OAuth 2.1 discovery endpoints"
git commit -m "refactor: replace StdioServerTransport with SSE"
git commit -m "docker: add production Dockerfile configuration"
git commit -m "test: add OAuth flow integration tests"
```

### Code Review Process
- **Self-review**: Check code quality and documentation before commit
- **Security review**: Validate OAuth implementation and credential handling
- **Functionality review**: Ensure all 10 tools work identically
- **Performance review**: Verify resource usage and response times

## Docker Development Workflow

### Local Development Environment
```bash
# Development with live reload
docker-compose -f docker-compose.dev.yml up --build

# Production simulation
docker-compose -f docker-compose.prod.yml up --build

# Testing environment
docker-compose -f docker-compose.test.yml up --build
```

### Container Testing Strategy
```bash
# Health check validation
curl http://localhost:3001/health

# OAuth discovery testing
curl http://localhost:3001/.well-known/mcp

# SSE endpoint testing
curl -H "Authorization: Bearer test-token" http://localhost:3001/sse

# Tool functionality testing
# (via MCP Inspector or custom test client)
```