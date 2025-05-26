const express = require("express");
const cors = require("cors");
const { google } = require("googleapis");
//const swaggerUi = require("swagger-ui-express");
//const swaggerJsdoc = require("swagger-jsdoc");

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

// Swagger setup
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Google Sheets API for Copilot",
      version: "1.0.0",
      description: "Fetches data from a Google Sheet for use in Copilot Studio",
    },
    servers: [
      {
        url: "https://google-sheets-api-xkwq.onrender.com", // <-- Replace with your actual Render URL
      },
    ],
  },
  apis: ["./index.js"],
};

const swaggerSpec = swaggerJsdoc(options);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/openapi.json", (req, res) => res.json(swaggerSpec));

/**
 * @openapi
 * /sheet-data:
 *   get:
 *     summary: Get data from Google Sheets
 *     responses:
 *       200:
 *         description: A list of rows from the Google Sheet
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: array
 *                     items:
 *                       type: string
 */
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
    console.error(
      "Error fetching sheet data:",
      error.response?.data || error.message || error
    );
    res.status(500).send("Failed to fetch data");
  }
});

// Use port from environment (required by Render), fallback to 3000 locally
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
