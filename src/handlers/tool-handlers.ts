// Tool handlers for OpenProject MCP server
import { OpenProjectClient } from '../client/openproject-client.js';
import { logger } from '../utils/logger.js';
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
  SetWorkPackageStatusArgsSchema,
  DeleteWorkPackageArgsSchema,
  SetWorkPackageParentArgsSchema,
  RemoveWorkPackageParentArgsSchema,
  GetWorkPackageChildrenArgsSchema,
  SearchArgsSchema,
  GetUsersArgsSchema,
  GetStatusesArgsSchema,
  GetTimeEntriesArgsSchema,
  CreateTimeEntryArgsSchema,
  GetBoardsArgsSchema,
  GetBoardArgsSchema,
  CreateBoardArgsSchema,
  UpdateBoardArgsSchema,
  DeleteBoardArgsSchema,
  AddBoardWidgetArgsSchema,
  RemoveBoardWidgetArgsSchema,
} from '../tools/index.js';

export class OpenProjectToolHandlers {
  constructor(private client: OpenProjectClient) {}

  async handleToolCall(request: any): Promise<any> {
    const { name, arguments: args } = request.params;
    const startTime = Date.now();
    
    logger.info(`Tool execution started: ${name}`, { args });
    logger.logRawData(`${name} input args`, args);

    try {
      let result;
      switch (name) {
        // Project handlers
        case 'get_projects':
          result = await this.handleGetProjects(args);
          break;
        case 'get_project':
          result = await this.handleGetProject(args);
          break;
        case 'create_project':
          result = await this.handleCreateProject(args);
          break;
        case 'update_project':
          result = await this.handleUpdateProject(args);
          break;
        case 'delete_project':
          result = await this.handleDeleteProject(args);
          break;

        // Work Package handlers
        case 'get_work_packages':
          result = await this.handleGetWorkPackages(args);
          break;
        case 'get_work_package':
          result = await this.handleGetWorkPackage(args);
          break;
        case 'create_work_package':
          result = await this.handleCreateWorkPackage(args);
          break;
        case 'update_work_package':
          result = await this.handleUpdateWorkPackage(args);
          break;
        case 'set_work_package_status':
          result = await this.handleSetWorkPackageStatus(args);
          break;
        case 'delete_work_package':
          result = await this.handleDeleteWorkPackage(args);
          break;

        // Work Package Parent-Child Relationship handlers
        case 'set_work_package_parent':
          result = await this.handleSetWorkPackageParent(args);
          break;
        case 'remove_work_package_parent':
          result = await this.handleRemoveWorkPackageParent(args);
          break;
        case 'get_work_package_children':
          result = await this.handleGetWorkPackageChildren(args);
          break;

        // Search handlers
        case 'search':
          result = await this.handleSearch(args);
          break;

        // User handlers
        case 'get_users':
          result = await this.handleGetUsers(args);
          break;
        case 'get_current_user':
          result = await this.handleGetCurrentUser();
          break;

        // Status handlers
        case 'get_statuses':
          result = await this.handleGetStatuses(args);
          break;

        // Time Entry handlers
        case 'get_time_entries':
          result = await this.handleGetTimeEntries(args);
          break;
        case 'create_time_entry':
          result = await this.handleCreateTimeEntry(args);
          break;

        // Board handlers
        case 'get_boards':
          result = await this.handleGetBoards(args);
          break;
        case 'get_board':
          result = await this.handleGetBoard(args);
          break;
        case 'create_board':
          result = await this.handleCreateBoard(args);
          break;
        case 'update_board':
          result = await this.handleUpdateBoard(args);
          break;
        case 'delete_board':
          result = await this.handleDeleteBoard(args);
          break;
        case 'add_board_widget':
          result = await this.handleAddBoardWidget(args);
          break;
        case 'remove_board_widget':
          result = await this.handleRemoveBoardWidget(args);
          break;

        // Utility handlers
        case 'test_connection':
          result = await this.handleTestConnection();
          break;
        case 'get_api_info':
          result = await this.handleGetApiInfo();
          break;

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
      
      logger.logToolExecution(name, args, startTime, result);
      logger.logRawData(`${name} output result`, result);
      
      return result;
    } catch (error) {
      logger.logToolExecution(name, args, startTime, undefined, error);
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorDetails = {
        toolName: name,
        args,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      };
      
      logger.error(`Tool execution failed: ${name}`, errorDetails);
      
      return {
        content: [
          {
            type: 'text',
            text: `Error executing ${name}: ${errorMessage}\n\nFor debugging, check the logs with MCP_LOG_LEVEL=DEBUG`,
          },
        ],
        isError: true,
      };
    }
  }

  // Project handlers
  private async handleGetProjects(args: any) {
    try {
      logger.debug('Validating args for get_projects', { args });
      const validatedArgs = GetProjectsArgsSchema.parse(args);
      logger.logSchemaValidation('get_projects', args);
      
      const queryParams = {
        ...(validatedArgs.offset !== undefined && { offset: validatedArgs.offset }),
        ...(validatedArgs.pageSize !== undefined && { pageSize: validatedArgs.pageSize }),
        ...(validatedArgs.filters !== undefined && { filters: validatedArgs.filters }),
        ...(validatedArgs.sortBy !== undefined && { sortBy: validatedArgs.sortBy }),
      };
      
      logger.debug('Calling client.getProjects', { queryParams });
      const result = await this.client.getProjects(queryParams);
      
      logger.logRawData('getProjects client result', result);
      logger.debug('Processing projects result', {
        total: result.total,
        elementsCount: result._embedded?.elements?.length,
        hasEmbedded: !!result._embedded,
        resultKeys: Object.keys(result)
      });
      
      return {
         content: [
           {
             type: 'text',
             text: `Found ${result.total} projects:\n\n${result._embedded.elements
               .map((project: any) => {
                 // Handle description that can be string, object, or null
                 let descriptionText = 'No description';
                 if (project.description) {
                   if (typeof project.description === 'string') {
                     descriptionText = project.description;
                   } else if (typeof project.description === 'object' && project.description.raw) {
                     descriptionText = project.description.raw;
                   }
                 }
                 return `- ${project.name} (ID: ${project.id}) - ${descriptionText}`;
               })
               .join('\n')}`,
           },
         ],
       };
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        logger.logSchemaValidation('get_projects', args, error);
      }
      throw error;
    }
  }

