const API_KEY = "sk-proj-AMvrv5XIi1MrmCWM6d45T3BlbkFJX8JMaYag5oRBhjQWnisc";  // Reemplaza con tu clave API

const rubricas = {
    "Interpretación": `
    Habilidad
    3-4 puntos
    1-2 puntos
    0 puntos
    Interpretación
    Expresa una opinión fundamentada sobre el contenido/impresión general.
    Expresa una opinión superficial o simplista.
    No logra expresar una opinión coherente.
    `,
    "Análisis": `
    Habilidad
    3-4 puntos
    1-2 puntos
    0 puntos
    Análisis
    Identifica acertadamente las ideas principales y secundarias.
    Identifica algunas ideas principales/secundarias de manera parcial o confusa.
    No logra identificar ideas principales/secundarias relevantes.
    `,
    "Inferencia": `
    Habilidad
    3-4 puntos
    1-2 puntos
    0 puntos
    Inferencia
    Infiere apropiadamente el mensaje/intenciones subyacentes.
    Realiza algunas inferencias básicas o poco fundamentadas.
    No va más allá de lo literal, sin hacer inferencias.
    `,
    "Evaluación": `
    Habilidad
    3-4 puntos
    1-2 puntos
    0 puntos
    Evaluación
    Evalúa críticamente si el contenido logra su objetivo, con argumentos sólidos.
    Intenta evaluar pero los argumentos son débiles o simplistas.
    No logra hacer una evaluación crítica.
    `,
    "Metacognición": `
    Habilidad
    3-4 puntos
    1-2 puntos
    0 puntos
    Metacognición
    Explica apropiada y detalladamente sus pensamientos, reflexiones personales.
    Explica vagamente algunos elementos metacognitivos básicos.
    No demuestra conciencia metacognitiva sobre su experiencia.
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
    analysisContainer.innerHTML = `<div class="loading-text">CARGANDO ANALISIS MODELO CHATGPT...</div>`;
    setTimeout(async () => {
        await mostrarRespuesta(analysisContainer, idGeneral);
    }, 5000);
}

function mostrarLoaderEntrenado(idGeneral) {
    const analysisContainer = document.querySelector('.analysis-container');
    analysisContainer.innerHTML = `<div class="loading-text">CARGANDO ANALISIS MODELO ENTRENADO...</div>`;
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
    try {
        const respuestas = await fetch(`/obtener-respuestas-general/${idGeneral}`).then(res => res.json());
        const evaluaciones = [];

        const descripcionImagen = "En la imagen se ve una mano que emerge del agua en señal de auxilio, mientras un grupo de personas alrededor está grabando con sus teléfonos móviles en lugar de ayudar.";
        const descripcionVideo = "El video muestra la primera parte de la película 'Tiempos Modernos' de Charlie Chaplin, específicamente hasta el minuto 1:40.";
        const descripcionTexto = "Extracto de la novela 'Eva Luna' de Isabel Allende: La primera vez que vi la lluvia fue una tarde de verano en un patio interior...";

        for (let i = 0; i < respuestas.length; i++) {
            const r = respuestas[i];
            const habilidad = mapearHabilidad(r.pregunta);

            if (!habilidad) {
                console.error(`No se pudo determinar la habilidad para la pregunta: ${r.pregunta}`);
                continue;
            }

            let descripcionContenido;
            if (i < 5) {
                descripcionContenido = descripcionImagen;
            } else if (i < 10) {
                descripcionContenido = descripcionVideo;
            } else {
                descripcionContenido = descripcionTexto;
            }

            if (!rubricas[habilidad]) {
                console.error(`Habilidad ${habilidad} no encontrada en rubricas.`);
                continue;
            }

            const prompt = `
                Eres un experto en análisis del pensamiento crítico. Te proporcionaré una rúbrica para evaluar una respuesta.

                Rúbrica:
                ${rubricas[habilidad]}

                Tipo de contenido: ${determinarTipoContenido(i)}
                Descripción del contenido: ${descripcionContenido}

                Pregunta: ${r.pregunta}
                Respuesta del estudiante: ${r.respuesta}

                Utilizando la rúbrica proporcionada, analiza la respuesta del estudiante y asigna un puntaje en el rango de 0 a 4. Explica brevemente por qué asignaste ese puntaje, mencionando elementos específicos de la respuesta y la rúbrica.

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
                    analisis: evaluacion,
                    puntaje: extractScore(evaluacion)
                });
            } else {
                throw new Error('Respuesta de la API no válida');
            }
        }

        renderEvaluaciones(container, evaluaciones);
    } catch (error) {
        console.error('Error al obtener la evaluación:', error);
        container.innerHTML = '<div class="error-message">Error al obtener la evaluación</div>';
    }
}

