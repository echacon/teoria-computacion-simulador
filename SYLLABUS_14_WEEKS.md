# Plan de Estudios (Syllabus): Teoría de la Computación y Sistemas Supervisados
**Duración:** 14 Semanas (1 Semestre)

---

## 🎯 Objetivo del Curso
Utilizar la teoría de la computación y sus formalismos para lograr tener aplicaciones automáticas en el manejo de Flujos de Trabajo (workflows) distribuidos, bien sean procesos de negocio o procesos de manufactura, a la vez que el estudiante comprende los fundamentos de la Teoría de la Computación y las bases de los sistemas holónicos y multi-agente de la Industria 4.0.

---

## 💡 Justificación del Enfoque
La automatización, simulación y supervisión de flujos de trabajo se fundamenta en los siguientes puntos clave:
1. **Modelado como DES:** Un Flujo de Trabajo es una secuencia de tareas que siguen unas reglas que pueden ser modeladas como un sistema a eventos discretos (DES).
2. **Representación Dual y Pipeline de Validación:** El flujo se describe en un metalenguaje formal (YAML/BNF). Antes de ejecutarse, transita por dos filtros indispensables:
   * *Validación Sintáctica:* Verificación gramatical del formato mediante un Autómata de Pila (PDA sintáctico del parser).
   * *Validación Ontológica/Semántica:* Coherencia de dominio (existencia de estados $q \in Q$, inclusión $F \subseteq Q$, capacidades físicas del tipo de recurso).
3. **Validación Formal:** El flujo de trabajo se valida mediante simulación para determinar que logre un cometido (ausencia de bloqueos, terminación).
4. **Descentralización y Holones:** El sistema se compone de recursos autónomos. Cada recurso tiene su propio motor de transiciones local. El producto (portador del token de estado) se transmite entre los recursos cooperantes (Sistemas Holónicos).
5. **Recursividad y Doble Rol de la Pila:** La estructura de Pila (LIFO / Tipo 2) opera en dos niveles:
   * *En Software:* Permite al parser de YAML/JSON procesar sangrías y bloques anidados.
   * *En Planta:* Permite al motor gestionar sub-workflows jerárquicos y sub-holones (PUSH al entrar al sub-proceso, POP al retornar).
6. **Concurrencia y Redes de Petri:** La sincronización de recursos y el paralelismo explícito se modelan y analizan formalmente mediante Redes de Petri.

---

## 📅 Cronograma Semanal y Hitos del Proyecto

### Bloque 1: Fundamentos y Procesos Secuenciales (Semanas 1-3)

*   **Semana 1 & 2: Introducción a la Computación y Flujos Secuenciales**
    *   *Teoría:* Conceptos de Lenguajes, Gramáticas, Sistemas Combinatorios y Sistemas con Memoria. Metalenguaje BNF.
    *   *Workflow:* Flujos de trabajo y la relación con autómatas. Cómo describir un proceso local simple, secuencial y con lazos (bucles), sin paralelismo.
    *   *Práctica:* Diseño de BNF para workflows secuenciales locales y simulación combinatoria en código.
*   **Semana 3: Dinámica de Sistemas y Eventos Discretos (DES)**
    *   *Teoría:* El concepto de Estado de Memoria. Sistemas Dinámicos Continuos vs. Discretos. El estado de un recurso operacional.
    *   *Práctica:* Modelado en consola del ciclo operacional de un recurso único.

---

### Bloque 2: Autómatas de Estados Finitos y Modelado Local (Semanas 4-6)

*   **Semana 4: Autómatas Finitos Deterministas (DFA)**
    *   *Teoría:* La 5-tupla formal. Diagramas de transición y tablas de estado como workflows secuenciales con lazos locales.
    *   *Práctica:* Diseño de DFA para validar secuencias de operaciones de usuarios o procesos locales.
