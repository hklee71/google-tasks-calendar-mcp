# Google Tasks Calendar MCP Server - Production OAuth Solution

## Overview
This MCP server provides Google Tasks and Calendar integration with permanent OAuth2.0 authentication in Production mode.

## ✅ Production Solution (CURRENT)

### Authentication Status
- **Mode**: Production (permanent tokens, no 7-day expiration)
- **OAuth Flow**: `http://localhost` redirect (Google compliant)
- **Token Storage**: `.env` file with permanent refresh token
- **Status**: ✅ WORKING

### Key Files
- **`get-refresh-token-localhost-standard.js`** - Production authentication script
- **`.env`** - Contains permanent OAuth credentials (DO NOT DELETE)
- **Main MCP server files** - Standard Node.js/TypeScript project

### If Token Renewal Ever Needed
```bash
# Only needed if you manually revoke access or change scopes
cd C:\Users\hklee\source\mcp-servers\google-task-calendar
node get-refresh-token-localhost-standard.js
# Then restart Claude Desktop
```

## 🗂️ Archived Files
Deprecated authentication scripts moved to `archive/deprecated-auth-scripts/`:
- `get-refresh-token.js` - Old OOB flow (blocked by Google)
- `get-refresh-token-localhost.js` - First localhost attempt
- `get-refresh-token-updated.js` - Intermediate version
- `debug-auth.js` - Debugging scripts
- `desktop-oauth.js` - Testing files
- `oauth-server.js` - Temporary server

## 🎯 Success Metrics
- **Google Tasks**: 3 task lists accessible
- **Google Calendar**: 6 calendars accessible  
- **Token Expiration**: Never (Production mode)
- **Manual Renewal**: Not required

## 🔧 Technical Details
- **OAuth Client Type**: Desktop Application
- **Redirect URI**: `http://localhost` (auto-configured for desktop apps)
- **Scopes**: Tasks + Calendar (full management)
- **Security**: Production mode with permanent authentication

---
**Last Updated**: July 17, 2025
**Status**: Production Ready ✅
