# ☕ PlayBreak · Sala de Descanso y Rompehielos Lúdico para Equipos Remotos

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live%20Demo-success?logo=github&style=flat-square)](https://hinarasm12.github.io/PlayBreak/)
[![HCI UNAL](https://img.shields.io/badge/UNAL-Facultad%20de%20Minas-003865?style=flat-square)](https://minas.medellin.unal.edu.co/)
[![Usability SUS](https://img.shields.io/badge/SUS%20Score-77.5%20(Mediana%2092.5)-brightgreen?style=flat-square)](#-evaluación-de-usabilidad-entregable-6)
[![WebRTC Multiplayer](https://img.shields.io/badge/Multiplayer-P2P%20WebRTC%20(PeerJS)-blue?style=flat-square)](#-multijugador-real-en-línea-webrtc)
[![Pure Vanilla](https://img.shields.io/badge/Stack-HTML5%20%7C%20CSS3%20%7C%20ES6-orange?style=flat-square)](#-tecnologías-utilizadas)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

> **PlayBreak** es una aplicación web interactiva de bienestar laboral diseñada para mitigar la fatiga virtual y el aislamiento interpersonal en equipos de teletrabajo y estudio híbrido. Ofrece micro-pausas voluntarias de 5 minutos mediante **4 actividades lúdicas**, combinando dinámicas sincrónicas en vivo, asincrónicas por turnos, multijugador real P2P y simulación activa, bajo una premisa innegociable: **«Aquí nada es obligatorio ni evaluado»**.

---

## 🚀 Enlace en Vivo en GitHub Pages

👉 **[https://hinarasm12.github.io/PlayBreak/](https://hinarasm12.github.io/PlayBreak/)**

---

## 🎯 Problema que Resuelve y Filosofía de Diseño

En las fases de investigación (Entregables 1, 2 y 3), se detectó que el **87,6% de los profesionales remotos interactúa informalmente con muy baja frecuencia**, siendo los recién llegados (menos de 3 meses en el equipo) los más vulnerables al aislamiento.

PlayBreak ataca directamente las dos barreras más críticas:
1. **La falta de temas de conversación naturales**: el juego y las dinámicas cumplen la función de rompehielos espontáneo.
2. **El rechazo a que la socialización se convierta en otra obligación laboral**: no hay penalizaciones, no hay métricas de asistencia obligatoria y se cuenta con una acción expresa de **«Salir sin avisar (Ghosting amigable)»** sin notificaciones acusatorias.

---

## ✨ Las 4 Actividades Lúdicas de la Sala

### 1. 🎨 Mesa de Dibujo (Sincrónica / En Vivo + Multijugador Real WebRTC)
- **Lienzo Interactivo Universal**: Soporte fluido para mouse, stylus y pantallas táctiles móviles.
- **Multijugador Real P2P en Línea**: Crea una sala y comparte el código o enlace directo para que otro compañero dibuje o adivine en tiempo real desde su propio computador o celular mediante WebRTC (PeerJS).
- **Adivinanza Activa en Tiempo Real**: Cuando estás dibujando, los compañeros virtuales (Sara, Tomás, Lucía) van intentando adivinar activamente en el chat cada pocos segundos hasta acertar y desatar lluvia de confeti.
- **Modos de Juego**:
  - *Modo Adivinar con Palabra Secreta*: Banco de palabras con pistas temáticas.
  - *Modo Dibujo Libre*: Espacio creativo libre de reglas para garabatear sin presión.
- **Temporizador Configurable**: Pausas acotadas de 60s, 30s o modo libre sin límite. Aviso sonoro y cambio de color bajo 10 segundos.
- **Herramientas de Trazado**: 8 colores cálidos, 3 grosores de pincel, borrador blanco, botón **Deshacer (Undo)** y opción para **Descargar tu dibujo en PNG**.
- **Marcador de Sesión**: Registra aciertos y victorias para incentivar el juego amistoso.

### 2. 🔤 Rincón de Palabras (Asincrónica / Por Turnos)
- **Cadena de Palabras Colectiva**: Participa sin coincidir en horario con nadie.
- **Regla del Encadenamiento**: Cada nueva palabra debe comenzar con la última letra de la anterior.
- **Persistencia en LocalStorage & Sincronización**: Tu progreso se conserva entre sesiones.
- **Botón de Demostración**: Permite simular al instante el turno de un compañero para enseñar la dinámica.

### 3. ⚡ Trivia Relámpago (Rompehielos Rápido)
- **Pausa de 45 Segundos**: 3 preguntas ligeras sobre gustos de café, hábitos de trabajo remoto y desconexión.
- **Descubrimiento de Afinidades**: Muestra curiosidades e intereses compartidos para generar temas de conversación naturales sin reuniones forzadas.

### 4. 💬 El Pasillo · Café Virtual (Charla Informal de Baja Fricción)
- **Encuentro Espontáneo sin Agenda**: Simula la charla casual junto a la cafetera en una oficina presencial.
- **Tema del Día**: Preguntas para charlar sobre música, anécdotas o hábitos de trabajo.
- **Muro de Notas y Reacciones**: Deja notas cortas y reacciona a los comentarios de tus compañeros con emojis de café ☕, galleta 🍪 o aplausos 👏.

---

## ☕ Cafetería Post-Partida & Tu Rincón

- **Momento Post-Partida («La Cafetería»)**:
  - Vista acogedora de los avatares que participaron.
  - Generador dinámico de preguntas rompehielos con recarga aleatoria.
  - Acción destacada de **«Salir sin avisar»** con feedback tranquilizador: *«Saliste en silencio, nadie recibió notificación. ¡Cero presión!»*.
- **Tu Rincón (Perfil y Bienestar)**:
  - Personalización de Avatar con colores cálidos y expresión facial.
  - Selección de intereses personales (Cine, Música, Senderismo, Café, Mascotas, Videojuegos).
  - Estilo de comunicación preferido (Con voz, Solo texto o Solo por turnos).
  - Contador acumulativo de pausas tomadas.

---

## 🌐 Multijugador Real en Línea (WebRTC P2P)

La aplicación integra la biblioteca **PeerJS** para permitir multijugador real entre dos navegadores por internet:
1. Un jugador hace clic en **«🌐 Crear Sala Online P2P»**.
2. Se genera un código de 4 dígitos (ej: `SALA-4821`) y un enlace directo.
3. El segundo jugador hace clic en **«Unirse con Código»** (o abre el enlace).
4. La conexión WebRTC P2P se establece de forma directa:
   - Los trazos del lienzo se sincronizan en tiempo real.
   - Las adivinanzas del chat llegan al instante.
   - Ambos comparten la celebración de victoria con confeti.
5. Si no hay conexión o se juega solo, el sistema utiliza el **Modo de Simulación Activa** con Sara, Tomás y Lucía.

---

## 📊 Evaluación de Usabilidad (Entregable 6)

La aplicación fue evaluada mediante el cuestionario estandarizado **System Usability Scale (SUS)** con 5 participantes bajo el protocolo *Think-Aloud*:

| Métrica Cuantitativa | Resultado Obtenido | Interpretación Metodológica |
| :--- | :---: | :--- |
| **Promedio SUS** | **77,5 / 100** | Grado B+ (Usabilidad Aceptable / Buena) |
| **Mediana SUS** | **92,5 / 100** | Grado A+ (Rango de Excelencia) |
| **Ítem 9 (Seguridad y Confianza)** | **4,8 / 5,0** | Validación del principio «nada es obligatorio» |
| **Ítem 4 (Ayuda Técnica requerida)**| **2,2 / 5,0** | Fricción identificada en el estado inicial v1 |

> 📄 **Documentación Completa del Entregable 6**:
> - Archivo Word Formal: [`Entregable 6 - Grupo 7 - Evaluacion y cambios.docx`](Documentación/Entregas/Entregable%206%20-%20Grupo%207%20-%20Evaluacion%20y%20cambios.docx)
> - Archivo Markdown Detallado: [`Entregable_6_Grupo_7_Evaluacion_y_Cambios.md`](Documentación/Entregas/Entregable_6_Grupo_7_Evaluacion_y_Cambios.md)

---

## 🛠️ Tecnologías Utilizadas

- **HTML5 Semántico**: `<nav>`, `<main>`, `<section>`, `<article>`, diálogos nativos `<dialog>` con backdrop blur.
- **CSS3 Vanilla Moderno**: Variables CSS (tokens), CSS Grid, Flexbox, sombras táctiles, modo oscuro y `prefers-reduced-motion`.
- **JavaScript ES6+**: Arquitectura reactiva por eventos sin dependencias de frameworks.
- **WebRTC & PeerJS**: Conexión P2P directa entre navegadores sin costo de servidores backend.
- **HTML5 Canvas API**: Motor de dibujo vectorial interactivo y partículas de confeti.
- **Web Audio API**: Sintetizador procedural de tonos relajantes.
- **Web Storage API (`localStorage`)**: Persistencia local de preferencias, notas y estadísticas.

---

## 👥 Equipo de Trabajo — Grupo #7

**Universidad Nacional de Colombia — Sede Medellín**  
**Facultad de Minas**  
**Asignatura**: Interacción Humano-Computador (IHC)  

- **Edgar Fernando Vega Morales**
- **Hinara Pastora Sanchez Mata**
- **Jacobo Zapata Rojas**
- **Vincent David Restrepo Tangarife**

---

## 📄 Licencia

Este proyecto se distribuye bajo la licencia **MIT**. Consulta el archivo `LICENSE` para más información.
