// Módulo 5: Redes de Petri y Control Supervisor Descentralizado (SCT / GMEC)

let containerRef = null;
let demoTimer = null;

const INITIAL_MARKING = {
    p_A0: 1, p_A1: 0, p_A2: 0, p_A_fin: 0,
    p_B0: 1, p_B1: 0, p_B2: 0, p_B_fin: 0,
    R1_libre: 1, R2_libre: 1,
    P_sup: 1
};

const TRANSITIONS = {
    t_A1: {
        trigger: 'INICIAR_A',
        controllable: true,
        pre: { p_A0: 1, R1_libre: 1 },
        pre_sup: { P_sup: 1 },
        post: { p_A1: 1 },
        post_sup: {}
    },
    t_A2: {
        trigger: 'AVANZAR_A',
        controllable: true,
        pre: { p_A1: 1, R2_libre: 1 },
        pre_sup: {},
        post: { p_A2: 1 },
        post_sup: { P_sup: 1 }
    },
    t_A3: {
        trigger: 'FIN_A',
        controllable: false,
        pre: { p_A2: 1 },
        pre_sup: {},
        post: { p_A_fin: 1, R1_libre: 1, R2_libre: 1 },
        post_sup: {}
    },
    t_B1: {
        trigger: 'INICIAR_B',
        controllable: true,
        pre: { p_B0: 1, R2_libre: 1 },
        pre_sup: { P_sup: 1 },
        post: { p_B1: 1 },
        post_sup: {}
    },
    t_B2: {
        trigger: 'AVANZAR_B',
        controllable: true,
        pre: { p_B1: 1, R1_libre: 1 },
        pre_sup: {},
        post: { p_B2: 1 },
        post_sup: { P_sup: 1 }
    },
    t_B3: {
        trigger: 'FIN_B',
        controllable: false,
        pre: { p_B2: 1 },
        pre_sup: {},
        post: { p_B_fin: 1, R1_libre: 1, R2_libre: 1 },
        post_sup: {}
    }
};

let sctState = {
    supervisorEnabled: true,
    M: { ...INITIAL_MARKING }
};

export function initModule5(container) {
    containerRef = container;
    resetState(true);
    containerRef.innerHTML = getModuleHTML();
    bindEvents();
    drawPetriCanvas();
    updateUI();
}

export function destroyModule5() {
    if (demoTimer) {
        clearInterval(demoTimer);
        demoTimer = null;
    }
    containerRef = null;
}

function resetState(keepSupMode = true) {
    if (demoTimer) {
        clearInterval(demoTimer);
        demoTimer = null;
    }
    const sup = keepSupMode ? sctState.supervisorEnabled : true;
    sctState = {
        supervisorEnabled: sup,
        M: { ...INITIAL_MARKING }
    };
}

function isPlantEnabled(tid) {
    const t = TRANSITIONS[tid];
    for (const [p, w] of Object.entries(t.pre)) {
        if ((sctState.M[p] || 0) < w) return false;
    }
    return true;
}

function isSupervisorEnabled(tid) {
    if (!sctState.supervisorEnabled) return true;
    const t = TRANSITIONS[tid];
    for (const [p, w] of Object.entries(t.pre_sup)) {
        if ((sctState.M[p] || 0) < w) return false;
    }
    return true;
}

function isFullyEnabled(tid) {
    return isPlantEnabled(tid) && isSupervisorEnabled(tid);
}

