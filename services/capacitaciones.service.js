import { leerTablaAppSheet } from "./appsheet.js";

export async function getCapacitacionById(id) {
  const rows = await leerTablaAppSheet("CAPACITACIONES");

  return (
    rows.find(r =>
      String(r.ID || r["Row ID"]) === String(id)
    ) || null
  );
}
