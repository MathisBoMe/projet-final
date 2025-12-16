const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const { swaggerSpec } = require("./swagger.js");
const rateLimit = require("express-rate-limit");
const userRouter = require("./routes/userRoutes.js");
const realisateurRouter = require("./routes/realisateur.routes.js");
const filmRouter = require("./routes/film.routes.js");
const acteurRouter = require("./routes/acteur.routes.js");
const relationRouter = require("./routes/act_film.routes.js");

const app = express();

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    allowedHeaders: ["Authorization", "Content-Type"]
}));
app.use(express.json());
app.use(rateLimit({ windowMs: 60_000, max: 100 }));
app.use("/auth/login", rateLimit({ windowMs: 15*60_000, max: 10 }));

app.get("/", (req, res) => res.json({ message: "API OK" }));
app.get("/pinte", (req, res) => res.json("Picole moins, Milo."));
app.use("/api/user", userRouter);
app.use("/api/realisateur", realisateurRouter);
app.use("/api/film", filmRouter);
app.use("/api/acteur", acteurRouter);
app.use("/api/relation", relationRouter);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

module.exports = app;