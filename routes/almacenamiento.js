const express = require('express');
const router = express.Router();
const db = require('../db');

router.use(express.json());


router.post('/', async (req, res) => {
    try {
        const {marca, modelo, formato_fisico, tecnologia, capacidad_memoria, longitud} = req.body;
    
    
        const consultaSQL = `
            INSERT INTO almacenamiento (marca, modelo, formato_fisico, tecnologia, capacidad_memoria, longitud) 
            VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING *;
        `;

        const valores = [marca, modelo, formato_fisico, tecnologia, capacidad_memoria, longitud];
    
        const respuesta = await db.query(consultaSQL, valores);

        res.status(201).json(respuesta.rows[0]);//todo salió bien, devolvemos el nuevo almacenamiento creado
    
    } catch (error) {
        console.error('Error al crear almacenamiento:', error);
        res.status(500).send('Error interno: No se pudo guardar el almacenamiento');
    }
})

//Buscar todos los almacenamientos disponibles (GET)
router.get('/', async (req, res) => {
    try {
        const respuesta = await db.query('SELECT * FROM almacenamiento;');
        res.json(respuesta.rows);
    } catch (error) {
        console.error('Error de conexión:', error);
        res.status(500).send('Error interno: No se pudo conectar a la base de datos');
    }
});

//Actualizar almacenamiento por ID (PUT)
router.put('/:id', async (req, res) => {
    try {
        const idBuscado = req.params.id;   
        const {marca, modelo, formato_fisico, tecnologia, capacidad_memoria, longitud} = req.body;
        const comandoSQL = `
            UPDATE almacenamiento 
            SET marca = $1, 
                modelo = $2,
                formato_fisico = $3, 
                tecnologia = $4, 
                capacidad_memoria = $5, 
                longitud = $6 
            WHERE id = $7 
            RETURNING *;
        `;
        const valores = [
            marca, 
            modelo,
            formato_fisico,
            tecnologia,
            capacidad_memoria,
            longitud,
            idBuscado
        ]; // Asegúrate de que tus variables se llamen así, o cámbialas aquí.

        const respuesta = await db.query(comandoSQL, valores);//ejecucion de la consulta

        if (respuesta.rows.length === 0) {
            return res.status(404).send('No se encontró ninguna RAM con ese ID para actualizar');
        }

        res.json(respuesta.rows[0]);

    } catch (error) {
        console.error('Error al actualizar memoria RAM:', error);
        res.status(500).send('Error interno: Fallo en la matriz de la base de datos');
    }
})

// Eliminar un almacenamiento por ID (DELETE)
router.delete('/:id', async (req, res) => {
    try {
        const idBuscado = req.params.id;

        const consultaSQL = 'DELETE FROM almacenamiento WHERE id = $1 RETURNING *;';

        const respuesta = await db.query(consultaSQL, [idBuscado]);

        if (respuesta.rows.length === 0) {
            return res.status(404).send('Operación fallida: Ese almacenamiento no existe en el inventario.');
        }
        res.json({
            mensaje: 'Almacenamiento eliminado con éxito del rack',
            pieza_eliminada: respuesta.rows[0]
        })
    } catch (error) {
        console.error('Error al eliminar almacenamiento:', error);
        res.status(500).send('Error interno: Fallo en la matriz de la base de datos');
    }
});

module.exports = router;