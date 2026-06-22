import { create } from 'zustand';
import { DataSet } from '@/types';
import { Locale, LocaleMessages, getLocale } from './i18n';

interface AppStore {
  datasets: DataSet[];
  currentDatasetId: string | null;
  currentStringSetIndex: number;
  selectedStatementId: string | null;
  searchQuery: string;
  activeTab: 'graph' | 'tree' | 'detail';
  locale: Locale;
  selectedCategory: string | null;
  datasetVersion: number;
  sidebarOpen: boolean;

  addDataset: (dataset: DataSet) => void;
  addStringSetToCurrentDataset: (stringSet: DataSet['stringSets'][0]) => void;
  setCurrentDataset: (id: string) => void;
  setCurrentStringSetIndex: (index: number) => void;
  selectStatement: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setActiveTab: (tab: 'graph' | 'tree' | 'detail') => void;
  setLocale: (locale: Locale) => void;
  setSelectedCategory: (category: string | null) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  getCurrentDataset: () => DataSet | null;
  getCurrentStringSet: () => Record<string, string> | null;
  getLocaleMessages: () => LocaleMessages;
}

export const useStore = create<AppStore>((set, get) => ({
  datasets: [],
  currentDatasetId: null,
  currentStringSetIndex: 0,
  selectedStatementId: null,
  searchQuery: '',
  activeTab: 'graph',
  locale: 'zh',
  selectedCategory: null,
  datasetVersion: 0,
  sidebarOpen: false,

  addDataset: (dataset) => set((state) => {
    const existingIndex = state.datasets.findIndex(d => d.id === dataset.id);
    if (existingIndex >= 0) {
      const updated = [...state.datasets];
      updated[existingIndex] = dataset;
      return { datasets: updated, datasetVersion: state.datasetVersion + 1 };
    }
    return { datasets: [...state.datasets, dataset], datasetVersion: state.datasetVersion + 1 };
  }),

  addStringSetToCurrentDataset: (stringSet) => set((state) => {
    const dataset = state.datasets.find(d => d.id === state.currentDatasetId);
    if (!dataset) return state;

    const updatedDataset = {
      ...dataset,
      stringSets: [...dataset.stringSets, stringSet]
    };

    return {
      datasets: state.datasets.map(d =>
        d.id === state.currentDatasetId ? updatedDataset : d
      ),
      datasetVersion: state.datasetVersion + 1
    };
  }),

  setCurrentDataset: (id) => set({ 
    currentDatasetId: id, 
    currentStringSetIndex: 0, 
    selectedCategory: null,
    selectedStatementId: null,
    searchQuery: '',
  }),

  setCurrentStringSetIndex: (index) => set({ currentStringSetIndex: index }),

  selectStatement: (id) => set({ selectedStatementId: id }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setActiveTab: (tab) => set({ activeTab: tab }),

  setLocale: (locale) => set({ locale }),

  setSelectedCategory: (category) => set({ selectedCategory: category }),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  getCurrentDataset: () => {
    const state = get();
    return state.datasets.find(d => d.id === state.currentDatasetId) || null;
  },

  getCurrentStringSet: () => {
    const dataset = get().getCurrentDataset();
    if (!dataset || dataset.stringSets.length === 0) return null;
    return dataset.stringSets[get().currentStringSetIndex]?.entries || null;
  },

  getLocaleMessages: () => {
    return getLocale(get().locale);
  }
}));
