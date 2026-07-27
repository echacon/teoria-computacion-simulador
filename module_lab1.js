// Módulo de Laboratorio 1: Simulación interactiva de Recurso Único (DFA)

let state = {
    currentState: 'OCIOSO',
    history: [],
    logLines: []
};

const TRANSITIONS = {
    'OCIOSO': { 'cargar': 'LISTO' },
    'LISTO': { 'iniciar': 'PINTANDO' },
    'PINTANDO': { 'fin': 'COMPLETADO', 'detectar_falla': 'FALLA_TEMPORAL' },
    'FALLA_TEMPORAL': { 'reparar': 'LISTO', 'sobrecalentar': 'FALLA_CRITICA' },
    'COMPLETADO': { 'despachar': 'OCIOSO' },
    'FALLA_CRITICA': {} // Estado de bloqueo/falla permanente sin transiciones de salida
};

const MARKED_STATES = {
    success: ['COMPLETADO'],
    error: ['FALLA_CRITICA']
};

let containerRef = null;

export function initModuleLab1(container) {
    containerRef = container;
    state.currentState = 'OCIOSO';
    state.history = [];
    state.logLines = ["LOG DE CONSOLA: Estación de Pintura Inicializada en estado 'OCIOSO'"];

    render();
    updateActiveNode();
}

export function destroyModuleLab1() {
    containerRef = null;
}

function render() {
    if (!containerRef) return;

    containerRef.innerHTML = `
        <div class="module-layout">
            <div class="module-workspace">
                <div class="workspace-header">
                    <h2>Laboratorio 1: Ciclo Operacional del Recurso Único</h2>
                    <p>Interactúa con la Estación de Pintura (DFA) disparando eventos para ver cómo evoluciona el estado y se registra la traza.</p>
                </div>

                <!-- Visualización del Grafo de Estados -->
                <div class="graph-canvas lab-graph-container">
                    <div class="lab-node" id="node-OCIOSO">
                        <span class="node-badge">Inicio</span>
                        <div class="node-circle">OCIOSO</div>
                    </div>
                    <div class="lab-node" id="node-LISTO">
                        <div class="node-circle">LISTO</div>
                    </div>
                    <div class="lab-node" id="node-PINTANDO">
                        <div class="node-circle">PINTANDO</div>
                    </div>
                    <div class="lab-node" id="node-FALLA_TEMPORAL">
                        <div class="node-circle text-warning">FALLA_TEMP</div>
                    </div>
                    <div class="lab-node" id="node-COMPLETADO">
                        <span class="node-badge success">Éxito</span>
                        <div class="node-circle success-border">COMPLETADO</div>
                    </div>
                    <div class="lab-node" id="node-FALLA_CRITICA">
                        <span class="node-badge error">Fallo</span>
                        <div class="node-circle error-border">FALLA_CRIT</div>
                    </div>
                </div>

                <!-- Consola Simulada y Controles -->
                <div class="workspace-footer">
                    <div class="console-section">
                        <h4>Consola de Eventos y Traza</h4>
                        <div class="console-output" id="lab-console">
                            ${state.logLines.map(line => `<div class="console-line">${line}</div>`).join('')}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Panel de Control Lateral -->
            <div class="module-controls">
                <h3>Panel de Control</h3>
                <p class="control-description">Dispara eventos para interactuar con la planta:</p>
                
                <div class="control-buttons-grid">
                    <button class="btn-control" data-event="cargar">🟢 Cargar Pieza</button>
                    <button class="btn-control" data-event="iniciar">⚡ Iniciar Pintura</button>
                    <button class="btn-control" data-event="fin">⏹️ Finalizar Operación</button>
                    <button class="btn-control" data-event="detectar_falla">⚠️ Detectar Falla</button>
                    <button class="btn-control" data-event="reparar">🔧 Reparar Recurso</button>
                    <button class="btn-control" data-event="sobrecalentar">🔥 Sobrecalentar</button>
                    <button class="btn-control" data-event="despachar">📦 Despachar Producto</button>
                </div>

                <button class="btn-action btn-reset-lab" id="btn-reset-lab">🔄 Reiniciar Simulación</button>

                <div class="yaml-download-card">
                    <h4>Especificación Ontológica</h4>
                    <p>Obtén el modelo YAML homogéneo de este recurso para tu motor de consola.</p>
                    <button class="btn-action" id="btn-download-yaml">📥 Descargar recurso.yaml</button>
                </div>
            </div>
        </div>
    `;

    // Event listeners
    containerRef.querySelectorAll('.btn-control').forEach(btn => {
        btn.addEventListener('click', () => {
            triggerEvent(btn.dataset.event);
        });
    });

    containerRef.querySelector('#btn-reset-lab').addEventListener('click', resetSimulation);
    containerRef.querySelector('#btn-download-yaml').addEventListener('click', downloadYamlSpec);
}

