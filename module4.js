// Módulo 4: Autómatas Comunicantes y Analogía de Workflows

let animationId = null;
let containerRef = null;
let simulationInterval = null;

// Configuración de las pieles (Skins)
const SKINS = {
    business: {
        name: 'Procesos de Negocio (ERP/BPMN)',
        className: 'skin-business',
        units: {
            u1: { name: 'Ventas', color: '#3b82f6', states: { ready: 'Listo Ventas', wait: 'Esperando Pago' } },
            u2: { name: 'Finanzas', color: '#db2777', states: { ready: 'Bandeja Vacía', processing: 'Calculando Impuestos', report: 'Facturando' } },
            u3: { name: 'Despacho', color: '#8b5cf6', states: { ready: 'Listo Despacho', processing: 'Empaquetando' } }
        },
        channels: {
            c1: { label: 'Envío de Factura (!Factura)', icon: '📄' },
            c2: { label: 'Orden de Despacho (!Aprobado)', icon: '📦' },
            c3: { label: 'Acuse Pago (!OkPago)', icon: '✓' }
        }
    },
    production: {
        name: 'Procesos de Producción (MOM/MES/Planta)',
        className: 'skin-production',
        units: {
            u1: { name: 'Alimentador', color: '#f97316', states: { ready: 'Alimentador Listo', wait: 'Esperando CNC' } },
            u2: { name: 'Horno CNC', color: '#ef4444', states: { ready: 'Horno Frío', processing: 'Maquinado Térmico', report: 'Expulsando' } },
            u3: { name: 'Inspección', color: '#10b981', states: { ready: 'Estación Libre', processing: 'Medición Calidad' } }
        },
        channels: {
            c1: { label: 'Cargar Material (!Material)', icon: '⚙️' },
            c2: { label: 'Enviar Pieza (!PiezaProcesada)', icon: '🧱' },
            c3: { label: 'Señal de Retorno (!Retorno)', icon: '⚙️' }
        }
    }
};

// Estado del simulador concurrente
const simState = {
    currentSkin: 'business',
    isPlaying: false,
    speed: 1800, // ms por transición
    stepIndex: 0,
    status: 'ready',
    
    // Estados internos de cada unidad
    units: {
        u1: 'ready', // 'ready', 'wait'
        u2: 'ready', // 'ready', 'processing', 'report'
        u3: 'ready'  // 'ready', 'processing'
    },
    
    // Cola de mensajes animados en tránsito
    messages: []
};

// Secuencia de transiciones concurrentes (el ciclo cooperante completo)
const executionTrace = [
    {
        desc: 'Unidad 1 envía señal de inicio a Unidad 2',
        log: {
            business: 'Ventas --!Factura--> Finanzas',
            production: 'Alimentador --!Material--> Horno CNC'
        },
        action: (state) => {
            state.units.u1 = 'wait';
            // Crear mensaje animado
            state.messages.push({
                from: 'u1',
                to: 'u2',
                progress: 0,
                icon: simState.currentSkin === 'business' ? '📄' : '⚙️',
                color: simState.currentSkin === 'business' ? '#3b82f6' : '#f97316'
            });
        }
    },
    {
        desc: 'Unidad 2 recibe señal y procesa internamente',
        log: {
            business: 'Finanzas recibe ?Factura e inicia proceso interno (τ: Impuestos)',
            production: 'Horno CNC recibe ?Material e inicia proceso interno (τ: Calentamiento)'
        },
        action: (state) => {
            state.units.u2 = 'processing';
        }
    },
    {
        desc: 'Unidad 2 termina cálculo interno y envía a Unidad 3',
        log: {
            business: 'Finanzas --!Aprobado--> Despacho (Finanzas emite orden de despacho)',
            production: 'Horno CNC --!PiezaProcesada--> Inspección (Horno expulsa la pieza templada)'
        },
        action: (state) => {
            state.units.u2 = 'report';
            state.messages.push({
                from: 'u2',
                to: 'u3',
                progress: 0,
                icon: simState.currentSkin === 'business' ? '📦' : '🧱',
                color: simState.currentSkin === 'business' ? '#db2777' : '#ef4444'
            });
        }
    },
    {
        desc: 'Unidad 3 recibe y procesa, mientras Unidad 2 libera a Unidad 1',
        log: {
            business: 'Despacho recibe ?Aprobado (τ: Empaque). Finanzas --!OkPago--> Ventas',
            production: 'Inspección recibe ?PiezaProcesada (τ: Medición). Horno CNC --!Retorno--> Alimentador'
        },
        action: (state) => {
            state.units.u3 = 'processing';
            state.units.u2 = 'ready';
            state.messages.push({
                from: 'u2',
                to: 'u1',
                progress: 0,
                icon: '✓',
                color: '#10b981'
            });
        }
    },
    {
        desc: 'Unidad 1 vuelve a estar lista, Unidad 3 finaliza tarea',
        log: {
            business: 'Ventas recibe ?OkPago y vuelve a Listo. Despacho finaliza empaquetado y queda libre.',
            production: 'Alimentador recibe ?Retorno y queda Listo. Inspección finaliza medición y queda libre.'
        },
        action: (state) => {
            state.units.u1 = 'ready';
            state.units.u3 = 'ready';
        }
    }
];

