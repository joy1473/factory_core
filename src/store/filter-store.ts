import { create } from "zustand";

interface FilterStore {
  sido: string;
  sigungu: string;
  search: string;
  page: number;
  setSido: (v: string) => void;
  setSigungu: (v: string) => void;
  setSearch: (v: string) => void;
  setPage: (v: number) => void;
  setFilters: (f: { sido: string; sigungu: string; search: string }) => void;
}

export const useFilterStore = create<FilterStore>((set) => ({
  sido: "",
  sigungu: "",
  search: "",
  page: 1,
  setSido: (sido) => set({ sido, sigungu: "", page: 1 }),
  setSigungu: (sigungu) => set({ sigungu, page: 1 }),
  setSearch: (search) => set({ search, page: 1 }),
  setPage: (page) => set({ page }),
  setFilters: (f) => set({ ...f, page: 1 }),
}));
