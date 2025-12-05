export interface IStorageAdapter {
  save(key: string, data: any): void;
  load<T>(key: string, defaultValue: T): T;
  remove(key: string): void;
  clear(): void;
  exportData(): string;
  importData(jsonData: string): boolean;
  backup(): Promise<Blob>;
  restore(file: File): Promise<boolean>;
  getStorageUsage(): { localStorage: number; indexedDB: number };
}

