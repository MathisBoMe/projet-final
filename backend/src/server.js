require("dotenv/config");
const app = require("./app.js");
const { connectMongo } = require("./config/db.mongo.js");
const https = require("https");
const fs = require("fs");

const PORT = process.env.PORT;
const KEYPATH = process.env.KEYPATH;
const CERTPATH = process.env.CERTPATH;

async function startServer() {
    try {
        await connectMongo();
        // app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}/`));
        https.createServer({
            key: fs.readFileSync(KEYPATH),
            cert: fs.readFileSync(CERTPATH)
        }, app).listen(PORT, () => console.log(`Server running on https://localhost:${PORT}/`));
    } catch (error) {
        console.error("Erreur au démarrage du serveur:", error);
        process.exit(1);
    }
}

startServer();