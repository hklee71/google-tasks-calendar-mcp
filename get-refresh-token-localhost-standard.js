import { google } from 'googleapis';
import { createServer } from 'http';
import { URL } from 'url';
import { exec } from 'child_process';
import 'dotenv/config';

// NOTE: Create a .env file with your Google OAuth credentials:
// GOOGLE_CLIENT_ID=your_client_id  
// GOOGLE_CLIENT_SECRET=your_client_secret

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'your_client_id_here';
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'your_client_secret_here';
const REDIRECT_URI = 'http://localhost';  // Changed from localhost:8080 to just localhost
const PORT = 80;  // Changed to port 80 for standard localhost

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

const scopes = [
  // Google Tasks scopes
  'https://www.googleapis.com/auth/tasks',
  'https://www.googleapis.com/auth/tasks.readonly',
  // Google Calendar scopes - Full Management (includes shared calendars)
  'https://www.googleapis.com/auth/calendar',                    // MASTER SCOPE: Full access to ALL calendars (personal + shared based on privileges)
  'https://www.googleapis.com/auth/calendar.events',             // Events read/write/delete (redundant with calendar but explicit)
  'https://www.googleapis.com/auth/calendar.app.created',        // Manage secondary calendars you create
];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: scopes,
});

console.log('🚀 Starting OAuth authentication server...');
console.log('📱 Opening browser for authentication...');
console.log('🔗 Auth URL:', authUrl);

// Create local server to handle OAuth callback
const server = createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  
  if (url.pathname === '/' && (url.searchParams.has('code') || url.searchParams.has('error'))) {
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');
    
    if (error) {
      res.writeHead(400, { 'Content-Type': 'text/html' });
      res.end(`
        <html>
          <body>
            <h1>❌ Authentication Failed</h1>
            <p>Error: ${error}</p>
            <p>You can close this window.</p>
          </body>
        </html>
      `);
      console.error('❌ Authentication error:', error);
      server.close();
      return;
    }
    
    if (code) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <html>
          <body>
            <h1>✅ Authentication Successful!</h1>
            <p>Authorization code received. Processing tokens...</p>
            <p>You can close this window.</p>
            <script>window.close();</script>
          </body>
        </html>
      `);
      
      // Exchange code for tokens
      exchangeCodeForTokens(code);
      server.close();
    }
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <html>
        <body>
          <h1>🔄 Google OAuth Authentication</h1>
          <p>Waiting for authentication callback...</p>
          <p>Please complete the authentication in your browser.</p>
        </body>
      </html>
    `);
  }
});

async function exchangeCodeForTokens(code) {
  try {
    console.log('🔄 Exchanging authorization code for tokens...');
    const { tokens } = await oauth2Client.getToken(code);
    
    console.log('\n✅ SUCCESS! Tokens received:');
    console.log('🔑 Refresh Token:', tokens.refresh_token);
    console.log('🎯 Access Token:', tokens.access_token);
    console.log('⏰ Expires:', new Date(tokens.expiry_date));
    console.log('\n📝 Full Token Object:');
    console.log(JSON.stringify(tokens, null, 2));
    
    // Save to .env file
    const envContent = `GOOGLE_CLIENT_ID=${CLIENT_ID}
GOOGLE_CLIENT_SECRET=${CLIENT_SECRET}
GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}
`;
    
    await import('fs/promises').then(fs => 
      fs.writeFile('.env', envContent, 'utf8')
    );
    
    console.log('\n💾 Tokens saved to .env file');
    console.log('🎉 Setup complete! Your MCP server can now authenticate with Google.');
    
  } catch (error) {
    console.error('❌ Error exchanging code for tokens:', error.message);
  }
  
  process.exit(0);
}

// Try different ports if 80 is not available
const tryPorts = [80, 8080, 3000, 8000];
let portIndex = 0;

function startServer() {
  const currentPort = tryPorts[portIndex];
  
  server.listen(currentPort, () => {
    console.log(`🌐 OAuth callback server listening on http://localhost:${currentPort}`);
    
    // Open browser automatically
    const startCommand = process.platform === 'win32' ? 'start' : 
                        process.platform === 'darwin' ? 'open' : 'xdg-open';
    
    exec(`${startCommand} "${authUrl}"`, (error) => {
      if (error) {
        console.log('⚠️  Could not open browser automatically. Please manually visit:');
        console.log(authUrl);
      }
    });
    
    console.log('\n⏳ Waiting for authentication... (will open browser automatically)');
  });
  
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      portIndex++;
      if (portIndex < tryPorts.length) {
        console.log(`⚠️  Port ${currentPort} in use, trying port ${tryPorts[portIndex]}...`);
        startServer();
      } else {
        console.error(`❌ All ports (${tryPorts.join(', ')}) are in use. Please close other applications.`);
        process.exit(1);
      }
    } else {
      console.error('❌ Server error:', err);
      process.exit(1);
    }
  });
}

// Start server
startServer();
