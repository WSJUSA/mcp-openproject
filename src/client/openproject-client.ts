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
    const queryString = this.buildQueryString(params);
    const response = await this.axiosInstance.get(`/projects${queryString}`);
    return CollectionResponseSchema.parse(response.data);
  }

  async getProject(id: number): Promise<Project> {
    const response = await this.axiosInstance.get(`/projects/${id}`);
    return ProjectSchema.parse(response.data);
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
    const queryString = this.buildQueryString(params);
    const response = await this.axiosInstance.get(`/work_packages${queryString}`);
    return CollectionResponseSchema.parse(response.data);
  }

  async getWorkPackage(id: number): Promise<WorkPackage> {
    const response = await this.axiosInstance.get(`/work_packages/${id}`);
    return WorkPackageSchema.parse(response.data);
  }

  async createWorkPackage(workPackageData: Partial<WorkPackage>): Promise<WorkPackage> {
    const response = await this.axiosInstance.post('/work_packages', workPackageData);
    return WorkPackageSchema.parse(response.data);
  }

  async updateWorkPackage(id: number, workPackageData: Partial<WorkPackage>): Promise<WorkPackage> {
    const response = await this.axiosInstance.patch(`/work_packages/${id}`, workPackageData);
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
      await this.axiosInstance.get('/configuration');
      return true;
    } catch (error: any) {
      console.error('OpenProject API connection test failed:');
      if (error.response) {
        console.error(`HTTP ${error.response.status}: ${error.response.statusText}`);
        console.error('Response data:', error.response.data);
      } else if (error.request) {
        console.error('No response received:', error.message);
      } else {
        console.error('Request setup error:', error.message);
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