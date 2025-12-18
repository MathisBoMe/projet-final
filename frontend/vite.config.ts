import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import fs from "fs";
import path from "path";
import type { IncomingMessage, ServerResponse } from 'http';

// Plugin pour ajouter les headers de sécurité (similaire à Helmet)
function securityHeaders(): Plugin {
  return {
    name: 'security-headers',
    configureServer(server) {
      server.middlewares.use((req: IncomingMessage, res: ServerResponse, next: () => void) => {
        // Headers de sécurité similaires à Helmet
        res.setHeader('X-DNS-Prefetch-Control', 'off');
        res.setHeader('X-Frame-Options', 'SAMEORIGIN');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
        
        // Content Security Policy (relaxée pour le développement avec Vite)
        const isDev = process.env.NODE_ENV !== 'production';
        res.setHeader(
          'Content-Security-Policy',
          isDev
            ? [
                "default-src 'self'",
                "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // unsafe-eval nécessaire pour Vite en dev
                "style-src 'self' 'unsafe-inline'",
                "img-src 'self' data: https:",
                "font-src 'self' data:",
                "connect-src 'self' https://localhost:3000 ws://localhost:* wss://localhost:*", // API backend + WebSocket pour HMR
                "frame-ancestors 'self'",
                "base-uri 'self'",
                "form-action 'self'",
                "object-src 'none'"
              ].join('; ')
            : [
                "default-src 'self'",
                "script-src 'self'",
                "style-src 'self' 'unsafe-inline'",
                "img-src 'self' data: https:",
                "font-src 'self' data:",
                "connect-src 'self' https://localhost:3000",
                "frame-ancestors 'self'",
                "base-uri 'self'",
                "form-action 'self'",
                "object-src 'none'",
                "upgrade-insecure-requests"
              ].join('; ')
        );
        
        // Strict Transport Security (HSTS) - seulement en HTTPS
        const isSecure = (req.socket as any).encrypted || 
                        req.headers['x-forwarded-proto'] === 'https' ||
                        (req as any).protocol === 'https';
        if (isSecure) {
          res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
        }
        
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req: IncomingMessage, res: ServerResponse, next: () => void) => {
        // Mêmes headers pour le serveur de prévisualisation
        res.setHeader('X-DNS-Prefetch-Control', 'off');
        res.setHeader('X-Frame-Options', 'SAMEORIGIN');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
        
        res.setHeader(
          'Content-Security-Policy',
          [
            "default-src 'self'",
            "script-src 'self'",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: https:",
            "font-src 'self' data:",
            "connect-src 'self' https://localhost:3000",
            "frame-ancestors 'self'",
            "base-uri 'self'",
            "form-action 'self'",
            "object-src 'none'",
            "upgrade-insecure-requests"
          ].join('; ')
        );
        
        const isSecure = (req.socket as any).encrypted || 
                        req.headers['x-forwarded-proto'] === 'https' ||
                        (req as any).protocol === 'https';
        if (isSecure) {
          res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
        }
        
        next();
      });
    }
  };
}

// https://vite.dev/config/
const keyPath = path.resolve(__dirname, "../security/server.key");
const certPath = path.resolve(__dirname, "../security/server.cert");
const hasCertificates = fs.existsSync(keyPath) && fs.existsSync(certPath);

const serverConfig: any = {
  headers: {
    // Headers supplémentaires au niveau du serveur
    'X-DNS-Prefetch-Control': 'off',
    'X-Frame-Options': 'SAMEORIGIN',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  }
};

// Ajouter HTTPS seulement si les certificats existent
if (hasCertificates) {
  serverConfig.https = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath)
  };
}

export default defineConfig({
  plugins: [react(), securityHeaders()],
  server: serverConfig,
  preview: {
    headers: {
      'X-DNS-Prefetch-Control': 'off',
      'X-Frame-Options': 'SAMEORIGIN',
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    }
  }
})
