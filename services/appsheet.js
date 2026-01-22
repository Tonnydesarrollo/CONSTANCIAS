import axios from "axios";

const BASE_URL = "https://api.appsheet.com/api/v2/apps";

export async function appsheetRequest({ table, action, data = {} }) {
  const url = `${BASE_URL}/${process.env.APPSHEET_APP_ID}/tables/${table}/Action`;

  const body = {
    Action: action,
    Properties: {},
    Rows: data
  };

  const headers = {
    "ApplicationAccessKey": process.env.APPSHEET_API_KEY
  };

  const { data: response } = await axios.post(url, body, { headers });
  return response;
}
