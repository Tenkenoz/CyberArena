import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import lolRoutes from "./routes/lol.routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json()); // ← IMPORTANTE

app.use("/api/lol", lolRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Atlas conectado a CyberArena ✔"))
  .catch((err) => console.error("Error de conexión:", err));

app.listen(4000, () =>
  console.log("API corriendo en http://localhost:4000")
);
