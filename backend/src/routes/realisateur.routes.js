const { Router } = require("express");
const { createReal, listReal, getReal, updateReal, deleteReal } = require("../controllers/realisateur.controller.js");
const { verifyToken } = require("../middlewares/user.js");
const { requireRole } = require("../middlewares/roles.js");

const router = Router();

/**
 * @openapi
 * /api/realisateur:
 *   get:
 *     summary: Get tous les réalisateurs
 *     tags:
 *       - Réalisateur
 *     responses:
 *       200:
 *         description: Liste des réalisateurs
 *   post:
 *     summary: Créer un utilisateur
 *     tags:
 *       - Réalisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Réalisateur créé
 */

router.get("/", verifyToken, requireRole("user"), listReal);
router.post("/", verifyToken, requireRole("admin"), createReal);

/**
 * @openapi
 * /api/realisateur/{id}:
 *   get:
 *     summary: Récupérer le réalisateur par id
 *     tags:
 *       - Réalisateur
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Réalisateur trouvé
 *       404:
 *         description: Réalisateur non trouvé
 *   put:
 *     summary: Mettre à jour le réalisateur
 *     tags:
 *       - Réalisateur
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
 *         description: Réalisateur mis à jour avec succès
 *       404:
 *         description: Réalisateur non trouvé
 *   delete:
 *     summary: Supprime réalisateur
 *     tags:
 *       - Réalisateur
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Réalisateur supprimé avec succès
 *       404:
 *         description: Réalisateur non trouvé
 */
router.get("/:id", verifyToken, requireRole("user"), getReal);
router.put("/:id", verifyToken, requireRole("admin"), updateReal);
router.delete("/:id", verifyToken, requireRole("admin"), deleteReal);

// export default router;
module.exports = router;