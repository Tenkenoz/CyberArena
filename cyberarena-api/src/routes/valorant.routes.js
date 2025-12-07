import express from "express";
// Mantenemos tu importación tal cual me la pasaste
import Valorant from "../models/valorant.model.js"; 
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
// Usamos memoria para tener control total y poder subir a diferentes carpetas
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
    // 1. Procesar el JSON que viene en el campo 'datos'
    let bodyData = {};
    if (req.body.datos) {
        try {
            bodyData = JSON.parse(req.body.datos);
        } catch (e) {
            return res.status(400).json({ ok: false, msg: "Formato de datos JSON inválido" });
        }
    } else {
        bodyData = req.body;
    }

    console.log("📝 Datos Valorant recibidos:", bodyData.nombreEquipo);

    const { nombreEquipo } = bodyData;

    // 2. Validación: Nombre de equipo único
    if (!nombreEquipo) {
         return res.status(400).json({ ok: false, msg: "El nombre del equipo es obligatorio." });
    }

    const existe = await Valorant.findOne({ 
        nombreEquipo: { $regex: new RegExp(`^${nombreEquipo}$`, 'i') } 
    });

    if (existe) {
        return res.status(400).json({
            ok: false,
            msg: `El nombre de equipo '${nombreEquipo}' ya está ocupado en el torneo de Valorant.`
        });
    }

    // 3. Subida de Archivos
    let logoUrl = null;
    let comprobanteUrl = null;

    // A) Subir Logo del Equipo (si existe) -> Carpeta valorant-logos
    if (req.files && req.files['logoEquipo']) {
        try {
            const file = req.files['logoEquipo'][0];
            logoUrl = await uploadToCloudinary(file.buffer, 'cyber-arena/valorant-logos');
        } catch (error) {
            console.error("Error subiendo logo:", error);
            return res.status(500).json({ ok: false, msg: "Error al subir el logo del equipo" });
        }
    }

    // B) Subir Comprobante de Pago (si existe) -> Carpeta comprobantes/valorant
    if (req.files && req.files['comprobante']) {
        try {
            const file = req.files['comprobante'][0];
            comprobanteUrl = await uploadToCloudinary(file.buffer, 'cyber-arena/comprobantes/valorant');
        } catch (error) {
            console.error("Error subiendo comprobante:", error);
            return res.status(500).json({ ok: false, msg: "Error al subir el comprobante de pago" });
        }
    }

    // 4. Guardar en MongoDB
    const nuevoRegistro = new Valorant({
        ...bodyData,
        logoURL: logoUrl,
        comprobantePago: comprobanteUrl,
        // Convertimos a booleano explícito por seguridad
        pagoRealizado: bodyData.pagoRealizado === true || bodyData.pagoRealizado === 'true'
    });

    await nuevoRegistro.save();

    return res.json({
      ok: true,
      msg: "Equipo de Valorant inscrito correctamente",
      data: nuevoRegistro
    });

  } catch (err) {
    console.error("❌ ERROR VALORANT API:", err);

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
    const equipos = await Valorant.find().sort({ fechaRegistro: -1 }); 
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

    // Opcional: Lógica para borrar imágenes de Cloudinary
    const deleteImage = async (url) => {
        if (url && url.includes('cloudinary')) {
            try {
                // Lógica de borrado (simplificada)
                // const publicId = ...
                // await cloudinary.uploader.destroy(publicId);
            } catch (e) {
                console.error("Error borrando imagen Cloudinary:", e);
            }
        }
    };
    
    deleteImage(eliminado.logoURL);
    deleteImage(eliminado.comprobantePago);

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