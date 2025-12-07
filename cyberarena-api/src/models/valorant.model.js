import mongoose from "mongoose";

// Esquema para jugadores (Sin rol, ya que Valorant usa Agentes que se eligen en partida)
const valoPlayerSchema = new mongoose.Schema({
  nombre: String,
  cedula: String,
  riotId: String // En Valorant se usa Riot ID (Nombre#TAG)
});

const valorantSchema = new mongoose.Schema(
  {
    nombreEquipo: {
        type: String,
        required: true,
        trim: true
    },
    regionServidor: String,
    
    // Aquí se guardará la URL segura de Cloudinary
    logoURL: String, 
    
    capitan: String,
    nombreJugador: String, // El nombre/alias del capitán
    numeroContacto: String,
    riotIdMain: String, // El Riot ID principal de contacto

    // Arrays y Objetos anidados
    jugadores: [valoPlayerSchema], // Los 4 titulares adicionales
    suplente: valoPlayerSchema,    // Opcional
    coach: valoPlayerSchema,       // Opcional

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
    collection: "Valorant" // Nombre exacto de la colección en Mongo
  }
);

export default mongoose.model("Valorant", valorantSchema);