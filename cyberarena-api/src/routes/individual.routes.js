import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
// CORRECCIÓN FINAL: El nombre coincide exactamente con tu captura de pantalla
import { individualSchema } from '../models/individual.model.js'; 

const router = express.Router();

// --- CONFIGURACIÓN DE CLOUDINARY ---
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// --- CONFIGURACIÓN DE MULTER (Memoria) ---
const storage = multer.memoryStorage();
const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 } // Límite de 5MB
});

const VALID_GAMES = ['tft', 'chess', 'clash-royale'];

// Función auxiliar para obtener el Modelo dinámico según el juego
const getGameModel = (gameId) => {
    let collectionName;

    switch (gameId) {
        case 'tft':
            collectionName = 'TFT';
            break;
        case 'chess':
            collectionName = 'Chess';
            break;
        case 'clash-royale':
            collectionName = 'Clash';
            break;
        default:
            throw new Error('Juego no soportado');
    }

    // Usamos el esquema importado para crear/recuperar el modelo
    return mongoose.models[collectionName] || mongoose.model(collectionName, individualSchema, collectionName);
};

// --- CREAR (Inscripción con Imagen) ---
router.post('/:gameId/inscripcion', upload.single('comprobante'), async (req, res) => {
    try {
        const { gameId } = req.params;
        
        console.log(`📝 Recibida inscripción para ${gameId}`);

        if (!VALID_GAMES.includes(gameId)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Juego no válido para inscripción individual.' 
            });
        }

        const { nombre, cedula, telefono, nombreUsuario, participadoTorneo, aceptaReglas, pagoRealizado } = req.body;

        const GameModel = getGameModel(gameId);

        // Validar duplicados
        const existe = await GameModel.findOne({ cedula });
        if (existe) {
            return res.status(400).json({ 
                success: false, 
                message: `La cédula ${cedula} ya está inscrita en ${gameId.toUpperCase()}.` 
            });
        }

        // --- LÓGICA DE SUBIDA DE IMAGEN A CLOUDINARY ---
        let comprobanteUrl = null;

        if (req.file) {
            try {
                // Convertimos el buffer a base64 para subirlo directamente
                const b64 = Buffer.from(req.file.buffer).toString('base64');
                const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
                
                const result = await cloudinary.uploader.upload(dataURI, {
                    folder: `cyber-arena/comprobantes/${gameId}`,
                    resource_type: 'auto'
                });
                
                comprobanteUrl = result.secure_url;
                console.log("✅ Comprobante subido:", comprobanteUrl);
            } catch (uploadError) {
                console.error('Error subiendo imagen a Cloudinary:', uploadError);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Error al subir el comprobante de pago.' 
                });
            }
        }

        // Guardamos en la base de datos
        const nuevaInscripcion = new GameModel({
            gameId,
            nombre,
            cedula,
            telefono,
            nombreUsuario,
            participadoTorneo,
            aceptaReglas: aceptaReglas === 'true' || aceptaReglas === true,
            pagoRealizado: pagoRealizado === 'true' || pagoRealizado === true,
            comprobantePago: comprobanteUrl
        });

        await nuevaInscripcion.save();

        res.status(201).json({
            success: true,
            message: `¡Inscripción a ${gameId.toUpperCase()} exitosa!`,
            data: nuevaInscripcion
        });

    } catch (error) {
        console.error('Error en inscripción individual:', error);
        
        if (error.code === 11000) {
            return res.status(400).json({ 
                success: false, 
                message: 'Ya existe un registro con esta cédula para este torneo.' 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: 'Error del servidor: ' + error.message 
        });
    }
});

// --- LEER TODOS ---
router.get('/:gameId/inscritos', async (req, res) => {
    try {
        const { gameId } = req.params;
        if (!VALID_GAMES.includes(gameId)) return res.status(400).json({ message: 'Juego inválido' });

        const GameModel = getGameModel(gameId);
        const inscritos = await GameModel.find().sort({ fechaRegistro: -1 });
        
        res.json({
            success: true,
            data: inscritos
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener datos' });
    }
});

// --- LEER UNO ---
router.get('/:gameId/inscritos/:id', async (req, res) => {
    try {
        const { gameId, id } = req.params;
        if (!VALID_GAMES.includes(gameId)) return res.status(400).json({ message: 'Juego inválido' });

        const GameModel = getGameModel(gameId);
        const inscrito = await GameModel.findById(id);

        if (!inscrito) {
            return res.status(404).json({ success: false, message: 'Inscripción no encontrada' });
        }

        res.json({
            success: true,
            data: inscrito
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error al buscar inscripción' });
    }
});

// --- MODIFICAR ---
router.put('/:gameId/inscritos/:id', async (req, res) => {
    try {
        const { gameId, id } = req.params;
        if (!VALID_GAMES.includes(gameId)) return res.status(400).json({ message: 'Juego inválido' });

        const GameModel = getGameModel(gameId);
        const actualizado = await GameModel.findByIdAndUpdate(id, req.body, { new: true });

        if (!actualizado) {
            return res.status(404).json({ success: false, message: 'Inscripción no encontrada para actualizar' });
        }

        res.json({
            success: true,
            message: 'Inscripción actualizada correctamente',
            data: actualizado
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error al actualizar inscripción' });
    }
});

// --- ELIMINAR ---
router.delete('/:gameId/inscritos/:id', async (req, res) => {
    try {
        const { gameId, id } = req.params;
        if (!VALID_GAMES.includes(gameId)) return res.status(400).json({ message: 'Juego inválido' });

        const GameModel = getGameModel(gameId);
        const eliminado = await GameModel.findByIdAndDelete(id);

        if (!eliminado) {
            return res.status(404).json({ success: false, message: 'Inscripción no encontrada para eliminar' });
        }

        res.json({
            success: true,
            message: 'Inscripción eliminada correctamente',
            data: eliminado
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error al eliminar inscripción' });
    }
});

export default router;