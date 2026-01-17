import { create } from "zustand";
import { FilterConfig, FilterState } from "../types";

interface FilterStore {
  filters: FilterConfig[];
  state: FilterState;
  addFilter: (config: FilterConfig) => void;
  removeFilter: (type: string) => void;
  updateFilter: (type: string, config: Partial<FilterConfig>) => void;
  setState: (state: FilterState) => void;
  clearFilters: () => void;
  reset: () => void;
}

export const useFilterStore = create<FilterStore>((set) => ({
  filters: [],
  state: FilterState.Idle,
  addFilter: (config) =>
    set((state) => ({
      filters: [...state.filters.filter((f) => f.type !== config.type), config],
    })),
  removeFilter: (type) =>
    set((state) => ({
      filters: state.filters.filter((f) => f.type !== type),
    })),
  updateFilter: (type, partialConfig) =>
    set((state) => ({
      filters: state.filters.map((f) =>
        f.type === type ? { ...f, ...partialConfig } : f
      ),
    })),
  setState: (state) => set({ state }),
  clearFilters: () => set({ filters: [] }),
  reset: () =>
    set({
      filters: [],
      state: FilterState.Idle,
    }),
}));
