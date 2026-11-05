import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    strictPort: true,
    // /api 요청을 백엔드로 넘긴다. 브라우저에는 같은 출처라 CORS 설정이 필요 없다.
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
});
