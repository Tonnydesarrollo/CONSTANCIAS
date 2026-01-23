import express from "express";
import { obtenerSucursalCompleta } from "../services/sucursal.service.js";
import { obtenerCapacitadores } from "../services/empleados.service.js";
import { obtenerEmpresaPorId } from "../services/empresa.service.js";

const router = express.Router();
async function obtenerLogoEmpresaUrl(logoPath) {
  if (!logoPath) return "";

  const res = await fetch("http://localhost:3000/drive/logo-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ logoPath })
  });

  if (!res.ok) {
    console.warn("No se pudo obtener logo empresa");
    return "";
  }

  const data = await res.json();
  return data.url || "";
}

/**
 * Convierte fechas de AppSheet a formato válido para <input type="date">
 * Soporta:
 * - YYYY-MM-DD
 * - YYYY-MM-DDTHH:mm:ss
 * - DD/MM/YYYY
 */
function normalizarFechaParaInput(fecha) {
  if (!fecha) return "";

  const f = String(fecha).trim();

  // Caso ISO: YYYY-MM-DD o YYYY-MM-DDTHH:mm:ss
  if (/^\d{4}-\d{2}-\d{2}/.test(f)) {
    return f.slice(0, 10);
  }

  // Caso latino: DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(f)) {
    let [d, m, y] = f.split("/").map(Number);

    // 🔐 Corrección segura
    if (m > 12 && d <= 12) {
      // venía como MM/DD/YYYY
      [d, m] = [m, d];
    }

    // Validación final
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    }
  }

  console.warn("⚠️ Fecha no válida:", fecha);
  return "";
}
router.post("/generar", async (req, res) => {
  try {
    console.log("BODY:", req.body);

    const {
      sucursalId,
      capacitadorId,
      fecha,
      participantes
    } = req.body;

    const sucursalData = await obtenerSucursalCompleta(sucursalId);
    const empresaId = sucursalData["ID EMPRESA"];
const empresaData = empresaId
  ? await obtenerEmpresaPorId(empresaId)
  : null;

if (!empresaData) {
  return res.status(404).json({ error: "Empresa no encontrada" });
}

    if (!sucursalData) {
      return res.status(404).json({ error: "Sucursal no encontrada" });
    }

  const logoEmpresaUrl = await obtenerLogoEmpresaUrl(empresaData.LOGO);

const empresa = {
  nombre: empresaData["RAZON SOCIAL"] || empresaData.NOMBRE || "",
  logoUrl: logoEmpresaUrl
};



    const capacitadores = await obtenerCapacitadores();
    const capacitadorData = capacitadores.find(
      c => String(c.ID) === String(capacitadorId)
    );

    if (!capacitadorData) {
      return res.status(404).json({ error: "Capacitador no encontrado" });
    }

    const [y, m, d] = fecha.split("-");
    const meses = [
      "ENERO","FEBRERO","MARZO","ABRIL","MAYO","JUNIO",
      "JULIO","AGOSTO","SEPTIEMBRE","OCTUBRE","NOVIEMBRE","DICIEMBRE"
    ];

    const fechaObj = {
      dia: d,
      mes: meses[Number(m) - 1],
      anio: y
    };
 console.log("RENDER → diplomas_lote.ejs");
   res.render(
  "diplomas_lote",
  {
    empresa,
    sucursalLabel: sucursalData.LABEL,
    logoEmpresa: empresa.logoUrl,
    capacitador: {
      nombre: capacitadorData.NOMBRE,
      firmaUrl: capacitadorData.FIRMA || ""
    },
    fecha: fechaObj,
    participantes
  },
  (err, html) => {
    if (err) {
      console.error("❌ ERROR EJS:", err);
      return res.status(500).send("Error renderizando diplomas");
    }
    res.send(html);
  }
);


  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error generando diplomas" });
  }
});



router.get("/:id/HTML", async (req, res) => {

  try {
    const { id } = req.params;

    // ================= SUCURSAL =================
    const sucursal = await obtenerSucursalCompleta(id);
    if (!sucursal) {
      return res.status(404).json({ error: "Sucursal no encontrada" });
    }
console.log("CLAVES DE SUCURSAL:", Object.keys(sucursal));

    // ================= CAPACITADORES =================
    const capacitadores = await obtenerCapacitadores();

    // Capacitador default desde SUCURSALES.CAPACITADORES
    let capacitadorDefaultId = null;

    if (sucursal.CAPACITADORES) {
      if (Array.isArray(sucursal.CAPACITADORES)) {
        capacitadorDefaultId = sucursal.CAPACITADORES[0];
      } else if (typeof sucursal.CAPACITADORES === "string") {
        capacitadorDefaultId = sucursal.CAPACITADORES
          .split(",")
          .map(v => v.trim())
          .filter(Boolean)[0] || null;
      }
    }

    const capacitadorSeleccionado =
      capacitadorDefaultId
        ? capacitadores.find(c => String(c.ID) === String(capacitadorDefaultId)) || null
        : null;

    // ================= FECHA =================
    // Nombre exacto del campo en AppSheet: "FECHA CAPACITACION"
    const fechaCapRaw = sucursal["FECHA CAPACITACION"] || "";
    const fechaCap = normalizarFechaParaInput(fechaCapRaw);

    // ================= RENDER =================
    
console.log("FECHA NORMALIZADA:", fechaCap);

    res.render("constancia_form", {
      sucursal,
      capacitadores,
      capacitadorSeleccionado,
      fecha: fechaCap
    });

  } catch (err) {
    console.error("ERROR /:id/HTML", err);
    res.status(500).json({ error: "Error interno" });
  }
});

export default router;
