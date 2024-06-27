const { Pool } = require("pg")
// Coloca aquí tus credenciales
const pool = new Pool({
  user: "",
  host: "",
  database: "",
  password: "",
  port: 5432,
});
module.exports = pool;
