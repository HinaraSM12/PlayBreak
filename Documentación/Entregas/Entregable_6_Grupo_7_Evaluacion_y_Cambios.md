# Entregable 6: Evaluación del Prototipo PlayBreak y Plan de Cambios para la Implementación

**Universidad Nacional de Colombia — Facultad de Minas — Sede Medellín**  
**Departamento de Ciencias de la Computación y de la Decisión**  
**Interacción Humano-Computador (IHC)**  
**Grupo #7:**
- Edgar Fernando Vega Morales
- Hinara Pastora Sanchez Mata
- Jacobo Zapata Rojas
- Vincent David Restrepo Tangarife

---

## 1. Resumen Ejecutivo

El presente informe consolida la evaluación de usabilidad aplicada al prototipo interactivo de **PlayBreak**, una solución concebida para mitigar la fatiga virtual y el aislamiento interpersonal en equipos de teletrabajo y estudio híbrido. La evaluación se realizó mediante el cuestionario estandarizado **System Usability Scale (SUS, Brooke, 1986)**, complementado con preguntas cualitativas abiertas y observación moderada bajo el protocolo *Think-Aloud* sobre una muestra de 5 participantes representativos.

### Indicadores Cuantitativos Principales:
- **Puntaje SUS Promedio**: **77,5 / 100** (Grado B+, Usabilidad Aceptable / Buena según Bangor et al., 2008).
- **Puntaje SUS Mediana**: **92,5 / 100** (Grado A+, Rango de Excelencia).
- **Desviación Estándar**: **26,6** (Distribución bimodal con 4 usuarios altos [70,0 - 97,5] y un caso crítico de [32,5]).
- **Ítem con Mayor Calificación**: **Ítem 9 (Sensación de Seguridad)** con **4,8 / 5,0** (3,80 / 4,00 ajustado). Valida el principio central de diseño: *«Aquí nada es obligatorio ni evaluado»*.
- **Ítem con Mayor Fricción**: **Ítem 4 (Necesidad de Ayuda Técnica)** con **2,2 / 5,0** (2,80 / 4,00 ajustado), reflejando fricción en el primer contacto.

> **Diagnóstico Raíz**: El problema principal detectado no fue de complejidad en las mecánicas centrales (dibujar o encadenar palabras), sino de **claridad en el estado inicial**. La presencia de jugadores hardcodeados en el prototipo v1 (Sara, Tomás y Lucía) generó desconcierto en el usuario novato (Participante 2), haciéndole creer que la aplicación estaba bloqueada o requería interacción previa.
>
> **Decisión de Rediseño**: La versión v3 y su evolución funcional de producción v3.5 eliminan todos los datos precargados forzados. La sala inicia limpia con la presencia exclusiva del usuario (`Tú`), añade un toggle transparente para simular compañeros opcionales para pruebas individuales, incorpora un temporizador configurable (60s, 30s, libre), modos de dibujo (palabra secreta con pistas vs. dibujo libre), un marcador de aciertos, un minijuego de trivia rápida y salida libre sin culpas (*ghosting amigable*).

---

## 2. Marco Metodológico de la Evaluación con Usuarios

Siguiendo las directrices pedagógicas de la asignatura (diapositivas *«Reclutar usuarios y conducir las pruebas»* y *«Analizar los resultados»*):

### 2.1 Tamaño de Muestra y Representatividad (n = 5)
Conforme a Nielsen y Landauer (1993) y las recomendaciones del Nielsen Norman Group, una muestra de 5 evaluadores permite descubrir entre el 80% y 85% de los problemas cualitativos de usabilidad sin incurrir en costos redundantes. Los participantes fueron seleccionados por su afinidad con la persona arquetípica del proyecto: **Juliana Ospina** (profesional remota o híbrida con menos de un año en su equipo).

