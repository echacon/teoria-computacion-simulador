// Módulo 1: Computación Combinatoria y Decisiones

let animationId = null;
let containerRef = null;

// HTML del Módulo 1
const moduleHTML = `
<div class="module-container">
    <div class="module-intro">
        <h2>Módulo 1: Computación Combinatoria e Inmediata</h2>
        <p>Aquí estudiamos sistemas sin memoria. La salida es una respuesta instantánea y directa de los valores de entrada actuales, sin que importe el pasado. Es el fundamento del hardware lógico y las funciones matemáticas puras.</p>
    </div>

    <div class="simulator-layout">
        <!-- Panel de Simulación y Visualización -->
        <div class="simulation-panel">
            <div class="panel-header">
                <h3>Visualizador de Flujo Combinatorio</h3>
                <span class="status-indicator ready" id="m1-status">Funcional</span>
            </div>
            
            <div class="canvas-container">
                <canvas id="m1-canvas"></canvas>
            </div>
        </div>

        <!-- Controles Interactivos -->
        <div class="control-panel">
            <h3>Controles y Parámetros</h3>
            
            <div class="form-group">
                <label for="m1-operation">Seleccionar Tipo de Proceso:</label>
                <select id="m1-operation">
                    <option value="linear">Operación Lineal (y = x * b)</option>
                    <option value="conditional">Lógica Condicional (Si x > b entonces x-b sino x+b)</option>
                </select>
            </div>

            <div class="io-card">
                <h4>Variables de Entrada (Estímulo Inmediato)</h4>
                
                <div class="form-group">
                    <label for="m1-input-x">Entrada X: <span id="val-x">5</span></label>
                    <input type="range" id="m1-input-x" min="0" max="10" value="5" step="1">
                </div>

                <div class="form-group">
                    <label for="m1-input-b">Parámetro B: <span id="val-b">3</span></label>
                    <input type="range" id="m1-input-b" min="1" max="10" value="3" step="1">
                </div>
            </div>

            <div class="io-card">
                <h4>Resultado de Salida (Cálculo Inmediato)</h4>
                <div class="form-group">
                    <div class="math-formula-box" style="padding: 0.5rem; margin-bottom: 0.5rem;">
                        <span class="formula-display" id="m1-formula-text" style="font-size: 1.25rem;">y = x * b</span>
                    </div>
                    <div class="output-value" id="m1-output">15</div>
                </div>
            </div>
            
            <div class="console-log" id="m1-console">
                <div class="log-entry info">Consola del sistema lista. Modifica los controles superiores.</div>
            </div>
        </div>
    </div>
</div>
`;

