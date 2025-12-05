import express from "express";
import Valorant from "../models/valorant.model.js";

const router = express.Router();

// --- CREAR (Tu código original) ---
router.post("/inscripcion", async (req, res) => {
  try {
    console.log("🔫 Datos Valorant recibidos:", req.body);

    const nuevoRegistro = new Valorant(req.body);
    await nuevoRegistro.save();

    return res.json({
      ok: true,
      msg: "Equipo de Valorant inscrito correctamente",
      data: nuevoRegistro
    });
  } catch (err) {
    console.error("❌ ERROR VALORANT API:", err);
    return res.status(500).json({
      ok: false,
      msg: "Error al guardar la inscripción de Valorant",
      error: err.message
    });
  }
});

// --- LEER (Obtener todos los equipos inscritos) ---
router.get("/", async (req, res) => {
  try {
    const equipos = await Valorant.find(); // .sort({ fechaRegistro: -1 }) si quieres los más recientes primero
    
    return res.json({
      ok: true,
      data: equipos
    });
  } catch (err) {
    console.error("❌ Error obteniendo datos Valorant:", err);
    return res.status(500).json({ ok: false, msg: "Error al obtener inscritos de Valorant" });
  }
});

// --- LEER UNO (Obtener un equipo específico por ID) ---
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const equipo = await Valorant.findById(id);

    if (!equipo) {
      return res.status(404).json({ ok: false, msg: "Equipo de Valorant no encontrado" });
    }

    return res.json({
      ok: true,
      data: equipo
    });
  } catch (err) {
    return res.status(500).json({ ok: false, msg: "Error al buscar el equipo" });
  }
});

// --- MODIFICAR (Actualizar un equipo por ID) ---
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    // { new: true } devuelve el documento actualizado
    const actualizado = await Valorant.findByIdAndUpdate(id, req.body, { new: true });

    if (!actualizado) {
      return res.status(404).json({ ok: false, msg: "Equipo no encontrado para actualizar" });
    }

    return res.json({
      ok: true,
      msg: "Equipo de Valorant actualizado correctamente",
      data: actualizado
    });
  } catch (err) {
    console.error("❌ Error actualizando Valorant:", err);
    return res.status(500).json({ ok: false, msg: "Error al actualizar el equipo" });
  }
});

// --- ELIMINAR (Borrar un equipo por ID) ---
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const eliminado = await Valorant.findByIdAndDelete(id);

    if (!eliminado) {
      return res.status(404).json({ ok: false, msg: "Equipo no encontrado para eliminar" });
    }

    return res.json({
      ok: true,
      msg: "Equipo de Valorant eliminado correctamente",
      data: eliminado
    });
  } catch (err) {
    console.error("❌ Error eliminando Valorant:", err);
    return res.status(500).json({ ok: false, msg: "Error al eliminar el equipo" });
  }
});

export default router;