### 2.2 Protocolo de Pensamiento en Voz Alta (*Think-Aloud Protocol*)
- **Fijación de Expectativas**: Antes de iniciar, se aclaró a los evaluadores que se evaluaba la interfaz y no sus capacidades personales, garantizando que expresaran dudas sin temor.
- **Rol del Evaluador**: Observación pasiva sin intervención ante tropiezos o dudas momentáneas, permitiendo registrar la conducta orgánica del usuario en un entorno realista.
- **Cierre y Reflexión**: Recolección de impresiones globales y aplicación inmediata del cuestionario estandarizado.

### 2.3 Tareas Evaluadas
1. **Flujo Sincrónico (Jugar en Vivo)**: Acceder a la sala, ingresar a la *Mesa de Dibujo*, realizar trazos interactivos, experimentar el modo adivinanza y finalizar la ronda para pasar al *Momento Post-Partida* («La Cafetería / ¿Se quedan 2 minutos más?»).
2. **Flujo Asincrónico (Jugada por Turnos)**: Ingresar al *Rincón de Palabras*, comprender la regla de la última letra, redactar y publicar un aporte independiente.

---

## 3. Resultados Cuantitativos del Instrumento SUS

### 3.1 Respuestas Individuales y Puntuación por Participante
La transformación estándar aplica: $(X_i - 1)$ para afirmaciones impares y $(5 - X_i)$ para afirmaciones pares. La sumatoria se multiplica por 2,5.

| Participante | Fecha / Hora | SUS (0-100) | Calificación Bangor | Resumen Cualitativo |
| :--- | :--- | :--- | :--- | :--- |
| **P1** | 08/10 20:20 | **95,0** | Excelente (A+) | Elogió la mesa de dibujo. Sugirió temporizador, modos de dibujo y marcador de victorias. |
| **P2** | 08/10 23:54 | **32,5** | Deficiente (F) | Jugadores precargados (Sara, Tomás, Lucía) generaron confusión. Exigió empezar de cero. |
| **P3** | 09/10 16:09 | **70,0** | Aceptable (B) | Sin comentario; marcó posición neutral en soporte técnico y aprendizaje requerido. |
| **P4** | 11/10 13:44 | **97,5** | Excelente (A+) | Sin comentario; puntajes casi perfectos en integración, facilidad y seguridad. |
| **P5** | 12/10 16:42 | **92,5** | Excelente (A+) | Calificó la idea como hermosa; solicitó expandir cosmética, funciones y más minijuegos. |
| **Consolidado** | **Media: 77,5** | **Mediana: 92,5** | **Desv. Típica: 26,6** | **Comportamiento Bimodal: 4 casos altos (>70) vs. 1 caso crítico (32,5).** |

> **Análisis de Dispersión**: Si se excluyera al Participante 2 como dato anómalo, la media subiría a 88,75. Sin embargo, no se descartó: su baja puntuación fundamentó un error de onboarding real en el diseño del prototipo v1.

### 3.2 Análisis Ítem por Ítem en Escala Normalizada (0 a 4)

| # | Afirmación SUS | Prom. Original (1-5) | Prom. Ajustado (0-4) | Sin P2 (Ajustado) | Diagnóstico UX |
| :-: | :--- | :-: | :-: | :-: | :--- |
| **1** | Me gustaría usar este sistema con frecuencia | 4,0 | **3,00** | 3,50 | Buena receptividad hacia pausas regulares. |
| **2** | El sistema es innecesariamente complejo | 2,0 | **3,00** | 3,50 | Percepción baja de sobrecarga cognitiva. |
| **3** | El sistema fue fácil de usar | 4,0 | **3,00** | 3,75 | Alta facilidad en tareas centrales. |
| **4** | Necesitaría ayuda técnica para usarlo | 2,2 | **2,80** | 3,00 | **Punto más débil**: incertidumbre en primer contacto. |
| **5** | Las funciones están bien integradas | 4,2 | **3,20** | 3,50 | Coherencia entre pantallas y transiciones. |
| **6** | El sistema presenta demasiada inconsistencia | 2,0 | **3,00** | 3,50 | Reconocimiento de consistencia gráfica. |
| **7** | La mayoría aprendería a usarlo muy rápidamente | 4,0 | **3,00** | 3,75 | Curva de aprendizaje inmediata. |
| **8** | El sistema es engorroso de usar | 2,0 | **3,00** | 3,75 | Interacción directa sin pasos burocráticos. |
| **9** | Me sentí muy seguro usando el sistema | 4,8 | **3,80** | 3,75 | **Calificación máxima**: el diseño sin presión funciona. |
| **10** | Necesité aprender muchas cosas antes | 1,8 | **3,20** | 3,50 | Entrada intuitiva para el usuario. |

