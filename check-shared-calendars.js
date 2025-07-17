import { google } from 'googleapis';
import 'dotenv/config';

// OAuth2 Authentication Setup (temporary for checking shared calendars)
// NOTE: Create a .env file with your Google OAuth credentials:
// GOOGLE_CLIENT_ID=your_client_id
// GOOGLE_CLIENT_SECRET=your_client_secret  
// GOOGLE_REFRESH_TOKEN=your_refresh_token

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'urn:ietf:wg:oauth:2.0:oob'
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

async function listSharedCalendars() {
  try {
    console.log('🔍 Checking shared calendars with OAuth (personal account access)...\n');
    
    // Get all calendars accessible through your personal account
    const response = await calendar.calendarList.list();
    
    if (!response.data.items || response.data.items.length === 0) {
      console.log('❌ No calendars found');
      return;
    }
    
    console.log(`📅 Found ${response.data.items.length} calendar(s):\n`);
    
    response.data.items.forEach((cal, index) => {
      console.log(`${index + 1}. 📋 ${cal.summary || 'Unnamed Calendar'}`);
      console.log(`   📧 ID: ${cal.id}`);
      console.log(`   👤 Access Role: ${cal.accessRole || 'unknown'}`);
      console.log(`   🏠 Primary: ${cal.primary ? 'Yes' : 'No'}`);
      console.log(`   🎨 Background: ${cal.backgroundColor || 'default'}`);
      
      if (cal.description) {
        console.log(`   📝 Description: ${cal.description}`);
      }
      
      // Check if it's shared (not primary and has specific access role)
      if (!cal.primary && cal.accessRole) {
        console.log(`   🔗 SHARED CALENDAR (Access: ${cal.accessRole})`);
      }
      
      console.log('');
    });
    
    // Summary
    const sharedCalendars = response.data.items.filter(cal => !cal.primary);
    const primaryCalendar = response.data.items.find(cal => cal.primary);
    
    console.log('📊 SUMMARY:');
    console.log(`   🏠 Primary calendar: ${primaryCalendar ? primaryCalendar.summary : 'Not found'}`);
    console.log(`   🔗 Shared calendars: ${sharedCalendars.length}`);
    
    if (sharedCalendars.length > 0) {
      console.log('\n🎯 SHARED CALENDARS DETAILS:');
      sharedCalendars.forEach((cal, index) => {
        console.log(`   ${index + 1}. ${cal.summary} (${cal.accessRole})`);
        console.log(`      Calendar ID: ${cal.id}`);
      });
      
      console.log('\n💡 CALENDAR SHARING INFO:');
      console.log('   These calendars are shared with your account:');
      console.log('   📧 hklee71@gmail.com');
    }
    
  } catch (error) {
    console.error('❌ Error checking calendars:', error.message);
    
    if (error.message.includes('invalid_grant')) {
      console.log('\n🔧 OAuth token may be expired. Please regenerate OAuth credentials.');
      console.log('   Run: node get-refresh-token.js');
    }
  }
}

listSharedCalendars().catch(console.error);