const moduleHTML = `
<div class="module-container" id="m4-container-wrapper">
    <div class="module-intro">
        <h2>Módulo 4: Autómatas Comunicantes e Interacción de Workflows</h2>
        <p>Los procesos reales no trabajan aislados: se ejecutan concurrentemente y cooperan intercambiando mensajes. Aquí demostramos cómo <strong>el mismo formalismo matemático</strong> modela idénticamente un flujo de negocio administrativo y un flujo de manufactura física.</p>
    </div>

    <!-- Selector de Piel (Skin) -->
    <div class="skin-selector-container">
        <div class="skin-label">
            🔌 Perspectiva del Dominio Aplicado: <strong id="m4-skin-title">Procesos de Negocio (ERP/BPMN)</strong>
        </div>
        <div class="skin-switch">
            <button class="btn-skin-option active" id="m4-skin-btn-biz" data-skin="business">Negocios</button>
            <button class="btn-skin-option" id="m4-skin-btn-prod" data-skin="production">Producción</button>
        </div>
    </div>

    <div class="simulator-layout">
        <!-- Panel del Lienzo Concurrente -->
        <div class="simulation-panel">
            <div class="panel-header">
                <h3>Red de Cooperación de Procesos</h3>
                <span class="status-indicator ready" id="m4-status-badge">Sincronizado</span>
            </div>
            
            <div class="canvas-container">
                <canvas id="m4-canvas"></canvas>
            </div>

            <div class="sim-controls">
                <button class="btn-secondary" id="m4-btn-reset">🔄 Reiniciar</button>
                <button class="btn-primary" id="m4-btn-play">
                    <span id="m4-play-icon">▶️</span> <span id="m4-play-label">Ejecutar</span>
                </button>
                <button class="btn-secondary" id="m4-btn-step">➡️ Paso a Paso</button>
            </div>
        </div>

        <!-- Consola de LTS e Información de Estados -->
        <div class="control-panel">
            <h3>Estado de Unidades Concurrentes</h3>
            
            <!-- Tarjetas de Estado Local de las Unidades -->
            <div class="io-card" style="padding: 0.75rem; display: flex; flex-direction: column; gap: 0.5rem;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <strong style="color: var(--primary);" id="lbl-u1">Ventas:</strong>
                    <span class="tape-cell" style="width: auto; height: auto; padding: 0.2rem 0.5rem; font-size: 0.75rem;" id="state-u1">Listo</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <strong style="color: var(--secondary);" id="lbl-u2">Finanzas:</strong>
                    <span class="tape-cell" style="width: auto; height: auto; padding: 0.2rem 0.5rem; font-size: 0.75rem;" id="state-u2">Libre</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <strong style="color: #8b5cf6;" id="lbl-u3">Despacho:</strong>
                    <span class="tape-cell" style="width: auto; height: auto; padding: 0.2rem 0.5rem; font-size: 0.75rem;" id="state-u3">Espera</span>
                </div>
            </div>

            <h3>Traza del LTS (Sistemas de Transiciones Etiquetadas)</h3>
            <div class="console-log" id="m4-console" style="min-height: 200px;">
                <div class="log-entry info">Sistema inicializado. Haz clic en Ejecutar para comenzar el flujo concurrente.</div>
            </div>
        </div>
    </div>
</div>
`;

class ConcurrentVisualizer {
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
        
