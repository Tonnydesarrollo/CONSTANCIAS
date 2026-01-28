import express from "express";
import { obtenerSucursalCompleta } from "../services/sucursal.service.js";
import { obtenerCapacitadores } from "../services/empleados.service.js";
import { obtenerEmpresaPorId } from "../services/empresa.service.js";
import { getCapacitacionById } from "../services/capacitaciones.service.js";
import {
  mapaMunicipios,
  mapaEstados
} from "../services/ubicacion.service.js";

const router = express.Router();

/* ======================================================
   LOGO EMPRESA
====================================================== */
async function obtenerLogoEmpresaUrl(logoPath) {
  if (!logoPath) return "";

  if (logoPath.startsWith("http")) {
    return logoPath;
  }

  const baseUrl = process.env.DRIVE_API_BASE;
  if (!baseUrl) {
    console.error("❌ DRIVE_API_BASE no definido");
    return "";
  }

  try {
    const res = await fetch(`${baseUrl}/drive/logo-url`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ logoPath })
    });

    if (!res.ok) {
      console.warn("⚠️ Drive error:", res.status);
      return "";
    }

    const data = await res.json();
    return data?.url || "";

  } catch (e) {
    console.error("❌ Error llamando Drive:", e.message);
    return "";
  }
}

/* ======================================================
   FECHA
====================================================== */
function normalizarFechaParaInput(fecha) {
  if (!fecha) return "";

  const f = String(fecha).trim();

  if (/^\d{4}-\d{2}-\d{2}/.test(f)) {
    return f.slice(0, 10);
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(f)) {
    let [d, m, y] = f.split("/").map(Number);
    if (m > 12 && d <= 12) [d, m] = [m, d];

    return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }

  return "";
}

function normalizarEnumList(valor) {
  if (!valor) return [];
  if (Array.isArray(valor)) return valor.map(v => String(v).trim()).filter(Boolean);
  return String(valor)
    .split(",")
    .map(v => v.trim())
    .filter(Boolean);
}

function obtenerDriveLink(driveData) {
  if (!driveData) return "";

  if (typeof driveData === "string") {
    const trimmed = driveData.trim();
    if (!trimmed) return "";
    if (trimmed.startsWith("{")) {
      try {
        const parsed = JSON.parse(trimmed);
        return parsed.Url || parsed.url || "";
      } catch (e) {
        return "";
      }
    }
    return trimmed;
  }

  if (typeof driveData === "object") {
    return driveData.Url || driveData.url || "";
  }

  return "";
}

function obtenerValorPorClaves(obj, claves) {
  if (!obj) return undefined;

  for (const clave of claves) {
    if (obj[clave] !== undefined && obj[clave] !== null) {
      return obj[clave];
    }
  }

  return undefined;
}

