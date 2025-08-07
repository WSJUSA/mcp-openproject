import axios, { AxiosInstance } from 'axios';
import https from 'https';
import {
  OpenProjectConfig,
  Project,
  WorkPackage,
  User,
  TimeEntry,
  CollectionResponse,
  QueryParams,
  OpenProjectError,
  ProjectSchema,
  WorkPackageSchema,
  UserSchema,
  TimeEntrySchema,
  CollectionResponseSchema,
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
    return WorkPackageSchema.parse(response.data);
  }

  async createWorkPackage(workPackageData: Partial<WorkPackage>): Promise<WorkPackage> {
    const response = await this.axiosInstance.post('/work_packages', workPackageData);
    return WorkPackageSchema.parse(response.data);
  }

  async updateWorkPackage(id: number, workPackageData: Partial<WorkPackage>): Promise<WorkPackage> {
    // First, get the current work package to retrieve the lockVersion for optimistic locking
    logger.debug(`Getting current work package ${id} for lockVersion`, { id });
    const currentResponse = await this.axiosInstance.get(`/work_packages/${id}`);
    const currentWorkPackage = currentResponse.data;
    const lockVersion = currentWorkPackage.lockVersion;
    
    logger.debug('LockVersion retrieved for work package update', { id, lockVersion, hasLockVersion: !!lockVersion, fullData: currentWorkPackage });
    
    // Build the update payload in OpenProject API format
    const updatePayload: any = {
      lockVersion: lockVersion
    };
    
    // Handle status updates with _links format
    if (workPackageData.status?.id) {
      updatePayload._links = {
        status: {
          href: `/api/v3/statuses/${workPackageData.status.id}`
        }
      };
    }
    
    // Add other direct field updates
    if (workPackageData.subject !== undefined) {
      updatePayload.subject = workPackageData.subject;
    }
    if (workPackageData.description !== undefined) {
      updatePayload.description = workPackageData.description;
    }
    if (workPackageData.percentageDone !== undefined) {
      updatePayload.percentageDone = workPackageData.percentageDone;
    }
    if (workPackageData.startDate !== undefined) {
      updatePayload.startDate = workPackageData.startDate;
    }
    if (workPackageData.dueDate !== undefined) {
      updatePayload.dueDate = workPackageData.dueDate;
    }
    if (workPackageData.estimatedTime !== undefined) {
      updatePayload.estimatedTime = workPackageData.estimatedTime;
    }
    
    // Handle other _links relationships
    if (workPackageData.assignee?.id) {
      updatePayload._links = updatePayload._links || {};
      updatePayload._links.assignee = {
        href: `/api/v3/users/${workPackageData.assignee.id}`
      };
    }
    
    if (workPackageData.priority?.id) {
      updatePayload._links = updatePayload._links || {};
      updatePayload._links.priority = {
        href: `/api/v3/priorities/${workPackageData.priority.id}`
      };
    }
    
    logger.debug('Updating work package with proper API format', { id, updatePayload });
    
    const response = await this.axiosInstance.patch(`/work_packages/${id}`, updatePayload);
    return WorkPackageSchema.parse(response.data);
  }

  async deleteWorkPackage(id: number): Promise<void> {
    await this.axiosInstance.delete(`/work_packages/${id}`);
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
}