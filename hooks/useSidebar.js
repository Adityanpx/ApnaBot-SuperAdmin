// hooks/useSidebar.js
// Simple sidebar open/close for mobile drawer
// Uses Zustand so Sidebar and Topbar share the same state without prop drilling

import { create } from 'zustand';

const useSidebar = create((set) => ({
  isOpen: false,
  open:  () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle:() => set((s) => ({ isOpen: !s.isOpen })),
}));

export default useSidebar;
export { useSidebar };