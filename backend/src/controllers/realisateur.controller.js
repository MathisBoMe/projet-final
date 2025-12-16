const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient();

async function createReal(req, res) {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ error: "Accès refusé. Rôle admin requis." });
    }
    const { name, age, nationality } = req.body;
    if (typeof name != "string" || typeof age != "number" || typeof nationality != "string") return res.status(400).json({ error: "Les données entrées doivent être valide." });
    const réalisateur = await prisma.réalisateur.create({ data: { name, age, nationality } });
    res.status(201).json(réalisateur);
}

async function listReal(req, res) {
    if (!req.user) {
        return res.status(401).json({ error: "Token manquant ou invalide." });
    }
    const { nom, nat, minAge, maxAge } = req.query;
    const réalisateurs = await prisma.réalisateur.findMany({
        where: {
            name: {
                contains: nom != null ? nom : undefined
            },
            age: {
                gt: minAge != null ? Number(minAge) : undefined,
                lt: maxAge != null ? Number(maxAge) : undefined
            },
            nationality: {
                contains: nat != null ? nat : undefined
            }
        }
    });
    res.json(réalisateurs);
}

async function getReal(req, res) {
    if (!req.user) {
        return res.status(401).json({ error: "Token manquant ou invalide." });
    }
    const { id } = req.params;
    const réalisateur = await prisma.réalisateur.findUnique({ where: { id: Number(id) } });
    if (!réalisateur) return res.status(404).json({ error: "Réalisateur non trouvé" });
    res.json(réalisateur);
}

async function updateReal(req, res) {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ error: "Accès refusé. Rôle admin requis." });
    }
    const { id } = req.params;
    const { name, age, nationality } = req.body;
    if (typeof name != "string" || typeof age != "number" || typeof nationality != "string") return res.status(400).json({ error: "Les données entrées doivent être valide." });
    try {
        const réalisateur = await prisma.réalisateur.update({ where: { id: Number(id) }, data: { name, age, nationality } });
        res.json(réalisateur);
    } catch (err) {
        res.status(404).json({ error: "Réalisateur non trouvé" });
    }
}

async function deleteReal(req, res) {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ error: "Accès refusé. Rôle admin requis." });
    }
    const { id } = req.params;
    try {
        const films = await prisma.film.findMany({ where: { realId: Number(id) } });
        const filmId = [];
        films.forEach(film => {
            filmId.push(film.id);
        });
        await prisma.film_Acteur.deleteMany({ where: { filmId: { in: filmId } } });
        await prisma.film.deleteMany({ where: { realId: Number(id) } });
        await prisma.réalisateur.delete({ where: { id: Number(id) } });
        res.status(204).end();
    } catch {
        res.status(404).json({ error: "Réalisateur non trouvé" })
    }
}

module.exports = { createReal, listReal, getReal, updateReal, deleteReal }