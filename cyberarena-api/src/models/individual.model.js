import mongoose from 'mongoose';

const individualSchema = new mongoose.Schema({
    gameId: {
        type: String,
        required: true,
        enum: ['tft', 'chess', 'clash-royale'],
        trim: true
    },
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    cedula: {
        type: String,
        required: true,
        trim: true
    },
    telefono: {
        type: String,
        required: true,
        trim: true
    },
    nombreUsuario: {
        type: String,
        required: true,
        trim: true
    },
    participadoTorneo: {
        type: String,
        default: 'no'
    },
    aceptaReglas: {
        type: Boolean,
        required: true
    },
    fechaRegistro: {
        type: Date,
        default: Date.now
    }
});

individualSchema.index({ cedula: 1, gameId: 1 }, { unique: true });

// CAMBIO IMPORTANTE: Exportamos el Schema, no el modelo compilado.
export { individualSchema };