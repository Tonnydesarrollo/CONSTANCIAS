/**
 * Servicio de Capacitaciones
 * Tabla: capacitaciones (AppSheet)
 */

import { leerTablaAppSheet } from "./appsheet.js";

/**
 * Obtener capacitación por ID
 * @param {string} id
 * @returns {Promise<Object|null>}
 */
export async function getCapacitacionById(id) {
  if (!id) {
    throw new Error("ID de capacitación es requerido");
  }

  const body = {
    Action: "Find",
    Properties: {
      Locale: "es-MX",
      Timezone: "America/Mexico_City",
      Selector: `[ID] = '${id}'`
    }
  };

  const response = await leerTablaAppSheet("capacitaciones", body);

  if (!response || response.length === 0) {
    return null;
  }

  return normalizarCapacitacion(response[0]);
}

/**
 * Obtener todas las capacitaciones
 * @returns {Promise<Array>}
 */
export async function getCapacitaciones() {
  const body = {
    Action: "Find",
    Properties: {
      Locale: "es-MX",
      Timezone: "America/Mexico_City"
    }
  };

  const response = await leerTablaAppSheet("capacitaciones", body);
  return response.map(normalizarCapacitacion);
}

/**
 * Obtener capacitaciones por sucursal
 * @param {string} sucursal
 * @returns {Promise<Array>}
 */
export async function getCapacitacionesBySucursal(sucursal) {
  if (!sucursal) {
    throw new Error("SUCURSALES es requerido");
  }

  const body = {
    Action: "Find",
    Properties: {
      Locale: "es-MX",
      Timezone: "America/Mexico_City",
      Selector: `[SUCURSALES] = '${sucursal}'`
    }
  };

  const response = await leerTablaAppSheet("capacitaciones", body);
  return response.map(normalizarCapacitacion);
}

/**
 * Obtener capacitaciones por status
 * @param {string} status
 * @returns {Promise<Array>}
 */
export async function getCapacitacionesByStatus(status) {
  if (!status) {
    throw new Error("STATUS es requerido");
  }

  const body = {
    Action: "Find",
    Properties: {
      Locale: "es-MX",
      Timezone: "America/Mexico_City",
      Selector: `[STATUS] = '${status}'`
    }
  };

  const response = await leerTablaAppSheet("capacitaciones", body);
  return response.map(normalizarCapacitacion);
}

/**
 * Normaliza datos de AppSheet
 */
function normalizarCapacitacion(row) {
  return {
    id: row.ID,
    sucursales: row.SUCURSALES,
    status: row.STATUS,
    fechaCapacitacion: row["FECHA CAPACITACION"],
    cede: row.CEDE,
    capacitadores: row.CAPACITADORES,
    horaInicio: row["HORA INICIO"],
    horaFin: row["HORA FIN"],
    diplomas: row.DIPLOMAS,
    notas: row.NOTAS
  };
}