/* ======================================================
   POST /generar
====================================================== */
router.post("/generar", async (req, res) => {
  try {
    const { sucursalId, capacitadorId, fecha, participantes } = req.body;

    /* ================= SUCURSAL ================= */
    const sucursalData = await obtenerSucursalCompleta(sucursalId);
    if (!sucursalData) {
      return res.status(404).json({ error: "Sucursal no encontrada" });
    }

    /* ================= MAPAS ================= */
    const municipiosMap = await mapaMunicipios();
    const estadosMap = await mapaEstados();

    const municipio =
      municipiosMap[String(sucursalData.MUNICIPIO)]?.nombre || "";

    const estado =
      estadosMap[String(sucursalData.ESTADO)]?.nombre || "";

    /* ================= EMPRESA ================= */
    const empresaId = sucursalData["ID EMPRESA"];
    const empresaData = empresaId
      ? await obtenerEmpresaPorId(empresaId)
      : null;

    if (!empresaData) {
      return res.status(404).json({ error: "Empresa no encontrada" });
    }

    const logoEmpresaUrl = await obtenerLogoEmpresaUrl(empresaData.LOGO);

    /* ================= CAPACITADOR ================= */
    const capacitadores = await obtenerCapacitadores();
    const capacitadorData = capacitadores.find(
      c => String(c.ID) === String(capacitadorId)
    );

    if (!capacitadorData) {
      return res.status(404).json({ error: "Capacitador no encontrado" });
    }

    /* ================= FECHA ================= */
    const [y, m, d] = fecha.split("-");
    const meses = [
      "ENERO","FEBRERO","MARZO","ABRIL","MAYO","JUNIO",
      "JULIO","AGOSTO","SEPTIEMBRE","OCTUBRE","NOVIEMBRE","DICIEMBRE"
    ];

    /* ================= RENDER ================= */
    res.render("diplomas_lote", {
      empresa: {
        nombre: empresaData["RAZON SOCIAL"] || empresaData.NOMBRE || "",
        logoUrl: logoEmpresaUrl
      },
      sucursalLabel: sucursalData.LABEL2,
      logoEmpresa: logoEmpresaUrl,
      capacitador: {
        nombre: capacitadorData.NOMBRE,
        firmaUrl: capacitadorData.FIRMA || ""
      },
      fecha: {
        dia: d,
        mes: meses[Number(m) - 1],
        anio: y
      },
      participantes,
      ubicacion: {
        municipio,
        estado
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error generando diplomas" });
  }
});

/* ======================================================
   GET /:id/HTML
====================================================== */
router.get("/:id/HTML", async (req, res) => {
  try {
    const sucursal = await obtenerSucursalCompleta(req.params.id);
    if (!sucursal) {
      return res.status(404).json({ error: "Sucursal no encontrada" });
    }

    const capacitadores = await obtenerCapacitadores();
    const fechaCap = normalizarFechaParaInput(
      sucursal["FECHA CAPACITACION"]
    );

    res.render("constancia_form", {
      sucursal,
      capacitadores,
      fecha: fechaCap
    });

  } catch (err) {
    console.error("ERROR /:id/HTML", err);
    res.status(500).json({ error: "Error interno" });
  }
});

/* ======================================================
   GET /capacitaciones/:id/HTML
====================================================== */
router.get("/capacitaciones/:id/HTML", async (req, res) => {
  try {
    const capacitacion = await getCapacitacionById(req.params.id);
    if (!capacitacion) {
      return res.status(404).json({ error: "Capacitación no encontrada" });
    }

    const sucursalesRaw = obtenerValorPorClaves(capacitacion, [
      "sucursales",
      "SUCURSALES",
      "Sucursales",
      "SUCURSAL",
      "Sucursal",
      "IDS SUCURSALES",
      "IDs Sucursales",
      "ID SUCURSAL"
    ]);
    const sucursalIds = normalizarEnumList(sucursalesRaw);
    const sucursalesData = await Promise.all(
      sucursalIds.map(id => obtenerSucursalCompleta(id))
    );

    const sucursales = sucursalesData
      .filter(Boolean)
      .map(sucursal => ({
        id: sucursal.ID,
        label: sucursal.LABEL2 || sucursal.LABEL || "",
        driveLink: obtenerDriveLink(sucursal.DRIVE || "")
      }));

    if (!sucursales.length) {
      return res.status(404).json({ error: "Sucursales no encontradas" });
    }

    const capacitadores = await obtenerCapacitadores();
    const fechaCapRaw = obtenerValorPorClaves(capacitacion, [
      "fechaCapacitacion",
      "FECHA CAPACITACION",
      "Fecha Capacitacion",
      "FECHA",
      "Fecha"
    ]);
    const fechaCap = normalizarFechaParaInput(fechaCapRaw);

    res.render("constancia_form_capacitacion", {
      capacitacion,
      sucursales,
      fecha: fechaCap,
      capacitadores
    });
  } catch (err) {
    console.error("ERROR /capacitaciones/:id/HTML", err);
    res.status(500).json({ error: "Error interno" });
  }
});

export default router;