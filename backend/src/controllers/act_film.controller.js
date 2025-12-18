const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient();

async function createActFilm(req, res) {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ error: "Accès refusé. Rôle admin requis." });
    }
    const { filmNom, acteurNom } = req.body;

    if (typeof filmNom != "string" || typeof acteurNom != "string") return res.status(400).json({ error: "Les données entrées doivent être valide." });

    const film = await prisma.film.findUnique({ where: { name: filmNom } });
    if (!film) return res.status(400).json({ error: "Ce film n'existe pas dans la base de données." });
    const filmId = film.id;

    const acteur = await prisma.acteur.findUnique({ where: { name: acteurNom } });
    if (!acteur) return res.status(400).json({ error: "Cet acteur n'existe pas dans la base de données." });
    const acteurId = acteur.id;

    const relation = await prisma.film_Acteur.create({ data: { filmId, acteurId } });
    res.status(201).json(relation);
}

async function listActFilm(req, res) {
    if (!req.user) {
        return res.status(401).json({ error: "Token manquant ou invalide." });
    }
    const relations = await prisma.film_Acteur.findMany();
    res.json(relations);
}

async function getActFilm(req, res) {
    if (!req.user) {
        return res.status(401).json({ error: "Token manquant ou invalide." });
    }
    const { id } = req.params;
    const relation = await prisma.film_Acteur.findUnique({ where: { id: Number(id) } });
    if (!relation) return res.status(404).json({ error: "Relation non trouvé" });
    res.json(relation);
}

async function updateActFilm(req, res) {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ error: "Accès refusé. Rôle admin requis." });
    }
    const { id } = req.params;
    const { filmNom, acteurNom } = req.body;
    if (typeof filmNom != "string" || typeof acteurNom != "string") return res.status(400).json({ error: "Les données entrées doivent être valide." });

    const film = await prisma.film.findUnique({ where: { name: filmNom } });
    if (!film) return res.status(400).json({ error: "Ce film n'existe pas dans la base de données." });
    const filmId = film.id;

    const acteur = await prisma.acteur.findUnique({ where: { name: acteurNom } });
    if (!acteur) return res.status(400).json({ error: "Cet acteur n'existe pas dans la base de données." });
    const acteurId = film.id;

    try {
        const relation = await prisma.film_Acteur.update({ where: { id: Number(id) }, data: { filmId, acteurId } });
        res.json(relation);
    } catch (err) {
        res.status(404).json({ error: "Relation non trouvé" });
    }
}

async function deleteActFilm(req, res) {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ error: "Accès refusé. Rôle admin requis." });
    }
    const { id } = req.params;
    try {
        await prisma.film_Acteur.delete({ where: { id: Number(id) } });
        res.status(204).end();
    } catch {
        res.status(404).json({ error: "Relation non trouvé" })
    }
}

module.exports = { createActFilm, listActFilm, getActFilm, updateActFilm, deleteActFilm }