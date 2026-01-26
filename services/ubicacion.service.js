import { leerTablaAppSheet } from "./appsheet.js";

export async function mapaMunicipios() {
  const rows = await leerTablaAppSheet("MUNICIPIOS");
  const map = {};

  rows.forEach(r => {
    map[String(r.ID)] = {
      nombre: r.NOMBRE || ""
    };
  });

  return map;
}

export async function mapaEstados() {
  const rows = await leerTablaAppSheet("ESTADOS");
  const map = {};

  rows.forEach(r => {
    map[String(r.ID)] = {
      nombre: r.NOMBRE || ""
    };
  });

  return map;
}
