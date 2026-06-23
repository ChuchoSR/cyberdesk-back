const express = require('express');
const router = express.Router();
const db = require('../db');

router.use(express.json());

router.post('/', async (req, res) => {
    try {
        const {marca, modelo, potencia_watts, certificacion, formato, modular} = req.body;

        const consultaSQL =  `
            INSERT INTO fuentes_poder (marca, modelo, potencia_watts, certificacion, formato, modular)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;
    
    const valores = [marca, modelo, potencia_watts, certificacion, formato, modular];

    const respuesta = await db.query(consultaSQL, valores);

    res.status(201).json(respuesta.rows[0]);//todo salió bien, devolvemos la nueva fuente de poder creada
    } catch (error) {
        console.error('Error al crear fuente de poder:', error);
        res.status(500).send('Error interno: No se pudo guardar la fuente de poder');
    }
})

//Buscar todas las fuentes de poder disponibles (GET)
router.get('/', async (req, res) => {
    try {
        const respuesta = await db.query('SELECT * FROM fuentes_poder;');
        res.json(respuesta.rows);
    } catch (error) {
        console.error('Error de conexión:', error);
        res.status(500).send('Error interno: No se pudo conectar a la base de datos');
    }
});

//Actualizar fuente de poder por ID (PUT)
router.put('/:id', async (req, res) => {
    try {
        const idBuscado = req.params.id;
        const {marca, modelo, potencia_watts, certificacion, formato, modular} = req.body;
        const consultaSQL = `
            UPDATE fuentes_poder
            SET marca = $1,
                modelo = $2,
                potencia_watts = $3,
                certificacion = $4,
                formato = $5,
                modular = $6
            WHERE id = $7
            RETURNING *;
        `;
        const valores = [marca, modelo, potencia_watts, certificacion, formato, modular, idBuscado];

        const respuesta = await db.query(consultaSQL, valores);

        if (respuesta.rows.length===0) {
            return res.status(404).send('No se encontró ninguna fuente de poder con ese ID para actualizar');
        }
        res.json(respuesta.rows[0]);
    } catch (error) {
        console.error('Error al actualizar fuente de poder:', error);
        res.status(500).send('Error interno: Fallo en la matriz de la base de datos');
    }
});

// Eliminar una fuente de poder por ID (DELETE)
router.delete('/:id', async (req, res) => {
    try {
        const idBuscado = req.params.id;
        const consultaSQL = 'DELETE FROM fuentes_poder WHERE id = $1 RETURNING *;';
        const respuesta = await db.query(consultaSQL, [idBuscado]);

        if (respuesta.rows.length === 0) {
            return res.status(404).send('Operación fallida: Esa fuente de poder no existe en el inventario.');
        }
        res.json(respuesta.rows[0]);
    } catch (error) {
        console.error('Error al eliminar fuente de poder:', error);
        res.status(500).send('Error interno: Fallo en la matriz de la base de datos');
    }
});

module.exports = router;