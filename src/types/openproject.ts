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

// Grid Widget schema for Kanban boards
export const GridWidgetSchema = z.object({
  _type: z.literal('GridWidget'),
  id: z.number(),
  identifier: z.string(),
  startRow: z.number(),
  endRow: z.number(),
  startColumn: z.number(),
  endColumn: z.number(),
  options: z.record(z.any()).optional(),
  _links: z.record(z.any()).optional(),
  _embedded: z.object({
    query: z.object({
      _type: z.literal('Query'),
      id: z.number(),
      name: z.string(),
      filters: z.array(z.any()).optional(),
      _links: z.record(z.any()).optional(),
    }).optional(),
  }).optional(),
});

// Grid schema for Kanban boards
export const GridSchema = z.object({
  _type: z.literal('Grid'),
  id: z.number(),
  rowCount: z.number(),
  columnCount: z.number(),
  scope: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  _embedded: z.object({
    widgets: z.array(GridWidgetSchema),
  }),
  _links: z.record(z.any()).optional(),
});

// Board schema (extends Grid)
export const BoardSchema = GridSchema.extend({
  name: z.string().optional(),
  description: z.string().optional(),
});

// Collection response schema - OpenProject uses different _type values for different collections
export const CollectionResponseSchema = z.object({
  _type: z.union([
    z.literal('Collection'),
    z.literal('WorkPackageCollection'),
    z.literal('ProjectCollection'),
    z.literal('UserCollection'),
    z.literal('TimeEntryCollection'),
    z.literal('GridCollection')
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

// Status schema for work package statuses
export const StatusSchema = z.object({
  _type: z.literal('Status'),
  id: z.number(),
  name: z.string(),
  isClosed: z.boolean(),
  color: z.string().optional(),
  isDefault: z.boolean().optional(),
  isReadonly: z.boolean().optional(),
  excludedFromTotals: z.boolean().optional(),
  defaultDoneRatio: z.number().optional(),
  position: z.number().optional(),
  _links: z.record(z.any()).optional(),
});

// Status collection response schema
export const StatusCollectionResponseSchema = z.object({
  _type: z.literal('Collection'),
  total: z.number(),
  count: z.number(),
  pageSize: z.number().optional(),
  offset: z.number().optional(),
  _embedded: z.object({
    elements: z.array(StatusSchema),
  }),
  _links: z.record(z.any()).optional(),
});

// Role schemas
export const RoleSchema = z.object({
  _type: z.literal('Role'),
  id: z.number(),
  name: z.string(),
  _links: z.object({
    self: z.object({
      href: z.string(),
      title: z.string(),
    }),
  }),
});

// Attachment schemas
export const AttachmentSchema = z.object({
  _type: z.literal('Attachment'),
  id: z.number(),
  fileName: z.string(),
  fileSize: z.number(),
  description: z.union([
    z.string(),
    z.object({
      format: z.string(),
      raw: z.string(),
      html: z.string().optional(),
    })
  ]).optional(),
  _links: z.object({
    self: z.object({
      href: z.string(),
      title: z.string(),
    }),
    author: z.object({
      href: z.string(),
      title: z.string(),
    }),
    container: z.object({
      href: z.string(),
      title: z.string(),
    }),
    staticDownloadLocation: z.object({
      href: z.string(),
    }),
    downloadLocation: z.object({
      href: z.string(),
    }),
    delete: z.object({
      href: z.string(),
      method: z.string(),
    }),
  }),
});

// Attachment collection response schema
export const AttachmentCollectionResponseSchema = z.object({
  _type: z.literal('Collection'),
  total: z.number(),
  count: z.number(),
  pageSize: z.number().optional(),
  offset: z.number().optional(),
  _embedded: z.object({
    elements: z.array(AttachmentSchema),
  }),
  _links: z.record(z.any()).optional(),
});

// Membership schemas
export const MembershipSchema = z.object({
  _type: z.literal('Membership'),
  id: z.number(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  _links: z.object({
    self: z.object({
      href: z.string(),
      title: z.string().optional(),
    }),
    schema: z.object({
      href: z.string(),
    }).optional(),
    update: z.object({
      href: z.string(),
      method: z.string(),
    }).optional(),
    updateImmediately: z.object({
      href: z.string(),
      method: z.string(),
    }).optional(),
    project: z.object({
      href: z.string(),
      title: z.string(),
    }),
    principal: z.object({
      href: z.string(),
      title: z.string(),
    }),
    roles: z.array(z.object({
      href: z.string(),
      title: z.string(),
    })),
  }),
});

// Collection response schemas for memberships and roles
export const MembershipCollectionResponseSchema = z.object({
  _type: z.literal('Collection'),
  total: z.number(),
  count: z.number(),
  pageSize: z.number().optional(),
  offset: z.number().optional(),
  _embedded: z.object({
    elements: z.array(MembershipSchema),
  }),
  _links: z.record(z.any()).optional(),
});

export const RoleCollectionResponseSchema = z.object({
  _type: z.literal('Collection'),
  total: z.number(),
  count: z.number(),
  pageSize: z.number().optional(),
  offset: z.number().optional(),
  _embedded: z.object({
    elements: z.array(RoleSchema),
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
export type GridWidget = z.infer<typeof GridWidgetSchema>;
export type Grid = z.infer<typeof GridSchema>;
export type Board = z.infer<typeof BoardSchema>;
export type Status = z.infer<typeof StatusSchema>;
export type StatusCollectionResponse = z.infer<typeof StatusCollectionResponseSchema>;
export type CollectionResponse = z.infer<typeof CollectionResponseSchema>;
export type Membership = z.infer<typeof MembershipSchema>;
export type Role = z.infer<typeof RoleSchema>;
export type Attachment = z.infer<typeof AttachmentSchema>;
export type AttachmentCollectionResponse = z.infer<typeof AttachmentCollectionResponseSchema>;
export type MembershipCollectionResponse = z.infer<typeof MembershipCollectionResponseSchema>;
export type RoleCollectionResponse = z.infer<typeof RoleCollectionResponseSchema>;
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
