const express = require('express');
const router = express.Router();
const db = require('../db');

router.use(express.json());

//Crear un nuevo ensamble (POST)
router.post('/', async (req, res) => {
    try{
        const {nombres_creador, cpu_id, ram_id, almacenamiento_id, psu_id, gabinete_id, refrigeracion_id, mb_id, gpu_id} = req.body;
        
        const consultaSQL = `
            INSERT INTO ensambles_creados (nombres_creador, cpu_id, ram_id, almacenamiento_id, psu_id, gabinete_id, refrigeracion_id, mb_id, gpu_id) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
            RETURNING *;
        `;
    
        const valores = [nombres_creador, cpu_id, ram_id, almacenamiento_id, psu_id, gabinete_id, refrigeracion_id, mb_id, gpu_id];
        
        const respuesta = await db.query(consultaSQL, valores);

        res.status(201).json(respuesta.rows[0]);//todo salió bien, devolvemos el nuevo ensamble creado

    } catch (error) {
        console.error('Error al crear ensamble:', error);
        res.status(500).send('Error interno: No se pudo guardar el ensamble');
    }
})

//Buscar todos los ensambles disponibles (GET)
router.get('/', async (req, res) => {
    try {
        const respuesta = await db.query('SELECT * FROM ensambles_creados;');
        res.json(respuesta.rows);
    } catch (error) {
        console.error('Error de conexión:', error);
        res.status(500).send('Error interno: No se pudo conectar a la base de datos');
    }
});

//Actualizar ensamble por ID (PUT)
router.put('/:id', async (req, res) => {
    try {
        const idBuscado = req.params.id;
        const {nombres_creador, cpu_id, ram_id, almacenamiento_id, psu_id, gabinete_id, refrigeracion_id, mb_id, gpu_id} = req.body;
        const comandoSQL = `
            UPDATE ensambles_creados 
            SET nombres_creador = $1, 
                cpu_id = $2,
                ram_id = $3,
                almacenamiento_id = $4,
                psu_id = $5,
                gabinete_id = $6,
                refrigeracion_id = $7,
                mb_id = $8,
                gpu_id = $9
            WHERE id = $10
            RETURNING *;
        `;
        const valores = [nombres_creador, cpu_id, ram_id, almacenamiento_id, psu_id, gabinete_id, refrigeracion_id, mb_id, gpu_id, idBuscado];
        
        const respuesta = await db.query(comandoSQL, valores);
        if (respuesta.rows.length === 0) {
            res.status(404).send('No se encontró el ensamble con el ID proporcionado');
        } else {
            res.json(respuesta.rows[0]);
        }
    } catch (error) {
        console.error('Error al actualizar ensamble:', error);
        res.status(500).send('Error interno: No se pudo actualizar el ensamble');
    }
})

//Eliminar ensamble por ID (DELETE)
router.delete('/:id', async (req, res) => {
    try {
        const idBuscado = req.params.id;
        const comandoSQL = 'DELETE FROM ensambles_creados WHERE id = $1 RETURNING *;';
        const respuesta = await db.query(comandoSQL, [idBuscado]);

        if (respuesta.rows.length === 0) {
            return res.status(404).send('No se encontró el ensamble con el ID proporcionado');
        }
        res.json({
            message: 'Ensamble eliminado exitosamente',
            ensamble: respuesta.rows[0]
        });
    } catch (error) {
        console.error('Error al eliminar ensamble:', error);
        res.status(500).send('Error interno: No se pudo eliminar el ensamble');
        }
    })

module.exports = router;