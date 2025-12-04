import express from "express";
import Lol from "../models/lol.model.js";

const router = express.Router();

router.post("/inscripcion", async (req, res) => {
  try {
    console.log("Datos recibidos:", req.body);

    const nuevo = new Lol(req.body);
    await nuevo.save();

    return res.json({
      ok: true,
      msg: "Inscripción guardada correctamente"
    });
  } catch (err) {
    console.error("❌ ERROR EN BACKEND:", err);

    return res.status(500).json({
      ok: false,
      msg: "Error procesando la inscripción"
    });
  }
});

export default router;
