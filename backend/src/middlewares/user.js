const jwt = require("jsonwebtoken");
const securityLogger = require("./securityLogger.js");

async function verifyToken(req, res, next) {
    const header = req.headers.authorization;
    if (!header) {
        securityLogger.logUnauthorizedAccess(req, "Token manquant dans les headers");
        return res.status(401).json({ error: "Token manquant" });
    }

    const token = header.split(" ")[1];
    if (!token) {
        securityLogger.logUnauthorizedAccess(req, "Format de token invalide");
        return res.status(401).json({ error: "Format de token invalide" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            securityLogger.logSecurityError(req, err, { event: "TOKEN_EXPIRED" });
            return res.status(401).json({ error: "Token expiré", code: "TOKEN_EXPIRED" });
        }
        securityLogger.logSecurityError(req, err, { event: "TOKEN_INVALID" });
        res.status(401).json({ error: "Token invalide" });
    }
}

module.exports = { verifyToken };