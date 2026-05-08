import { create } from 'zustand';
import { storageService, type HistoryItem, type UserPreferences, type FavoriteItem } from '@/data/services/storageService';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  createdAt: Date;
}

interface AppState {
  recentHistory: HistoryItem[];
  favorites: FavoriteItem[];
  preferences: UserPreferences;
  isLoading: boolean;
  loadingMessage: string;
  notifications: Notification[];
  currentSubjectId: string | null;
  currentGradeId: string | null;

  setLoading: (loading: boolean, message?: string) => void;
  addToHistory: (item: Omit<HistoryItem, 'id' | 'createdAt'>) => void;
  removeFromHistory: (id: string) => void;
  clearHistory: () => void;

  addFavorite: (item: Omit<FavoriteItem, 'id' | 'createdAt'>) => void;
  removeFavorite: (id: string) => void;
  toggleFavorite: (item: Omit<FavoriteItem, 'id' | 'createdAt'>) => boolean;
  isFavorite: (id: string) => boolean;

  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  resetPreferences: () => void;

  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;

  setCurrentSubject: (subjectId: string | null) => void;
  setCurrentGrade: (gradeId: string | null) => void;

  initializeFromStorage: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  recentHistory: [],
  favorites: [],
  preferences: {
    theme: 'system',
    language: 'zh-CN',
    fontSize: 'medium',
    autoSave: true,
    showTips: true
  },
  isLoading: false,
  loadingMessage: '',
  notifications: [],
  currentSubjectId: null,
  currentGradeId: null,

  setLoading: (loading, message = '') => {
    set({ isLoading: loading, loadingMessage: message });
  },

  addToHistory: (item) => {
    const updatedHistory = storageService.saveToHistory(item);
    set({ recentHistory: updatedHistory });
  },

  removeFromHistory: (id) => {
    const updatedHistory = storageService.deleteHistoryItem(id);
    set({ recentHistory: updatedHistory });
  },

  clearHistory: () => {
    storageService.clearHistory();
    set({ recentHistory: [] });
  },

  addFavorite: (item) => {
    const updatedFavorites = storageService.addFavorite(item);
    set({ favorites: updatedFavorites });
    get().addNotification({
      type: 'success',
      title: '收藏成功',
      message: `"${item.title}" 已添加到收藏夹`
    });
  },

  removeFavorite: (id) => {
    const updatedFavorites = storageService.removeFavorite(id);
    set({ favorites: updatedFavorites });
    get().addNotification({
      type: 'info',
      title: '已取消收藏',
      message: '该内容已从收藏夹中移除'
    });
  },

  toggleFavorite: (item) => {
    const { favorites } = get();
    const existingIndex = favorites.findIndex(fav => fav.title === item.title && fav.type === item.type);

    if (existingIndex >= 0) {
      const existing = favorites[existingIndex];
      get().removeFavorite(existing.id);
      return false;
    } else {
      get().addFavorite(item);
      return true;
    }
  },

  isFavorite: (id) => {
    return storageService.isFavorite(id);
  },

  updatePreferences: (newPreferences) => {
    const updated = storageService.savePreferences(newPreferences);
    set({ preferences: updated });
    get().addNotification({
      type: 'success',
      title: '设置已更新',
      duration: 2000
    });
  },

  resetPreferences: () => {
    const defaults: UserPreferences = {
      theme: 'system',
      language: 'zh-CN',
      fontSize: 'medium',
      autoSave: true,
      showTips: true
    };
    const updated = storageService.savePreferences(defaults);
    set({ preferences: updated });
  },

  addNotification: (notification) => {
    const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newNotification: Notification = {
      ...notification,
      id,
      createdAt: new Date()
    };
    set(state => ({ notifications: [...state.notifications, newNotification] }));

    const duration = notification.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => {
        get().removeNotification(id);
      }, duration);
    }
  },

  removeNotification: (id) => {
    set(state => ({
      notifications: state.notifications.filter(n => n.id !== id)
    }));
  },

  clearNotifications: () => {
    set({ notifications: [] });
  },

  setCurrentSubject: (subjectId) => {
    set({ currentSubjectId: subjectId });
    if (subjectId && get().preferences.autoSave) {
      get().updatePreferences({ defaultSubject: subjectId });
    }
  },

  setCurrentGrade: (gradeId) => {
    set({ currentGradeId: gradeId });
    if (gradeId && get().preferences.autoSave) {
      get().updatePreferences({ defaultGrade: gradeId });
    }
  },

  initializeFromStorage: () => {
    const history = storageService.getHistory();
    const favorites = storageService.getFavorites();
    const preferences = storageService.getPreferences();

    set({
      recentHistory: history,
      favorites,
      preferences,
      currentSubjectId: preferences.defaultSubject || null,
      currentGradeId: preferences.defaultGrade || null
    });
  }
}));
