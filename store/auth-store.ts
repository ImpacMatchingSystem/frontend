import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface AuthUser {
  id: string
  email: string
  name: string
  role: "company" | "admin" | "buyer"
}

interface AuthState {
  user: AuthUser | null
  setUser: (user: AuthUser | null) => void
  clearUser: () => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
      logout: () => set({ user: null }),
    }),
    {
      name: "auth-storage",
    },
  ),
)

interface AppState {
  selectedEvent: string | null
  setSelectedEvent: (eventId: string | null) => void
}

export const useAppStore = create<AppState>((set) => ({
  selectedEvent: null,
  setSelectedEvent: (eventId) => set({ selectedEvent: eventId }),
}))
