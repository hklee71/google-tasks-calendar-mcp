# Google Task Calendar Remote MCP Server

## Quick Project Overview

**Objective**: Convert local Google Task Calendar MCP server to remote MCP server with Claude AI integration

**Current State**: Local MCP with 10 tools (5 Google Tasks + 5 Google Calendar) using StdioServerTransport
**Target State**: Remote MCP with OAuth 2.1 + SSE transport for Claude AI integration via https://task.wandermusings.com

## Project Structure
```
docs/
├── PRD.md                          # Complete product requirements
├── DEVELOPMENT_PLAN.md             # 4-phase implementation plan
├── CODING_GUIDELINES.md            # Technical implementation standards
├── DOCUMENTATION_GUIDELINES.md     # Documentation and maintenance
└── CLAUDE_CODE_INSTRUCTIONS.md     # This file - WSL development guide

src/
└── index.ts                        # Current local server implementation

.env                                 # Working Google API credentials
package.json                        # Current dependencies
tsconfig.json                       # TypeScript configuration
```

## Current Implementation (src/index.ts)
- **10 MCP Tools**: Complete Google Tasks and Calendar management
- **Authentication**: Pre-configured Google OAuth2 credentials
- **Transport**: StdioServerTransport (local only)
- **Technology Stack**: MCP SDK v0.6.0 + googleapis v149.0.0

## Required Conversion
1. **Transport**: StdioServerTransport → SSEServerTransport
2. **Authentication**: Add OAuth 2.1 with PKCE for Claude AI
3. **Endpoints**: Add HTTP endpoints (/, /health, /sse, /messages, /oauth/*)
4. **Deployment**: Docker container for Synology NAS (port 3001)
5. **Access**: Via Cloudflare tunnel at https://task.wandermusings.com

## Development Environment
- **OS**: WSL2 Ubuntu 24.04.2 LTS
- **Node**: v20+
- **Project Path**: `/mnt/c/Users/hklee/source/mcp-servers/google-task-calendar`
- **Git**: Feature branch development with atomic commits

## Success Criteria
- [ ] All 10 tools work identically via remote MCP
- [ ] Claude AI integration successful (web + mobile)
- [ ] OAuth 2.1 compliance with PKCE authentication
- [ ] Production deployment on NAS with 24/7 availability
- [ ] Performance: <2s response time, <256MB memory, <10% CPU

## Next Steps
1. Read `docs/CLAUDE_CODE_INSTRUCTIONS.md` for detailed development guidance
2. Review `docs/PRD.md` for complete requirements
3. Follow `docs/DEVELOPMENT_PLAN.md` phase-by-phase implementation
4. Use `docs/CODING_GUIDELINES.md` for technical standards

Start with Phase 1: Analysis & Setup → Create project structure → Implement OAuth 2.1 foundation