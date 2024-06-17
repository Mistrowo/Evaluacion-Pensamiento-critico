const express = require('express');
const router = express.Router();
const connection = require('../base');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); 

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
  connection.query(
    `SELECT DISTINCT establecimiento, curso
     FROM usuarios`,
    (error, results) => {
      if (error) {
        console.error('Error al consultar la base de datos:', error);
        return res.render('index', { establecimientos: [] });
      }

      // Agrupar los cursos por establecimiento
      const establecimientos = {};
      results.forEach(row => {
        const { establecimiento, curso } = row;
        if (!establecimientos[establecimiento]) {
          establecimientos[establecimiento] = {
            nombre: establecimiento,
            cursos: []
          };
        }
        if (curso) {
          establecimientos[establecimiento].cursos.push(curso);
        }
      });

      res.render('index', { establecimientos: Object.values(establecimientos) });
    }
  );
});


router.get('/dashboard', isAuthenticated, (req, res) => {
  console.log(req.session.usuario);  
  const usuario = req.session.usuario.nombre;
  const fecha = new Date().toLocaleDateString();
  res.render('dashboard', { usuario, fecha });
});


router.get('/analisis-respuestas', isAuthenticated, (req, res) => {
  console.log(req.session.usuario);  
  const usuario = req.session.usuario.nombre;
  const fecha = new Date().toLocaleDateString();
  res.render('analisis-respuestas', { usuario, fecha });
});



router.get('/obtener-respuestas', isAuthenticated, (req, res) => {
  const query = `
      SELECT r.id_respuesta, r.id_pregunta, r.respuesta, r.fecha_respuesta, r.id_respuesta_general, u.nombre 
      FROM respuestas r 
      JOIN usuarios u ON r.id_usuario = u.id`;

  connection.query(query, (error, results) => {
      if (error) {
          console.error('Error al consultar la base de datos:', error);
          return res.status(500).json({ error: 'Error al obtener las respuestas' });
      }
      res.json(results);
  });
});


router.get('/obtener-respuestas-general/:idGeneral', isAuthenticated, (req, res) => {
  const { idGeneral } = req.params;
  const query = `
      SELECT r.id_respuesta, r.id_pregunta, r.pregunta, r.respuesta, r.fecha_respuesta, r.id_respuesta_general, u.nombre 
      FROM respuestas r 
      JOIN usuarios u ON r.id_usuario = u.id 
      WHERE r.id_respuesta_general = ? OR r.id_respuesta = ?`;

  connection.query(query, [idGeneral, idGeneral], (error, results) => {
      if (error) {
          console.error('Error al consultar la base de datos:', error);
          return res.status(500).json({ error: 'Error al obtener las respuestas' });
      }
      res.json(results);
  });
});





router.get('/dashboardadmin', isAuthenticated, (req, res) => {
  console.log(req.session.usuario);  
  const usuario = req.session.usuario.nombre;
  const fecha = new Date().toLocaleDateString();
  res.render('dashboardadmin', { usuario, fecha });
});


