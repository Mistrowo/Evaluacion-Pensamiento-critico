
document.addEventListener('DOMContentLoaded', () => {
    // Controlador para el botón de cierre de sesión
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            window.location.href = '/logout';
        });
    }

    // Inicialización y muestra del modal de bienvenida
    
});


$('#modalActualizar').on('show.bs.modal', function () {
    $.ajax({
        url: '/obtener-usuarios', // Asegúrate de tener esta ruta configurada en tu backend
        type: 'GET',
        success: function(data) {
            var rows = '';
            data.forEach(function (user, index) {
                rows += `<tr>
                            <td>${index + 1}</td>
                            <td>${user.nombre}</td>
                            <td>${user.contraseña}</td>
                            <td>${user.rol}</td>
                            <td><button class="btn btn-sm btn-outline-secondary"><i class="bi bi-pencil-square"></i></button></td>
                         </tr>`;
            });
            $('#usuariosTableBody').html(rows);
        },
        error: function(error) {
            console.log('Error al cargar los datos:', error);
        }
    });
});


$('#modalEliminar').on('show.bs.modal', function () {
    $.ajax({
        url: '/obtener-usuarios', // Utiliza la misma ruta que para obtener usuarios
        type: 'GET',
        success: function(data) {
            var rows = '';
            data.forEach(function (user) {
                rows += `<tr>
                            <td>${user.id}</td>
                            <td>${user.nombre}</td>
                            <td><button class="btn btn-danger delete-user" data-user-id="${user.id}"><i class="bi bi-trash"></i></button></td>
                         </tr>`;
            });
            $('#deleteUsersTableBody').html(rows);
        },
        error: function(error) {
            console.log('Error al cargar los datos:', error);
        }
    });
});

$(document).on('click', '.delete-user', function() {
    var userId = $(this).data('user-id');
    if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
        $.ajax({
            url: '/eliminar-usuario/' + userId,
            type: 'DELETE',
            success: function() {
                alert('Usuario eliminado correctamente');
                $('#modalEliminar').modal('hide'); // Ocultar el modal
                location.reload(); // Recargar la página para actualizar la lista de usuarios
            },
            error: function(error) {
                alert('Error al eliminar el usuario');
                console.log(error);
            }
        });
    }
});



$('#modalActualizarPreguntas').on('show.bs.modal', function () {
    $.ajax({
        url: '/obtener-preguntas',
        type: 'GET',
        success: function(data) {
            var rows = '';
            data.forEach(function (pregunta) {
                rows += `<tr>
                            <td>${pregunta.id}</td>
                            <td>${pregunta.habilidad} 
                            <td>${pregunta.pregunta} 
                            <button class="btn btn-outline-secondary btn-sm"><i class="bi bi-pencil-square"></i></button></td>
                         </tr>`;
            });
            $('#preguntasTableBody').html(rows);
        },
        error: function(error) {
            console.log('Error al cargar los datos:', error);
        }
    });
});

$('#modalEliminarPreguntas').on('show.bs.modal', function () {
    $.ajax({
        url: '/obtener-preguntas', // Asegúrate de tener esta ruta configurada para devolver todas las preguntas
        type: 'GET',
        success: function(data) {
            var rows = '';
            data.forEach(function (pregunta) {
                rows += `<tr>
                            <td>${pregunta.id}</td>
                            <td>${pregunta.habilidad}</td>
                            <td>${pregunta.pregunta}</td>
                            <td><button class="btn btn-danger btn-sm" onclick="eliminarPregunta(${pregunta.id})"><i class="bi bi-trash"></i></button></td>
                         </tr>`;
            });
            $('#eliminarPreguntasTableBody').html(rows);
        },
        error: function(error) {
            console.log('Error al cargar los datos:', error);
        }
    });
});

