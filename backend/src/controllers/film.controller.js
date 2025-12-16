const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient();

async function createFilm(req, res) {
    if (!req.user) {
        return res.status(401).json({ error: "Token manquant ou invalide." });
    }
    const { name, release_date, réalisateurName } = req.body;

    if (typeof name != "string" || !isValidDate(release_date) || typeof réalisateurName != "string") return res.status(400).json({ error: "Les données entrées doivent être valide." });

    const réalisateur = await prisma.réalisateur.findUnique({ where: { name: réalisateurName } });
    if (!réalisateur) return res.status(400).json({ error: "Ce réalisateur n'existe pas dans la base de données." });
    const realId = réalisateur.id;

    const film = await prisma.film.create({ data: { name, release_date, realId } });
    res.status(201).json(film);
}

async function listFilm(req, res) {
    if (!req.user) {
        return res.status(401).json({ error: "Token manquant ou invalide." });
    }
    const { nom } = req.query;
    const films = await prisma.film.findMany({
        where: {
            name: {
                contains: nom != null ? nom : undefined
            }
        }
    });
    res.json(films);
}

async function getFilm(req, res) {
    if (!req.user) {
        return res.status(401).json({ error: "Token manquant ou invalide." });
    }
    const { id } = req.params;
    const film = await prisma.film.findUnique({ where: { id: Number(id) } });
    if (!film) return res.status(404).json({ error: "Film non trouvé" });
    res.json(film);
}

async function updateFilm(req, res) {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ error: "Accès refusé. Rôle admin requis." });
    }
    const { id } = req.params;
    const { name, release_date, réalisateurName } = req.body;

    if (typeof name != "string" || !isValidDate(release_date) || typeof réalisateurName != "string") return res.status(400).json({ error: "Les données entrées doivent être valide." });

    const réalisateur = await prisma.réalisateur.findUnique({ where: { name: réalisateurName } });
    if (!réalisateur) return res.status(400).json({ error: "Ce réalisateur n'existe pas dans la base de données." });
    const realId = réalisateur.id;

    try {
        const film = await prisma.film.update({ where: { id: Number(id) }, data: { name, release_date, realId } });
        res.json(film);
    } catch (err) {
        res.status(404).json({ error: "Film non trouvé" });
    }
}

async function deleteFilm(req, res) {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ error: "Accès refusé. Rôle admin requis." });
    }
    const { id } = req.params;
    try {
        if (prisma.film_Acteur.findMany({ where: { filmId: Number(id) } })) {
            await prisma.film_Acteur.deleteMany({ where: { filmId: Number(id) } });
        }
        await prisma.film.delete({ where: { id: Number(id) } });
        res.status(204).end();
    } catch {
        res.status(404).json({ error: "Film non trouvé" })
    }
}

module.exports = { createFilm, listFilm, getFilm, updateFilm, deleteFilm }

function isValidDate(dateStr) {
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
}