import { create } from "zustand";

// Get saved theme or use default
const savedTheme = localStorage.getItem("chat-theme") || "coffee";
// Apply it immediately when the app loads
document.documentElement.setAttribute("data-theme", savedTheme);

export const useThemeStore = create((set) => ({
  theme: savedTheme,
  setTheme: (theme) => {
    localStorage.setItem("chat-theme", theme);
    document.documentElement.setAttribute("data-theme", theme); // <-- important!
    set({ theme });
  },
}));
