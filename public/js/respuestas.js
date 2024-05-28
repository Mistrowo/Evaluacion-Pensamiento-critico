const API_KEY = "sk-proj-AMvrv5XIi1MrmCWM6d45T3BlbkFJX8JMaYag5oRBhjQWnisc";

function eliminarCarta(idGeneral) {
    if (confirm("¿Estás seguro de que deseas eliminar todas las respuestas asociadas?")) {
        fetch(`/eliminar-respuestas-general/${idGeneral}`, {
            method: 'DELETE'
        }).then(response => {
            if (response.ok) {
                // Eliminar todas las cartas asociadas al idGeneral
                const respuestas = document.querySelectorAll(`[id^="respuesta-general-${idGeneral}"]`);
                respuestas.forEach(respuesta => respuesta.parentNode.removeChild(respuesta));
                console.log(`Respuestas con ID general ${idGeneral} eliminadas.`);
            } else {
                alert("Error al eliminar las respuestas.");
            }
        }).catch(error => {
            console.error('Error al eliminar las respuestas:', error);
            alert("Error al eliminar las respuestas.");
        });
    }
}


const rubrica = `
Imagen:
Habilidad
2 puntos
1 punto
0 puntos
Interpretación
Expresa una opinión fundamentada sobre el significado/impresión general que transmite la imagen.
Expresa una opinión superficial o simplista sobre la imagen.
No logra expresar una opinión coherente sobre la imagen.
Análisis
Identifica acertadamente los detalles visuales clave de la imagen (personajes, objetos, colores, etc.).
Identifica algunos detalles visuales de manera parcial o confusa.
No logra identificar detalles visuales relevantes de la imagen.
Inferencia
Infiere apropiadamente el mensaje/significado subyacente respaldado por detalles de la imagen.
Realiza algunas inferencias básicas o poco fundamentadas a partir de la imagen.
No va más allá de lo literal, sin hacer inferencias de la imagen.
Evaluación
Evalúa críticamente la efectividad de la imagen para transmitir su mensaje, con argumentos sólidos.
Intenta evaluar pero los argumentos son débiles o simplistas.
No logra hacer una evaluación crítica de la imagen.
Metacognición
Explica apropiada y detalladamente sus sentimientos, impresiones personales que le provocó la imagen.
Explica vagamente algunos elementos metacognitivos básicos sobre la imagen.
No demuestra conciencia metacognitiva sobre su experiencia con la imagen.

Texto:
Habilidad
2 puntos
1 punto
0 puntos
Interpretación
Expresa una opinión fundamentada sobre el contenido/impresión general del texto.
Expresa una opinión superficial o simplista sobre el texto.
No logra expresar una opinión coherente sobre el texto.
Análisis
Identifica acertadamente las ideas principales y secundarias del texto.
Identifica algunas ideas principales/secundarias de manera parcial o confusa.
No logra identificar ideas principales/secundarias relevantes.
Inferencia
Infiere apropiadamente el mensaje/intenciones subyacentes respaldadas por elementos del texto.
Realiza algunas inferencias básicas o poco fundamentadas a partir del texto.
No va más allá de lo literal, sin hacer inferencias del texto.
Evaluación
Evalúa críticamente si el texto logra su objetivo, con argumentos sólidos.
Intenta evaluar pero los argumentos son débiles o simplistas.
No logra hacer una evaluación crítica del texto.
Metacognición
Explica apropiada y detalladamente sus pensamientos, reflexiones personales que le provocó el texto.
Explica vagamente algunos elementos metacognitivos básicos sobre el texto.
No demuestra conciencia metacognitiva sobre su experiencia con el texto.

Video:
Habilidad
2 puntos
1 punto
0 puntos
Interpretación
Expresa claramente las emociones/sentimientos que le transmite el video, relacionándolos con detalles específicos.
Expresa algunas emociones/sentimientos vagos o superficiales provocados por el video.
No logra expresar emociones/sentimientos coherentes provocados por el video.
Análisis
Identifica acertadamente los elementos principales del video (personajes, situaciones, escenarios, etc.).
Identifica algunos elementos principales del video de manera parcial o confusa.
No logra identificar elementos principales relevantes del video.
Inferencia
Infiere apropiadamente conclusiones/mensajes subyacentes respaldados por detalles del video.
Realiza algunas inferencias básicas o poco fundamentadas a partir del video.
No va más allá de lo literal, sin hacer inferencias del video.
Evaluación
Evalúa críticamente si el video comunica un mensaje claro y efectivo, con argumentos sólidos a favor y en contra.
Intenta evaluar pero los argumentos son débiles o simplistas.
No logra hacer una evaluación crítica sobre la claridad y efectividad del video.
Metacognición
Explica apropiada y detalladamente sus aprendizajes, reflexiones y experiencia personal.
Explica vagamente algunos elementos metacognitivos básicos sobre el video.
No demuestra conciencia metacognitiva sobre su experiencia con el video.
`;

