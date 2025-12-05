import mongoose from "mongoose";

// Esquema para jugadores (Sin rol, ya que tu form de Valorant no lo pide)
const valoPlayerSchema = new mongoose.Schema({
  nombre: String,
  cedula: String,
  riotId: String // En Valorant se usa Riot ID en vez de Nombre de Invocador
});

const valorantSchema = new mongoose.Schema(
  {
    nombreEquipo: String,
    regionServidor: String,
    logoURL: String, // Guardaremos el nombre del archivo
    capitan: String,
    nombreJugador: String, // Campo extra que tienes en el form
    numeroContacto: String,
    riotIdMain: String, // El Riot ID del capitán o contacto principal

    jugadores: [valoPlayerSchema], // Array de 4 jugadores
    suplente: valoPlayerSchema,
    coach: valoPlayerSchema,

    participadoTorneo: String,
    aceptaReglas: Boolean
  },
  {
    collection: "Valorant" // Nombre de la colección en MongoDB
  }
);

export default mongoose.model("Valorant", valorantSchema);