import express from "express";
import Lol from "../models/lol.model.js";

const router = express.Router();

// --- CREAR (Tu código original) ---
router.post("/inscripcion", async (req, res) => {
  try {
    console.log("Datos recibidos:", req.body);

    const nuevo = new Lol(req.body);
    await nuevo.save();

    return res.json({
      ok: true,
      msg: "Inscripción guardada correctamente",
      data: nuevo
    });
  } catch (err) {
    console.error("❌ ERROR EN BACKEND:", err);
    return res.status(500).json({
      ok: false,
      msg: "Error procesando la inscripción",
      error: err.message
    });
  }
});

// --- LEER (Obtener todos los inscritos) ---
router.get("/", async (req, res) => {
  try {
    const inscritos = await Lol.find(); // Puedes agregar .sort({ fecha: -1 }) si quieres orden
    
    return res.json({
      ok: true,
      data: inscritos
    });
  } catch (err) {
    console.error("❌ Error obteniendo datos:", err);
    return res.status(500).json({ ok: false, msg: "Error al obtener inscritos" });
  }
});

// --- LEER UNO (Obtener una inscripción específica por ID) ---
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const inscrito = await Lol.findById(id);

    if (!inscrito) {
      return res.status(404).json({ ok: false, msg: "Inscripción no encontrada" });
    }

    return res.json({
      ok: true,
      data: inscrito
    });
  } catch (err) {
    return res.status(500).json({ ok: false, msg: "Error al buscar inscripción" });
  }
});

// --- MODIFICAR (Actualizar una inscripción por ID) ---
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    // { new: true } devuelve el objeto ya actualizado en lugar del viejo
    const actualizado = await Lol.findByIdAndUpdate(id, req.body, { new: true });

    if (!actualizado) {
      return res.status(404).json({ ok: false, msg: "Inscripción no encontrada para actualizar" });
    }

    return res.json({
      ok: true,
      msg: "Inscripción actualizada correctamente",
      data: actualizado
    });
  } catch (err) {
    console.error("❌ Error actualizando:", err);
    return res.status(500).json({ ok: false, msg: "Error al actualizar inscripción" });
  }
});

// --- ELIMINAR (Borrar una inscripción por ID) ---
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const eliminado = await Lol.findByIdAndDelete(id);

    if (!eliminado) {
      return res.status(404).json({ ok: false, msg: "Inscripción no encontrada para eliminar" });
    }

    return res.json({
      ok: true,
      msg: "Inscripción eliminada correctamente",
      data: eliminado
    });
  } catch (err) {
    console.error("❌ Error eliminando:", err);
    return res.status(500).json({ ok: false, msg: "Error al eliminar inscripción" });
  }
});

export default router;