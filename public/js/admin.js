document.addEventListener('DOMContentLoaded', () => {
    // Controlador para el botón de cierre de sesión
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            window.location.href = '/logout';
        });
    }

    // Cargar datos dinámicos en los modales
    $('#modalActualizarBtn').on('click', function () {
        $.ajax({
            url: '/obtener-usuarios',
            type: 'GET',
            success: function(data) {
                var rows = '';
                data.forEach(function (user, index) {
                    rows += `<tr>
                                <td>${index + 1}</td>
                                <td>${user.nombre}</td>
                                <td>${user.contraseña}</td>
                                <td>${user.rol}</td>
                                <td><button class="btn btn-sm btn-outline-secondary edit-user" data-user-id="${user.id}" data-bs-toggle="modal" data-bs-target="#modalEditarUsuario"><i class="bi bi-pencil-square"></i></button></td>
                             </tr>`;
                });
                $('#usuariosTableBody').html(rows);
                $('#modalActualizar').modal('show');
            },
            error: function(error) {
                console.log('Error al cargar los datos:', error);
            }
        });
    });

    $('#modalEliminarBtn').on('click', function () {
        $.ajax({
            url: '/obtener-usuarios',
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
                $('#modalEliminar').modal('show');
            },
            error: function(error) {
                console.log('Error al cargar los datos:', error);
            }
        });
    });

    $('#modalAgregarUsuarioBtn').on('click', function () {
        $('#modalAgregar').modal('show');
    });

    $('#modalActualizarPreguntasBtn').on('click', function () {
        $.ajax({
            url: '/obtener-preguntas',
            type: 'GET',
            success: function(data) {
                var rows = '';
                data.forEach(function (pregunta, index) {
                    rows += `<tr>
                                <td>${index + 1}</td>
                                <td>${pregunta.habilidad}</td>
                                <td>${pregunta.pregunta}</td>
                                <td><button class="btn btn-outline-secondary btn-sm edit-pregunta" data-pregunta-id="${pregunta.id}" data-habilidad="${pregunta.habilidad}" data-pregunta="${pregunta.pregunta}" data-bs-toggle="modal" data-bs-target="#modalEditarPregunta"><i class="bi bi-pencil-square"></i></button></td>
                             </tr>`;
                });
                $('#preguntasTableBody').html(rows);
                $('#modalActualizarPreguntas').modal('show');
            },
            error: function(error) {
                console.log('Error al cargar los datos:', error);
            }
        });
    });

    $('#modalEliminarPreguntasBtn').on('click', function () {
        $.ajax({
            url: '/obtener-preguntas',
            type: 'GET',
            success: function(data) {
                var rows = '';
                data.forEach(function (pregunta) {
                    rows += `<tr>
                                <td>${pregunta.id}</td>
                                <td>${pregunta.habilidad}</td>
                                <td>${pregunta.pregunta}</td>
                                <td><button class="btn btn-danger btn-sm" onclick="eliminarPregunta(${pregunta.id})"><i class="bi bi-trash"></i></button></td>`;
                });
                $('#eliminarPreguntasTableBody').html(rows);
                $('#modalEliminarPreguntas').modal('show');
            },
            error: function(error) {
                console.log('Error al cargar los datos:', error);
            }
        });
    });

    $('#modalAgregarPreguntasBtn').on('click', function () {
        $('#modalAgregarPreguntas').modal('show');
    });

    $('#analisisRespuestasBtn').click(function() {
        window.location.href = '/analisis-respuestas';
    });

    $('#modalAgregarMultiplesUsuariosBtn').on('click', function () {
        Swal.fire({
            title: 'Agregar Múltiples Usuarios',
            html: `
                <input type="file" id="archivoUsuarios" class="swal2-file">
            `,
            focusConfirm: false,
            preConfirm: () => {
                const archivoUsuarios = Swal.getPopup().querySelector('#archivoUsuarios').files[0];
                if (!archivoUsuarios) {
                    Swal.showValidationMessage(`Por favor, selecciona un archivo`);
                    return;
                }
                return { archivoUsuarios };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const formData = new FormData();
                formData.append('archivoUsuarios', result.value.archivoUsuarios);

                $.ajax({
                    url: '/cargar-usuarios-multiple',
                    type: 'POST',
                    data: formData,
                    contentType: false,
                    processData: false,
                    success: function(response) {
                        Swal.fire(
                            '¡Agregado!',
                            'Los usuarios han sido agregados.',
                            'success'
                        );
                        // Opcional: Recargar la página o actualizar la lista de usuarios
                    },
                    error: function(error) {
                        Swal.fire(
                            'Error!',
                            'Hubo un problema al agregar los usuarios.',
                            'error'
                        );
                        console.log('Error al agregar los usuarios:', error);
                    }
                });
            }
        });
    });

    // Handle edit user button click
    $(document).on('click', '.edit-user', function() {
        var userId = $(this).data('user-id');
        $.ajax({
            url: '/obtener-usuario/' + userId,
            type: 'GET',
            success: function(user) {
                $('#editUserId').val(user.id);
                $('#editUserNombre').val(user.nombre);
                $('#editUserContrasena').val(user.contraseña);
                $('#editUserRol').val(user.rol);
                $('#modalEditarUsuario').modal('show');
            },
            error: function(error) {
                console.log('Error al cargar los datos del usuario:', error);
            }
        });
    });

    $('#formEditarUsuario').on('submit', function(event) {
        event.preventDefault();
        var userId = $('#editUserId').val();
        var nombre = $('#editUserNombre').val();
        var contrasena = $('#editUserContrasena').val();
        var rol = $('#editUserRol').val();

        $.ajax({
            url: '/actualizar-usuario/' + userId,
            type: 'PUT',
            data: { nombre, contrasena, rol },
            success: function(response) {
                Swal.fire(
                    '¡Actualizado!',
                    'El usuario ha sido actualizado.',
                    'success'
                );
                $('#modalEditarUsuario').modal('hide');
                $('#modalActualizar').modal('hide');
                location.reload();
            },
            error: function(error) {
                Swal.fire(
                    'Error!',
                    'Hubo un problema al actualizar el usuario.',
                    'error'
                );
                console.log('Error al actualizar el usuario:', error);
            }
        });
    });

    // Handle edit pregunta button click
    $(document).on('click', '.edit-pregunta', function() {
        var preguntaId = $(this).data('pregunta-id');
        var habilidad = $(this).data('habilidad');
        var pregunta = $(this).data('pregunta');

        $('#editPreguntaId').val(preguntaId);
        $('#editPreguntaHabilidad').val(habilidad);
        $('#editPreguntaTexto').val(pregunta);
        $('#modalEditarPregunta').modal('show');
    });

    $('#formEditarPregunta').on('submit', function(event) {
        event.preventDefault();
        var preguntaId = $('#editPreguntaId').val();
        var habilidad = $('#editPreguntaHabilidad').val();
        var pregunta = $('#editPreguntaTexto').val();

        $.ajax({
            url: '/actualizar-pregunta/' + preguntaId,
            type: 'PUT',
            data: { habilidad, pregunta },
            success: function(response) {
                Swal.fire(
                    '¡Actualizado!',
                    'La pregunta ha sido actualizada.',
                    'success'
                );
                $('#modalEditarPregunta').modal('hide');
                $('#modalActualizarPreguntas').modal('hide');
                location.reload();
            },
            error: function(error) {
                Swal.fire(
                    'Error!',
                    'Hubo un problema al actualizar la pregunta.',
                    'error'
                );
                console.log('Error al actualizar la pregunta:', error);
            }
        });
    });

    // Handle delete user button click
    $(document).on('click', '.delete-user', function() {
        var userId = $(this).data('user-id');
        Swal.fire({
            title: '¿Estás seguro?',
            text: "No podrás revertir esto!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminarlo!',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    url: `/eliminar-usuario/${userId}`,
                    type: 'DELETE',
                    success: function() {
                        Swal.fire(
                            'Eliminado!',
                            'El usuario ha sido eliminado.',
                            'success'
                        );
                        $('#modalEliminar').modal('hide');
                        location.reload();
                    },
                    error: function(error) {
                        Swal.fire(
                            'Error!',
                            'Hubo un problema al eliminar el usuario.',
                            'error'
                        );
                        console.log(error);
                    }
                });
            }
        });
    });
    
});