*   **Semana 5: Lenguajes Regulares y Crecimiento de Cadenas**
    *   *Teoría:* Gramáticas regulares lineales a la derecha/izquierda. Cinta de entrada e historial de ejecución. Expresiones regulares en Python y SQL.
    *   *Práctica:* Codificación de transiciones de un DFA local.
*   **Semana 6: Hito del Proyecto - Motor FSA Local**
    *   *Teoría:* Serialización de grafos de procesos en formato estructurado (YAML/JSON). Arquitectura del intérprete genérico.
    *   *Hito de Laboratorio (Entregable 1):* Construir el cargador de especificaciones YAML/JSON y el motor de transiciones local del recurso para procesar eventos secuenciales.

---

### Bloque 3: Memoria Estructurada, Pila y Recursividad (Semanas 7-9)

*   **Semana 7: La Limitación de los FSA y la Recursividad**
    *   *Teoría:* Lenguajes no regulares. Lema del Bombeo ($a^n b^n$). El límite de la memoria finita ante estructuras anidadas y balances de recursos.
*   **Semana 8: Autómatas de Pila (PDA) y Lenguajes Libres de Contexto**
    *   *Teoría:* La estructura de Pila (LIFO). Definición formal del PDA (7-tupla). Operaciones PUSH y POP. El doble rol de la Pila: validación sintáctica de indentación en YAML vs. gestión operacional de sub-holones recursivos.
    *   *Práctica:* Validación de jerarquías de procesos y sub-holones balanceados.
*   **Semana 9: Hito del Proyecto - El Motor PDA**
    *   *Hito de Laboratorio (Entregable 2):* Extender el motor del proyecto para incorporar la pila física y evaluar transiciones complejas de sub-procesos recursivos.

---

### Bloque 4: Concurrencia, Distribución y Redes de Petri (Semanas 10-12)

*   **Semana 10: Motores Distribuidos y Paso de Mensajes**
    *   *Teoría:* El paso de una arquitectura centralizada (Orquestada) a una descentralizada (Coreografiada). Transmisión del producto entre recursos independientes mediante handshake síncrono (\(!a\) y \(?a\)) de sus motores locales.
    *   *Práctica:* Sincronización e intercambio del token de producto entre recursos comunicantes.
*   **Semana 11: Paralelismo y Cooperación con Redes de Petri**
    *   *Teoría:* Limitaciones de autómatas comunicantes simples. Fundamentos de Redes de Petri: Lugares, Transiciones, Arcos y Fichas (Tokens). Modelado de exclusión mutua de recursos compartidos.
    *   *Práctica:* Representación gráfica de flujos concurrentes y cuellos de botella en Redes de Petri.
*   **Semana 12: Hito del Proyecto - Orquestador Concurrente / Red de Motores**
    *   *Hito de Laboratorio (Entregable 3):* Implementar en el proyecto una red de múltiples recursos independientes (cada uno con su propia instancia de motor local) que cooperan pasándose el producto.

---

### Bloque 5: Control Supervisor y Proyecto Final (Semanas 13-14)

*   **Semana 13: Control Supervisor Descentralizado (SCT)**
    *   *Teoría:* Eventos Controlables (\(\Sigma_c\)) vs. Incontrolables (\(\Sigma_{uc}\)). Composición síncrona Planta || Supervisor. El reto del control en arquitecturas distribuidas: prevención de bloqueos mutuos (deadlock-free).
    *   *Práctica:* Diseñar un supervisor lógico para coordinar el acceso a recursos compartidos en una topología distribuida.
*   **Semana 14: Entrega Final del Proyecto - El Supervisor Distribuido**
    *   *Hito de Laboratorio (Entrega Final):* Integrar el Módulo Supervisor en la red de motores de los recursos. El supervisor debe monitorear y restringir los eventos controlables de la red de recursos para prevenir bloqueos y guiar los tokens del producto con seguridad hacia el estado marcado de éxito.