- **Subescala de Usabilidad (Lewis & Sauro, 2009)**: **78,1 / 100**
- **Subescala de Facilidad de Aprendizaje (*Learnability*)**: **75,0 / 100**

---

## 4. Análisis Cualitativo y Gráfico Semáforo (*Stoplight Chart*)

Siguiendo las diapositivas 100-110 de clase, se estructuró el Gráfico Semáforo:
- 🟢 **Verde**: Desempeño óptimo y satisfacción.
- 🟡 **Amarillo**: Duda menor o fricción superada de forma autónoma.
- 🔴 **Rojo**: Bloqueo o confusión severa.

| Componente / Aspecto Evaluado | P1 | P2 | P3 | P4 | P5 | Síntesis del Hallazgo |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **1. Estado Inicial & Onboarding** | 🟢 | 🔴 | 🟡 | 🟢 | 🟢 | P2 confundido por avatares fijos; P3 con dudas iniciales. |
| **2. Mesa de Dibujo (Lienzo & Dinámica)** | 🟢 | 🟡 | 🟢 | 🟢 | 🟢 | Excelente acogida; P1 solicitó tiempo y modos. |
| **3. Rincón de Palabras (Asíncrono)** | 🟢 | 🟡 | 🟢 | 🟢 | 🟢 | Dinámica clara; P2 dudó ante falta de partida limpia. |
| **4. Momento Post-Partida & Salida** | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | Aprobación total de la salida sin notificaciones de culpa. |
| **5. Tu Rincón (Perfil & Avatar)** | 🟢 | 🟢 | 🟡 | 🟢 | 🟢 | Intuitivo; P5 solicitó expandir personalización. |
| **6. Percepción de No-Obligatoriedad** | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | Validación total: seguridad evaluada en 4,8 / 5,0. |

### Citas Destacadas (*Pull Quotes*)
> *«El problema principal es que los jugadores hardcodeados (sara, tomas, lucia) hace confusa la experiencia, me gustaría empezar una partida de cero para poder entender el juego.»*  
> — **Participante 2 (SUS: 32,5)**

> *«La mesa de dibujo me pareció muy chévere. Aunque sería genial que hubiera como un temporizador para que solo pudiera dibujar por un tiempo límite. También sería chévere que hubieran tipos de dibujo es decir que hubiera dibujo libre y otro fuera el recomendado por el juego para que los demás adivinen y que el juego permitiera identificar cuántas partidas ha ganado cada uno. En general la aplicación me parece muy intuitiva, chévere y de fácil uso.»*  
> — **Participante 1 (SUS: 95,0)**

> *«Para la propuesta el componente estético y funcional es muy importante por lo cual expandiría el sistema cosméticamente, funcionalmente y agregaría más minijuegos y formas de compartir espacios juntos pero la idea base es muy linda.»*  
> — **Participante 5 (SUS: 92,5)**

---

## 5. Lectura Crítica de Hallazgos y Clasificación de Evidencia

