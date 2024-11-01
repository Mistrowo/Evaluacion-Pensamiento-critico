
const API_KEY = "sk-proj-AMvrv5XIi1MrmCWM6d45T3BlbkFJX8JMaYag5oRBhjQWnisc";  // Reemplaza con tu clave API
const rubricas = {
    "Interpretación": `
    Habilidad
    2 puntos
    1 puntos
    0 puntos
    Interpretación
    Describe la actividad con al menos dos detalles, incluyendo elementos específicos (personajes, acciones, entorno).
    Describe la actividad, con solo 1 detalle.
    No logra describir la actividad de manera clara.
    `,
    "Análisis": `
    Habilidad
    2 puntos
    1 puntos
    0 puntos
    Análisis
    Encuentra y explica bien el mensaje o significado de la actividad.
    Encuentra el mensaje o significado, pero no lo explica bien.
    No logra encontrar el mensaje o significado.
    `,
    "Inferencia": `
    Habilidad
    2 puntos
    1 puntos
    0 puntos
    Inferencia
    Hace una conclusión clara y bien fundamentada basada en detalles de la actividad.
    Hace una conclusión, pero no está bien fundamentada.
    No hace inferencias.
    `,
    "Evaluación": `
    Habilidad
    2 puntos
    1 puntos
    0 puntos
    Evaluación
    Evalúa lo que aprendió y da un ejemplo de cómo aplicarlo en la vida cotidiana o en otras situaciones.
    Solo evalúa lo que aprendió o solo da un ejemplo sin argumentar lo que aprendió.
    No logra hacer una evaluación.
    `,
    "Metacognición": `
    Habilidad
    2 puntos
    1 puntos
    0 puntos
    Metacognición
    Realiza preguntas y responde si se respondieron durante la actividad.
    Solo realiza la pregunta sin responder si se respondió durante la actividad.
    No hizo nada.
    `
};

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

    if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
}

async function getCompletionFT(prompt) {
    const response = await fetch(`https://api.openai.com/v1/chat/completions`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
            model: "ft:gpt-3.5-turbo-0125:personal::9Y1XTKgR:ckpt-step-246",
            messages: [
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            max_tokens: 300,
        }),
    });

    if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
}

function mostrarLoader(idGeneral) {
    const analysisContainer = document.querySelector('.analysis-container');
    analysisContainer.innerHTML = `<div class="loading-text">CARGANDO PUNTAJE MODELO CHATGPT...</div>`;
    setTimeout(async () => {
        await mostrarRespuesta(analysisContainer, idGeneral);
    }, 5000);
}

function mostrarLoaderEntrenado(idGeneral) {
    const analysisContainer = document.querySelector('.analysis-container');
    analysisContainer.innerHTML = `<div class="loading-text">CARGANDO PUNTAJE MODELO ENTRENADO...</div>`;
    setTimeout(async () => {
        await mostrarRespuestaEntrenado(analysisContainer, idGeneral);
    }, 5000);
}

function mapearHabilidad(pregunta) {
    const preguntaLimpia = pregunta.replace(/Pregunta \d+: /, '').trim();
    if (preguntaLimpia.includes("¿Cómo describirías")) return "Interpretación";
    if (preguntaLimpia.includes("¿Qué mensaje o significado puedes encontrar")) return "Análisis";
    if (preguntaLimpia.includes("¿A qué conclusiones se pueden llegar")) return "Inferencia";
    if (preguntaLimpia.includes("¿Cómo evaluarías lo que aprendiste")) return "Evaluación";
    if (preguntaLimpia.includes("¿Qué preguntas te hiciste")) return "Metacognición";
    return null;
}

async function mostrarRespuesta(container, idGeneral) {
    const start = performance.now();
    try {
        const respuestas = await fetch(`/obtener-respuestas-general/${idGeneral}`).then(res => res.json());
        const evaluaciones = [];

        for (let i = 0; i < respuestas.length; i++) {
            const r = respuestas[i];
            const habilidad = mapearHabilidad(r.pregunta);

            if (!habilidad) {
                console.error(`No se pudo determinar la habilidad para la pregunta: ${r.pregunta}`);
                continue;
            }

            if (!rubricas[habilidad]) {
                console.error(`Habilidad ${habilidad} no encontrada en rubricas.`);
                continue;
            }

            const prompt = `
                Eres un experto en análisis del pensamiento crítico. Te proporcionaré una rúbrica para evaluar una respuesta.

                Rúbrica:
                ${rubricas[habilidad]}

                Pregunta: ${r.pregunta}
                Respuesta del estudiante: ${r.respuesta}

                Utilizando la rúbrica proporcionada, analiza la respuesta del estudiante y asigna un puntaje en el rango de 0 a 3. El análisis debe comenzar con el puntaje asignado en el formato "Puntaje: X puntos" donde X es el puntaje que asignaste. Explica brevemente por qué asignaste ese puntaje, mencionando elementos específicos de la respuesta y la rúbrica.

                Recuerda ser detallado y justificado en tu evaluación.
            `;

            console.log('Prompt enviado a la API:', prompt);

            const response = await getCompletion(prompt);
            if (response.choices && response.choices[0] && response.choices[0].message && response.choices[0].message.content) {
                const evaluacion = response.choices[0].message.content.trim();
                evaluaciones.push({
                    id: r.id_respuesta,
                    pregunta: r.pregunta,
                    respuesta: r.respuesta,
                    puntaje: extractScore(evaluacion)
                });
            } else {
                throw new Error('Respuesta de la API no válida');
            }
        }

        const end = performance.now();
        const duration = (end - start) / respuestas.length;
        console.log(`Tiempo promedio de inferencia para gpt-3.5-turbo: ${duration}ms`);

        renderEvaluaciones(container, evaluaciones);
    } catch (error) {
        console.error('Error al obtener la evaluación:', error);
        container.innerHTML = '<div class="error-message">Error al obtener la evaluación</div>';
    }
}

