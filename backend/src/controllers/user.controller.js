const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User.js");

async function registerUser(req, res) {
    try {
        const { username, email, password } = req.body || {};
        if (!username || !email || !password) {
            return res.status(400).json({ message: "Tous les champs sont requis" });
        }
        const existingUserByEmail = await User.findOne({ email });
        if (existingUserByEmail) {
            return res.status(400).json({ message: "Cet email est déjà utilisé" });
        }
        const existingUserByUsername = await User.findOne({ username });
        if (existingUserByUsername) {
            return res.status(400).json({ message: "Ce nom d'utilisateur est déjà utilisé" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ username, email, password: hashedPassword });

        return res.status(201).json({ message: "Utilisateur créé avec succès", user: newUser });
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

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Identifiants invalides" });

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return res.status(400).json({ message: "Identifiants invalides" });

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
        const { username, email } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user.userId,
            { username, email },
            { new: true, runValidators: true }
        ).select("-password");
        if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
        res.json({ message: "Utilisateur mis à jour", user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function deleteUserByToken(req, res) {
    try {
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
        const user = await User.findById(req.params.id).select("-password");
        if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function updateUser(req, res) {
    try {
        const { username, email } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { username, email },
            { new: true, runValidators: true }
        ).select("-password");
        if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
        res.json({ message: "Utilisateur mis à jour", user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function deleteUser(req, res) {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
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