const mongoose = require("mongoose");

async function connectMongo() {
    try {
        const uri = process.env.MONGO_URI || "mongodb://localhost:27017/cinema_projet_api";
        await mongoose.connect(uri);
        console.log("MongoDB connecté");
    } catch (error) {
        console.error("Erreur de connexion MongoDB:", error.message);
        throw error;
    }
}

module.exports = { connectMongo };