function eliminarPregunta(id) {
    Swal.fire({
        title: '¿Estás seguro?',
        text: "No podrás revertir esto!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminarlo!'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: `/eliminar-pregunta/${id}`,
                type: 'DELETE',
                success: function() {
                    Swal.fire(
                        'Eliminado!',
                        'La pregunta ha sido eliminada.',
                        'success'
                    );
                    $('#modalEliminarPreguntas').modal('hide');
                    location.reload();
                },
                error: function(error) {
                    Swal.fire(
                        'Error!',
                        'Hubo un problema al eliminar la pregunta.',
                        'error'
                    );
                    console.log(error);
                }
            });
        }
    });
}

function agregarUsuario() {
    const nombre = $('#nombreUsuario').val();
    const contrasena = $('#nombreUsuario').val();
    const establecimiento = $('#establecimientoUsuario').val();
    const rol = $('#rolUsuario').val();
    const curso = $('#cursoUsuario').val();

    if (nombre && contrasena && establecimiento && rol && curso) {
        $.ajax({
            url: '/agregar-usuario',
            type: 'POST',
            data: { nombre, contrasena, establecimiento, rol, curso },
            success: function(response) {
                Swal.fire(
                    '¡Agregado!',
                    'El usuario ha sido agregado.',
                    'success'
                );
                $('#agregarUsuarioForm')[0].reset();
                $('#modalAgregar').modal('hide');
            },
            error: function(error) {
                Swal.fire(
                    'Error!',
                    'Hubo un problema al agregar el usuario.',
                    'error'
                );
                console.log('Error al agregar el usuario:', error);
            }
        });
    } else {
        Swal.fire(
            'Campos incompletos',
            'Por favor, completa todos los campos.',
            'warning'
        );
    }
}

