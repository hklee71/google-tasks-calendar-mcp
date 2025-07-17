# Google Tasks & Calendar MCP Server

✅ **Production Ready** - A Model Context Protocol server for Google Tasks and Google Calendar integration with permanent OAuth2 authentication.

This TypeScript-based MCP server provides comprehensive access to your Google Tasks and Calendar data through Claude Desktop, enabling you to manage tasks, events, and calendars directly through AI conversations.

## Features

### Google Tasks
- **list_task_lists** - List all your Google Task lists
- **list_tasks** - View tasks within a specific task list
- **add_task** - Create new tasks with title and optional notes
- **update_task** - Modify existing tasks (title, notes, status)
- **delete_task** - Remove tasks from task lists

### Google Calendar
- **list_calendars** - List all your accessible calendars
- **list_events** - View events from specific calendars with time filtering
- **create_event** - Create new calendar events with full details
- **update_event** - Modify existing events (title, time, location, etc.)
- **delete_event** - Remove events from calendars

## Prerequisites

- **Node.js v20 or higher** - [Download Node.js](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** (for cloning the repository)
- **Google Cloud Console project** with Tasks and Calendar APIs enabled

## Installation

### Step 1: Clone the Repository

```bash
# Navigate to your desired directory
cd C:\Users\[USERNAME]\source\mcp-servers

# Create target directory
mkdir google-task-calendar-clone
cd google-task-calendar-clone

# Clone the repository
git clone https://github.com/hklee71/google-tasks-calendar-mcp .
```

### Step 2: Install Dependencies

⚠️ **Important**: Install dependencies in the correct order to avoid build errors.

```bash
# Install all project dependencies
npm install

# Verify TypeScript types are installed (should already be included)
npm install --save-dev @types/node

# Verify core MCP dependencies (should already be included)
npm install @modelcontextprotocol/sdk googleapis
```

**Troubleshooting Dependencies:**
If you encounter "Cannot find module" errors during build:

```bash
# Clean installation (if needed)
rmdir /s /q node_modules    # Windows
rm -rf node_modules         # macOS/Linux
del package-lock.json       # Windows
rm package-lock.json        # macOS/Linux

# Fresh install
npm install
```

### Step 3: Build the Project

```bash
npm run build
```

**Expected Output:**
- No TypeScript compilation errors
- `build/` directory created with compiled JavaScript
- `build/index.js` made executable
- Security audit shows "0 vulnerabilities"

**Common Build Issues:**

| Error | Solution |
|-------|----------|
| `Cannot find module '@modelcontextprotocol/sdk'` | Run `npm install` |
| `Cannot find name 'process'` | Run `npm install --save-dev @types/node` |
| `Cannot find module 'googleapis'` | Run `npm install googleapis` |
| Missing `node_modules` directory | Run `npm install` first |

### Step 4: Configure Google Cloud Console

1. **Create Google Cloud Project:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one

2. **Enable Required APIs:**
   ```
   - Google Tasks API
   - Google Calendar API
   ```

3. **Create OAuth2 Credentials:**
   - Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
   - Application type: "Desktop application"
   - Download the JSON file

4. **Configure OAuth Consent Screen:**
   - Set application name and user support email
   - Add test users (your Gmail address)
   - Add required scopes (see scopes section below)

### Step 5: Generate OAuth2 Token

```bash
# Generate your personal refresh token
npm run generate-token
```

Follow the prompts to:
1. Enter your Client ID and Client Secret
2. Open the authorization URL in your browser
3. Grant permissions to your Google account
4. Copy the authorization code back to the terminal

### Step 6: Create Environment File

Create a `.env` file in the project root:

```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REFRESH_TOKEN=your_refresh_token_here
```

⚠️ **Security Note**: The `.env` file is excluded from git tracking to protect your credentials.

### Step 7: Test the Installation

```bash
# Test calendar access
npm run test-calendar

# Test MCP server with inspector
npm run inspector
```

### Step 8: Claude Desktop Integration

Add to your Claude Desktop configuration (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "google-task-calendar": {
      "command": "node",
      "args": ["C:/Users/[USERNAME]/source/mcp-servers/google-task-calendar-clone/build/index.js"],
      "env": {}
    }
  }
}
```

**Replace `[USERNAME]` with your actual Windows username.**

## Development Commands

```bash
npm run build         # Build TypeScript to JavaScript
npm run watch         # Watch mode for development
npm run test-calendar # Test calendar access
npm run inspector     # MCP Inspector for debugging
npm run generate-token # Generate OAuth2 refresh token
```

## Security & Authentication

- **OAuth2 Flow**: Uses standard Google OAuth2 for secure authentication
- **Local Storage**: Credentials stored securely in local `.env` file
- **No External Services**: Direct connection to Google APIs only
- **User Consent**: Requires explicit permission for each Google account

## Google API Scopes

This server requests the following OAuth2 scopes:
- `https://www.googleapis.com/auth/tasks` - Full Google Tasks access
- `https://www.googleapis.com/auth/tasks.readonly` - Read-only Tasks access
- `https://www.googleapis.com/auth/calendar` - Full Google Calendar access
- `https://www.googleapis.com/auth/calendar.events` - Calendar events management
- `https://www.googleapis.com/auth/calendar.app.created` - Secondary calendar access

## Troubleshooting

### Build Errors
- **Missing dependencies**: Run `npm install` in project directory
- **TypeScript errors**: Ensure `@types/node` is installed
- **Permission errors**: Run terminal as administrator (Windows)

### Authentication Errors
- **Invalid credentials**: Regenerate OAuth2 token with `npm run generate-token`
- **Scope errors**: Check OAuth consent screen configuration
- **Token expired**: Refresh tokens should auto-renew; regenerate if needed

### Runtime Errors
- **API quota exceeded**: Check Google Cloud Console quotas
- **Calendar not found**: Ensure calendar ID is correct and accessible
- **Permission denied**: Verify OAuth scopes include required permissions

## Development Debugging

Since MCP servers communicate over stdio, debugging requires special tools:

```bash
# Use MCP Inspector for interactive debugging
npm run inspector
```

The Inspector provides a web interface at `http://localhost:3000` for testing MCP tools and viewing server responses.

## License

MIT License - See LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For issues and questions:
- Check the [Troubleshooting](#troubleshooting) section
- Review [Google Cloud Console](https://console.cloud.google.com/) setup
- Verify Node.js and npm versions meet requirements