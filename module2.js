// Módulo 2: Autómatas de Estados Finitos (FSA)

let animationId = null;
let containerRef = null;
let simulationInterval = null;

// Estructura formal del autómata por defecto (DFA que reconoce cadenas terminadas en "01")
const dfa = {
    states: {
        q0: { label: 'q0', x: 120, y: 180, isAccept: false, desc: 'Inicio / Buscando 0' },
        q1: { label: 'q1', x: 280, y: 180, isAccept: false, desc: 'Visto 0' },
        q2: { label: 'q2', x: 440, y: 180, isAccept: true, desc: '¡Visto 01! (Aceptado)' }
    },
    transitions: [
        { from: 'q0', symbol: '0', to: 'q1', curve: 0 },
        { from: 'q0', symbol: '1', to: 'q0', curve: -40 }, // Auto-bucle
        { from: 'q1', symbol: '0', to: 'q1', curve: -40 }, // Auto-bucle
        { from: 'q1', symbol: '1', to: 'q2', curve: 0 },
        { from: 'q2', symbol: '0', to: 'q1', curve: 40 },  // Vuelve a q1
        { from: 'q2', symbol: '1', to: 'q0', curve: 60 }   // Vuelve a q0
    ],
    initialState: 'q0'
};

// Estado del simulador
const simState = {
    inputString: '10101',
    tapeIndex: -1,
    currentState: 'q0',
    isPlaying: false,
    speed: 1500, // ms por paso
    status: 'ready', // 'ready', 'running', 'success', 'halted'
};

const moduleHTML = `
<div class="module-container">
    <div class="module-intro">
        <h2>Módulo 2: Autómatas de Estados Finitos (FSA)</h2>
        <p>Los autómatas finitos introducen el concepto de <strong>Memoria Local (Estado)</strong>. El resultado de procesar un símbolo de entrada depende de las entradas anteriores (resumidas en el estado actual). Aquí visualizamos un DFA que reconoce cadenas binarias que <strong>terminan en "01"</strong>.</p>
    </div>

    <!-- Cinta de Entrada del Autómata -->
    <div class="tape-container" id="m2-tape">
        <!-- Las celdas se inyectarán dinámicamente -->
    </div>

    <div class="simulator-layout">
        <!-- Panel de Simulación y Visualización -->
        <div class="simulation-panel">
            <div class="panel-header">
                <h3>Visualizador del Grafo del Autómata (DFA)</h3>
                <span class="status-indicator ready" id="m2-status-badge">Listo</span>
            </div>
            
            <div class="canvas-container">
                <canvas id="m2-canvas"></canvas>
            </div>

            <!-- Controles de Reproducción -->
            <div class="sim-controls">
                <button class="btn-secondary" id="m2-btn-reset" title="Reiniciar">
                    <span>🔄</span> Reiniciar
                </button>
                <button class="btn-primary" id="m2-btn-play" title="Iniciar simulación automática">
                    <span id="m2-play-icon">▶️</span> <span id="m2-play-label">Ejecutar</span>
                </button>
                <button class="btn-secondary" id="m2-btn-step" title="Avanzar un paso">
                    <span>➡️</span> Paso a Paso
                </button>
            </div>
        </div>

        <!-- Controles Interactivos -->
        <div class="control-panel">
            <h3>Configuración del Autómata</h3>
            
            <div class="io-card">
                <h4>Cadena de Entrada (Cinta)</h4>
                <div class="form-group">
                    <label for="m2-input-string">Cadena Binaria (Alfabeto: {0, 1}):</label>
                    <input type="text" id="m2-input-string" value="10101" placeholder="Ej: 10101">
                </div>
                <button class="btn-success" id="m2-btn-load" style="width: 100%;">Cargar en la Cinta</button>
            </div>

            <div class="io-card">
                <h4>Estado y Definición Formal</h4>
                <div class="form-group" style="gap: 0.25rem;">
                    <label>Estado Actual:</label>
                    <div class="output-value" id="m2-state-display" style="font-size: 1.25rem; font-family: var(--font-mono); color: var(--cyan); background: rgba(6, 182, 212, 0.1); border-color: rgba(6, 182, 212, 0.2);">q0</div>
                </div>
                <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem;" id="m2-state-desc">
                    Inicio / Buscando 0
                </div>
            </div>
            
            <div class="console-log" id="m2-console">
                <div class="log-entry info">Carga una cadena y pulsa Ejecutar o Paso a Paso.</div>
            </div>
        </div>
    </div>
</div>
`;

