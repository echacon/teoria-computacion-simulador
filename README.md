# Plataforma Educativa de Teoría de la Computación, Autómatas y Sistemas de Eventos Discretos (DES)

Esta plataforma interactiva y compendio didáctico están diseñados para el curso universitario de **Teoría de la Computación, Autómatas y Lenguajes Formales**. Permite a los estudiantes explorar de forma visual e intuitiva la transición desde la computación combinatoria hasta la concurrencia, el paso de mensajes y el **Control Supervisor de Workflows de Negocio y Producción**.

---

## 🌟 Características de la Plataforma Interactiva

El simulador web (SPA) está estructurado en 4 módulos progresivos:

1. **01. Combinatorio & Decisiones:** Simulación de funciones estáticas sin estado (\(y = x \cdot b\)) y lógica condicional si-entonces.
2. **02. Autómatas Finitos (DFA):** Procesamiento de cadenas binarias paso a paso sobre un grafo de estados interactivo.
3. **03. Autómatas de Pila (PDA):** Representación del reconocimiento de lenguajes libres de contexto con visualización animada de una **Pila física (LIFO)**.
4. **04. Procesos Cooperantes (Concurrencia & Workflows):** Simulación de paso de mensajes síncronos entre procesos. Incluye un selector de **Skins (Pieles)**:
   * **Perspectiva de Negocios (ERP/BPMN):** Flujos de trabajo entre oficinas (Ventas, Finanzas, Despacho) y documentos.
   * **Perspectiva de Producción (MOM/MES):** Flujos de trabajo entre estaciones de planta (Alimentador, Horno CNC, Inspección) y piezas físicas.

---

## 🚀 Cómo Probar la Aplicación

### Opción A: Directamente en la Web (GitHub Pages)
Si este repositorio está desplegado en GitHub Pages, puedes probar la plataforma al instante accediendo a la URL pública proporcionada por tu profesor.

### Opción B: Ejecución Local
Si has clonado este repositorio en tu computadora:

1. Abre tu terminal en esta carpeta.
2. Ejecuta el servidor web local ultraligero de Node.js:
   ```bash
   node server.js
   ```
3. Abre en tu navegador la dirección:
   👉 **http://localhost:3000**

---

## 📚 Documentación del Curso

El repositorio incluye el material teórico y curricular desarrollado para el semestre de 14 semanas:

* 📄 **[SYLLABUS_14_WEEKS.md](./SYLLABUS_14_WEEKS.md):** Plan semestral semana a semana, detallando las clases teóricas y los 4 hitos prácticos del proyecto integrador (Construcción del Motor de Transiciones y el Supervisor Automático).
* 📖 **[THEORY_GUIDE.md](./THEORY_GUIDE.md):** Compendio de teoría del curso, desde gramáticas formales y BNF hasta Sistemas de Eventos Discretos (DES), Lenguajes Marcados ($L_m$) y la Teoría de Control Supervisor de Ramadge-Wonham.

---

*Desarrollado con pasión para brindar educación universitaria abierta de alta calidad.*
