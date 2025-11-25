// ============================================
// Authentication Service
// ============================================

import { STORAGE_KEYS } from '@/constants/config';
import { ApiResponse, User } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { apiService } from './api';

WebBrowser.maybeCompleteAuthSession();

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  accessExpireAt: number;
  refreshExpireAt: number;
}

export class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;

  private constructor() { }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Google OAuth Configuration
  // Cần cấu hình trong app.json và Google Cloud Console
  getGoogleAuthConfig() {
    return {
      // Thay đổi clientId này bằng Client ID từ Google Cloud Console
      clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '',
      scopes: ['profile', 'email'],
    };
  }

  async login(username: string, password: string): Promise<ApiResponse<LoginResponse>> {
    try {
      const platform = Platform.OS === 'ios' ? 'iOS' : Platform.OS === 'android' ? 'Android' : 'Web';

      const res = await apiService.post<LoginResponse>('/auth/login', {
        platform,
        username,
        password,
      });

      if (res.success && res.data) {
        // Lưu tokens
        await this.setAuthToken(res.data.accessToken);
        await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, res.data.refreshToken);
        await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_EXPIRE_AT, res.data.accessExpireAt.toString());
        await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_EXPIRE_AT, res.data.refreshExpireAt.toString());
        
        // Lấy thông tin user sau khi login
        await this.fetchUserInfo();
      }

      return res;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Login failed',
      };
    }
  }

  async fetchUserInfo(): Promise<ApiResponse<User>> {
    try {
      const res = await apiService.get<User>('/user/me');
      if (res.success && res.data) {
        await this.setUser(res.data);
      }
      return res;
    } catch (error: any) {
      console.error('Error fetching user info:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch user info',
      };
    }
  }

  async signInWithGoogle(): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      // TODO: Implement Google OAuth flow
      // Sử dụng expo-auth-session để xử lý OAuth
      // Sau khi có access token, gửi lên backend để verify và lấy user data

      // Placeholder - cần implement thực tế
      return {
        success: false,
        error: 'Google OAuth not implemented yet',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Sign in failed',
      };
    }
  }

  async signOut(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      await AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
      await AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_EXPIRE_AT);
      await AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_EXPIRE_AT);
      this.currentUser = null;
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  async getCurrentUser(): Promise<User | null> {
    if (this.currentUser) {
      return this.currentUser;
    }

    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      if (userData) {
        this.currentUser = JSON.parse(userData);
        return this.currentUser;
      }
    } catch (error) {
      console.error('Error getting current user:', error);
    }

    return null;
  }

  async setAuthToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    } catch (error) {
      console.error('Error setting auth token:', error);
    }
  }

  async setUser(user: User): Promise<void> {
    try {
      this.currentUser = user;
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    } catch (error) {
      console.error('Error setting user:', error);
    }
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    return !!token;
  }
}

export const authService = AuthService.getInstance();

