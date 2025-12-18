const crypto = require("node:crypto");

const csrfTokens = new Map();
const CSRF_TOKEN_EXPIRY = 60 * 60 * 1000; // 1 heure

/**
 * Génère un token CSRF
 */
function generateCSRFToken() {
    return crypto.randomBytes(32).toString('hex');
}


function generateCSRF(req, res, next) {
    const token = generateCSRFToken();
    const expiry = Date.now() + CSRF_TOKEN_EXPIRY;
    
    csrfTokens.set(token, {
        expiry,
        ip: req.ip || req.connection.remoteAddress
    });
    
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

function verifyCSRF(req, res, next) {
    
    if (req.path.startsWith('/api/user/login') || 
        req.path.startsWith('/api/user/register') ||
        req.path.startsWith('/api/user/refresh')) {
        return next();
    }
    
   
    const token = req.headers['x-csrf-token'] || req.body?.csrfToken;
    
    if (!token) {
        
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
    
    csrfTokens.delete(token);
    
    next();
}

module.exports = { generateCSRF, verifyCSRF };
