import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

// Tool argument schemas
const GetProjectsArgsSchema = z.object({
  offset: z.number().optional(),
  pageSize: z.number().optional(),
  filters: z.string().optional(),
  sortBy: z.string().optional(),
});

const GetProjectArgsSchema = z.object({
  id: z.number(),
});

const CreateProjectArgsSchema = z.object({
  name: z.string(),
  identifier: z.string(),
  description: z.string().optional(),
  public: z.boolean().optional(),
});

const UpdateProjectArgsSchema = z.object({
  id: z.number(),
  name: z.string().optional(),
  description: z.string().optional(),
  public: z.boolean().optional(),
  active: z.boolean().optional(),
});

const DeleteProjectArgsSchema = z.object({
  id: z.number(),
});

const GetWorkPackagesArgsSchema = z.object({
  offset: z.number().optional(),
  pageSize: z.number().optional(),
  filters: z.string().optional(),
  sortBy: z.string().optional(),
  projectId: z.number().optional(),
});

const GetWorkPackageArgsSchema = z.object({
  id: z.number(),
});

const CreateWorkPackageArgsSchema = z.object({
  subject: z.string(),
  description: z.string().optional(),
  projectId: z.number(),
  typeId: z.number(),
  statusId: z.number().optional(),
  priorityId: z.number().optional(),
  assigneeId: z.number().optional(),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
  estimatedTime: z.string().optional(),
});

const CreateTaskArgsSchema = z.object({
  subject: z.string(),
  description: z.string().optional(),
  projectId: z.number(),
  statusId: z.number().optional(),
  priorityId: z.number().optional(),
  assigneeId: z.number().optional(),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
  estimatedTime: z.string().optional(),
});

const UpdateWorkPackageArgsSchema = z.object({
  id: z.number(),
  subject: z.string().optional(),
  description: z.string().optional(),
  statusId: z.number().optional(),
  priorityId: z.number().optional(),
  assigneeId: z.number().optional(),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
  estimatedTime: z.string().optional(),
  percentageDone: z.number().optional(),
});

const SetWorkPackageStatusArgsSchema = z.object({
  id: z.number(),
  statusId: z.number(),
});

const DeleteWorkPackageArgsSchema = z.object({
  id: z.number(),
});

// Work Package Parent-Child Relationship schemas
const SetWorkPackageParentArgsSchema = z.object({
  id: z.number(),
  parentId: z.number(),
});

const RemoveWorkPackageParentArgsSchema = z.object({
  id: z.number(),
});

const GetWorkPackageChildrenArgsSchema = z.object({
  id: z.number(),
});

const SearchArgsSchema = z.object({
  query: z.string(),
  type: z.enum(['projects', 'work_packages', 'users']),
  limit: z.number().optional(),
});

const GetUsersArgsSchema = z.object({
  offset: z.number().optional(),
  pageSize: z.number().optional(),
  filters: z.string().optional(),
});

const GetStatusesArgsSchema = z.object({
  offset: z.number().optional(),
  pageSize: z.number().optional(),
  filters: z.string().optional(),
});

const GetTimeEntriesArgsSchema = z.object({
  offset: z.number().optional(),
  pageSize: z.number().optional(),
  filters: z.string().optional(),
  workPackageId: z.number().optional(),
  projectId: z.number().optional(),
  userId: z.number().optional(),
});

const CreateTimeEntryArgsSchema = z.object({
  workPackageId: z.number().optional(),
  projectId: z.number(),
  activityId: z.number(),
  hours: z.string(),
  comment: z.string().optional(),
  spentOn: z.string().optional(),
});

// Kanban Board argument schemas
const GetBoardsArgsSchema = z.object({
  projectId: z.number().optional(),
  offset: z.number().optional(),
  pageSize: z.number().optional(),
  filters: z.string().optional(),
  sortBy: z.string().optional(),
});

const GetBoardArgsSchema = z.object({
  id: z.number(),
});

const CreateBoardArgsSchema = z.object({
  projectId: z.number(),
  name: z.string().optional(),
  description: z.string().optional(),
  rowCount: z.number().optional(),
  columnCount: z.number().optional(),
});

