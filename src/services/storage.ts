import AsyncStorage from '@react-native-async-storage/async-storage';

export interface StoredAuthData {
  token: string;
  uid: number;
  user_group: number;
  mobile: string;
  executive_patrons_url?: string;
  executive_collection_url?: string;
}

const AUTH_STORAGE_KEY = '@onemodo_sales_auth_v1';
const RECENT_COLLECTIONS_KEY = '@onemodo_sales_collections_v1';

export const StorageService = {
  async saveAuthData(data: StoredAuthData): Promise<void> {
    try {
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save auth data to storage:', e);
    }
  },

  async getAuthData(): Promise<StoredAuthData | null> {
    try {
      const data = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.warn('Failed to read auth data from storage:', e);
      return null;
    }
  },

  async clearAuthData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear auth data from storage:', e);
    }
  },

  async saveCollections(collections: any[]): Promise<void> {
    try {
      await AsyncStorage.setItem(RECENT_COLLECTIONS_KEY, JSON.stringify(collections));
    } catch (e) {
      console.warn('Failed to save collections to storage:', e);
    }
  },

  async getCollections(): Promise<any[]> {
    try {
      const data = await AsyncStorage.getItem(RECENT_COLLECTIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
};