function eliminarPregunta(id) {
    if (confirm('¿Estás seguro de que quieres eliminar esta pregunta?')) {
        $.ajax({
            url: `/eliminar-pregunta/${id}`, // Asegúrate de tener esta ruta configurada para eliminar la pregunta
            type: 'DELETE',
            success: function() {
                alert('Pregunta eliminada correctamente');
                $('#modalEliminarPreguntas').modal('hide');
                location.reload(); // Recargar la página para actualizar la lista
            },
            error: function(error) {
                alert('Error al eliminar la pregunta');
                console.log(error);
            }
        });
    }
}
// Función para agregar un nuevo usuario
// Función para agregar un nuevo usuario
function agregarUsuario() {
    const nombre = $('#nombreUsuario').val();
    const contrasena = $('#contrasenaUsuario').val();
    const establecimiento = $('#establecimientoUsuario').val();
    const rol = $('#rolUsuario').val();
  
    if (nombre && contrasena && establecimiento && rol) {
      $.ajax({
        url: '/agregar-usuario',
        type: 'POST',
        data: { nombre, contrasena, establecimiento, rol },
        success: function(response) {
          console.log(response.message);
          alert('Usuario agregado correctamente'); // Mostrar alerta
          $('#agregarUsuarioForm')[0].reset(); // Limpiar el formulario
          $('#modalAgregar').modal('hide'); // Cerrar el modal
        },
        error: function(error) {
          console.log('Error al agregar el usuario:', error);
          alert('Error al agregar el usuario'); // Mostrar alerta de error
        }
      });
    } else {
      console.log('Campos incompletos');
      alert('Por favor, complete todos los campos'); // Mostrar alerta de campos incompletos
    }
  }
  
  // Función para agregar una nueva pregunta
  function agregarPregunta() {
    const habilidad = $('#habilidadPregunta').val();
    const pregunta = $('#textoPregunta').val();
  
    if (habilidad && pregunta) {
      $.ajax({
        url: '/agregar-pregunta',
        type: 'POST',
        data: { habilidad, pregunta },
        success: function(response) {
          console.log(response.message);
          alert('Pregunta agregada correctamente'); // Mostrar alerta
          $('#formAgregarPregunta')[0].reset(); // Limpiar el formulario
          $('#modalAgregarPreguntas').modal('hide'); // Cerrar el modal
        },
        error: function(error) {
          console.log('Error al agregar la pregunta:', error);
          alert('Error al agregar la pregunta'); // Mostrar alerta de error
        }
      });
    } else {
      console.log('Campos incompletos');
      alert('Por favor, complete todos los campos'); // Mostrar alerta de campos incompletos
    }
  }
  // Función para actualizar un usuario
function actualizarUsuario(userId) {
    const nombre = prompt('Ingresa el nuevo nombre');
    const contrasena = prompt('Ingresa la nueva contraseña');
    const rol = prompt('Ingresa el nuevo rol');
  
    if (nombre && contrasena && rol) {
      $.ajax({
        url: `/actualizar-usuario/${userId}`,
        type: 'PUT',
        data: { nombre, contrasena, rol },
        success: function(response) {
          console.log(response.message);
          // Actualizar la tabla de usuarios después de la actualización
          cargarUsuarios();
        },
        error: function(error) {
          console.log('Error al actualizar el usuario:', error);
        }
      });
    } else {
      console.log('Campos incompletos');
    }
  }
  // Función para actualizar una pregunta
function actualizarPregunta(preguntaId) {
    const habilidad = prompt('Ingresa la nueva habilidad');
    const pregunta = prompt('Ingresa la nueva pregunta');
  
    if (habilidad && pregunta) {
      $.ajax({
        url: `/actualizar-pregunta/${preguntaId}`,
        type: 'PUT',
        data: { habilidad, pregunta },
        success: function(response) {
          console.log(response.message);
          // Actualizar la tabla de preguntas después de la actualización
          cargarPreguntas();
        },
        error: function(error) {
          console.log('Error al actualizar la pregunta:', error);
        }
      });
    } else {
      console.log('Campos incompletos');
    }
  }
  // Función para cargar los usuarios en la tabla
