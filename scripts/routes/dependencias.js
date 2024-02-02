const express = require('express');
const dependencias = require('../models/dependencias');
const router = express.Router();

const dependenciasModel = require("../models/dependencias");

var textoprueba = '<div class="filtros-radios d-grid gap-2"> <h4>Layout</h4></div>'

router.get('/', function (req, res, next) {

    dependenciasModel
        .obtenerCategorias()
        .then(dependencias => {
            res.render("dependencias/ver", {
                dependencias: dependencias,
            });
        })
        .catch(err => {
            return res.status(500).send("Error obteniendo relaciones");
        });

    /*  
         res.set('Content-Type', 'text/html')
    res.render("dependencias/ver" ,
        { test: textoprueba });

    dependenciasModel
        .obtenerCategorias("2023-02-01")
        .then(dependencias => {
            res.render("dependencias/ver", {
                dependencias: dependencias,
                '<button class="btn btn-primary"><%= dependencias.categorie %></button>'
            });
        })
        .catch(err => {
            return res.status(500).send("Error obteniendo relaciones");
        });*/
});

module.exports = router;