router.post('/login', (req, res) => {
  const { usuario, contrasena, establecimiento, curso } = req.body;
  console.log('Datos recibidos:', req.body); // Log para verificar los datos recibidos

  const query = 'SELECT * FROM usuarios WHERE nombre = ? AND contraseña = ? AND establecimiento = ? AND curso = ?';
  connection.query(query, [usuario, contrasena, establecimiento, curso], (error, results) => {
      if (error) {
          console.error('Error al consultar la base de datos:', error);
          return res.redirect('/');
      }

      console.log('Resultados de la consulta:', results); // Log para verificar los resultados de la consulta

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
  req.session.currentResponseGroupId = null; // Inicializar currentResponseGroupId
  res.render('instructivo', { usuario, fecha });
});


router.get('/finalizado', isAuthenticated, (req, res) => {
  const usuario = req.session.usuario.nombre;
  const fecha = new Date().toLocaleDateString();
  req.session.currentResponseGroupId = null; // Inicializar currentResponseGroupId
  res.render('finalizado', { usuario, fecha });
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
  const questionId = req.body.question_id;
  const userId = req.session.usuario.id;
  const pregunta = req.body.pregunta;

  console.log('Datos recibidos:', req.body);

  const checkQuery = 'SELECT id_respuesta FROM respuestas WHERE id_usuario = ? AND id_pregunta = ?';
  connection.query(checkQuery, [userId, questionId], (checkError, checkResults) => {
      if (checkError) {
          console.error('Error al verificar la respuesta en la base de datos:', checkError);
          return res.status(500).json({ success: false, message: 'Error al verificar la respuesta' });
      }

      if (checkResults.length > 0) {
          const updateQuery = 'UPDATE respuestas SET respuesta = ?, fecha_respuesta = NOW() WHERE id_respuesta = ?';
          connection.query(updateQuery, [response, checkResults[0].id_respuesta], (updateError) => {
              if (updateError) {
                  console.error('Error al actualizar la respuesta en la base de datos:', updateError);
                  return res.status(500).json({ success: false, message: 'Error al actualizar la respuesta' });
              }
              res.json({ success: true, message: 'Respuesta actualizada con éxito.' });
          });
      } else {
          const insertQuery = 'INSERT INTO respuestas (id_usuario, id_pregunta, respuesta, pregunta, fecha_respuesta, id_respuesta_general) VALUES (?, ?, ?, ?, NOW(), ?)';
          const id_respuesta_general = req.session.currentResponseGroupId || null;
          connection.query(insertQuery, [userId, questionId, response, pregunta, id_respuesta_general], (insertError, insertResults) => {
              if (insertError) {
                  console.error('Error al guardar la respuesta en la base de datos:', insertError);
                  return res.status(500).json({ success: false, message: 'Error al guardar la respuesta' });
              }
              if (!req.session.currentResponseGroupId) {
                  req.session.currentResponseGroupId = insertResults.insertId;
                  const updateGeneralQuery = 'UPDATE respuestas SET id_respuesta_general = ? WHERE id_respuesta = ?';
                  connection.query(updateGeneralQuery, [insertResults.insertId, insertResults.insertId], (updateGeneralError) => {
                      if (updateGeneralError) {
                          console.error('Error al actualizar el id_respuesta_general:', updateGeneralError);
                          return res.status(500).json({ success: false, message: 'Error al actualizar el id_respuesta_general' });
                      }
                      res.json({ success: true, message: 'Respuesta guardada con éxito.' });
                  });
              } else {
                  res.json({ success: true, message: 'Respuesta guardada con éxito.' });
              }
          });
      }
  });
});




router.post('/agregar-usuario', isAuthenticated, (req, res) => {
  const { nombre, contrasena, establecimiento, rol, curso } = req.body;
  const query = 'INSERT INTO usuarios (nombre, contraseña, establecimiento, rol, curso) VALUES (?, ?, ?, ?, ?)';
  connection.query(query, [nombre, contrasena, establecimiento, rol, curso], (error, result) => {
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


router.delete('/eliminar-respuestas-general/:idGeneral', isAuthenticated, (req, res) => {
  const { idGeneral } = req.params;
  const query = 'DELETE FROM respuestas WHERE id_respuesta_general = ?';

  connection.query(query, [idGeneral], (error, result) => {
      if (error) {
          console.error('Error al eliminar las respuestas:', error);
          return res.status(500).json({ error: 'Error interno del servidor' });
      }
      res.status(204).send();
  });
});





router.post('/chat-auto', async (req, res) => {
  try {
    // Seleccionar respuestas aleatorias de la base de datos
    const query = `SELECT respuesta FROM respuestas ORDER BY RAND() LIMIT 10;`;

    connection.query(query, async (error, results) => {
      if (error) {
        console.error('Error al consultar la base de datos:', error);
        return res.status(500).json({ error: 'Error al procesar la solicitud' });
      }

      // Crear mensajes para la API de OpenAI usando las respuestas existentes
      const messages = results.map(row => ({
        role: "system",
        content: row.respuesta
      }));

      // Llamar a la API de OpenAI con los mensajes
      const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: messages
      });

      res.json({ message: response.data.choices[0].message });
    });
  } catch (error) {
    console.error('Error al comunicarse con OpenAI:', error);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
});


router.get('/obtener-usuario/:id', isAuthenticated, (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM usuarios WHERE id = ?';

  connection.query(query, [id], (error, results) => {
      if (error) {
          console.error('Error al obtener el usuario:', error);
          return res.status(500).json({ error: 'Error interno del servidor' });
      }
      if (results.length > 0) {
          res.json(results[0]);
      } else {
          res.status(404).json({ error: 'Usuario no encontrado' });
      }
  });
});


router.get('/obtener-pregunta/:id', isAuthenticated, (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM preguntas WHERE id = ?';

  connection.query(query, [id], (error, results) => {
      if (error) {
          console.error('Error al obtener la pregunta:', error);
          return res.status(500).json({ error: 'Error interno del servidor' });
      }
      if (results.length > 0) {
          res.json(results[0]);
      } else {
          res.status(404).json({ error: 'Pregunta no encontrada' });
      }
  });
});




module.exports = router;
