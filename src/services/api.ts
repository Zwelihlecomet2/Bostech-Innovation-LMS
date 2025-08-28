const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
}

class ApiService {
  private backendAvailable: boolean = false;

  async checkBackendHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(3000) // 3 second timeout
      });
      this.backendAvailable = response.ok;
      console.log('Backend health check:', response.ok ? 'SUCCESS' : 'FAILED');
      return response.ok;
    } catch (error) {
      console.log('Backend not available:', error.message);
      this.backendAvailable = false;
      return false;
    }
  }

  isBackendAvailable(): boolean {
    return this.backendAvailable;
  }

  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const data: ApiResponse<T> = await response.json();
    
    if (!response.ok) {
      if (response.status === 401) {
        // Try to refresh token
        const refreshed = await this.refreshToken();
        if (!refreshed) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          throw new Error('Session expired');
        }
      }
      throw new Error(data.message || 'Request failed');
    }
    
    return data.data as T;
  }

  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) return false;

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });

      if (response.ok) {
        const data: ApiResponse<{ accessToken: string; refreshToken: string }> = await response.json();
        localStorage.setItem('accessToken', data.data!.accessToken);
        localStorage.setItem('refreshToken', data.data!.refreshToken);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  // Auth endpoints
  async login(username: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    return this.handleResponse<{ user: any; accessToken: string; refreshToken: string }>(response);
  }

  async logout() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken })
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  async getProfile() {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<{ user: any }>(response);
  }

  // User endpoints
  async getUsers() {
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<{ users: any[] }>(response);
  }

  async createUser(userData: any) {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    return this.handleResponse<{ user: any }>(response);
  }

  async updateUser(userId: string, userData: any) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    return this.handleResponse<{ user: any }>(response);
  }

  async deleteUser(userId: string) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async toggleUserStatus(userId: string) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/toggle-status`, {
      method: 'PUT',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<{ user: any }>(response);
  }

  // Test endpoints
  async getTests() {
    const response = await fetch(`${API_BASE_URL}/tests`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<{ tests: any[] }>(response);
  }

  async getTest(testId: string, includeAnswers = false) {
    const url = `${API_BASE_URL}/tests/${testId}${includeAnswers ? '?includeAnswers=true' : ''}`;
    const response = await fetch(url, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<{ test: any }>(response);
  }

  async createTest(testData: any) {
    const response = await fetch(`${API_BASE_URL}/tests`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(testData)
    });
    return this.handleResponse<{ test: any }>(response);
  }

  async updateTest(testId: string, testData: any) {
    const response = await fetch(`${API_BASE_URL}/tests/${testId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(testData)
    });
    return this.handleResponse<{ test: any }>(response);
  }

  async deleteTest(testId: string) {
    const response = await fetch(`${API_BASE_URL}/tests/${testId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  // Test attempt endpoints
  async submitTestAttempt(attemptData: any) {
    const response = await fetch(`${API_BASE_URL}/attempts`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(attemptData)
    });
    return this.handleResponse<{ attempt: any }>(response);
  }

  async getUserAttempts(testId?: string) {
    const url = `${API_BASE_URL}/attempts/my-attempts${testId ? `?testId=${testId}` : ''}`;
    const response = await fetch(url, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<{ attempts: any[] }>(response);
  }

  async getAllAttempts() {
    const response = await fetch(`${API_BASE_URL}/attempts`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<{ attempts: any[] }>(response);
  }

  async getAttemptStats(testId?: string) {
    const url = `${API_BASE_URL}/attempts/stats${testId ? `?testId=${testId}` : ''}`;
    const response = await fetch(url, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }
}

export const apiService = new ApiService();