// Canvas Drawing and Animation
class CombinatorialVisualizer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        
        // Parámetros de la animación
        this.particles = [];
        this.opType = 'linear';
        this.xVal = 5;
        this.bVal = 3;
        this.yVal = 15;
        
        this.blockX = 0;
        this.blockY = 0;
        this.blockWidth = 140;
        this.blockHeight = 80;
        
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        if (!this.canvas) return;
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = Math.max(rect.height, 350);
        
        this.blockX = this.canvas.width / 2 - this.blockWidth / 2;
        this.blockY = this.canvas.height / 2 - this.blockHeight / 2;
    }

    updateValues(opType, x, b, y) {
        this.opType = opType;
        this.xVal = x;
        this.bVal = b;
        this.yVal = y;
        
        // Generar partículas de flujo de datos
        this.triggerFlow();
    }

    triggerFlow() {
        // Añadir partículas que viajan desde las entradas a la compuerta de procesamiento
        const entryY1 = this.canvas.height / 2 - 40;
        const entryY2 = this.canvas.height / 2 + 40;
        
        // Partícula para X
        this.particles.push({
            startX: 50,
            startY: entryY1,
            x: 50,
            y: entryY1,
            targetX: this.blockX,
            targetY: this.blockY + 25,
            color: '#3b82f6',
            value: this.xVal,
            label: 'X',
            speed: 4,
            progress: 0,
            phase: 'input'
        });

        // Partícula para B
        this.particles.push({
            startX: 50,
            startY: entryY2,
            x: 50,
            y: entryY2,
            targetX: this.blockX,
            targetY: this.blockY + 55,
            color: '#8b5cf6',
            value: this.bVal,
            label: 'B',
            speed: 4,
            progress: 0,
            phase: 'input'
        });
    }

    draw() {
        if (!this.canvas || !this.ctx) return;
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;

        ctx.clearRect(0, 0, width, height);

        // Dibujar Cables de Entrada
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        
        // Cable X
        ctx.beginPath();
        ctx.moveTo(50, height / 2 - 40);
        ctx.lineTo(this.blockX, this.blockY + 25);
        ctx.stroke();

        // Cable B
        ctx.beginPath();
        ctx.moveTo(50, height / 2 + 40);
        ctx.lineTo(this.blockX, this.blockY + 55);
        ctx.stroke();

        // Cable de Salida Y
        ctx.beginPath();
        ctx.moveTo(this.blockX + this.blockWidth, height / 2);
        ctx.lineTo(width - 80, height / 2);
        ctx.stroke();

        // Dibujar Puertos de Entrada
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        
        // Puerto X
        ctx.beginPath();
        ctx.arc(50, height / 2 - 40, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.font = '10px var(--font-mono)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`X=${this.xVal}`, 50, height / 2 - 40);

        // Puerto B
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#8b5cf6';
        ctx.beginPath();
        ctx.arc(50, height / 2 + 40, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.fillText(`B=${this.bVal}`, 50, height / 2 + 40);

        // Puerto de Salida Y
        ctx.fillStyle = '#111827';
        ctx.strokeStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(width - 80, height / 2, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 12px var(--font-mono)';
        ctx.fillText(`Y=${this.yVal}`, width - 80, height / 2);

        // Dibujar Bloque Procesador / Compuerta Lógica
        ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
        ctx.strokeStyle = this.opType === 'linear' ? '#06b6d4' : '#f59e0b';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.roundRect(this.blockX, this.blockY, this.blockWidth, this.blockHeight, 8);
        ctx.fill();
        ctx.stroke();

        // Titulo del bloque
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px var(--font-display)';
        ctx.textAlign = 'center';
        ctx.fillText(this.opType === 'linear' ? 'MULTIPLICADOR' : 'COMPARADOR / COND', this.blockX + this.blockWidth/2, this.blockY + 30);
        
        ctx.fillStyle = varColorText(this.opType);
        ctx.font = '11px var(--font-mono)';
        ctx.fillText(this.opType === 'linear' ? 'y = x * b' : 'x > b ? x-b : x+b', this.blockX + this.blockWidth/2, this.blockY + 55);

        // Animación y Dibujo de Partículas
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            if (p.phase === 'input') {
                p.progress += 0.04;
                p.x = p.startX + (p.targetX - p.startX) * p.progress;
                p.y = p.startY + (p.targetY - p.startY) * p.progress;
                
                if (p.progress >= 1) {
                    p.phase = 'processing';
                    p.progress = 0;
                    
                    // Si ambas partículas llegaron, disparar la salida
                    const inputsProcessing = this.particles.filter(pt => pt.phase === 'processing');
                    if (inputsProcessing.length >= 2) {
                        this.particles = this.particles.filter(pt => pt.phase !== 'processing'); // eliminar
                        this.triggerOutputFlow();
                    }
                }
            } else if (p.phase === 'output') {
                p.progress += 0.04;
                p.x = p.startX + (p.targetX - p.startX) * p.progress;
                p.y = p.startY + (p.targetY - p.startY) * p.progress;
                
                if (p.progress >= 1) {
                    this.particles.splice(i, 1); // Remover partícula al llegar
                }
            }

            // Dibujar partícula
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
            ctx.fill();
            
            // Halo brillante
            ctx.shadowBlur = 10;
            ctx.shadowColor = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.shadowBlur = 0; // reset
        }
    }

    triggerOutputFlow() {
        this.particles.push({
            startX: this.blockX + this.blockWidth,
            startY: this.canvas.height / 2,
            x: this.blockX + this.blockWidth,
            y: this.canvas.height / 2,
            targetX: this.canvas.width - 80,
            targetY: this.canvas.height / 2,
            color: '#10b981',
            value: this.yVal,
            speed: 4,
            progress: 0,
            phase: 'output'
        });
    }
}

function varColorText(op) {
    return op === 'linear' ? '#06b6d4' : '#f59e0b';
}

let visualizer = null;

// Lógica de cálculo combinatorio
function calculate() {
    const op = document.getElementById('m1-operation').value;
    const x = parseInt(document.getElementById('m1-input-x').value);
    const b = parseInt(document.getElementById('m1-input-b').value);
    const outputEl = document.getElementById('m1-output');
    const formulaEl = document.getElementById('m1-formula-text');
    const consoleEl = document.getElementById('m1-console');
    
    // Actualizar etiquetas numéricas
    document.getElementById('val-x').innerText = x;
    document.getElementById('val-b').innerText = b;
    
    let y = 0;
    let logMsg = '';
    
    if (op === 'linear') {
        y = x * b;
        formulaEl.innerText = `y = x * b  ⇒  y = ${x} * ${b}`;
        logMsg = `Cálculo Lineal: Entrada X=${x}, Parámetro B=${b}. Salida Y = ${x} * ${b} = ${y}`;
    } else {
        if (x > b) {
            y = x - b;
            formulaEl.innerText = `x > b  ⇒  y = x - b  ⇒  y = ${x} - ${b}`;
            logMsg = `Cálculo Condicional (Verdadero X > B): ${x} > ${b}. Salida Y = ${x} - ${b} = ${y}`;
        } else {
            y = x + b;
            formulaEl.innerText = `x ≤ b  ⇒  y = x + b  ⇒  y = ${x} + ${b}`;
            logMsg = `Cálculo Condicional (Falso X ≤ B): ${x} ≤ ${b}. Salida Y = ${x} + ${b} = ${y}`;
        }
    }
    
    outputEl.innerText = y;
    
    // Registrar en consola
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry success';
    logEntry.innerText = `[${new Date().toLocaleTimeString()}] ${logMsg}`;
    consoleEl.appendChild(logEntry);
    consoleEl.scrollTop = consoleEl.scrollHeight;

    // Actualizar visualización gráfica
    if (visualizer) {
        visualizer.updateValues(op, x, b, y);
    }
}

// Bucle de Animación
function animLoop() {
    if (visualizer) {
        visualizer.draw();
    }
    animationId = requestAnimationFrame(animLoop);
}

export function initModule1(container) {
    containerRef = container;
    container.innerHTML = moduleHTML;

    visualizer = new CombinatorialVisualizer('m1-canvas');

    // Registrar Eventos de Controles
    const selectOp = document.getElementById('m1-operation');
    const rangeX = document.getElementById('m1-input-x');
    const rangeB = document.getElementById('m1-input-b');

    selectOp.addEventListener('change', calculate);
    rangeX.addEventListener('input', calculate);
    rangeB.addEventListener('input', calculate);

    // Calcular valores iniciales
    calculate();

    // Iniciar bucle de animación a 60fps
    animLoop();
}

export function destroyModule1() {
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    visualizer = null;
    containerRef = null;
}
