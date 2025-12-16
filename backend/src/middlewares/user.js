const jwt = require("jsonwebtoken");

async function verifyToken(req, res, next) {
    const header = req.headers.authorization;
    if (!header) {
        return res.status(401).json({ error: "Token manquant" });
    }

    const token = header.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "devsecret");
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: "Token invalide" });
    }
}

module.exports = { verifyToken };