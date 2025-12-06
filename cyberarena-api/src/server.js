import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
// Ajusta las rutas según donde estén tus archivos realmente
import lolRoutes from "./routes/lol.routes.js";
import valorantRoutes from "./routes/valorant.routes.js"; 
import individualRoutes from './routes/individual.routes.js'; 

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Tus rutas
app.use("/api/lol", lolRoutes);
app.use("/api/valorant", valorantRoutes);
app.use('/api', individualRoutes); 

// Ruta de prueba (IMPORTANTE para saber si funciona)
app.get('/', (req, res) => {
    res.send('API CyberArena funcionando desde src/server.js 🚀');
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB conectado"))
  .catch((err) => console.error(err));

const PORT = process.env.PORT || 4000;

app.listen(PORT, () =>
  console.log(`Server corriendo en puerto ${PORT}`)
);

// ¡ESTO ES LO QUE HACE QUE FUNCIONE EN VERCEL!
export default app;