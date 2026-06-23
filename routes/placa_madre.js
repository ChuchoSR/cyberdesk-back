const express = require('express');
const router = express.Router();
const db = require('../db');

router.use(express.json());

router.post('/', async (req, res) => {
    try {
        const {marca, modelo, formato_fisico, socket, generacion_ram, frecuencia_max_ram, perfil_optimizacion, bios_flashback, bios_stock} = req.body;

        const consultaSQL =  `
            INSERT INTO placas_madre (marca, modelo, formato_fisico, socket, generacion_ram, frecuencia_max_ram, perfil_optimizacion, bios_flashback, bios_stock)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *;
        `;
    
    const valores = [marca, modelo, formato_fisico, socket, generacion_ram, perfil_optimizacion, bios_flashback, bios_stock];

    const respuesta = await db.query(consultaSQL, valores);

    res.status(201).json(respuesta.rows[0]);//todo salió bien, devolvemos la placa creada
    } catch (error) {
        console.error('Error al crear la placa madre:', error);
        res.status(500).send('Error interno: No se pudo guardar la placa madre');
    }
})

// Buscar todas las placas madre disponibles (GET)
router.get('/', async (req, res) => {
    try {
        const respuesta = await db.query('SELECT * FROM placas_madre;');
        res.json(respuesta.rows);
    } catch (error) {
        console.error('Error de conexión:', error);
        res.status(500).send('Error interno: No se pudo conectar a la base de datos');
    }
});

//Actualizar placa madre por ID (PUT)
router.put('/:id', async (req, res) => {
    try {
        const idBuscado = req.params.id;
        const {marca, modelo, formato_fisico, socket, generacion_ram, frecuencia_max_ram, perfil_optimizacion, bios_flashback, bios_stock} = req.body;
        const consultaSQL = `
            UPDATE placas_madre
            SET marca = $1,
                modelo = $2,
                formato_fisico = $3,
                socket = $4,
                generacion_ram = $5,
                frecuencia_max_ram = $6,
                perfil_optimizacion = $7,
                bios_flashback = $8,
                bios_stock = $9
            WHERE id = $10
            RETURNING *;
        `;
        const valores = [marca, modelo, formato_fisico, socket, generacion_ram, frecuencia_max_ram, perfil_optimizacion, bios_flashback, bios_stock, idBuscado];

        const respuesta = await db.query(consultaSQL, valores);

        if (respuesta.rows.length===0) {
            return res.status(404).send('No se encontró ninguna placa madre con ese ID para actualizar');
        }
        res.json(respuesta.rows[0]);
    } catch (error) {
        console.error('Error al actualizar placa madre:', error);
        res.status(500).send('Error interno: Fallo en la matriz de la base de datos');
    }
});

// Eliminar una placa madre por ID (DELETE)
router.delete('/:id', async (req, res) => {
    try {
        const idBuscado = req.params.id;
        const consultaSQL = 'DELETE FROM placas_madre WHERE id = $1 RETURNING *;';
        const respuesta = await db.query(consultaSQL, [idBuscado]);

        if (respuesta.rows.length === 0) {
            return res.status(404).send('Operación fallida: Esa placa madre no existe en el inventario.');
        }
        res.json(respuesta.rows[0]);
    } catch (error) {
        console.error('Error al eliminar placa madre:', error);
        res.status(500).send('Error interno: Fallo en la matriz de la base de datos');
    }
});

module.exports = router;