/**
 * Protection CSRF simplifiée pour les requêtes mutantes
 * Note: Pour une API REST avec JWT dans les headers, CSRF est moins critique
 * mais cette protection ajoute une couche supplémentaire de sécurité
 */

const crypto = require("crypto");

// Store pour les tokens CSRF (en production, utiliser Redis ou une base de données)
const csrfTokens = new Map();
const CSRF_TOKEN_EXPIRY = 60 * 60 * 1000; // 1 heure

/**
 * Génère un token CSRF
 */
function generateCSRFToken() {
    return crypto.randomBytes(32).toString('hex');
}

/**
 * Middleware pour générer et envoyer un token CSRF
 * À appeler sur les routes GET pour obtenir le token
 */
function generateCSRF(req, res, next) {
    const token = generateCSRFToken();
    const expiry = Date.now() + CSRF_TOKEN_EXPIRY;
    
    csrfTokens.set(token, {
        expiry,
        ip: req.ip || req.connection.remoteAddress
    });
    
    // Nettoyer les tokens expirés périodiquement
    if (csrfTokens.size > 1000) {
        const now = Date.now();
        for (const [t, data] of csrfTokens.entries()) {
            if (data.expiry < now) {
                csrfTokens.delete(t);
            }
        }
    }
    
    res.locals.csrfToken = token;
    res.setHeader('X-CSRF-Token', token);
    next();
}

/**
 * Middleware pour vérifier le token CSRF
 * À utiliser sur les routes POST, PUT, DELETE, PATCH
 */
function verifyCSRF(req, res, next) {
    // Skip CSRF pour les routes d'authentification (utilisent JWT)
    if (req.path.startsWith('/api/user/login') || 
        req.path.startsWith('/api/user/register') ||
        req.path.startsWith('/api/user/refresh')) {
        return next();
    }
    
    // Skip CSRF si la requête vient d'une origine autorisée et utilise JWT
    // (les APIs REST avec JWT sont moins vulnérables au CSRF)
    const token = req.headers['x-csrf-token'] || req.body?.csrfToken;
    
    if (!token) {
        // En développement, on peut être plus permissif
        if (process.env.NODE_ENV === 'development') {
            return next();
        }
        return res.status(403).json({ error: "Token CSRF manquant" });
    }
    
    const tokenData = csrfTokens.get(token);
    
    if (!tokenData) {
        return res.status(403).json({ error: "Token CSRF invalide" });
    }
    
    if (tokenData.expiry < Date.now()) {
        csrfTokens.delete(token);
        return res.status(403).json({ error: "Token CSRF expiré" });
    }
    
    // Vérifier que le token vient de la même IP (optionnel, peut être désactivé pour les proxies)
    // const requestIP = req.ip || req.connection.remoteAddress;
    // if (tokenData.ip !== requestIP && process.env.NODE_ENV === 'production') {
    //     return res.status(403).json({ error: "Token CSRF ne correspond pas à l'IP" });
    // }
    
    // Supprimer le token après utilisation (one-time use)
    csrfTokens.delete(token);
    
    next();
}

module.exports = { generateCSRF, verifyCSRF };
