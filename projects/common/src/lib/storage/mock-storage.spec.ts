
export function getMockStorage(initialData?: Record<string, any>): Storage & {
  getRawData(): Record<string, any>;
} {
  let data: Record<string, any> = initialData ?? {};
  return {
    get length() { return Object.keys(data).length },
    clear(): void { data = {}; },
    getItem(key: string): string | null { if (key in data) return data[key]; else return null; },
    key(index: number): string | null { return Object.keys(data)[index] ?? null; },
    removeItem(key: string): void { delete data[key]; },
    setItem(key: string, value: string): void { data[key] = value; },
    getRawData(): Record<string, any> { return data; }
  };
}
