import { create } from 'zustand';

export const useStore = create((set) => ({
  user: null,
  isLoading: false,
  teacherId: null,
  setTeacherId: (id) => set({ teacherId: id }),
  setLoading: (loadingValue) => set({ isLoading: loadingValue }),
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}));
