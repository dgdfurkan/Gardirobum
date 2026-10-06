import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE || '/Gardirobum/',
  test: { environment: 'node', include: ['tests/*.test.ts'] },
} as Parameters<typeof defineConfig>[0]);
