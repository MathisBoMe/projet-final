/**
 * Middleware pour configurer les headers Cache-Control
 * Empêche le cache de contenu sensible (réponses API)
 * Permet le cache pour les assets statiques si nécessaire
 */

function cacheControlMiddleware(req, res, next) {
    // Par défaut, ne pas mettre en cache les réponses API
    // Cela protège contre le cache de données sensibles (tokens, infos utilisateur, etc.)
    const isApiRoute = req.path.startsWith('/api/') || req.path.startsWith('/docs');
    
    if (isApiRoute) {
        // Pour les routes API : ne jamais mettre en cache
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
    } else {
        // Pour les autres routes (ex: /, /pinte) : cache très court ou pas de cache
        res.setHeader('Cache-Control', 'no-cache, must-revalidate');
    }
    
    next();
}

module.exports = { cacheControlMiddleware };
