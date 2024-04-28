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
  console.log(req.session.usuario);  
  const usuario = req.session.usuario.nombre;
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
      req.session.usuario = user; 
      req.session.rol = user.rol; 

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
router.get('/dashboard', isAuthenticated, (req, res) => {
  const usuario = req.session.usuario.nombre; 
  const fecha = new Date().toLocaleDateString();
  res.render('dashboard', { usuario: usuario, fecha: fecha }); 
});



router.get('/obtener-usuarios', isAuthenticated, (req, res) => {
  const query = 'SELECT id, nombre, contraseña, rol FROM usuarios';
  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error al consultar la base de datos:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    res.json(results);
  });
});

router.delete('/eliminar-usuario/:id', isAuthenticated, (req, res) => {
  const { id } = req.params; 
  const query = 'DELETE FROM usuarios WHERE id = ?';
  connection.query(query, [id], (error, result) => {
      if (error) {
          console.error('Error al eliminar el usuario:', error);
          return res.status(500).json({ error: 'Error interno del servidor' });
      }
      res.status(204).send(); 
  });
});


router.get('/obtener-preguntas', isAuthenticated, (req, res) => {
  const query = 'SELECT id, habilidad, pregunta FROM preguntas'; 
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
            res.json(results[0]); 
        } else {
            res.status(404).json({ error: 'No se encontraron preguntas' });
        }
    });
});
router.post('/save-response', isAuthenticated, (req, res) => {
  const response = req.body.response;
  const userId = req.session.usuario.id;

  console.log('Datos recibidos:', req.body);

  const query = 'INSERT INTO respuestas (id_usuario, respuesta, fecha_respuesta) VALUES (?, ?, NOW())';
  connection.query(query, [userId, response], (error, results) => {
      if (error) {
          console.error('Error al guardar la respuesta en la base de datos:', error);
          return res.status(500).json({ success: false, message: 'Error al guardar la respuesta' });
      }
      res.json({ success: true, message: 'Respuesta guardada con éxito.' });
  });
});
module.exports = router;
