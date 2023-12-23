import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import ViteCSSPlugin from 'vite-plugin-css';
import ViteFonts from 'vite-plugin-fonts';

export default defineConfig({
  plugins: [
    // ViteCSSPlugin(),
    ViteFonts(),    // Assuming ViteFonts is correctly configured
    solidPlugin(),  // Solid.js plugin
  ],
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
  },
});
