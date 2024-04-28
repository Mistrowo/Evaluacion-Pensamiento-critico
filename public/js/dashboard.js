const activities = [
    {
        type: "image",
        src: "/images/imagenejemplo.jpg",
        questions: [
            { id: 1, habilidad: "Interpretación", pregunta: "¿Cuál es tu opinión sobre la imagen?", "data-question-id": 1 },
            { id: 2, habilidad: "Análisis", pregunta: "¿Qué detalles puedes observar en la imagen?", "data-question-id": 2 },
            { id: 3, habilidad: "Inferencia", pregunta: "¿Qué crees que sucede en la imagen?", "data-question-id": 3 },
            { id: 4, habilidad: "Evaluación", pregunta: "¿Qué opinión te merece lo que muestra la imagen?", "data-question-id": 4 },
            { id: 5, habilidad: "Metacognición", pregunta: "¿Cómo te hace sentir esta imagen?", "data-question-id": 5 }
        ]
    },
    {
        type: "video",
        src: "/videos/ejemplovideo.mp4",
        questions: [
            { id: 6, habilidad: "Interpretación", pregunta: "¿Qué emociones te transmite este video?", "data-question-id": 6 },
            { id: 7, habilidad: "Análisis", pregunta: "¿Cuáles son los elementos principales del video?", "data-question-id": 7 },
            { id: 8, habilidad: "Inferencia", pregunta: "¿Qué conclusiones puedes sacar del video?", "data-question-id": 8 },
            { id: 9, habilidad: "Evaluación", pregunta: "¿El video comunica un mensaje claro?", "data-question-id": 9 },
            { id: 10, habilidad: "Metacognición", pregunta: "¿Qué aprendiste al ver este video?", "data-question-id": 10 }
        ]
    },
    {
        type: "text",
        content: "Probando el campo del texto 1234",
        questions: [
            { id: 11, habilidad: "Interpretación", pregunta: "¿Cuál es tu opinión sobre este texto?", "data-question-id": 11 },
            { id: 12, habilidad: "Análisis", pregunta: "¿Cuáles son las ideas principales del texto?", "data-question-id": 12 },
            { id: 13, habilidad: "Inferencia", pregunta: "¿Qué mensaje intenta transmitir el autor?", "data-question-id": 13 },
            { id: 14, habilidad: "Evaluación", pregunta: "¿El texto logra su objetivo?", "data-question-id": 14 },
            { id: 15, habilidad: "Metacognición", pregunta: "¿Qué pensamientos te provocó este texto?", "data-question-id": 15 }
        ]
    }
];

document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            window.location.href = '/logout';
        });
    }

    updateContent();
    updateProgressBar();
});

let currentActivity = 0;
let currentQuestion = 0;

function updateContent() {
    const activity = activities[currentActivity];
    const mediaContainer = document.querySelector('.content');
    mediaContainer.innerHTML = ''; 

    
    if (activity.type === 'image') {
        const img = document.createElement('img');
        img.src = activity.src;
        img.alt = "Imagen de ejemplo";
        img.classList.add('content-img'); 
        mediaContainer.appendChild(img);
    } else if (activity.type === 'video') {
        const video = document.createElement('video');
        video.src = activity.src;
        video.controls = true;
        video.autoplay = true;
        video.classList.add('content-video'); 
        mediaContainer.appendChild(video);
    } else if (activity.type === 'text') {
        const textDiv = document.createElement('div');
        textDiv.textContent = activity.content;
        textDiv.className = 'text-content';
        mediaContainer.appendChild(textDiv);
    }

    const questionElement = document.querySelector('.question');
    questionElement.textContent = activity.questions[currentQuestion].pregunta; 

    const questionIdInput = document.querySelector('input[name="questionId"]');
    questionIdInput.value = activity.questions[currentQuestion]['data-question-id'];
}

function updateProgressBar() {
    const progressBar = document.querySelector('.progress');
    const progressPercentage = ((currentQuestion + 1) / activities[currentActivity].questions.length) * 100;
    progressBar.style.width = `${progressPercentage}%`;
}

function submitResponse() {
    const form = document.getElementById('responseForm');
    const responseInput = form.querySelector('textarea[name="response"]');
    const response = responseInput.value;

    const params = new URLSearchParams();
    params.append('response', response);

    console.log('Datos enviados:', params.toString());

    fetch('/save-response', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
    })
    .then(response => response.json())
    .then(data => {
        console.log('Respuesta del servidor:', data);
        nextQuestion();
    })
    .catch(error => {
        console.error('Error al guardar la respuesta:', error);
    });
}

function nextQuestion() {
    if (currentQuestion < activities[currentActivity].questions.length - 1) {
        currentQuestion++;
    } else if (currentActivity < activities.length - 1) {
        currentActivity++;
        currentQuestion = 0; 
    } else {
        alert("¡Felicidades! Has completado todas las actividades.");
        resetActivities(); 
    }
    updateContent();
    updateProgressBar();
}

function previousQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
    } else if (currentActivity > 0) {
        currentActivity--;
        currentQuestion = activities[currentActivity].questions.length - 1;
    }
    updateContent();
    updateProgressBar();
}

function resetActivities() {
    currentActivity = 0;
    currentQuestion = 0;
    const cardContainer = document.querySelector('.card-container');
    cardContainer.style.display = 'block'; 
    updateContent();
    updateProgressBar();
}