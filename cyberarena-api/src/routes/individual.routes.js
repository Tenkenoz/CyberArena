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
    // CORRECCIÓN: Pasamos collectionName también como TERCER argumento.
    // Esto fuerza a Mongoose a usar ese nombre exacto en la BD y no pluralizarlo (evita "chesses", "tfts").
    return mongoose.models[collectionName] || mongoose.model(collectionName, individualSchema, collectionName);
};

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

        // 1. Obtenemos el modelo específico para este juego (Ej: Modelo 'TFT')
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

router.get('/:gameId/inscritos', async (req, res) => {
    try {
        const { gameId } = req.params;
        if (!VALID_GAMES.includes(gameId)) return res.status(400).json({ message: 'Juego inválido' });

        // Obtenemos el modelo dinámico para buscar en la colección correcta
        const GameModel = getGameModel(gameId);

        const inscritos = await GameModel.find().sort({ fechaRegistro: -1 });
        res.json(inscritos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener datos' });
    }
});

export default router;