const express = require('express');
const router = express.Router();
const db = require('../db'); // Importamos la configuración de la base de datos desde db.js

router.use(express.json()); // Middleware para parsear JSON en el cuerpo de las peticiones

router.post('/', async (req, res) => {
    try {
        // 1. Extraemos los datos que nos envía el usuario en el "cuerpo" (body) de la petición
        const { marca, modelo, socket, consumo_watts, gama_rendimiento, grafico_integrados, version_bios_req } = req.body;

        // 2. Armamos la consulta SQL para insertar. Usamos $1, $2... por seguridad
        const comandoSQL = `
            INSERT INTO procesadores (marca, modelo, socket, consumo_watts, gama_rendimiento, grafico_integrados, version_bios_req) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) 
            RETURNING *;
        `;
        
        const valores = [marca, modelo, socket, consumo_watts, gama_rendimiento, grafico_integrados, version_bios_req];

        // 3. Ejecutamos la orden en PostgreSQL
        const respuesta = await db.query(comandoSQL, valores);

        // 4. Devolvemos el procesador recién creado para confirmar que todo salió bien
        res.status(201).json(respuesta.rows[0]);

    } catch (error) {
        console.error('Error al crear procesador:', error);
        res.status(500).send('Error interno: No se pudo guardar el procesador');
    }
});

// GET para OBTENER todos los procesadores disponibles
router.get('/', async (req, res) => {
    try {
        // Le decimos al router: "Espera (await) a que la base de datos responda esta consulta SQL"
        const respuesta = await db.query('SELECT * FROM procesadores;');
        
        // Cuando llega la respuesta, sacamos las filas (rows) y las mandamos como JSON

        setTimeout(() => {
            res.json(respuesta.rows);
        }, 2000);

        
    } catch (error) {
        // Si el cable está roto o la clave está mal, mostramos el error en la consola
        console.error('Error de conexión:', error);
        res.status(500).send('Error interno: No se pudo conectar a la base de datos');
    }
});

// Ruta para ACTUALIZAR un procesador por ID (PUT)
router.put('/:id', async (req, res) => {
    try {
        const idBuscado = req.params.id;   
        const {marca, modelo, socket, consumo_watts, gama_rendimiento, grafico_integrados, version_bios_req} = req.body;
        const comandoSQL = `UPDATE procesadores SET marca = $1,
                                modelo = $2, 
                                socket = $3, 
                                consumo_watts = $4, 
                                gama_rendimiento = $5, 
                                grafico_integrados = $6, 
                                version_bios_req = $7 
                            WHERE id = $8 RETURNING *;`;
        const valores = [marca, modelo, socket, consumo_watts, gama_rendimiento, grafico_integrados, version_bios_req, idBuscado]; // Asegúrate de que tus variables se llamen así, o cámbialas aquí.
        const respuesta = await db.query(comandoSQL, valores);
        if (respuesta.rows.length === 0) {
            return res.status(404).send('No se encontró ningún procesador con ese ID para actualizar');
        }
        res.json(respuesta.rows[0]);
    } catch (error) {
        console.error('Error al actualizar procesador:', error);
        res.status(500).send('Error interno: Fallo en la matriz de la base de datos');
    }
})

// Ruta para ELIMINAR un procesador (DELETE)
router.delete('/:id', async (req, res) => {
    try {
        // 1. Capturamos el ID directamente desde la URL
        const idBuscado = req.params.id;

        // 2. Armamos la orden de ejecución. 
        // Usamos RETURNING * para que PostgreSQL nos devuelva el cadáver del registro y confirmar qué borró
        const comandoSQL = 'DELETE FROM procesadores WHERE id = $1 RETURNING *;';
        
        // 3. Ejecutamos el disparo
        const respuesta = await db.query(comandoSQL, [idBuscado]);

        // 4. ¿Qué pasa si intentan borrar un ID que no existe?
        if (respuesta.rows.length === 0) {
            return res.status(404).send('Operación fallida: Ese procesador no existe en el inventario.');
        }

        // 5. Si todo salió bien, enviamos un mensaje de éxito
        res.json({ 
            mensaje: 'Procesador eliminado con éxito del rack', 
            pieza_eliminada: respuesta.rows[0] 
        });

    } catch (error) {
        console.error('Error al eliminar procesador:', error);
        res.status(500).send('Error interno: Fallo en la matriz de la base de datos');
    }
});

module.exports = router;