const UpdateBoardArgsSchema = z.object({
  id: z.number(),
  name: z.string().optional(),
  description: z.string().optional(),
  rowCount: z.number().optional(),
  columnCount: z.number().optional(),
});

const DeleteBoardArgsSchema = z.object({
  id: z.number(),
});

const AddBoardWidgetArgsSchema = z.object({
  boardId: z.number(),
  identifier: z.string(),
  startRow: z.number(),
  endRow: z.number(),
  startColumn: z.number(),
  endColumn: z.number(),
  queryId: z.number().optional(),
  options: z.record(z.any()).optional(),
});

const RemoveBoardWidgetArgsSchema = z.object({
  boardId: z.number(),
  widgetId: z.number(),
});

// Membership and Role argument schemas
const GetMembershipsArgsSchema = z.object({
  offset: z.number().optional(),
  pageSize: z.number().optional(),
  filters: z.string().optional(),
  sortBy: z.string().optional(),
  projectId: z.number().optional(),
});

const GetMembershipArgsSchema = z.object({
  id: z.number(),
});

const CreateMembershipArgsSchema = z.object({
  projectId: z.number(),
  userId: z.number(),
  roleIds: z.array(z.number()),
});

const UpdateMembershipArgsSchema = z.object({
  id: z.number(),
  roleIds: z.array(z.number()),
});

const DeleteMembershipArgsSchema = z.object({
  id: z.number(),
});

const GetRolesArgsSchema = z.object({
  offset: z.number().optional(),
  pageSize: z.number().optional(),
  filters: z.string().optional(),
  sortBy: z.string().optional(),
});

const GetRoleArgsSchema = z.object({
  id: z.number(),
});

// Upload Attachment argument schema
const UploadAttachmentArgsSchema = z.object({
  workPackageId: z.number(),
  filePath: z.string(),
  description: z.string().optional(),
});

// Get Attachments argument schema
const GetAttachmentsArgsSchema = z.object({
  workPackageId: z.number(),
});

