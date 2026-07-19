// Módulo 3: Autómatas de Pila (PDA)

let animationId = null;
let containerRef = null;
let simulationInterval = null;

// Estructura formal del PDA para L = {aⁿbⁿ | n >= 0}
const pda = {
    states: {
        q0: { label: 'q0', x: 120, y: 180, isAccept: false, desc: 'Leyendo "a" / Apilando A' },
        q1: { label: 'q1', x: 280, y: 180, isAccept: false, desc: 'Leyendo "b" / Desapilando A' },
        q2: { label: 'q2', x: 440, y: 180, isAccept: true, desc: 'Aceptación (Cinta vacía y Pila vacía Z0)' }
    },
    transitions: [
        { from: 'q0', read: 'a', pop: 'Z0', push: ['A', 'Z0'], to: 'q0', desc: 'Lee "a", apila A' },
        { from: 'q0', read: 'a', pop: 'A', push: ['A', 'A'], to: 'q0', desc: 'Lee "a", apila A' },
        { from: 'q0', read: 'b', pop: 'A', push: [], to: 'q1', desc: 'Lee "b", desapila A (va a q1)' },
        { from: 'q1', read: 'b', pop: 'A', push: [], to: 'q1', desc: 'Lee "b", desapila A' },
        { from: 'q1', read: 'ε', pop: 'Z0', push: ['Z0'], to: 'q2', desc: 'Fin de entrada, pila vacía (va a q2)' },
        // Caso n = 0 (cadena vacía)
        { from: 'q0', read: 'ε', pop: 'Z0', push: ['Z0'], to: 'q2', desc: 'Cadena vacía (n = 0)' }
    ],
    initialState: 'q0',
    initialStackSymbol: 'Z0'
};

const simState = {
    inputString: 'aaabbb',
    tapeIndex: -1,
    currentState: 'q0',
    stack: ['Z0'],
    isPlaying: false,
    speed: 1500,
    status: 'ready' // 'ready', 'running', 'success', 'halted'
};

const moduleHTML = `
<div class="module-container">
    <div class="module-intro">
        <h2>Módulo 3: Autómatas de Pila (PDA)</h2>
        <p>Los autómatas con estados finitos no pueden contar más allá de su número de estados. Para reconocer lenguajes estructurados como <strong>aⁿbⁿ</strong> (mismo número de 'a' que de 'b'), necesitamos memoria externa. Un PDA añade una <strong>Pila LIFO (Last-In, First-Out)</strong> para almacenar símbolos temporalmente.</p>
    </div>

    <!-- Cinta de Entrada -->
    <div class="tape-container" id="m3-tape"></div>

    <div class="simulator-layout">
        <!-- Panel del Autómata (Grafo) -->
        <div class="simulation-panel">
            <div class="panel-header">
                <h3>Control de Estados del PDA</h3>
                <span class="status-indicator ready" id="m3-status-badge">Listo</span>
            </div>
            
            <div class="canvas-container">
                <canvas id="m3-canvas"></canvas>
            </div>

            <div class="sim-controls">
                <button class="btn-secondary" id="m3-btn-reset">🔄 Reiniciar</button>
                <button class="btn-primary" id="m3-btn-play">
                    <span id="m3-play-icon">▶️</span> <span id="m3-play-label">Ejecutar</span>
                </button>
                <button class="btn-secondary" id="m3-btn-step">➡️ Paso a Paso</button>
            </div>
        </div>

        <!-- Panel de Control y Pila Física -->
        <div class="control-panel">
            <h3>Pila y Configuración</h3>
            
            <div class="io-card">
                <h4>Entrada del Lenguaje {aⁿbⁿ}</h4>
                <div class="form-group">
                    <label for="m3-input-string">Cadena de prueba (ej: aaabbb):</label>
                    <input type="text" id="m3-input-string" value="aaabbb" placeholder="aaabbb">
                </div>
                <button class="btn-success" id="m3-btn-load" style="width: 100%;">Cargar Cinta</button>
            </div>

            <!-- Representación Visual de la Pila Física -->
            <div>
                <div class="stack-title">Memoria de Pila LIFO</div>
                <div class="stack-visualizer" id="m3-stack-container">
                    <!-- Los elementos de la pila se inyectarán aquí -->
                </div>
            </div>

            <div class="console-log" id="m3-console">
                <div class="log-entry info">Carga una cadena balanceada de tipo 'aaabbb' para probar.</div>
            </div>
        </div>
    </div>
</div>
`;

