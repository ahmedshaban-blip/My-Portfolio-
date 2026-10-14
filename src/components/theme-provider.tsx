import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      {...props}
      // PERFORMANCE: the .dark class swap invalidates every CSS variable at once.
      // Suppressing transitions during the swap keeps it a single repaint instead of
      // a 300–500ms repaint loop across the whole tree.
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
