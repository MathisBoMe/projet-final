const { Router } = require("express");
const { createFilm, listFilm, getFilm, updateFilm, deleteFilm } = require("../controllers/film.controller.js");
const { verifyToken } = require("../middlewares/user.js");
const { requireRole } = require("../middlewares/roles.js");

const router = Router();

/**
 * @openapi
 * /api/film:
 *   get:
 *     summary: Get tous les films
 *     tags:
 *       - Film
 *     responses:
 *       200:
 *         description: Liste des films
 *   post:
 *     summary: Créer un film
 *     tags:
 *       - Film
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Film créé
 */

router.get("/", verifyToken, requireRole("user"), listFilm);
router.post("/", verifyToken, requireRole("user"), createFilm);

/**
 * @openapi
 * /api/film/{id}:
 *   get:
 *     summary: Récupérer le film par id
 *     tags:
 *       - Film
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Film trouvé
 *       404:
 *         description: Film non trouvé
 *   put:
 *     summary: Mettre à jour le film
 *     tags:
 *       - Film
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
 *         description: Film mis à jour avec succès
 *       404:
 *         description: Film non trouvé
 *   delete:
 *     summary: Supprime film
 *     tags:
 *       - Film
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Film supprimé avec succès
 *       404:
 *         description: Film non trouvé
 */
router.get("/:id", verifyToken, requireRole("user"), getFilm);
router.put("/:id", verifyToken, requireRole("admin"), updateFilm);
router.delete("/:id", verifyToken, requireRole("admin"), deleteFilm);

module.exports = router;