class PDAGraphVisualizer {
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

        // Dibujar transiciones sencillas q0->q0, q0->q1, q1->q1, q1->q2
        this.drawTransitions(ctx, activeState);

        // Dibujar nodos de estado
        Object.keys(pda.states).forEach(key => {
            const state = pda.states[key];
            const isActive = activeState === key;
            this.drawState(ctx, state, isActive);
        });
    }

    drawState(ctx, state, isActive) {
        const radius = 30;
        if (isActive) {
            ctx.shadowBlur = 20;
            ctx.shadowColor = state.isAccept ? 'rgba(16, 185, 129, 0.6)' : 'rgba(59, 130, 246, 0.6)';
        }

        ctx.fillStyle = isActive 
            ? (state.isAccept ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)') 
            : 'rgba(17, 25, 40, 0.9)';
        ctx.beginPath();
        ctx.arc(state.x, state.y, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.lineWidth = isActive ? 3 : 2;
        ctx.strokeStyle = isActive 
            ? (state.isAccept ? '#10b981' : '#3b82f6') 
            : 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.arc(state.x, state.y, radius, 0, Math.PI * 2);
        ctx.stroke();

        if (state.isAccept) {
            ctx.beginPath();
            ctx.arc(state.x, state.y, radius - 5, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.fillStyle = isActive ? '#fff' : '#9ca3af';
        ctx.font = 'bold 14px var(--font-mono)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(state.label, state.x, state.y);

        // Inicial
        if (state.label === pda.initialState) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(state.x - 70, state.y);
            ctx.lineTo(state.x - radius - 5, state.y);
            ctx.stroke();

            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.beginPath();
            ctx.moveTo(state.x - radius - 5, state.y);
            ctx.lineTo(state.x - radius - 12, state.y - 5);
            ctx.lineTo(state.x - radius - 12, state.y + 5);
            ctx.fill();
        }
    }

    drawTransitions(ctx, activeState) {
        ctx.lineWidth = 1.5;
        const radius = 30;

        // 1. Auto-bucle q0 (a, pop Z0 / push AZ0)
        ctx.strokeStyle = activeState === 'q0' ? '#3b82f6' : 'rgba(255,255,255,0.15)';
        ctx.beginPath();
        ctx.arc(120, 180 - radius - 10, 15, -Math.PI / 4, (5 * Math.PI) / 4, true);
        ctx.stroke();
        ctx.fillStyle = activeState === 'q0' ? '#3b82f6' : '#9ca3af';
        ctx.font = '10px var(--font-mono)';
        ctx.textAlign = 'center';
        ctx.fillText('a, Z0 / A Z0', 120, 180 - radius - 30);
        ctx.fillText('a, A / A A', 120, 180 - radius - 42);

        // 2. Transición q0 -> q1 (b, A / ε)
        const isTransitionActiveq0q1 = activeState === 'q0';
        ctx.strokeStyle = isTransitionActiveq0q1 ? '#8b5cf6' : 'rgba(255,255,255,0.15)';
        ctx.beginPath();
        ctx.moveTo(120 + radius, 180);
        ctx.lineTo(280 - radius, 180);
        ctx.stroke();
        
        ctx.fillStyle = isTransitionActiveq0q1 ? '#8b5cf6' : '#9ca3af';
        ctx.beginPath();
        ctx.moveTo(280 - radius, 180);
        ctx.lineTo(280 - radius - 8, 175);
        ctx.lineTo(280 - radius - 8, 185);
        ctx.fill();
        ctx.fillText('b, A / ε', 200, 172);

        // 3. Auto-bucle q1 (b, A / ε)
        ctx.strokeStyle = activeState === 'q1' ? '#3b82f6' : 'rgba(255,255,255,0.15)';
        ctx.beginPath();
        ctx.arc(280, 180 - radius - 10, 15, -Math.PI / 4, (5 * Math.PI) / 4, true);
        ctx.stroke();
        ctx.fillStyle = activeState === 'q1' ? '#3b82f6' : '#9ca3af';
        ctx.fillText('b, A / ε', 280, 180 - radius - 30);

        // 4. Transición q1 -> q2 (ε, Z0 / Z0)
        const isTransitionActiveq1q2 = activeState === 'q1';
        ctx.strokeStyle = isTransitionActiveq1q2 ? '#10b981' : 'rgba(255,255,255,0.15)';
        ctx.beginPath();
        ctx.moveTo(280 + radius, 180);
        ctx.lineTo(440 - radius, 180);
        ctx.stroke();
        
        ctx.fillStyle = isTransitionActiveq1q2 ? '#10b981' : '#9ca3af';
        ctx.beginPath();
        ctx.moveTo(440 - radius, 180);
        ctx.lineTo(440 - radius - 8, 175);
        ctx.lineTo(440 - radius - 8, 185);
        ctx.fill();
        ctx.fillText('ε, Z0 / Z0', 360, 172);
    }
}

let visualizer = null;

// Actualizar Cinta en la interfaz
function updateTapeUI() {
    const tapeContainer = document.getElementById('m3-tape');
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
}

// Actualizar Pila física
function updateStackUI() {
    const stackContainer = document.getElementById('m3-stack-container');
    stackContainer.innerHTML = '';
    
    // Inyectar elementos (se leen de abajo a arriba)
    simState.stack.forEach(symbol => {
        const item = document.createElement('div');
        item.className = 'stack-item';
        item.innerText = symbol;
        stackContainer.appendChild(item);
    });
}

function updateStatusUI() {
    const badge = document.getElementById('m3-status-badge');
    const consoleEl = document.getElementById('m3-console');
    
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

function addConsoleLog(msg, type = 'info') {
    const consoleEl = document.getElementById('m3-console');
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.innerText = `[${new Date().toLocaleTimeString()}] ${msg}`;
    consoleEl.appendChild(entry);
    consoleEl.scrollTop = consoleEl.scrollHeight;
}

function loadInputString() {
    const inputVal = document.getElementById('m3-input-string').value.trim();
    
    // Validar alfabeto del lenguaje {a, b}
    if (!/^[ab]*$/.test(inputVal)) {
        addConsoleLog('Error: La cadena solo debe contener caracteres "a" y "b".', 'error');
        return;
    }

    simState.inputString = inputVal === '' ? 'ε' : inputVal;
    simState.tapeIndex = -1;
    simState.currentState = 'q0';
    simState.stack = ['Z0'];
    simState.status = 'ready';
    
    stopSimulation();
    updateTapeUI();
    updateStackUI();
    updateStatusUI();
    
    addConsoleLog(`Cadena "${simState.inputString}" cargada. Pila inicializada con [${simState.stack.join(', ')}].`, 'info');
}

// Lógica de paso del PDA
function stepSimulation() {
    if (simState.status === 'success' || simState.status === 'halted') {
        addConsoleLog('La simulación ha finalizado. Pulsa Reiniciar.', 'info');
        return false;
    }

    simState.status = 'running';
    const chars = simState.inputString.split('');
    const oldState = simState.currentState;
    
    // Símbolo de cinta actual (ε si ya terminamos la cinta)
    const readIdx = simState.tapeIndex + 1;
    const isEof = simState.inputString === 'ε' || readIdx >= chars.length;
    const symbol = isEof ? 'ε' : chars[readIdx];
    
    // Obtener tope de la pila
    const stackTop = simState.stack[simState.stack.length - 1];
    
    if (!stackTop) {
        // Pila vacía por completo de forma inesperada (bloqueo)
        simState.status = 'halted';
        updateStatusUI();
        addConsoleLog('Error: Pila vacía sin símbolo base Z0. Crash del sistema.', 'error');
        stopSimulation();
        return false;
    }

    // Buscar transición δ(estado_actual, símbolo_cinta, símbolo_pila)
    let transition = pda.transitions.find(t => 
        t.from === oldState && 
        t.read === symbol && 
        t.pop === stackTop
    );

    // Si no hay transición con el símbolo, ver si hay una transición por epsilon (ε) con el tope de pila
    if (!transition && symbol !== 'ε') {
        transition = pda.transitions.find(t => 
            t.from === oldState && 
            t.read === 'ε' && 
            t.pop === stackTop
        );
    }

    if (transition) {
        // Disparar transición
        if (transition.read !== 'ε') {
            simState.tapeIndex++; // Avanzar cabezal si leímos un carácter
        }

        // Operación de Pila
        const popped = simState.stack.pop(); // Sacamos el tope
        
        // Apilar nuevos símbolos (en orden inverso para que el primero del array sea el nuevo tope)
        const toPush = [...transition.push];
        toPush.reverse().forEach(sym => {
            simState.stack.push(sym);
        });

        // Cambio de estado
        simState.currentState = transition.to;

        updateTapeUI();
        updateStackUI();
        updateStatusUI();

        // Determinar qué tipo de operación de pila ocurrió
        let stackOpMsg = '';
        if (transition.push.length === 0) {
            stackOpMsg = `[POP ${popped}]`;
        } else if (transition.push.length === 2 && transition.push[0] === popped) {
            stackOpMsg = `[PUSH ${transition.push[1]}]`;
        } else {
            stackOpMsg = `[STAY / REEMPLACE]`;
        }

        addConsoleLog(`δ(${oldState}, '${transition.read}', ${popped}) → (${simState.currentState}, ${transition.push.join('') || 'ε'}) ${stackOpMsg}`, 'action');

        // Verificar aceptación tras la transición
        const nextTop = simState.stack[simState.stack.length - 1];
        const nextEof = simState.tapeIndex + 1 >= chars.length || simState.inputString === 'ε';

        // Si llegamos a q2 (estado de aceptación)
        if (simState.currentState === 'q2') {
            simState.status = 'success';
            updateStatusUI();
            addConsoleLog('¡Autómata alcanzó el estado q2! Cadena aceptada con éxito (balanceada).', 'success');
            stopSimulation();
            return false;
        }

        return true;
    } else {
        // No hay transición válida
        simState.status = 'halted';
        updateStatusUI();
        addConsoleLog(`Rechazo: No hay transición δ(${oldState}, '${symbol}', ${stackTop}). Cadena mal balanceada.`, 'error');
        stopSimulation();
        return false;
    }
}

// Control automático
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
    document.getElementById('m3-play-icon').innerText = '⏸️';
    document.getElementById('m3-play-label').innerText = 'Pausar';
    addConsoleLog('Simulación del PDA iniciada.', 'info');
    
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
    const iconEl = document.getElementById('m3-play-icon');
    const labelEl = document.getElementById('m3-play-label');
    if (iconEl && labelEl) {
        iconEl.innerText = '▶️';
        labelEl.innerText = 'Ejecutar';
    }
}

function resetSimulation() {
    stopSimulation();
    simState.tapeIndex = -1;
    simState.currentState = 'q0';
    simState.stack = ['Z0'];
    simState.status = 'ready';
    updateTapeUI();
    updateStackUI();
    updateStatusUI();
    addConsoleLog('PDA restablecido. Pila: [Z0], Estado: q0.', 'info');
}

function drawLoop() {
    if (visualizer) {
        visualizer.draw(simState.currentState);
    }
    animationId = requestAnimationFrame(drawLoop);
}

export function initModule3(container) {
    containerRef = container;
    container.innerHTML = moduleHTML;

    visualizer = new PDAGraphVisualizer('m3-canvas');

    document.getElementById('m3-btn-load').addEventListener('click', loadInputString);
    document.getElementById('m3-btn-step').addEventListener('click', stepSimulation);
    document.getElementById('m3-btn-play').addEventListener('click', togglePlay);
    document.getElementById('m3-btn-reset').addEventListener('click', resetSimulation);

    loadInputString();
    drawLoop();
}

export function destroyModule3() {
    stopSimulation();
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    visualizer = null;
    containerRef = null;
}