export function createOpenProjectTools(): Tool[] {
  return [
    // Project tools
    {
      name: 'get_projects',
      description: 'Get a list of projects from OpenProject',
      inputSchema: {
        type: 'object',
        properties: {
          offset: {
            type: 'number',
            description: 'Offset for pagination (default: 0)',
          },
          pageSize: {
            type: 'number',
            description: 'Number of items per page (default: 20)',
          },
          filters: {
            type: 'string',
            description: 'JSON string of filters to apply',
          },
          sortBy: {
            type: 'string',
            description: 'Sort criteria (e.g., "name:asc", "created_at:desc")',
          },
        },
      },
    },
    {
      name: 'get_project',
      description: 'Get a specific project by ID',
      inputSchema: {
        type: 'object',
        properties: {
          id: {
            type: 'number',
            description: 'Project ID',
          },
        },
        required: ['id'],
      },
    },
    {
      name: 'create_project',
      description: 'Create a new project in OpenProject',
      inputSchema: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Project name',
          },
          identifier: {
            type: 'string',
            description: 'Project identifier (unique)',
          },
          description: {
            type: 'string',
            description: 'Project description',
          },
          public: {
            type: 'boolean',
            description: 'Whether the project is public',
          },
        },
        required: ['name', 'identifier'],
      },
    },
    {
      name: 'update_project',
      description: 'Update an existing project',
      inputSchema: {
        type: 'object',
        properties: {
          id: {
            type: 'number',
            description: 'Project ID',
          },
          name: {
            type: 'string',
            description: 'Project name',
          },
          description: {
            type: 'string',
            description: 'Project description',
          },
          public: {
            type: 'boolean',
            description: 'Whether the project is public',
          },
          active: {
            type: 'boolean',
            description: 'Whether the project is active',
          },
        },
        required: ['id'],
      },
    },
    {
      name: 'delete_project',
      description: 'Delete a project from OpenProject',
      inputSchema: {
        type: 'object',
        properties: {
          id: {
            type: 'number',
            description: 'Project ID',
          },
        },
        required: ['id'],
      },
    },

    // Work Package tools
    {
      name: 'get_work_packages',
      description: 'Get a list of work packages from OpenProject',
      inputSchema: {
        type: 'object',
        properties: {
          offset: {
            type: 'number',
            description: 'Offset for pagination (default: 0)',
          },
          pageSize: {
            type: 'number',
            description: 'Number of items per page (default: 20)',
          },
          filters: {
            type: 'string',
            description: 'JSON string of filters to apply',
          },
          sortBy: {
            type: 'string',
            description: 'Sort criteria',
          },
          projectId: {
            type: 'number',
            description: 'Filter by project ID',
          },
        },
      },
    },
    {
      name: 'get_work_package',
      description: 'Get a specific work package by ID',
      inputSchema: {
        type: 'object',
        properties: {
          id: {
            type: 'number',
            description: 'Work package ID',
          },
        },
        required: ['id'],
      },
    },
    {
      name: 'create_work_package',
      description: 'Create a new work package in OpenProject',
      inputSchema: {
        type: 'object',
        properties: {
          subject: {
            type: 'string',
            description: 'Work package subject/title',
          },
          description: {
            type: 'string',
            description: 'Work package description',
          },
          projectId: {
            type: 'number',
            description: 'Project ID',
          },
          typeId: {
            type: 'number',
            description: 'Work package type ID',
          },
          statusId: {
            type: 'number',
            description: 'Status ID',
          },
          priorityId: {
            type: 'number',
            description: 'Priority ID',
          },
          assigneeId: {
            type: 'number',
            description: 'Assignee user ID',
          },
          startDate: {
            type: 'string',
            description: 'Start date (YYYY-MM-DD)',
          },
          dueDate: {
            type: 'string',
            description: 'Due date (YYYY-MM-DD)',
          },
          estimatedTime: {
            type: 'string',
            description: 'Estimated time (e.g., "PT8H" for 8 hours)',
          },
        },
        required: ['subject', 'projectId', 'typeId'],
      },
    },
    {
      name: 'create_task',
      description: 'Create a new task in OpenProject (automatically sets type to Task)',
      inputSchema: {
        type: 'object',
        properties: {
          subject: {
            type: 'string',
            description: 'Task subject/title',
          },
          description: {
            type: 'string',
            description: 'Task description',
          },
          projectId: {
            type: 'number',
            description: 'Project ID',
          },
          statusId: {
            type: 'number',
            description: 'Status ID',
          },
          priorityId: {
            type: 'number',
            description: 'Priority ID',
          },
          assigneeId: {
            type: 'number',
            description: 'Assignee user ID',
          },
          startDate: {
            type: 'string',
            description: 'Start date (YYYY-MM-DD)',
          },
          dueDate: {
            type: 'string',
            description: 'Due date (YYYY-MM-DD)',
          },
          estimatedTime: {
            type: 'string',
            description: 'Estimated time (e.g., "PT8H" for 8 hours)',
          },
        },
        required: ['subject', 'projectId'],
      },
    },
    {
      name: 'update_work_package',
      description: 'Update an existing work package',
      inputSchema: {
        type: 'object',
        properties: {
          id: {
            type: 'number',
            description: 'Work package ID',
          },
          subject: {
            type: 'string',
            description: 'Work package subject/title',
          },
          description: {
            type: 'string',
            description: 'Work package description',
          },
          statusId: {
            type: 'number',
            description: 'Status ID',
          },
          priorityId: {
            type: 'number',
            description: 'Priority ID',
          },
          assigneeId: {
            type: 'number',
            description: 'Assignee user ID',
          },
          startDate: {
            type: 'string',
            description: 'Start date (YYYY-MM-DD)',
          },
          dueDate: {
            type: 'string',
            description: 'Due date (YYYY-MM-DD)',
          },
          estimatedTime: {
            type: 'string',
            description: 'Estimated time',
          },
          percentageDone: {
            type: 'number',
            description: 'Percentage done (0-100)',
          },
        },
        required: ['id'],
      },
    },
    {
      name: 'set_work_package_status',
      description: 'Set work package status. STOP on error. Do not investigate.',
      inputSchema: {
        type: 'object',
        properties: {
          id: {
            type: 'number',
            description: 'Work package ID',
          },
          statusId: {
            type: 'number',
            description: 'Status ID (required).',
          },
        },
        required: ['id', 'statusId'],
      },
    },
    {
      name: 'delete_work_package',
      description: 'Delete a work package from OpenProject',
      inputSchema: {
        type: 'object',
        properties: {
          id: {
            type: 'number',
            description: 'Work package ID',
          },
        },
        required: ['id'],
      },
    },

    // Work Package Parent-Child Relationship tools
    {
      name: 'set_work_package_parent',
      description: 'Set a parent work package for a work package (creates parent-child relationship)',
      inputSchema: {
        type: 'object',
        properties: {
          id: {
            type: 'number',
            description: 'Work package ID (child)',
          },
          parentId: {
            type: 'number',
            description: 'Parent work package ID',
          },
        },
        required: ['id', 'parentId'],
      },
    },
    {
      name: 'remove_work_package_parent',
      description: 'Remove the parent relationship from a work package',
      inputSchema: {
        type: 'object',
        properties: {
          id: {
            type: 'number',
            description: 'Work package ID',
          },
        },
        required: ['id'],
      },
    },
    {
      name: 'get_work_package_children',
      description: 'Get all child work packages of a parent work package',
      inputSchema: {
        type: 'object',
        properties: {
          id: {
            type: 'number',
            description: 'Parent work package ID',
          },
        },
        required: ['id'],
      },
    },

    // Search tools
    {
      name: 'search',
      description: 'Search for projects, work packages, or users',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query',
          },
          type: {
            type: 'string',
            enum: ['projects', 'work_packages', 'users'],
            description: 'Type of items to search for',
          },
          limit: {
            type: 'number',
            description: 'Maximum number of results (default: 10)',
          },
        },
        required: ['query', 'type'],
      },
    },

    // User tools
    {
      name: 'get_users',
      description: 'Get a list of users from OpenProject',
      inputSchema: {
        type: 'object',
        properties: {
          offset: {
            type: 'number',
            description: 'Offset for pagination (default: 0)',
          },
          pageSize: {
            type: 'number',
            description: 'Number of items per page (default: 20)',
          },
          filters: {
            type: 'string',
            description: 'JSON string of filters to apply',
          },
        },
      },
    },
    {
      name: 'get_current_user',
      description: 'Get information about the current authenticated user',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },

    // Status tools
    {
      name: 'get_statuses',
      description: 'Get a list of available work package statuses from OpenProject',
      inputSchema: {
        type: 'object',
        properties: {
          offset: {
            type: 'number',
            description: 'Offset for pagination (default: 0)',
          },
          pageSize: {
            type: 'number',
            description: 'Number of items per page (default: 20)',
          },
          filters: {
            type: 'string',
            description: 'JSON string of filters to apply',
          },
        },
      },
    },

    // Time Entry tools
    {
      name: 'get_time_entries',
      description: 'Get a list of time entries from OpenProject',
      inputSchema: {
        type: 'object',
        properties: {
          offset: {
            type: 'number',
            description: 'Offset for pagination (default: 0)',
          },
          pageSize: {
            type: 'number',
            description: 'Number of items per page (default: 20)',
          },
          filters: {
            type: 'string',
            description: 'JSON string of filters to apply',
          },
          workPackageId: {
            type: 'number',
            description: 'Filter by work package ID',
          },
          projectId: {
            type: 'number',
            description: 'Filter by project ID',
          },
          userId: {
            type: 'number',
            description: 'Filter by user ID',
          },
        },
      },
    },
    {
      name: 'create_time_entry',
      description: 'Create a new time entry in OpenProject',
      inputSchema: {
        type: 'object',
        properties: {
          workPackageId: {
            type: 'number',
            description: 'Work package ID (optional)',
          },
          projectId: {
            type: 'number',
            description: 'Project ID',
          },
          activityId: {
            type: 'number',
            description: 'Activity ID',
          },
          hours: {
            type: 'string',
            description: 'Hours spent (e.g., "8.5")',
          },
          comment: {
            type: 'string',
            description: 'Comment/description',
          },
          spentOn: {
            type: 'string',
            description: 'Date spent on (YYYY-MM-DD, defaults to today)',
          },
        },
        required: ['projectId', 'activityId', 'hours'],
      },
    },

    // Utility tools
    {
      name: 'test_connection',
      description: 'Test the connection to OpenProject API',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
    {
      name: 'get_api_info',
      description: 'Get OpenProject API information and capabilities',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },

    // Kanban Board tools
    {
      name: 'get_boards',
      description: 'Get a list of Kanban boards from OpenProject',
      inputSchema: {
        type: 'object',
        properties: {
          projectId: {
            type: 'number',
            description: 'Filter boards by project ID',
          },
          offset: {
            type: 'number',
            description: 'Offset for pagination (default: 0)',
          },
          pageSize: {
            type: 'number',
            description: 'Number of items per page (default: 20)',
          },
          filters: {
            type: 'string',
            description: 'JSON string of filters to apply',
          },
          sortBy: {
            type: 'string',
            description: 'Sort criteria',
          },
        },
      },
    },
    {
      name: 'get_board',
      description: 'Get a specific Kanban board by ID',
      inputSchema: {
        type: 'object',
        properties: {
          id: {
            type: 'number',
            description: 'Board ID',
          },
        },
        required: ['id'],
      },
    },
    {
      name: 'create_board',
      description: 'Create a new Kanban board in OpenProject',
      inputSchema: {
        type: 'object',
        properties: {
          projectId: {
            type: 'number',
            description: 'Project ID where the board will be created',
          },
          name: {
            type: 'string',
            description: 'Board name',
          },
          description: {
            type: 'string',
            description: 'Board description',
          },
          rowCount: {
            type: 'number',
            description: 'Number of rows in the board (default: 1)',
          },
          columnCount: {
            type: 'number',
            description: 'Number of columns in the board (default: 3)',
          },
        },
        required: ['projectId'],
      },
    },
    {
      name: 'update_board',
      description: 'Update an existing Kanban board',
      inputSchema: {
        type: 'object',
        properties: {
          id: {
            type: 'number',
            description: 'Board ID',
          },
          name: {
            type: 'string',
            description: 'Board name',
          },
          description: {
            type: 'string',
            description: 'Board description',
          },
          rowCount: {
            type: 'number',
            description: 'Number of rows in the board',
          },
          columnCount: {
            type: 'number',
            description: 'Number of columns in the board',
          },
        },
        required: ['id'],
      },
    },
    {
      name: 'delete_board',
      description: 'Delete a Kanban board from OpenProject',
      inputSchema: {
        type: 'object',
        properties: {
          id: {
            type: 'number',
            description: 'Board ID',
          },
        },
        required: ['id'],
      },
    },
    {
      name: 'add_board_widget',
      description: 'Add a widget (column) to a Kanban board',
      inputSchema: {
        type: 'object',
        properties: {
          boardId: {
            type: 'number',
            description: 'Board ID',
          },
          identifier: {
            type: 'string',
            description: 'Widget identifier (e.g., "work_package_query")',
          },
          startRow: {
            type: 'number',
            description: 'Starting row position',
          },
          endRow: {
            type: 'number',
            description: 'Ending row position',
          },
          startColumn: {
            type: 'number',
            description: 'Starting column position',
          },
          endColumn: {
            type: 'number',
            description: 'Ending column position',
          },
          queryId: {
            type: 'number',
            description: 'Query ID for filtering work packages',
          },
          options: {
            type: 'object',
            description: 'Additional widget options',
          },
        },
        required: ['boardId', 'identifier', 'startRow', 'endRow', 'startColumn', 'endColumn'],
      },
    },
    {
      name: 'remove_board_widget',
      description: 'Remove a widget from a Kanban board',
      inputSchema: {
        type: 'object',
        properties: {
          boardId: {
            type: 'number',
            description: 'Board ID',
          },
          widgetId: {
            type: 'number',
            description: 'Widget ID to remove',
          },
        },
        required: ['boardId', 'widgetId'],
      },
    },

    // Membership tools
    {
      name: 'get_memberships',
      description: 'Get a list of project memberships from OpenProject',
      inputSchema: {
        type: 'object',
        properties: {
          offset: {
            type: 'number',
            description: 'Offset for pagination (default: 0)',
          },
          pageSize: {
            type: 'number',
            description: 'Number of items per page (default: 20)',
          },
          filters: {
            type: 'string',
            description: 'JSON string of filters to apply',
          },
          sortBy: {
            type: 'string',
            description: 'Sort criteria (e.g., "created_at:desc")',
          },
          projectId: {
            type: 'number',
            description: 'Filter by project ID',
          },
        },
      },
    },
    {
      name: 'get_membership',
      description: 'Get a specific project membership by ID',
      inputSchema: {
        type: 'object',
        properties: {
          id: {
            type: 'number',
            description: 'Membership ID',
          },
        },
        required: ['id'],
      },
    },
    {
      name: 'create_membership',
      description: 'Create a new project membership (add user to project)',
      inputSchema: {
        type: 'object',
        properties: {
          projectId: {
            type: 'number',
            description: 'Project ID',
          },
          userId: {
            type: 'number',
            description: 'User ID to add to the project',
          },
          roleIds: {
            type: 'array',
            items: {
              type: 'number',
            },
            description: 'Array of role IDs to assign to the user',
          },
        },
        required: ['projectId', 'userId', 'roleIds'],
      },
    },
    {
      name: 'update_membership',
      description: 'Update an existing project membership (modify user roles)',
      inputSchema: {
        type: 'object',
        properties: {
          id: {
            type: 'number',
            description: 'Membership ID',
          },
          roleIds: {
            type: 'array',
            items: {
              type: 'number',
            },
            description: 'Array of role IDs to assign to the user',
          },
        },
        required: ['id', 'roleIds'],
      },
    },
    {
      name: 'delete_membership',
      description: 'Delete a project membership (remove user from project)',
      inputSchema: {
        type: 'object',
        properties: {
          id: {
            type: 'number',
            description: 'Membership ID',
          },
        },
        required: ['id'],
      },
    },

    // Role tools
    {
      name: 'get_roles',
      description: 'Get a list of available roles from OpenProject',
      inputSchema: {
        type: 'object',
        properties: {
          offset: {
            type: 'number',
            description: 'Offset for pagination (default: 0)',
          },
          pageSize: {
            type: 'number',
            description: 'Number of items per page (default: 20)',
          },
          filters: {
            type: 'string',
            description: 'JSON string of filters to apply',
          },
          sortBy: {
            type: 'string',
            description: 'Sort criteria (e.g., "name:asc")',
          },
        },
      },
    },
    {
      name: 'get_role',
      description: 'Get a specific role by ID',
      inputSchema: {
        type: 'object',
        properties: {
          id: {
            type: 'number',
            description: 'Role ID',
          },
        },
        required: ['id'],
      },
    },

    // Upload Attachment tool
    {
      name: 'upload_attachment',
      description: 'Upload a file attachment to a work package',
      inputSchema: {
        type: 'object',
        properties: {
          workPackageId: {
            type: 'number',
            description: 'Work package ID to attach the file to',
          },
          filePath: {
            type: 'string',
            description: 'Path to the file to upload (absolute or relative to working directory)',
          },
          description: {
            type: 'string',
            description: 'Optional description for the attachment',
          },
        },
        required: ['workPackageId', 'filePath'],
      },
    },

    // Get Attachments tool
    {
      name: 'get_attachments',
      description: 'Get all attachments for a work package',
      inputSchema: {
        type: 'object',
        properties: {
          workPackageId: {
            type: 'number',
            description: 'Work package ID to get attachments for',
          },
        },
        required: ['workPackageId'],
      },
    },
  ];
}

// Export argument schemas for use in tool handlers
export {
  GetProjectsArgsSchema,
  GetProjectArgsSchema,
  CreateProjectArgsSchema,
  UpdateProjectArgsSchema,
  DeleteProjectArgsSchema,
  GetWorkPackagesArgsSchema,
  GetWorkPackageArgsSchema,
  CreateWorkPackageArgsSchema,
  CreateTaskArgsSchema,
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
  GetMembershipsArgsSchema,
  GetMembershipArgsSchema,
  CreateMembershipArgsSchema,
  UpdateMembershipArgsSchema,
  DeleteMembershipArgsSchema,
  GetRolesArgsSchema,
  GetRoleArgsSchema,
  UploadAttachmentArgsSchema,
  GetAttachmentsArgsSchema,
};