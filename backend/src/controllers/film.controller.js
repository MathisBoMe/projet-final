const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const {
    sanitizeString,
    isValidDate,
    isValidInteger
} = require("../utils/validation.js");

async function createFilm(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Token manquant ou invalide." });
        }
        
        const { name, release_date, réalisateurName } = req.body || {};
        
        // Validation de la présence des champs
        if (!name || !release_date || !réalisateurName) {
            return res.status(400).json({ error: "Tous les champs sont requis (name, release_date, réalisateurName)" });
        }
        
        // Validation des types
        if (typeof name !== "string" || typeof release_date !== "string" || typeof réalisateurName !== "string") {
            return res.status(400).json({ error: "Les données entrées doivent être des chaînes de caractères valides." });
        }
        
        // Sanitisation
        const sanitizedName = sanitizeString(name);
        const sanitizedRealisateurName = sanitizeString(réalisateurName);
        
        if (!sanitizedName || sanitizedName.length < 1 || sanitizedName.length > 255) {
            return res.status(400).json({ error: "Le nom du film doit contenir entre 1 et 255 caractères." });
        }
        
        if (!sanitizedRealisateurName || sanitizedRealisateurName.length < 1 || sanitizedRealisateurName.length > 255) {
            return res.status(400).json({ error: "Le nom du réalisateur doit contenir entre 1 et 255 caractères." });
        }
        
        // Validation de la date
        if (!isValidDate(release_date)) {
            return res.status(400).json({ error: "Date de sortie invalide. Format attendu: YYYY-MM-DD, année entre 1888 et " + (new Date().getFullYear() + 10) + "." });
        }
        
        // Vérification de l'existence du réalisateur
        const réalisateur = await prisma.réalisateur.findUnique({ where: { name: sanitizedRealisateurName } });
        if (!réalisateur) {
            return res.status(400).json({ error: "Ce réalisateur n'existe pas dans la base de données." });
        }
        
        // Vérification de l'unicité du nom de film
        const existingFilm = await prisma.film.findUnique({ where: { name: sanitizedName } });
        if (existingFilm) {
            return res.status(400).json({ error: "Un film avec ce nom existe déjà." });
        }
        
        const film = await prisma.film.create({ 
            data: { 
                name: sanitizedName, 
                release_date: release_date.trim(), 
                realId: réalisateur.id 
            } 
        });
        
        res.status(201).json(film);
    } catch (err) {
        console.error("Erreur lors de la création du film:", err);
        if (err.code === 'P2002') {
            return res.status(400).json({ error: "Un film avec ce nom existe déjà." });
        }
        res.status(500).json({ error: "Erreur serveur lors de la création du film." });
    }
}

async function listFilm(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Token manquant ou invalide." });
        }
        
        const { nom } = req.query;
        
        // Sanitisation du paramètre de recherche
        let searchFilter = undefined;
        if (nom !== undefined && nom !== null) {
            if (typeof nom !== "string") {
                return res.status(400).json({ error: "Le paramètre 'nom' doit être une chaîne de caractères." });
            }
            const sanitizedNom = sanitizeString(nom);
            if (sanitizedNom && sanitizedNom.length > 0) {
                searchFilter = { contains: sanitizedNom };
            }
        }
        
        const films = await prisma.film.findMany({
            where: searchFilter ? { name: searchFilter } : undefined,
            take: 1000, // Limite pour éviter les réponses trop volumineuses
        });
        
        res.json(films);
    } catch (err) {
        console.error("Erreur lors de la récupération des films:", err);
        res.status(500).json({ error: "Erreur serveur lors de la récupération des films." });
    }
}

async function getFilm(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Token manquant ou invalide." });
        }
        
        const { id } = req.params;
        
        // Validation de l'ID
        if (!id || !isValidInteger(id)) {
            return res.status(400).json({ error: "ID de film invalide." });
        }
        
        const filmId = Number(id);
        const film = await prisma.film.findUnique({ where: { id: filmId } });
        
        if (!film) {
            return res.status(404).json({ error: "Film non trouvé" });
        }
        
        res.json(film);
    } catch (err) {
        console.error("Erreur lors de la récupération du film:", err);
        res.status(500).json({ error: "Erreur serveur lors de la récupération du film." });
    }
}

