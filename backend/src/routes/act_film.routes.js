const { Router } = require("express");
const { createActFilm, listActFilm, getActFilm, updateActFilm, deleteActFilm } = require("../controllers/act_film.controller.js");
const { verifyToken } = require("../middlewares/user.js");
const { requireRole } = require("../middlewares/roles.js");

const router = Router();

/**
 * @openapi
 * /api/act_film:
 *   get:
 *     summary: Get toutes les relations
 *     tags:
 *       - Relation
 *     responses:
 *       200:
 *         description: Liste des relations
 *   post:
 *     summary: Créer un relation
 *     tags:
 *       - Relation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Relation créé
 */

router.get("/", verifyToken, requireRole("user"), listActFilm);
router.post("/", verifyToken, requireRole("admin"), createActFilm);

/**
 * @openapi
 * /api/relation/{id}:
 *   get:
 *     summary: Récupérer la relation par id
 *     tags:
 *       - Relation
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Relation trouvée
 *       404:
 *         description: Relation non trouvée
 *   put:
 *     summary: Mettre à jour la relation
 *     tags:
 *       - Relation
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Relation mise à jour avec succès
 *       404:
 *         description: Relation non trouvée
 *   delete:
 *     summary: Supprime la relation
 *     tags:
 *       - Relation
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Relation supprimée avec succès
 *       404:
 *         description: Relation non trouvée
 */
router.get("/:id", verifyToken, requireRole("user"), getActFilm);
router.put("/:id", verifyToken, requireRole("admin"), updateActFilm);
router.delete("/:id", verifyToken, requireRole("admin"), deleteActFilm);

module.exports = router;