import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

const DARK_COLORS = {
  isDark: true,
  headerBg: "#120810",
  shade950: "#120810",
  shade900: "#1a0e18",
  shade800: "#241520",
  shade700: "#301d2b",
  textPrimary: "#F5EDD6",
  textMuted: "#D4C4A8",
  textSubtle: "#9A8A7A",
  gold: "#C9A84C",
  goldBright: "#D4B86A",
  goldBorder: "rgba(201,168,76,0.2)",
  burgundyGlow: "rgba(139,32,48,0.4)",
};

const LIGHT_COLORS = {
  isDark: false,
  headerBg: "#5C1A20",
  shade950: "#3A1218",
  shade900: "#FAF5EC",
  shade800: "#F3EDE3",
  shade700: "#FFFFFF",
  textPrimary: "#2E1218",
  textMuted: "#6B3D3D",
  textSubtle: "#9A7070",
  gold: "#B8922A",
  goldBright: "#C9A84C",
  goldBorder: "rgba(184,146,42,0.28)",
  burgundyGlow: "rgba(114,47,55,0.12)",
};

export type ThemeColors = typeof DARK_COLORS;

const ThemeContext = createContext<{
  colors: ThemeColors;
  toggleTheme: () => void;
}>({ colors: DARK_COLORS, toggleTheme: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("wtw-theme");
    return saved !== "light";
  });

  useEffect(() => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
    localStorage.setItem("wtw-theme", isDark ? "dark" : "light");
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ colors: isDark ? DARK_COLORS : LIGHT_COLORS, toggleTheme: () => setIsDark(d => !d) }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
