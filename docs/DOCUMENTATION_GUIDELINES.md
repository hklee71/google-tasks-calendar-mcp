# Documentation & Project Management Guidelines

## 1. Code Documentation Standards

### 1.1 TypeScript Documentation (JSDoc)
All public functions, classes, and interfaces must include comprehensive JSDoc documentation:

```typescript
/**
 * Manages OAuth 2.1 authentication flow for Claude AI integration
 * 
 * @class OAuth2Manager
 * @description Handles client registration, PKCE flow, and token management
 * for remote MCP server authentication with Claude AI clients
 * 
 * @example
 * ```typescript
 * const oauth = new OAuth2Manager(signingKey, sessionSecret);
 * const client = await oauth.registerClient("Claude AI", ["https://claude.ai/callback"]);
 * ```
 */
export class OAuth2Manager {
  /**
   * Registers a new OAuth 2.1 client with dynamic registration
   * 
   * @param clientName - Human-readable name for the client
   * @param redirectUris - Array of valid redirect URIs
   * @param scopes - Optional scope permissions (defaults to 'mcp:read mcp:write')
   * @returns Promise resolving to client credentials
   * 
   * @throws {OAuth2Error} When client registration fails
   * @throws {ValidationError} When parameters are invalid
   * 
   * @example
   * ```typescript
   * const client = await oauth.registerClient(
   *   "Claude AI", 
   *   ["https://claude.ai/callback"],
   *   "mcp:read mcp:write"
   * );
   * console.log(client.client_id); // "client_abc123"
   * ```
   */
  async registerClient(
    clientName: string, 
    redirectUris: string[], 
    scopes?: string
  ): Promise<ClientCredentials> {
    // Implementation details...
  }
}
```