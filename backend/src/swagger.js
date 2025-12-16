const swaggerJsdoc = require("swagger-jsdoc");

const swaggerSpec = swaggerJsdoc({
    definition: {
        openapi: "3.0.0",
        info: {
            title: "TP Express + Prisma",
            version: "1.0.0"
        }
    },
    apis: ["./src/routes/*.js"]
});

module.exports = { swaggerSpec };