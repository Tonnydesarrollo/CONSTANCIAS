import { leerTablaAppSheet } from "./appsheet.js";

export async function obtenerEmpresaPorId(idEmpresa) {
  const rows = await leerTablaAppSheet("EMPRESAS");

  return (
    rows.find(
      e => String(e.ID || e["Row ID"]) === String(idEmpresa)
    ) || null
  );
}
