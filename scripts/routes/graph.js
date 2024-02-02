const express = require('express');
const router = express.Router();
const fs = require('fs');

const dependenciasModel = require("../models/dependencias");
const graphModel = require("../models/graph");

//Recupero categorias para armar los botones de filtro
router.get('/', function (req, res, next) {

    dependenciasModel
        .obtenerCategorias()
        .then(dependencias => {
            res.render("graph/verGraph", {
                dependencias: dependencias,
                jsonURL: '/json/organigrama.json'
            });
        })
        .catch(err => {
            return res.status(500).send("Error obteniendo dependencia");
        });

});


//Filtrar por categoría
router.post('/filtrar', async function (req, res, next) {

    var jsonURL = '/json/organigramaFiltrado.json'

    const categorias = req.body;

    if (!categorias) {
        return res.status(500).send("Sin filtro");
    }

    //debugger
    const jsonFiltrado = await dependenciasModel
        .filtrarJSON(categorias)
        .catch(err => {
            return res.status(500).send("Error filtrando JSON");
        });

    const yeison = JSON.stringify(jsonFiltrado);

    fs.writeFileSync('public' + jsonURL, yeison, 'utf-8');
    
    dependenciasModel
        .obtenerCategorias()
        .then(dependencias => {
            res.render("graph/verGraph", {
                dependencias: dependencias,
                jsonURL: jsonURL
            });
        })
        .catch(err => {
            return res.status(500).send("Error obteniendo dependencias");
        });
});

module.exports = router;