import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import lolRoutes from "./routes/lol.routes.js";
import valorantRoutes from "./routes/valorant.routes.js"; 
import individualRoutes from './routes/individual.routes.js'; 

dotenv.config();

const app = express();

// Configuración básica de CORS (Acepta todo por ahora)
app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/lol", lolRoutes);
app.use("/api/valorant", valorantRoutes);
app.use('/api', individualRoutes); 

// Conexión a Base de Datos
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Atlas conectado a CyberArena ✔"))
  .catch((err) => console.error("Error de conexión:", err));

// --- ESTA ES LA PARTE IMPORTANTE QUE CAMBIÓ ---
// Le decimos: "Usa la variable de entorno PORT. Si no existe, usa el 4000".
const PORT = process.env.PORT || 4000;

app.listen(PORT, () =>
  console.log(`API corriendo en puerto ${PORT}`)
);