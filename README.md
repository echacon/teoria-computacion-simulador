# Plataforma Educativa de Teoría de la Computación, Autómatas y Sistemas de Eventos Discretos (DES)

Esta plataforma interactiva y compendio didáctico están diseñados para el curso universitario de **Teoría de la Computación, Autómatas y Lenguajes Formales**. Permite a los estudiantes explorar de forma visual e intuitiva la transición desde la computación combinatoria hasta la concurrencia, el paso de mensajes y el **Control Supervisor de Workflows de Negocio y Producción**.

---

## 🌟 Características de la Plataforma Interactiva

El simulador web (SPA) está estructurado en 4 módulos progresivos:

1. **01. Combinatorio & Decisiones:** Simulación de funciones estáticas sin estado (\(y = x \cdot b\)) y lógica condicional si-entonces.
2. **02. Autómatas Finitos (DFA):** Procesamiento de cadenas binarias paso a paso sobre un grafo de estados interactivo.
3. **03. Autómatas de Pila (PDA):** Representación del reconocimiento de lenguajes libres de contexto con visualización animada de una **Pila física (LIFO)**.
4. **04. Procesos Cooperantes (Concurrencia & Workflows):** Simulación de paso de mensajes síncronos entre procesos.
5. **Lab. Recurso Único (DFA):** Simulador interactivo del ciclo operacional de una Estación de Pintura, que lanza errores de transiciones y permite descargar la especificación YAML.

---

## 🛠️ Prácticas de Código de Laboratorio (Consola)

El repositorio incluye una plantilla en Python para que los estudiantes comiencen a programar su propio motor de transiciones local de recurso único (Hito 1):

*   **[recurso.py](./recurso.py):** Código base de la clase `DFA` en Python que carga una especificación YAML y procesa eventos de forma interactiva en consola.
*   **[recurso.yaml](./recurso.yaml):** Archivo de ontología que modela el proceso de la Estación de Pintura.

Para ejecutar la simulación de consola local:
1. Asegúrate de tener Python 3 y `pyyaml` instalados (`pip install pyyaml`).
2. Abre tu terminal en esta carpeta y ejecuta:
   ```bash
   python recurso.py
   ```
3. Introduce los eventos por consola (ej: `cargar`, `iniciar`, `fin`) para ver evolucionar el estado del autómata en tiempo real.

---

## 📚 Documentación del Curso

El repositorio incluye el material teórico y curricular desarrollado para el semestre de 14 semanas:

* 📄 **[SYLLABUS_14_WEEKS.md](./SYLLABUS_14_WEEKS.md):** Plan semestral semana a semana, detallando las clases teóricas y los 4 hitos prácticos del proyecto integrador (Construcción del Motor de Transiciones y el Supervisor Automático).
* 📖 **[THEORY_GUIDE.md](./THEORY_GUIDE.md):** Compendio de teoría del curso, desde gramáticas formales y BNF hasta Sistemas de Eventos Discretos (DES), Lenguajes Marcados ($L_m$) y la Teoría de Control Supervisor de Ramadge-Wonham.
* 📋 **[YAML_SPECIFICATION.md](./YAML_SPECIFICATION.md):** Guía de sintaxis y ontología estructurada en YAML para modelar Procesos, Recursos y Productos de forma jerárquica.

---

*Desarrollado con pasión para brindar educación universitaria abierta de alta calidad.*