1. **Evidencia Fuerte**:
   - **El onboarding era el único obstáculo real**: El 32,5 de P2 no provino de incapacidad para usar el lienzo, sino de no saber qué era real y qué era fingido al iniciar.
   - **El principio de no-obligatoriedad es un éxito comprobado**: Calificación récord en seguridad (3,80/4,00). Nadie se sintió presionado.
2. **Evidencia Media**:
   - **Peticiones de mayor interactividad en el dibujo**: Temporizador, modo libre vs adivinar y marcador tienen gran aceptación y bajo costo técnico.
3. **Hipótesis a Validar**:
   - **Tensión entre profundidad y minimalismo**: Equilibrar las peticiones de usuarios avanzados sin perjudicar a quienes buscan cero fricción.
   - **Impacto emocional a largo plazo**: Validar en entornos corporativos reales durante jornadas laborales continuas.

---

## 6. Historias de Usuario Priorizadas (Metodología MoSCoW)

| ID | Historia de Usuario (Persona: Juliana) | Criterios de Aceptación (Formato Gherkin) | MoSCoW |
| :-: | :--- | :--- | :-: |
| **HU-1** | Como Juliana, quiero que la partida empiece de cero mostrando únicamente mi presencia (`Tú`), para entender qué pasa sin confundirme. | **Dado** que entro a la sala, **cuando** abro un rincón lúdico, **entonces** solo veo mi avatar y ningún bot impuesto. | **Must Have** |
| **HU-2** | Como Juliana, quiero entrar a un juego en un solo clic, para no requerir manuales ni ayuda técnica. | **Dado** que estoy en la sala, **cuando** toco un juego, **entonces** se abre de inmediato sin diálogos de configuración obligatorios. | **Must Have** |
| **HU-3** | Como Juliana, quiero dibujar en un lienzo reactivo real, para que el juego se sienta vivo y divertido. | **Dado** que estoy en la Mesa de Dibujo, **cuando** trazo con mouse o dedo, **entonces** el trazo responde con fluidez, color y opción de deshacer. | **Must Have** |
| **HU-4** | Como Juliana, quiero poner un tiempo límite opcional al dibujo, para controlar la duración de mi pausa activa. | **Dado** que estoy en la Mesa de Dibujo, **cuando** elijo un límite (60s, 30s o libre), **entonces** el cronómetro inicia al primer trazo. | **Should Have** |
| **HU-5** | Como Juliana, quiero elegir entre adivinar una palabra secreta o dibujo libre, para tener un tema del cual reír o garabatear libremente. | **Dado** que juego dibujo, **cuando** cambio el modo, **entonces** el sistema provee una palabra con pistas o habilita el lienzo en blanco. | **Should Have** |
| **HU-6** | Como Juliana, quiero que el Rincón de Palabras valide automáticamente la cadena asincrónica, para no depender de moderadores. | **Dado** que escribo una palabra, **cuando** la envío, **entonces** se valida que comience con la última letra de la anterior y se guarda. | **Must Have** |
| **HU-7** | Como Juliana, quiero poder salir sin avisar en cualquier momento, para no sentir culpa ni compromiso social forzado. | **Dado** que deseo retirarme, **cuando** toco «Salir sin avisar», **entonces** regreso a la sala con un mensaje de privacidad confirmada. | **Must Have** |
| **HU-8** | Como Juliana, quiero ver un marcador de partidas ganadas durante la sesión, para tener un estímulo amistoso con mi equipo. | **Dado** que se adivina la palabra en el chat, **cuando** hay acierto, **entonces** se lanza confeti y se suman 10 puntos en el marcador. | **Could Have** |
| **HU-9** | Como Juliana, quiero disponer de minijuegos adicionales rápidos como Trivia Relámpago y personalizar mi avatar, para tener variedad. | **Dado** que estoy en la sala, **cuando** elijo «Trivia Relámpago», **entonces** juego 3 preguntas de 45 segundos sobre hábitos y gustos. | **Could Have** |

---

## 7. Matriz de Cambios Implementados (v1 vs. v3 vs. v3.5 Producción)