function triggerEvent(eventName) {
    const prevState = state.currentState;
    const nextState = TRANSITIONS[prevState] ? TRANSITIONS[prevState][eventName] : null;

    const consoleEl = document.getElementById('lab-console');

    if (nextState) {
        state.currentState = nextState;
        state.history.push(eventName);
        
        let logMsg = `[Transición] Evento '${eventName}': ${prevState} ➜ ${nextState}`;
        
        if (MARKED_STATES.success.includes(nextState)) {
          logMsg += ` 🎉 [Producto Listo]`;
        } else if (MARKED_STATES.error.includes(nextState)) {
          logMsg += ` 🚨 [Recurso Bloqueado]`;
        }

        addLogLine(logMsg);
        updateActiveNode();
    } else {
        // Sacudir el nodo activo como animación de error
        const activeNode = document.getElementById(`node-${prevState}`);
        if (activeNode) {
            activeNode.classList.add('shake-anim');
            setTimeout(() => activeNode.classList.remove('shake-anim'), 500);
        }
        addLogLine(`❌ [Error] Evento '${eventName}' no es válido en el estado '${prevState}'`);
    }
}

function updateActiveNode() {
    if (!containerRef) return;

    // Desactivar todos los nodos
    containerRef.querySelectorAll('.lab-node').forEach(node => {
        node.classList.remove('active');
    });

    // Activar el correspondiente
    let activeId = `node-${state.currentState}`;
    // Ajuste por etiquetas de texto más cortas en la UI
    if (state.currentState === 'FALLA_TEMPORAL') activeId = 'node-FALLA_TEMPORAL';
    if (state.currentState === 'FALLA_CRITICA') activeId = 'node-FALLA_CRITICA';

    const activeNode = document.getElementById(activeId);
    if (activeNode) {
        activeNode.classList.add('active');
    }
}

function addLogLine(text) {
    state.logLines.push(text);
    const consoleEl = document.getElementById('lab-console');
    if (consoleEl) {
        const lineDiv = document.createElement('div');
        lineDiv.className = 'console-line';
        if (text.startsWith('❌')) lineDiv.classList.add('text-error');
        if (text.includes('🎉')) lineDiv.classList.add('text-success');
        if (text.includes('🚨')) lineDiv.classList.add('text-error-highlight');
        lineDiv.textContent = text;
        consoleEl.appendChild(lineDiv);
        consoleEl.scrollTop = consoleEl.scrollHeight;
    }
}

function resetSimulation() {
    state.currentState = 'OCIOSO';
    state.history = [];
    state.logLines = ["🔄 Simulación Reiniciada", "LOG DE CONSOLA: Estación de Pintura Inicializada en estado 'OCIOSO'"];
    
    render();
    updateActiveNode();
}

function downloadYamlSpec() {
    const yamlContent = `recurso: "Estacion_Pintura"
tipo: "Maquina_De_Pintura"
estado_inicial: "OCIOSO"
estados_finales:
  exito:
    - "COMPLETADO"
  falla:
    - "FALLA_CRITICA"

eventos:
  - id: "cargar"
    controlable: true
  - id: "iniciar"
    controlable: true
  - id: "fin"
    controlable: true
  - id: "detectar_falla"
    controlable: false
  - id: "reparar"
    controlable: true
  - id: "sobrecalentar"
    controlable: false
  - id: "despachar"
    controlable: true

transiciones:
  - de: "OCIOSO"
    evento: "cargar"
    a: "LISTO"
  - de: "LISTO"
    evento: "iniciar"
    a: "PINTANDO"
  - de: "PINTANDO"
    evento: "fin"
    a: "COMPLETADO"
  - de: "PINTANDO"
    evento: "detectar_falla"
    a: "FALLA_TEMPORAL"
  - de: "FALLA_TEMPORAL"
    evento: "reparar"
    a: "LISTO"
  - de: "FALLA_TEMPORAL"
    evento: "sobrecalentar"
    a: "FALLA_CRITICA"
  - de: "COMPLETADO"
    evento: "despachar"
    a: "OCIOSO"
`;

    const blob = new Blob([yamlContent], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recurso.yaml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
