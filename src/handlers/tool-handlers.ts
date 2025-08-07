// Tool handlers for OpenProject MCP server
import { OpenProjectClient } from '../client/openproject-client.js';
import {
  GetProjectsArgsSchema,
  GetProjectArgsSchema,
  CreateProjectArgsSchema,
  UpdateProjectArgsSchema,
  DeleteProjectArgsSchema,
  GetWorkPackagesArgsSchema,
  GetWorkPackageArgsSchema,
  CreateWorkPackageArgsSchema,
  UpdateWorkPackageArgsSchema,
  SearchArgsSchema,
  GetUsersArgsSchema,
  GetTimeEntriesArgsSchema,
  CreateTimeEntryArgsSchema,
} from '../tools/index.js';

export class OpenProjectToolHandlers {
  constructor(private client: OpenProjectClient) {}

  async handleToolCall(request: any): Promise<any> {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        // Project handlers
        case 'get_projects':
          return await this.handleGetProjects(args);
        case 'get_project':
          return await this.handleGetProject(args);
        case 'create_project':
          return await this.handleCreateProject(args);
        case 'update_project':
          return await this.handleUpdateProject(args);
        case 'delete_project':
          return await this.handleDeleteProject(args);

        // Work Package handlers
        case 'get_work_packages':
          return await this.handleGetWorkPackages(args);
        case 'get_work_package':
          return await this.handleGetWorkPackage(args);
        case 'create_work_package':
          return await this.handleCreateWorkPackage(args);
        case 'update_work_package':
          return await this.handleUpdateWorkPackage(args);

        // Search handlers
        case 'search':
          return await this.handleSearch(args);

        // User handlers
        case 'get_users':
          return await this.handleGetUsers(args);
        case 'get_current_user':
        return await this.handleGetCurrentUser();

        // Time Entry handlers
        case 'get_time_entries':
          return await this.handleGetTimeEntries(args);
        case 'create_time_entry':
          return await this.handleCreateTimeEntry(args);

        // Utility handlers
        case 'test_connection':
        return await this.handleTestConnection();
      case 'get_api_info':
        return await this.handleGetApiInfo();

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error executing ${name}: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }

  // Project handlers
  private async handleGetProjects(args: any) {
    const validatedArgs = GetProjectsArgsSchema.parse(args);
    const queryParams = {
      ...(validatedArgs.offset !== undefined && { offset: validatedArgs.offset }),
      ...(validatedArgs.pageSize !== undefined && { pageSize: validatedArgs.pageSize }),
      ...(validatedArgs.filters !== undefined && { filters: validatedArgs.filters }),
      ...(validatedArgs.sortBy !== undefined && { sortBy: validatedArgs.sortBy }),
    };
    const result = await this.client.getProjects(queryParams);
    
    return {
      content: [
        {
          type: 'text',
          text: `Found ${result.total} projects:\n\n${result._embedded.elements
            .map((project: any) => `- ${project.name} (ID: ${project.id}) - ${project.description || 'No description'}`)
            .join('\n')}`,
        },
      ],
    };
  }

  private async handleGetProject(args: any) {
    const validatedArgs = GetProjectArgsSchema.parse(args);
    const project = await this.client.getProject(validatedArgs.id);
    
    return {
      content: [
        {
          type: 'text',
          text: `Project Details:\n\nName: ${project.name}\nID: ${project.id}\nIdentifier: ${project.identifier}\nDescription: ${project.description || 'No description'}\nStatus: ${project.status}\nPublic: ${project.public}\nActive: ${project.active}\nCreated: ${project.createdAt}\nUpdated: ${project.updatedAt}`,
        },
      ],
    };
  }

  private async handleCreateProject(args: any) {
    const validatedArgs = CreateProjectArgsSchema.parse(args);
    const projectData = {
      name: validatedArgs.name,
      identifier: validatedArgs.identifier,
      ...(validatedArgs.description !== undefined && { description: validatedArgs.description }),
      ...(validatedArgs.public !== undefined && { public: validatedArgs.public }),
    };
    const project = await this.client.createProject(projectData);
    
    return {
      content: [
        {
          type: 'text',
          text: `Project created successfully:\n\nName: ${project.name}\nID: ${project.id}\nIdentifier: ${project.identifier}\nDescription: ${project.description || 'No description'}`,
        },
      ],
    };
  }

