export async function leerTablaAppSheet(nombreTabla, bodyOverride = null) {
  const APP_ID  = process.env.APPSHEET_APP_ID;
  const API_KEY = process.env.APPSHEET_API_KEY;

  if (!APP_ID || !API_KEY) {
    throw new Error("❌ Variables de entorno AppSheet no disponibles");
  }

  const url =
    `https://api.appsheet.com/api/v2/apps/${APP_ID}/tables/${encodeURIComponent(nombreTabla)}/Action`;

  const body = bodyOverride || {
    Action: "Find",
    Properties: {
      Locale: "es-MX",
      Timezone: "Central Standard Time",
      UserSettings: {}
    },
    Rows: []
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      ApplicationAccessKey: API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const text = await res.text();
  if (!text) return [];

  const data = JSON.parse(text);
  return Array.isArray(data) ? data : (data.Rows || []);
}
