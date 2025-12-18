/**
 * Module utilitaire pour la validation et la sanitisation
 * Évite la duplication de code entre les contrôleurs
 */

const mongoose = require("mongoose");

/**
 * Sanitise une chaîne de caractères
 * @param {string} str - Chaîne à sanitiser
 * @returns {string|null} - Chaîne sanitizée ou null si invalide
 */
function sanitizeString(str) {
    if (typeof str !== "string") return null;
    return str.trim().slice(0, 255);
}

/**
 * Valide le format d'un email
 * @param {string} email - Email à valider
 * @returns {boolean} - True si valide
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]{1,40}@[^\s@]{1,40}\.[^\s@]{1,40}$/;
    return emailRegex.test(email);
}

/**
 * Sanitise un email
 * @param {string} email - Email à sanitiser
 * @returns {string|null} - Email sanitizé ou null si invalide
 */
function sanitizeEmail(email) {
    if (typeof email !== "string") return null;
    return email.trim().toLowerCase().slice(0, 255);
}

/**
 * Valide un ObjectId MongoDB
 * @param {string} id - ID à valider
 * @returns {boolean} - True si valide
 */
function isValidObjectId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}

/**
 * Valide un mot de passe
 * @param {string} password - Mot de passe à valider
 * @returns {boolean} - True si valide
 */
function validatePassword(password) {
    if (typeof password !== "string") return false;
    if (password.length < 6) return false;
    if (password.length > 128) return false;
    return true;
}

/**
 * Valide une date avec une plage raisonnable
 * @param {string} dateStr - Date à valider
 * @returns {boolean} - True si valide
 */
function isValidDate(dateStr) {
    if (typeof dateStr !== "string") return false;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return false;
    
    const minYear = 1888;
    const maxYear = new Date().getFullYear() + 10;
    const year = date.getFullYear();
    
    return year >= minYear && year <= maxYear;
}

/**
 * Valide un entier
 * @param {number|string} id - ID à valider
 * @returns {boolean} - True si valide
 */
function isValidInteger(id) {
    if (typeof id === "number") {
        return Number.isInteger(id) && id > 0 && id <= Number.MAX_SAFE_INTEGER;
    }
    if (typeof id === "string") {
        const num = Number(id);
        return !isNaN(num) && Number.isInteger(num) && num > 0 && num <= Number.MAX_SAFE_INTEGER;
    }
    return false;
}

/**
 * Valide un âge
 * @param {number|string} age - Âge à valider
 * @returns {boolean} - True si valide
 */
function isValidAge(age) {
    if (typeof age === "number") {
        return Number.isInteger(age) && age >= 0 && age <= 150;
    }
    if (typeof age === "string") {
        const num = Number(age);
        return !isNaN(num) && Number.isInteger(num) && num >= 0 && num <= 150;
    }
    return false;
}

module.exports = {
    sanitizeString,
    isValidEmail,
    sanitizeEmail,
    isValidObjectId,
    validatePassword,
    isValidDate,
    isValidInteger,
    isValidAge
};
