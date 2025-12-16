const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function createActeur(req, res) {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ error: "Accès refusé. Rôle admin requis." });
    }
    const { name, age, nationality } = req.body;
    if (typeof name != "string" || typeof age != "number" || typeof nationality != "string") return res.status(400).json({ error: "Les données entrées doivent être valide." });
    const acteur = await prisma.acteur.create({ data: { name, age, nationality } });
    res.status(201).json(acteur);
}

async function listActeur(req, res) {
    if (!req.user) {
        return res.status(401).json({ error: "Token manquant ou invalide." });
    }
    const { nom, nat, minAge, maxAge } = req.query;
    const acteurs = await prisma.acteur.findMany({
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
    res.json(acteurs);
}

async function getActeur(req, res) {
    if (!req.user) {
        return res.status(401).json({ error: "Token manquant ou invalide." });
    }
    const { id } = req.params;
    const acteur = await prisma.acteur.findUnique({ where: { id: Number(id) } });
    if (!acteur) return res.status(404).json({ error: "Acteur non trouvé" });
    res.json(acteur);
}

async function updateActeur(req, res) {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ error: "Accès refusé. Rôle admin requis." });
    }
    const { id } = req.params;
    const { name, age, nationality } = req.body;
    if (typeof name != "string" || typeof age != "number" || typeof nationality != "string") return res.status(400).json({ error: "Les données entrées doivent être valide." });
    try {
        const acteur = await prisma.acteur.update({ where: { id: Number(id) }, data: { name, age, nationality } });
        res.json(acteur);
    } catch (err) {
        res.status(404).json({ error: "Acteur non trouvé" });
    }
}

async function deleteActeur(req, res) {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ error: "Accès refusé. Rôle admin requis." });
    }
    const { id } = req.params;
    try {
        if (prisma.film_Acteur.findMany({ where: { acteurId: Number(id) } })) {
            await prisma.film_Acteur.deleteMany({ where: { acteurId: Number(id) } });
        }
        await prisma.acteur.delete({ where: { id: Number(id) } });
        res.status(204).end();
    } catch {
        res.status(404).json({ error: "Acteur non trouvé" })
    }
}

module.exports = { createActeur, listActeur, getActeur, updateActeur, deleteActeur }