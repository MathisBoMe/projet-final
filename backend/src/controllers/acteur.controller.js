const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const securityLogger = require("../middlewares/securityLogger.js");

// Fonctions utilitaires de validation et sanitisation
function sanitizeString(str) {
    if (typeof str !== "string") return null;
    return str.trim().slice(0, 255);
}

function isValidInteger(id) {
    if (typeof id === "number") {
        return Number.isInteger(id) && id > 0 && id <= Number.MAX_SAFE_INTEGER;
    }
    if (typeof id === "string") {
        const num = Number(id);
        return !isNaN(num) && Number.isInteger(num) && num > 0 && num <= Number.MAX_SAFE_INTEGER;
    }
    return false;
}

function isValidAge(age) {
    if (typeof age === "number") {
        return Number.isInteger(age) && age >= 0 && age <= 150;
    }
    if (typeof age === "string") {
        const num = Number(age);
        return !isNaN(num) && Number.isInteger(num) && num >= 0 && num <= 150;
    }
    return false;
}

async function createActeur(req, res) {
    try {
        if (!req.user || req.user.role !== "admin") {
            securityLogger.logUnauthorizedAccess(req, "Création d'acteur nécessite le rôle admin");
            return res.status(403).json({ error: "Accès refusé. Rôle admin requis." });
        }
        
        const { name, age, nationality } = req.body || {};
        
        // Validation de la présence des champs
        if (!name || age === undefined || !nationality) {
            return res.status(400).json({ error: "Tous les champs sont requis (name, age, nationality)" });
        }
        
        // Validation des types
        if (typeof name !== "string" || typeof nationality !== "string") {
            return res.status(400).json({ error: "Les champs name et nationality doivent être des chaînes de caractères." });
        }
        
        if (typeof age !== "number" && typeof age !== "string") {
            return res.status(400).json({ error: "L'âge doit être un nombre." });
        }
        
        // Sanitisation
        const sanitizedName = sanitizeString(name);
        const sanitizedNationality = sanitizeString(nationality);
        const ageNum = typeof age === "string" ? Number(age) : age;
        
        if (!sanitizedName || sanitizedName.length < 1 || sanitizedName.length > 255) {
            return res.status(400).json({ error: "Le nom doit contenir entre 1 et 255 caractères." });
        }
        
        if (!sanitizedNationality || sanitizedNationality.length < 1 || sanitizedNationality.length > 255) {
            return res.status(400).json({ error: "La nationalité doit contenir entre 1 et 255 caractères." });
        }
        
        if (!isValidAge(ageNum)) {
            return res.status(400).json({ error: "L'âge doit être un entier entre 0 et 150." });
        }
        
        // Vérification de l'unicité
        const existingActeur = await prisma.acteur.findUnique({ where: { name: sanitizedName } });
        if (existingActeur) {
            return res.status(400).json({ error: "Un acteur avec ce nom existe déjà." });
        }
        
        securityLogger.logSensitiveAccess(req, "Acteur", "CREATE");
        const acteur = await prisma.acteur.create({ 
            data: { name: sanitizedName, age: ageNum, nationality: sanitizedNationality } 
        });
        
        res.status(201).json(acteur);
    } catch (err) {
        console.error("Erreur lors de la création de l'acteur:", err);
        if (err.code === 'P2002') {
            return res.status(400).json({ error: "Un acteur avec ce nom existe déjà." });
        }
        res.status(500).json({ error: "Erreur serveur lors de la création de l'acteur." });
    }
}

async function listActeur(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Token manquant ou invalide." });
        }
        
        const { nom, nat, minAge, maxAge } = req.query;
        
        // Construire le filtre avec sanitisation
        const where = {};
        
        if (nom !== undefined && nom !== null) {
            if (typeof nom !== "string") {
                return res.status(400).json({ error: "Le paramètre 'nom' doit être une chaîne de caractères." });
            }
            const sanitizedNom = sanitizeString(nom);
            if (sanitizedNom && sanitizedNom.length > 0) {
                where.name = { contains: sanitizedNom };
            }
        }
        
        if (nat !== undefined && nat !== null) {
            if (typeof nat !== "string") {
                return res.status(400).json({ error: "Le paramètre 'nat' doit être une chaîne de caractères." });
            }
            const sanitizedNat = sanitizeString(nat);
            if (sanitizedNat && sanitizedNat.length > 0) {
                where.nationality = { contains: sanitizedNat };
            }
        }
        
        if (minAge !== undefined && minAge !== null) {
            const minAgeNum = Number(minAge);
            if (!isNaN(minAgeNum) && isValidAge(minAgeNum)) {
                where.age = { ...where.age, gte: minAgeNum };
            }
        }
        
        if (maxAge !== undefined && maxAge !== null) {
            const maxAgeNum = Number(maxAge);
            if (!isNaN(maxAgeNum) && isValidAge(maxAgeNum)) {
                where.age = { ...where.age, lte: maxAgeNum };
            }
        }
        
        const acteurs = await prisma.acteur.findMany({
            where: Object.keys(where).length > 0 ? where : undefined,
            take: 1000, // Limite pour éviter les réponses trop volumineuses
        });
        
        res.json(acteurs);
    } catch (err) {
        console.error("Erreur lors de la récupération des acteurs:", err);
        res.status(500).json({ error: "Erreur serveur lors de la récupération des acteurs." });
    }
}