        // Coordenadas de los 3 procesos principales
        const w = this.canvas.width;
        const h = this.canvas.height;
        this.nodes = {
            u1: { x: w * 0.2, y: h * 0.5 },
            u2: { x: w * 0.5, y: h * 0.5 },
            u3: { x: w * 0.8, y: h * 0.5 }
        };
    }

    draw(state) {
        if (!this.canvas || !this.ctx) return;
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;

        ctx.clearRect(0, 0, width, height);

        const skinData = SKINS[state.currentSkin];

        // Dibujar canales de comunicación (Líneas de conexión)
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        
        // Canal u1 -> u2 (arriba)
        ctx.beginPath();
        ctx.moveTo(this.nodes.u1.x, this.nodes.u1.y - 15);
        ctx.lineTo(this.nodes.u2.x, this.nodes.u2.y - 15);
        ctx.stroke();

        // Canal u2 -> u3 (arriba)
        ctx.beginPath();
        ctx.moveTo(this.nodes.u2.x, this.nodes.u2.y - 15);
        ctx.lineTo(this.nodes.u3.x, this.nodes.u3.y - 15);
        ctx.stroke();

        // Canal u2 -> u1 (retorno abajo)
        ctx.beginPath();
        ctx.moveTo(this.nodes.u2.x, this.nodes.u2.y + 15);
        ctx.lineTo(this.nodes.u1.x, this.nodes.u1.y + 15);
        ctx.stroke();

        // Dibujar etiquetas de canales
        ctx.fillStyle = '#4b5563';
        ctx.font = '9px var(--font-mono)';
        ctx.textAlign = 'center';
        ctx.fillText(skinData.channels.c1.label, (this.nodes.u1.x + this.nodes.u2.x)/2, this.nodes.u1.y - 25);
        ctx.fillText(skinData.channels.c2.label, (this.nodes.u2.x + this.nodes.u3.x)/2, this.nodes.u2.y - 25);
        ctx.fillText(skinData.channels.c3.label, (this.nodes.u1.x + this.nodes.u2.x)/2, this.nodes.u1.y + 35);

        // Dibujar los mensajes animados en tránsito
        for (let i = state.messages.length - 1; i >= 0; i--) {
            const msg = state.messages[i];
            
            // Incrementar progreso
            msg.progress += 0.02;
            if (msg.progress >= 1) {
                state.messages.splice(i, 1);
                continue;
            }

            const fromNode = this.nodes[msg.from];
            const toNode = this.nodes[msg.to];
            
            // Determinar si va por canal superior o inferior
            let offset = -15; // Superior por defecto
            if (msg.from === 'u2' && msg.to === 'u1') {
                offset = 15; // Retorno inferior
            }

            const curX = fromNode.x + (toNode.x - fromNode.x) * msg.progress;
            const curY = fromNode.y + (toNode.y - fromNode.y) * msg.progress + offset;

            // Dibujar círculo mensaje
            ctx.fillStyle = msg.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = msg.color;
            ctx.beginPath();
            ctx.arc(curX, curY, 14, 0, Math.PI*2);
            ctx.fill();
            ctx.shadowBlur = 0; // reset

            // Borde blanco
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Dibujar icono
            ctx.fillStyle = '#fff';
            ctx.font = '12px var(--font-sans)';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(msg.icon, curX, curY);
        }

        // Dibujar nodos de Procesos
        Object.keys(this.nodes).forEach(key => {
            const pos = this.nodes[key];
            const uData = skinData.units[key];
            const curStateKey = state.units[key];
            const curStateLabel = uData.states[curStateKey];
            
            const radius = 45;
            const isActive = curStateKey !== 'ready';

            // Relleno
            ctx.fillStyle = isActive ? 'rgba(30, 41, 59, 0.9)' : 'rgba(17, 25, 40, 0.8)';
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, radius, 0, Math.PI*2);
            ctx.fill();

            // Resplandor si está haciendo procesamiento interno
            if (curStateKey === 'processing') {
                ctx.shadowBlur = 15;
                ctx.shadowColor = uData.color;
            }

            // Borde
            ctx.strokeStyle = isActive ? uData.color : 'rgba(255,255,255,0.15)';
            ctx.lineWidth = isActive ? 3 : 2;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, radius, 0, Math.PI*2);
            ctx.stroke();
            ctx.shadowBlur = 0; // reset

            // Nombre
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 12px var(--font-display)';
            ctx.textAlign = 'center';
            ctx.fillText(uData.name, pos.x, pos.y - 8);

            // Estado
            ctx.fillStyle = isActive ? uData.color : '#9ca3af';
            ctx.font = '9px var(--font-mono)';
            ctx.fillText(curStateLabel, pos.x, pos.y + 12);
        });
    }
}

let visualizer = null;

// Sincronizar UI textual
function updateTextUI() {
    const skinData = SKINS[simState.currentSkin];
    
    // Etiquetas de nombres
    document.getElementById('lbl-u1').innerText = skinData.units.u1.name + ':';
    document.getElementById('lbl-u2').innerText = skinData.units.u2.name + ':';
    document.getElementById('lbl-u3').innerText = skinData.units.u3.name + ':';

    // Estados
    document.getElementById('state-u1').innerText = skinData.units.u1.states[simState.units.u1];
    document.getElementById('state-u2').innerText = skinData.units.u2.states[simState.units.u2];
    document.getElementById('state-u3').innerText = skinData.units.u3.states[simState.units.u3];

    // Colores de la UI según el estado
    document.getElementById('state-u1').style.color = simState.units.u1 !== 'ready' ? skinData.units.u1.color : 'inherit';
    document.getElementById('state-u2').style.color = simState.units.u2 !== 'ready' ? skinData.units.u2.color : 'inherit';
    document.getElementById('state-u3').style.color = simState.units.u3 !== 'ready' ? skinData.units.u3.color : 'inherit';

    const badge = document.getElementById('m4-status-badge');
    badge.className = 'status-indicator';
    if (simState.status === 'ready') {
        badge.classList.add('ready');
        badge.innerText = 'Sincronizado';
    } else if (simState.status === 'running') {
        badge.classList.add('running');
        badge.innerText = 'Ejecutando';
    } else if (simState.status === 'success') {
        badge.classList.add('success');
        badge.innerText = 'Ciclo Completado';
    }
}

