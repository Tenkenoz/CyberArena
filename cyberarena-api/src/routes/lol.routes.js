import express from "express";
// VERIFICA: Si tu archivo se llama "lol.model.js", cambia esto. Si se llama "Lol.js", déjalo así.
import Lol from "../models/lol.model.js"; 
import multer from "multer";
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// --- 1. CONFIGURACIÓN DE CLOUDINARY ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// --- 2. CONFIGURACIÓN DE MULTER (Memoria) ---
// Usamos memoria para poder decidir dinámicamente dónde guardar cada archivo
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// --- FUNCIÓN AUXILIAR PARA SUBIR A CLOUDINARY ---
const uploadToCloudinary = async (fileBuffer, folder) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder: folder, resource_type: 'auto' },
            (error, result) => {
                if (error) reject(error);
                else resolve(result.secure_url);
            }
        );
        uploadStream.end(fileBuffer);
    });
};

// Configuración para recibir DOS archivos distintos
const uploadFields = upload.fields([
    { name: 'logoEquipo', maxCount: 1 }, 
    { name: 'comprobante', maxCount: 1 }
]);

// --- RUTA POST: INSCRIBIR EQUIPO ---
router.post("/inscripcion", uploadFields, async (req, res) => {
  try {
    // 1. Procesar el JSON
    let bodyData = {};
    if (req.body.datos) {
        try {
            bodyData = JSON.parse(req.body.datos);
        } catch (e) {
            return res.status(400).json({ ok: false, msg: "Formato de datos inválido" });
        }
    } else {
        bodyData = req.body;
    }

    console.log("📝 Datos LoL recibidos:", bodyData.nombreEquipo);
    
    // 2. Validaciones
    const { nombreEquipo } = bodyData;
    if (!nombreEquipo) {
         return res.status(400).json({ ok: false, msg: "El nombre del equipo es obligatorio." });
    }

    const existe = await Lol.findOne({ 
        nombreEquipo: { $regex: new RegExp(`^${nombreEquipo}$`, 'i') } 
    });

    if (existe) {
        return res.status(400).json({
            ok: false,
            msg: `El nombre de equipo '${nombreEquipo}' ya está ocupado.`
        });
    }

    // 3. Subida de Archivos
    let logoUrl = null;
    let comprobanteUrl = null;

    // A) Subir Logo (si existe) -> Carpeta lol-logos
    if (req.files && req.files['logoEquipo']) {
        try {
            const file = req.files['logoEquipo'][0];
            logoUrl = await uploadToCloudinary(file.buffer, 'cyber-arena/lol-logos');
        } catch (error) {
            console.error("Error subiendo logo:", error);
            return res.status(500).json({ ok: false, msg: "Error al subir el logo" });
        }
    }

    // B) Subir Comprobante (si existe) -> Carpeta comprobantes/lol
    if (req.files && req.files['comprobante']) {
        try {
            const file = req.files['comprobante'][0];
            comprobanteUrl = await uploadToCloudinary(file.buffer, 'cyber-arena/comprobantes/lol');
        } catch (error) {
            console.error("Error subiendo comprobante:", error);
            return res.status(500).json({ ok: false, msg: "Error al subir el comprobante" });
        }
    }

    // 4. Guardar en MongoDB
    const nuevo = new Lol({
        ...bodyData,
        logoURL: logoUrl, 
        comprobantePago: comprobanteUrl,
        // Convertimos a booleano explícito
        pagoRealizado: bodyData.pagoRealizado === true || bodyData.pagoRealizado === 'true'
    });

    await nuevo.save();
    console.log("✅ Equipo guardado:", nuevo.nombreEquipo);

    return res.json({
      ok: true,
      msg: "Inscripción guardada correctamente",
      data: nuevo
    });

  } catch (err) {
    console.error("❌ ERROR BACKEND LOL:", err);
    if (err.code === 11000) {
        return res.status(400).json({ ok: false, msg: "Datos duplicados." });
    }
    return res.status(500).json({ ok: false, msg: "Error procesando la inscripción", error: err.message });
  }
});

// --- RUTA GET (Leer todos) ---
router.get("/", async (req, res) => {
  try {
    const inscritos = await Lol.find().sort({ fechaRegistro: -1 }); 
    return res.json({ ok: true, data: inscritos });
  } catch (err) {
    return res.status(500).json({ ok: false, msg: "Error al obtener inscritos" });
  }
});

// --- RUTA GET (Leer uno) ---
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

// --- RUTA PUT (Actualizar) ---
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

// --- RUTA DELETE (Eliminar) ---
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const eliminado = await Lol.findByIdAndDelete(id);
    if (!eliminado) return res.status(404).json({ ok: false, msg: "No encontrado" });
    return res.json({ ok: true, msg: "Eliminado", data: eliminado });
  } catch (err) {
    return res.status(500).json({ ok: false, msg: "Error al eliminar" });
  }
});

export default router;