// Cache simple en memoria con TTL
export class MemoryCache<T> {
  private cache = new Map<string, { data: T; timestamp: number }>()
  private ttl: number

  constructor(ttlMs: number = 60000) {
    this.ttl = ttlMs
  }

  get(key: string): T | null {
    const cached = this.cache.get(key)
    if (!cached) return null

    const now = Date.now()
    if (now - cached.timestamp > this.ttl) {
      this.cache.delete(key)
      return null
    }

    return cached.data
  }

  set(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() })
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }
}

// Instancia global para categorías (1 minuto TTL)
export const categoriesCache = new MemoryCache(60000)
