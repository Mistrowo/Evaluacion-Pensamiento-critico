const activities = [
    {
        type: "image",
        src: "/images/imagenapp.jpg",
        questions: [
            { question_id: 52, habilidad: "Interpretación", pregunta: "Pregunta 1: ¿Cómo describirías la imagen?", "data-question-id": 52 },
            { question_id: 53, habilidad: "Análisis", pregunta: "Pregunta 2: ¿Qué mensaje o significado puedes encontrar en la imagen?", "data-question-id": 53 },
            { question_id: 54, habilidad: "Inferencia", pregunta: "Pregunta 3: ¿A qué conclusiones se pueden llegar a partir de la imagen?", "data-question-id": 54 },
            { question_id: 55, habilidad: "Evaluación", pregunta: "Pregunta 4: ¿Cómo evaluarías lo que aprendiste al observar esta imagen y cómo podrías usarlo en otras situaciones?", "data-question-id": 55 },
            { question_id: 56, habilidad: "Metacognición", pregunta: "Pregunta 5: ¿Qué preguntas te hiciste mientras mirabas la imagen? ¿Se respondieron algunas de esas preguntas?", "data-question-id": 56 }
        ]
    },
    {
        type: "video",
        src: "/video/video.mp4",
        questions: [
            { question_id: 57, habilidad: "Interpretación", pregunta: "Pregunta 1: ¿Cómo describirías el video?", "data-question-id": 57 },
            { question_id: 58, habilidad: "Análisis", pregunta: "Pregunta 2: ¿Qué mensaje o significado puedes encontrar en el video?", "data-question-id": 58 },
            { question_id: 59, habilidad: "Inferencia", pregunta: "Pregunta 3: ¿A qué conclusiones se pueden llegar a partir del video?", "data-question-id": 59 },
            { question_id: 60, habilidad: "Evaluación", pregunta: "Pregunta 4: ¿Cómo evaluarías lo que aprendiste al observar este video y cómo podrías usarlo en otras situaciones?", "data-question-id": 60 },
            { question_id: 61, habilidad: "Metacognición", pregunta: "Pregunta 5: ¿Qué preguntas te hiciste mientras mirabas el video? ¿Se respondieron algunas de esas preguntas?", "data-question-id": 61 }
        ]
    },
    {
        type: "text",
        content: ` La primera vez que vi la lluvia fue una tarde de verano en un patio interior. Ese patio era un mundo completo, con una fuente de pajaros en el centro, muchas flores y un viejo naranjo con el tronco blanco. Yo me hallaba contenta contemplando aquel árbol tan raro, cuyas hojas eran como una sustancia verde y tenía algunas frutas tan grandes y redondas como bolas de billar. De pronto escuché un ruido  sobre los techos de las casas vecinas, el cielo se oscureció y empezaron a caer gotas de agua fría, después fue un diluvio.
    
    Aquello me pareció extraordinario, un sonido aterrador y maravilloso. El patio se inundó de inmediato, los caminos se convirtieron en pequeños lagos, el naranjo sacudía sus ramas mojadas y enormes gotas rebotaban en el suelo y sobre la fuente. Me acurruqué en un rincón, me encontraba con miedo porque creí que el mundo se estaba rompiendo. Mi madre me tomó en sus brazos para tranquilizarme, me asomó al patio y me dijo que no tuviera miedo, que eso era sólo la lluvia, un fenómeno natural tan lindo como el sol.
    
    `,
        questions: [
            { question_id: 62, habilidad: "Interpretación", pregunta: "Pregunta 1: ¿Cómo describirías el texto?", "data-question-id": 62 },
            { question_id: 63, habilidad: "Análisis", pregunta: "Pregunta 2: ¿Qué mensaje o significado puedes encontrar en el texto?", "data-question-id": 63 },
            { question_id: 64, habilidad: "Inferencia", pregunta: "Pregunta 3: ¿A qué conclusiones se pueden llegar a partir del texto?", "data-question-id": 64 },
            { question_id: 65, habilidad: "Evaluación", pregunta: "Pregunta 4: ¿Cómo evaluarías lo que aprendiste al leer este texto y cómo podrías usarlo en otras situaciones?", "data-question-id": 65 },
            { question_id: 66, habilidad: "Metacognición", pregunta: "Pregunta 5: ¿Qué preguntas te hiciste mientras leías el texto? ¿Se respondieron algunas de esas preguntas?", "data-question-id": 66 }
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
    loadState();

    updateContent();
    updateProgressBar();
});

let currentActivity = 0;
let currentQuestion = 0;
let currentResponseSubmitted = false;
let currentVideo = null;
let responses = {}; // Objeto para almacenar las respuestas ingresadas

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
        video.classList.add('content-video'); 
        mediaContainer.appendChild(video);

        currentVideo = video; // Guardar referencia al video actual
    } else if (activity.type === 'text') {
        const textDiv = document.createElement('div');
        textDiv.className = 'text-content';

        const textParagraph = document.createElement('p');
        textParagraph.textContent = activity.content;
        
        const authorInfo = document.createElement('span');
        authorInfo.className = 'author';
        authorInfo.textContent = "Extracto de la novela 'Eva Luna' de Isabel Allende";
        
        textDiv.appendChild(textParagraph);
        textDiv.appendChild(authorInfo);

        mediaContainer.appendChild(textDiv);
    }

    const questionElement = document.querySelector('.question');
    questionElement.textContent = activity.questions[currentQuestion].pregunta; 

    const questionIdInput = document.querySelector('input[name="questionId"]');
    questionIdInput.value = activity.questions[currentQuestion].question_id;

    const sectionIndicator = document.getElementById('sectionIndicator');
    sectionIndicator.textContent = `Sección ${currentActivity + 1}`;
}


