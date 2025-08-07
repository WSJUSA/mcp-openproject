# OpenProject MCP Server

A comprehensive Model Context Protocol (MCP) server for integrating with OpenProject API. This server enables AI assistants to interact with OpenProject instances for project management, work package handling, time tracking, and user management.

## Features

### 🚀 Core Capabilities
- **Project Management**: Create, read, update, and delete projects
- **Work Package Operations**: Full CRUD operations for work packages (tasks, bugs, features)
- **User Management**: Retrieve user information and current user details
- **Time Tracking**: Create and manage time entries
- **Search Functionality**: Search across projects, work packages, and users
- **API Testing**: Connection testing and API information retrieval

### 🛠 Technical Features
- **Type Safety**: Full TypeScript implementation with Zod validation
- **Error Handling**: Comprehensive error handling and validation
- **Authentication**: Support for API keys and basic authentication
- **Rate Limiting**: Built-in rate limiting considerations
- **Caching**: Configurable cache settings

## Installation

### Prerequisites
- Node.js 18.0.0 or higher
- OpenProject instance with API access
- API key or user credentials for OpenProject

### Setup

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd mcp-openproject
npm install
```

2. **Configure environment variables:**
```bash
cp .env.example .env
```

Edit `.env` with your OpenProject configuration:
```env
# OpenProject Configuration
OPENPROJECT_BASE_URL=https://your-openproject-instance.com
OPENPROJECT_API_KEY=your-api-key-here

# Optional: Basic Auth (alternative to API key)
# OPENPROJECT_USERNAME=your-username
# OPENPROJECT_PASSWORD=your-password

# MCP Server Configuration
MCP_SERVER_NAME=openproject-mcp
MCP_SERVER_VERSION=1.0.0

# Logging
LOG_LEVEL=info

# Rate Limiting
RATE_LIMIT_REQUESTS_PER_MINUTE=60

