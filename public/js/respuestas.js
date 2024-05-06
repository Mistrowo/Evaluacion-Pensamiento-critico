function eliminarCarta(id) {
    if (confirm("¿Estás seguro de que deseas eliminar esta respuesta?")) {
        fetch(`/eliminar-respuesta/${id}`, {
            method: 'DELETE'
        }).then(response => {
            if (response.ok) {
                const gridItem = document.getElementById(`respuesta-${id}`);
                gridItem.parentNode.removeChild(gridItem);
                console.log(`Respuesta con ID ${id} eliminada.`);
            } else {
                alert("Error al eliminar la respuesta.");
            }
        }).catch(error => {
            console.error('Error al eliminar la respuesta:', error);
            alert("Error al eliminar la respuesta.");
        });
    }
}


document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            window.location.href = '/logout';
        });
    }

    const volverBtn = document.getElementById('Volver');
    if (volverBtn) {
        volverBtn.addEventListener('click', () => {
            window.location.href = '/dashboardadmin';
        });
    }

    // Obtener las respuestas iniciales del servidor
    fetch('/obtener-respuestas')
        .then(response => response.json())
        .then(respuestas => {
            console.log('Respuestas:', respuestas);
            respuestas.forEach(respuesta => {
                const titulo = 'Respuestas';
                const contenido = `Nombre: ${respuesta.nombre}, Fecha: ${new Date(respuesta.fecha_respuesta).toLocaleString()}`;
                agregarElementoColumna(respuesta.id_respuesta, titulo, contenido, true);
            });
        })
        .catch(error => console.error('Error al obtener las respuestas:', error));
});


function agregarElementoColumna(id, titulo, contenido, esBoton = false) {
    const gridContainer = document.querySelector('.grid-container');
    const gridItem = document.createElement('div');
    gridItem.classList.add('grid-item');
    gridItem.id = `respuesta-${id}`;
    gridItem.innerHTML = `
        <h3>${titulo} <i class="fas fa-trash" onclick="eliminarCarta(${id})"></i></h3>
        <p>${contenido}</p>
        ${esBoton ? `<button>Calcular</button>` : ''}
    `;
    gridContainer.appendChild(gridItem);
}
