import { z } from 'zod';

// Base OpenProject API response structure
export const OpenProjectResponseSchema = z.object({
  _type: z.string(),
  id: z.number().optional(),
  _links: z.record(z.any()).optional(),
});

// Project schemas
export const ProjectSchema = z.object({
  id: z.number(),
  identifier: z.string(),
  name: z.string(),
  description: z.union([
    z.string(),
    z.object({
      format: z.string(),
      raw: z.string(),
      html: z.string().optional(),
    }),
    z.null()
  ]).optional(),
  public: z.boolean(),
  active: z.boolean(),
  status: z.union([
    z.string(),
    z.object({
      id: z.number(),
      name: z.string(),
    })
  ]).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  _type: z.literal('Project'),
  _links: z.record(z.any()).optional(),
});

// Work Package schemas
export const WorkPackageSchema = z.object({
  id: z.number(),
  subject: z.string(),
  description: z.union([
    z.string(),
    z.object({
      format: z.string(),
      raw: z.string(),
      html: z.string().optional(),
    }),
    z.null()
  ]).optional(),
  startDate: z.string().nullable(),
  dueDate: z.string().nullable(),
  estimatedTime: z.string().nullable(),
  spentTime: z.string().nullable().optional(),
  percentageDone: z.number().nullable().optional(),
  priority: z.object({
    id: z.number(),
    name: z.string(),
  }).nullable().optional(),
  status: z.object({
    id: z.number(),
    name: z.string(),
  }).optional(),
  type: z.object({
    id: z.number(),
    name: z.string(),
  }).optional(),
  assignee: z.object({
    id: z.number(),
    name: z.string(),
  }).nullable().optional(),
  responsible: z.object({
    id: z.number(),
    name: z.string(),
  }).nullable().optional(),
  project: z.object({
    id: z.number(),
    name: z.string(),
  }).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  lockVersion: z.number(),
  _type: z.literal('WorkPackage'),
  _links: z.record(z.any()).optional(),
});

// User schemas
export const UserSchema = z.object({
  id: z.number(),
  login: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  name: z.string(),
  email: z.string(),
  admin: z.boolean(),
  avatar: z.string().nullable(),
  status: z.string(),
  language: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  _type: z.literal('User'),
  _links: z.record(z.any()).optional(),
});

// Time Entry schemas
export const TimeEntrySchema = z.object({
  id: z.number(),
  ongoing: z.boolean().optional(),
  comment: z.union([
    z.string(),
    z.object({
      format: z.string(),
      raw: z.string(),
      html: z.string().optional(),
    }),
    z.null()
  ]).optional(),
  spentOn: z.string(),
  hours: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  _type: z.literal('TimeEntry'),
  _embedded: z.object({
    activity: z.object({
      _type: z.string(),
      id: z.number(),
      name: z.string(),
      position: z.number().optional(),
      default: z.boolean().optional(),
      _links: z.record(z.any()).optional(),
    }).optional(),
    project: z.object({
      _type: z.string(),
      id: z.number(),
      name: z.string(),
      identifier: z.string().optional(),
      active: z.boolean().optional(),
      public: z.boolean().optional(),
      description: z.union([
        z.string(),
        z.object({
          format: z.string(),
          raw: z.string(),
          html: z.string().optional(),
        }),
        z.null()
      ]).optional(),
      _links: z.record(z.any()).optional(),
    }).optional(),
    workPackage: z.object({
      _type: z.string(),
      id: z.number(),
      subject: z.string(),
      _links: z.record(z.any()).optional(),
    }).nullable().optional(),
    user: z.object({
      _type: z.string(),
      id: z.number(),
      name: z.string(),
      login: z.string().optional(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      email: z.string().optional(),
      admin: z.boolean().optional(),
      avatar: z.string().nullable().optional(),
      status: z.string().optional(),
      identityUrl: z.string().nullable().optional(),
      language: z.string().optional(),
      createdAt: z.string().optional(),
      updatedAt: z.string().optional(),
      _links: z.record(z.any()).optional(),
    }).optional(),
  }).optional(),
  _links: z.record(z.any()).optional(),
});

// Collection response schema - OpenProject uses different _type values for different collections
export const CollectionResponseSchema = z.object({
  _type: z.union([
    z.literal('Collection'),
    z.literal('WorkPackageCollection'),
    z.literal('ProjectCollection'),
    z.literal('UserCollection'),
    z.literal('TimeEntryCollection')
  ]),
  total: z.number(),
  count: z.number(),
  pageSize: z.number().optional(),
  offset: z.number().optional(),
  _embedded: z.object({
    elements: z.array(z.any()),
  }),
  _links: z.record(z.any()).optional(),
});

// API Configuration
export const OpenProjectConfigSchema = z.object({
  baseUrl: z.string().url(),
  apiKey: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
});

// Export types
export type Project = z.infer<typeof ProjectSchema>;
export type WorkPackage = z.infer<typeof WorkPackageSchema>;
export type User = z.infer<typeof UserSchema>;
export type TimeEntry = z.infer<typeof TimeEntrySchema>;
export type CollectionResponse = z.infer<typeof CollectionResponseSchema>;
export type OpenProjectConfig = z.infer<typeof OpenProjectConfigSchema>;

// Query parameters for API calls
export interface QueryParams {
  offset?: number;
  pageSize?: number;
  filters?: string;
  sortBy?: string;
  groupBy?: string;
  showSums?: boolean;
}

// Error response from OpenProject API
export interface OpenProjectError {
  _type: 'Error';
  errorIdentifier: string;
  message: string;
  details?: Record<string, any>;
}