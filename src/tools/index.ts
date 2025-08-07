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

const DeleteWorkPackageArgsSchema = z.object({
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
  UpdateWorkPackageArgsSchema,
  DeleteWorkPackageArgsSchema,
  SearchArgsSchema,
  GetUsersArgsSchema,
  GetTimeEntriesArgsSchema,
  CreateTimeEntryArgsSchema,
};