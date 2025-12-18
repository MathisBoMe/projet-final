const securityLogger = require("./securityLogger.js");

const requireRole = (role) => (req, res, next) => {
    if (!req.user || req.user.role !== role) {
        securityLogger.logUnauthorizedAccess(req, `Rôle requis: ${role}, rôle actuel: ${req.user?.role || 'aucun'}`);
        return res.status(403).json({ error: "Accès refusé" });
    }
    next();
};

module.exports = { requireRole };