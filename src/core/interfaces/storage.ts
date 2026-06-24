import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

/**
 * Storage Service
 *
 * Ready-to-use storage implementations.
 * Uses AsyncStorage for general data, SecureStore for sensitive data.
 *
 * Usage:
 *   import { storage, secureStorage } from "@/core/interfaces/storage";
 *   await storage.set("user_preferences", { theme: "dark" });
 *   const prefs = await storage.get("user_preferences");
 */

// ============================================================
// KEY-VALUE STORAGE - For general app data
// ============================================================

export const storage = {
  /**
   * Get a value from storage
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  },

  /**
   * Save a value to storage
   */
  async set<T>(key: string, value: T): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },

  /**
   * Remove a value from storage
   */
  async remove(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  },

  /**
   * Clear all storage
   */
  async clear(): Promise<void> {
    await AsyncStorage.clear();
  },
};

// ============================================================
// SECURE STORAGE - For sensitive data (tokens, passwords)
// ============================================================

export const secureStorage = {
  /**
   * Get a secure value (tokens, credentials)
   */
  async get(key: string): Promise<string | null> {
    try {
      // SecureStore only works on native platforms
      if (Platform.OS === "web") {
        return localStorage.getItem(key);
      }
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },

  /**
   * Save a secure value
   */
  async set(key: string, value: string): Promise<void> {
    if (Platform.OS === "web") {
      localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },

  /**
   * Remove a secure value
   */
  async remove(key: string): Promise<void> {
    if (Platform.OS === "web") {
      localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

// ============================================================
// COLLECTION STORAGE - For arrays of items (like a simple DB)
// ============================================================

export function createCollection<T extends { id: string }>(collectionName: string) {
  const key = `collection_${collectionName}`;

  return {
    /**
     * Get all items in the collection
     */
    async getAll(): Promise<T[]> {
      return (await storage.get<T[]>(key)) || [];
    },

    /**
     * Get a single item by ID
     */
    async getById(id: string): Promise<T | null> {
      const items = await this.getAll();
      return items.find((item) => item.id === id) || null;
    },

    /**
     * Add a new item to the collection
     */
    async create(data: Omit<T, "id">): Promise<T> {
      const items = await this.getAll();
      const newItem = { ...data, id: generateId() } as T;
      items.push(newItem);
      await storage.set(key, items);
      return newItem;
    },

    /**
     * Update an existing item
     */
    async update(id: string, data: Partial<T>): Promise<T | null> {
      const items = await this.getAll();
      const index = items.findIndex((item) => item.id === id);
      if (index === -1) return null;

      items[index] = { ...items[index], ...data };
      await storage.set(key, items);
      return items[index];
    },

    /**
     * Delete an item by ID
     */
    async delete(id: string): Promise<boolean> {
      const items = await this.getAll();
      const filtered = items.filter((item) => item.id !== id);
      if (filtered.length === items.length) return false;

      await storage.set(key, filtered);
      return true;
    },

    /**
     * Clear the entire collection
     */
    async clear(): Promise<void> {
      await storage.remove(key);
    },
  };
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}
