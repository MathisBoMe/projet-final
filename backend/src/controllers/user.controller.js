const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User.js");

// Fonctions utilitaires de validation et sanitisation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function sanitizeString(str) {
    if (typeof str !== "string") return null;
    // Retirer les caractères dangereux et limiter la longueur
    return str.trim().slice(0, 255);
}

function sanitizeEmail(email) {
    if (typeof email !== "string") return null;
    // Nettoyer l'email et le mettre en minuscules
    return email.trim().toLowerCase().slice(0, 255);
}

function isValidObjectId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}

function validatePassword(password) {
    if (typeof password !== "string") return false;
    // Au moins 6 caractères
    if (password.length < 6) return false;
    // Maximum 128 caractères pour éviter les attaques DoS
    if (password.length > 128) return false;
    return true;
}

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
        const existingUserByEmail = await User.findOne({ email: sanitizedEmail });
        if (existingUserByEmail) {
            return res.status(400).json({ message: "Cet email est déjà utilisé" });
        }
        
        const existingUserByUsername = await User.findOne({ username: sanitizedUsername });
        if (existingUserByUsername) {
            return res.status(400).json({ message: "Ce nom d'utilisateur est déjà utilisé" });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ 
            username: sanitizedUsername, 
            email: sanitizedEmail, 
            password: hashedPassword 
        });

        // Ne pas renvoyer le mot de passe
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
        const user = await User.findOne({ email: sanitizedEmail });
        if (!user) {
            // Réponse générique pour éviter l'énumération d'utilisateurs
            return res.status(400).json({ message: "Identifiants invalides" });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            // Réponse générique pour éviter l'énumération d'utilisateurs
            return res.status(400).json({ message: "Identifiants invalides" });
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET || "devsecret",
            { expiresIn: "2h" }
        );

        res.json({
            token,
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

module.exports = { 
    registerUser, 
    loginUser, 
    getUserByToken, 
    updateUserByToken, 
    deleteUserByToken,
    getUser,
    updateUser,
    deleteUser
};