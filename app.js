const express = require('express');
const app = express();
const port = 3000;

const session = require('express-session');

app.use(session({
  secret: 'mi_secreto', // Utiliza una cadena secreta para firmar la cookie de sesión
  resave: false, // Evita que la sesión se guarde en el almacenamiento si no se modificó
  saveUninitialized: false, // No guarda sesiones no inicializadas (nuevas sesiones sin modificar)
  cookie: { secure: false } // Para desarrollo, establece secure en false; para producción, debería ser true si estás usando HTTPS
}));


const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));


app.use(express.static('public'));

// Importa las rutas
const indexRouter = require('./routes/index');

// Usa las rutas
app.use('/', indexRouter);

// Configura el motor de plantillas EJS
app.set('view engine', 'ejs');

// Inicia el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
