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

## Environment Setup

Before running utility scripts, create a `.env` file in the project root with your Google OAuth credentials:

```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REFRESH_TOKEN=your_refresh_token_here
```

⚠️ **Security Note**: The `.env` file is excluded from git tracking to protect your credentials.
- **delete_event** - Remove events from calendars

## Authentication

This server uses **OAuth2 authentication** to securely access your personal Google account data. The setup includes:

- Google Cloud Console project configuration
- OAuth2 client credentials (Client ID and Secret)
- User-authorized refresh token for ongoing access
- Secure credential storage in `.env` file

## Setup

### Prerequisites
- Node.js (v20 or higher)
- Google Cloud Console project with Tasks and Calendar APIs enabled
- OAuth2 credentials configured for desktop application

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure OAuth2 credentials:**
   ```bash
   # Generate OAuth2 token
   npm run generate-token
   ```
   Follow the prompts to authorize and obtain your refresh token.

3. **Create `.env` file:**
   ```env
   GOOGLE_CLIENT_ID=your_client_id_here
   GOOGLE_CLIENT_SECRET=your_client_secret_here
   GOOGLE_REFRESH_TOKEN=your_refresh_token_here
   ```

4. **Build the server:**
   ```bash
   npm run build
   ```

### Claude Desktop Integration

Add to your Claude Desktop configuration (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "google-task-calendar": {
      "command": "node",
      "args": ["C:/path/to/google-task-calendar/build/index.js"],
      "env": {}
    }
  }
}
```

## Development

### Build and Watch
```bash
npm run build         # One-time build
npm run watch         # Watch mode for development
```

### Testing
```bash
npm run test-calendar # Test calendar access
npm run inspector     # MCP Inspector for debugging
```

### Debugging

Since MCP servers communicate over stdio, debugging can be challenging. Use the [MCP Inspector](https://github.com/modelcontextprotocol/inspector):

```bash
npm run inspector
```

The Inspector provides a URL to access debugging tools in your browser.

## Security

- OAuth2 credentials are stored locally in `.env` file
- No service account or API keys required
- Uses official Google APIs with user consent
- Credentials are never exposed to external services

## Google API Scopes

This server requests the following OAuth2 scopes:
- `https://www.googleapis.com/auth/tasks` - Full Google Tasks access
- `https://www.googleapis.com/auth/tasks.readonly` - Read-only Tasks access
- `https://www.googleapis.com/auth/calendar` - Full Google Calendar access
- `https://www.googleapis.com/auth/calendar.events` - Calendar events management
- `https://www.googleapis.com/auth/calendar.app.created` - Secondary calendar access

## License

MIT License - See LICENSE file for details.
