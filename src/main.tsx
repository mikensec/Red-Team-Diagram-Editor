import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";
import { NeonModeProvider } from "./hooks/useNeonMode";
import { BackgroundProvider } from "./hooks/useBackground";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
    <NeonModeProvider>
      <BackgroundProvider>
        <App />
      </BackgroundProvider>
    </NeonModeProvider>
  </ThemeProvider>
);