async function mostrarRespuestaEntrenado(container, idGeneral) {
    try {
        const respuestas = await fetch(`/obtener-respuestas-general/${idGeneral}`).then(res => res.json());
        const evaluaciones = [];

        const descripcionImagen = "En la imagen se ve una mano que emerge del agua en señal de auxilio, mientras un grupo de personas alrededor está grabando con sus teléfonos móviles en lugar de ayudar.";
        const descripcionVideo = "El video muestra la primera parte de la película 'Tiempos Modernos' de Charlie Chaplin, específicamente hasta el minuto 1:40.";
        const descripcionTexto = "Extracto de la novela 'Eva Luna' de Isabel Allende: La primera vez que vi la lluvia fue una tarde de verano en un patio interior...";

        for (let i = 0; i < respuestas.length; i++) {
            const r = respuestas[i];
            const habilidad = mapearHabilidad(r.pregunta);

            if (!habilidad) {
                console.error(`No se pudo determinar la habilidad para la pregunta: ${r.pregunta}`);
                continue;
            }

            let descripcionContenido;
            if (i < 5) {
                descripcionContenido = descripcionImagen;
            } else if (i < 10) {
                descripcionContenido = descripcionVideo;
            } else {
                descripcionContenido = descripcionTexto;
            }

            if (!rubricas[habilidad]) {
                console.error(`Habilidad ${habilidad} no encontrada en rubricas.`);
                continue;
            }

            const prompt = `
                Eres un experto en análisis del pensamiento crítico. Te proporcionaré una rúbrica para evaluar una respuesta.

                Rúbrica:
                ${rubricas[habilidad]}

                Tipo de contenido: ${determinarTipoContenido(i)}
                Descripción del contenido: ${descripcionContenido}

                Pregunta: ${r.pregunta}
                Respuesta del estudiante: ${r.respuesta}

                Utilizando la rúbrica proporcionada, analiza la respuesta del estudiante y asigna un puntaje en el rango de 0 a 4. Explica brevemente por qué asignaste ese puntaje, mencionando elementos específicos de la respuesta y la rúbrica.

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
                    analisis: evaluacion,
                    puntaje: extractScore(evaluacion)
                });
            } else {
                throw new Error('Respuesta de la API no válida');
            }
        }

        renderEvaluaciones(container, evaluaciones);
    } catch (error) {
        console.error('Error al obtener la evaluación:', error);
        container.innerHTML = '<div class="error-message">Error al obtener la evaluación</div>';
    }
}

function determinarTipoContenido(index) {
    if (index < 5) return "Imagen";
    else if (index < 10) return "Video";
    else return "Texto";
}

function extractScore(evaluacion) {
    const scoreRegex = /Puntaje: (\d+)/i;
    const match = evaluacion.match(scoreRegex);
    return match ? match[1] : 'N/A';
}

function downloadTableAsXLSX() {
    const table = document.querySelector('.table-auto');
    const wb = XLSX.utils.table_to_book(table, { sheet: "Sheet1" });
    XLSX.writeFile(wb, 'analisis_respuestas.xlsx');
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
            <button id="downloadBtn" class="download-btn">Descargar XLSX</button>
        </div>
    `;

    // Añadir el event listener para el botón de descarga
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
