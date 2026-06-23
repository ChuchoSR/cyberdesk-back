const express = require('express');
const router = express.Router();
const db = require('../db');

router.use(express.json());

router.post('/', async (req, res) => {
    try {
        const {marca, modelo, memoria_vram, tipo_memoria, consumo_watts, longitud, conectores_energia} = req.body;
        const consultaSQL = `
            INSERT INTO tarjetas_video (marca, modelo, memoria_vram, tipo_memoria, consumo_watts, longitud, conectores_energia)
            VALUES ($1, $2, $3, $4, $5, $6, $7) 
            RETURNING *;
            `;

        const valores = [marca, modelo, memoria_vram, tipo_memoria, consumo_watts, longitud, conectores_energia];
        
        const respuesta = await db.query(consultaSQL, valores);

        res.status(201).json(respuesta.rows[0]);
        } catch (error) {
        console.error('Error al crear tarjeta de video:', error);
        res.status(500).send('Error interno: No se pudo guardar la tarjeta de video');
    }
});

// Buscar todas las tarjetas de video disponibles (GET)
router.get('/', async (req, res) => {
    try {
        const respuesta = await db.query('SELECT * FROM tarjetas_video;');
        res.json(respuesta.rows);
    } catch (error) {
        console.error('Error de conexión:', error);
        res.status(500).send('Error interno: No se pudo conectar a la base de datos');
    }
});

//Actualizar tarjeta de video por ID (PUT)
router.put('/:id', async (req, res) => {
    try {
        const idBuscado = req.params.id;
        const {marca, modelo, memoria_vram, tipo_memoria, consumo_watts, longitud, conectores_energia} = req.body;
        const consultaSQL = `
            UPDATE tarjetas_video
            SET marca = $1,
                modelo = $2,
                memoria_vram = $3,
                tipo_memoria = $4,
                consumo_watts = $5,
                longitud = $6,
                conectores_energia = $7
            WHERE id = $8
            RETURNING *;
        `;
        const valores = [marca, modelo, memoria_vram, tipo_memoria, consumo_watts, longitud, conectores_energia, idBuscado];
        
        const respuesta = await db.query(consultaSQL, valores);

        if (respuesta.rows.length===0) {
            return res.status(404).send('No se encontró ninguna tarjeta de video con ese ID para actualizar');
        }
        res.json(respuesta.rows[0]);
    } catch (error) {
        console.error('Error al actualizar tarjeta de video:', error);
        res.status(500).send('Error interno: Fallo en la matriz de la base de datos');
    }
});

// Eliminar una tarjeta de video por ID (DELETE)
router.delete('/:id', async (req, res) => {
    try {
        const idBuscado = req.params.id;
        const consultaSQL = 'DELETE FROM tarjetas_video WHERE id = $1 RETURNING *;';
        const respuesta = await db.query(consultaSQL, [idBuscado]);

        if (respuesta.rows.length===0) {
            return res.status(404).send('No se encontró ninguna tarjeta de video con ese ID para eliminar');
        }
        res.json(respuesta.rows[0]);
    } catch (error) {
        console.error('Error al eliminar tarjeta de video:', error);
        res.status(500).send('Error interno: Fallo en la matriz de la base de datos');
    }
});

module.exports = router;