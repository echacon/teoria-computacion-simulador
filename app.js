import { initModule1, destroyModule1 } from './module1.js';
import { initModule2, destroyModule2 } from './module2.js';
import { initModule3, destroyModule3 } from './module3.js';
import { initModule4, destroyModule4 } from './module4.js';
import { initModuleLab1, destroyModuleLab1 } from './module_lab1.js';

// Base de datos de contenido teórico por módulo
const THEORY_CONTENT = {
    module1: `
        <div class="theory-section">
            <h3>Computación Combinatoria</h3>
            <p>Los sistemas combinatorios son aquellos donde el valor de las salidas depende <strong>únicamente</strong> de los valores de las entradas en ese mismo instante. No existe memoria del pasado.</p>
            <div class="math-block">y = f(x)</div>
            <p>En el ejemplo <code>y = x * b</code>, la salida se calcula de forma directa e inmediata. No hay estados intermedios ni historia acumulada.</p>
        </div>
        <div class="theory-section">
            <h3>Lógica Condicional (Si-Entonces)</h3>
            <p>Representa la toma de decisiones estática basada en condiciones booleanas sobre las entradas:</p>
            <div class="math-block">Si C(x) Entonces f1(x) Sino f2(x)</div>
            <p>Aunque introduce bifurcaciones, el flujo sigue siendo combinatorio si la decisión no depende de ejecuciones anteriores.</p>
        </div>
        <div class="theory-alert">
            <p><strong>Clave Educativa:</strong> Esta computación lineal representa el nivel básico de la computación funcional pura, previa a la introducción del concepto de "Estado".</p>
        </div>
    `,
    module2: `
        <div class="theory-section">
            <h3>Autómatas de Estados Finitos (FSA)</h3>
            <p>Un autómata de estados finitos (DFA/NFA) es un modelo matemático de computación con memoria finita. La salida o decisión depende del estado actual, el cual resume toda la historia de entradas previas.</p>
            <p>Formalmente, se define como una 5-tupla:</p>
            <div class="math-block">M = (Q, Σ, δ, q0, F)</div>
            <ul>
                <li><strong>Q:</strong> Conjunto finito de estados.</li>
                <li><strong>Σ:</strong> Alfabeto (símbolos de entrada).</li>
                <li><strong>δ:</strong> Función de transición (Q × Σ → Q).</li>
                <li><strong>q0:</strong> Estado inicial.</li>
                <li><strong>F:</strong> Conjunto de estados de aceptación.</li>
            </ul>
        </div>
        <div class="theory-section">
            <h3>Crecimiento del Lenguaje</h3>
            <p>Al procesarse la cinta de izquierda a derecha, el lenguaje crece. Una gramática regular lineal a la derecha/izquierda genera este tipo de lenguajes:</p>
            <div class="math-block">A → aB | a</div>
            <p>Cada transición local lee un símbolo y actualiza el estado interno del proceso, modelando un <strong>workflow local</strong>.</p>
        </div>
    `,
    module3: `
        <div class="theory-section">
            <h3>Autómatas de Pila (PDA)</h3>
            <p>Los autómatas de estados finitos no pueden contar de forma ilimitada (ej. no pueden reconocer el lenguaje <code>aⁿbⁿ</code>) porque su memoria de estados es finita.</p>
            <p>Para resolver esto, se añade una memoria no acotada pero estructurada llamada <strong>Pila (Stack)</strong> que funciona bajo el principio LIFO (Last-In, First-Out).</p>
            <p>La función de transición ahora considera el tope de la pila y define qué apilar (push) o desapilar (pop):</p>
            <div class="math-block">δ: Q × (Σ ∪ {ε}) × Γ → Q × Γ*</div>
        </div>
        <div class="theory-section">
            <h3>Lenguajes Libres de Contexto</h3>
            <p>Estos autómatas reconocen los lenguajes libres de contexto. Son esenciales para el análisis sintáctico de lenguajes de programación, ya que permiten modelar estructuras jerárquicas como paréntesis anidados o bloques de código condicionales anidados.</p>
        </div>
    `,
    module4: `
        <div class="theory-section">
            <h3>Autómatas Comunicantes y Concurrencia</h3>
            <p>En el mundo real, los sistemas no se ejecutan de forma aislada. La concurrencia modela múltiples unidades de ejecución (procesos locales) ejecutándose en paralelo y coordinándose mediante paso de mensajes.</p>
        </div>
        <div class="theory-section">
            <h3>Paso de Mensajes (CCS/CSP)</h3>
            <p>Los procesos cooperan utilizando acciones de entrada y salida etiquetadas:</p>
            <ul>
                <li><code>!mensaje</code>: Envío de mensaje.</li>
                <li><code>?mensaje</code>: Recepción de mensaje.</li>
            </ul>
            <p>En el formalismo de CCS (Calculus of Communicating Systems) de Milner, la comunicación ocurre cuando un proceso realiza un envío y otro proceso realiza la recepción del mismo canal de forma síncrona (acción silenciosa <code>τ</code> de sincronización).</p>
        </div>
        <div class="theory-section">
            <h3>La Analogía del Workflow</h3>
            <p>El mismo modelo abstracto de procesos comunicantes representa:</p>
            <div class="concept-card">
                <h4>1. Procesos de Negocio (ERP/BPMN)</h4>
                <p>Las oficinas envían documentos y se coordinan para procesar solicitudes administrativas.</p>
            </div>
            <div class="concept-card">
                <h4>2. Procesos de Producción (MOM/MES)</h4>
                <p>Las máquinas de la fábrica se envían piezas y señales de control para manufacturar productos físicos.</p>
            </div>
        </div>
    `,
    module_lab1: `
        <div class="theory-section">
            <h3>Práctica de Laboratorio 1</h3>
            <p><strong>Objetivo:</strong> Modelar en consola y simular de forma visual el ciclo operacional de un <strong>Recurso Único</strong> como Sistema de Eventos Discretos (DES).</p>
            <p><strong>La Estación de Pintura</strong></p>
            <p>Su espacio de estados discretos incluye:</p>
            <ul>
                <li><code>OCIOSO</code>: Estado inicial, el recurso espera material.</li>
                <li><code>LISTO</code>: La pieza ha sido cargada con éxito.</li>
                <li><code>PINTANDO</code>: El recurso realiza la operación dinámica de valor añadido.</li>
                <li><code>FALLA_TEMPORAL</code>: La máquina reporta un fallo que requiere atención.</li>
                <li><code>COMPLETADO</code>: El producto ha finalizado de forma correcta (estado marcado de éxito).</li>
                <li><code>FALLA_CRITICA</code>: El recurso entra en bloqueo irrecuperable por sobrecalentamiento (estado marcado de fallo).</li>
            </ul>
        </div>
        <div class="theory-section">
            <h3>Enfoque Ontológico en YAML</h3>
            <p>En el panel lateral de control puedes descargar la especificación <code>recurso.yaml</code>. Nota cómo se estructuran formalmente las <em>transiciones</em> y los <em>eventos</em> (controlables vs. incontrolables) bajo una misma ontología descriptiva homogénea.</p>
        </div>
    `
};