| Componente | Prototipo v1 (Evaluado) | Prototipo v3 (Minimalista) | Versión v3.5 (Producción Final) | Justificación UX |
| :--- | :--- | :--- | :--- | :--- |
| **Jugadores iniciales** | Sara, Tomás y Lucía fijos en el código. | Inicia solo con `Tú`. Sala limpia. | Sala limpia por defecto + toggle transparente de simulación opcional. | R2 (SUS 32,5) |
| **Salas inactivas** | Trivia y Puzzle estáticos con mensaje «no disponible». | Eliminadas del mapa. | Trivia Relámpago habilitada como minijuego de 45s; Puzzle reservado. | Ítems 4 y 10 SUS |
| **Lienzo de dibujo** | Simulación visual estática. | Lienzo funcional con trazo y borrado. | Lienzo completo: 8 colores, 3 grosores, deshacer (undo) y descarga PNG. | R1 y Tarea 1 |
| **Temporizador** | Inexistente. | Selector 60s, 30s o sin límite. | Temporizador dinámico con aviso visual/auditivo bajo 10s. | R1 (Pull quote) |
| **Modos de dibujo** | Solo tema fijo. | Selector de tema y dibujo libre. | Modo palabra secreta con pistas vs. Modo dibujo libre. | R1 (Pull quote) |
| **Chat de adivinanzas** | No interactivo. | No contemplado. | Chat interactivo con detección de aciertos, confeti y bots simulados. | R1 y R5 |
| **Marcador de victorias**| Inexistente. | Omitido en v3. | Marcador en vivo por sesión que premia aciertos sin castigar. | R1 (Pull quote) |
| **Cadena de palabras** | 3 palabras precargadas. | Cadena vacía al iniciar. | Cadena asincrónica persistente en LocalStorage con marcas de tiempo. | R2 y HU-6 |
| **Rompehielos post-partida** | Texto fijo. | Pregunta aleatoria al pulsar «Seguir charlando». | Generador dinámico de preguntas rompehielos con botón de recarga. | R2 y Hallazgo 2 |
| **Salida silenciosa** | Botón presente sin feedback. | Botón con leyenda fija. | Salida silenciosa reforzada con toast: «Saliste en silencio. Cero presión». | Ítem 9 SUS (4,8) |
| **Personalización** | Formulario largo con lista de juegos. | Perfil recortado (avatar y modo). | Avatar reactivo, nube de intereses, modos de juego y estadísticas. | R5 y HU-9 |
| **Estética y accesibilidad**| Crema básico. | Minimalismo compacto. | Diseño responsivo (Desktop/Móvil), paleta 60-30-10, modo noche y Web Audio API. | R5 (Estética) |

---

## 8. Cumplimiento de las 10 Heurísticas de Usabilidad de Jakob Nielsen

1. **Visibilidad del estado del sistema**: Cronómetro con contador tabular y pulso visual; indicador de presencia en sala; feedback sonoro suave opcional; notificaciones toast no invasivas.
2. **Coincidencia entre el sistema y el mundo real**: Metáforas cotidianas de descanso («Sala de Descanso», «Mesa de Dibujo», «La Cafetería», «Pausa de café»), sin lenguaje técnico intimidante.
3. **Control y libertad del usuario**: Botones de deshacer trazo, limpiar lienzo, jugar sin límite de tiempo y salida libre sin avisar (*ghosting amigable*).
4. **Consistencia y estándares**: Regla de color 60-30-10, botones con jerarquía táctil estándar, iconos universales y retícula base-8 en espaciados.
5. **Prevención de errores**: Validación de la letra inicial en palabras antes del envío; normalización de mayúsculas y acentos en adivinanzas.
6. **Reconocimiento antes que recuerdo**: Pistas de palabras, última letra encadenada y avatares participantes siempre visibles en el campo visual.
7. **Flexibilidad y eficiencia de uso**: Coexistencia de canales sincrónicos (en vivo) y asincrónicos (por turnos); atajos de teclado y soporte táctil para móviles y stylus.
8. **Diseño estético y minimalista**: Eliminación de ruido visual y elementos ficticios; tipografías Google Fonts de alta legibilidad (Fredoka y Nunito); espacio negativo armónico.
9. **Ayuda a reconocer y recuperarse de errores**: Mensajes amables que indican exactamente la regla violada sin culpabilizar al usuario.
10. **Ayuda y documentación**: Recordatorios de bajo perfil («Aquí nada es obligatorio»), subtítulos explicativos y modal para invitar colegas mediante enlace.

