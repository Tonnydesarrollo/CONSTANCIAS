export async function obtenerEmpleadosCapacitadores() {
  const res = await appsheetRequest({
    table: "EMPLEADOS",
    action: "Find",
    data: [{ CAPACITA: "Y" }]
  });

  return res;
}
