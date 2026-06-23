require('dotenv').config(); // Carga las variables de entorno desde el archivo .env

const express = require('express');
const cors = require('cors');
const db = require('./db'); // Importamos la configuración de la base de datos desde db.js

const app = express();
app.use(cors()); // Middleware para habilitar CORS
app.use(express.json()); // Middleware para parsear JSON en las solicitudes
const port = process.env.PORT || 3000;

// Ruta 1: El mensaje de bienvenida
app.get('/', (req, res) => {
    res.send('¡El servidor de SoloTodo está encendido y ruteando impecable!');
});

// Importamos las rutas de los diferentes módulos
const almacenanimientoRoutes = require('./routes/almacenamiento');
const fuenteDePoderRoutes = require('./routes/fuente_de_poder');
const gabineteRoutes = require('./routes/gabinetes');
const memoriaRamRoutes = require('./routes/memoria_ram');
const placaMadreRoutes = require('./routes/placa_madre');
const procesadoresRoutes = require('./routes/procesadores');
const refrigeracionRoutes = require('./routes/refrigeracion');
const tarjetaGraficaRoutes = require('./routes/tarjeta_video');


// Montamos las rutas en la aplicación
app.use('/almacenamiento', almacenanimientoRoutes);
app.use('/fuentes_poder', fuenteDePoderRoutes);
app.use('/gabinetes', gabineteRoutes);
app.use('/memoria_ram', memoriaRamRoutes);
app.use('/placas_madre', placaMadreRoutes);
app.use('/procesadores', procesadoresRoutes);
app.use('/refrigeracion', refrigeracionRoutes);
app.use('/tarjetas_video', tarjetaGraficaRoutes);

// Encendemos el motor
app.listen(port, () => {
    console.log(`Servidor activo y escuchando en el puerto ${port}`);
});