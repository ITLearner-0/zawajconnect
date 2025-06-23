
export interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum cache size
  persistent: boolean; // Use IndexedDB for persistence
  compression: boolean; // Compress large objects
}

export interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
  size: number;
  compressed: boolean;
}

export interface CacheStats {
  hitRate: number;
  missRate: number;
  totalRequests: number;
  totalHits: number;
  totalMisses: number;
  cacheSize: number;
  memoryUsage: number;
}

class AdvancedCacheService {
  private memoryCache = new Map<string, CacheItem<any>>();
  private cacheStats: CacheStats = {
    hitRate: 0,
    missRate: 0,
    totalRequests: 0,
    totalHits: 0,
    totalMisses: 0,
    cacheSize: 0,
    memoryUsage: 0
  };
  
  private dbName = 'nikah-connect-cache';
  private dbVersion = 1;
  private db?: IDBDatabase;

  constructor() {
    this.initIndexedDB();
    this.startCleanupInterval();
  }

  // Initialiser IndexedDB
  private async initIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('cache')) {
          const store = db.createObjectStore('cache', { keyPath: 'key' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('ttl', 'ttl', { unique: false });
        }
      };
    });
  }

  // Compression des données
  private compress(data: any): string {
    return JSON.stringify(data);
  }

  private decompress(compressedData: string): any {
    return JSON.parse(compressedData);
  }

  // Calculer la taille d'un objet
  private calculateSize(data: any): number {
    return new Blob([JSON.stringify(data)]).size;
  }

  // Récupérer depuis le cache
  async get<T>(key: string): Promise<T | null> {
    this.cacheStats.totalRequests++;
    
    // Vérifier d'abord le cache mémoire
    const memoryItem = this.memoryCache.get(key);
    if (memoryItem && this.isValid(memoryItem)) {
      this.cacheStats.totalHits++;
      this.updateHitRate();
      return memoryItem.compressed 
        ? this.decompress(memoryItem.data)
        : memoryItem.data;
    }

    // Vérifier IndexedDB
    if (this.db) {
      try {
        const persistentItem = await this.getFromIndexedDB<T>(key);
        if (persistentItem && this.isValid(persistentItem)) {
          // Remettre en cache mémoire
          this.memoryCache.set(key, persistentItem);
          this.cacheStats.totalHits++;
          this.updateHitRate();
          return persistentItem.compressed
            ? this.decompress(persistentItem.data)
            : persistentItem.data;
        }
      } catch (error) {
        console.warn('IndexedDB cache read error:', error);
      }
    }

    this.cacheStats.totalMisses++;
    this.updateHitRate();
    return null;
  }

  // Sauvegarder dans le cache
  async set<T>(
    key: string, 
    data: T, 
    config: Partial<CacheConfig> = {}
  ): Promise<void> {
    const defaultConfig: CacheConfig = {
      ttl: 30 * 60 * 1000, // 30 minutes
      maxSize: 100,
      persistent: true,
      compression: false
    };

    const finalConfig = { ...defaultConfig, ...config };
    const size = this.calculateSize(data);
    
    // Compression si activée et si la taille le justifie
    let processedData = data;
    let compressed = false;
    
    if (finalConfig.compression && size > 1024) { // Compresser si > 1KB
      processedData = this.compress(data) as T;
      compressed = true;
    }

    const cacheItem: CacheItem<T> = {
      data: processedData,
      timestamp: Date.now(),
      ttl: finalConfig.ttl,
      size,
      compressed
    };

    // Sauvegarder en mémoire
    this.memoryCache.set(key, cacheItem);
    
    // Nettoyer le cache mémoire si nécessaire
    this.evictIfNeeded(finalConfig.maxSize);

    // Sauvegarder dans IndexedDB si persistant
    if (finalConfig.persistent && this.db) {
      try {
        await this.saveToIndexedDB(key, cacheItem);
      } catch (error) {
        console.warn('IndexedDB cache write error:', error);
      }
    }

    this.updateCacheStats();
  }

  // Supprimer du cache
  async delete(key: string): Promise<void> {
    this.memoryCache.delete(key);
    
    if (this.db) {
      try {
        await this.deleteFromIndexedDB(key);
      } catch (error) {
        console.warn('IndexedDB cache delete error:', error);
      }
    }
    
    this.updateCacheStats();
  }

  // Vider le cache
  async clear(): Promise<void> {
    this.memoryCache.clear();
    
    if (this.db) {
      try {
        await this.clearIndexedDB();
      } catch (error) {
        console.warn('IndexedDB cache clear error:', error);
      }
    }
    
    this.resetStats();
  }

  // Vérifier si un élément est valide
  private isValid(item: CacheItem<any>): boolean {
    return Date.now() - item.timestamp < item.ttl;
  }

  // Éviction LRU
  private evictIfNeeded(maxSize: number): void {
    if (this.memoryCache.size <= maxSize) return;

    const entries = Array.from(this.memoryCache.entries())
      .sort(([, a], [, b]) => a.timestamp - b.timestamp);

    const toRemove = entries.slice(0, this.memoryCache.size - maxSize);
    toRemove.forEach(([key]) => this.memoryCache.delete(key));
  }

  // Operations IndexedDB
  private async getFromIndexedDB<T>(key: string): Promise<CacheItem<T> | null> {
    return new Promise((resolve, reject) => {
      if (!this.db) return resolve(null);
      
      const transaction = this.db.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      const request = store.get(key);
      
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.item : null);
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  private async saveToIndexedDB<T>(key: string, item: CacheItem<T>): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return resolve();
      
      const transaction = this.db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const request = store.put({ key, item, timestamp: item.timestamp, ttl: item.ttl });
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async deleteFromIndexedDB(key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return resolve();
      
      const transaction = this.db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const request = store.delete(key);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async clearIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return resolve();
      
      const transaction = this.db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const request = store.clear();
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Nettoyage automatique
  private startCleanupInterval(): void {
    setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000); // Nettoyage toutes les 5 minutes
  }

  private async cleanup(): Promise<void> {
    const now = Date.now();
    const expiredKeys: string[] = [];
    
    // Nettoyer le cache mémoire
    this.memoryCache.forEach((item, key) => {
      if (!this.isValid(item)) {
        expiredKeys.push(key);
      }
    });
    
    expiredKeys.forEach(key => this.memoryCache.delete(key));
    
    // Nettoyer IndexedDB
    if (this.db) {
      try {
        await this.cleanupIndexedDB();
      } catch (error) {
        console.warn('IndexedDB cleanup error:', error);
      }
    }
    
    this.updateCacheStats();
  }

  private async cleanupIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return resolve();
      
      const transaction = this.db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const index = store.index('timestamp');
      const now = Date.now();
      
      index.openCursor().onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const record = cursor.value;
          if (now - record.timestamp > record.ttl) {
            store.delete(cursor.primaryKey);
          }
          cursor.continue();
        } else {
          resolve();
        }
      };
      
      transaction.onerror = () => reject(transaction.error);
    });
  }

  // Mise à jour des statistiques
  private updateHitRate(): void {
    if (this.cacheStats.totalRequests > 0) {
      this.cacheStats.hitRate = this.cacheStats.totalHits / this.cacheStats.totalRequests;
      this.cacheStats.missRate = this.cacheStats.totalMisses / this.cacheStats.totalRequests;
    }
  }

  private updateCacheStats(): void {
    this.cacheStats.cacheSize = this.memoryCache.size;
    
    let memoryUsage = 0;
    this.memoryCache.forEach(item => {
      memoryUsage += item.size;
    });
    this.cacheStats.memoryUsage = memoryUsage;
  }

  private resetStats(): void {
    this.cacheStats = {
      hitRate: 0,
      missRate: 0,
      totalRequests: 0,
      totalHits: 0,
      totalMisses: 0,
      cacheSize: 0,
      memoryUsage: 0
    };
  }

  // API publique pour les statistiques
  getStats(): CacheStats {
    return { ...this.cacheStats };
  }

  // Préchargement intelligent
  async preload(keys: Array<{ key: string; fetcher: () => Promise<any>; config?: Partial<CacheConfig> }>): Promise<void> {
    const promises = keys.map(async ({ key, fetcher, config }) => {
      const cached = await this.get(key);
      if (!cached) {
        try {
          const data = await fetcher();
          await this.set(key, data, config);
        } catch (error) {
          console.warn(`Preload failed for key ${key}:`, error);
        }
      }
    });
    
    await Promise.allSettled(promises);
  }
}

export const advancedCacheService = new AdvancedCacheService();