async function getCompletion(prompt) {
    const response = await fetch(`https://api.openai.com/v1/chat/completions`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            max_tokens: 300,
        }),
    });
    const data = await response.json();
    console.log('Respuesta de la API:', data); // Agregado para depuración
    return data;
}

function mostrarLoader(idGeneral) {
    const analysisContainer = document.querySelector('.analysis-container');
    analysisContainer.innerHTML = `<div class="loader"></div>`; // Añade el loader

    // Configura el tiempo después del cual el loader será reemplazado por la respuesta de la API
    setTimeout(async () => {
        await mostrarRespuesta(analysisContainer, idGeneral);
    }, 5000); // 5000 ms = 5 segundos
}

async function mostrarRespuesta(container, idGeneral) {
    try {
        const respuestas = await fetch(`/obtener-respuestas-general/${idGeneral}`).then(res => res.json());
        const evaluaciones = [];

        for (let i = 0; i < respuestas.length; i++) {
            const r = respuestas[i];
            const prompt = `${rubrica}\n\nPregunta: ${r.pregunta}\nRespuesta: ${r.respuesta}\n\nProporciona un análisis y puntaje basados en la rúbrica.`;
            
            console.log('Prompt enviado a la API:', prompt); // Agregado para depuración

            const response = await getCompletion(prompt);
            const evaluacion = response.choices[0].message.content.trim();

            evaluaciones.push({
                id: r.id_respuesta,
                pregunta: r.pregunta,
                respuesta: r.respuesta,
                analisis: evaluacion,
                puntaje: extractScore(evaluacion) // Implementa esta función para extraer el puntaje del análisis
            });
        }

        renderEvaluaciones(container, evaluaciones);
    } catch (error) {
        console.error('Error al obtener la evaluación:', error);
        container.innerHTML = '<div class="error-message">Error al obtener la evaluación</div>';
    }
}

function extractScore(evaluacion) {
    const scoreRegex = /Puntaje: (\d+)/i;
    const match = evaluacion.match(scoreRegex);
    return match ? match[1] : 'N/A';
}

function renderEvaluaciones(container, evaluaciones) {
    const tableRows = evaluaciones.map((eval, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${eval.pregunta}</td>
            <td>${eval.respuesta}</td>
            <td>${eval.analisis}</td>
            <td>${eval.puntaje}</td>
        </tr>
    `).join('');

    container.innerHTML = `
        <div class="scroll-container">
            <table class="table-auto w-full">
                <thead>
                    <tr>
                        <th class="px-4 py-2">N</th>
                        <th class="px-4 py-2">Pregunta</th>
                        <th class="px-4 py-2">Respuesta</th>
                        <th class="px-4 py-2">Análisis de ChatGPT</th>
                        <th class="px-4 py-2">Puntaje</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        </div>
    `;
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
            const respuestasAgrupadas = agruparPorIdGeneral(respuestas);
            for (const [idGeneral, grupo] of Object.entries(respuestasAgrupadas)) {
                const titulo = 'Respuestas';
                const contenido = `Nombre: ${grupo[0].nombre}, Fecha: ${new Date(grupo[0].fecha_respuesta).toLocaleString()}`;
                agregarElementoColumna(idGeneral, titulo, contenido, true);
            }
        })
        .catch(error => console.error('Error al obtener las respuestas:', error));
});

function agruparPorIdGeneral(respuestas) {
    return respuestas.reduce((acc, respuesta) => {
        const idGeneral = respuesta.id_respuesta_general || respuesta.id_respuesta;
        if (!acc[idGeneral]) {
            acc[idGeneral] = [];
        }
        acc[idGeneral].push(respuesta);
        return acc;
    }, {});
}

function agregarElementoColumna(idGeneral, titulo, contenido, esBoton = false) {
    const gridContainer = document.querySelector('.grid-container');
    const gridItem = document.createElement('div');
    gridItem.classList.add('grid-item');
    gridItem.id = `respuesta-general-${idGeneral}`;
    gridItem.innerHTML = `
        <h3>${titulo} <i class="fas fa-trash" onclick="eliminarCarta(${idGeneral})"></i></h3>
        <p>${contenido}</p>
        ${esBoton ? `<button onclick="mostrarLoader(${idGeneral})">Calcular</button>` : ''}
    `;
    gridContainer.appendChild(gridItem);
}
