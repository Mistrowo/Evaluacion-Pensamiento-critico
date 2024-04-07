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
      req.session.usuario = usuario; // Almacena el nombre de usuario en la sesión
      res.redirect('/dashboard');
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






module.exports = router;
