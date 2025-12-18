/**
 * Validation des variables d'environnement au démarrage
 * Assure que toutes les variables critiques sont présentes et valides
 */

function validateEnvironment() {
    const requiredVars = [
        'JWT_SECRET',
        'MONGO_URI',
        'DATABASE_URL'
    ];

    const missingVars = [];
    const invalidVars = [];

    // Vérifier la présence des variables requises
    requiredVars.forEach(varName => {
        if (!process.env[varName]) {
            missingVars.push(varName);
        }
    });

    // Validation spécifique de JWT_SECRET
    if (process.env.JWT_SECRET) {
        if (process.env.JWT_SECRET.length < 32) {
            invalidVars.push({
                name: 'JWT_SECRET',
                reason: 'Doit contenir au moins 32 caractères pour la sécurité'
            });
        }
        if (process.env.JWT_SECRET === 'votre_secret_jwt_tres_long_et_aleatoire_ici_changez_le_en_production') {
            invalidVars.push({
                name: 'JWT_SECRET',
                reason: 'Valeur par défaut détectée - doit être changée en production'
            });
        }
    }

    // Validation de NODE_ENV
    const validEnvs = ['development', 'production', 'test'];
    if (process.env.NODE_ENV && !validEnvs.includes(process.env.NODE_ENV)) {
        invalidVars.push({
            name: 'NODE_ENV',
            reason: `Doit être l'un des suivants: ${validEnvs.join(', ')}`
        });
    }

    // Afficher les erreurs si nécessaire
    if (missingVars.length > 0 || invalidVars.length > 0) {
        console.error('❌ ERREUR: Variables d\'environnement invalides ou manquantes\n');
        
        if (missingVars.length > 0) {
            console.error('Variables manquantes:');
            missingVars.forEach(v => console.error(`  - ${v}`));
            console.error('');
        }

        if (invalidVars.length > 0) {
            console.error('Variables invalides:');
            invalidVars.forEach(v => {
                console.error(`  - ${v.name}: ${v.reason}`);
            });
            console.error('');
        }

        console.error('Veuillez créer un fichier .env avec les variables requises.');
        console.error('Consultez .env.example pour un exemple.\n');
        
        process.exit(1);
    }

    // Avertissements pour la production
    if (process.env.NODE_ENV === 'production') {
        if (!process.env.ALLOWED_ORIGINS) {
            console.warn('⚠️  AVERTISSEMENT: ALLOWED_ORIGINS non défini en production');
        }
        if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 64) {
            console.warn('⚠️  AVERTISSEMENT: JWT_SECRET devrait contenir au moins 64 caractères en production');
        }
    }

    console.log('✅ Variables d\'environnement validées avec succès');
}

module.exports = { validateEnvironment };