async function updateFilm(req, res) {
    try {
        if (!req.user || req.user.role !== "admin") {
            return res.status(403).json({ error: "Accès refusé. Rôle admin requis." });
        }
        
        const { id } = req.params;
        
        // Validation de l'ID
        if (!id || !isValidInteger(id)) {
            return res.status(400).json({ error: "ID de film invalide." });
        }
        
        const { name, release_date, réalisateurName } = req.body || {};
        
        // Vérifier qu'au moins un champ est fourni
        if (!name && !release_date && !réalisateurName) {
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
                return res.status(400).json({ error: "Le nom du film doit contenir entre 1 et 255 caractères." });
            }
            updateData.name = sanitizedName;
        }
        
        if (release_date !== undefined) {
            if (typeof release_date !== "string") {
                return res.status(400).json({ error: "La date de sortie doit être une chaîne de caractères." });
            }
            if (!isValidDate(release_date)) {
                return res.status(400).json({ error: "Date de sortie invalide. Format attendu: YYYY-MM-DD, année entre 1888 et " + (new Date().getFullYear() + 10) + "." });
            }
            updateData.release_date = release_date.trim();
        }
        
        if (réalisateurName !== undefined) {
            if (typeof réalisateurName !== "string") {
                return res.status(400).json({ error: "Le nom du réalisateur doit être une chaîne de caractères." });
            }
            const sanitizedRealisateurName = sanitizeString(réalisateurName);
            if (!sanitizedRealisateurName || sanitizedRealisateurName.length < 1 || sanitizedRealisateurName.length > 255) {
                return res.status(400).json({ error: "Le nom du réalisateur doit contenir entre 1 et 255 caractères." });
            }
            
            const réalisateur = await prisma.réalisateur.findUnique({ where: { name: sanitizedRealisateurName } });
            if (!réalisateur) {
                return res.status(400).json({ error: "Ce réalisateur n'existe pas dans la base de données." });
            }
            updateData.realId = réalisateur.id;
        }
        
        const filmId = Number(id);
        const film = await prisma.film.update({ 
            where: { id: filmId }, 
            data: updateData 
        });
        
        res.json(film);
    } catch (err) {
        console.error("Erreur lors de la mise à jour du film:", err);
        if (err.code === 'P2025') {
            return res.status(404).json({ error: "Film non trouvé" });
        }
        if (err.code === 'P2002') {
            return res.status(400).json({ error: "Un film avec ce nom existe déjà." });
        }
        res.status(500).json({ error: "Erreur serveur lors de la mise à jour du film." });
    }
}

async function deleteFilm(req, res) {
    try {
        if (!req.user || req.user.role !== "admin") {
            return res.status(403).json({ error: "Accès refusé. Rôle admin requis." });
        }
        
        const { id } = req.params;
        
        // Validation de l'ID
        if (!id || !isValidInteger(id)) {
            return res.status(400).json({ error: "ID de film invalide." });
        }
        
        const filmId = Number(id);
        
        // Vérifier si le film existe avant de supprimer les relations
        const film = await prisma.film.findUnique({ where: { id: filmId } });
        if (!film) {
            return res.status(404).json({ error: "Film non trouvé" });
        }
        
        // Supprimer les relations film-acteur d'abord
        await prisma.film_Acteur.deleteMany({ where: { filmId: filmId } });
        
        // Supprimer le film
        await prisma.film.delete({ where: { id: filmId } });
        
        res.status(204).end();
    } catch (err) {
        console.error("Erreur lors de la suppression du film:", err);
        if (err.code === 'P2025') {
            return res.status(404).json({ error: "Film non trouvé" });
        }
        res.status(500).json({ error: "Erreur serveur lors de la suppression du film." });
    }
}

module.exports = { createFilm, listFilm, getFilm, updateFilm, deleteFilm }