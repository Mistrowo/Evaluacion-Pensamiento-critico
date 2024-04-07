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