class DFAGraphVisualizer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        if (!this.canvas) return;
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = Math.max(rect.height, 350);
    }

    draw(activeState) {
        if (!this.canvas || !this.ctx) return;
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;

        ctx.clearRect(0, 0, width, height);

        // Dibujar transiciones (flechas)
        dfa.transitions.forEach(trans => {
            const fromState = dfa.states[trans.from];
            const toState = dfa.states[trans.to];
            this.drawTransition(ctx, fromState, toState, trans.symbol, trans.curve, activeState === trans.from);
        });

        // Dibujar estados (nodos)
        Object.keys(dfa.states).forEach(key => {
            const state = dfa.states[key];
            const isActive = activeState === key;
            this.drawState(ctx, state, isActive);
        });
    }

    drawState(ctx, state, isActive) {
        const radius = 30;
        
        // Sombra / Resplandor si está activo
        if (isActive) {
            ctx.shadowBlur = 20;
            ctx.shadowColor = state.isAccept ? 'rgba(16, 185, 129, 0.6)' : 'rgba(59, 130, 246, 0.6)';
        }

        // Relleno
        ctx.fillStyle = isActive 
            ? (state.isAccept ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)') 
            : 'rgba(17, 25, 40, 0.9)';
        ctx.beginPath();
        ctx.arc(state.x, state.y, radius, 0, Math.PI * 2);
        ctx.fill();

        // Borde
        ctx.shadowBlur = 0; // reset shadow
        ctx.lineWidth = isActive ? 3 : 2;
        ctx.strokeStyle = isActive 
            ? (state.isAccept ? varColorHex('green') : varColorHex('primary')) 
            : 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.arc(state.x, state.y, radius, 0, Math.PI * 2);
        ctx.stroke();

        // Doble círculo para aceptación
        if (state.isAccept) {
            ctx.beginPath();
            ctx.arc(state.x, state.y, radius - 5, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Texto del Estado
        ctx.fillStyle = isActive ? '#fff' : varColorHex('text-muted');
        ctx.font = 'bold 14px var(--font-mono)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(state.label, state.x, state.y);

        // Flecha indicadora de estado inicial (q0)
        if (state.label === dfa.initialState) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(state.x - 70, state.y);
            ctx.lineTo(state.x - radius - 5, state.y);
            ctx.stroke();

            // Punta de la flecha
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.beginPath();
            ctx.moveTo(state.x - radius - 5, state.y);
            ctx.lineTo(state.x - radius - 12, state.y - 5);
            ctx.lineTo(state.x - radius - 12, state.y + 5);
            ctx.fill();
        }
    }

    drawTransition(ctx, from, to, symbol, curveOffset, isFromActive) {
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = isFromActive ? 'rgba(59, 130, 246, 0.5)' : 'rgba(255, 255, 255, 0.15)';
        ctx.fillStyle = isFromActive ? '#3b82f6' : 'rgba(255, 255, 255, 0.5)';

        const radius = 30;

        if (from === to) {
            // Auto-bucle (dibujamos un bucle superior)
            const loopX = from.x;
            const loopY = from.y - radius;
            
            ctx.beginPath();
            ctx.arc(loopX, loopY - 10, 15, -Math.PI / 4, (5 * Math.PI) / 4, true);
            ctx.stroke();

            // Punta de flecha de auto-bucle
            const arrowX = loopX - 8;
            const arrowY = loopY;
            ctx.beginPath();
            ctx.moveTo(arrowX, arrowY);
            ctx.lineTo(arrowX - 4, arrowY - 8);
            ctx.lineTo(arrowX + 4, arrowY - 6);
            ctx.fill();

            // Etiqueta del símbolo
            ctx.font = '12px var(--font-mono)';
            ctx.textAlign = 'center';
            ctx.fillText(symbol, loopX, loopY - 32);
        } else {
            // Transición entre nodos distintos (curva si es necesario)
            const angle = Math.atan2(to.y - from.y, to.x - from.x);
            
            const startX = from.x + radius * Math.cos(angle);
            const startY = from.y + radius * Math.sin(angle);
            
            const endX = to.x - radius * Math.cos(angle);
            const endY = to.y - radius * Math.sin(angle);
            
            if (curveOffset === 0) {
                // Línea recta
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(endX, endY);
                ctx.stroke();

                // Punta de flecha
                ctx.save();
                ctx.translate(endX, endY);
                ctx.rotate(angle);
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(-10, -5);
                ctx.lineTo(-10, 5);
                ctx.fill();
                ctx.restore();

                // Etiqueta del símbolo (en el medio de la línea)
                ctx.font = '12px var(--font-mono)';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                ctx.fillText(symbol, (startX + endX) / 2, (startY + endY) / 2 - 4);
            } else {
                // Línea curva
                const midX = (startX + endX) / 2;
                const midY = (startY + endY) / 2;
                
                // Vector perpendicular para el desplazamiento de la curva
                const perpX = -Math.sin(angle);
                const perpY = Math.cos(angle);
                
                const ctrlX = midX + perpX * curveOffset;
                const ctrlY = midY + perpY * curveOffset;

                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.quadraticCurveTo(ctrlX, ctrlY, endX, endY);
                ctx.stroke();

                // Calcular ángulo final del arco para orientar la flecha
                const t = 0.9; // Cerca del final
                const arrowPosX = (1-t)*(1-t)*startX + 2*(1-t)*t*ctrlX + t*t*endX;
                const arrowPosY = (1-t)*(1-t)*startY + 2*(1-t)*t*ctrlY + t*t*endY;
                const finalAngle = Math.atan2(endY - arrowPosY, endX - arrowPosX);

                ctx.save();
                ctx.translate(endX, endY);
                ctx.rotate(finalAngle);
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(-10, -5);
                ctx.lineTo(-10, 5);
                ctx.fill();
                ctx.restore();

                // Etiqueta del símbolo (en el punto de control de la curva)
                ctx.font = '12px var(--font-mono)';
                ctx.textAlign = 'center';
                ctx.fillText(symbol, ctrlX, ctrlY + (curveOffset > 0 ? 15 : -5));
            }
        }
    }
}