  private async handleUpdateProject(args: any) {
    const validatedArgs = UpdateProjectArgsSchema.parse(args);
    const { id, ...rest } = validatedArgs;
    const updateData = {
      ...(rest.name !== undefined && { name: rest.name }),
      ...(rest.description !== undefined && { description: rest.description }),
      ...(rest.public !== undefined && { public: rest.public }),
      ...(rest.active !== undefined && { active: rest.active }),
    };
    const project = await this.client.updateProject(id, updateData);
    
    return {
      content: [
        {
          type: 'text',
          text: `Project updated successfully:\n\nName: ${project.name}\nID: ${project.id}\nDescription: ${project.description || 'No description'}\nUpdated: ${project.updatedAt}`,
        },
      ],
    };
  }

  private async handleDeleteProject(args: any) {
    const validatedArgs = DeleteProjectArgsSchema.parse(args);
    await this.client.deleteProject(validatedArgs.id);
    
    return {
      content: [
        {
          type: 'text',
          text: `Project with ID ${validatedArgs.id} has been deleted successfully.`,
        },
      ],
    };
  }

  // Work Package handlers
  private async handleGetWorkPackages(args: any) {
    const validatedArgs = GetWorkPackagesArgsSchema.parse(args);
    
    // Add project filter if specified
    let filters = validatedArgs.filters;
    if (validatedArgs.projectId) {
      const projectFilter = `[{"project":{"operator":"=","values":["${validatedArgs.projectId}"]}}]`;
      filters = filters ? `${filters.slice(0, -1)},${projectFilter.slice(1)}` : projectFilter;
    }
    
    const queryParams = {
      ...(validatedArgs.offset !== undefined && { offset: validatedArgs.offset }),
      ...(validatedArgs.pageSize !== undefined && { pageSize: validatedArgs.pageSize }),
      ...(validatedArgs.sortBy !== undefined && { sortBy: validatedArgs.sortBy }),
      ...(filters !== undefined && { filters }),
    };
    const result = await this.client.getWorkPackages(queryParams);
    
    return {
      content: [
        {
          type: 'text',
          text: `Found ${result.total} work packages:\n\n${result._embedded.elements
            .map((wp: any) => `- ${wp.subject} (ID: ${wp.id}) - Status: ${wp.status?.name || 'Unknown'} - Assignee: ${wp.assignee?.name || 'Unassigned'}`)
            .join('\n')}`,
        },
      ],
    };
  }

  private async handleGetWorkPackage(args: any) {
    const validatedArgs = GetWorkPackageArgsSchema.parse(args);
    const workPackage = await this.client.getWorkPackage(validatedArgs.id);
    
    return {
      content: [
        {
          type: 'text',
          text: `Work Package Details:\n\nSubject: ${workPackage.subject}\nID: ${workPackage.id}\nDescription: ${workPackage.description || 'No description'}\nProject: ${workPackage.project.name}\nType: ${workPackage.type.name}\nStatus: ${workPackage.status.name}\nPriority: ${workPackage.priority?.name || 'No priority'}\nAssignee: ${workPackage.assignee?.name || 'Unassigned'}\nProgress: ${workPackage.percentageDone}%\nStart Date: ${workPackage.startDate || 'Not set'}\nDue Date: ${workPackage.dueDate || 'Not set'}\nEstimated Time: ${workPackage.estimatedTime || 'Not set'}\nSpent Time: ${workPackage.spentTime || 'Not set'}\nCreated: ${workPackage.createdAt}\nUpdated: ${workPackage.updatedAt}`,
        },
      ],
    };
  }