function cargarUsuarios() {
    $.ajax({
      url: '/obtener-usuarios',
      type: 'GET',
      success: function(usuarios) {
        var tableBody = $('#usuariosTableBody');
        tableBody.empty();
        usuarios.forEach(function(usuario) {
          var row = `
            <tr>
              <td>${usuario.id}</td>
              <td>${usuario.nombre}</td>
              <td>${usuario.contraseña}</td>
              <td>${usuario.rol}</td>
              <td><button class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#modalActualizarUsuario" onclick="cargarDatosUsuarioActualizar(${usuario.id}, '${usuario.nombre}', '${usuario.contraseña}', '${usuario.rol}')">Editar</button></td>
            </tr>
          `;
          tableBody.append(row);
        });
      },
      error: function() {
        console.log('Error al cargar usuarios');
      }
    });
  }
  
  // Función para cargar las preguntas en la tabla
  function cargarPreguntas() {
    $.ajax({
      url: '/obtener-preguntas',
      type: 'GET',
      success: function(preguntas) {
        var tableBody = $('#preguntasTableBody');
        tableBody.empty();
        preguntas.forEach(function(pregunta) {
          var row = `
            <tr>
              <td>${pregunta.id}</td>
              <td>${pregunta.habilidad}</td>
              <td>${pregunta.pregunta}</td>
              <td><button class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#modalActualizarPregunta" onclick="cargarDatosPreguntaActualizar(${pregunta.id}, '${pregunta.habilidad}', '${pregunta.pregunta}')">Editar</button></td>
            </tr>
          `;
          tableBody.append(row);
        });
      },
      error: function() {
        console.log('Error al cargar preguntas');
      }
    });
  }
  function cargarDatosUsuarioActualizar(id, nombre, contrasena, rol) {
    $('#idUsuarioActualizar').val(id);
    $('#nombreUsuarioActualizar').val(nombre);
    $('#contrasenaUsuarioActualizar').val(contrasena);
    $('#rolUsuarioActualizar').val(rol);
  }
  
  function cargarDatosPreguntaActualizar(id, habilidad, pregunta) {
    $('#idPreguntaActualizar').val(id);
    $('#habilidadPreguntaActualizar').val(habilidad);
    $('#textoPreguntaActualizar').val(pregunta);
  }
  // Función para actualizar un usuario
function actualizarUsuario() {
    const id = $('#idUsuarioActualizar').val();
    const nombre = $('#nombreUsuarioActualizar').val();
    const contrasena = $('#contrasenaUsuarioActualizar').val();
    const rol = $('#rolUsuarioActualizar').val();
  
    if (nombre && contrasena && rol) {
      $.ajax({
        url: `/actualizar-usuario/${id}`,
        type: 'PUT',
        data: { nombre, contrasena, rol },
        success: function(response) {
          console.log(response.message);
          $('#modalActualizarUsuario').modal('hide'); // Cerrar el modal
          cargarUsuarios(); // Actualizar la tabla de usuarios
        },
        error: function(error) {
          console.log('Error al actualizar el usuario:', error);
        }
      });
    } else {
      console.log('Campos incompletos');
    }
  }
  
  // Función para actualizar una pregunta
  function actualizarPregunta() {
    const id = $('#idPreguntaActualizar').val();
    const habilidad = $('#habilidadPreguntaActualizar').val();
    const pregunta = $('#textoPreguntaActualizar').val();
  
    if (habilidad && pregunta) {
      $.ajax({
        url: `/actualizar-pregunta/${id}`,
        type: 'PUT',
        data: { habilidad, pregunta },
        success: function(response) {
          console.log(response.message);
          $('#modalActualizarPregunta').modal('hide'); // Cerrar el modal
          cargarPreguntas(); // Actualizar la tabla de preguntas
        },
        error: function(error) {
          console.log('Error al actualizar la pregunta:', error);
        }
      });
    } else {
      console.log('Campos incompletos');
    }
  }
  function agregarMultiplesUsuarios() {
    const archivoUsuarios = document.getElementById('archivoUsuarios').files[0];
    const archivoTipo = archivoUsuarios.type;
  
    if (archivoTipo === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        archivoTipo === 'application/vnd.ms-excel' ||
        archivoTipo === 'application/pdf') {
      const formData = new FormData();
      formData.append('archivoUsuarios', archivoUsuarios);
  
      $.ajax({
        url: '/cargar-usuarios-multiple',
        type: 'POST',
        data: formData,
        contentType: false,
        processData: false,
        success: function(response) {
          console.log(response.message);
          alert('Usuarios agregados correctamente');
          $('#formAgregarMultiplesUsuarios')[0].reset();
          $('#modalAgregarMultiplesUsuarios').modal('hide');
          cargarUsuarios(); // Actualizar la tabla de usuarios
        },
        error: function(error) {
          console.log('Error al agregar los usuarios:', error);
          alert('Error al agregar los usuarios');
        }
      });
    } else {
      alert('Por favor, selecciona un archivo PDF o Excel');
    }
  }