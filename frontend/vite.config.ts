import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: true,
    port: 3000,
    host: true
  },
  build: {
    chunkSizeWarningLimit: 5000,
  },
});
