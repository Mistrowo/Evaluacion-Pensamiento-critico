
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
