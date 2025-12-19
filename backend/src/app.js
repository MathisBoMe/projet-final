const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const swaggerUi = require("swagger-ui-express");
const { swaggerSpec } = require("./swagger.js");
const rateLimit = require("express-rate-limit");
const { cacheControlMiddleware } = require("./middlewares/cacheControl.js");
const userRouter = require("./routes/userRoutes.js");
const realisateurRouter = require("./routes/realisateur.routes.js");
const filmRouter = require("./routes/film.routes.js");
const acteurRouter = require("./routes/acteur.routes.js");
const relationRouter = require("./routes/act_film.routes.js");

const app = express();

// Configuration Helmet pour les headers de sécurité HTTP
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"], // unsafe-inline nécessaire pour Swagger UI
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // unsafe-eval nécessaire pour Swagger UI
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    crossOriginEmbedderPolicy: false, // Désactivé pour compatibilité avec certains navigateurs
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Middleware Cache-Control pour éviter le cache de contenu sensible
app.use(cacheControlMiddleware);

// Configuration CORS avec support des variables d'environnement
const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:5173', 'http://localhost:3000', 'https://localhost:5173'];

app.use(cors({
    origin: function (origin, callback) {
        // Autoriser les requêtes sans origine (mobile apps, Postman, etc.) en développement
        if (!origin && process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Non autorisé par CORS'));
        }
    },
    credentials: true,
    allowedHeaders: ["Authorization", "Content-Type", "X-Requested-With"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
}));

// Limite de taille des payloads pour prévenir les attaques DoS
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting global
app.use(rateLimit({ 
    windowMs: 60_000, // 1 minute
    max: 100, // 100 requêtes par minute
    message: "Trop de requêtes depuis cette IP, veuillez réessayer plus tard.",
    standardHeaders: true,
    legacyHeaders: false,
}));

// Rate limiting spécifique pour les routes d'authentification
const authLimiter = rateLimit({
    windowMs: 15 * 60_000, // 15 minutes
    max: 10, // 10 tentatives par 15 minutes
    message: "Trop de tentatives de connexion, veuillez réessayer dans 15 minutes.",
    skipSuccessfulRequests: true, // Ne pas compter les requêtes réussies
    handler: (req, res) => {
        const securityLogger = require("./middlewares/securityLogger.js");
        securityLogger.logRateLimitViolation(req);
        res.status(429).json({ message: "Trop de tentatives de connexion, veuillez réessayer dans 15 minutes." });
    }
});
app.use("/api/user/login", authLimiter);
app.use("/api/user/register", authLimiter);

app.get("/", (req, res) => res.json({ message: "API OK" }));
app.get("/pinte", (req, res) => res.json("Picole moins, Milo."));
app.use("/api/user", userRouter);
app.use("/api/realisateur", realisateurRouter);
app.use("/api/film", filmRouter);
app.use("/api/acteur", acteurRouter);
app.use("/api/relation", relationRouter);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Middleware de gestion d'erreurs (doit être après toutes les routes)
const { errorHandler, notFoundHandler } = require("./middlewares/errorHandler.js");
app.use(notFoundHandler); // Pour les routes non trouvées
app.use(errorHandler); // Pour les erreurs générales

module.exports = app;