  private async handleCreateWorkPackage(args: any) {
    const validatedArgs = CreateWorkPackageArgsSchema.parse(args);
    
    // Transform the arguments to match OpenProject API format
    const workPackageData = {
      subject: validatedArgs.subject,
      ...(validatedArgs.description !== undefined && { description: validatedArgs.description }),
      ...(validatedArgs.startDate !== undefined && { startDate: validatedArgs.startDate }),
      ...(validatedArgs.dueDate !== undefined && { dueDate: validatedArgs.dueDate }),
      ...(validatedArgs.estimatedTime !== undefined && { estimatedTime: validatedArgs.estimatedTime }),
      _links: {
        project: { href: `/api/v3/projects/${validatedArgs.projectId}` },
        type: { href: `/api/v3/types/${validatedArgs.typeId}` },
        ...(validatedArgs.statusId && { status: { href: `/api/v3/statuses/${validatedArgs.statusId}` } }),
        ...(validatedArgs.priorityId && { priority: { href: `/api/v3/priorities/${validatedArgs.priorityId}` } }),
        ...(validatedArgs.assigneeId && { assignee: { href: `/api/v3/users/${validatedArgs.assigneeId}` } }),
      },
    };
    
    const workPackage = await this.client.createWorkPackage(workPackageData);
    
    return {
      content: [
        {
          type: 'text',
          text: `Work package created successfully:\n\nSubject: ${workPackage.subject}\nID: ${workPackage.id}\nProject: ${workPackage.project.name}\nType: ${workPackage.type.name}\nStatus: ${workPackage.status.name}`,
        },
      ],
    };
  }

  private async handleUpdateWorkPackage(args: any) {
    const validatedArgs = UpdateWorkPackageArgsSchema.parse(args);
    const { id, ...updateData } = validatedArgs;
    
    // Transform the arguments to match OpenProject API format
    const workPackageData = {
      ...(updateData.subject !== undefined && { subject: updateData.subject }),
      ...(updateData.description !== undefined && { description: updateData.description }),
      ...(updateData.startDate !== undefined && { startDate: updateData.startDate }),
      ...(updateData.dueDate !== undefined && { dueDate: updateData.dueDate }),
      ...(updateData.estimatedTime !== undefined && { estimatedTime: updateData.estimatedTime }),
      ...(updateData.percentageDone !== undefined && { percentageDone: updateData.percentageDone }),
      _links: {
        ...(updateData.statusId && { status: { href: `/api/v3/statuses/${updateData.statusId}` } }),
        ...(updateData.priorityId && { priority: { href: `/api/v3/priorities/${updateData.priorityId}` } }),
        ...(updateData.assigneeId && { assignee: { href: `/api/v3/users/${updateData.assigneeId}` } }),
      },
    };
    
    const workPackage = await this.client.updateWorkPackage(id, workPackageData);
    
    return {
      content: [
        {
          type: 'text',
          text: `Work package updated successfully:\n\nSubject: ${workPackage.subject}\nID: ${workPackage.id}\nStatus: ${workPackage.status.name}\nProgress: ${workPackage.percentageDone}%\nUpdated: ${workPackage.updatedAt}`,
        },
      ],
    };
  }

  // Search handlers
  private async handleSearch(args: any) {
    const validatedArgs = SearchArgsSchema.parse(args);
    const limit = validatedArgs.limit || 10;
    
    let result;
    switch (validatedArgs.type) {
      case 'projects':
        result = await this.client.searchProjects(validatedArgs.query, { pageSize: limit });
        break;
      case 'work_packages':
        result = await this.client.searchWorkPackages(validatedArgs.query, { pageSize: limit });
        break;
      case 'users':
        result = await this.client.searchUsers(validatedArgs.query, { pageSize: limit });
        break;
      default:
        throw new Error(`Invalid search type: ${validatedArgs.type}`);
    }
    
    return {
      content: [
        {
          type: 'text',
          text: `Search results for "${validatedArgs.query}" in ${validatedArgs.type}:\n\nFound ${result.total} results:\n\n${result._embedded.elements
            .map((item: any) => {
              switch (validatedArgs.type) {
                case 'projects':
                  return `- ${item.name} (ID: ${item.id}) - ${item.description || 'No description'}`;
                case 'work_packages':
                  return `- ${item.subject} (ID: ${item.id}) - Status: ${item.status?.name || 'Unknown'}`;
                case 'users':
                  return `- ${item.name} (ID: ${item.id}) - ${item.email}`;
                default:
                  return `- ${item.name || item.subject} (ID: ${item.id})`;
              }
            })
            .join('\n')}`,
        },
      ],
    };
  }

  // User handlers
  private async handleGetUsers(args: any) {
    const validatedArgs = GetUsersArgsSchema.parse(args);
    const queryParams = {
      ...(validatedArgs.offset !== undefined && { offset: validatedArgs.offset }),
      ...(validatedArgs.pageSize !== undefined && { pageSize: validatedArgs.pageSize }),
      ...(validatedArgs.filters !== undefined && { filters: validatedArgs.filters }),
    };
    const result = await this.client.getUsers(queryParams);
    
    return {
      content: [
        {
          type: 'text',
          text: `Found ${result.total} users:\n\n${result._embedded.elements
            .map((user: any) => `- ${user.name} (ID: ${user.id}) - ${user.email} - Status: ${user.status}`)
            .join('\n')}`,
        },
      ],
    };
  }

