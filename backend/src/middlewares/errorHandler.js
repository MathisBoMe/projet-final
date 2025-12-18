/**
 * Middleware de gestion d'erreurs sécurisé
 * Évite les fuites d'informations sensibles en production
 */

const errorHandler = (err, req, res, next) => {
    // Log l'erreur complète côté serveur (pour le debugging)
    console.error('Erreur:', {
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        url: req.url,
        method: req.method,
        ip: req.ip,
        timestamp: new Date().toISOString()
    });

    // Ne pas exposer les détails de l'erreur en production
    const isDevelopment = process.env.NODE_ENV === 'development';

    // Gestion des erreurs spécifiques
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            message: "Données de requête invalides",
            errors: isDevelopment ? err.errors : undefined
        });
    }

    if (err.name === 'CastError' || err.name === 'BSONTypeError') {
        return res.status(400).json({
            message: "Format de données invalide"
        });
    }

    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            message: "Token invalide"
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            message: "Token expiré"
        });
    }

    if (err.code === 11000) {
        // Erreur de duplication MongoDB
        return res.status(400).json({
            message: "Cette ressource existe déjà"
        });
    }

    // Erreur Prisma
    if (err.code && err.code.startsWith('P')) {
        if (err.code === 'P2002') {
            return res.status(400).json({
                message: "Cette ressource existe déjà"
            });
        }
        if (err.code === 'P2025') {
            return res.status(404).json({
                message: "Ressource non trouvée"
            });
        }
    }

    // Erreur générique
    res.status(err.status || 500).json({
        message: isDevelopment ? err.message : "Une erreur interne est survenue",
        ...(isDevelopment && { stack: err.stack })
    });
};

// Middleware pour capturer les erreurs 404
const notFoundHandler = (req, res, next) => {
    res.status(404).json({
        message: "Route non trouvée"
    });
};

module.exports = { errorHandler, notFoundHandler };
