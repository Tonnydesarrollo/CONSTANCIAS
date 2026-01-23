import dotenvFlow from "dotenv-flow";
dotenvFlow.config(); // ← SIEMPRE PRIMERA LÍNEA

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import constanciasRoutes from "./routes/constancias.js";

// ================= PATHS =================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ================= APP =================
const app = express();

// ================= MIDDLEWARES =================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ================= VIEWS =================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ================= HEALTH =================
app.get("/health", (_, res) => {
  res.json({
    status: "ok",
    service: "api-constancias",
    env: process.env.NODE_ENV || "development"
  });
});

// ================= ROUTES =================
// 👇 TODAS las rutas de constancias viven aquí
// GET  /constancias/:id/HTML
// POST /constancias/generar
app.use("/constancias", constanciasRoutes);

// ================= START =================
const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
  console.log(
    `🚀 api-constancias (${process.env.NODE_ENV || "development"}) en puerto ${PORT}`
  );
});
