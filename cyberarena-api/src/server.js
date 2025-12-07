import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import lolRoutes from "./routes/lol.routes.js";
import valorantRoutes from "./routes/valorant.routes.js"; 
import individualRoutes from './routes/individual.routes.js'; 

dotenv.config();

const app = express();

// --- 1. CONFIGURACIÓN CORS ROBUSTA ---
// Esto permite peticiones desde tu frontend en Vercel
app.use(cors({
    origin: true, // Permite cualquier origen dinámicamente
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// Habilitar "Preflight" (OPTIONS) explícitamente para todas las rutas
app.options('*', cors());

app.use(express.json());

// --- 2. MIDDLEWARE DE CONEXIÓN A BASE DE DATOS (CRÍTICO) ---
// Este middleware obliga a la API a esperar a tener conexión antes de procesar NADA.
const connectDB = async (req, res, next) => {
  try {
    // Si ya estamos conectados (estado 1), pasamos
    if (mongoose.connection.readyState === 1) {
      return next();
    }
    
    console.log("🔄 Estableciendo conexión a MongoDB...");
    
    // Si no estamos conectados, esperamos a que termine de conectar
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // No esperar más de 5s
      socketTimeoutMS: 45000,
    });
    
    console.log("✅ MongoDB Conectado");
    next();
  } catch (error) {
    console.error("❌ Error CRÍTICO de conexión MongoDB:", error);
    // Devolvemos un error JSON controlado en lugar de dejar que la petición muera
    return res.status(500).json({ 
        ok: false, 
        msg: "Error de conexión con la base de datos. Por favor intenta de nuevo." 
    });
  }
};

// Aplicamos el middleware de conexión a TODAS las rutas
app.use(connectDB);

// Rutas de la API
app.use("/api/lol", lolRoutes);
app.use("/api/valorant", valorantRoutes);
app.use('/api', individualRoutes); 

// Ruta de diagnóstico
app.get('/', (req, res) => {
    res.send(`API Online 🟢 - DB Estado: ${mongoose.connection.readyState}`);
});

const PORT = process.env.PORT || 4000;

// Solo escuchamos el puerto si NO estamos en Vercel (Vercel maneja esto internamente)
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`Servidor local corriendo en puerto ${PORT}`));
}

export default app;