---

## 9. Especificación Técnica y Arquitectura del Repositorio

### 9.1 Estructura de Archivos para GitHub Pages
El proyecto fue organizado para ser publicado instantáneamente mediante GitHub Pages desde la raíz de la rama `main`:
```
├── index.html                                        <- Punto de entrada de la aplicación web
├── css/
│   └── style.css                                     <- Sistema de diseño, variables 60-30-10, responsive y modo noche
├── js/
│   ├── sound.js                                      <- Sintetizador de audio con Web Audio API
│   └── app.js                                        <- Lógica interactiva, canvas, turnos, trivia y estado
├── assets/                                           <- Recursos visuales y capturas
├── Documentación/
│   ├── Cuestionario_Entregable_6_IHC_SUS (1).xlsx    <- Registro original de respuestas y cálculo SUS
│   ├── HCI_20250221_Probando_Tus_Diseños.pdf         <- Guía de evaluación de la asignatura
│   └── Entregas/
│       ├── Entregable 6 - Grupo 7 - Evaluacion y cambios.docx <- Documento formal Word enriquecido
│       └── Entregable_6_Grupo_7_Evaluacion_y_Cambios.md       <- Versión Markdown completa
├── README.md                                         <- Documentación completa del repositorio
└── .gitignore                                        <- Configuración de exclusiones de Git
```

---

## 10. Conclusiones y Próximos Pasos

1. **Validación del Enfoque Lúdico No Obligatorio**: Con una mediana de usabilidad de **92,5** y un puntaje de seguridad de **4,8 / 5,0**, PlayBreak demostró que los descansos lúdicos voluntarios son percibidos como un entorno seguro y agradable para mitigar la fatiga laboral.
2. **Corrección Integral del Onboarding**: El rediseño hacia una partida limpia y la transparencia de las funciones eliminó de raíz la causa del valor atípico de 32,5 puntos, garantizando una curva de aprendizaje instantánea.
3. **Entrega Lista para Producción**: La aplicación web funcional cumple a cabalidad con los estándares de la materia y está disponible para despliegue público en GitHub Pages.

---

## 11. Referencias Bibliográficas

- **Bangor, A., Kortum, P. T., & Miller, J. T.** (2008). *An empirical evaluation of the system usability scale*. International Journal of Human-Computer Interaction, 24(6), 574-594.
- **Brooke, J.** (1986). *SUS: A 'quick and dirty' usability scale*. In Usability Evaluation in Industry (pp. 189-194). London: Taylor & Francis.
- **Lewis, J. R., & Sauro, J.** (2009). *The factor structure of the system usability scale*. In International Conference on Human Centered Design (pp. 94-103). Springer.
- **Nielsen, J.** (1994). *Enhancing the explanatory power of usability heuristics*. In Proceedings of the SIGCHI Conference on Human Factors in Computing Systems (pp. 152-158). ACM.
- **Nielsen, J., & Landauer, T. K.** (1993). *A mathematical model of the finding of usability problems*. In Proceedings of the INTERACT'93 and CHI'93 Conference (pp. 206-213). ACM.
- **Sauro, J.** (2011). *A Practical Guide to the System Usability Scale: Background, Benchmarks & Best Practices*. Measuring Usability LLC.
