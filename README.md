# ☕ PlayBreak · Sala de Descanso y Rompehielos Lúdico para Equipos Remotos

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live%20Demo-success?logo=github&style=flat-square)](https://hinara.github.io/PlayBreak/)
[![HCI UNAL](https://img.shields.io/badge/UNAL-Facultad%20de%20Minas-003865?style=flat-square)](https://minas.medellin.unal.edu.co/)
[![Usability SUS](https://img.shields.io/badge/SUS%20Score-77.5%20(Mediana%2092.5)-brightgreen?style=flat-square)](#-evaluación-de-usabilidad-entregable-6)
[![Pure Vanilla](https://img.shields.io/badge/Stack-HTML5%20%7C%20CSS3%20%7C%20ES6-orange?style=flat-square)](#-tecnologías-utilizadas)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

> **PlayBreak** es una aplicación web interactiva de bienestar laboral diseñada para mitigar la fatiga virtual y el aislamiento interpersonal en equipos de teletrabajo y estudio híbrido. Ofrece micro-pausas voluntarias de 5 minutos, combinando dinámicas sincrónicas en vivo y asincrónicas por turnos, bajo una premisa innegociable: **«Aquí nada es obligatorio ni evaluado»**.

---

## 🚀 Despliegue en Vivo en GitHub Pages

La aplicación está lista para ejecutarse directamente en cualquier navegador moderno sin requerir servidores ni dependencias de backend:

1. **URL de Producción (GitHub Pages)**:  
   👉 **`https://<tu-usuario>.github.io/<tu-repo>/`** (o `index.html` en la raíz).
2. **Cómo activarlo en tu repositorio de GitHub**:
   - Ve a la pestaña **Settings** de tu repositorio.
   - En el menú lateral izquierdo, haz clic en **Pages**.
   - Bajo **Build and deployment > Source**, selecciona **Deploy from a branch**.
   - En **Branch**, selecciona **`main`** y la carpeta **`/(root)`**, luego pulsa **Save**.
   - En 1-2 minutos tu enlace público estará disponible automáticamente.

---

## 🎯 Problema que Resuelve y Filosofía de Diseño

En las fases de investigación (Entregables 1, 2 y 3), se detectó que el **87,6% de los profesionales remotos interactúa informalmente con muy baja frecuencia**, siendo los recién llegados (menos de 3 meses en el equipo) los más vulnerables al aislamiento.

PlayBreak ataca directamente las dos barreras más críticas:
1. **La falta de temas de conversación naturales**: el juego cumple la función de rompehielos espontáneo.
2. **El rechazo a que la socialización se convierta en otra obligación laboral**: no hay penalizaciones, no hay métricas de asistencia obligatoria y se cuenta con una acción expresa de **«Salir sin avisar (Ghosting amigable)»** sin notificaciones acusatorias.

---

## ✨ Características Principales de la Aplicación

### 1. 🏠 La Sala de Descanso (The Hub)
- **Bienvenida transparente y limpia**: La sala inicia exclusivamente con tu presencia (`Tú`), resolviendo de raíz el problema de estado inicial identificado en las pruebas con usuarios.
- **Acceso en un solo paso**: Entra a cualquiera de los tres rincones lúdicos sin menús complicados ni aprendizaje previo.
- **Modo Demostración / Compañeros Virtuales**: Toggle claro y transparente para activar compañeros simulados de prueba (Sara, Tomás, Lucía) si estás probando la experiencia de forma individual.
- **Invitar compañeros**: Modal nativo para copiar el enlace de tu sala y compartirlo por Teams, Slack o WhatsApp.

### 2. 🎨 Mesa de Dibujo (Sincrónica / En Vivo)
- **Lienzo Interactivo Universal**: Soporte fluido para mouse, stylus y pantallas táctiles móviles.
- **Modos de Juego Flexibles**:
  - **Modo Adivinar con Palabra Secreta**: Banco de palabras con pistas temáticas para romper el hielo.
  - **Modo Dibujo Libre**: Espacio creativo libre de reglas para garabatear sin presión.
- **Temporizador Configurable**: Pausas acotadas de 60s, 30s o modo libre sin límite. Aviso sonoro y cambio de color cuando resta menos de 10 segundos.
- **Herramientas de Trazado**: 8 colores cálidos, 3 grosores de pincel, borrador blanco, botón **Deshacer (Undo)** y opción para **Descargar tu dibujo en PNG**.
- **Chat de Adivinanzas & Marcador**: Detección automática de aciertos con lluvia de confeti dinámico y marcador de victorias por sesión.

### 3. 🔤 Rincón de Palabras (Asincrónica / Por Turnos)
- **Cadena de Palabras Colectiva**: Participa sin coincidir en horario con nadie.
- **Regla del Encadenamiento**: Cada nueva palabra debe comenzar con la última letra de la anterior.
- **Persistencia en LocalStorage**: Tu progreso y las jugadas del equipo se conservan entre sesiones.
- **Marcas de Tiempo Relativas**: Visualiza quién aportó cada palabra y hace cuánto tiempo.

### 4. ⚡ Trivia Relámpago (Minijuego Rápido)
- **Pausa de 45 Segundos**: 3 preguntas ligeras sobre gustos de café, hábitos de trabajo remoto y desconexión.
- **Descubrimiento de Afinidades**: Muestra curiosidades e intereses compartidos para generar temas de conversación naturales sin forzar reuniones.

### 5. ☕ Momento Post-Partida («La Cafetería / ¿Se quedan 2 minutos más?»)
- **Avatares Participantes**: Vista acogedora de los compañeros que compartieron la pausa.
- **Generador de Preguntas Rompehielos**: Disparadores de conversación divertidos y seguros con botón para recargar preguntas aleatorias.
- **Jerarquía de Acciones de Salida**:
  - *Seguir charlando* (Primaria)
  - *Jugar otra vez* (Secundaria)
  - *Salir sin avisar* (Terciaria con privacidad garantizada: «Saliste en silencio, nadie recibió notificación»).

### 6. 👤 Tu Rincón (Perfil y Bienestar)
- **Personalización de Avatar**: Selector de color de cuerpo y expresión facial sonriente.
- **Nube de Intereses Rompehielos**: Cine, Música, Senderismo, Café, Mascotas, Videojuegos, etc.
- **Preferencia de Interacción**: Con voz, Solo texto o Solo asíncrono.
- **Contador de Micro-Pausas**: Seguimiento acumulativo de pausas tomadas, palabras aportadas y rondas ganadas.

### 7. 🎨 Estética & Accesibilidad
- **Regla de Color 60-30-10**: Crema `#F5EFE3` (60%), Arena `#EBDDC2` / Salvia `#5F9E82` (30%), Café `#7A4E2D` (10%).
- **Tipografía Google Fonts**: *Fredoka* (amigable y redondeada para encabezados) y *Nunito* (alta legibilidad para cuerpo).
- **Modo Nocturno Acogedor («Café Nocturno»)**: Conmutable con 1 clic y persistido en `localStorage`.
- **Efectos de Audio Orgánicos (Web Audio API)**: Tonos sintetizados relajantes (pop, campana, click) con botón para silenciar.
- **Diseño Totalmente Responsivo**: Navegación lateral en escritorio y barra inferior accesible en dispositivos móviles.

---

## 📊 Evaluación de Usabilidad (Entregable 6)

La aplicación fue evaluada mediante el cuestionario estandarizado **System Usability Scale (SUS)** con 5 participantes bajo el protocolo *Think-Aloud*:

| Métrica Cuantitativa | Resultado Obtenido | Interpretación Metodológica |
| :--- | :---: | :--- |
| **Promedio SUS** | **77,5 / 100** | Grado B+ (Usabilidad Aceptable / Buena) |
| **Mediana SUS** | **92,5 / 100** | Grado A+ (Rango de Excelencia) |
| **Ítem 9 (Seguridad y Confianza)** | **4,8 / 5,0** | Validación del principio «nada es obligatorio» |
| **Ítem 4 (Ayuda Técnica requerida)**| **2,2 / 5,0** | Fricción identificada en el estado inicial v1 |

### Gráfico Semáforo (*Stoplight Chart*) & Hallazgo Central
El análisis cualitativo reveló que el puntaje bajo del Participante 2 (**32,5**) se debió a que los jugadores fijos precargados (Sara, Tomás y Lucía) confundieron el onboarding. Al removerlos y permitir empezar de cero con la presencia exclusiva del usuario, la fricción se eliminó por completo.

> 📄 **Documentación Completa del Entregable 6**:
> - Archivo Word Formal: [`Entregable 6 - Grupo 7 - Evaluacion y cambios.docx`](Documentación/Entregas/Entregable%206%20-%20Grupo%207%20-%20Evaluacion%20y%20cambios.docx)
> - Archivo Markdown Detallado: [`Entregable_6_Grupo_7_Evaluacion_y_Cambios.md`](Documentación/Entregas/Entregable_6_Grupo_7_Evaluacion_y_Cambios.md)

---

## 🛠️ Tecnologías Utilizadas

- **HTML5 Semántico**: `<nav>`, `<main>`, `<section>`, `<article>`, diálogos nativos `<dialog>` con backdrop blur.
- **CSS3 Vanilla Moderno**: Variables CSS (tokens), CSS Grid, Flexbox, microinteracciones táctiles, sombras con relieve, soporte para `prefers-reduced-motion`.
- **JavaScript ES6+**: Arquitectura modular orientada a estado reactivo sin frameworks externos ni dependencias pesadas.
- **HTML5 Canvas API**: Motor de dibujo vectorial interactivo con buffer de deshacer, exportación a PNG y confeti de celebración.
- **Web Audio API**: Sintetizador de tonos suaves sin archivos de audio externos para máxima portabilidad.
- **Web Storage API (`localStorage`)**: Persistencia local de perfil, preferencias, cadena de palabras y estadísticas.

---

## 📁 Estructura del Repositorio

```
PlayBreak/
├── index.html                                        # Aplicación web completa para GitHub Pages
├── css/
│   └── style.css                                     # Hoja de estilos con regla 60-30-10 y modo oscuro
├── js/
│   ├── sound.js                                      # Sintetizador de sonido con Web Audio API
│   └── app.js                                        # Controlador de vistas, canvas, lógica y estado
├── assets/                                           # Recursos estáticos
├── Documentación/
│   ├── Cuestionario_Entregable_6_IHC_SUS (1).xlsx    # Cuestionario y cálculo de métricas SUS original
│   ├── HCI_20250221_Probando_Tus_Diseños.pdf         # Guía pedagógica de pruebas con usuarios
│   └── Entregas/
│       ├── Entregable #1 - Grupo #7.pdf              # Fase de Empatía
│       ├── Entregable #2 - Grupo #7.pdf              # Fase de Definición
│       ├── Entregable_3_Grupo_7_Paso_Definir.docx    # Definición de la persona Juliana Ospina
│       ├── Entregable_4_y_5_grupo_7_prototipado.docx # Prototipos de baja, media y alta fidelidad
│       ├── Entregable 6 - Grupo 7 - Evaluacion y cambios.docx # Documento Word formal completo
│       └── Entregable_6_Grupo_7_Evaluacion_y_Cambios.md       # Documento Markdown completo
├── Entregable_6_Grupo_7_Evaluacion_y_Cambios.docx    # Copia de fácil acceso en raíz
├── Entregable_6_Grupo_7_Evaluacion_y_Cambios.md      # Copia Markdown en raíz
├── README.md                                         # Documentación general del repositorio
└── .gitignore                                        # Exclusiones de Git
```

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
