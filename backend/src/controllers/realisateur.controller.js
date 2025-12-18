const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const securityLogger = require("../middlewares/securityLogger.js");
const {
    sanitizeString,
    isValidInteger,
    isValidAge
} = require("../utils/validation.js");

async function createReal(req, res) {
    try {
        if (!req.user || req.user.role !== "admin") {
            securityLogger.logUnauthorizedAccess(req, "Création de réalisateur nécessite le rôle admin");
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
        const existingReal = await prisma.réalisateur.findUnique({ where: { name: sanitizedName } });
        if (existingReal) {
            return res.status(400).json({ error: "Un réalisateur avec ce nom existe déjà." });
        }
        
        securityLogger.logSensitiveAccess(req, "Réalisateur", "CREATE");
        const réalisateur = await prisma.réalisateur.create({ 
            data: { name: sanitizedName, age: ageNum, nationality: sanitizedNationality } 
        });
        
        res.status(201).json(réalisateur);
    } catch (err) {
        console.error("Erreur lors de la création du réalisateur:", err);
        if (err.code === 'P2002') {
            return res.status(400).json({ error: "Un réalisateur avec ce nom existe déjà." });
        }
        res.status(500).json({ error: "Erreur serveur lors de la création du réalisateur." });
    }
}

async function listReal(req, res) {
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
        
        const réalisateurs = await prisma.réalisateur.findMany({
            where: Object.keys(where).length > 0 ? where : undefined,
            take: 1000, // Limite pour éviter les réponses trop volumineuses
        });
        
        res.json(réalisateurs);
    } catch (err) {
        console.error("Erreur lors de la récupération des réalisateurs:", err);
        res.status(500).json({ error: "Erreur serveur lors de la récupération des réalisateurs." });
    }
}

async function getReal(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Token manquant ou invalide." });
        }
        
        const { id } = req.params;
        
        // Validation de l'ID
        if (!id || !isValidInteger(id)) {
            return res.status(400).json({ error: "ID de réalisateur invalide." });
        }
        
        const realId = Number(id);
        const réalisateur = await prisma.réalisateur.findUnique({ where: { id: realId } });
        
        if (!réalisateur) {
            return res.status(404).json({ error: "Réalisateur non trouvé" });
        }
        
        res.json(réalisateur);
    } catch (err) {
        console.error("Erreur lors de la récupération du réalisateur:", err);
        res.status(500).json({ error: "Erreur serveur lors de la récupération du réalisateur." });
    }
}

async function updateReal(req, res) {
    try {
        if (!req.user || req.user.role !== "admin") {
            securityLogger.logUnauthorizedAccess(req, "Mise à jour de réalisateur nécessite le rôle admin");
            return res.status(403).json({ error: "Accès refusé. Rôle admin requis." });
        }
        
        const { id } = req.params;
        
        // Validation de l'ID
        if (!id || !isValidInteger(id)) {
            return res.status(400).json({ error: "ID de réalisateur invalide." });
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
        
        securityLogger.logSensitiveAccess(req, "Réalisateur", "UPDATE");
        const realId = Number(id);
        const réalisateur = await prisma.réalisateur.update({ 
            where: { id: realId }, 
            data: updateData 
        });
        
        res.json(réalisateur);
    } catch (err) {
        console.error("Erreur lors de la mise à jour du réalisateur:", err);
        if (err.code === 'P2025') {
            return res.status(404).json({ error: "Réalisateur non trouvé" });
        }
        if (err.code === 'P2002') {
            return res.status(400).json({ error: "Un réalisateur avec ce nom existe déjà." });
        }
        res.status(500).json({ error: "Erreur serveur lors de la mise à jour du réalisateur." });
    }
}

async function deleteReal(req, res) {
    try {
        if (!req.user || req.user.role !== "admin") {
            securityLogger.logUnauthorizedAccess(req, "Suppression de réalisateur nécessite le rôle admin");
            return res.status(403).json({ error: "Accès refusé. Rôle admin requis." });
        }
        
        const { id } = req.params;
        
        // Validation de l'ID
        if (!id || !isValidInteger(id)) {
            return res.status(400).json({ error: "ID de réalisateur invalide." });
        }
        
        const realId = Number(id);
        
        // Vérifier si le réalisateur existe
        const réalisateur = await prisma.réalisateur.findUnique({ where: { id: realId } });
        if (!réalisateur) {
            return res.status(404).json({ error: "Réalisateur non trouvé" });
        }
        
        // Supprimer les films associés et leurs relations
        const films = await prisma.film.findMany({ where: { realId: realId } });
        const filmIds = films.map(film => film.id);
        
        if (filmIds.length > 0) {
            await prisma.film_Acteur.deleteMany({ where: { filmId: { in: filmIds } } });
            await prisma.film.deleteMany({ where: { realId: realId } });
        }
        
        securityLogger.logSensitiveAccess(req, "Réalisateur", "DELETE");
        // Supprimer le réalisateur
        await prisma.réalisateur.delete({ where: { id: realId } });
        
        res.status(204).end();
    } catch (err) {
        console.error("Erreur lors de la suppression du réalisateur:", err);
        if (err.code === 'P2025') {
            return res.status(404).json({ error: "Réalisateur non trouvé" });
        }
        res.status(500).json({ error: "Erreur serveur lors de la suppression du réalisateur." });
    }
}

module.exports = { createReal, listReal, getReal, updateReal, deleteReal }
