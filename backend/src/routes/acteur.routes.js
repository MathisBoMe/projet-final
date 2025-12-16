const { Router } = require("express");
const { createActeur, listActeur, getActeur, updateActeur, deleteActeur } = require("../controllers/acteur.controller.js");
const { verifyToken } = require("../middlewares/user.js");
const { requireRole } = require("../middlewares/roles.js");

const router = Router();

/**
 * @openapi
 * /api/acteur:
 *   get:
 *     summary: Get tous les acteurs
 *     tags:
 *       - Acteur
 *     responses:
 *       200:
 *         description: Liste des acteurs
 *   post:
 *     summary: Créer un acteur
 *     tags:
 *       - Acteur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Acteur créé
 */

router.get("/", verifyToken, requireRole("user"), listActeur);
router.post("/", verifyToken, requireRole("admin"), createActeur);

/**
 * @openapi
 * /api/acteur/{id}:
 *   get:
 *     summary: Récupérer le acteur par id
 *     tags:
 *       - Acteur
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Acteur trouvé
 *       404:
 *         description: Acteur non trouvé
 *   put:
 *     summary: Mettre à jour le acteur
 *     tags:
 *       - Acteur
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
 *         description: Acteur mis à jour avec succès
 *       404:
 *         description: Acteur non trouvé
 *   delete:
 *     summary: Supprime acteur
 *     tags:
 *       - Acteur
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Acteur supprimé avec succès
 *       404:
 *         description: Acteur non trouvé
 */
router.get("/:id", verifyToken, requireRole("user"), getActeur);
router.put("/:id", verifyToken, requireRole("admin"), updateActeur);
router.delete("/:id", verifyToken, requireRole("admin"), deleteActeur);

module.exports = router;