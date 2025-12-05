import express from "express";
import Valorant from "../models/valorant.model.js";

const router = express.Router();

router.post("/inscripcion", async (req, res) => {
  try {
    console.log("🔫 Datos Valorant recibidos:", req.body);

    const nuevoRegistro = new Valorant(req.body);
    await nuevoRegistro.save();

    return res.json({
      ok: true,
      msg: "Equipo de Valorant inscrito correctamente"
    });
  } catch (err) {
    console.error("❌ ERROR VALORANT API:", err);

    return res.status(500).json({
      ok: false,
      msg: "Error al guardar la inscripción de Valorant"
    });
  }
});

export default router;