# Cache Settings
CACHE_TTL_SECONDS=300
```

3. **Build the project:**
```bash
npm run build
```

4. **Test the connection:**
```bash
npm run dev
```

## Usage

### Running the Server

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

### Available Tools

#### Project Management
- `get_projects` - List all projects with optional filtering and pagination
- `get_project` - Get detailed information about a specific project
- `create_project` - Create a new project
- `update_project` - Update an existing project
- `delete_project` - Delete a project

#### Work Package Management
- `get_work_packages` - List work packages with filtering options
- `get_work_package` - Get detailed work package information
- `create_work_package` - Create a new work package
- `update_work_package` - Update an existing work package

#### User Management
- `get_users` - List all users
- `get_current_user` - Get current authenticated user information

#### Time Tracking
- `get_time_entries` - List time entries with filtering
- `create_time_entry` - Log time against projects or work packages

#### Search & Utility
- `search` - Search across projects, work packages, or users
- `test_connection` - Test API connectivity
- `get_api_info` - Get OpenProject API information

### Example Tool Calls

#### Create a Project
```json
{
  "name": "create_project",
  "arguments": {
    "name": "My New Project",
    "identifier": "my-new-project",
    "description": "A sample project created via MCP",
    "public": false
  }
}
```

#### Create a Work Package
```json
{
  "name": "create_work_package",
  "arguments": {
    "subject": "Implement new feature",
    "description": "Add user authentication to the application",
    "projectId": 1,
    "typeId": 1,
    "priorityId": 2,
    "assigneeId": 5,
    "dueDate": "2024-12-31"
  }
}
```

#### Log Time Entry
```json
{
  "name": "create_time_entry",
  "arguments": {
    "projectId": 1,
    "workPackageId": 123,
    "activityId": 1,
    "hours": "8.0",
    "comment": "Worked on user authentication implementation",
    "spentOn": "2024-01-15"
  }
}
```

#### Search Work Packages
```json
{
  "name": "search",
  "arguments": {
    "query": "authentication",
    "type": "work_packages",
    "limit": 10
  }
}
```

## Authentication

### API Key (Recommended)
Set your OpenProject API key in the environment:
```env
OPENPROJECT_API_KEY=your-api-key-here
```

### Basic Authentication
Alternatively, use username/password:
```env
OPENPROJECT_USERNAME=your-username
OPENPROJECT_PASSWORD=your-password
```

## Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `OPENPROJECT_BASE_URL` | OpenProject instance URL | Yes | - |
| `OPENPROJECT_API_KEY` | API key for authentication | No* | - |
| `OPENPROJECT_USERNAME` | Username for basic auth | No* | - |
| `OPENPROJECT_PASSWORD` | Password for basic auth | No* | - |
| `MCP_SERVER_NAME` | MCP server name | No | `openproject-mcp` |
| `MCP_SERVER_VERSION` | MCP server version | No | `1.0.0` |
| `LOG_LEVEL` | Logging level | No | `info` |
| `RATE_LIMIT_REQUESTS_PER_MINUTE` | Rate limiting | No | `60` |
| `CACHE_TTL_SECONDS` | Cache TTL | No | `300` |

*Either API key or username/password is required.

## Development

### Project Structure
```
src/
├── client/
│   └── openproject-client.ts    # OpenProject API client
├── handlers/
│   └── tool-handlers.ts          # MCP tool request handlers
├── tools/
│   └── index.ts                  # Tool definitions and schemas
├── types/
│   └── openproject.ts            # TypeScript types and Zod schemas
└── index.ts                      # Main MCP server implementation
```

### Scripts
- `npm run build` - Build TypeScript to JavaScript
- `npm run dev` - Run in development mode with hot reload
- `npm start` - Run the built server
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Adding New Tools

1. **Define the tool schema** in `src/tools/index.ts`
2. **Add the tool definition** to the tools array
3. **Implement the handler** in `src/handlers/tool-handlers.ts`
4. **Add types** if needed in `src/types/openproject.ts`

## Error Handling

The server includes comprehensive error handling:
- **Validation errors**: Invalid input parameters
- **Authentication errors**: Invalid credentials or expired tokens
- **API errors**: OpenProject API failures
- **Network errors**: Connection issues
- **Rate limiting**: Too many requests

All errors are returned in a consistent format with descriptive messages.

## Security Considerations

- **Environment Variables**: Never commit `.env` files to version control
- **API Keys**: Use API keys instead of passwords when possible
- **Rate Limiting**: Respect OpenProject's rate limits
- **Input Validation**: All inputs are validated using Zod schemas
- **Error Messages**: Sensitive information is not exposed in error messages

## Troubleshooting

### Common Issues

1. **Connection Failed**
   - Verify `OPENPROJECT_BASE_URL` is correct
   - Check network connectivity
   - Ensure OpenProject instance is accessible

2. **Authentication Failed**
   - Verify API key or credentials are correct
   - Check user permissions in OpenProject
   - Ensure API access is enabled

3. **Tool Execution Errors**
   - Check tool parameters match the schema
   - Verify required fields are provided
   - Check OpenProject permissions for the operation

### Debug Mode
Enable debug logging:
```env
LOG_LEVEL=debug
```

## Usage Guide

### Step 1: Server Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your OpenProject credentials
   ```

3. **Build the Server**
   ```bash
   npm run build
   ```

4. **Start the Server**
   ```bash
   npm start
   ```

   You should see:
   ```
   OpenProject MCP Server starting...
   Connected to OpenProject at: https://your-openproject-url.com
   OpenProject MCP Server started successfully!
   ```

### Step 2: Integration with AI Agents

#### Claude Desktop Integration

