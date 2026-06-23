const express = require('express');
const router = express.Router();
const db = require('../db');

router.use(express.json()); // Middleware para parsear JSON en el cuerpo de las peticiones

//Crear una nueva memoria RAM (POST)
router.post('/', async (req, res) => {
    try {
        // 1. Extraemos los datos que nos envía el usuario en el "cuerpo" (body) de la petición
        const { marca, modelo, generacion, capacidad_memoria, frecuencia, latencia_cl, perfil_optimizacion, voltaje } = req.body;

        // 2. Armamos la consulta SQL para insertar. Usamos $1, $2... por seguridad
        const comandoSQL = `
            INSERT INTO memoria_ram (marca, modelo, generacion, capacidad_memoria, frecuencia, latencia_cl, perfil_optimizacion, voltaje) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
            RETURNING *;
        `;
        
        const valores = [marca, modelo, generacion, capacidad_memoria, frecuencia, latencia_cl, perfil_optimizacion, voltaje];

        // 3. Ejecutamos la orden en PostgreSQL
        const respuesta = await db.query(comandoSQL, valores);

        // 4. Devolvemos la ram recién creada para confirmar que todo salió bien
        res.status(201).json(respuesta.rows[0]);

    } catch (error) {
        console.error('Error al crear la memoria ram:', error);
        res.status(500).send('Error interno: No se pudo guardar la memoria ram');
    }
});

//Buscar todas las memorias RAM disponibles (GET)
router.get('/', async (req, res) => {
    try {
        const respuesta = await db.query('SELECT * FROM memoria_ram;');
        res.json(respuesta.rows);
    } catch (error) {
        console.error('Error de conexión:', error);
        res.status(500).send('Error interno: No se pudo conectar a la base de datos');
    }
});

//Actualizar memoria RAM por ID (PUT)
router.put('/:id', async (req, res) => {
    try {
        const idBuscado = req.params.id;   
        const {marca, modelo, generacion, capacidad_memoria, frecuencia, latencia_cl, perfil_optimizacion, voltaje} = req.body;
        const comandoSQL = `
            UPDATE memoria_ram
            SET marca = $1, 
                modelo = $2, 
                generacion = $3, 
                capacidad_memoria = $4, 
                frecuencia = $5, 
                latencia_cl = $6, 
                perfil_optimizacion = $7, 
                voltaje = $8 
            WHERE id = $9 
            RETURNING *;
        `;
        const valores = [
            marca, 
            modelo, 
            generacion,
            capacidad_memoria,
            frecuencia,
            latencia_cl,
            perfil_optimizacion,
            voltaje
            , idBuscado]; // Asegúrate de que tus variables se llamen así, o cámbialas aquí.

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

// Eliminar una memoria RAM por ID (DELETE)
router.delete('/:id', async (req, res) => {
    try {
        // 1. Capturamos el ID directamente desde la URL
        const idBuscado = req.params.id;

        // 2. Armamos la orden de ejecución. 
        // Usamos RETURNING * para que PostgreSQL nos devuelva el cadáver del registro y confirmar qué borró
        const comandoSQL = 'DELETE FROM memoria_ram WHERE id = $1 RETURNING *;';
        
        // 3. Ejecutamos el disparo
        const respuesta = await db.query(comandoSQL, [idBuscado]);

        // 4. ¿Qué pasa si intentan borrar un ID que no existe?
        if (respuesta.rows.length === 0) {
            return res.status(404).send('Operación fallida: Esa memoria no existe en el inventario.');
        }

        // 5. Si todo salió bien, enviamos un mensaje de éxito
        res.json({ 
            mensaje: 'memoria eliminada con éxito del rack', 
            pieza_eliminada: respuesta.rows[0] 
        });

    } catch (error) {
        console.error('Error al eliminar memoria:', error);
        res.status(500).send('Error interno: Fallo en la matriz de la base de datos');
    }
});

module.exports = router;