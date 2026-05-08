export interface HistoryItem {
  id: string;
  type: 'lesson' | 'exercise' | 'script' | 'analysis';
  title: string;
  subjectId: string;
  gradeId: string;
  content: string;
  createdAt: string;
}

export interface UserPreferences {
  defaultSubject?: string;
  defaultGrade?: string;
  theme: 'light' | 'dark' | 'system';
  language: 'zh-CN' | 'en-US';
  fontSize: 'small' | 'medium' | 'large';
  autoSave: boolean;
  showTips: boolean;
}

export interface FavoriteItem {
  id: string;
  type: 'lesson' | 'exercise' | 'script' | 'analysis';
  title: string;
  subjectId: string;
  gradeId: string;
  content: string;
  createdAt: string;
  note?: string;
}

const STORAGE_KEYS = {
  HISTORY: 'rural_teacher_history',
  PREFERENCES: 'rural_teacher_preferences',
  FAVORITES: 'rural_teacher_favorites'
} as const;

function getItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error);
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage key "${key}":`, error);
  }
}

export const storageService = {
  getHistory(): HistoryItem[] {
    return getItem<HistoryItem[]>(STORAGE_KEYS.HISTORY, []);
  },

  saveToHistory(item: Omit<HistoryItem, 'id' | 'createdAt'>): HistoryItem[] {
    const history = this.getHistory();
    const newItem: HistoryItem = {
      ...item,
      id: `hist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    };
    const updatedHistory = [newItem, ...history].slice(0, 50);
    setItem(STORAGE_KEYS.HISTORY, updatedHistory);
    return updatedHistory;
  },

  clearHistory(): void {
    setItem(STORAGE_KEYS.HISTORY, []);
  },

  deleteHistoryItem(id: string): HistoryItem[] {
    const history = this.getHistory();
    const updatedHistory = history.filter(item => item.id !== id);
    setItem(STORAGE_KEYS.HISTORY, updatedHistory);
    return updatedHistory;
  },

  getPreferences(): UserPreferences {
    const defaults: UserPreferences = {
      theme: 'system',
      language: 'zh-CN',
      fontSize: 'medium',
      autoSave: true,
      showTips: true
    };
    return getItem<UserPreferences>(STORAGE_KEYS.PREFERENCES, defaults);
  },

  savePreferences(preferences: Partial<UserPreferences>): UserPreferences {
    const current = this.getPreferences();
    const updated = { ...current, ...preferences };
    setItem(STORAGE_KEYS.PREFERENCES, updated);
    return updated;
  },

  getFavorites(): FavoriteItem[] {
    return getItem<FavoriteItem[]>(STORAGE_KEYS.FAVORITES, []);
  },

  addFavorite(item: Omit<FavoriteItem, 'id' | 'createdAt'>): FavoriteItem[] {
    const favorites = this.getFavorites();
    const newItem: FavoriteItem = {
      ...item,
      id: `fav_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    };
    const updatedFavorites = [newItem, ...favorites];
    setItem(STORAGE_KEYS.FAVORITES, updatedFavorites);
    return updatedFavorites;
  },

  removeFavorite(id: string): FavoriteItem[] {
    const favorites = this.getFavorites();
    const updatedFavorites = favorites.filter(item => item.id !== id);
    setItem(STORAGE_KEYS.FAVORITES, updatedFavorites);
    return updatedFavorites;
  },

  isFavorite(id: string): boolean {
    const favorites = this.getFavorites();
    return favorites.some(item => item.id === id);
  },

  clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
};
