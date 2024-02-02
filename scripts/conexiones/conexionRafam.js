const { Pool } = require("pg")
// Coloca aquí tus credenciales
const pool = new Pool({
  user: "jaragon",
  host: "10.20.0.65",
  database: "personal",
  password: "Rocio-01-Alma",
  port: 5432,
});
module.exports = pool;