function fireTransition(tid) {
    const t = TRANSITIONS[tid];
    if (!isPlantEnabled(tid)) {
        logMsg(`❌ [Planta G] '${t.trigger}' (${tid}) no está habilitada (faltan fichas o recursos físicos).`, 'error');
        return false;
    }
    if (!isSupervisorEnabled(tid)) {
        logMsg(`🛡️ [SUPERVISOR SCT INTERVIENE] La planta G permitiría '${tid}', pero el Lugar Monitor P_sup (M_c=0) inhibe '${t.trigger}' (∈ Σ_c) para evitar el DEADLOCK circular.`, 'warning');
        return false;
    }

    for (const [p, w] of Object.entries(t.pre)) sctState.M[p] -= w;
    if (sctState.supervisorEnabled) {
        for (const [p, w] of Object.entries(t.pre_sup)) sctState.M[p] -= w;
    }
    for (const [p, w] of Object.entries(t.post)) sctState.M[p] += w;
    if (sctState.supervisorEnabled) {
        for (const [p, w] of Object.entries(t.post_sup)) sctState.M[p] += w;
    }

    const typeTag = t.controllable ? 'Σ_c' : 'Σ_uc';
    logMsg(`➜ Disparo [${tid}] (${t.trigger} ∈ ${typeTag}) | M(p_A1)+M(p_B1) = ${sctState.M.p_A1 + sctState.M.p_B1}`, 'success');
    drawPetriCanvas();
    updateUI();
    checkSystemStatus();
    return true;
}

function checkSystemStatus() {
    const badge = document.getElementById('m5-status-badge');
    if (!badge) return;

    if (sctState.M.p_A_fin === 1 && sctState.M.p_B_fin === 1) {
        badge.textContent = '🎉 Éxito Non-Blocking (L_m alcanzado)';
        badge.className = 'status-indicator success';
        logMsg('🎉 ¡META ALCANZADA! Ambas órdenes A y B finalizaron y liberaron R1 y R2.', 'info');
        return;
    }

    const anyEnabled = Object.keys(TRANSITIONS).some(tid => isFullyEnabled(tid));
    if (!anyEnabled) {
        badge.textContent = '🚨 DEADLOCK CIRCULAR DETECTADO';
        badge.className = 'status-indicator error';
        logMsg('🚨 ¡DEADLOCK CIRCULAR! Línea A retiene R1 en p_A1 y espera R2; Línea B retiene R2 en p_B1 y espera R1.', 'error');
    } else {
        badge.textContent = sctState.supervisorEnabled ? '🛡️ Supervisado S/G Activo' : '⚠️ Lazo Abierto G (Sin Supervisor)';
        badge.className = 'status-indicator ready';
    }
}

