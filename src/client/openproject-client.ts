import axios, { AxiosInstance } from 'axios';
import https from 'https';
import {
  OpenProjectConfig,
  Project,
  WorkPackage,
  User,
  TimeEntry,
  Grid,
  Board,
  StatusCollectionResponse,
  CollectionResponse,
  QueryParams,
  OpenProjectError,
  ProjectSchema,
  WorkPackageSchema,
  UserSchema,
  TimeEntrySchema,
  GridSchema,
  BoardSchema,
  StatusCollectionResponseSchema,
  CollectionResponseSchema,
  MembershipCollectionResponse,
  MembershipCollectionResponseSchema,
  MembershipSchema,
  RoleCollectionResponse,
  RoleCollectionResponseSchema,
  RoleSchema,
  Membership,
  Role,
} from '../types/openproject.js';
import { logger } from '../utils/logger.js';

export class OpenProjectClient {
  private axiosInstance: AxiosInstance;

  constructor(config: OpenProjectConfig) {
    this.axiosInstance = axios.create({
      baseURL: `${config.baseUrl}/api/v3`,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: 30000,
      // Handle SSL certificate issues
      httpsAgent: new https.Agent({
        rejectUnauthorized: process.env['NODE_TLS_REJECT_UNAUTHORIZED'] !== '0'
      }),
    });

    // Setup authentication - OpenProject uses Basic Auth with 'apikey' as username
    if (config.apiKey) {
      this.axiosInstance.defaults.auth = {
        username: 'apikey',
        password: config.apiKey,
      };
    } else if (config.username && config.password) {
      this.axiosInstance.defaults.auth = {
        username: config.username,
        password: config.password,
      };
    }

    // Add response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.data) {
          const errorData = error.response.data as OpenProjectError;
          throw new Error(`OpenProject API Error: ${errorData.message || error.message}`);
        }
        throw error;
      }
    );
  }

  private buildQueryString(params: QueryParams): string {
    const searchParams = new URLSearchParams();
    
    if (params.offset !== undefined) {
      searchParams.append('offset', params.offset.toString());
    }
    if (params.pageSize !== undefined) {
      searchParams.append('pageSize', params.pageSize.toString());
    }
    if (params.filters) {
      searchParams.append('filters', params.filters);
    }
    if (params.sortBy) {
      searchParams.append('sortBy', params.sortBy);
    }
    if (params.groupBy) {
      searchParams.append('groupBy', params.groupBy);
    }
    if (params.showSums !== undefined) {
      searchParams.append('showSums', params.showSums.toString());
    }

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
  }

  // Projects API
  async getProjects(params: QueryParams = {}): Promise<CollectionResponse> {
    const startTime = Date.now();
    const queryString = this.buildQueryString(params);
    const url = `/projects${queryString}`;
    
    try {
      logger.logApiRequest('GET', url, undefined, params);
      const response = await this.axiosInstance.get(url);
      
      logger.logApiResponse('GET', url, response.status, response.headers, response.data);
      logger.logRawData('getProjects response', response.data);
      
      const duration = Date.now() - startTime;
      logger.info(`getProjects completed successfully (${duration}ms)`, {
        totalProjects: response.data?.total,
        returnedCount: response.data?._embedded?.elements?.length
      });
      
      return CollectionResponseSchema.parse(response.data);
    } catch (error: any) {
      const duration = Date.now() - startTime;
      logger.error(`getProjects failed (${duration}ms)`, {
        error: error.message,
        status: error.response?.status,
        responseData: error.response?.data,
        params
      });
      throw error;
    }
  }

  async getProject(id: number): Promise<Project> {
    const startTime = Date.now();
    const url = `/projects/${id}`;
    
    try {
      logger.logApiRequest('GET', url, undefined, { id });
      const response = await this.axiosInstance.get(url);
      
      logger.logApiResponse('GET', url, response.status, response.headers, response.data);
      logger.logRawData('getProject response', response.data);
      
      const duration = Date.now() - startTime;
      logger.info(`getProject completed successfully (${duration}ms)`, {
        projectId: id,
        projectName: response.data?.name
      });
      
      return ProjectSchema.parse(response.data);
    } catch (error: any) {
      const duration = Date.now() - startTime;
      logger.error(`getProject failed (${duration}ms)`, {
        error: error.message,
        status: error.response?.status,
        responseData: error.response?.data,
        projectId: id
      });
      throw error;
    }
  }

  async createProject(projectData: Partial<Project>): Promise<Project> {
    const response = await this.axiosInstance.post('/projects', projectData);
    return ProjectSchema.parse(response.data);
  }

  async updateProject(id: number, projectData: Partial<Project>): Promise<Project> {
    const response = await this.axiosInstance.patch(`/projects/${id}`, projectData);
    return ProjectSchema.parse(response.data);
  }

  async deleteProject(id: number): Promise<void> {
    await this.axiosInstance.delete(`/projects/${id}`);
  }

  // Work Packages API
  async getWorkPackages(params: QueryParams = {}): Promise<CollectionResponse> {
    const startTime = Date.now();
    const queryString = this.buildQueryString(params);
    const url = `/work_packages${queryString}`;
    
    try {
      logger.logApiRequest('GET', url, undefined, params);
      const response = await this.axiosInstance.get(url);
      
      // Extract readable description text for all work packages
      if (response.data._embedded?.elements) {
        response.data._embedded.elements.forEach((wp: any) => {
          if (wp.description && typeof wp.description === 'object') {
            wp.description = this.extractDescriptionText(wp.description);
          }
          
          // Transform _links structure to match schema expectations for each work package
          // Transform status from _links.status to status object
          if (wp._links?.status) {
            const statusHref = wp._links.status.href;
            const statusId = statusHref ? parseInt(statusHref.split('/').pop() || '0') : null;
            if (statusId) {
              wp.status = {
                id: statusId,
                name: wp._links.status.title || 'Unknown'
              };
            }
          }
          
          // Transform project from _links.project to project object
          if (wp._links?.project) {
            const projectHref = wp._links.project.href;
            const projectId = projectHref ? parseInt(projectHref.split('/').pop() || '0') : null;
            if (projectId) {
              wp.project = {
                id: projectId,
                name: wp._links.project.title || 'Unknown'
              };
            }
          }
          
          // Transform type from _links.type to type object
          if (wp._links?.type) {
            const typeHref = wp._links.type.href;
            const typeId = typeHref ? parseInt(typeHref.split('/').pop() || '0') : null;
            if (typeId) {
              wp.type = {
                id: typeId,
                name: wp._links.type.title || 'Unknown'
              };
            }
          }
          
          // Transform priority from _links.priority to priority object
          if (wp._links?.priority) {
            const priorityHref = wp._links.priority.href;
            const priorityId = priorityHref ? parseInt(priorityHref.split('/').pop() || '0') : null;
            if (priorityId) {
              wp.priority = {
                id: priorityId,
                name: wp._links.priority.title || 'Unknown'
              };
            }
          }
          
          // Transform assignee from _links.assignee to assignee object
          if (wp._links?.assignee) {
            const assigneeHref = wp._links.assignee.href;
            const assigneeId = assigneeHref ? parseInt(assigneeHref.split('/').pop() || '0') : null;
            if (assigneeId) {
              wp.assignee = {
                id: assigneeId,
                name: wp._links.assignee.title || 'Unknown'
              };
            }
          }
          
          // Transform responsible from _links.responsible to responsible object
          if (wp._links?.responsible) {
            const responsibleHref = wp._links.responsible.href;
            const responsibleId = responsibleHref ? parseInt(responsibleHref.split('/').pop() || '0') : null;
            if (responsibleId) {
              wp.responsible = {
                id: responsibleId,
                name: wp._links.responsible.title || 'Unknown'
              };
            }
          }
        });
      }
      
      logger.logApiResponse('GET', url, response.status, response.headers, response.data);
      logger.logRawData('getWorkPackages response', response.data);
      
      const duration = Date.now() - startTime;
      logger.info(`getWorkPackages completed successfully (${duration}ms)`, {
        totalWorkPackages: response.data?.total,
        returnedCount: response.data?._embedded?.elements?.length
      });
      
      return CollectionResponseSchema.parse(response.data);
    } catch (error: any) {
      const duration = Date.now() - startTime;
      logger.error(`getWorkPackages failed (${duration}ms)`, {
        error: error.message,
        status: error.response?.status,
        responseData: error.response?.data,
        params
      });
      throw error;
    }
  }

  async getWorkPackage(id: number): Promise<WorkPackage> {
    const response = await this.axiosInstance.get(`/work_packages/${id}`);
    logger.debug('Raw work package API response', { id, responseData: response.data });
    
    // Extract readable description text if it's an object
    if (response.data.description && typeof response.data.description === 'object') {
      response.data.description = this.extractDescriptionText(response.data.description);
    }
    
    // Transform _links structure to match schema expectations
    const transformedData = { ...response.data };
    
    // Transform status from _links.status to status object
    if (transformedData._links?.status) {
      const statusHref = transformedData._links.status.href;
      const statusId = statusHref ? parseInt(statusHref.split('/').pop() || '0') : null;
      if (statusId) {
        transformedData.status = {
          id: statusId,
          name: transformedData._links.status.title || 'Unknown'
        };
      }
    }
    
    // Transform project from _links.project to project object
    if (transformedData._links?.project) {
      const projectHref = transformedData._links.project.href;
      const projectId = projectHref ? parseInt(projectHref.split('/').pop() || '0') : null;
      if (projectId) {
        transformedData.project = {
          id: projectId,
          name: transformedData._links.project.title || 'Unknown'
        };
      }
    }
    
    // Transform type from _links.type to type object
    if (transformedData._links?.type) {
      const typeHref = transformedData._links.type.href;
      const typeId = typeHref ? parseInt(typeHref.split('/').pop() || '0') : null;
      if (typeId) {
        transformedData.type = {
          id: typeId,
          name: transformedData._links.type.title || 'Unknown'
        };
      }
    }
    
    // Transform priority from _links.priority to priority object
    if (transformedData._links?.priority) {
      const priorityHref = transformedData._links.priority.href;
      const priorityId = priorityHref ? parseInt(priorityHref.split('/').pop() || '0') : null;
      if (priorityId) {
        transformedData.priority = {
          id: priorityId,
          name: transformedData._links.priority.title || 'Unknown'
        };
      }
    }
    
    // Transform assignee from _links.assignee to assignee object
    if (transformedData._links?.assignee) {
      const assigneeHref = transformedData._links.assignee.href;
      const assigneeId = assigneeHref ? parseInt(assigneeHref.split('/').pop() || '0') : null;
      if (assigneeId) {
        transformedData.assignee = {
          id: assigneeId,
          name: transformedData._links.assignee.title || 'Unknown'
        };
      }
    }
    
    // Transform responsible from _links.responsible to responsible object
    if (transformedData._links?.responsible) {
      const responsibleHref = transformedData._links.responsible.href;
      const responsibleId = responsibleHref ? parseInt(responsibleHref.split('/').pop() || '0') : null;
      if (responsibleId) {
        transformedData.responsible = {
          id: responsibleId,
          name: transformedData._links.responsible.title || 'Unknown'
        };
      }
    }
    
    logger.debug('Transformed work package data', { transformedData });
    
    return WorkPackageSchema.parse(transformedData);
  }

  async createWorkPackage(workPackageData: Partial<WorkPackage>): Promise<WorkPackage> {
    const startTime = Date.now();
    const url = '/work_packages';
    
    try {
      // Transform description field to proper OpenProject format BEFORE sending to API
      const transformedData = { ...workPackageData };
      if (transformedData.description && typeof transformedData.description === 'string') {
        transformedData.description = {
          format: 'text',
          raw: transformedData.description
        };
        logger.debug('Transformed description to OpenProject format for creation', { 
          originalDescription: workPackageData.description,
          transformedDescription: transformedData.description
        });
      }
      
      logger.logApiRequest('POST', url, transformedData);
      const response = await this.axiosInstance.post(url, transformedData);
      
      logger.logApiResponse('POST', url, response.status, response.headers, response.data);
      
      const duration = Date.now() - startTime;
      logger.info(`createWorkPackage completed successfully (${duration}ms)`, {
        newWorkPackageId: response.data.id,
        subject: response.data.subject
      });
      
      return WorkPackageSchema.parse(response.data);
    } catch (error: any) {
      const duration = Date.now() - startTime;
      logger.error(`createWorkPackage failed (${duration}ms)`, {
        error: error.message,
        status: error.response?.status,
        responseData: error.response?.data,
        workPackageData
      });
      throw error;
    }
  }

  async updateWorkPackage(id: number, workPackageData: Partial<WorkPackage>): Promise<WorkPackage> {
    const startTime = Date.now();
    const url = `/work_packages/${id}`;
    
    try {
      // First, get the current work package to retrieve the lockVersion for optimistic locking
      logger.debug(`Getting current work package ${id} for lockVersion`, { id });
      const currentResponse = await this.axiosInstance.get(url);
      const currentWorkPackage = currentResponse.data;
      const lockVersion = currentWorkPackage.lockVersion;
      
      logger.debug('LockVersion retrieved for work package update', { 
        id, 
        lockVersion, 
        hasLockVersion: !!lockVersion, 
        currentStatus: currentWorkPackage._links?.status?.title,
        currentAssignee: currentWorkPackage._links?.assignee?.title
      });
      
      // Transform description field to proper OpenProject format BEFORE building payload
      const transformedData = { ...workPackageData };
      if (transformedData.description && typeof transformedData.description === 'string') {
        transformedData.description = {
          format: 'text',
          raw: transformedData.description
        };
        logger.debug('Transformed description to OpenProject format', { 
          id, 
          originalDescription: workPackageData.description,
          transformedDescription: transformedData.description
        });
      }
      
      // Build the update payload with transformed data
      const updatePayload: any = {
        lockVersion: lockVersion,
        ...transformedData // Spread the transformed data
      };
      
      // Remove nested objects that need special handling
      if (updatePayload.status) delete updatePayload.status;
      if (updatePayload.assignee) delete updatePayload.assignee;
      if (updatePayload.priority) delete updatePayload.priority;
      
      // Only add _links if we have relationship updates
      const needsLinks = workPackageData.status?.id || workPackageData.assignee?.id || workPackageData.priority?.id;
      if (needsLinks) {
        updatePayload._links = {};
        
        // Handle status updates with correct URL format (no double /api/v3)
        if (workPackageData.status?.id) {
          const baseUrl = this.axiosInstance.defaults.baseURL?.replace('/api/v3', '') || '';
          updatePayload._links.status = {
            href: `${baseUrl}/api/v3/statuses/${workPackageData.status.id}`
          };
        }
        
        // Handle assignee updates with correct URL format
        if (workPackageData.assignee?.id) {
          const baseUrl = this.axiosInstance.defaults.baseURL?.replace('/api/v3', '') || '';
          updatePayload._links.assignee = {
            href: `${baseUrl}/api/v3/users/${workPackageData.assignee.id}`
          };
        }
        
        // Handle priority updates with correct URL format
        if (workPackageData.priority?.id) {
          const baseUrl = this.axiosInstance.defaults.baseURL?.replace('/api/v3', '') || '';
          updatePayload._links.priority = {
            href: `${baseUrl}/api/v3/priorities/${workPackageData.priority.id}`
          };
        }
      }
      
      logger.logApiRequest('PATCH', url, updatePayload, { id, lockVersion });
      logger.debug('Updating work package with proper API format', { id, updatePayload });
      
      const response = await this.axiosInstance.patch(url, updatePayload);
      
      logger.logApiResponse('PATCH', url, response.status, response.headers, response.data);
      
      const duration = Date.now() - startTime;
      logger.info(`updateWorkPackage completed successfully (${duration}ms)`, {
        id,
        lockVersion,
        updatedFields: Object.keys(workPackageData),
        newLockVersion: response.data.lockVersion
      });
      
      return WorkPackageSchema.parse(response.data);
    } catch (error: any) {
      const duration = Date.now() - startTime;
      logger.error(`updateWorkPackage failed (${duration}ms)`, {
        id,
        error: error.message,
        status: error.response?.status,
        responseData: error.response?.data,
        workPackageData
      });
      throw error;
    }
  }

  async deleteWorkPackage(id: number): Promise<void> {
    await this.axiosInstance.delete(`/work_packages/${id}`);
  }

  // Work Package Parent-Child Relationship API
  async setWorkPackageParent(id: number, parentId: number): Promise<WorkPackage> {
    const startTime = Date.now();
    const url = `/work_packages/${id}`;
    
    try {
      // First, get the current work package to retrieve the lockVersion
      logger.debug(`Getting current work package ${id} for lockVersion`, { id });
      const currentResponse = await this.axiosInstance.get(url);
      const currentWorkPackage = currentResponse.data;
      const lockVersion = currentWorkPackage.lockVersion;
      
      logger.debug('Setting parent relationship', { 
        childId: id, 
        parentId, 
        lockVersion 
      });
      
      // Build the update payload with parent link
      const updatePayload = {
        lockVersion: lockVersion,
        _links: {
          parent: { href: `/api/v3/work_packages/${parentId}` }
        }
      };
      
      logger.logApiRequest('PATCH', url, updatePayload);
      const response = await this.axiosInstance.patch(url, updatePayload);
      
      logger.logApiResponse('PATCH', url, response.status, response.headers, response.data);
      
      const duration = Date.now() - startTime;
      logger.info(`setWorkPackageParent completed successfully (${duration}ms)`, {
        childId: id,
        parentId,
        subject: response.data.subject
      });
      
      // Add a small delay to ensure API consistency
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return WorkPackageSchema.parse(response.data);
    } catch (error: any) {
      const duration = Date.now() - startTime;
      logger.error(`setWorkPackageParent failed (${duration}ms)`, {
        error: error.message,
        status: error.response?.status,
        responseData: error.response?.data,
        childId: id,
        parentId
      });
      throw error;
    }
  }

  async removeWorkPackageParent(id: number): Promise<WorkPackage> {
    const startTime = Date.now();
    const url = `/work_packages/${id}`;
    
    try {
      // First, get the current work package to retrieve the lockVersion
      logger.debug(`Getting current work package ${id} for lockVersion`, { id });
      const currentResponse = await this.axiosInstance.get(url);
      const currentWorkPackage = currentResponse.data;
      const lockVersion = currentWorkPackage.lockVersion;
      
      logger.debug('Removing parent relationship', { 
        childId: id, 
        lockVersion 
      });
      
      // Build the update payload with null parent href (correct way to remove parent)
      const updatePayload = {
        lockVersion: lockVersion,
        _links: {
          parent: {
            href: null
          }
        }
      };
      
      logger.logApiRequest('PATCH', url, updatePayload);
      const response = await this.axiosInstance.patch(url, updatePayload);
      
      logger.logApiResponse('PATCH', url, response.status, response.headers, response.data);
      
      const duration = Date.now() - startTime;
      logger.info(`removeWorkPackageParent completed successfully (${duration}ms)`, {
        childId: id,
        subject: response.data.subject
      });
      
      // Add a small delay to ensure API consistency
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return WorkPackageSchema.parse(response.data);
    } catch (error: any) {
      const duration = Date.now() - startTime;
      logger.error(`removeWorkPackageParent failed (${duration}ms)`, {
        error: error.message,
        status: error.response?.status,
        responseData: error.response?.data,
        childId: id
      });
      throw error;
    }
  }

  async getWorkPackageChildren(id: number): Promise<CollectionResponse> {
    const startTime = Date.now();
    
    try {
      // Use filters to get children of the specified parent work package
      const filters = `[{"parent":{"operator":"=","values":["${id}"]}}]`;
      // Add cache-busting timestamp to ensure fresh data
      const params = { 
        filters,
        _t: Date.now().toString() // Cache-busting parameter
      };
      
      logger.debug('Getting work package children', { parentId: id, filters });
      
      const result = await this.getWorkPackages(params);
      
      const duration = Date.now() - startTime;
      logger.info(`getWorkPackageChildren completed successfully (${duration}ms)`, {
        parentId: id,
        childrenCount: result.total
      });
      
      return result;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      logger.error(`getWorkPackageChildren failed (${duration}ms)`, {
        error: error.message,
        parentId: id
      });
      throw error;
    }
  }

  // Users API
  async getUsers(params: QueryParams = {}): Promise<CollectionResponse> {
    const queryString = this.buildQueryString(params);
    const response = await this.axiosInstance.get(`/users${queryString}`);
    return CollectionResponseSchema.parse(response.data);
  }

  async getUser(id: number): Promise<User> {
    const response = await this.axiosInstance.get(`/users/${id}`);
    return UserSchema.parse(response.data);
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.axiosInstance.get('/users/me');
    return UserSchema.parse(response.data);
  }

  async createUser(userData: Partial<User>): Promise<User> {
    const response = await this.axiosInstance.post('/users', userData);
    return UserSchema.parse(response.data);
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const response = await this.axiosInstance.patch(`/users/${id}`, userData);
    return UserSchema.parse(response.data);
  }

  async deleteUser(id: number): Promise<void> {
    await this.axiosInstance.delete(`/users/${id}`);
  }

  // Statuses API
  async getStatuses(params: QueryParams = {}): Promise<StatusCollectionResponse> {
    const queryString = this.buildQueryString(params);
    const response = await this.axiosInstance.get(`/statuses${queryString}`);
    return StatusCollectionResponseSchema.parse(response.data);
  }

  // Time Entries API
  async getTimeEntries(params: QueryParams = {}): Promise<CollectionResponse> {
    const queryString = this.buildQueryString(params);
    const response = await this.axiosInstance.get(`/time_entries${queryString}`);
    return CollectionResponseSchema.parse(response.data);
  }

  async getTimeEntry(id: number): Promise<TimeEntry> {
    const response = await this.axiosInstance.get(`/time_entries/${id}`);
    return TimeEntrySchema.parse(response.data);
  }

  async createTimeEntry(timeEntryData: Partial<TimeEntry>): Promise<TimeEntry> {
    const response = await this.axiosInstance.post('/time_entries', timeEntryData);
    return TimeEntrySchema.parse(response.data);
  }

  async updateTimeEntry(id: number, timeEntryData: Partial<TimeEntry>): Promise<TimeEntry> {
    const response = await this.axiosInstance.patch(`/time_entries/${id}`, timeEntryData);
    return TimeEntrySchema.parse(response.data);
  }

  async deleteTimeEntry(id: number): Promise<void> {
    await this.axiosInstance.delete(`/time_entries/${id}`);
  }

  // Membership API methods
  async getMemberships(params: QueryParams = {}): Promise<MembershipCollectionResponse> {
    const startTime = Date.now();
    const queryString = this.buildQueryString(params);
    const url = `/memberships${queryString}`;
    
    try {
      logger.logApiRequest('GET', url, undefined, params);
      const response = await this.axiosInstance.get(url);
      
      logger.logApiResponse('GET', url, response.status, response.headers, response.data);
      logger.logRawData('getMemberships response', response.data);
      
      const duration = Date.now() - startTime;
      logger.info(`getMemberships completed successfully (${duration}ms)`, {
        totalMemberships: response.data?.total,
        returnedCount: response.data?._embedded?.elements?.length
      });
      
      return MembershipCollectionResponseSchema.parse(response.data);
    } catch (error: any) {
      const duration = Date.now() - startTime;
      logger.error(`getMemberships failed (${duration}ms)`, {
        error: error.message,
        status: error.response?.status,
        responseData: error.response?.data,
        params
      });
      throw error;
    }
  }

  async getMembership(id: number): Promise<Membership> {
    const startTime = Date.now();
    const url = `/memberships/${id}`;
    
    try {
      logger.logApiRequest('GET', url, undefined, { id });
      const response = await this.axiosInstance.get(url);
      
      logger.logApiResponse('GET', url, response.status, response.headers, response.data);
      logger.logRawData('getMembership response', response.data);
      
      const duration = Date.now() - startTime;
      logger.info(`getMembership completed successfully (${duration}ms)`, {
        membershipId: id,
        projectName: response.data?.project?.name,
        userName: response.data?.principal?.name
      });
      
      return MembershipSchema.parse(response.data);
    } catch (error: any) {
      const duration = Date.now() - startTime;
      logger.error(`getMembership failed (${duration}ms)`, {
        error: error.message,
        status: error.response?.status,
        responseData: error.response?.data,
        membershipId: id
      });
      throw error;
    }
  }

  async createMembership(membershipData: { projectId: number; userId: number; roleIds: number[] }): Promise<Membership> {
    const startTime = Date.now();
    const url = '/memberships';
    
    try {
      const payload = {
        _links: {
          project: { href: `/api/v3/projects/${membershipData.projectId}` },
          principal: { href: `/api/v3/users/${membershipData.userId}` },
          roles: membershipData.roleIds.map(roleId => ({ href: `/api/v3/roles/${roleId}` }))
        }
      };
      
      logger.logApiRequest('POST', url, payload, membershipData);
      const response = await this.axiosInstance.post(url, payload);
      
      logger.logApiResponse('POST', url, response.status, response.headers, response.data);
      
      const duration = Date.now() - startTime;
      logger.info(`createMembership completed successfully (${duration}ms)`, {
        newMembershipId: response.data.id,
        projectId: membershipData.projectId,
        userId: membershipData.userId,
        roleCount: membershipData.roleIds.length
      });
      
      return MembershipSchema.parse(response.data);
    } catch (error: any) {
      const duration = Date.now() - startTime;
      logger.error(`createMembership failed (${duration}ms)`, {
        error: error.message,
        status: error.response?.status,
        responseData: error.response?.data,
        membershipData
      });
      throw error;
    }
  }

  async updateMembership(id: number, roleIds: number[]): Promise<Membership> {
    const startTime = Date.now();
    const url = `/memberships/${id}`;
    
    try {
      const payload = {
        _links: {
          roles: roleIds.map(roleId => ({ href: `/api/v3/roles/${roleId}` }))
        }
      };
      
      logger.logApiRequest('PATCH', url, payload, { id, roleIds });
      const response = await this.axiosInstance.patch(url, payload);
      
      logger.logApiResponse('PATCH', url, response.status, response.headers, response.data);
      
      const duration = Date.now() - startTime;
      logger.info(`updateMembership completed successfully (${duration}ms)`, {
        membershipId: id,
        newRoleCount: roleIds.length
      });
      
      return MembershipSchema.parse(response.data);
    } catch (error: any) {
      const duration = Date.now() - startTime;
      logger.error(`updateMembership failed (${duration}ms)`, {
        error: error.message,
        status: error.response?.status,
        responseData: error.response?.data,
        membershipId: id,
        roleIds
      });
      throw error;
    }
  }

  async deleteMembership(id: number): Promise<void> {
    const startTime = Date.now();
    const url = `/memberships/${id}`;
    
    try {
      logger.logApiRequest('DELETE', url, undefined, { id });
      await this.axiosInstance.delete(url);
      
      const duration = Date.now() - startTime;
      logger.info(`deleteMembership completed successfully (${duration}ms)`, {
        membershipId: id
      });
    } catch (error: any) {
      const duration = Date.now() - startTime;
      logger.error(`deleteMembership failed (${duration}ms)`, {
        error: error.message,
        status: error.response?.status,
        responseData: error.response?.data,
        membershipId: id
      });
      throw error;
    }
  }

  // Role API methods
  async getRoles(params: QueryParams = {}): Promise<RoleCollectionResponse> {
    const startTime = Date.now();
    const queryString = this.buildQueryString(params);
    const url = `/roles${queryString}`;
    
    try {
      logger.logApiRequest('GET', url, undefined, params);
      const response = await this.axiosInstance.get(url);
      
      logger.logApiResponse('GET', url, response.status, response.headers, response.data);
      logger.logRawData('getRoles response', response.data);
      
      const duration = Date.now() - startTime;
      logger.info(`getRoles completed successfully (${duration}ms)`, {
        totalRoles: response.data?.total,
        returnedCount: response.data?._embedded?.elements?.length
      });
      
      return RoleCollectionResponseSchema.parse(response.data);
    } catch (error: any) {
      const duration = Date.now() - startTime;
      logger.error(`getRoles failed (${duration}ms)`, {
        error: error.message,
        status: error.response?.status,
        responseData: error.response?.data,
        params
      });
      throw error;
    }
  }

  async getRole(id: number): Promise<Role> {
    const startTime = Date.now();
    const url = `/roles/${id}`;
    
    try {
      logger.logApiRequest('GET', url, undefined, { id });
      const response = await this.axiosInstance.get(url);
      
      logger.logApiResponse('GET', url, response.status, response.headers, response.data);
      logger.logRawData('getRole response', response.data);
      
      const duration = Date.now() - startTime;
      logger.info(`getRole completed successfully (${duration}ms)`, {
        roleId: id,
        roleName: response.data?.name
      });
      
      return RoleSchema.parse(response.data);
    } catch (error: any) {
      const duration = Date.now() - startTime;
      logger.error(`getRole failed (${duration}ms)`, {
        error: error.message,
        status: error.response?.status,
        responseData: error.response?.data,
        roleId: id
      });
      throw error;
    }
  }

  // Utility methods
  async testConnection(): Promise<boolean> {
    try {
      logger.info('Testing connection to OpenProject API...');
      logger.logApiRequest('GET', '/configuration');
      
      const response = await this.axiosInstance.get('/configuration');
      
      logger.logApiResponse('GET', '/configuration', response.status, response.headers, response.data);
      logger.info('✅ Connection successful');
      return true;
    } catch (error: any) {
      logger.error('❌ Connection failed', {
        error: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        responseData: error.response?.data,
        requestConfig: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      });
      
      if (error.response) {
        logger.logApiResponse('GET', '/configuration', error.response.status, error.response.headers, error.response.data);
      }
      
      return false;
    }
  }

  async getApiInfo(): Promise<any> {
    const response = await this.axiosInstance.get('/');
    return response.data;
  }

  // Search functionality
  async searchWorkPackages(query: string, params: QueryParams = {}): Promise<CollectionResponse> {
    const searchParams = {
      ...params,
      filters: `[{"subject":{"operator":"~","values":["${query}"]}}]`,
    };
    return this.getWorkPackages(searchParams);
  }

  async searchProjects(query: string, params: QueryParams = {}): Promise<CollectionResponse> {
    const searchParams = {
      ...params,
      filters: `[{"name":{"operator":"~","values":["${query}"]}}]`,
    };
    return this.getProjects(searchParams);
  }

  async searchUsers(query: string, params: QueryParams = {}): Promise<CollectionResponse> {
    const searchParams = {
      ...params,
      filters: `[{"name":{"operator":"~","values":["${query}"]}}]`,
    };
    return this.getUsers(searchParams);
  }

  // Grid/Board API methods for Kanban functionality
  async getGrids(params: QueryParams = {}): Promise<CollectionResponse> {
    const queryString = this.buildQueryString(params);
    const response = await this.axiosInstance.get(`/grids${queryString}`);
    return CollectionResponseSchema.parse(response.data);
  }

  async getGrid(id: number): Promise<Grid> {
    const response = await this.axiosInstance.get(`/grids/${id}`);
    return GridSchema.parse(response.data);
  }

  async createGrid(gridData: Partial<Grid>): Promise<Grid> {
    const response = await this.axiosInstance.post('/grids', gridData);
    return GridSchema.parse(response.data);
  }

  async updateGrid(id: number, gridData: Partial<Grid>): Promise<Grid> {
    const response = await this.axiosInstance.patch(`/grids/${id}`, gridData);
    return GridSchema.parse(response.data);
  }

  async deleteGrid(id: number): Promise<void> {
    await this.axiosInstance.delete(`/grids/${id}`);
  }

  // Board-specific methods (boards are grids with scope filter)
  async getBoards(projectId?: number, params: QueryParams = {}): Promise<CollectionResponse> {
    const boardParams: QueryParams = {
      ...params,
    };
    if (projectId) {
      boardParams.filters = `[{"scope":{"operator":"=","values":["/projects/${projectId}"]}}]`;
    }
    return this.getGrids(boardParams);
  }

  async getBoard(id: number): Promise<Board> {
    const grid = await this.getGrid(id);
    return BoardSchema.parse(grid);
  }

  async createBoard(projectId: number, boardData: Partial<Board>): Promise<Board> {
    const gridData = {
      ...boardData,
      scope: `/projects/${projectId}`,
      rowCount: boardData.rowCount || 1,
      columnCount: boardData.columnCount || 3,
      _embedded: {
        widgets: boardData._embedded?.widgets || [],
      },
    };
    const response = await this.axiosInstance.post('/grids', gridData);
    return BoardSchema.parse(response.data);
  }

  async updateBoard(id: number, boardData: Partial<Board>): Promise<Board> {
    const response = await this.axiosInstance.patch(`/grids/${id}`, boardData);
    return BoardSchema.parse(response.data);
  }

  async deleteBoard(id: number): Promise<void> {
    await this.deleteGrid(id);
  }

  // Board widget management
  async addBoardWidget(boardId: number, widgetData: any): Promise<Board> {
    const board = await this.getBoard(boardId);
    const updatedWidgets = [...(board._embedded?.widgets || []), widgetData];
    return this.updateBoard(boardId, {
      _embedded: {
        widgets: updatedWidgets,
      },
    });
  }

  async removeBoardWidget(boardId: number, widgetId: number): Promise<Board> {
    const board = await this.getBoard(boardId);
    const updatedWidgets = (board._embedded?.widgets || []).filter(
      widget => widget.id !== widgetId
    );
    return this.updateBoard(boardId, {
      _embedded: {
        widgets: updatedWidgets,
      },
    });
  }

  private extractDescriptionText(description: any): string {
    if (typeof description === 'string') {
      return description;
    }
    if (typeof description === 'object' && description !== null) {
      if (typeof description.raw === 'string') {
        return description.raw;
      }
      if (typeof description.html === 'string') {
        // Strip HTML tags to return plain text
        return description.html.replace(/<[^>]*>/g, '');
      }
      if (typeof description.plain === 'string') {
        return description.plain;
      }
    }
    return '';
  }
}