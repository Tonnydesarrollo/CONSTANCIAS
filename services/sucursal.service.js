import { leerTablaAppSheet } from "./appsheet.js";

export async function obtenerSucursalCompleta(idSucursal) {
  const rows = await leerTablaAppSheet("SUCURSALES");

  return (
    rows.find(r =>
      String(r.ID || r["Row ID"]) === String(idSucursal)
    ) || null
  );
}
