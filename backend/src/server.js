require("dotenv").config();
const { validateEnvironment } = require("./config/validateEnv.js");
const app = require("./app.js");
const { connectMongo } = require("./config/db.mongo.js");
const https = require("https");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        // Valider les variables d'environnement avant de démarrer
        validateEnvironment();
        
        await connectMongo();
        
        // Support HTTPS si les certificats sont disponibles, sinon HTTP
        const keyPath = process.env.KEYPATH || path.resolve(__dirname, "../../security/server.key");
        const certPath = process.env.CERTPATH || path.resolve(__dirname, "../../security/server.cert");
        const hasCertificates = fs.existsSync(keyPath) && fs.existsSync(certPath);
        
        if (hasCertificates) {
            https.createServer({
                key: fs.readFileSync(keyPath),
                cert: fs.readFileSync(certPath)
            }, app).listen(PORT, () => {
                console.log(`✅ Server running on https://localhost:${PORT}/`);
                console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
            });
        } else {
            app.listen(PORT, () => {
                console.log(`✅ Server running on http://localhost:${PORT}/`);
                console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
            });
        }
    } catch (error) {
        console.error("❌ Erreur au démarrage du serveur:", error);
        process.exit(1);
    }
}

startServer();