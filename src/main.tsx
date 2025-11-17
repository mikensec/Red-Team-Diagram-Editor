import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";
import { NeonModeProvider } from "./hooks/useNeonMode";
import { BackgroundProvider } from "./hooks/useBackground";
import { FontProvider } from "./hooks/useFont";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
    <FontProvider>
      <NeonModeProvider>
        <BackgroundProvider>
          <App />
        </BackgroundProvider>
      </NeonModeProvider>
    </FontProvider>
  </ThemeProvider>
);
