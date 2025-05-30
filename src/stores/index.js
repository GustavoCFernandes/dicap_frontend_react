import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStore = create(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      teacherId: null,
      teacherName: null,
      teacherUnavailableTimes: null,
      setTeacherId: (id) => set({ teacherId: id }),
      setTeacherName: (name) => set({ teacherName: name }),
      setTeacherUnavailableTimes: (unavailableTimes) =>
        set({ teacherUnavailableTimes: unavailableTimes }),
      setLoading: (loadingValue) => set({ isLoading: loadingValue }),
      setUser: (user) => set({ user }),
      logout: () => set({ user: null, teacherId: null }),
    }),
    {
      name: 'app-store',
      partialize: (state) => ({
        user: state.user,
        teacherId: state.teacherId,
        teacherName: state.teacherName,
      }),
    }
  )
);
