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
  description: z.string().nullable(),
  public: z.boolean(),
  active: z.boolean(),
  status: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  _type: z.literal('Project'),
  _links: z.record(z.any()).optional(),
});

// Work Package schemas
export const WorkPackageSchema = z.object({
  id: z.number(),
  subject: z.string(),
  description: z.string().nullable(),
  startDate: z.string().nullable(),
  dueDate: z.string().nullable(),
  estimatedTime: z.string().nullable(),
  spentTime: z.string().nullable(),
  percentageDone: z.number(),
  priority: z.object({
    id: z.number(),
    name: z.string(),
  }).nullable(),
  status: z.object({
    id: z.number(),
    name: z.string(),
  }),
  type: z.object({
    id: z.number(),
    name: z.string(),
  }),
  assignee: z.object({
    id: z.number(),
    name: z.string(),
  }).nullable(),
  responsible: z.object({
    id: z.number(),
    name: z.string(),
  }).nullable(),
  project: z.object({
    id: z.number(),
    name: z.string(),
  }),
  createdAt: z.string(),
  updatedAt: z.string(),
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
  comment: z.string().nullable(),
  spentOn: z.string(),
  hours: z.string(),
  activity: z.object({
    id: z.number(),
    name: z.string(),
  }),
  project: z.object({
    id: z.number(),
    name: z.string(),
  }),
  workPackage: z.object({
    id: z.number(),
    subject: z.string(),
  }).nullable(),
  user: z.object({
    id: z.number(),
    name: z.string(),
  }),
  createdAt: z.string(),
  updatedAt: z.string(),
  _type: z.literal('TimeEntry'),
  _links: z.record(z.any()).optional(),
});

// Collection response schema
export const CollectionResponseSchema = z.object({
  _type: z.literal('Collection'),
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