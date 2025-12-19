const securityLogger = {
    logLoginAttempt(req, success, reason = null) {
        const logData = {
            timestamp: new Date().toISOString(),
            event: 'LOGIN_ATTEMPT',
            success,
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.get('user-agent'),
            email: req.body?.email || 'N/A',
            reason: reason || (success ? 'SUCCESS' : 'FAILED')
        };

        if (success) {
            console.log(`[SECURITY] ✅ Login réussi: ${logData.email} depuis ${logData.ip}`);
        } else {
            console.warn(`[SECURITY] ⚠️  Tentative de login échouée: ${logData.email} depuis ${logData.ip} - ${reason}`);
        }

    },

    /**
     * Logger les accès aux ressources sensibles
     */
    logSensitiveAccess(req, resource, action) {
        const logData = {
            timestamp: new Date().toISOString(),
            event: 'SENSITIVE_ACCESS',
            userId: req.user?.userId || 'N/A',
            role: req.user?.role || 'N/A',
            resource,
            action,
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.get('user-agent'),
            method: req.method,
            path: req.path
        };

        console.log(`[SECURITY] 🔒 Accès sensible: ${action} sur ${resource} par utilisateur ${logData.userId} (${logData.role})`);
    },

    /**
     * Logger les erreurs de sécurité
     */
    logSecurityError(req, error, details = {}) {
        const errorMessage = error ? (error.message || error.toString()) : 'N/A';
        const logData = {
            timestamp: new Date().toISOString(),
            event: 'SECURITY_ERROR',
            error: errorMessage,
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.get('user-agent'),
            method: req.method,
            path: req.path,
            ...details
        };

        console.error(`[SECURITY] ❌ Erreur de sécurité: ${errorMessage} depuis ${logData.ip}`);
    },

    /**
     * Logger les violations de rate limiting
     */
    logRateLimitViolation(req) {
        const logData = {
            timestamp: new Date().toISOString(),
            event: 'RATE_LIMIT_VIOLATION',
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.get('user-agent'),
            path: req.path
        };

        console.warn(`[SECURITY] 🚫 Rate limit dépassé: ${logData.ip} sur ${logData.path}`);
    },

    /**
     * Logger les tentatives d'accès non autorisé
     */
    logUnauthorizedAccess(req, reason) {
        const logData = {
            timestamp: new Date().toISOString(),
            event: 'UNAUTHORIZED_ACCESS',
            userId: req.user?.userId || 'N/A',
            ip: req.ip || req.connection.remoteAddress,
            path: req.path,
            method: req.method,
            reason
        };

        console.warn(`[SECURITY] 🚫 Accès non autorisé: ${reason} - IP: ${logData.ip}, Path: ${logData.path}`);
    }
};

module.exports = securityLogger;