function getModuleHTML() {
    return `
    <div class="module-container">
        <div class="module-intro">
            <h2>Módulo 5: Redes de Petri y Control Supervisor (SCT / GMEC)</h2>
            <p>Dos líneas concurrentes (<strong>Línea A</strong> y <strong>Línea B</strong>) compiten en orden inverso por el <strong>Robot R1</strong> y la <strong>Estación R2</strong>. Comprueba cómo en lazo abierto ocurre un <em>deadlock</em> circular y cómo el <strong>Lugar Monitor GMEC (P_sup)</strong> sintetizado por invariantes ($M(p_{A1}) + M(p_{B1}) \\le 1$) lo previene.</p>
        </div>

        <div class="skin-selector-container">
            <div class="skin-label">
                🎛️ Modo de Control: <strong id="m5-mode-title">Sistema Supervisado S/G (Con Monitor GMEC P_sup)</strong>
            </div>
            <div class="skin-switch">
                <button class="btn-skin-option active" id="m5-btn-sup-on">🛡️ Con Supervisor SCT</button>
                <button class="btn-skin-option" id="m5-btn-sup-off">⚠️ Sin Supervisor (Lazo Abierto)</button>
            </div>
        </div>

        <div class="simulator-layout">
            <div class="simulation-panel">
                <div class="panel-header">
                    <h3>Red de Petri Bipartita + Lugar Monitor (C = I⁺ - I⁻)</h3>
                    <span class="status-indicator ready" id="m5-status-badge">🛡️ Supervisado S/G Activo</span>
                </div>
                <div class="canvas-container" style="min-height: 390px;">
                    <canvas id="m5-canvas" width="720" height="390"></canvas>
                </div>
                <div class="sim-controls">
                    <button class="btn-secondary" id="m5-btn-reset">🔄 Reiniciar</button>
                    <button class="btn-secondary" id="m5-btn-demo-deadlock">🚨 Demo Deadlock (Sin Sup.)</button>
                    <button class="btn-primary" id="m5-btn-demo-sct">🛡️ Demo Prevención SCT</button>
                </div>
            </div>

            <div class="control-panel">
                <h3>Disparo de Eventos (Triggers)</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-bottom: 1rem;">
                    <button class="btn-secondary m5-trig" data-tid="t_A1">▶️ INICIAR_A (t_A1 ∈ Σc)</button>
                    <button class="btn-secondary m5-trig" data-tid="t_B1">▶️ INICIAR_B (t_B1 ∈ Σc)</button>
                    <button class="btn-secondary m5-trig" data-tid="t_A2">⏩ AVANZAR_A (t_A2 ∈ Σc)</button>
                    <button class="btn-secondary m5-trig" data-tid="t_B2">⏩ AVANZAR_B (t_B2 ∈ Σc)</button>
                    <button class="btn-secondary m5-trig" data-tid="t_A3">⚡ FIN_A (t_A3 ∈ Σuc)</button>
                    <button class="btn-secondary m5-trig" data-tid="t_B3">⚡ FIN_B (t_B3 ∈ Σuc)</button>
                </div>

                <h3>Vector de Marcado M_k e Invariante GMEC</h3>
                <div class="io-card" id="m5-marking-box" style="padding: 0.75rem; font-family: 'Fira Code', monospace; font-size: 0.78rem; margin-bottom: 0.8rem;">
                </div>

                <h3>Bitácora del Motor Algebraico y Supervisor</h3>
                <div class="console-log" id="m5-console" style="min-height: 170px;">
                    <div class="log-entry info">Motor RdP + Supervisor SCT inicializado. Restricción GMEC: M(p_A1) + M(p_B1) ≤ 1.</div>
                </div>
            </div>
        </div>
    </div>
    `;
}

function bindEvents() {
    const btnOn = document.getElementById('m5-btn-sup-on');
    const btnOff = document.getElementById('m5-btn-sup-off');

    btnOn.addEventListener('click', () => {
        sctState.supervisorEnabled = true;
        resetState(true);
        btnOn.classList.add('active');
        btnOff.classList.remove('active');
        document.getElementById('m5-mode-title').textContent = 'Sistema Supervisado S/G (Con Monitor GMEC P_sup)';
        logMsg('🛡️ Supervisor SCT ACTIVADO: Lugar Monitor P_sup inyectado (M_c0 = 1).', 'info');
        drawPetriCanvas();
        updateUI();
        checkSystemStatus();
    });

    btnOff.addEventListener('click', () => {
        sctState.supervisorEnabled = false;
        resetState(true);
        btnOff.classList.add('active');
        btnOn.classList.remove('active');
        document.getElementById('m5-mode-title').textContent = 'Planta Libre G en Lazo Abierto (Sin Supervisor)';
        logMsg('⚠️ Supervisor SCT DESACTIVADO: Operando en lazo abierto (riesgo de sifón vacío).', 'warning');
        drawPetriCanvas();
        updateUI();
        checkSystemStatus();
    });

    document.getElementById('m5-btn-reset').addEventListener('click', () => {
        resetState(true);
        logMsg('🔄 Red de Petri reiniciada al marcado inicial M_0.', 'info');
        drawPetriCanvas();
        updateUI();
        checkSystemStatus();
    });

    document.querySelectorAll('.m5-trig').forEach(btn => {
        btn.addEventListener('click', () => {
            fireTransition(btn.dataset.tid);
        });
    });

    document.getElementById('m5-btn-demo-deadlock').addEventListener('click', () => {
        btnOff.click();
        runSequence(['t_A1', 't_B1']);
    });

    document.getElementById('m5-btn-demo-sct').addEventListener('click', () => {
        btnOn.click();
        runSequence(['t_A1', 't_B1', 't_A2', 't_A3', 't_B1', 't_B2', 't_B3']);
    });
}

