import { defineConfig } from 'vite';

import react from '@vitejs/plugin-react';

export default defineConfig({
  base: "/",
  plugins: [react()],
  assetsInclude: ["**/*.glb"],
  server: {
    proxy: {
      "/api/tts": "http://127.0.0.1:8787",
    },
  },
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          three: ["three"],
          r3f: ["@react-three/fiber", "@react-three/drei"],
        },
      },
    },
  },
});
