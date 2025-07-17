#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { google } from 'googleapis';

// Task interfaces
interface ListTasksArgs {
  tasklistId: string;
}

interface AddTaskArgs {
  tasklistId: string;
  title: string;
  notes?: string;
}

interface UpdateTaskArgs {
  tasklistId: string;
  taskId: string;
  title?: string;
  notes?: string;
  status?: 'needsAction' | 'completed';
}

interface DeleteTaskArgs {
  tasklistId: string;
  taskId: string;
}

// Calendar interfaces
interface ListCalendarsArgs {
  // No required arguments - lists all calendars
}

interface ListEventsArgs {
  calendarId?: string;
  timeMin?: string;
  timeMax?: string;
  maxResults?: number;
}

interface CreateEventArgs {
  calendarId?: string;
  summary: string;
  description?: string;
  startDateTime: string;
  endDateTime: string;
  location?: string;
  timeZone?: string;
}

interface UpdateEventArgs {
  calendarId?: string;
  eventId: string;
  summary?: string;
  description?: string;
  startDateTime?: string;
  endDateTime?: string;
  location?: string;
  timeZone?: string;
}

interface DeleteEventArgs {
  calendarId?: string;
  eventId: string;
}

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
  throw new Error('GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN environment variables are required');
}

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  'urn:ietf:wg:oauth:2.0:oob'
);

oauth2Client.setCredentials({
  refresh_token: REFRESH_TOKEN,
});

const tasks = google.tasks({ version: 'v1', auth: oauth2Client });
const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

class GoogleTasksCalendarServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'google-tasks-calendar',
        version: '0.2.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        // Task tools
        {
          name: 'list_task_lists',
          description: 'List all Google Task lists for the authenticated user.',
          inputSchema: { type: 'object', properties: {} },
        },
        {
          name: 'list_tasks',
          description: 'List tasks within a specific Google Task list.',
          inputSchema: {
            type: 'object',
            properties: {
              tasklistId: {
                type: 'string',
                description: 'The ID of the task list to retrieve tasks from.',
              },
            },
            required: ['tasklistId'],
          },
        },
        {
          name: 'add_task',
          description: 'Add a new task to a specific Google Task list.',
          inputSchema: {
            type: 'object',
            properties: {
              tasklistId: {
                type: 'string',
                description: 'The ID of the task list to add the task to.',
              },
              title: {
                type: 'string',
                description: 'The title of the new task.',
              },
              notes: {
                type: 'string',
                description: 'Optional notes for the task.',
              },
            },
            required: ['tasklistId', 'title'],
          },
        },
        {
          name: 'update_task',
          description: 'Update an existing task in a Google Task list.',
          inputSchema: {
            type: 'object',
            properties: {
              tasklistId: {
                type: 'string',
                description: 'The ID of the task list containing the task.',
              },
              taskId: {
                type: 'string',
                description: 'The ID of the task to update.',
              },
              title: {
                type: 'string',
                description: 'The new title for the task (optional).',
              },
              notes: {
                type: 'string',
                description: 'New notes for the task (optional).',
              },
              status: {
                type: 'string',
                description: 'The status of the task (needsAction or completed) (optional).',
                enum: ['needsAction', 'completed'],
              },
            },
            required: ['tasklistId', 'taskId'],
          },
        },
        {
          name: 'delete_task',
          description: 'Delete a task from a Google Task list.',
          inputSchema: {
            type: 'object',
            properties: {
              tasklistId: {
                type: 'string',
                description: 'The ID of the task list containing the task.',
              },
              taskId: {
                type: 'string',
                description: 'The ID of the task to delete.',
              },
            },
            required: ['tasklistId', 'taskId'],
          },
        },
        // Calendar tools
        {
          name: 'list_calendars',
          description: 'List all Google Calendars for the authenticated user.',
          inputSchema: { type: 'object', properties: {} },
        },
        {
          name: 'list_events',
          description: 'List events from a specific Google Calendar.',
          inputSchema: {
            type: 'object',
            properties: {
              calendarId: {
                type: 'string',
                description: 'The ID of the calendar to retrieve events from. Defaults to primary calendar.',
              },
              timeMin: {
                type: 'string',
                description: 'Lower bound (inclusive) for an event\'s end time to filter by (RFC3339 timestamp).',
              },
              timeMax: {
                type: 'string',
                description: 'Upper bound (exclusive) for an event\'s start time to filter by (RFC3339 timestamp).',
              },
              maxResults: {
                type: 'number',
                description: 'Maximum number of events returned. Default is 10.',
              },
            },
          },
        },
        {
          name: 'create_event',
          description: 'Create a new event in Google Calendar.',
          inputSchema: {
            type: 'object',
            properties: {
              calendarId: {
                type: 'string',
                description: 'The ID of the calendar to create the event in. Defaults to primary calendar.',
              },
              summary: {
                type: 'string',
                description: 'The title/summary of the event.',
              },
              description: {
                type: 'string',
                description: 'Description of the event.',
              },
              startDateTime: {
                type: 'string',
                description: 'Start date and time (RFC3339 format, e.g., "2025-06-10T09:30:00+08:00").',
              },
              endDateTime: {
                type: 'string',
                description: 'End date and time (RFC3339 format, e.g., "2025-06-10T10:30:00+08:00").',
              },
              location: {
                type: 'string',
                description: 'Location of the event.',
              },
              timeZone: {
                type: 'string',
                description: 'Time zone for the event (e.g., "Asia/Kuala_Lumpur").',
              },
            },
            required: ['summary', 'startDateTime', 'endDateTime'],
          },
        },
        {
          name: 'update_event',
          description: 'Update an existing event in Google Calendar.',
          inputSchema: {
            type: 'object',
            properties: {
              calendarId: {
                type: 'string',
                description: 'The ID of the calendar containing the event. Defaults to primary calendar.',
              },
              eventId: {
                type: 'string',
                description: 'The ID of the event to update.',
              },
              summary: {
                type: 'string',
                description: 'The new title/summary of the event.',
              },
              description: {
                type: 'string',
                description: 'New description of the event.',
              },
              startDateTime: {
                type: 'string',
                description: 'New start date and time (RFC3339 format).',
              },
              endDateTime: {
                type: 'string',
                description: 'New end date and time (RFC3339 format).',
              },
              location: {
                type: 'string',
                description: 'New location of the event.',
              },
              timeZone: {
                type: 'string',
                description: 'Time zone for the event.',
              },
            },
            required: ['eventId'],
          },
        },
        {
          name: 'delete_event',
          description: 'Delete an event from Google Calendar.',
          inputSchema: {
            type: 'object',
            properties: {
              calendarId: {
                type: 'string',
                description: 'The ID of the calendar containing the event. Defaults to primary calendar.',
              },
              eventId: {
                type: 'string',
                description: 'The ID of the event to delete.',
              },
            },
            required: ['eventId'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        switch (request.params.name) {
          // Task handlers
          case 'list_task_lists': {
            const res = await tasks.tasklists.list();
            return {
              content: [{ type: 'text', text: JSON.stringify(res.data.items, null, 2) }],
            };
          }
          case 'list_tasks': {
            if (!request.params.arguments) {
              throw new McpError(ErrorCode.InvalidParams, 'Missing arguments for list_tasks');
            }
            const { tasklistId } = request.params.arguments as unknown as ListTasksArgs;
            const res = await tasks.tasks.list({ tasklist: tasklistId });
            return {
              content: [{ type: 'text', text: JSON.stringify(res.data.items, null, 2) }],
            };
          }
          case 'add_task': {
            if (!request.params.arguments) {
              throw new McpError(ErrorCode.InvalidParams, 'Missing arguments for add_task');
            }
            const { tasklistId, title, notes } = request.params.arguments as unknown as AddTaskArgs;
            const res = await tasks.tasks.insert({
              tasklist: tasklistId,
              requestBody: { title, notes },
            });
            return {
              content: [{ type: 'text', text: JSON.stringify(res.data, null, 2) }],
            };
          }
          case 'update_task': {
            if (!request.params.arguments) {
              throw new McpError(ErrorCode.InvalidParams, 'Missing arguments for update_task');
            }
            const { tasklistId, taskId, title, notes, status } = request.params.arguments as unknown as UpdateTaskArgs;
            const requestBody: { title?: string; notes?: string; status?: string } = {};
            if (title !== undefined) requestBody.title = title;
            if (notes !== undefined) requestBody.notes = notes;
            if (status !== undefined) requestBody.status = status;

            const res = await tasks.tasks.update({
              tasklist: tasklistId,
              task: taskId,
              requestBody: { id: taskId, ...requestBody },
            });
            return {
              content: [{ type: 'text', text: JSON.stringify(res.data, null, 2) }],
            };
          }
          case 'delete_task': {
            if (!request.params.arguments) {
              throw new McpError(ErrorCode.InvalidParams, 'Missing arguments for delete_task');
            }
            const { tasklistId, taskId } = request.params.arguments as unknown as DeleteTaskArgs;
            await tasks.tasks.delete({
              tasklist: tasklistId,
              task: taskId,
            });
            return {
              content: [{ type: 'text', text: `Task ${taskId} deleted successfully from task list ${tasklistId}.` }],
            };
          }
          // Calendar handlers
          case 'list_calendars': {
            const res = await calendar.calendarList.list();
            return {
              content: [{ type: 'text', text: JSON.stringify(res.data.items, null, 2) }],
            };
          }
          case 'list_events': {
            const args = request.params.arguments as unknown as ListEventsArgs || {};
            const calendarId = args.calendarId || 'primary';
            const timeMin = args.timeMin;
            const timeMax = args.timeMax;
            const maxResults = args.maxResults || 10;

            const res = await calendar.events.list({
              calendarId,
              timeMin,
              timeMax,
              maxResults,
              singleEvents: true,
              orderBy: 'startTime',
            });
            return {
              content: [{ type: 'text', text: JSON.stringify(res.data.items, null, 2) }],
            };
          }
          case 'create_event': {
            if (!request.params.arguments) {
              throw new McpError(ErrorCode.InvalidParams, 'Missing arguments for create_event');
            }
            const { calendarId = 'primary', summary, description, startDateTime, endDateTime, location, timeZone } = request.params.arguments as unknown as CreateEventArgs;
            
            const event = {
              summary,
              description,
              location,
              start: {
                dateTime: startDateTime,
                timeZone: timeZone || 'Asia/Kuala_Lumpur',
              },
              end: {
                dateTime: endDateTime,
                timeZone: timeZone || 'Asia/Kuala_Lumpur',
              },
            };

            const res = await calendar.events.insert({
              calendarId,
              requestBody: event,
            });
            return {
              content: [{ type: 'text', text: JSON.stringify(res.data, null, 2) }],
            };
          }
          case 'update_event': {
            if (!request.params.arguments) {
              throw new McpError(ErrorCode.InvalidParams, 'Missing arguments for update_event');
            }
            const { calendarId = 'primary', eventId, summary, description, startDateTime, endDateTime, location, timeZone } = request.params.arguments as unknown as UpdateEventArgs;
            
            const updateFields: any = {};
            if (summary !== undefined) updateFields.summary = summary;
            if (description !== undefined) updateFields.description = description;
            if (location !== undefined) updateFields.location = location;
            if (startDateTime !== undefined) {
              updateFields.start = {
                dateTime: startDateTime,
                timeZone: timeZone || 'Asia/Kuala_Lumpur',
              };
            }
            if (endDateTime !== undefined) {
              updateFields.end = {
                dateTime: endDateTime,
                timeZone: timeZone || 'Asia/Kuala_Lumpur',
              };
            }

            const res = await calendar.events.update({
              calendarId,
              eventId,
              requestBody: updateFields,
            });
            return {
              content: [{ type: 'text', text: JSON.stringify(res.data, null, 2) }],
            };
          }
          case 'delete_event': {
            if (!request.params.arguments) {
              throw new McpError(ErrorCode.InvalidParams, 'Missing arguments for delete_event');
            }
            const { calendarId = 'primary', eventId } = request.params.arguments as unknown as DeleteEventArgs;
            
            await calendar.events.delete({
              calendarId,
              eventId,
            });
            return {
              content: [{ type: 'text', text: `Event ${eventId} deleted successfully from calendar ${calendarId}.` }],
            };
          }
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${request.params.name}`
            );
        }
      } catch (error: any) {
        console.error('Error in tool handler:', error);
        return {
          content: [{ type: 'text', text: `Error: ${error.message || 'An unknown error occurred.'}` }],
          isError: true,
        };
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Google Tasks & Calendar MCP server running on stdio');
  }
}

const server = new GoogleTasksCalendarServer();
server.run().catch(console.error);