function runSequence(seq) {
    if (demoTimer) clearInterval(demoTimer);
    let idx = 0;
    demoTimer = setInterval(() => {
        if (idx >= seq.length) {
            clearInterval(demoTimer);
            demoTimer = null;
            return;
        }
        fireTransition(seq[idx]);
        idx++;
    }, 950);
}

function updateUI() {
    const box = document.getElementById('m5-marking-box');
    if (!box) return;
    const M = sctState.M;
    const sumAB = M.p_A1 + M.p_B1;
    const gmecOk = sumAB <= 1;
    box.innerHTML = `
        <div><strong>Línea A:</strong> p_A0=${M.p_A0}, p_A1=${M.p_A1}, p_A2=${M.p_A2}, p_A_fin=${M.p_A_fin}</div>
        <div><strong>Línea B:</strong> p_B0=${M.p_B0}, p_B1=${M.p_B1}, p_B2=${M.p_B2}, p_B_fin=${M.p_B_fin}</div>
        <div><strong>Recursos:</strong> R1_libre=${M.R1_libre} | R2_libre=${M.R2_libre}</div>
        <div style="margin-top:4px; color: ${gmecOk ? '#10b981' : '#ef4444'};">
            <strong>GMEC:</strong> M(p_A1)+M(p_B1) = ${sumAB} ≤ 1 ${sctState.supervisorEnabled ? `| Holgura P_sup = ${M.P_sup}` : '(Sin Monitor)'}
        </div>
    `;
}

function logMsg(text, type = 'info') {
    const consoleEl = document.getElementById('m5-console');
    if (!consoleEl) return;
    const div = document.createElement('div');
    div.className = `log-entry ${type}`;
    div.textContent = text;
    consoleEl.appendChild(div);
    consoleEl.scrollTop = consoleEl.scrollHeight;
}

