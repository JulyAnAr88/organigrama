const express = require('express');
const router = express.Router();
const fs = require('fs');

const dependenciasModel = require("../models/dependencias");

const fecha = null;

router.post('/actualizar', async function (req, res, next) {
    let URLJson='public/json/organigrama.json'
    
    const { fechaActual } = req.body;
    
    if (!fechaActual) {
        return res.status(500).send("Fecha incorrecta");
    }

    const json = await dependenciasModel
        .crearJSON(fechaActual)
        .catch(err => {
            return res.status(500).send("Error creando JSON");
        });
    

    const yeison = JSON.stringify(json);

    fs.writeFileSync(URLJson, yeison, 'utf-8');

    res.redirect('/graph')

});

module.exports = router;