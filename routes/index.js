const express = require('express');
const router = express.Router();
const connection = require('../base');



const isAuthenticated = (req, res, next) => {
  if (req.session.usuario) {
    next();
  } else {
    res.redirect('/');
  }
};


// Ruta principal que renderiza la vista index.ejs
router.get('/', (req, res) => {
  connection.query('SELECT DISTINCT establecimiento FROM usuarios', (error, results) => {
    if (error) {
      console.error('Error al consultar la base de datos:', error);
      return res.render('index', { establecimientos: [] });
    }
    res.render('index', { establecimientos: results });
  });
});



router.get('/dashboard', isAuthenticated, (req, res) => {
  const usuario = req.session.usuario;
  const fecha = new Date().toLocaleDateString();
  res.render('dashboard', { usuario, fecha });
});




router.post('/login', (req, res) => {
  const { usuario, contrasena, establecimiento } = req.body;
  const query = 'SELECT * FROM usuarios WHERE nombre = ? AND contraseña = ? AND establecimiento = ?';
  connection.query(query, [usuario, contrasena, establecimiento], (error, results) => {
    if (error) {
      console.error('Error al consultar la base de datos:', error);
      return res.redirect('/');
    }
    if (results.length > 0) {
      const user = results[0];
      req.session.usuario = user.nombre; // Almacena el nombre de usuario en la sesión
      req.session.rol = user.rol; // Almacena el rol en la sesión

      // Redirecciona según el rol
      if (user.rol === 'Profesora' || user.rol === 'Profesor') {
        res.redirect('/dashboardadmin');
      } else {
        res.redirect('/dashboard');
      }
    } else {
      res.redirect('/');
    }
  });
});




router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});



router.get('/dashboardadmin', isAuthenticated, (req, res) => {
  const usuario = req.session.usuario;
  const fecha = new Date().toLocaleDateString();
  res.render('dashboardadmin', { usuario, fecha }); // Asegúrate de tener una vista dashboardadmin.ejs
});

router.get('/obtener-usuarios', isAuthenticated, (req, res) => {
  const query = 'SELECT id, nombre, contraseña, rol FROM usuarios'; // Ajusta esta consulta según tus necesidades y estructura de base de datos
  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error al consultar la base de datos:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    res.json(results);
  });
});

// Ruta para eliminar un usuario
router.delete('/eliminar-usuario/:id', isAuthenticated, (req, res) => {
  const { id } = req.params; // Obtenemos el ID del usuario desde el parámetro de la URL
  const query = 'DELETE FROM usuarios WHERE id = ?';
  connection.query(query, [id], (error, result) => {
      if (error) {
          console.error('Error al eliminar el usuario:', error);
          return res.status(500).json({ error: 'Error interno del servidor' });
      }
      res.status(204).send(); // No content to send back
  });
});


router.get('/obtener-preguntas', isAuthenticated, (req, res) => {
  const query = 'SELECT id, habilidad, pregunta FROM preguntas'; // Asegúrate de que los campos coincidan con los de tu base de datos
  connection.query(query, (error, results) => {
      if (error) {
          console.error('Error al consultar la base de datos:', error);
          return res.status(500).json({ error: 'Error interno del servidor' });
      }
      res.json(results);
  });
});

router.delete('/eliminar-pregunta/:id', isAuthenticated, (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM preguntas WHERE id = ?';
  connection.query(query, [id], (error, result) => {
      if (error) {
          console.error('Error al eliminar la pregunta:', error);
          return res.status(500).json({ error: 'Error interno del servidor' });
      }
      res.status(204).send(); // No content to send back
  });
});


router.get('/random-question', (req, res) => {
    const query = "SELECT pregunta FROM preguntas ORDER BY RAND() LIMIT 1";
    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error al consultar la base de datos:', error);
            return res.status(500).json({ error: 'Error al obtener la pregunta' });
        }
        if (results.length > 0) {
            res.json(results[0]); // Envía la pregunta como respuesta JSON
        } else {
            res.status(404).json({ error: 'No se encontraron preguntas' });
        }
    });
});


module.exports = router;
