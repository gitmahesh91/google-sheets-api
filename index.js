const express = require("express");
const cors = require("cors");
const { google } = require("googleapis");

// Use environment variable or fallback to local file (for local dev)
const keys = process.env.GOOGLE_CREDENTIALS
  ? JSON.parse(process.env.GOOGLE_CREDENTIALS)
  : require("./keys.json");

const app = express();
app.use(cors());

const auth = new google.auth.GoogleAuth({
  credentials: keys,
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});

app.get("/sheet-data", async (req, res) => {
  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    const spreadsheetId = "1y8tWyUmdhudmiDf47x38GEA1XGgSwRdsyJTIDnCnvPA";
    const range = "Sheet1!A1:D10";

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    res.json({ data: response.data.values });
  } catch (error) {
    console.error("Error fetching sheet data:", error.response?.data || error.message || error);
    res.status(500).send("Failed to fetch data");
  }
});

// Use port from environment (required by Render), fallback to 3000 locally
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
