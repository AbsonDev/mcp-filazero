import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import config from '../config/environment';

export class FilazeroApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: 'https://api.staging.filazero.net/',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'FilazeroMcpServer-NodeJS/1.0'
      }
    });

    // Interceptor para logs (baseado no projeto .NET)
    this.client.interceptors.request.use(
      (config) => {
        if (this.shouldLog()) {
          console.error(`🔍 ${config.method?.toUpperCase()} ${config.url}`);
          console.error(`🌐 Full URL: ${config.baseURL}${config.url}`);
          console.error(`🔧 BaseURL: ${config.baseURL}`);
          if (config.data) {
            console.error(`📤 Request data:`, JSON.stringify(config.data, null, 2));
          }
        }
        return config;
      },
      (error) => {
        console.error('❌ Request error:', error);
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => {
        if (this.shouldLog()) {
          console.error(`✅ ${response.status} ${response.config.url}`);
        }
        return response;
      },
      (error) => {
        console.error('❌ Response error:', error.response?.status, error.response?.data);
        return Promise.reject(error);
      }
    );
  }

  private shouldLog(): boolean {
    return config.logLevel === 'debug';
  }

  async get<T>(endpoint: string, requestConfig?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.get<T>(endpoint, requestConfig);
      return response.data;
    } catch (error) {
      throw this.handleError(error, `GET ${endpoint}`);
    }
  }

  async post<T>(endpoint: string, data?: any, requestConfig?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.post<T>(endpoint, data, requestConfig);
      return response.data;
    } catch (error) {
      throw this.handleError(error, `POST ${endpoint}`);
    }
  }

  async put<T>(endpoint: string, data?: any, requestConfig?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.put<T>(endpoint, data, requestConfig);
      return response.data;
    } catch (error) {
      throw this.handleError(error, `PUT ${endpoint}`);
    }
  }

  private handleError(error: any, context: string): Error {
    const message = error.response?.data?.message || error.message || 'Erro desconhecido';
    const status = error.response?.status || 'N/A';
    const errorMsg = `${context} falhou [${status}]: ${message}`;
    
    if (this.shouldLog()) {
      console.error(`❌ ${errorMsg}`);
    }
    
    return new Error(errorMsg);
  }

  // Métodos utilitários
  getBaseUrl(): string {
    return this.client.defaults.baseURL || '';
  }

  getEnvironment(): string {
    return config.environment;
  }
}

// Singleton instance
export const apiService = new FilazeroApiService();