function drawPetriCanvas() {
    const canvas = document.getElementById('m5-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const pos = {
        p_A0: { x: 110, y: 45, label: 'p_A0' },
        t_A1: { x: 110, y: 105, label: 't_A1 (Σc)' },
        p_A1: { x: 110, y: 165, label: 'p_A1 (R1)' },
        t_A2: { x: 110, y: 225, label: 't_A2 (Σc)' },
        p_A2: { x: 110, y: 285, label: 'p_A2 (R1+R2)' },
        t_A3: { x: 110, y: 340, label: 't_A3 (Σuc)' },
        p_A_fin: { x: 230, y: 340, label: 'p_A_fin' },

        p_B0: { x: 610, y: 45, label: 'p_B0' },
        t_B1: { x: 610, y: 105, label: 't_B1 (Σc)' },
        p_B1: { x: 610, y: 165, label: 'p_B1 (R2)' },
        t_B2: { x: 610, y: 225, label: 't_B2 (Σc)' },
        p_B2: { x: 610, y: 285, label: 'p_B2 (R2+R1)' },
        t_B3: { x: 610, y: 340, label: 't_B3 (Σuc)' },
        p_B_fin: { x: 490, y: 340, label: 'p_B_fin' },

        R1_libre: { x: 295, y: 165, label: 'R1_libre' },
        R2_libre: { x: 425, y: 165, label: 'R2_libre' },
        P_sup: { x: 360, y: 70, label: 'P_sup (Monitor)' }
    };

    const drawArc = (from, to, color = 'rgba(255,255,255,0.28)', dashed = false) => {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.8;
        if (dashed) ctx.setLineDash([5, 4]);
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
        ctx.restore();
    };

    // Arcos principales Línea A y Línea B
    drawArc(pos.p_A0, pos.t_A1);
    drawArc(pos.t_A1, pos.p_A1);
    drawArc(pos.p_A1, pos.t_A2);
    drawArc(pos.t_A2, pos.p_A2);
    drawArc(pos.p_A2, pos.t_A3);
    drawArc(pos.t_A3, pos.p_A_fin);

    drawArc(pos.p_B0, pos.t_B1);
    drawArc(pos.t_B1, pos.p_B1);
    drawArc(pos.p_B1, pos.t_B2);
    drawArc(pos.t_B2, pos.p_B2);
    drawArc(pos.p_B2, pos.t_B3);
    drawArc(pos.t_B3, pos.p_B_fin);

    // Arcos de recursos R1 y R2
    drawArc(pos.R1_libre, pos.t_A1, 'rgba(59,130,246,0.45)');
    drawArc(pos.R1_libre, pos.t_B2, 'rgba(59,130,246,0.45)');
    drawArc(pos.R2_libre, pos.t_B1, 'rgba(249,115,22,0.45)');
    drawArc(pos.R2_libre, pos.t_A2, 'rgba(249,115,22,0.45)');

    // Arcos del Monitor GMEC P_sup
    if (sctState.supervisorEnabled) {
        drawArc(pos.P_sup, pos.t_A1, '#10b981', true);
        drawArc(pos.t_A2, pos.P_sup, '#10b981', true);
        drawArc(pos.P_sup, pos.t_B1, '#10b981', true);
        drawArc(pos.t_B2, pos.P_sup, '#10b981', true);
    }

    // Dibujar Lugares (Círculos)
    const placeKeys = ['p_A0', 'p_A1', 'p_A2', 'p_A_fin', 'p_B0', 'p_B1', 'p_B2', 'p_B_fin', 'R1_libre', 'R2_libre'];
    if (sctState.supervisorEnabled) placeKeys.push('P_sup');

    placeKeys.forEach(pid => {
        const p = pos[pid];
        const tokens = sctState.M[pid] || 0;
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, 18, 0, Math.PI * 2);
        if (pid === 'P_sup') {
            ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
            ctx.strokeStyle = '#10b981';
        } else if (pid.startsWith('R')) {
            ctx.fillStyle = 'rgba(59, 130, 246, 0.18)';
            ctx.strokeStyle = '#60a5fa';
        } else {
            ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
            ctx.strokeStyle = tokens > 0 ? '#a855f7' : '#64748b';
        }
        ctx.lineWidth = 2.2;
        ctx.fill();
        ctx.stroke();

        // Fichas (Tokens)
        if (tokens > 0) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
            ctx.fillStyle = pid === 'P_sup' ? '#10b981' : '#f8fafc';
            ctx.fill();
        }

        ctx.fillStyle = '#e2e8f0';
        ctx.font = '11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(p.label, p.x, p.y - 24);
        ctx.restore();
    });

    // Dibujar Transiciones (Barras rectangulares)
    Object.keys(TRANSITIONS).forEach(tid => {
        const tPos = pos[tid];
        const enabled = isFullyEnabled(tid);
        const blockedBySup = isPlantEnabled(tid) && !isSupervisorEnabled(tid);

        ctx.save();
        ctx.fillStyle = enabled ? '#10b981' : (blockedBySup ? '#f59e0b' : '#334155');
        ctx.strokeStyle = enabled ? '#34d399' : (blockedBySup ? '#fbbf24' : '#64748b');
        ctx.lineWidth = 2;
        ctx.fillRect(tPos.x - 24, tPos.y - 7, 48, 14);
        ctx.strokeRect(tPos.x - 24, tPos.y - 7, 48, 14);

        ctx.fillStyle = '#cbd5e1';
        ctx.font = '10px Fira Code, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(tPos.label, tPos.x + 54, tPos.y + 4);
        ctx.restore();
    });
}
