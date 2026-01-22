import { appsheetRequest } from "./appsheet.js";

export async function obtenerSucursalCompleta(idSucursal) {
  const res = await appsheetRequest({
    table: "SUCURSALES",
    action: "Find",
    data: [{ ID: idSucursal }]
  });

  return res[0];
}