function addConsoleLog(msg, type = 'info') {
    const consoleEl = document.getElementById('m4-console');
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.innerText = `[${new Date().toLocaleTimeString()}] ${msg}`;
    consoleEl.appendChild(entry);
    consoleEl.scrollTop = consoleEl.scrollHeight;
}

// Cambiar de Piel
function setSkin(skinName) {
    if (simState.currentSkin === skinName) return;

    simState.currentSkin = skinName;
    document.getElementById('m4-skin-title').innerText = SKINS[skinName].name;

    // Cambiar clases del wrapper de estilos
    const wrapper = document.getElementById('m4-container-wrapper');
    if (skinName === 'business') {
        document.getElementById('m4-skin-btn-biz').classList.add('active');
        document.getElementById('m4-skin-btn-prod').classList.remove('active');
        wrapper.className = 'module-container skin-business';
    } else {
        document.getElementById('m4-skin-btn-biz').classList.remove('active');
        document.getElementById('m4-skin-btn-prod').classList.add('active');
        wrapper.className = 'module-container skin-production';
    }

    addConsoleLog(`Cambio de perspectiva de visualización a: ${SKINS[skinName].name}`, 'info');
    updateTextUI();
}

// Avanzar la simulación de concurrencia
function stepSimulation() {
    if (simState.stepIndex >= executionTrace.length) {
        simState.status = 'success';
        updateTextUI();
        addConsoleLog('Ciclo cooperativo finalizado. Todos los procesos retornaron a su estado inicial.', 'success');
        stopSimulation();
        return false;
    }

    simState.status = 'running';
    const transition = executionTrace[simState.stepIndex];
    
    // Aplicar lógica
    transition.action(simState);
    
    // Registrar log específico de la piel activa
    const logMsg = transition.log[simState.currentSkin];
    addConsoleLog(`Paso ${simState.stepIndex + 1}: ${logMsg}`, 'action');
    
    simState.stepIndex++;
    updateTextUI();
    return true;
}

function togglePlay() {
    if (simState.isPlaying) {
        stopSimulation();
    } else {
        if (simState.status === 'success') {
            resetSimulation();
        }
        startSimulation();
    }
}

function startSimulation() {
    simState.isPlaying = true;
    document.getElementById('m4-play-icon').innerText = '⏸️';
    document.getElementById('m4-play-label').innerText = 'Pausar';
    addConsoleLog('Simulación concurrente iniciada.', 'info');

    const ok = stepSimulation();
    if (!ok) return;

    simulationInterval = setInterval(() => {
        const hasNext = stepSimulation();
        if (!hasNext) {
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
    const iconEl = document.getElementById('m4-play-icon');
    const labelEl = document.getElementById('m4-play-label');
    if (iconEl && labelEl) {
        iconEl.innerText = '▶️';
        labelEl.innerText = 'Ejecutar';
    }
}

function resetSimulation() {
    stopSimulation();
    simState.stepIndex = 0;
    simState.units.u1 = 'ready';
    simState.units.u2 = 'ready';
    simState.units.u3 = 'ready';
    simState.messages = [];
    simState.status = 'ready';
    updateTextUI();
    addConsoleLog('Simulación reiniciada. Todos los autómatas locales sincronizados.', 'info');
}

function drawLoop() {
    if (visualizer) {
        visualizer.draw(simState);
    }
    animationId = requestAnimationFrame(drawLoop);
}

export function initModule4(container) {
    containerRef = container;
    container.innerHTML = moduleHTML;

    visualizer = new ConcurrentVisualizer('m4-canvas');

    // Registrar Eventos
    document.getElementById('m4-skin-btn-biz').addEventListener('click', () => setSkin('business'));
    document.getElementById('m4-skin-btn-prod').addEventListener('click', () => setSkin('production'));
    document.getElementById('m4-btn-step').addEventListener('click', stepSimulation);
    document.getElementById('m4-btn-play').addEventListener('click', togglePlay);
    document.getElementById('m4-btn-reset').addEventListener('click', resetSimulation);

    // Ajustar clase inicial del wrapper
    const wrapper = document.getElementById('m4-container-wrapper');
    wrapper.className = 'module-container skin-business';

    // Carga inicial
    updateTextUI();
    drawLoop();
}

export function destroyModule4() {
    stopSimulation();
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    visualizer = null;
    containerRef = null;
}
