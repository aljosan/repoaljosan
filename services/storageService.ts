export const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof localStorage === 'undefined') return defaultValue;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) as T : defaultValue;
  } catch {
    return defaultValue;
  }
};

export const saveToStorage = (key: string, data: any) => {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // ignore write errors
  }
};

export const clearStorage = (key: string) => {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(key);
};