async function mostrarRespuestaEntrenado(container, idGeneral) {
    const start = performance.now();
    try {
        const respuestas = await fetch(`/obtener-respuestas-general/${idGeneral}`).then(res => res.json());
        const evaluaciones = [];

        for (let i = 0; i < respuestas.length; i++) {
            const r = respuestas[i];
            const habilidad = mapearHabilidad(r.pregunta);

            if (!habilidad) {
                console.error(`No se pudo determinar la habilidad para la pregunta: ${r.pregunta}`);
                continue;
            }

            if (!rubricas[habilidad]) {
                console.error(`Habilidad ${habilidad} no encontrada en rubricas.`);
                continue;
            }

            const prompt = `
                Eres un experto en análisis del pensamiento crítico. Te proporcionaré una rúbrica para evaluar una respuesta.

                Rúbrica:
                ${rubricas[habilidad]}

                Pregunta: ${r.pregunta}
                Respuesta del estudiante: ${r.respuesta}

                Utilizando la rúbrica proporcionada, analiza la respuesta del estudiante y asigna un puntaje en el rango de 0 a 2. El análisis debe comenzar con el puntaje asignado en el formato "Puntaje: X puntos" donde X es el puntaje que asignaste. Explica brevemente por qué asignaste ese puntaje, mencionando elementos específicos de la respuesta y la rúbrica.

                Recuerda ser detallado y justificado en tu evaluación.
            `;

            console.log('Prompt enviado a la API:', prompt);

            const response = await getCompletionFT(prompt);
            if (response.choices && response.choices[0] && response.choices[0].message && response.choices[0].message.content) {
                const evaluacion = response.choices[0].message.content.trim();
                evaluaciones.push({
                    id: r.id_respuesta,
                    pregunta: r.pregunta,
                    respuesta: r.respuesta,
                    puntaje: extractScore(evaluacion)
                });
            } else {
                throw new Error('Respuesta de la API no válida');
            }
        }

        const end = performance.now();
        const

 duration = (end - start) / respuestas.length;
        console.log(`Tiempo promedio de inferencia para modelo fine-tuned: ${duration}ms`);

        renderEvaluaciones(container, evaluaciones);
    } catch (error) {
        console.error('Error al obtener la evaluación:', error);
        container.innerHTML = '<div class="error-message">Error al obtener la evaluación</div>';
    }
}

function extractScore(evaluacion) {
    const scoreRegex = /Puntaje: (\d+)/i;
    const match = evaluacion.match(scoreRegex);
    return match ? parseInt(match[1]) : 0;
}

function downloadTableAsXLSX() {
    const table = document.querySelector('.table-auto');
    const wb = XLSX.utils.table_to_book(table, { sheet: "Sheet1" });
    XLSX.writeFile(wb, 'analisis_respuestas.xlsx');

    const puntajes = Array.from(table.querySelectorAll('tbody tr td:last-child')).map(td => parseInt(td.textContent) || 0);
    const sumaPuntajes = puntajes.reduce((acc, curr) => acc + curr, 0);

    const sumaContainer = document.getElementById('suma-puntajes');
    sumaContainer.textContent = `Suma total del puntaje: ${sumaPuntajes}`;
}

function renderEvaluaciones(container, evaluaciones) {
    const tableRows = evaluaciones.map((eval, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${eval.pregunta}</td>
            <td>${eval.respuesta}</td>
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
                        <th class="px-4 py-2">Puntaje</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
            <button id="downloadBtn" class="download-btn">Descargar XLSX</button>
            <div id="suma-puntajes" class="suma-puntajes"></div>
        </div>
    `;

    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadTableAsXLSX);
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

    fetch('/obtener-respuestas')
        .then(response => response.json())
        .then(respuestas => {
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
        ${esBoton ? `<button onclick="mostrarLoader(${idGeneral})">Calcular</button>
        <button onclick="mostrarLoaderEntrenado(${idGeneral})">Calcular FT</button>` : ''}
    `;
    gridContainer.appendChild(gridItem);
}

function eliminarCarta(idGeneral) {
    if (confirm("¿Estás seguro de que deseas eliminar todas las respuestas asociadas?")) {
        fetch(`/eliminar-respuestas-general/${idGeneral}`, {
            method: 'DELETE'
        }).then(response => {
            if (response.ok) {
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
