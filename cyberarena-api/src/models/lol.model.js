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
    capitan: String,
    numeroContacto: String,

    jugadores: [playerSchema],
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
