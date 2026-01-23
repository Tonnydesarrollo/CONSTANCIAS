import { leerTablaAppSheet } from "./appsheet.js";

export async function obtenerCapacitadores() {
  const rows = await leerTablaAppSheet("EMPLEADOS");

  return rows
    .filter(e => String(e.CAPACITA).toUpperCase() === "Y")
    .map(e => ({
      ID: e.ID || e["Row ID"],
      NOMBRE: e.NOMBRE || "",
      FIRMA: e.FIRMA || ""
    }));
}
