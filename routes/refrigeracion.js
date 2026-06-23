const express = require('express');
const router = express.Router();
const db = require('../db');

router.use(express.json());

router.post('/', async (req, res) => {
    try {
        const {marca, modelo, tipo, alto, tamano_radiador, sockets_compatible} = req.body;

        const consultaSQL =  `
            INSERT INTO refrigeracion (marca, modelo, tipo, alto, tamano_radiador, sockets_compatible)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;
    
    const valores = [marca, modelo, tipo, alto, tamano_radiador, sockets_compatible];

    const respuesta = await db.query(consultaSQL, valores);

    res.status(201).json(respuesta.rows[0]);//todo salió bien, devolvemos la refrigeracion creada
    } catch (error) {
        console.error('Error al crear la refrigeracion:', error);
        res.status(500).send('Error interno: No se pudo guardar la refrigeracion');
    }
})

// Buscar todas las refrigeraciones disponibles (GET)
router.get('/', async (req, res) => {
    try {
        const respuesta = await db.query('SELECT * FROM refrigeracion;');
        res.json(respuesta.rows);
    } catch (error) {
        console.error('Error de conexión:', error);
        res.status(500).send('Error interno: No se pudo conectar a la base de datos');
    }
});

//Actualizar refrigeracion por ID (PUT)
router.put('/:id', async (req, res) => {
    try {
        const idBuscado = req.params.id;
        const {marca, modelo, tipo, alto, tamano_radiador, sockets_compatible} = req.body;
        const consultaSQL = `
            UPDATE refrigeracion
            SET marca = $1,
                modelo = $2,
                tipo = $3,
                alto = $4,
                tamano_radiador = $5,
                sockets_compatible = $6
            WHERE id = $7
            RETURNING *;
        `;
        const valores = [marca, modelo, tipo, alto, tamano_radiador, sockets_compatible, idBuscado];

        const respuesta = await db.query(consultaSQL, valores);

        if (respuesta.rows.length===0) {
            return res.status(404).send('No se encontró ninguna refrigeracion con ese ID para actualizar');
        }
        res.json(respuesta.rows[0]);
    } catch (error) {
        console.error('Error al actualizar refrigeracion:', error);
        res.status(500).send('Error interno: Fallo en la matriz de la base de datos');
    }
});

//Eliminar una refrigeracion por ID (DELETE)
router.delete('/:id', async (req, res) => {
    try {
        const idBuscado = req.params.id;
        const consultaSQL = 'DELETE FROM refrigeracion WHERE id = $1 RETURNING *;';
        const respuesta = await db.query(consultaSQL, [idBuscado]);

        if (respuesta.rows.length === 0) {
            return res.status(404).send('Operación fallida: Esa refrigeracion no existe en el inventario.');
        }
        res.json(respuesta.rows[0]);
    } catch (error) {
        console.error('Error al eliminar refrigeracion:', error);
        res.status(500).send('Error interno: Fallo en la matriz de la base de datos');
    }
});

module.exports = router;