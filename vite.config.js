import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import csp from 'vite-plugin-csp'

const cspPolicy = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'wasm-unsafe-eval'"],
  'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
  'font-src': ["'self'", 'https://fonts.gstatic.com', 'data:'],
  'img-src': ["'self'", 'data:', 'https:', 'blob:'],
  'connect-src': ["'self'"],
  'frame-ancestors': ["'none'"],
  'form-action': ["'self'"],
  'base-uri': ["'self'"],
  'object-src': ["'none'"],
}

export default defineConfig({
  plugins: [
    react(),
    csp({ policies: cspPolicy }),
    {
      name: 'api-middleware',
      configureServer(server) {
        server.middlewares.use('/api/send-email', async (req, res) => {
          try {
            const chunks = [];
            for await (const chunk of req) {
              chunks.push(chunk);
            }
            const body = Buffer.concat(chunks).toString();
            req.body = body ? JSON.parse(body) : {};
            
            const { handleSendEmail } = await import('./src/api/send-email.ts');
            const response = await handleSendEmail(new Request('http://localhost', {
              method: req.method,
              headers: req.headers,
              body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
            }));
            
            const data = await response.json();
            res.statusCode = response.status;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
          } catch (_error) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: 'Erro interno do servidor' }));
          }
        });
      },
    },
  ],
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
  server: {
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    },
  },
})