function agregarPregunta() {
    const habilidad = $('#habilidadPregunta').val();
    const pregunta = $('#textoPregunta').val();

    if (habilidad && pregunta) {
        $.ajax({
            url: '/agregar-pregunta',
            type: 'POST',
            data: { habilidad, pregunta },
            success: function(response) {
                Swal.fire(
                    '¡Agregado!',
                    'La pregunta ha sido agregada.',
                    'success'
                );
                $('#formAgregarPregunta')[0].reset();
                $('#modalAgregarPreguntas').modal('hide');
            },
            error: function(error) {
                Swal.fire(
                    'Error!',
                    'Hubo un problema al agregar la pregunta.',
                    'error'
                );
                console.log('Error al agregar la pregunta:', error);
            }
        });
    } else {
        Swal.fire(
            'Campos incompletos',
            'Por favor, completa todos los campos.',
            'warning'
        );
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
                Swal.fire(
                    '¡Agregado!',
                    'Los usuarios han sido agregados.',
                    'success'
                );
                $('#formAgregarMultiplesUsuarios')[0].reset();
                $('#modalAgregarMultiplesUsuarios').modal('hide');
            },
            error: function(error) {
                Swal.fire(
                    'Error!',
                    'Hubo un problema al agregar los usuarios.',
                    'error'
                );
                console.log('Error al agregar los usuarios:', error);
            }
        });
    } else {
        Swal.fire(
            'Archivo inválido',
            'Por favor, selecciona un archivo PDF o Excel.',
            'warning'
        );
    }
}
