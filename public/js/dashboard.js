const activities = [
    {
        type: "image",
        src: "/images/imagenapp.jpg",
        questions: [
            { question_id: "1", habilidad: "Interpretación", pregunta: "Pregunta 1: ¿Cómo describirías la imagen?", "data-question-id": 1 },
            { question_id: "2", habilidad: "Análisis", pregunta: " Pregunta 2: ¿Qué mensaje o significado puedes encontrar en la imagen?", "data-question-id": 2 },
            { question_id: "3", habilidad: "Inferencia", pregunta: "Pregunta 3: ¿A qué conclusiones se pueden llegar a partir de la imagen?", "data-question-id": 3 },
            { question_id: "4", habilidad: "Evaluación", pregunta: "Pregunta 4: ¿Cómo evaluarías lo que aprendiste al observar esta imagen y cómo podrías usarlo en otras situaciones?", "data-question-id": 4 },
            { question_id: "5", habilidad: "Metacognición", pregunta: "Pregunta 5: ¿Qué preguntas te hiciste mientras mirabas la imagen? ¿Se respondieron algunas de esas preguntas?", "data-question-id": 5 }
        ]
    },
    {
        type: "video",
        src: "/video/video.mp4",
        questions: [
            { question_id: "6", habilidad: "Interpretación", pregunta: "Pregunta 1: s¿Cómo describirías el video?", "data-question-id": 6 },
            { question_id: "7", habilidad: "Análisis", pregunta: "Pregunta 2: ¿Qué mensaje o significado puedes encontrar en el video?", "data-question-id": 7 },
            { question_id: "8", habilidad: "Inferencia", pregunta: "Pregunta 3: ¿A qué conclusiones se pueden llegar a partir del video?", "data-question-id": 8 },
            { question_id: "9", habilidad: "Evaluación", pregunta: "Pregunta 4: ¿Cómo evaluarías lo que aprendiste al observar este video y cómo podrías usarlo en otras situaciones?", "data-question-id": 9 },
            { question_id: "10", habilidad: "Metacognición", pregunta: "Pregunta 5: ¿Qué preguntas te hiciste mientras mirabas el video? ¿Se respondieron algunas de esas preguntas?", "data-question-id": 10 }
        ]
    },
    {
        type: "text",
        content: ` La primera vez que vi la lluvia fue una tarde de verano en un patio interior. Ese patio era un mundo completo, con una fuente de azulejos en el centro, arriates de flores y un viejo naranjo con el tronco blanco de cal. Yo me hallaba fascinada contemplando aquel árbol tan raro, cuyas hojas eran como de laca verde y tenía algunas frutas tan grandes y redondas como bolas de billar. De pronto escuché un ruido ensordecedor sobre los techos de las casas vecinas, el cielo se oscureció y empezaron a caer gotas de agua fría, después fue un diluvio._
    
    > Aquello me pareció extraordinario, un prodigio aterrador y maravilloso. El patio se inundó de inmediato, los arriates se convirtieron en pequeños lagos, el naranjo sacudía sus ramas empapadas y enormes gotas rebotaban en el suelo y sobre la fuente. Me acurruqué en un rincón, sollozando de pánico porque creí que el mundo se estaba disolviendo. Mi madre me tomó en sus brazos para tranquilizarme, me asomó al aguacero y me dijo que no tuviera miedo, que eso era sólo la lluvia, un fenómeno natural tan beneficioso como el sol.
    
    _Extracto de la novela "Eva Luna" de Isabel Allende`,
        questions: [
            { question_id: "11", habilidad: "Interpretación", pregunta: " Pregunta 1: ¿Cómo describirías el texto?", "data-question-id": 11 },
            { question_id: "12", habilidad: "Análisis", pregunta: "Pregunta 2: ¿Qué mensaje o significado puedes encontrar en el texto?", "data-question-id": 12 },
            { question_id: "13", habilidad: "Inferencia", pregunta: "Pregunta 3: ¿A qué conclusiones se pueden llegar a partir del texto?", "data-question-id": 13 },
            { question_id: "14", habilidad: "Evaluación", pregunta: "Pregunta 4: ¿Cómo evaluarías lo que aprendiste al leer este texto y cómo podrías usarlo en otras situaciones?", "data-question-id": 14 },
            { question_id: "15", habilidad: "Metacognición", pregunta: "Pregunta 5: ¿Qué preguntas te hiciste mientras leías el texto? ¿Se respondieron algunas de esas preguntas?", "data-question-id": 15 }
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
        textDiv.textContent = activity.content;
        textDiv.className = 'text-content';
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
    console.log('questionIdInput:', questionIdInput);

    const params = new URLSearchParams();
    params.append('response', response);
    params.append('question_id', questionIdInput.value);
    console.log('activities[currentActivity].questions:', activities[currentActivity].questions);
    console.log('currentQuestion:', currentQuestion);
    params.append('pregunta', activities[currentActivity].questions[currentQuestion].pregunta);

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
        currentResponseSubmitted = true;
        nextQuestion();
        saveState();
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

    // Limpia el contenido del campo de texto después de actualizar el contenido de la pregunta
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

    // Limpia el contenido del campo de texto después de actualizar el contenido de la pregunta
    const responseInput = document.querySelector('textarea[name="response"]');
    responseInput.value = '';
}

function resetActivities() {
    currentActivity = 0;
    currentQuestion = 0;
    currentResponseSubmitted = false;
    currentVideo = null;
    updateContent();
    updateProgressBar();
    resetAndRedirect();

    // Limpia el contenido del campo de texto después de reiniciar las actividades
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
      currentResponseSubmitted: currentResponseSubmitted
    };
    localStorage.setItem('activityState', JSON.stringify(state));
}

function loadState() {
    const savedState = JSON.parse(localStorage.getItem('activityState'));
    if (savedState) {
        currentActivity = savedState.currentActivity;
        currentQuestion = savedState.currentQuestion;
        currentResponseSubmitted = savedState.currentResponseSubmitted;
        updateContent();
        updateProgressBar();
    }
}