1. **Install Claude Desktop** from [Anthropic's website](https://claude.ai/download)

2. **Configure MCP Server** in Claude Desktop:
   
   **On macOS:**
   ```bash
   # Edit Claude Desktop configuration
   code ~/Library/Application\ Support/Claude/claude_desktop_config.json
   ```
   
   **On Windows:**
   ```bash
   # Edit Claude Desktop configuration
   notepad %APPDATA%\Claude\claude_desktop_config.json
   ```

3. **Add Server Configuration:**
   ```json
   {
     "mcpServers": {
       "openproject": {
         "command": "node",
         "args": ["/path/to/your/mcp-openproject/dist/index.js"],
         "env": {
           "OPENPROJECT_BASE_URL": "https://your-openproject-url.com",
           "OPENPROJECT_API_KEY": "your-api-key-here",
           "NODE_TLS_REJECT_UNAUTHORIZED": "0"
         }
       }
     }
   }
   ```

4. **Restart Claude Desktop** to load the MCP server

5. **Verify Connection** - You should see the OpenProject tools available in Claude

#### Other MCP Clients

For other MCP-compatible clients, use the server as a subprocess:

```javascript
// Example Node.js integration
const { spawn } = require('child_process');

const mcpServer = spawn('node', ['dist/index.js'], {
  env: {
    ...process.env,
    OPENPROJECT_BASE_URL: 'https://your-openproject-url.com',
    OPENPROJECT_API_KEY: 'your-api-key-here'
  },
  stdio: ['pipe', 'pipe', 'pipe']
});

// Handle MCP protocol communication
mcpServer.stdout.on('data', (data) => {
  // Process MCP responses
});

mcpServer.stdin.write(JSON.stringify({
  jsonrpc: '2.0',
  id: 1,
  method: 'tools/list'
}));
```

### Step 3: Using the Tools

Once integrated, you can use natural language to interact with OpenProject:

#### Project Management
```
"Show me all projects in OpenProject"
"Create a new project called 'Website Redesign'"
"Get details for project ID 5"
```

#### Work Package Management
```
"List all work packages in the current sprint"
"Create a new task: 'Update user documentation'"
"Update work package #123 to set status as 'In Progress'"
"Search for work packages containing 'bug'"
```

#### User Management
```
"Show all users in the system"
"Get my user profile information"
"Find users with 'developer' in their name"
```

#### Time Tracking
```
"Show time entries for this week"
"Log 2 hours of work on work package #456"
"Get time entries for project 'Website Redesign'"
```

### Step 4: Advanced Usage

#### Custom Queries
Use the search and filter capabilities:
```
"Find all high-priority work packages assigned to John"
"Show projects created in the last month"
"Get time entries for user ID 10 in January 2024"
```

#### Batch Operations
```
"Create 5 work packages for the sprint planning meeting"
"Update all work packages in project 'Mobile App' to add label 'v2.0'"
```

## Troubleshooting

### Common Issues

1. **Authentication Errors (401)**
   - Verify your API key is correct
   - Check that the API key hasn't expired
   - Ensure you're using the correct OpenProject URL

2. **SSL Certificate Issues**
   - For development: Set `NODE_TLS_REJECT_UNAUTHORIZED=0`
   - For production: Ensure proper SSL certificates

3. **Connection Timeouts**
   - Check network connectivity to OpenProject instance
   - Verify firewall settings
   - Increase timeout in configuration if needed

4. **Permission Errors**
   - Ensure your OpenProject user has appropriate permissions
   - Check project-specific access rights

### Debug Mode

Enable detailed logging:
```env
LOG_LEVEL=debug
```

This will show:
- API request/response details
- Authentication flow
- Error stack traces
- Performance metrics

### API Key Generation

1. Log into your OpenProject instance
2. Go to "My Account" → "Access tokens"
3. Click "Generate" in the API section
4. Copy the generated key immediately (it won't be shown again)
5. Add the key to your `.env` file

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run linting and formatting
6. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
- Check the [OpenProject API documentation](https://docs.openproject.org/api/)
- Review the [MCP specification](https://modelcontextprotocol.io/)
- Open an issue in this repository

---

**Note**: This MCP server is designed to work with OpenProject's REST API v3. Ensure your OpenProject instance supports this API version.