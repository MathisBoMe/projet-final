const mongoose = require("mongoose");

async function connectMongo() {
    try {
        const uri = process.env.MONGO_URI;
        await mongoose.connect(uri);
        console.log("MongoDB connecté");
    } catch (error) {
        console.error("Erreur de connexion MongoDB:", error.message);
        throw error;
    }
}

module.exports = { connectMongo };