async function getActeur(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Token manquant ou invalide." });
        }
        
        const { id } = req.params;
        
        // Validation de l'ID
        if (!id || !isValidInteger(id)) {
            return res.status(400).json({ error: "ID d'acteur invalide." });
        }
        
        const acteurId = Number(id);
        const acteur = await prisma.acteur.findUnique({ where: { id: acteurId } });
        
        if (!acteur) {
            return res.status(404).json({ error: "Acteur non trouvé" });
        }
        
        res.json(acteur);
    } catch (err) {
        console.error("Erreur lors de la récupération de l'acteur:", err);
        res.status(500).json({ error: "Erreur serveur lors de la récupération de l'acteur." });
    }
}

async function updateActeur(req, res) {
    try {
        if (!req.user || req.user.role !== "admin") {
            securityLogger.logUnauthorizedAccess(req, "Mise à jour d'acteur nécessite le rôle admin");
            return res.status(403).json({ error: "Accès refusé. Rôle admin requis." });
        }
        
        const { id } = req.params;
        
        // Validation de l'ID
        if (!id || !isValidInteger(id)) {
            return res.status(400).json({ error: "ID d'acteur invalide." });
        }
        
        const { name, age, nationality } = req.body || {};
        
        // Vérifier qu'au moins un champ est fourni
        if (!name && age === undefined && !nationality) {
            return res.status(400).json({ error: "Au moins un champ doit être fourni pour la mise à jour." });
        }
        
        // Préparer l'objet de mise à jour
        const updateData = {};
        
        if (name !== undefined) {
            if (typeof name !== "string") {
                return res.status(400).json({ error: "Le nom doit être une chaîne de caractères." });
            }
            const sanitizedName = sanitizeString(name);
            if (!sanitizedName || sanitizedName.length < 1 || sanitizedName.length > 255) {
                return res.status(400).json({ error: "Le nom doit contenir entre 1 et 255 caractères." });
            }
            updateData.name = sanitizedName;
        }
        
        if (age !== undefined) {
            const ageNum = typeof age === "string" ? Number(age) : age;
            if (!isValidAge(ageNum)) {
                return res.status(400).json({ error: "L'âge doit être un entier entre 0 et 150." });
            }
            updateData.age = ageNum;
        }
        
        if (nationality !== undefined) {
            if (typeof nationality !== "string") {
                return res.status(400).json({ error: "La nationalité doit être une chaîne de caractères." });
            }
            const sanitizedNationality = sanitizeString(nationality);
            if (!sanitizedNationality || sanitizedNationality.length < 1 || sanitizedNationality.length > 255) {
                return res.status(400).json({ error: "La nationalité doit contenir entre 1 et 255 caractères." });
            }
            updateData.nationality = sanitizedNationality;
        }
        
        securityLogger.logSensitiveAccess(req, "Acteur", "UPDATE");
        const acteurId = Number(id);
        const acteur = await prisma.acteur.update({ 
            where: { id: acteurId }, 
            data: updateData 
        });
        
        res.json(acteur);
    } catch (err) {
        console.error("Erreur lors de la mise à jour de l'acteur:", err);
        if (err.code === 'P2025') {
            return res.status(404).json({ error: "Acteur non trouvé" });
        }
        if (err.code === 'P2002') {
            return res.status(400).json({ error: "Un acteur avec ce nom existe déjà." });
        }
        res.status(500).json({ error: "Erreur serveur lors de la mise à jour de l'acteur." });
    }
}

async function deleteActeur(req, res) {
    try {
        if (!req.user || req.user.role !== "admin") {
            securityLogger.logUnauthorizedAccess(req, "Suppression d'acteur nécessite le rôle admin");
            return res.status(403).json({ error: "Accès refusé. Rôle admin requis." });
        }
        
        const { id } = req.params;
        
        // Validation de l'ID
        if (!id || !isValidInteger(id)) {
            return res.status(400).json({ error: "ID d'acteur invalide." });
        }
        
        const acteurId = Number(id);
        
        // Vérifier si l'acteur existe
        const acteur = await prisma.acteur.findUnique({ where: { id: acteurId } });
        if (!acteur) {
            return res.status(404).json({ error: "Acteur non trouvé" });
        }
        
        // Supprimer les relations film-acteur d'abord
        await prisma.film_Acteur.deleteMany({ where: { acteurId: acteurId } });
        
        securityLogger.logSensitiveAccess(req, "Acteur", "DELETE");
        // Supprimer l'acteur
        await prisma.acteur.delete({ where: { id: acteurId } });
        
        res.status(204).end();
    } catch (err) {
        console.error("Erreur lors de la suppression de l'acteur:", err);
        if (err.code === 'P2025') {
            return res.status(404).json({ error: "Acteur non trouvé" });
        }
        res.status(500).json({ error: "Erreur serveur lors de la suppression de l'acteur." });
    }
}

module.exports = { createActeur, listActeur, getActeur, updateActeur, deleteActeur }