function varColorHex(name) {
    if (name === 'primary') return '#3b82f6';
    if (name === 'green') return '#10b981';
    if (name === 'text-muted') return '#9ca3af';
    return '#ffffff';
}

let visualizer = null;

// Actualizar la vista de la cinta (Tape) en el DOM
function updateTapeUI() {
    const tapeContainer = document.getElementById('m2-tape');
    tapeContainer.innerHTML = '';
    
    const chars = simState.inputString.split('');
    chars.forEach((char, idx) => {
        const cell = document.createElement('div');
        cell.className = 'tape-cell';
        cell.innerText = char;
        
        if (idx === simState.tapeIndex) {
            cell.classList.add('active');
        } else if (idx < simState.tapeIndex) {
            cell.classList.add('processed');
        }
        
        tapeContainer.appendChild(cell);
    });

    // Desplazar automáticamente la cinta para que el activo quede visible
    if (simState.tapeIndex >= 0) {
        const activeCell = tapeContainer.children[simState.tapeIndex];
        if (activeCell) {
            activeCell.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }
}

// Actualizar UI de estados e indicadores
function updateStatusUI() {
    const badge = document.getElementById('m2-status-badge');
    const stateDisplay = document.getElementById('m2-state-display');
    const stateDesc = document.getElementById('m2-state-desc');

    stateDisplay.innerText = simState.currentState;
    stateDesc.innerText = dfa.states[simState.currentState].desc;

    badge.className = 'status-indicator';
    
    if (simState.status === 'ready') {
        badge.classList.add('ready');
        badge.innerText = 'Listo';
    } else if (simState.status === 'running') {
        badge.classList.add('running');
        badge.innerText = 'Ejecutando';
    } else if (simState.status === 'success') {
        badge.classList.add('success');
        badge.innerText = 'ACEPTADA';
    } else if (simState.status === 'halted') {
        badge.classList.add('halted');
        badge.innerText = 'RECHAZADA';
    }

    if (visualizer) {
        visualizer.draw(simState.currentState);
    }
}

// Agregar log en consola
function addConsoleLog(msg, type = 'info') {
    const consoleEl = document.getElementById('m2-console');
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.innerText = `[${new Date().toLocaleTimeString()}] ${msg}`;
    consoleEl.appendChild(entry);
    consoleEl.scrollTop = consoleEl.scrollHeight;
}

// Cargar cadena
function loadInputString() {
    const inputVal = document.getElementById('m2-input-string').value.trim();
    
    // Validar alfabeto binario {0, 1}
    if (!/^[01]*$/.test(inputVal)) {
        addConsoleLog('Error: La cadena solo debe contener caracteres binarios (0 y 1).', 'error');
        return;
    }

    simState.inputString = inputVal === '' ? 'ε' : inputVal;
    simState.tapeIndex = -1;
    simState.currentState = dfa.initialState;
    simState.status = 'ready';
    
    stopSimulation();
    updateTapeUI();
    updateStatusUI();
    
    addConsoleLog(`Cadena "${simState.inputString}" cargada en la cinta. Estado inicial: ${simState.currentState}.`, 'info');
}

// Avanzar un paso en la simulación
function stepSimulation() {
    if (simState.status === 'success' || simState.status === 'halted') {
        addConsoleLog('La simulación ha finalizado. Pulsa Reiniciar para comenzar de nuevo.', 'info');
        return false;
    }

    simState.status = 'running';
    simState.tapeIndex++;
    
    const chars = simState.inputString.split('');
    
    // Si la cadena está vacía (palabra vacía epsilon)
    if (simState.inputString === 'ε') {
        const isAccept = dfa.states[simState.currentState].isAccept;
        simState.status = isAccept ? 'success' : 'halted';
        updateTapeUI();
        updateStatusUI();
        if (isAccept) {
            addConsoleLog(`Fin de cadena vacía. Estado final ${simState.currentState} es de ACEPTACIÓN. Cadena aceptada.`, 'success');
        } else {
            addConsoleLog(`Fin de cadena vacía. Estado final ${simState.currentState} NO es de aceptación. Cadena rechazada.`, 'error');
        }
        stopSimulation();
        return false;
    }

    if (simState.tapeIndex >= chars.length) {
        // Fin de la cadena, evaluar aceptación
        const isAccept = dfa.states[simState.currentState].isAccept;
        simState.status = isAccept ? 'success' : 'halted';
        updateTapeUI();
        updateStatusUI();
        
        if (isAccept) {
            addConsoleLog(`Fin de cinta. Estado final ${simState.currentState} es de ACEPTACIÓN. ¡Cadena Aceptada!`, 'success');
        } else {
            addConsoleLog(`Fin de cinta. Estado final ${simState.currentState} NO es de aceptación. Cadena Rechazada.`, 'error');
        }
        stopSimulation();
        return false;
    }

    const symbol = chars[simState.tapeIndex];
    const oldState = simState.currentState;
    
    // Buscar transición
    const transition = dfa.transitions.find(t => t.from === oldState && t.symbol === symbol);
    
    if (transition) {
        simState.currentState = transition.to;
        updateTapeUI();
        updateStatusUI();
        addConsoleLog(`δ(${oldState}, '${symbol}') → ${simState.currentState} (${dfa.states[simState.currentState].desc})`, 'action');
        return true;
    } else {
        // Sin transición válida (error en autómata, aunque este DFA está completo para {0, 1})
        simState.status = 'halted';
        updateTapeUI();
        updateStatusUI();
        addConsoleLog(`Error: No existe transición δ(${oldState}, '${symbol}'). Bloqueo del autómata.`, 'error');
        stopSimulation();
        return false;
    }
}

// Iniciar/Detener Ejecución Automática
function togglePlay() {
    if (simState.isPlaying) {
        stopSimulation();
    } else {
        if (simState.status === 'success' || simState.status === 'halted') {
            resetSimulation();
        }
        startSimulation();
    }
}

function startSimulation() {
    simState.isPlaying = true;
    document.getElementById('m2-play-icon').innerText = '⏸️';
    document.getElementById('m2-play-label').innerText = 'Pausar';
    addConsoleLog('Simulación automática iniciada.', 'info');
    
    // Primer paso de inmediato
    const hasNext = stepSimulation();
    if (!hasNext) return;

    simulationInterval = setInterval(() => {
        const ok = stepSimulation();
        if (!ok) {
            stopSimulation();
        }
    }, simState.speed);
}

function stopSimulation() {
    simState.isPlaying = false;
    if (simulationInterval) {
        clearInterval(simulationInterval);
        simulationInterval = null;
    }
    const iconEl = document.getElementById('m2-play-icon');
    const labelEl = document.getElementById('m2-play-label');
    if (iconEl && labelEl) {
        iconEl.innerText = '▶️';
        labelEl.innerText = 'Ejecutar';
    }
}

// Reiniciar simulación
function resetSimulation() {
    stopSimulation();
    simState.tapeIndex = -1;
    simState.currentState = dfa.initialState;
    simState.status = 'ready';
    updateTapeUI();
    updateStatusUI();
    addConsoleLog('Simulador restablecido al estado inicial q0.', 'info');
}

// Bucle de renderizado continuo (para redimensionamientos)
function drawLoop() {
    if (visualizer) {
        visualizer.draw(simState.currentState);
    }
    animationId = requestAnimationFrame(drawLoop);
}

export function initModule2(container) {
    containerRef = container;
    container.innerHTML = moduleHTML;

    visualizer = new DFAGraphVisualizer('m2-canvas');

    // Registrar Event listeners
    document.getElementById('m2-btn-load').addEventListener('click', loadInputString);
    document.getElementById('m2-btn-step').addEventListener('click', stepSimulation);
    document.getElementById('m2-btn-play').addEventListener('click', togglePlay);
    document.getElementById('m2-btn-reset').addEventListener('click', resetSimulation);

    // Cargar valores iniciales
    loadInputString();

    // Loop
    drawLoop();
}

export function destroyModule2() {
    stopSimulation();
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    visualizer = null;
    containerRef = null;
}
