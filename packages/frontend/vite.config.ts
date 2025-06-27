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
  server: {
    host: "0.0.0.0", // Allow external connections (important for Docker)
    port: 3000,
    strictPort: true, // Exit if port is already in use
    watch: {
      usePolling: true, // Enable polling for file changes in Docker
    },
  },
  preview: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: true,
  },
});
