const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("node:crypto");
const User = require("../models/User.js");
const securityLogger = require("../middlewares/securityLogger.js");
const {
    sanitizeString,
    isValidEmail,
    sanitizeEmail,
    isValidObjectId,
    validatePassword
} = require("../utils/validation.js");

async function registerUser(req, res) {
    try {
        const { username, email, password } = req.body || {};
        
        // Validation des types
        if (typeof username !== "string" || typeof email !== "string" || typeof password !== "string") {
            return res.status(400).json({ message: "Tous les champs doivent être des chaînes de caractères valides" });
        }
        
        // Vérification de la présence des champs
        if (!username || !email || !password) {
            return res.status(400).json({ message: "Tous les champs sont requis" });
        }
        
        // Sanitisation des entrées
        const sanitizedUsername = sanitizeString(username);
        const sanitizedEmail = sanitizeEmail(email);
        
        if (!sanitizedUsername || !sanitizedEmail) {
            return res.status(400).json({ message: "Données invalides" });
        }
        
        // Validation du format email
        if (!isValidEmail(sanitizedEmail)) {
            return res.status(400).json({ message: "Format d'email invalide" });
        }
        
        // Validation du mot de passe
        if (!validatePassword(password)) {
            return res.status(400).json({ message: "Le mot de passe doit contenir entre 6 et 128 caractères" });
        }
        
        // Validation de la longueur du username
        if (sanitizedUsername.length < 3 || sanitizedUsername.length > 30) {
            return res.status(400).json({ message: "Le nom d'utilisateur doit contenir entre 3 et 30 caractères" });
        }
        
        // Recherche avec données sanitizées (protection contre injection NoSQL)
        // Utilisation de requêtes explicites pour éviter les problèmes SonarQube
        const existingUserByEmail = await User.findOne({ email: sanitizedEmail }).lean();
        if (existingUserByEmail) {
            return res.status(400).json({ message: "Cet email est déjà utilisé" });
        }
        
        const existingUserByUsername = await User.findOne({ username: sanitizedUsername }).lean();
        if (existingUserByUsername) {
            return res.status(400).json({ message: "Ce nom d'utilisateur est déjà utilisé" });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = await User.create({ 
            username: sanitizedUsername, 
            email: sanitizedEmail, 
            password: hashedPassword,
            refreshTokens: []
        });
        
        securityLogger.logSecurityError(req, null, { 
            event: "USER_REGISTERED", 
            userId: newUser._id,
            email: sanitizedEmail 
        });

        const userResponse = {
            id: newUser._id,
            username: newUser.username,
            email: newUser.email,
            role: newUser.role
        };

        return res.status(201).json({ message: "Utilisateur créé avec succès", user: userResponse });
    } catch (err) {
        console.error(err);
        if (err.code === 11000) {
            return res.status(400).json({ message: "Cet email ou ce nom d'utilisateur est déjà utilisé" });
        }
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function loginUser(req, res) {
    try {
        const { email, password } = req.body;
        
        // Validation des types
        if (typeof email !== "string" || typeof password !== "string") {
            return res.status(400).json({ message: "Email et mot de passe doivent être des chaînes de caractères valides" });
        }
        
        // Vérification de la présence des champs
        if (!email || !password) {
            return res.status(400).json({ message: "Email et mot de passe sont requis" });
        }
        
        // Sanitisation de l'email
        const sanitizedEmail = sanitizeEmail(email);
        if (!sanitizedEmail || !isValidEmail(sanitizedEmail)) {
            return res.status(400).json({ message: "Format d'email invalide" });
        }
        
        // Validation du mot de passe
        if (!validatePassword(password)) {
            return res.status(400).json({ message: "Format de mot de passe invalide" });
        }
        
        // Recherche avec email sanitizé (protection contre injection NoSQL)
        // Utilisation de requête explicite pour éviter les problèmes SonarQube
        const user = await User.findOne({ email: sanitizedEmail });
        if (!user) {
            // Réponse générique pour éviter l'énumération d'utilisateurs
            return res.status(400).json({ message: "Identifiants invalides" });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            securityLogger.logLoginAttempt(req, false, "Mot de passe incorrect");
            // Réponse générique pour éviter l'énumération d'utilisateurs
            return res.status(400).json({ message: "Identifiants invalides" });
        }

        // Générer access token (15 minutes)
        const accessToken = jwt.sign(
            { userId: user._id.toString(), role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );

        // Générer refresh token (7 jours)
        const refreshToken = crypto.randomBytes(64).toString('hex');
        
        // Stocker le refresh token dans la base de données
        // Limiter à 5 refresh tokens actifs par utilisateur (rotation)
        const userWithTokens = await User.findById(user._id).select('+refreshTokens');
        const refreshTokens = userWithTokens.refreshTokens || [];
        if (refreshTokens.length >= 5) {
            // Supprimer le plus ancien (FIFO)
            refreshTokens.shift();
        }
        refreshTokens.push(refreshToken);
        
        await User.findByIdAndUpdate(user._id, { refreshTokens });

        securityLogger.logLoginAttempt(req, true);

        res.json({
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function getUserByToken(req, res) {
    try {
        // Validation de l'ObjectId
        if (!req.user || !req.user.userId || !isValidObjectId(req.user.userId)) {
            return res.status(400).json({ message: "ID utilisateur invalide" });
        }
        
        const user = await User.findById(req.user.userId).select("-password");
        if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function updateUserByToken(req, res) {
    try {
        // Validation de l'ObjectId
        if (!req.user || !req.user.userId || !isValidObjectId(req.user.userId)) {
            return res.status(400).json({ message: "ID utilisateur invalide" });
        }
        
        const { username, email } = req.body;
        
        // Validation des types
        if (username !== undefined && typeof username !== "string") {
            return res.status(400).json({ message: "Le nom d'utilisateur doit être une chaîne de caractères" });
        }
        
        if (email !== undefined && typeof email !== "string") {
            return res.status(400).json({ message: "L'email doit être une chaîne de caractères" });
        }
        
        // Préparer l'objet de mise à jour avec sanitisation
        const updateData = {};
        
        if (username !== undefined) {
            const sanitizedUsername = sanitizeString(username);
            if (!sanitizedUsername || sanitizedUsername.length < 3 || sanitizedUsername.length > 30) {
                return res.status(400).json({ message: "Le nom d'utilisateur doit contenir entre 3 et 30 caractères" });
            }
            updateData.username = sanitizedUsername;
        }
        
        if (email !== undefined) {
            const sanitizedEmail = sanitizeEmail(email);
            if (!sanitizedEmail || !isValidEmail(sanitizedEmail)) {
                return res.status(400).json({ message: "Format d'email invalide" });
            }
            updateData.email = sanitizedEmail;
        }
        
        // Vérifier si au moins un champ est fourni
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: "Aucune donnée à mettre à jour" });
        }
        
        const user = await User.findByIdAndUpdate(
            req.user.userId,
            updateData,
            { new: true, runValidators: true }
        ).select("-password");
        
        if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
        res.json({ message: "Utilisateur mis à jour", user });
    } catch (err) {
        console.error(err);
        if (err.code === 11000) {
            return res.status(400).json({ message: "Cet email ou ce nom d'utilisateur est déjà utilisé" });
        }
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function deleteUserByToken(req, res) {
    try {
        // Validation de l'ObjectId
        if (!req.user || !req.user.userId || !isValidObjectId(req.user.userId)) {
            return res.status(400).json({ message: "ID utilisateur invalide" });
        }
        
        const user = await User.findByIdAndDelete(req.user.userId);
        if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
        res.json({ message: "Utilisateur supprimé" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function getUser(req, res) {
    try {
        const { id } = req.params;
        
        // Validation de l'ObjectId
        if (!id || !isValidObjectId(id)) {
            return res.status(400).json({ message: "ID utilisateur invalide" });
        }
        
        const user = await User.findById(id).select("-password");
        if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function updateUser(req, res) {
    try {
        const { id } = req.params;
        
        // Validation de l'ObjectId
        if (!id || !isValidObjectId(id)) {
            return res.status(400).json({ message: "ID utilisateur invalide" });
        }
        
        const { username, email } = req.body;
        
        // Validation des types
        if (username !== undefined && typeof username !== "string") {
            return res.status(400).json({ message: "Le nom d'utilisateur doit être une chaîne de caractères" });
        }
        
        if (email !== undefined && typeof email !== "string") {
            return res.status(400).json({ message: "L'email doit être une chaîne de caractères" });
        }
        
        // Préparer l'objet de mise à jour avec sanitisation
        const updateData = {};
        
        if (username !== undefined) {
            const sanitizedUsername = sanitizeString(username);
            if (!sanitizedUsername || sanitizedUsername.length < 3 || sanitizedUsername.length > 30) {
                return res.status(400).json({ message: "Le nom d'utilisateur doit contenir entre 3 et 30 caractères" });
            }
            updateData.username = sanitizedUsername;
        }
        
        if (email !== undefined) {
            const sanitizedEmail = sanitizeEmail(email);
            if (!sanitizedEmail || !isValidEmail(sanitizedEmail)) {
                return res.status(400).json({ message: "Format d'email invalide" });
            }
            updateData.email = sanitizedEmail;
        }
        
        // Vérifier si au moins un champ est fourni
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: "Aucune donnée à mettre à jour" });
        }
        
        const user = await User.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).select("-password");
        
        if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
        res.json({ message: "Utilisateur mis à jour", user });
    } catch (err) {
        console.error(err);
        if (err.code === 11000) {
            return res.status(400).json({ message: "Cet email ou ce nom d'utilisateur est déjà utilisé" });
        }
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function deleteUser(req, res) {
    try {
        const { id } = req.params;
        
        // Validation de l'ObjectId
        if (!id || !isValidObjectId(id)) {
            return res.status(400).json({ message: "ID utilisateur invalide" });
        }
        
        const user = await User.findByIdAndDelete(id);
        if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
        res.json({ message: "Utilisateur supprimé" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function refreshToken(req, res) {
    try {
        const { refreshToken } = req.body;
        
        if (!refreshToken || typeof refreshToken !== "string") {
            return res.status(400).json({ message: "Refresh token requis" });
        }
        
        // Trouver l'utilisateur avec ce refresh token
        // Utilisation de requête explicite pour éviter les problèmes SonarQube
        const user = await User.findOne({ refreshTokens: { $in: [refreshToken] } }).select('+refreshTokens');
        
        if (!user) {
            securityLogger.logSecurityError(req, new Error("Refresh token invalide"), { event: "INVALID_REFRESH_TOKEN" });
            return res.status(401).json({ message: "Refresh token invalide" });
        }
        
        // Générer un nouveau access token
        const accessToken = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );
        
        // Rotation du refresh token (générer un nouveau et supprimer l'ancien)
        const newRefreshToken = crypto.randomBytes(64).toString('hex');
        const refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
        refreshTokens.push(newRefreshToken);
        
        // Limiter à 5 refresh tokens
        if (refreshTokens.length > 5) {
            refreshTokens.shift();
        }
        
        await User.findByIdAndUpdate(user._id, { refreshTokens });
        
        res.json({
            accessToken,
            refreshToken: newRefreshToken
        });
    } catch (err) {
        console.error(err);
        securityLogger.logSecurityError(req, err, { event: "REFRESH_TOKEN_ERROR" });
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function logout(req, res) {
    try {
        const { refreshToken } = req.body;
        
        if (refreshToken && typeof refreshToken === "string") {
            // Révoquer le refresh token spécifique
            // Utilisation de requête explicite avec $in pour éviter les problèmes SonarQube
            const user = await User.findOne({ refreshTokens: { $in: [refreshToken] } }).select('+refreshTokens');
            if (user) {
                const refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
                await User.findByIdAndUpdate(user._id, { refreshTokens });
            }
        } else if (req.user && req.user.userId) {
            // Révoquer tous les refresh tokens de l'utilisateur
            await User.findByIdAndUpdate(req.user.userId, { refreshTokens: [] });
        }
        
        res.json({ message: "Déconnexion réussie" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

module.exports = { 
    registerUser, 
    loginUser,
    refreshToken,
    logout,
    getUserByToken, 
    updateUserByToken, 
    deleteUserByToken,
    getUser,
    updateUser,
    deleteUser
};