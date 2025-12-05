import express from 'express';
import mongoose from 'mongoose';
// Importamos solo el esquema, no el modelo
import { individualSchema } from '../models/individual.model.js'; 

const router = express.Router();

const VALID_GAMES = ['tft', 'chess', 'clash-royale'];

// Función auxiliar para obtener el Modelo dinámico según el juego
const getGameModel = (gameId) => {
    let collectionName;

    // Mapeamos el ID de la URL al nombre exacto de la colección que quieres en Mongo
    switch (gameId) {
        case 'tft':
            collectionName = 'TFT';
            break;
        case 'chess':
            collectionName = 'Chess';
            break;
        case 'clash-royale':
            collectionName = 'Clash'; // Según tu imagen se llama 'Clash'
            break;
        default:
            throw new Error('Juego no soportado');
    }

    // Revisamos si el modelo ya existe para no recompilarlo, si no, lo creamos.
    // Pasamos collectionName como tercer argumento para forzar el nombre exacto (sin plurales)
    return mongoose.models[collectionName] || mongoose.model(collectionName, individualSchema, collectionName);
};

// --- CREAR (Inscripción) ---
router.post('/:gameId/inscripcion', async (req, res) => {
    try {
        const { gameId } = req.params;
        const { nombre, cedula, telefono, nombreUsuario, participadoTorneo, aceptaReglas } = req.body;

        if (!VALID_GAMES.includes(gameId)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Juego no válido para inscripción individual.' 
            });
        }

        // 1. Obtenemos el modelo específico para este juego
        const GameModel = getGameModel(gameId);

        // 2. Buscamos si ya existe en ESA colección específica
        const existe = await GameModel.findOne({ cedula });
        
        if (existe) {
            return res.status(400).json({ 
                success: false, 
                message: `La cédula ${cedula} ya está inscrita en ${gameId.toUpperCase()}.` 
            });
        }

        // 3. Guardamos en la colección específica
        const nuevaInscripcion = new GameModel({
            gameId,
            nombre,
            cedula,
            telefono,
            nombreUsuario,
            participadoTorneo,
            aceptaReglas
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
            message: 'Error del servidor.' 
        });
    }
});

// --- LEER TODOS (Obtener lista de inscritos por juego) ---
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

// --- LEER UNO (Obtener una inscripción específica por ID) ---
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

// --- MODIFICAR (Actualizar inscripción por ID) ---
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

// --- ELIMINAR (Borrar inscripción por ID) ---
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