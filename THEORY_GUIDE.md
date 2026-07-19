# Guía Teórica Completa: Autómatas, Lenguajes y Procesos Cooperantes

Este documento compila el marco teórico y la progresión didáctica del curso de Teoría de la Computación, Autómatas y Lenguajes Formales, extendido al modelado y control de flujos de trabajo (workflows) de negocio y producción mediante Sistemas de Eventos Discretos (DES).

---

## Índice
1. [Módulo 1: Visión General y Tipos de Cómputo](#módulo-1-visión-general-y-tipos-de-cómputo)
2. [Módulo 2: Autómatas de Estados Finitos (FSA) y Memoria Local](#módulo-2-autómatas-de-estados-finitos-fsa-y-memoria-local)
3. [Módulo 3: Autómatas de Pila (PDA) y Contexto](#módulo-3-autómatas-de-pila-pda-y-contexto)
4. [Módulo 4: Autómatas Comunicantes y Sistemas Concurrentes](#módulo-4-autómatas-comunicantes-y-sistemas-concurrentes)
5. [Teoría de Sistemas de Eventos Discretos (DES) y Lenguajes Marcados](#teoría-de-sistemas-de-eventos-discretos-des-y-lenguajes-marcados)
6. [Control Supervisor (Teoría de Ramadge-Wonham)](#control-supervisor-teoría-de-ramadge-wonham)
7. [Estructura Tríptica de los Procesos: Recursos, Procesos y Productos](#estructura-tríptica-de-los-procesos-recursos-procesos-y-productos)

---

## Módulo 1: Visión General y Tipos de Cómputo

La teoría de la computación formaliza qué problemas pueden ser resueltos usando máquinas que calculan. Estas máquinas interpretan un problema expresado mediante un conjunto de reglas (sintaxis y semántica) que definen cómo realizar el cálculo.

### Pilares de la Teoría Clásica
1.  **Los Lenguajes (El Problema):** Cómo se estructuran y representan los problemas mediante cadenas de símbolos y reglas sintácticas (Gramáticas).
2.  **Los Autómatas (Las Máquinas):** Modelos matemáticos de complejidad incremental (FSA, PDA, LBA, Turing) que deciden lenguajes.
3.  **La Computabilidad (El Límite del Cálculo):** Formalización de qué problemas son decidibles (resolubles en pasos finitos) e indecidibles.

### Las Gramáticas y BNF
Las gramáticas describen las reglas de producción que generan cadenas válidas de un lenguaje.
*   **Reglas de Producción:** Transformaciones del tipo \(\alpha \to \beta\) que dictan cómo evoluciona una secuencia.
*   **BNF (Backus-Naur Form):** Metasintaxis usada para expresar gramáticas. En el modelado de procesos, BNF puede estructurar la sintaxis de un **Workflow de Negocio**:
    ```bnf
    <orden_completada> ::= <registro> <evaluacion_credito> <despacho>
    <evaluacion_credito> ::= "solicitar" "evaluar" ( "aprobar" | "rechazar" )
    ```

### Tipos de Cómputo y Dinámica
*   **Sistemas Combinatorios:** Sistemas sin memoria donde la salida en el instante \(t\) depende únicamente de la entrada en ese instante:
    \[y(t) = f(x(t))\]
*   **Sistemas Dinámicos:** Sistemas cuyo comportamiento evoluciona en el tiempo basándose en un estado interno (memoria).
    *   *Continuos:* Gobernados por ecuaciones diferenciales (variables de estado reales continuas).
    *   *Discretos (DES):* Sistemas con espacio de estados discretos donde las transiciones son provocadas por la ocurrencia de **eventos asíncronos puntuales** (ej: llegada de un mensaje, click de confirmación, falla de máquina).

---

## Módulo 2: Autómatas de Estados Finitos (FSA) y Memoria Local

Cuando la salida del sistema depende de la historia pasada de entradas, introducimos el concepto de **Estado de Memoria Local**.

### Definición Formal (5-Tupla)
Un Autómata Finito Determinista (DFA) se define como:

\[M = (Q, \Sigma, \delta, q_0, F)\]

Donde:
1.  \(Q\) es el conjunto finito de estados.
2.  \(\Sigma\) es el alfabeto de entrada (eventos).
3.  \(\delta: Q \times \Sigma \to Q\) es la función de transición.
4.  \(q_0 \in Q\) es el estado inicial.
5.  \(F \subseteq Q\) es el conjunto de estados de aceptación o marcados.

Al procesarse la cinta de entrada, el lenguaje del problema crece carácter por carácter (modelando un workflow local regular lineal a la derecha/izquierda).

---

## Módulo 3: Autómatas de Pila (PDA) y Contexto

Los autómatas finitos tienen memoria estrictamente acotada por la cardinalidad de \(Q\). No pueden resolver tareas que requieran contar de forma ilimitada o validar estructuras anidadas recursivamente (como el lenguaje \(a^n b^n\) o bloques de código anidados).

### Pila Física (LIFO)
El PDA añade una memoria de acceso restringido en el tope: **Last-In, First-Out (LIFO)**.

### Definición Formal
\[P = (Q, \Sigma, \Gamma, \delta, q_0, Z_0, F)\]

Donde \(\Gamma\) es el alfabeto de la pila y \(Z_0\) el símbolo base. La función de transición opera como:
\[\delta: Q \times (\Sigma \cup \{\epsilon\}) \times \Gamma \to \mathcal{P}(Q \times \Gamma^*)\]

Esta estructura permite validar flujos recursivos y verificar el balanceo de recursos asignados/devueltos.

---

## Módulo 4: Autómatas Comunicantes y Sistemas Concurrentes

Los procesos del mundo real operan concurrentemente y cooperan mediante la transmisión asíncrona o síncrona de señales y datos.

### Paso de Mensajes Síncrono (CCS/CSP)
Dos procesos se comunican mediante puertos complementarios:
*   \(!a\): Acción activa de envío por el canal \(a\).
*   \(?a\): Acción pasiva de recepción en el canal \(a\).

La sincronización (apretón de manos) provoca una transición conjunta oculta al sistema global, llamada **evento silencioso** (\(\tau\)):

\[\frac{P \xrightarrow{!a} P', \quad Q \xrightarrow{?a} Q'}{P \parallel Q \xrightarrow{\tau} P' \parallel Q'}\]

El comportamiento del sistema conjunto se representa mediante un **Sistema de Transiciones Etiquetadas (LTS)** que describe el espacio de estados globales combinados.

---

## Teoría de Sistemas de Eventos Discretos (DES) y Lenguajes Marcados

Un **Sistema de Eventos Discretos (DES)** es un sistema dinámico con un espacio de estados discreto cuyos cambios de estado ocurren en respuesta a la ocurrencia de eventos puntuales discretos.

### Lenguaje Generado vs. Lenguaje Marcado
*   **Lenguaje Generado (\(L(G)\)):** Todas las trayectorias o secuencias físicamente posibles de eventos del sistema.
*   **Lenguaje Marcado (\(L_m(G)\)):** Las secuencias que llevan a **estados marcados (o de aceptación)**, representando metas operativas o productos completados con éxito.
    \[L_m(G) \subseteq L(G)\]

---

## Control Supervisor (Teoría de Ramadge-Wonham)

La automatización de procesos se logra introduciendo un **Supervisor Automático** que interactúa con la **Planta** (el sistema supervisado) para asegurar que el comportamiento conjunto cumpla con los objetivos y esté libre de bloqueos (*deadlocks*).

```
                      ┌──────────────────────┐
                      │      SUPERVISOR      │
                      │         (S)          │
                      └──────┬────────▲──────┘
         Eventos Habilitados │        │ Eventos Ocurridos
         (Controlables)      │        │ (Observables)
                             ▼        │
                      ┌──────────────────────┐
                      │        PLANTA        │
                      │         (G)          │
                      └──────────────────────┘
```

### Eventos Controlables e Incontrolables
El alfabeto de eventos \(\Sigma\) se divide en:
1.  **Eventos Controlables (\(\Sigma_c\)):** Eventos que el supervisor puede deshabilitar/bloquear activamente (ej: `iniciar_maquinado`, `firmar_pago`).
2.  **Eventos Incontrolables (\(\Sigma_{uc}\)):** Eventos que el supervisor no puede impedir (ej: `falla_maquina`, `pedido_cancelado`).

### Regla de Control y No-Bloqueo
El supervisor \(S\) actúa como una función que asigna a cada traza del sistema el conjunto de eventos que se permiten ocurrir en el siguiente paso:
\[S: L(G) \to 2^\Sigma\]
donde \(\Sigma_{uc} \subseteq S(w)\) para toda traza \(w\). Esto garantiza que el supervisor **nunca intente deshabilitar un evento incontrolable**.

El sistema compuesto \(S/G\) (Supervisor interactuando sobre la Planta) tiene un comportamiento deseado que satisface:
*   **Seguridad:** \(L(S/G) \subseteq K\) (donde \(K\) es el comportamiento legal deseado).
*   **No-Bloqueo:** Desde cualquier estado alcanzable del sistema compuesto, siempre es posible llegar a un estado marcado (\(\overline{L_m(S/G)} = L(S/G)\)).

---

## Estructura Tríptica de los Procesos: Recursos, Procesos y Productos

Para modelar un workflow real bajo la teoría DES, estructuramos el sistema en tres componentes:

1.  **Recursos:** Agentes que ejecutan las tareas (personas, máquinas, bases de datos). Su disponibilidad es discreta y se representa formalmente como fichas/tokens en lugares de control.
2.  **Procesos:** Secuencias lógicas de eventos que alteran las condiciones de los recursos. Representados por la función de transición del autómata o transiciones de Redes de Petri.
3.  **Productos:** El valor añadido completado con éxito, formalizado matemáticamente por la llegada de la traza a un **estado marcado** del lenguaje supervisor (\(w \in L_m\)).
