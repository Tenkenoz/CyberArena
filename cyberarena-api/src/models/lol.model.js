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
    logoURL: String,
    
    // Datos del Capitán/Líder
    capitan: String,
    rolLider: String, // <--- NUEVO CAMPO AGREGADO
    numeroContacto: String,
    nombreInvocadorTeam: String, // Asegúrate de que coincida con el frontend (allí usas nombreInvocadorTeam en el payload)

    jugadores: [playerSchema], // Los otros 4 jugadores
    suplente: playerSchema,
    coach: playerSchema,

    participadoTorneo: String,
    aceptaReglas: Boolean
  },
  {
    collection: "Lol"
  }
);

export default mongoose.model("Lol", lolSchema);