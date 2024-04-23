const questions = [
    {
        type: "image",
        src: "/images/imagenejemplo.jpg",
        question: "¿Cuál es tu opinión sobre la imagen?"
    },
    {
        type: "video",
        src: "/videos/ejemplovideo.mp4",
        question: "¿Qué emociones te transmite este video?"
    },
    {
        type: "text",
        content: "Probando el campo del texto 1234",
        question: "¿Cuál es tu opinión sobre este texto?"
    }
];




document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            window.location.href = '/logout';
        });
    }

    
});

let currentQuestion = 0;

document.addEventListener('DOMContentLoaded', () => {
    // Controlador para el botón de cierre de sesión
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            window.location.href = '/logout';
        });
    }

    const backButton = document.querySelector('.buttons button:nth-child(1)'); 
    const nextButton = document.querySelector('.buttons button:nth-child(3)'); 

    backButton.addEventListener('click', () => {
        if (currentQuestion > 0) {
            currentQuestion--;
            updateContent();
            updateProgressBar();
        }
    });

    nextButton.addEventListener('click', () => {
        if (currentQuestion < questions.length - 1) {
            currentQuestion++;
            updateContent();
            updateProgressBar();
        } else {
            console.log("Has completado todas las preguntas.");
        }
    });

    updateContent();
});

function updateContent() {
    const mediaContainer = document.querySelector('.content');
    mediaContainer.innerHTML = '';

    // Crea el elemento adecuado basado en el tipo de contenido
    if (questions[currentQuestion].type === 'image') {
        const img = document.createElement('img');
        img.src = questions[currentQuestion].src;
        img.alt = "Imagen de ejemplo";
        mediaContainer.appendChild(img);
    } else if (questions[currentQuestion].type === 'video') {
        const video = document.createElement('video');
        video.src = questions[currentQuestion].src;
        video.controls = true;
        video.autoplay = true;
        mediaContainer.appendChild(video);
    } else if (questions[currentQuestion].type === 'text') {
        const textDiv = document.createElement('div');
        textDiv.textContent = questions[currentQuestion].content;
        textDiv.className = 'text-content';
        mediaContainer.appendChild(textDiv);
    }

    // Función para obtener una pregunta aleatoria del servidor y actualizar el DOM
    fetch('/random-question')
        .then(response => response.json())
        .then(data => {
            const questionElement = document.querySelector('.question');
            questionElement.textContent = data.pregunta; // Actualiza la pregunta con la respuesta del servidor
        })
        .catch(error => {
            console.error('Error al obtener la pregunta:', error);
        });
}



function updateProgressBar() {
    const progressBar = document.querySelector('.progress');
    const progressPercentage = ((currentQuestion + 1) / questions.length) * 100;
    progressBar.style.width = `${progressPercentage}%`;
}


