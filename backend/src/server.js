require("dotenv").config();
const { validateEnvironment } = require("./config/validateEnv.js");
const app = require("./app.js");
const { connectMongo } = require("./config/db.mongo.js");

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        // Valider les variables d'environnement avant de démarrer
        validateEnvironment();
        
        await connectMongo();
        app.listen(PORT, () => {
            console.log(`✅ Server running on http://localhost:${PORT}/`);
            console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    } catch (error) {
        console.error("❌ Erreur au démarrage du serveur:", error);
        process.exit(1);
    }
}

startServer();