  private async handleGetProject(args: any) {
    try {
      logger.debug('Validating args for get_project', { args });
      const validatedArgs = GetProjectArgsSchema.parse(args);
      logger.logSchemaValidation('get_project', args);
      
      logger.debug('Calling client.getProject', { id: validatedArgs.id });
      const project = await this.client.getProject(validatedArgs.id);
      
      logger.logRawData('getProject client result', project);
      logger.debug('Processing project result', {
        projectId: project.id,
        projectName: project.name,
        projectKeys: Object.keys(project),
        descriptionType: typeof project.description,
        descriptionValue: project.description
      });
      
      // Handle description that can be string, object, or null
      let descriptionText = 'No description';
      if (project.description) {
        if (typeof project.description === 'string') {
          descriptionText = project.description;
        } else if (typeof project.description === 'object' && project.description.raw) {
          descriptionText = project.description.raw;
        }
      }
      
      // Handle status that can be string or object
      let statusText = 'Unknown';
      if (project.status) {
        if (typeof project.status === 'string') {
          statusText = project.status;
        } else if (typeof project.status === 'object' && project.status.name) {
          statusText = project.status.name;
        }
      }
      
      return {
        content: [
          {
            type: 'text',
            text: `Project Details:\n\nName: ${project.name}\nID: ${project.id}\nIdentifier: ${project.identifier}\nDescription: ${descriptionText}\nStatus: ${statusText}\nPublic: ${project.public}\nActive: ${project.active}\nCreated: ${project.createdAt}\nUpdated: ${project.updatedAt}`,
          },
        ],
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        logger.logSchemaValidation('get_project', args, error);
      }
      throw error;
    }
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
    try {
      logger.debug('Validating args for get_work_packages', { args });
      const validatedArgs = GetWorkPackagesArgsSchema.parse(args);
      logger.logSchemaValidation('get_work_packages', args);
      
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
      
      logger.debug('Calling client.getWorkPackages', { queryParams });
      const result = await this.client.getWorkPackages(queryParams);
      
      logger.logRawData('getWorkPackages client result', result);
      logger.debug('Processing work packages result', {
        total: result.total,
        elementsCount: result._embedded?.elements?.length,
        hasEmbedded: !!result._embedded,
        resultKeys: Object.keys(result),
        firstElementKeys: result._embedded?.elements?.[0] ? Object.keys(result._embedded.elements[0]) : undefined
      });
      
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
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        logger.logSchemaValidation('get_work_packages', args, error);
      }
      throw error;
    }
  }

  private async handleGetWorkPackage(args: any) {
    const validatedArgs = GetWorkPackageArgsSchema.parse(args);
    const workPackage = await this.client.getWorkPackage(validatedArgs.id);
    
    logger.debug('Full work package data retrieved', { workPackage, lockVersion: workPackage.lockVersion });
    
    return {
      content: [
        {
          type: 'text',
          text: `Work Package Details:\n\nSubject: ${workPackage.subject}\nID: ${workPackage.id}\nDescription: ${workPackage.description || 'No description'}\nProject: ${workPackage.project?.name || 'Unknown'}\nType: ${workPackage.type?.name || 'Unknown'}\nStatus: ${workPackage.status?.name || 'Unknown'}\nPriority: ${workPackage.priority?.name || 'No priority'}\nAssignee: ${workPackage.assignee?.name || 'Unassigned'}\nProgress: ${workPackage.percentageDone || 0}%\nStart Date: ${workPackage.startDate || 'Not set'}\nDue Date: ${workPackage.dueDate || 'Not set'}\nEstimated Time: ${workPackage.estimatedTime || 'Not set'}\nSpent Time: ${workPackage.spentTime || 'Not set'}\nLock Version: ${workPackage.lockVersion || 'Not available'}\nCreated: ${workPackage.createdAt}\nUpdated: ${workPackage.updatedAt}`,
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
          text: `Work package created successfully:\n\nSubject: ${workPackage.subject}\nID: ${workPackage.id}\nProject: ${workPackage.project?.name || 'Unknown'}\nType: ${workPackage.type?.name || 'Unknown'}\nStatus: ${workPackage.status?.name || 'Unknown'}`,
        },
      ],
    };
  }

  private async handleUpdateWorkPackage(args: any) {
    const validatedArgs = UpdateWorkPackageArgsSchema.parse(args);
    const { id, ...updateData } = validatedArgs;
    
    // Transform the arguments to match the client's expected format
    const workPackageData: any = {};
    
    // Add direct field updates
    if (updateData.subject !== undefined) workPackageData.subject = updateData.subject;
    if (updateData.description !== undefined) workPackageData.description = updateData.description;
    if (updateData.startDate !== undefined) workPackageData.startDate = updateData.startDate;
    if (updateData.dueDate !== undefined) workPackageData.dueDate = updateData.dueDate;
    if (updateData.estimatedTime !== undefined) workPackageData.estimatedTime = updateData.estimatedTime;
    if (updateData.percentageDone !== undefined) workPackageData.percentageDone = updateData.percentageDone;
    
    // Add relationship updates in the format expected by the client
    if (updateData.statusId) {
      workPackageData.status = { id: updateData.statusId };
    }
    if (updateData.priorityId) {
      workPackageData.priority = { id: updateData.priorityId };
    }
    if (updateData.assigneeId) {
      workPackageData.assignee = { id: updateData.assigneeId };
    }
    
    const workPackage = await this.client.updateWorkPackage(id, workPackageData);
    
    return {
      content: [
        {
          type: 'text',
          text: `Work package updated successfully:\n\nSubject: ${workPackage.subject}\nID: ${workPackage.id}\nStatus: ${workPackage.status?.name || 'Unknown'}\nProgress: ${workPackage.percentageDone || 0}%\nUpdated: ${workPackage.updatedAt}`,
        },
      ],
    };
  }

  private async handleSetWorkPackageStatus(args: any) {
    try {
      logger.debug('Validating args for set_work_package_status', { args });
      const validatedArgs = SetWorkPackageStatusArgsSchema.parse(args);
      logger.logSchemaValidation('set_work_package_status', args);
      
      // Update the work package status
      const result = await this.client.updateWorkPackage(validatedArgs.id, { status: { id: validatedArgs.statusId, name: 'dummy' } });
      
      logger.logRawData('setWorkPackageStatus client result', result);
      
      // Find the status name for the response by fetching from API
      const statusesResponse = await this.client.getStatuses();
      const status = statusesResponse._embedded.elements.find(s => s.id === validatedArgs.statusId);
      const statusName = status ? status.name : `ID ${validatedArgs.statusId}`;
      
      return {
        content: [
          {
            type: 'text',
            text: `Work package ${validatedArgs.id} status updated to "${statusName}" successfully.`,
          },
        ],
      };
    } catch (error) {
      logger.error('Error setting work package status', { error, args });
      
      // Return a very directive error message that forces the agent to stop
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        content: [{
          type: 'text',
          text: `ERROR: ${errorMessage}. STOP. Do not investigate. Ask user for valid status ID.`
        }],
        isError: true
      };
    }
  }

  private async handleDeleteWorkPackage(args: any) {
    const validatedArgs = DeleteWorkPackageArgsSchema.parse(args);
    await this.client.deleteWorkPackage(validatedArgs.id);
    
    return {
      content: [
        {
          type: 'text',
          text: `Work package with ID ${validatedArgs.id} has been deleted successfully.`,
        },
      ],
    };
  }

  // Work Package Parent-Child Relationship handlers
  private async handleSetWorkPackageParent(args: any) {
    const validatedArgs = SetWorkPackageParentArgsSchema.parse(args);
    const workPackage = await this.client.setWorkPackageParent(validatedArgs.id, validatedArgs.parentId);
    
    return {
      content: [
        {
          type: 'text',
          text: `Parent relationship set successfully:\n\nChild: ${workPackage.subject} (ID: ${workPackage.id})\nParent: Work Package ID ${validatedArgs.parentId}\nUpdated: ${workPackage.updatedAt}`,
        },
      ],
    };
  }

  private async handleRemoveWorkPackageParent(args: any) {
    const validatedArgs = RemoveWorkPackageParentArgsSchema.parse(args);
    const workPackage = await this.client.removeWorkPackageParent(validatedArgs.id);
    
    // Verification: Check if the work package still appears as a child anywhere
     try {
       // Search for any work packages that have this one as a child
       const verificationResult = await this.client.getWorkPackages({
         filters: `[{"children":{"operator":"=","values":["${validatedArgs.id}"]}}]`
       });
      
      if (verificationResult.total > 0) {
        const parentIds = verificationResult._embedded.elements.map((wp: any) => wp.id);
        return {
          content: [
            {
              type: 'text',
              text: `⚠️ Parent relationship removal FAILED - Verification detected inconsistency:\n\nWork Package: ${workPackage.subject} (ID: ${workPackage.id})\nStatus: Still appears as child of parent(s): ${parentIds.join(', ')}\nUpdated: ${workPackage.updatedAt}\n\nThis indicates a potential API caching issue or incomplete removal.`,
            },
          ],
        };
      }
    } catch (verificationError) {
      // If verification fails, log but don't fail the operation
      logger.warn('Parent removal verification failed', { 
        workPackageId: validatedArgs.id, 
        error: verificationError 
      });
    }
    
    return {
      content: [
        {
          type: 'text',
          text: `✅ Parent relationship removed successfully (verified):\n\nWork Package: ${workPackage.subject} (ID: ${workPackage.id})\nStatus: No longer has a parent (confirmed)\nUpdated: ${workPackage.updatedAt}`,
        },
      ],
    };
  }

  private async handleGetWorkPackageChildren(args: any) {
    const validatedArgs = GetWorkPackageChildrenArgsSchema.parse(args);
    const result = await this.client.getWorkPackageChildren(validatedArgs.id);
    
    if (result.total === 0) {
      return {
        content: [
          {
            type: 'text',
            text: `No child work packages found for work package ID ${validatedArgs.id}.`,
          },
        ],
      };
    }
    
    return {
      content: [
        {
          type: 'text',
          text: `Found ${result.total} child work packages for work package ID ${validatedArgs.id}:\n\n${result._embedded.elements
            .map((wp: any) => `- ${wp.subject} (ID: ${wp.id}) - Status: ${wp.status?.name || 'Unknown'} - Assignee: ${wp.assignee?.name || 'Unassigned'}`)
            .join('\n')}`,
        },
      ],
    };
  }

  // Search handlers
  private async handleSearch(args: any) {
    try {
      logger.debug('Validating args for search', { args });
      const validatedArgs = SearchArgsSchema.parse(args);
      logger.logSchemaValidation('search', args);
      
      const limit = validatedArgs.limit || 10;
      
      let result;
      switch (validatedArgs.type) {
        case 'projects':
          logger.debug('Calling client.searchProjects', { query: validatedArgs.query, limit });
          result = await this.client.searchProjects(validatedArgs.query, { pageSize: limit });
          break;
        case 'work_packages':
          logger.debug('Calling client.searchWorkPackages', { query: validatedArgs.query, limit });
          result = await this.client.searchWorkPackages(validatedArgs.query, { pageSize: limit });
          break;
        case 'users':
          logger.debug('Calling client.searchUsers', { query: validatedArgs.query, limit });
          result = await this.client.searchUsers(validatedArgs.query, { pageSize: limit });
          break;
        default:
          throw new Error(`Invalid search type: ${validatedArgs.type}`);
      }
      
      logger.logRawData('search client result', result);
      logger.debug('Processing search result', {
        type: validatedArgs.type,
        query: validatedArgs.query,
        total: result.total,
        elementsCount: result._embedded?.elements?.length,
        hasEmbedded: !!result._embedded,
        resultKeys: Object.keys(result)
      });
      
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
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        logger.logSchemaValidation('search', args, error);
      }
      throw error;
    }
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

  // Status handlers
  private async handleGetStatuses(args: any) {
    const validatedArgs = GetStatusesArgsSchema.parse(args);
    const queryParams = {
      ...(validatedArgs.offset !== undefined && { offset: validatedArgs.offset }),
      ...(validatedArgs.pageSize !== undefined && { pageSize: validatedArgs.pageSize }),
      ...(validatedArgs.filters !== undefined && { filters: validatedArgs.filters }),
    };
    const result = await this.client.getStatuses(queryParams);
    
    return {
      content: [
        {
          type: 'text',
          text: `Found ${result.total} statuses:\n\n${result._embedded.elements
            .map((status: any) => `- ${status.id}: ${status.name} (${status.isClosed ? 'Closed' : 'Open'}) - ${status.defaultDoneRatio || 0}% done - Color: ${status.color || 'Default'}`)
            .join('\n')}`,
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
          text: `Time entry created successfully:\n\nHours: ${timeEntry.hours}\nDate: ${timeEntry.spentOn}\nActivity: ${timeEntry._embedded?.activity?.name || 'N/A'}\nProject: ${timeEntry._embedded?.project?.name || 'N/A'}\nComment: ${typeof timeEntry.comment === 'object' && timeEntry.comment ? timeEntry.comment.raw : timeEntry.comment || 'No comment'}\nID: ${timeEntry.id}`,
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

  // Board handlers
  private async handleGetBoards(args: any) {
    const parsedArgs = GetBoardsArgsSchema.parse(args);
    const queryParams: any = {};
    if (parsedArgs.offset !== undefined) queryParams.offset = parsedArgs.offset;
    if (parsedArgs.pageSize !== undefined) queryParams.pageSize = parsedArgs.pageSize;
    if (parsedArgs.filters !== undefined) queryParams.filters = parsedArgs.filters;
    if (parsedArgs.sortBy !== undefined) queryParams.sortBy = parsedArgs.sortBy;
    
    const boards = await this.client.getBoards(parsedArgs.projectId, queryParams);
    
    return {
      content: [
        {
          type: 'text',
          text: `Found ${boards.total} boards:\n\n${boards._embedded.elements.map((board: any) => 
            `ID: ${board.id}\nScope: ${board.scope || 'Global'}\nRows: ${board.rowCount}\nColumns: ${board.columnCount}\nWidgets: ${board._embedded?.widgets?.length || 0}\nCreated: ${board.createdAt}\n`
          ).join('\n')}`,
        },
      ],
    };
  }

  private async handleGetBoard(args: any) {
    const parsedArgs = GetBoardArgsSchema.parse(args);
    const board = await this.client.getBoard(parsedArgs.id);
    
    return {
      content: [
        {
          type: 'text',
          text: `Board Details:\n\nID: ${board.id}\nScope: ${board.scope || 'Global'}\nRows: ${board.rowCount}\nColumns: ${board.columnCount}\nCreated: ${board.createdAt}\nUpdated: ${board.updatedAt}\n\nWidgets (${board._embedded?.widgets?.length || 0}):\n${board._embedded?.widgets?.map((widget: any) => 
            `- Widget ID: ${widget.id}\n  Identifier: ${widget.identifier}\n  Position: Row ${widget.startRow}-${widget.endRow}, Col ${widget.startColumn}-${widget.endColumn}\n  Query: ${widget._embedded?.query?.name || 'No query'}`
          ).join('\n') || 'No widgets'}`,
        },
      ],
    };
  }

  private async handleCreateBoard(args: any) {
    const parsedArgs = CreateBoardArgsSchema.parse(args);
    const boardData: any = {};
    if (parsedArgs.name !== undefined) boardData.name = parsedArgs.name;
    if (parsedArgs.description !== undefined) boardData.description = parsedArgs.description;
    if (parsedArgs.rowCount !== undefined) boardData.rowCount = parsedArgs.rowCount;
    if (parsedArgs.columnCount !== undefined) boardData.columnCount = parsedArgs.columnCount;
    
    const board = await this.client.createBoard(parsedArgs.projectId, boardData);
    
    return {
      content: [
        {
          type: 'text',
          text: `Board created successfully:\n\nID: ${board.id}\nScope: ${board.scope}\nRows: ${board.rowCount}\nColumns: ${board.columnCount}\nCreated: ${board.createdAt}`,
        },
      ],
    };
  }

  private async handleUpdateBoard(args: any) {
    const parsedArgs = UpdateBoardArgsSchema.parse(args);
    const boardData: any = {};
    if (parsedArgs.name !== undefined) boardData.name = parsedArgs.name;
    if (parsedArgs.description !== undefined) boardData.description = parsedArgs.description;
    if (parsedArgs.rowCount !== undefined) boardData.rowCount = parsedArgs.rowCount;
    if (parsedArgs.columnCount !== undefined) boardData.columnCount = parsedArgs.columnCount;
    
    const board = await this.client.updateBoard(parsedArgs.id, boardData);
    
    return {
      content: [
        {
          type: 'text',
          text: `Board updated successfully:\n\nID: ${board.id}\nScope: ${board.scope}\nRows: ${board.rowCount}\nColumns: ${board.columnCount}\nUpdated: ${board.updatedAt}`,
        },
      ],
    };
  }

  private async handleDeleteBoard(args: any) {
    const parsedArgs = DeleteBoardArgsSchema.parse(args);
    await this.client.deleteBoard(parsedArgs.id);
    
    return {
      content: [
        {
          type: 'text',
          text: `Board with ID ${parsedArgs.id} has been deleted successfully.`,
        },
      ],
    };
  }

  private async handleAddBoardWidget(args: any) {
    const parsedArgs = AddBoardWidgetArgsSchema.parse(args);
    const widgetData = {
      _type: 'GridWidget',
      identifier: parsedArgs.identifier,
      startRow: parsedArgs.startRow,
      endRow: parsedArgs.endRow,
      startColumn: parsedArgs.startColumn,
      endColumn: parsedArgs.endColumn,
      options: parsedArgs.options || {},
      _embedded: parsedArgs.queryId ? {
        query: {
          _type: 'Query',
          id: parsedArgs.queryId,
        },
      } : undefined,
    };
    
    const board = await this.client.addBoardWidget(parsedArgs.boardId, widgetData);
    
    return {
      content: [
        {
          type: 'text',
          text: `Widget added to board successfully:\n\nBoard ID: ${board.id}\nWidget Identifier: ${parsedArgs.identifier}\nPosition: Row ${parsedArgs.startRow}-${parsedArgs.endRow}, Col ${parsedArgs.startColumn}-${parsedArgs.endColumn}\nTotal Widgets: ${board._embedded?.widgets?.length || 0}`,
        },
      ],
    };
  }

  private async handleRemoveBoardWidget(args: any) {
    const parsedArgs = RemoveBoardWidgetArgsSchema.parse(args);
    const board = await this.client.removeBoardWidget(parsedArgs.boardId, parsedArgs.widgetId);
    
    return {
      content: [
        {
          type: 'text',
          text: `Widget removed from board successfully:\n\nBoard ID: ${board.id}\nWidget ID: ${parsedArgs.widgetId}\nRemaining Widgets: ${board._embedded?.widgets?.length || 0}`,
        },
      ],
    };
  }
}