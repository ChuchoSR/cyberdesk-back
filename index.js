const express = require('express');
const { Pool } = require('pg'); // 1. Importamos el conector de PostgreSQL
const cors = require('cors');

const app = express();
app.use(cors()); // Middleware para habilitar CORS
app.use(express.json()); // Middleware para parsear JSON en las solicitudes
const port = 3000;

// 2. Armamos el "Cable de red" con las credenciales (Configuración del Pool)
const db = new Pool({
    user: 'postgres',           // Tu usuario de PostgreSQL (suele ser postgres)
    host: 'localhost',          // La IP del servidor (como es tu PC, es localhost)
    database: 'project to practice', // <--- ¡CAMBIA ESTO! (ej: 'solotodo' o 'postgres')
    password: 'postgres',      // <--- ¡CAMBIA ESTO POR TU CLAVE DE PGADMIN!
    port: 5432,                 // El puerto físico por defecto de PostgreSQL
});

// Ruta 1: El mensaje de bienvenida
app.get('/', (req, res) => {
    res.send('¡El servidor de SoloTodo está encendido y ruteando impecable!');
});

// Ruta 2: LA MAGIA (Conectando la ruta con la base de datos)

/////////////////////////////////////////////////// procesadores //////////////////////////////////////////////////
// Ruta para CREAR un nuevo procesador (POST)
app.post('/procesadores', async (req, res) => {
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
app.get('/procesadores', async (req, res) => {
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
app.put('/procesadores/:id', async (req, res) => {
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
app.delete('/procesadores/:id', async (req, res) => {
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

////////////////////////////////////////////////// MEMORIA RAM //////////////////////////////////////////////////
//Crear una nueva memoria RAM (POST)
app.post('/ram', async (req, res) => {
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
app.get('/ram', async (req, res) => {
    try {
        const respuesta = await db.query('SELECT * FROM memoria_ram;');
        res.json(respuesta.rows);
    } catch (error) {
        console.error('Error de conexión:', error);
        res.status(500).send('Error interno: No se pudo conectar a la base de datos');
    }
});

//Actualizar memoria RAM por ID (PUT)
app.put('/memoria_ram/:id', async (req, res) => {
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
app.delete('/memoria_ram/:id', async (req, res) => {
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


//////////////////////////////////////////////////// almacenamiento //////////////////////////////////////////////////
// Crear un nueva almacenamiento (POST)
app.post('/almacenamiento', async (req, res) => {
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
app.get('/almacenamiento', async (req, res) => {
    try {
        const respuesta = await db.query('SELECT * FROM almacenamiento;');
        res.json(respuesta.rows);
    } catch (error) {
        console.error('Error de conexión:', error);
        res.status(500).send('Error interno: No se pudo conectar a la base de datos');
    }
});

//Actualizar almacenamiento por ID (PUT)
app.put('/almacenamiento/:id', async (req, res) => {
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
app.delete('/almacenamiento/:id', async (req, res) => {
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

///////////////////////////////////////////////////// fuentes de poder //////////////////////////////////////////////////
// Crear una nueva fuente de poder (POST)
app.post('/fuentes_poder', async (req, res) => {
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
app.get('/fuentes_poder', async (req, res) => {
    try {
        const respuesta = await db.query('SELECT * FROM fuentes_poder;');
        res.json(respuesta.rows);
    } catch (error) {
        console.error('Error de conexión:', error);
        res.status(500).send('Error interno: No se pudo conectar a la base de datos');
    }
});

//Actualizar fuente de poder por ID (PUT)
app.put('/fuentes_poder/:id', async (req, res) => {
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
app.delete('/fuentes_poder/:id', async (req, res) => {
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

///////////////////////////////////////////////////////////// gabinetes //////////////////////////////////////////////////
// Crear un nuevo gabinete (POST)
app.post('/gabinetes', async (req, res) => {
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
app.get('/gabinetes', async (req, res) => {
    try {
        const respuesta = await db.query('SELECT * FROM gabinetes;');
        res.json(respuesta.rows);
    } catch (error) {
        console.error('Error de conexión:', error);
        res.status(500).send('Error interno: No se pudo conectar a la base de datos');
    }
});

//Actualizar gabinete por ID (PUT)
app.put('/gabinetes/:id', async (req, res) => {
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
app.delete('/gabinetes/:id', async (req, res) => {
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
//////////////////////////////////////////////////////////// placas madre //////////////////////////////////////////////////
// Crear una nueva placa madre (POST)
app.post('/placas_madre', async (req, res) => {
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
app.get('/placas_madre', async (req, res) => {
    try {
        const respuesta = await db.query('SELECT * FROM placas_madre;');
        res.json(respuesta.rows);
    } catch (error) {
        console.error('Error de conexión:', error);
        res.status(500).send('Error interno: No se pudo conectar a la base de datos');
    }
});

//Actualizar placa madre por ID (PUT)
app.put('/placas_madre/:id', async (req, res) => {
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
app.delete('/placas_madre/:id', async (req, res) => {
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


/////////////////////////////////////////////////////////////// refrigeracion //////////////////////////////////////////////////
// Crear una nueva refrigeracion (POST)
app.post('/refrigeracion', async (req, res) => {
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
app.get('/refrigeracion', async (req, res) => {
    try {
        const respuesta = await db.query('SELECT * FROM refrigeracion;');
        res.json(respuesta.rows);
    } catch (error) {
        console.error('Error de conexión:', error);
        res.status(500).send('Error interno: No se pudo conectar a la base de datos');
    }
});

//Actualizar refrigeracion por ID (PUT)
app.put('/refrigeracion/:id', async (req, res) => {
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
app.delete('/refrigeracion/:id', async (req, res) => {
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

//////////////////////////////////////////////////////////////// tarjetas graficas //////////////////////////////////////////////////
// Crear una nueva tarjeta de video (POST)
app.post('/tarjetas_video', async (req, res) => {
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
app.get('/tarjetas_video', async (req, res) => {
    try {
        const respuesta = await db.query('SELECT * FROM tarjetas_video;');
        res.json(respuesta.rows);
    } catch (error) {
        console.error('Error de conexión:', error);
        res.status(500).send('Error interno: No se pudo conectar a la base de datos');
    }
});

//Actualizar tarjeta de video por ID (PUT)
app.put('/tarjetas_video/:id', async (req, res) => {
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
app.delete('/tarjetas_video/:id', async (req, res) => {
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

// Encendemos el motor
app.listen(port, () => {
    console.log(`Servidor activo y escuchando en el puerto ${port}`);
});