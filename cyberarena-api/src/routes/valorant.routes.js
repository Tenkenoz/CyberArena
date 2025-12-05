import express from "express";
import Valorant from "../models/valorant.model.js";
import multer from "multer";
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// --- 1. CONFIGURACIÓN DE CLOUDINARY ---
// Asegúrate de que las variables de entorno estén en tu archivo .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// --- 2. CONFIGURACIÓN DE MULTER (Storage para Valorant) ---
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'cyber-arena/valorant-logos', // Carpeta específica para Valorant
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});

const upload = multer({ storage: storage });

// --- POST: CREAR INSCRIPCIÓN ---
router.post("/inscripcion", upload.single("logoEquipo"), async (req, res) => {
  try {
    // Parsear los datos JSON que vienen como string dentro del FormData
    let bodyData = {};
    if (req.body.datos) {
        try {
            bodyData = JSON.parse(req.body.datos);
        } catch (e) {
            // Si falla el parseo, borramos la imagen si se subió
            if (req.file) await cloudinary.uploader.destroy(req.file.filename);
            return res.status(400).json({ ok: false, msg: "Formato de datos JSON inválido" });
        }
    } else {
        // Fallback por si se envían datos planos
        bodyData = req.body;
    }

    console.log("🔫 Datos Valorant recibidos:", bodyData);

    const { nombreEquipo } = bodyData;

    // Validación: Nombre de equipo único
    if (nombreEquipo) {
        const existe = await Valorant.findOne({ 
            nombreEquipo: { $regex: new RegExp(`^${nombreEquipo}$`, 'i') } 
        });

        if (existe) {
            // Si ya existe, borramos la imagen de Cloudinary
            if (req.file) await cloudinary.uploader.destroy(req.file.filename);
            
            return res.status(400).json({
                ok: false,
                msg: `El nombre de equipo '${nombreEquipo}' ya está ocupado en el torneo de Valorant.`
            });
        }
    }

    // Crear el registro guardando la URL de la imagen
    const nuevoRegistro = new Valorant({
        ...bodyData,
        logoURL: req.file ? req.file.path : null // Guardamos la URL pública de Cloudinary
    });

    await nuevoRegistro.save();

    return res.json({
      ok: true,
      msg: "Equipo de Valorant inscrito correctamente",
      data: nuevoRegistro
    });

  } catch (err) {
    console.error("❌ ERROR VALORANT API:", err);

    // Limpieza de imagen en caso de error
    if (req.file) await cloudinary.uploader.destroy(req.file.filename);

    if (err.code === 11000) {
        return res.status(400).json({
            ok: false,
            msg: "Ya existe un registro con esos datos."
        });
    }

    return res.status(500).json({
      ok: false,
      msg: "Error al guardar la inscripción de Valorant",
      error: err.message
    });
  }
});

// --- GET: OBTENER TODOS ---
router.get("/", async (req, res) => {
  try {
    const equipos = await Valorant.find(); 
    return res.json({ ok: true, data: equipos });
  } catch (err) {
    console.error("❌ Error obteniendo datos Valorant:", err);
    return res.status(500).json({ ok: false, msg: "Error al obtener inscritos de Valorant" });
  }
});

// --- GET: OBTENER UNO ---
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const equipo = await Valorant.findById(id);

    if (!equipo) {
      return res.status(404).json({ ok: false, msg: "Equipo de Valorant no encontrado" });
    }

    return res.json({ ok: true, data: equipo });
  } catch (err) {
    return res.status(500).json({ ok: false, msg: "Error al buscar el equipo" });
  }
});

// --- PUT: ACTUALIZAR ---
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    // Nota: Aquí solo actualizamos datos de texto. Para actualizar imagen requeriría lógica extra.
    const actualizado = await Valorant.findByIdAndUpdate(id, req.body, { new: true });

    if (!actualizado) {
      return res.status(404).json({ ok: false, msg: "Equipo no encontrado para actualizar" });
    }

    return res.json({
      ok: true,
      msg: "Equipo de Valorant actualizado correctamente",
      data: actualizado
    });
  } catch (err) {
    console.error("❌ Error actualizando Valorant:", err);
    return res.status(500).json({ ok: false, msg: "Error al actualizar el equipo" });
  }
});

// --- DELETE: ELIMINAR ---
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const eliminado = await Valorant.findByIdAndDelete(id);

    if (!eliminado) {
      return res.status(404).json({ ok: false, msg: "Equipo no encontrado para eliminar" });
    }

    // Intentar borrar la imagen de Cloudinary si existe
    if (eliminado.logoURL && eliminado.logoURL.includes('cloudinary')) {
        try {
            const urlParts = eliminado.logoURL.split('/');
            const filename = urlParts.pop().split('.')[0];
            const folder = urlParts.pop(); 
            // Construir public_id: "cyber-arena/valorant-logos/archivo"
            const publicId = `cyber-arena/valorant-logos/${filename}`; 
            
            await cloudinary.uploader.destroy(publicId);
            console.log("🗑️ Imagen de Valorant eliminada de Cloudinary");
        } catch (e) {
            console.error("Error borrando imagen Cloudinary:", e);
        }
    }

    return res.json({
      ok: true,
      msg: "Equipo de Valorant eliminado correctamente",
      data: eliminado
    });
  } catch (err) {
    console.error("❌ Error eliminando Valorant:", err);
    return res.status(500).json({ ok: false, msg: "Error al eliminar el equipo" });
  }
});

export default router;