const express = require('express');
const router = express.Router();
const connection = require('../base');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Directorio temporal para los archivos cargados

const XLSX = require('xlsx');
const fs = require('fs');





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



router.get('/dashboardadmin', isAuthenticated, (req, res) => {
  console.log(req.session.usuario);  
  const usuario = req.session.usuario.nombre;
  const fecha = new Date().toLocaleDateString();
  res.render('dashboardadmin', { usuario, fecha });
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
        // Cambiar la redireccion aquí
        res.redirect('/instructivo');
      }
    } else {
      res.redirect('/');
    }
  });
});

router.get('/instructivo', isAuthenticated, (req, res) => {
  const usuario = req.session.usuario.nombre;
  const fecha = new Date().toLocaleDateString();
  res.render('instructivo', { usuario, fecha });
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


router.post('/agregar-usuario', isAuthenticated, (req, res) => {
  const { nombre, contrasena, establecimiento, rol } = req.body;
  const query = 'INSERT INTO usuarios (nombre, contraseña, establecimiento, rol) VALUES (?, ?, ?, ?)';
  connection.query(query, [nombre, contrasena, establecimiento, rol], (error, result) => {
    if (error) {
      console.error('Error al agregar el usuario:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    res.status(200).json({ message: 'Usuario agregado correctamente' });
  });
});

router.post('/agregar-pregunta', isAuthenticated, (req, res) => {
  const { habilidad, pregunta } = req.body;
  const query = 'INSERT INTO preguntas (habilidad, pregunta) VALUES (?, ?)';
  connection.query(query, [habilidad, pregunta], (error, result) => {
    if (error) {
      console.error('Error al agregar la pregunta:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    res.status(200).json({ message: 'Pregunta agregada correctamente' });
  });
});
// Ruta para actualizar un usuario
router.put('/actualizar-usuario/:id', isAuthenticated, (req, res) => {
  const { id } = req.params;
  const { nombre, contrasena, rol } = req.body;
  const query = 'UPDATE usuarios SET nombre = ?, contraseña = ?, rol = ? WHERE id = ?';
  connection.query(query, [nombre, contrasena, rol, id], (error, result) => {
    if (error) {
      console.error('Error al actualizar el usuario:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    res.status(200).json({ message: 'Usuario actualizado correctamente' });
  });
});

// Ruta para actualizar una pregunta
router.put('/actualizar-pregunta/:id', isAuthenticated, (req, res) => {
  const { id } = req.params;
  const { habilidad, pregunta } = req.body;
  const query = 'UPDATE preguntas SET habilidad = ?, pregunta = ? WHERE id = ?';
  connection.query(query, [habilidad, pregunta, id], (error, result) => {
    if (error) {
      console.error('Error al actualizar la pregunta:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    res.status(200).json({ message: 'Pregunta actualizada correctamente' });
  });
});
router.post('/cargar-usuarios-multiple', isAuthenticated, upload.single('archivoUsuarios'), (req, res) => {
  const archivo = req.file;

  if (archivo) {
    const fileBuffer = fs.readFileSync(archivo.path);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet);

    // Aquí debes implementar la lógica para agregar los usuarios a la base de datos
    data.forEach(row => {
      const nombre = row.Nombre;
      const contrasena = row.Contraseña;
      const establecimiento = row.Establecimiento;
      const rol = row.Rol;

      // Insertar el usuario en la base de datos
      const query = 'INSERT INTO usuarios (nombre, contraseña, establecimiento, rol) VALUES (?, ?, ?, ?)';
      connection.query(query, [nombre, contrasena, establecimiento, rol], (error, result) => {
        if (error) {
          console.error('Error al agregar el usuario:', error);
        }
      });
    });

    res.status(200).json({ message: 'Usuarios agregados correctamente' });
  } else {
    res.status(400).json({ error: 'No se seleccionó ningún archivo' });
  }
});
module.exports = router;