// Estado Global de la SPA
const appState = {
    currentModule: 'module1',
    activeInitializer: null,
    activeDestroyer: null
};

// Manejo del cambio de pestañas
function switchTab(targetModuleId) {
    if (appState.currentModule === targetModuleId && document.getElementById('app-container').children.length > 0) {
        return;
    }

    // Ejecutar destructor del módulo anterior para limpiar intervalos, event listeners, etc.
    if (appState.activeDestroyer) {
        appState.activeDestroyer();
    }

    // Actualizar UI de pestañas
    document.querySelectorAll('.nav-tab').forEach(tab => {
        if (tab.dataset.target === targetModuleId) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });

    appState.currentModule = targetModuleId;
    
    // Cambiar contenido teórico
    const theoryContent = document.getElementById('theory-content');
    theoryContent.innerHTML = THEORY_CONTENT[targetModuleId] || '';

    // Cargar e inicializar el nuevo módulo
    const container = document.getElementById('app-container');
    container.innerHTML = ''; // Limpiar contenedor

    switch (targetModuleId) {
        case 'module1':
            appState.activeInitializer = initModule1;
            appState.activeDestroyer = destroyModule1;
            break;
        case 'module2':
            appState.activeInitializer = initModule2;
            appState.activeDestroyer = destroyModule2;
            break;
        case 'module3':
            appState.activeInitializer = initModule3;
            appState.activeDestroyer = destroyModule3;
            break;
        case 'module4':
            appState.activeInitializer = initModule4;
            appState.activeDestroyer = destroyModule4;
            break;
        case 'module_lab1':
            appState.activeInitializer = initModuleLab1;
            appState.activeDestroyer = destroyModuleLab1;
            break;
        default:
            console.error('Módulo no reconocido:', targetModuleId);
            return;
    }

    // Inicializar lógica de módulo
    if (appState.activeInitializer) {
        appState.activeInitializer(container);
    }
}

// Configuración del Panel Lateral de Teoría
function initTheorySidebar() {
    const sidebar = document.getElementById('theory-sidebar');
    const btnToggle = document.getElementById('btn-theory-toggle');
    const btnClose = document.getElementById('btn-theory-close');

    // Estado inicial: abierto para enganchar al alumno
    sidebar.classList.add('active');

    btnToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });

    btnClose.addEventListener('click', () => {
        sidebar.classList.remove('active');
    });
}

// Inicialización de la Aplicación al cargar
document.addEventListener('DOMContentLoaded', () => {
    initTheorySidebar();

    // Eventos para la barra de navegación
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            switchTab(tab.dataset.target);
        });
    });

    // Cargar módulo inicial
    switchTab('module1');
});
