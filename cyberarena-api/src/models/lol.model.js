import mongoose from "mongoose";

const playerSchema = new mongoose.Schema({
  nombre: String,
  rol: String,
  cedula: String,
  nombreInvocador: String
});

const lolSchema = new mongoose.Schema(
  {
    nombreEquipo: String,
    regionServidor: String,
    logoURL: String, // Link de Cloudinary del logo del equipo
    
    // Datos del Capitán/Líder
    capitan: String,
    rolLider: String, 
    numeroContacto: String,
    nombreInvocadorTeam: String, 

    jugadores: [playerSchema], // Los otros 4 jugadores
    suplente: playerSchema,
    coach: playerSchema,

    participadoTorneo: String,
    aceptaReglas: Boolean,

    // --- NUEVOS CAMPOS DE PAGO ---
    pagoRealizado: {
        type: Boolean,
        default: false
    },
    comprobantePago: {
        type: String, // Link de Cloudinary del comprobante
        default: null
    },
    
    fechaRegistro: {
        type: Date,
        default: Date.now
    }
  },
  {
    collection: "Lol"
  }
);

export default mongoose.model("Lol", lolSchema);