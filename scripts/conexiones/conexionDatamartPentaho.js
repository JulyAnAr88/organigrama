const { Pool } = require("pg")
// Coloca aquí tus credenciales
const pool = new Pool({
  user: "dashboards",
  host: "pg14olap.santafeciudad.gov.ar",
  database: "datamart",
  password: "L5-9he.2U348",
  port: 5432,
});
module.exports = pool;
