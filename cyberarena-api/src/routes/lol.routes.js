import express from "express";
import Lol from "../models/lol.model.js";
import multer from "multer";
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// --- 1. CONFIGURACIÓN DE CLOUDINARY ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// --- 2. CONFIGURACIÓN DE MULTER (Storage) ---
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'cyber-arena/lol-logos', // Carpeta en Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    // transformation: [{ width: 500, height: 500, crop: 'limit' }] // Opcional: Redimensionar
  },
});

const upload = multer({ storage: storage });

// --- RUTA POST: INSCRIBIR EQUIPO ---
// 'logoEquipo' debe coincidir con el nombre del campo en el FormData del frontend
router.post("/inscripcion", upload.single("logoEquipo"), async (req, res) => {
  try {
    // IMPORTANTE: Al enviar archivos, los datos de texto (JSON) vienen como string 
    // dentro de un campo (usualmente lo llamamos 'datos') o desglosados.
    // Aquí asumimos que el frontend envía un campo 'datos' con el JSON stringified.
    
    let bodyData = {};
    if (req.body.datos) {
        try {
            bodyData = JSON.parse(req.body.datos);
        } catch (e) {
            // Si el JSON falla, borramos la imagen subida para no dejar basura
            if (req.file) await cloudinary.uploader.destroy(req.file.filename);
            return res.status(400).json({ ok: false, msg: "Formato de datos inválido" });
        }
    } else {
        // Fallback por si envías los campos sueltos (Postman sin JSON stringify)
        bodyData = req.body;
    }

    console.log("📝 Datos recibidos:", bodyData);
    
    // 1. Validar nombre de equipo único
    const { nombreEquipo } = bodyData;

    if (!nombreEquipo) {
         if (req.file) await cloudinary.uploader.destroy(req.file.filename);
         return res.status(400).json({ ok: false, msg: "El nombre del equipo es obligatorio." });
    }

    const existe = await Lol.findOne({ 
        nombreEquipo: { $regex: new RegExp(`^${nombreEquipo}$`, 'i') } 
    });

    if (existe) {
        // SI EXISTE: Borramos la imagen que se acaba de subir a Cloudinary
        if (req.file) {
            await cloudinary.uploader.destroy(req.file.filename);
            console.log("🗑️ Imagen borrada de Cloudinary por duplicidad.");
        }

        return res.status(400).json({
            ok: false,
            msg: `El nombre de equipo '${nombreEquipo}' ya está ocupado. Por favor elige otro.`
        });
    }

    // 2. Guardar en MongoDB
    // req.file.path contiene la URL pública de la imagen en Cloudinary
    const nuevo = new Lol({
        ...bodyData,
        logoURL: req.file ? req.file.path : null 
    });

    await nuevo.save();
    console.log("✅ Equipo guardado con logo:", nuevo.logoURL);

    return res.json({
      ok: true,
      msg: "Inscripción guardada correctamente",
      data: nuevo
    });

  } catch (err) {
    console.error("❌ ERROR BACKEND:", err);

    // Limpieza en caso de error crítico
    if (req.file) await cloudinary.uploader.destroy(req.file.filename);
    
    if (err.code === 11000) {
        return res.status(400).json({ ok: false, msg: "Datos duplicados en la base de datos." });
    }

    return res.status(500).json({ 
        ok: false, 
        msg: "Error procesando la inscripción", 
        error: err.message 
    });
  }
});

// --- GET (Leer todos) ---
router.get("/", async (req, res) => {
  try {
    const inscritos = await Lol.find(); 
    return res.json({ ok: true, data: inscritos });
  } catch (err) {
    return res.status(500).json({ ok: false, msg: "Error al obtener inscritos" });
  }
});

// --- GET (Leer uno) ---
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const inscrito = await Lol.findById(id);
    if (!inscrito) return res.status(404).json({ ok: false, msg: "No encontrado" });
    return res.json({ ok: true, data: inscrito });
  } catch (err) {
    return res.status(500).json({ ok: false, msg: "Error al buscar" });
  }
});
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const actualizado = await Lol.findByIdAndUpdate(id, req.body, { new: true });
    if (!actualizado) return res.status(404).json({ ok: false, msg: "No encontrado" });
    return res.json({ ok: true, msg: "Actualizado", data: actualizado });
  } catch (err) {
    return res.status(500).json({ ok: false, msg: "Error al actualizar" });
  }
});

// --- DELETE (Eliminar) ---
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const eliminado = await Lol.findByIdAndDelete(id);

    if (!eliminado) {
      return res.status(404).json({ ok: false, msg: "No encontrado para eliminar" });
    }

    // Opcional: Intentar borrar la imagen de Cloudinary
    // Se requiere extraer el public_id de la URL
    if (eliminado.logoURL && eliminado.logoURL.includes('cloudinary')) {
        try {
            const urlParts = eliminado.logoURL.split('/');
            // Obtener las últimas partes para reconstruir el public_id (carpeta/archivo)
            const filename = urlParts.pop().split('.')[0]; // nombre sin extensión
            const folder = urlParts.pop(); // carpeta
            const publicId = `${folder}/${filename}`;
            
            await cloudinary.uploader.destroy(publicId);
            console.log("🗑️ Imagen eliminada de Cloudinary:", publicId);
        } catch (e) {
            console.error("Error al borrar imagen de Cloudinary:", e);
        }
    }

    return res.json({
      ok: true,
      msg: "Inscripción eliminada correctamente",
      data: eliminado
    });
  } catch (err) {
    return res.status(500).json({ ok: false, msg: "Error al eliminar" });
  }
});

export default router;