function updateProgressBar() {
    const progressBar = document.querySelector('.progress');
    const progressPercentage = ((currentQuestion + 1) / activities[currentActivity].questions.length) * 100;
    progressBar.style.width = `${progressPercentage}%`;
}

function submitResponse() {
    const form = document.getElementById('responseForm');
    const responseInput = form.querySelector('textarea[name="response"]');
    const response = responseInput.value.trim();

    if (response === '') {
        Swal.fire({
            icon: 'warning',
            title: '¡Advertencia!',
            text: 'Por favor, ingresa una respuesta antes de avanzar.',
        });
        return;
    }

    const questionIdInput = document.querySelector('input[name="questionId"]');
    const responseKey = `${currentActivity}-${currentQuestion}`;
    responses[responseKey] = response; // Guardar la respuesta localmente

    const params = new URLSearchParams();
    params.append('response', response);
    params.append('question_id', questionIdInput.value);
    params.append('pregunta', activities[currentActivity].questions[currentQuestion].pregunta);

    fetch('/save-response', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('Respuesta guardada:', data);
            currentResponseSubmitted = true;
            nextQuestion();
            saveState();
        } else {
            console.error('Error al guardar la respuesta:', data.message);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un error al guardar la respuesta. Intenta de nuevo.',
            });
        }
    })
    .catch(error => {
        console.error('Error al guardar la respuesta:', error);
    });
}


function nextQuestion() {
    const responseInput = document.querySelector('textarea[name="response"]');
    const response = responseInput.value.trim();

    if (response === '') {
        Swal.fire({
            icon: 'warning',
            title: '¡Advertencia!',
            text: 'Por favor, ingresa una respuesta antes de avanzar.',
        });
        return;
    }

    if (currentVideo) {
        currentVideo.pause(); // Pausar el video actual
    }

    if (currentQuestion < activities[currentActivity].questions.length - 1) {
        currentQuestion++;
    } else if (currentActivity < activities.length - 1) {
        currentActivity++;
        currentQuestion = 0;
    } else {
        Swal.fire({
            icon: 'success',
            title: '¡Felicidades!',
            text: 'Has completado todas las actividades.',
        }).then(() => {
            resetActivities();
        });
        return;
    }

    updateContent();
    updateProgressBar();
    saveState();
    responseInput.value = '';
}

function previousQuestion() {
    if (currentVideo) {
        currentVideo.pause(); // Pausar el video actual
    }

    if (currentQuestion > 0) {
        currentQuestion--;
    } else if (currentActivity > 0) {
        currentActivity--;
        currentQuestion = activities[currentActivity].questions.length - 1;
    }

    updateContent();
    updateProgressBar();
    saveState();
    const responseInput = document.querySelector('textarea[name="response"]');
    const responseKey = `${currentActivity}-${currentQuestion}`;
    if (responses[responseKey]) {
        responseInput.value = responses[responseKey];
    } else {
        responseInput.value = '';
    }
}

function resetActivities() {
    currentActivity = 0;
    currentQuestion = 0;
    currentResponseSubmitted = false;
    currentVideo = null;
    responses = {};
    updateContent();
    updateProgressBar();
    resetAndRedirect();
    const responseInput = document.querySelector('textarea[name="response"]');
    responseInput.value = '';
}

function resetAndRedirect() {
    localStorage.removeItem('activityState');
    window.location.href = '/finalizado';
}

function saveState() {
    const state = {
        currentActivity: currentActivity,
        currentQuestion: currentQuestion,
        currentResponseSubmitted: currentResponseSubmitted,
        responses: responses
    };
    localStorage.setItem('activityState', JSON.stringify(state));
}

function loadState() {
    const savedState = JSON.parse(localStorage.getItem('activityState'));
    if (savedState) {
        currentActivity = savedState.currentActivity;
        currentQuestion = savedState.currentQuestion;
        currentResponseSubmitted = savedState.currentResponseSubmitted;
        responses = savedState.responses || {};
        updateContent();
        updateProgressBar();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            window.location.href = '/logout';
        });
    }
    loadState();

    updateContent();
    updateProgressBar();
});
