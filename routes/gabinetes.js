const express = require('express');
const router = express.Router();
const db = require('../db'); // Importamos la configuración de la base de datos desde db.js

router.use(express.json());

router.post('/', async (req, res) => {
    try {
        const {marca, modelo, alto_mm, ancho_mm, profundidad_mm, espacio_maximo_gpu_mm, ventiladores_incluidos, max_radiador_superior_mm, max_radiador_frontal_mm, tipo_iluminacion, conexion_ventilador, incluye_hub_controlador} = req.body;

        const consultaSQL =  `
            INSERT INTO gabinetes (marca, modelo, alto_mm, ancho_mm, profundidad_mm, espacio_maximo_gpu_mm, ventiladores_incluidos, max_radiador_superior_mm, max_radiador_frontal_mm, tipo_iluminacion, conexion_ventilador, incluye_hub_controlador)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *;
        `;
    
    const valores = [marca, modelo, alto_mm, ancho_mm, profundidad_mm, espacio_maximo_gpu_mm, ventiladores_incluidos, max_radiador_superior_mm, max_radiador_frontal_mm, tipo_iluminacion, conexion_ventilador, incluye_hub_controlador];

    const respuesta = await db.query(consultaSQL, valores);

    res.status(201).json(respuesta.rows[0]);//todo salió bien, devolvemos el gabinete creado
    } catch (error) {
        console.error('Error al crear gabinete:', error);
        res.status(500).send('Error interno: No se pudo guardar el gabinete');
    }
})

//Buscar todos los gabinetes disponibles (GET)
router.get('/', async (req, res) => {
    try {
        const respuesta = await db.query('SELECT * FROM gabinetes;');
        res.json(respuesta.rows);
    } catch (error) {
        console.error('Error de conexión:', error);
        res.status(500).send('Error interno: No se pudo conectar a la base de datos');
    }
});

//Actualizar gabinete por ID (PUT)
router.put('/:id', async (req, res) => {
    try {
        const idBuscado = req.params.id;
        const {marca, modelo, alto_mm, ancho_mm, profundidad_mm, espacio_maximo_gpu_mm, ventiladores_incluidos, max_radiador_superior_mm, max_radiador_frontal_mm, tipo_iluminacion, conexion_ventilador, incluye_hub_controlador} = req.body;
        const consultaSQL = `
            UPDATE gabinetes
            SET marca = $1,
                modelo = $2,
                alto_mm = $3,
                ancho_mm = $4,
                profundidad_mm = $5,
                espacio_maximo_gpu_mm = $6,
                ventiladores_incluidos = $7,
                max_radiador_superior_mm = $8,
                max_radiador_frontal_mm = $9,
                tipo_iluminacion = $10,
                conexion_ventilador = $11,
                incluye_hub_controlador = $12
            WHERE id = $13
            RETURNING *;
        `;
        const valores = [marca, modelo, alto_mm, ancho_mm, profundidad_mm, espacio_maximo_gpu_mm, ventiladores_incluidos, max_radiador_superior_mm, max_radiador_frontal_mm, tipo_iluminacion, conexion_ventilador, incluye_hub_controlador, idBuscado];

        const respuesta = await db.query(consultaSQL, valores);

        if (respuesta.rows.length===0) {
            return res.status(404).send('No se encontró ningún gabinete con ese ID para actualizar');
        }
        res.json(respuesta.rows[0]);
    } catch (error) {
        console.error('Error al actualizar gabinete:', error);
        res.status(500).send('Error interno: Fallo en la matriz de la base de datos');
    }
});

// Eliminar un gabinete por ID (DELETE)
router.delete('/:id', async (req, res) => {
    try {
        const idBuscado = req.params.id;
        const consultaSQL = 'DELETE FROM gabinetes WHERE id = $1 RETURNING *;';
        const respuesta = await db.query(consultaSQL, [idBuscado]);

        if (respuesta.rows.length === 0) {
            return res.status(404).send('Operación fallida: Ese gabinete no existe en el inventario.');
        }
        res.json(respuesta.rows[0]);
    } catch (error) {
        console.error('Error al eliminar gabinete:', error);
        res.status(500).send('Error interno: Fallo en la matriz de la base de datos');
    }
});

module.exports = router;