# Guía Teórica Completa: Autómatas, Lenguajes y Procesos Cooperantes

Este documento compila el marco teórico y la progresión didáctica del curso de Teoría de la Computación, Autómatas y Lenguajes Formales, extendido al modelado y control de flujos de trabajo (workflows) de negocio y producción mediante Sistemas de Eventos Discretos (DES).

---

## Índice
1. [Objetivo del Curso y Justificación del Enfoque](#objetivo-del-curso-y-justificación-del-enfoque)
2. [Descripción de Workflows en YAML: Recursos, Procesos y Tokens](#descripción-de-workflows-en-yaml-recursos-procesos-y-tokens)
3. [Módulo 1: Visión General y Tipos de Cómputo](#módulo-1-visión-general-y-tipos-de-cómputo)
4. [Módulo 2: Autómatas de Estados Finitos (FSA) y Memoria Local](#módulo-2-autómatas-de-estados-finitos-fsa-y-memoria-local)
5. [Módulo 3: Autómatas de Pila (PDA) y Contexto](#módulo-3-autómatas-de-pila-pda-y-contexto)
6. [Módulo 4: Autómatas Comunicantes y Sistemas Concurrentes](#módulo-4-autómatas-comunicantes-y-sistemas-concurrentes)
7. [Teoría de Sistemas de Eventos Discretos (DES) y Lenguajes Marcados](#teoría-de-sistemas-de-eventos-discretos-des-y-lenguajes-marcados)
8. [Control Supervisor (Teoría de Ramadge-Wonham)](#control-supervisor-teoría-de-ramadge-wonham)
9. [Estructura Tríptica de los Procesos: Recursos, Procesos y Productos](#estructura-tríptica-de-los-procesos-recursos-procesos-y-productos)

---

## Objetivo del Curso y Justificación del Enfoque

### Objetivo
Utilizar la teoría de la computación y sus formalismos para lograr tener aplicaciones automáticas en el manejo de Flujos de Trabajo (workflows) distribuidos, bien sean procesos de negocio o procesos de manufactura, a la vez que el estudiante comprende los fundamentos de la Teoría de la Computación y los principios del control holónico de la Industria 4.0.

### Justificación del Enfoque
La automatización y validación de flujos de trabajo se fundamenta en los siguientes puntos clave:
1.  **Modelado como DES:** Un Flujo de Trabajo es una secuencia de tareas que siguen unas reglas que pueden ser modeladas como un sistema a eventos discretos (DES).
2.  **Representación Dual:** El flujo de trabajo se describe gráficamente (como un autómata) o mediante un lenguaje formal.
3.  **Validación Formal:** El flujo de trabajo puede ser validado mediante simulación para determinar que logre un cometido (ausencia de bloqueos, terminación).
4.  **Descentralización y Holones:** El sistema se compone de recursos autónomos. Cada recurso tiene su propio motor de transiciones local. El producto (portador del token de estado) se transmite entre los recursos cooperantes (Sistemas Holónicos).
5.  **Recursividad de Recursos:** Un flujo de trabajo se desarrolla en diferentes recursos. Un paso del flujo de trabajo se desarrolla internamente en el recurso y este paso es a su vez un flujo de trabajo (Jerarquía y Recursividad Holónica).
6.  **Concurrencia Avanzada:** Aspectos no considerados normalmente en un curso introductorio, como el paralelismo y la cooperación, se pueden modelar usando otro tipo de autómatas más potentes, como las **Redes de Petri**.

---

## Descripción de Workflows en YAML: Recursos, Procesos y Tokens

Para llevar la teoría a la práctica, los workflows se describen de manera formal utilizando **YAML**. El modelado se basa en tres componentes que interactúan dinámicamente:

1.  **Recursos:** Unidades donde se ejecuta la actividad (personas, máquinas, sistemas).
2.  **Proceso:** Conjunto de estados y reglas de evolución gobernadas por eventos.
3.  **Producto (Token):** El portador físico o de datos que fluye de recurso en recurso. Las operaciones de los procesos transforman el estado interno de este token.

### Arquitectura de Motores Distribuidos
En este enfoque, **cada recurso cuenta con su propio motor de ejecución local** (su propio autómata local). El sistema global no tiene un orquestador único; el producto (con su token de estado) es transmitido entre los recursos cooperantes.

```yaml
proceso: "Ensamble_Vehiculo"
producto:
  nombre: "Chasis"
  token: { id: "TK-01", estado: "MateriaPrima" }
recursos:
  - id: "R1"
    nombre: "Soldador_CNC"
    sub_proceso: # Recursividad: Un workflow completo dentro del recurso R1
      proceso: "Soldadura_Interna"
      producto:
        nombre: "Junta"
        token: { id: "TK-01-S", estado: "PlacasSueltas" }
      recursos:
        - id: "R1.1"
          nombre: "Electrodo"
      eventos:
        - id: "e_soldar"
          controlable: true
      transiciones:
        - de: "PlacasSueltas"
          evento: "e_soldar"
          a: "Soldado"
eventos:
  - id: "e_cargar"
    controlable: true
  - id: "e_procesar"
    controlable: true
transiciones:
  - de: "MateriaPrima"
    evento: "e_cargar"
    recurso: "R1"
    a: "ListoParaSoldar"
  - de: "ListoParaSoldar"
    evento: "e_procesar"
    recurso: "R1"
    a: "Completado" # Requiere que el sub_proceso de R1 alcance su estado marcado
```

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
*   **BNF (Backus-Naur Form):** Metasintaxis usada para expresar gramáticas. En el modelado de workflows secuenciales, BNF puede estructurar la sintaxis de un proceso operativo:
    ```bnf
    <orden_completada> ::= <registro> <evaluacion_credito> <despacho>
    <evaluacion_credito> ::= "solicitar" "evaluar" ( "aprobar" | "rechazar" )
    ```

### Tipos de Cómputo y Dinámica
*   **Sistemas Combinatorios:** Sistemas sin memoria donde la salida en el instante \(t\) depende únicamente de la entrada en ese instante:
    \[y(t) = f(x(t))\]
*   **Sistemas Dinámicos:** Sistemas cuyo comportamiento evoluciona en el tiempo basándose en un estado interno (memoria).
    *   *Continuos:* Gobernados por ecuaciones diferenciales.
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

Al procesarse la cinta de entrada, el lenguaje del problema crece carácter por carácter, modelando un workflow secuencial local con lazos (bucles) pero sin paralelismo.

---

### Pipeline de Procesamiento: Del Archivo a la Ejecución
Antes de que un flujo de trabajo se ejecute en la planta o en el software, transita por cuatro niveles formales:
1. **Descripción Textual (YAML / BNF):** Especificación del proceso.
2. **Validación Sintáctica (PDA Sintáctico):** Valida la gramática del formato (niveles de indentación, claves y delimitadores).
3. **Validación Ontológica / Semántica:** Valida que lo descrito tenga sentido físico y operacional ($q \in Q$, $F \subseteq Q$, capacidades ontológicas del tipo de recurso).
4. **Modelo en Memoria:** Instanciación del autómata formal (tupla en RAM).
5. **Motor en Ejecución (DES / PDA Operacional):** Intérprete que procesa eventos en tiempo real.

---

## Módulo 3: Autómatas de Pila (PDA) y Contexto

Los autómatas finitos tienen memoria estrictamente acotada por la cardinalidad de \(Q\). No pueden resolver tareas que requieran contar de forma ilimitada o validar estructuras anidadas recursivamente (como el lenguaje \(a^n b^n\) o bloques de código anidados).

### El Doble Rol de la Pila (LIFO)
La Pila (*Last-In, First-Out*) opera en dos momentos esenciales del sistema:
1. **En Software (Parser de YAML):** El analizador sintáctico utiliza un **PDA** para hacer PUSH al aumentar la indentación de bloques anidados y POP al cerrarlos. Sin un PDA, no se puede parsear un archivo estructurado en YAML o JSON.
2. **En Planta (Sub-workflows Holónicos):** El motor utiliza una **Pila de Contextos** para hacer PUSH del estado padre al invocar un sub-proceso recursivo y POP al retornar a la línea principal tras concluir con éxito.

### Definición Formal del PDA (7-Tupla)
\[P = (Q, \Sigma, \Gamma, \delta, q_0, Z_0, F)\]

Donde:
* \(Q\): Estados de control del recurso/proceso.
* \(\Sigma\): Alfabeto de eventos de entrada.
* \(\Gamma\): Alfabeto de la memoria de pila (sub-procesos y marcadores).
* \(Z_0 \in \Gamma\): Símbolo de fondo de pila.
* \(\delta: Q \times (\Sigma \cup \{\epsilon\}) \times \Gamma \to \mathcal{P}(Q \times \Gamma^*)\): Función de transición extendida.
* \(F \subseteq Q\): Estados de aceptación.

---

## Módulo 4: Autómatas Comunicantes y Concurrencia

Los procesos del mundo real operan concurrentemente y cooperan mediante la transmisión de señales y datos.

### Paso de Mensajes Síncrono (CCS/CSP)
Dos procesos se comunican mediante puertos complementarios:
*   \(!a\): Acción activa de envío por el canal \(a\).
*   \(?a\): Acción pasiva de recepción en el canal \(a\).

La sincronización (apretón de manos / handshake) provoca una transición conjunta oculta al sistema global, llamada **evento silencioso** (\(\tau\)):

\[\frac{P \xrightarrow{!a} P', \quad Q \xrightarrow{?a} Q'}{P \parallel Q \xrightarrow{\tau} P' \parallel Q'}\]

El comportamiento del sistema conjunto se representa mediante un **Sistema de Transiciones Etiquetadas (LTS)** que describe el espacio de estados globales combinados.

### Redes de Petri (Modelado de Paralelismo)
Para modelar formalmente aspectos avanzados como el paralelismo estructural y la exclusión mutua de recursos compartidos de manera explícita, se utilizan las **Redes de Petri**. Se definen mediante lugares, transiciones, arcos y fichas dinámicas (tokens).

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

### Eventos Controlables e Incontrolables
El alfabeto de eventos \(\Sigma\) se divide en:
1.  **Eventos Controlables (\(\Sigma_c\)):** Eventos que el supervisor puede deshabilitar/bloquear activamente (ej: `iniciar_maquinado`, `firmar_pago`).
2.  **Eventos Incontrolables (\(\Sigma_{uc}\)):** Eventos que el supervisor no puede impedir (ej: `falla_maquina`, `pedido_cancelado`).

### Regla de Control y No-Bloqueo Distribuido
El supervisor \(S\) actúa como una función que asigna a cada traza del sistema el conjunto de eventos que se permiten ocurrir en el siguiente paso:
\[S: L(G) \to 2^\Sigma\]
donde \(\Sigma_{uc} \subseteq S(w)\) para toda traza \(w\). Esto garantiza que el supervisor **nunca intente deshabilitar un evento incontrolable**.

En una **arquitectura descentralizada**, el supervisor opera regulando de manera coordinada las habilitaciones de eventos controlables de los motores de transiciones de cada recurso independiente para garantizar la propiedad global de no-bloqueo (\(\overline{L_m(S/G)} = L(S/G)\)).

---

## Estructura Tríptica de los Procesos: Recursos, Procesos y Productos

Para modelar un workflow real bajo la teoría DES, estructuramos el sistema en tres componentes:
1.  **Recursos:** Agentes autónomos que ejecutan las tareas (personas, máquinas, bases de datos). Cada recurso tiene su propia instancia de motor de estados local.
2.  **Procesos:** Secuencias lógicas de eventos locales y de sincronización que alteran las condiciones de los recursos.
3.  **Productos:** El valor añadido completado con éxito, formalizado matemáticamente por la llegada de la traza global a un **estado marcado** del lenguaje supervisor (\(w \in L_m\)) tras recorrer la red de recursos.
