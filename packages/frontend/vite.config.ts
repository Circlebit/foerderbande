import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable Emotion's css prop and styled support
      jsxImportSource: "@emotion/react",
      // Use SWC plugin for Emotion
      plugins: [["@swc/plugin-emotion", {}]],
    }),
  ],
  // Load environment variables from root directory
  envDir: "../../",
});