  private async handleGetCurrentUser() {
    const user = await this.client.getCurrentUser();
    
    return {
      content: [
        {
          type: 'text',
          text: `Current User Details:\n\nName: ${user.name}\nID: ${user.id}\nLogin: ${user.login}\nEmail: ${user.email}\nFirst Name: ${user.firstName}\nLast Name: ${user.lastName}\nAdmin: ${user.admin}\nStatus: ${user.status}\nLanguage: ${user.language}`,
        },
      ],
    };
  }

  // Time Entry handlers
  private async handleGetTimeEntries(args: any) {
    const validatedArgs = GetTimeEntriesArgsSchema.parse(args);
    
    // Build filters based on provided parameters
    let filters = validatedArgs.filters;
    const filterArray = [];
    
    if (validatedArgs.workPackageId) {
      filterArray.push(`{"workPackage":{"operator":"=","values":["${validatedArgs.workPackageId}"]}}`);
    }
    if (validatedArgs.projectId) {
      filterArray.push(`{"project":{"operator":"=","values":["${validatedArgs.projectId}"]}}`);
    }
    if (validatedArgs.userId) {
      filterArray.push(`{"user":{"operator":"=","values":["${validatedArgs.userId}"]}}`);
    }
    
    if (filterArray.length > 0) {
      filters = `[${filterArray.join(',')}]`;
    }
    
    const queryParams = {
      ...(validatedArgs.offset !== undefined && { offset: validatedArgs.offset }),
      ...(validatedArgs.pageSize !== undefined && { pageSize: validatedArgs.pageSize }),
      ...(filters !== undefined && { filters }),
    };
    const result = await this.client.getTimeEntries(queryParams);
    
    return {
      content: [
        {
          type: 'text',
          text: `Found ${result.total} time entries:\n\n${result._embedded.elements
            .map((entry: any) => `- ${entry.hours}h on ${entry.spentOn} - ${entry.activity?.name || 'Unknown activity'} - ${entry.comment || 'No comment'} (ID: ${entry.id})`)
            .join('\n')}`,
        },
      ],
    };
  }

  private async handleCreateTimeEntry(args: any) {
    const validatedArgs = CreateTimeEntryArgsSchema.parse(args);
    
    // Transform the arguments to match OpenProject API format
    const spentOnDate = validatedArgs.spentOn || new Date().toISOString().split('T')[0];
    const timeEntryData: any = {
      hours: validatedArgs.hours,
      spentOn: spentOnDate,
      ...(validatedArgs.comment !== undefined && { comment: validatedArgs.comment }),
      _links: {
        project: { href: `/api/v3/projects/${validatedArgs.projectId}` },
        activity: { href: `/api/v3/time_entries/activities/${validatedArgs.activityId}` },
        ...(validatedArgs.workPackageId && { workPackage: { href: `/api/v3/work_packages/${validatedArgs.workPackageId}` } }),
      },
    };
    
    const timeEntry = await this.client.createTimeEntry(timeEntryData);
    
    return {
      content: [
        {
          type: 'text',
          text: `Time entry created successfully:\n\nHours: ${timeEntry.hours}\nDate: ${timeEntry.spentOn}\nActivity: ${timeEntry.activity.name}\nProject: ${timeEntry.project.name}\nComment: ${timeEntry.comment || 'No comment'}\nID: ${timeEntry.id}`,
        },
      ],
    };
  }

  // Utility handlers
  private async handleTestConnection() {
    const isConnected = await this.client.testConnection();
    
    return {
      content: [
        {
          type: 'text',
          text: isConnected 
            ? 'Connection to OpenProject API successful!' 
            : 'Failed to connect to OpenProject API. Please check your configuration.',
        },
      ],
    };
  }

  private async handleGetApiInfo() {
    const apiInfo = await this.client.getApiInfo();
    
    return {
      content: [
        {
          type: 'text',
          text: `OpenProject API Information:\n\n${JSON.stringify(apiInfo, null, 2)}`,
        },
      ],
    };
  }
}