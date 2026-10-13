# -*- coding: utf-8 -*-
"""
Generador del Entregable 6 Académico y Profesional
Universidad Nacional de Colombia - Facultad de Minas - Sede Medellín
Interacción Humano-Computador (IHC) - Grupo #7

Genera simultáneamente:
1. Documentación/Entregas/Entregable 6 - Grupo 7 - Evaluacion y cambios.docx
2. Entregable_6_Grupo_7_Evaluacion_y_Cambios.docx
3. Documentación/Entregas/Entregable_6_Grupo_7_Evaluacion_y_Cambios.md
4. Entregable_6_Grupo_7_Evaluacion_y_Cambios.md
"""

import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

def set_cell_background(cell, fill_hex):
    """Establece color de fondo de una celda en tabla docx."""
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    """Establece márgenes internos de una celda."""
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'''
        <w:tcMar {nsdecls("w")}>
            <w:top w:w="{top}" w:type="dxa"/>
            <w:bottom w:w="{bottom}" w:type="dxa"/>
            <w:left w:w="{left}" w:type="dxa"/>
            <w:right w:w="{right}" w:type="dxa"/>
        </w:tcMar>
    ''')
    tcPr.append(tcMar)

def create_document():
    doc = docx.Document()

    # Márgenes de 2.5 cm (1 pulgada)
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)

    # Colores corporativos del sistema de diseño (60-30-10)
    COLOR_PRIMARY = RGBColor(122, 78, 45)      # Café #7A4E2D
    COLOR_DARK = RGBColor(50, 38, 30)          # Madera #32261E
    COLOR_MUTED = RGBColor(124, 109, 96)       # Soft #7C6D60
    COLOR_SAGE = RGBColor(95, 158, 130)        # Salvia #5F9E82

    # --- PORTADA INSTITUCIONAL ---
    p_inst = doc.add_paragraph()
    p_inst.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_inst = p_inst.add_run("UNIVERSIDAD NACIONAL DE COLOMBIA\nFACULTAD DE MINAS - SEDE MEDELLÍN\nDEPARTAMENTO DE CIENCIAS DE LA COMPUTACIÓN Y DE LA DECISIÓN\nINTERACCIÓN HUMANO-COMPUTADOR (IHC)")
    r_inst.bold = True
    r_inst.font.size = Pt(11)
    r_inst.font.color.rgb = COLOR_MUTED

    p_space = doc.add_paragraph()
    p_space.paragraph_format.space_before = Pt(36)

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_title = p_title.add_run("ENTREGABLE 6:\nEVALUACIÓN DEL PROTOTIPO PLAYBREAK, DIAGRAMAS DE FLUJO DE TAREAS Y PLAN DE IMPLEMENTACIÓN")
    r_title.bold = True
    r_title.font.size = Pt(19)
    r_title.font.color.rgb = COLOR_PRIMARY

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_sub = p_sub.add_run("Evaluación de Usabilidad SUS, Diagnóstico de Severidad de Nielsen, Diagramas de Flujo y Hoja Resumen Ejecutiva de la Versión Final")
    r_sub.italic = True
    r_sub.font.size = Pt(11.5)
    r_sub.font.color.rgb = COLOR_DARK

    p_space2 = doc.add_paragraph()
    p_space2.paragraph_format.space_before = Pt(50)

    p_team = doc.add_paragraph()
    p_team.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_team_label = p_team.add_run("GRUPO #7\n")
    r_team_label.bold = True
    r_team_label.font.size = Pt(13)
    r_team_label.font.color.rgb = COLOR_PRIMARY

    r_members = p_team.add_run(
        "Edgar Fernando Vega Morales\n"
        "Hinara Pastora Sanchez Mata\n"
        "Jacobo Zapata Rojas\n"
        "Vincent David Restrepo Tangarife\n"
    )
    r_members.font.size = Pt(11.5)
    r_members.font.color.rgb = COLOR_DARK

    p_date = doc.add_paragraph()
    p_date.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_date.paragraph_format.space_before = Pt(36)
    r_date = p_date.add_run("Semestre Académico 2025-1 / Febrero - Octubre 2026\nMedellín, Antioquia, Colombia")
    r_date.font.size = Pt(10)
    r_date.font.color.rgb = COLOR_MUTED

    doc.add_page_break()

    # --- HELPERS PARA FORMATO ---
    def add_h1(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(16)
        p.paragraph_format.space_after = Pt(5)
        r = p.add_run(text)
        r.bold = True
        r.font.size = Pt(14)
        r.font.color.rgb = COLOR_PRIMARY
        return p

    def add_h2(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(11)
        p.paragraph_format.space_after = Pt(3)
        r = p.add_run(text)
        r.bold = True
        r.font.size = Pt(12)
        r.font.color.rgb = COLOR_DARK
        return p

    def add_body(text, bold_prefix=None, italic=False):
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.line_spacing = 1.15
        if bold_prefix:
            rb = p.add_run(bold_prefix)
            rb.bold = True
            rb.font.size = Pt(10)
            rb.font.color.rgb = COLOR_DARK
        r = p.add_run(text)
        r.italic = italic
        r.font.size = Pt(10)
        r.font.color.rgb = COLOR_DARK
        return p

    def add_callout(text, title="NOTA DE DISEÑO"):
        table = doc.add_table(rows=1, cols=1)
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        cell = table.cell(0, 0)
        set_cell_background(cell, "F5EFE3")
        set_cell_margins(cell, top=100, bottom=100, left=150, right=150)
        cp = cell.paragraphs[0]
        cp.paragraph_format.space_after = Pt(2)
        r_title = cp.add_run(f"📌 {title}: ")
        r_title.bold = True
        r_title.font.size = Pt(9.5)
        r_title.font.color.rgb = COLOR_PRIMARY
        r_text = cp.add_run(text)
        r_text.font.size = Pt(9.5)
        r_text.font.color.rgb = COLOR_DARK
        doc.add_paragraph().paragraph_format.space_after = Pt(2)

    # ========================================================
    # SECCIÓN 1: HOJA RESUMEN EJECUTIVA (SLIDE 117-119 HCI)
    # ========================================================
    add_h1("1. Hoja Resumen Ejecutiva (Executive Summary Sheet)")
    add_body(
        "Siguiendo el estándar de síntesis de alto nivel enseñado en las diapositivas 117 a 119 de clase, "
        "se presenta la Hoja Resumen Ejecutiva que condensa la ronda de evaluación, sus métricas clave y las decisiones implementadas:"
    )

    t_exec = doc.add_table(rows=6, cols=2)
    t_exec.alignment = WD_TABLE_ALIGNMENT.CENTER
    exec_data = [
        ("Propósito y Alcance", "Evaluar la usabilidad y adopción de PlayBreak como plataforma de micro-pausas activas no invasivas para mitigar la fatiga virtual y el aislamiento en equipos remotos. Se evaluaron 4 flujos principales con 5 participantes."),
        ("Población y Muestra", "5 participantes (n=5) representativos de la persona arquetípica Juliana Ospina (profesionales de teletrabajo/híbrido). Prueba moderada con protocolo Think-Aloud y cuestionario estandarizado SUS."),
        ("Métricas SUS Consolidadas", "• Promedio SUS: 77,5 / 100 (Grado B+ / Aceptable - Buena según Bangor et al., 2008)\n• Mediana SUS: 92,5 / 100 (Grado A+ / Rango de Excelencia)\n• Sensación de Seguridad (Ítem 9): 4,8 / 5,0 (Máxima puntuación: valida cero presión social)\n• Fricción Inicial (Ítem 4): 2,2 / 5,0 (Punto débil corregido: desconcierto en onboarding)"),
        ("Gráfico Semáforo Consolidado", "🟢 Verde (Excelente): Mesa de Dibujo, Momento Post-Partida, Salida Silenciosa, Ausencia de Presión.\n🟡 Amarillo (Fricción Menor): Petición de temporizador, modos de juego y variedad lúdica.\n🔴 Rojo (Crítico en v1): Jugadores hardcodeados en código que confundieron al P2 (SUS: 32,5)."),
        ("Top 3 Hallazgos Críticos", "1. Onboarding confuso por bots ficticios fijos (Severidad 3: Mayor -> Resuelto con partida limpia de cero).\n2. Necesidad de control en dibujo (Severidad 2: Menor -> Resuelto con selector 60s/30s/libre y modos adivinar/libre).\n3. Deseo de mayor variedad e interacción (Severidad 1: Cosmético -> Resuelto con Trivia de 18 preguntas con medallas, El Pasillo y chat de voz WebRTC en Cafetería)."),
        ("Estado de Implementación", "Versión v4.0 completa desplegada en GitHub Pages: Lienzo reactivo P2P WebRTC, prevención de palabras duplicadas, trivia con temporizador de 15s y medallas, chat de voz en tiempo real y perfil con niveles e insignias.")
    ]

    for r_idx, (k, v) in enumerate(exec_data):
        c1 = t_exec.cell(r_idx, 0)
        c2 = t_exec.cell(r_idx, 1)
        set_cell_background(c1, "EBDDC2")
        set_cell_background(c2, "FFFDF9")
        set_cell_margins(c1, 80, 80, 120, 120)
        set_cell_margins(c2, 80, 80, 120, 120)
        p1 = c1.paragraphs[0]
        r1 = p1.add_run(k)
        r1.bold = True
        r1.font.size = Pt(9.5)
        r1.font.color.rgb = COLOR_PRIMARY
        p2 = c2.paragraphs[0]
        r2 = p2.add_run(v)
        r2.font.size = Pt(9)
        r2.font.color.rgb = COLOR_DARK

    # ========================================================
    # SECCIÓN 2: MARCO METODOLÓGICO Y PROTOCOLO DE PRUEBA
    # ========================================================
    add_h1("2. Marco Metodológico de la Evaluación con Usuarios")
    add_body(
        "La evaluación se ejecutó bajo los lineamientos metodológicos expuestos en las diapositivas de clase "
        "('Planificar y definir pruebas' y 'Analizar los resultados'). Se estructuró en cuatro pilares:"
    )
    add_body(
        "Conforme a Nielsen y Landauer (1993) y el Nielsen Norman Group (diapositiva 73), 5 evaluadores descubren "
        "entre el 80% y 85% de los problemas de usabilidad cualitativos sin incurrir en redundancias costosas. "
        "Los usuarios fueron seleccionados por su coincidencia con el arquetipo de teletrabajador del Entregable 3.",
        bold_prefix="2.1 Muestra Representativa (n = 5): "
    )
    add_body(
        "Se instruyó a los evaluadores a exteriorizar sus dudas y expectativas sin temor. Se aclaró enfáticamente "
        "que se evaluaba el software y no sus capacidades. Los facilitadores mantuvieron una postura de observación pasiva "
        "para registrar la interacción orgánica (diapositivas 86 y 89 de clase).",
        bold_prefix="2.2 Protocolo Think-Aloud (Pensamiento en Voz Alta): "
    )
    add_body(
        "Al finalizar las tareas, se administró el cuestionario estándar SUS (Brooke, 1986) compuesto por 10 ítems "
        "en escala Likert de 5 puntos, alternando afirmaciones positivas y negativas, complementado con preguntas cualitativas abiertas.",
        bold_prefix="2.3 Instrumento Estandarizado SUS: "
    )

    # ========================================================
    # SECCIÓN 3: RESULTADOS CUANTITATIVOS (SUS)
    # ========================================================
    add_h1("3. Resultados Cuantitativos del Instrumento SUS")
    add_body(
        "El puntaje SUS individual se calculó aplicando la fórmula canónica: para ítems impares (positivos) se resta 1 (X - 1); "
        "para ítems pares (negativos) se resta el valor a 5 (5 - X). La suma acumulada se multiplica por 2,5 para escalar de 0 a 100:"
    )

    # Tabla 1: Resultados SUS
    t1 = doc.add_table(rows=7, cols=5)
    t1.alignment = WD_TABLE_ALIGNMENT.CENTER
    headers_t1 = ["Participante", "Fecha / Hora", "SUS (0-100)", "Calificación Bangor", "Comentario Clave Cualitativo"]
    for col_idx, text in enumerate(headers_t1):
        cell = t1.cell(0, col_idx)
        set_cell_background(cell, "7A4E2D")
        p = cell.paragraphs[0]
        r = p.add_run(text)
        r.bold = True
        r.font.size = Pt(9.5)
        r.font.color.rgb = RGBColor(255, 255, 255)

    data_t1 = [
        ("P1", "08/10 20:20", "95,0", "Excelente (A+)", "Mesa de dibujo muy chévere; sugirió temporizador, dibujo libre vs sugerido y marcador."),
        ("P2", "08/10 23:54", "32,5", "Deficiente (F)", "Jugadores hardcodeados (Sara, Tomás, Lucía) confunden; desea empezar de cero."),
        ("P3", "09/10 16:09", "70,0", "Aceptable (B)", "Sin comentario; marcó neutro en soporte técnico y en requerir aprendizaje."),
        ("P4", "11/10 13:44", "97,5", "Excelente (A+)", "Sin comentario; valoraciones máximas en facilidad, integración y seguridad."),
        ("P5", "12/10 16:42", "92,5", "Excelente (A+)", "Idea muy linda; solicitó expandir cosmética, funciones y agregar más minijuegos."),
        ("CONSOLIDADO", "Media: 77,5", "Mediana: 92,5", "Desv. Est.: 26,6", "Distribución Bimodal: 4 usuarios altos (>70) vs 1 caso crítico (32,5)")
    ]

    for row_idx, data_row in enumerate(data_t1, start=1):
        for col_idx, text in enumerate(data_row):
            cell = t1.cell(row_idx, col_idx)
            set_cell_background(cell, "EBDDC2" if row_idx == 6 else ("FFFDF9" if row_idx % 2 == 1 else "F5EFE3"))
            p = cell.paragraphs[0]
            r = p.add_run(text)
            r.font.size = Pt(8.5)
            if row_idx == 6 or col_idx == 0:
                r.bold = True
            r.font.color.rgb = COLOR_DARK

    add_body(
        "Interpretación metodológica: La distribución presenta un patrón bimodal evidente. Si se excluyera al P2 como valor atípico, "
        "la media subiría a 88,75. Sin embargo, no se descarta porque su testimonio reveló el fallo de onboarding más importante del prototipo v1. "
        "Subescala de Usabilidad (Lewis & Sauro, 2009): 78,1 / 100. Subescala de Facilidad de Aprendizaje (Learnability): 75,0 / 100.",
        bold_prefix="Análisis de dispersión: "
    )

    # ========================================================
    # SECCIÓN 4: ANÁLISIS CUALITATIVO Y GRÁFICO SEMÁFORO
    # ========================================================
    add_h1("4. Análisis Cualitativo y Gráfico Semáforo (Stoplight Chart)")
    add_body(
        "Conforme a las diapositivas 100 a 110 de clase, el Gráfico Semáforo cruza a los evaluadores con los aspectos "
        "clave del sistema: Verde (fluido/satisfactorio), Amarillo (fricción superada) y Rojo (bloqueo/confusión severa):"
    )

    t3 = doc.add_table(rows=7, cols=7)
    t3.alignment = WD_TABLE_ALIGNMENT.CENTER
    headers_t3 = ["Componente / Aspecto", "P1", "P2", "P3", "P4", "P5", "Síntesis del Hallazgo"]
    for col_idx, text in enumerate(headers_t3):
        cell = t3.cell(0, col_idx)
        set_cell_background(cell, "7A4E2D")
        p = cell.paragraphs[0]
        r = p.add_run(text)
        r.bold = True
        r.font.size = Pt(9.5)
        r.font.color.rgb = RGBColor(255, 255, 255)

    data_t3 = [
        ("1. Estado Inicial & Onboarding", "VERDE", "ROJO", "AMARILLO", "VERDE", "VERDE", "P2 confundido por bots ficticios. P3 dudó."),
        ("2. Mesa de Dibujo (Lienzo)", "VERDE", "AMARILLO", "VERDE", "VERDE", "VERDE", "Muy valorado. P1 pidió tiempo y modo libre."),
        ("3. Rincón de Palabras (Turnos)", "VERDE", "AMARILLO", "VERDE", "VERDE", "VERDE", "Mecánica clara; P2 dudó ante falta de partida limpia."),
        ("4. Momento Post-Partida", "VERDE", "VERDE", "VERDE", "VERDE", "VERDE", "Aprobación unánime: salida sin culpa validada."),
        ("5. Tu Rincón (Perfil)", "VERDE", "VERDE", "AMARILLO", "VERDE", "VERDE", "Comprensión alta; P5 pidió ampliar cosmética."),
        ("6. No-Obligatoriedad", "VERDE", "VERDE", "VERDE", "VERDE", "VERDE", "Consistencia total: ítem de seguridad = 4,8/5,0.")
    ]

    for row_idx, data_row in enumerate(data_t3, start=1):
        for col_idx, text in enumerate(data_row):
            cell = t3.cell(row_idx, col_idx)
            p = cell.paragraphs[0]
            if col_idx in [1, 2, 3, 4, 5]:
                val = data_row[col_idx]
                if val == "VERDE":
                    set_cell_background(cell, "E8F5EE")
                    r = p.add_run("🟢 Verde")
                    r.font.color.rgb = RGBColor(46, 125, 50)
                elif val == "AMARILLO":
                    set_cell_background(cell, "FEF7E6")
                    r = p.add_run("🟡 Amarillo")
                    r.font.color.rgb = RGBColor(229, 163, 56)
                else:
                    set_cell_background(cell, "FDEDE9")
                    r = p.add_run("🔴 Rojo")
                    r.font.color.rgb = RGBColor(198, 40, 40)
                r.bold = True
                r.font.size = Pt(8.5)
            else:
                set_cell_background(cell, "FFFDF9" if row_idx % 2 == 1 else "F5EFE3")
                r = p.add_run(text)
                r.font.size = Pt(8.5)
                if col_idx == 0:
                    r.bold = True
                r.font.color.rgb = COLOR_DARK

    # ========================================================
    # SECCIÓN 5: CLASIFICACIÓN DE SEVERIDAD DE NIELSEN
    # ========================================================
    add_h1("5. Diagnóstico de Problemas y Escala de Severidad de Nielsen")
    add_body(
        "Para priorizar las soluciones de ingeniería se aplicó la Escala de Severidad de Usabilidad de Jakob Nielsen (1994), "
        "clasificando los problemas encontrados desde nivel 0 (sin problema) hasta nivel 4 (catástrofe):"
    )

    t_sev = doc.add_table(rows=5, cols=4)
    t_sev.alignment = WD_TABLE_ALIGNMENT.CENTER
    headers_sev = ["Nivel de Severidad", "Problema Identificado", "Impacto en el Usuario", "Solución Implementada en v4.0"]
    for col_idx, text in enumerate(headers_sev):
        cell = t_sev.cell(0, col_idx)
        set_cell_background(cell, "7A4E2D")
        p = cell.paragraphs[0]
        r = p.add_run(text)
        r.bold = True
        r.font.size = Pt(9.5)
        r.font.color.rgb = RGBColor(255, 255, 255)

    data_sev = [
        ("Nivel 3 · Problema Mayor (Alta Prioridad)", "Jugadores precargados ficticios en v1 (Sara, Tomás, Lucía) fijos en la partida.", "Confusión severa en P2 (SUS: 32,5); creyó que el sistema estaba ocupado o roto.", "Partida limpia de cero con solo 'Tú'. Toggle transparente de simulación opcional."),
        ("Nivel 2 · Problema Menor (Media Prioridad)", "Falta de control temporal en dibujo y repetición de palabras en la cadena.", "P1 no sabía cuánto duraría el break. En palabras se podían repetir vocablos.", "Selector de 60s/30s/libre con inicio al trazar. Validador estricto de palabras ya usadas."),
        ("Nivel 2 · Problema Menor (Media Prioridad)", "Loop de puntuación infinita en adivinanza multijugador P2P.", "Al adivinar remotamente se generaba un eco en bucle otorgando puntos infinitos.", "Guard estricto State.draw.roundWon = true y flag broadcast=false en eventos remotos."),
        ("Nivel 1 · Cosmético (Baja Prioridad)", "Poca variedad de minijuegos y perfil sin impacto visible en la experiencia.", "P5 solicitó expandir actividades y dar utilidad real a los gustos seleccionados.", "Trivia gamificada con medallas, El Pasillo, voz WebRTC y preguntas según gustos.")
    ]

    for row_idx, row_vals in enumerate(data_sev, start=1):
        for col_idx, val in enumerate(row_vals):
            cell = t_sev.cell(row_idx, col_idx)
            set_cell_background(cell, "FFFDF9" if row_idx % 2 == 1 else "F5EFE3")
            p = cell.paragraphs[0]
            r = p.add_run(val)
            r.font.size = Pt(8.5)
            if col_idx == 0:
                r.bold = True
            r.font.color.rgb = COLOR_DARK

    # ========================================================
    # SECCIÓN 6: DIAGRAMAS DE FLUJO DE TAREAS (TASK FLOWS)
    # ========================================================
    add_h1("6. Diagramas de Flujo de Tareas (Task Flows / Wireflows)")
    add_body(
        "Como se establece en las diapositivas 50 a 56 de clase ('Planificar y definir pruebas - Flujo de tareas'), "
        "el alcance de cada experiencia debe diagramarse identificando el punto de inicio, las pantallas, las decisiones "
        "del usuario y los estados de salida. A continuación se presentan los diagramas de flujo de tareas para las 4 actividades de PlayBreak:"
    )

    add_h2("6.1 Flujo 1: Mesa de Dibujo Sincrónica (Tiempo Real / P2P)")
    add_body(
        "[SALA PRINCIPAL]\n"
        "   ↓ Clic en 'Entrar a dibujar'\n"
        "[MESA DE DIBUJO · ESTADO INICIAL]\n"
        "   ├─ Seleccionar Modo: ¿Adivinar palabra secreta o Dibujo Libre?\n"
        "   ├─ Configurar Tiempo: 60s | 30s | Sin límite\n"
        "   └─ Conexión Multijugador: Solitario | Simulación Bots | Sala P2P WebRTC\n"
        "   ↓ Primer trazo en el lienzo\n"
        "[INICIO AUTOMÁTICO DE CRONÓMETRO Y ADIVINANZAS]\n"
        "   ├─ Chat en Vivo: Usuario escribe intento / Compañero P2P envía adivinanza\n"
        "   ¿Palabra coincide con la secreta?\n"
        "   ├─ NO: Intento visible en chat sin penalización ni bloqueo\n"
        "   └─ SÍ: >> CORTE ESTRICTO DE LOOP << → Detener cronómetro → +10 pts marcador → Lluvia de confeti\n"
        "   ↓ Clic en 'Terminar ronda y charlar'\n"
        "[MOMENTO POST-PARTIDA: LA CAFETERÍA]\n"
        "   ¿Qué desea hacer el usuario?\n"
        "   ├─ [Seguir charlando]: Genera pregunta rompehielos afinada a gustos / Activa audio WebRTC\n"
        "   ├─ [Jugar otra vez]: Retorna al lienzo con palabra nueva\n"
        "   └─ [Salir sin avisar]: Cierra sesión silenciosamente con privacidad confirmada ('Ghosting amigable')",
        bold_prefix="Estructura del Flujo 1: "
    )

    add_h2("6.2 Flujo 2: Rincón de Palabras Asincrónico (Por Turnos)")
    add_body(
        "[SALA PRINCIPAL]\n"
        "   ↓ Clic en 'Dejar jugada'\n"
        "[RINCÓN DE PALABRAS]\n"
        "   ├─ Carga la cadena acumulada (LocalStorage o compartida)\n"
        "   └─ Extrae última letra de la palabra previa (Ej: 'ALEGRÍA' → requiere 'A')\n"
        "   ↓ Usuario escribe palabra en el campo\n"
        "¿Cumple las validaciones del sistema?\n"
        "   ├─ ¿Menos de 2 letras? → Error amable: 'Mínimo 2 letras'\n"
        "   ├─ ¿Ya fue usada en la cadena? → Error de prevención: '«PALABRA» ya fue usada, piensa en una nueva'\n"
        "   ├─ ¿Empieza con letra incorrecta? → Error explicativo: 'Debe empezar con «A» (última de «ALEGRÍA»)'\n"
        "   └─ VÁLIDA: Agrega a la cadena con autor y marca de tiempo → Confeti → Desbloquea logro si >=3 aportes\n"
        "   ↓ Salida voluntaria\n"
        "[RETORNO A LA SALA PRINCIPAL]",
        bold_prefix="Estructura del Flujo 2: "
    )

    add_h2("6.3 Flujo 3: Trivia Relámpago Gamificada (Minijuego Rápido)")
    add_body(
        "[SALA PRINCIPAL]\n"
        "   ↓ Clic en 'Jugar trivia'\n"
        "[TRIVIA RELÁMPAGO: RONDA DE 5 PREGUNTAS]\n"
        "   ├─ Carga 5 preguntas aleatorias del banco (hábitos, café, cultura y bienestar)\n"
        "   ├─ Inicia cronómetro de 15 segundos por pregunta\n"
        "¿Usuario responde antes de 15 segundos?\n"
        "   ├─ Tiempo agotado: Racha vuelve a 0 → Muestra respuesta correcta y dato curioso → Avanza\n"
        "   ├─ Respuesta incorrecta: Botón rojo → Muestra solución → Avanza\n"
        "   └─ Respuesta correcta: +100 pts (+25 pts si racha > 1) → Confeti → Avanza\n"
        "   ↓ Al completar las 5 preguntas\n"
        "[PANTALLA DE RECOMPENSAS Y MEDALLAS]\n"
        "   ├─ Puntaje >= 400 pts: 🏆 Medalla de Oro (Maestro del Break) + Insignia desbloqueada\n"
        "   ├─ Puntaje >= 200 pts: 🥈 Medalla de Plata (Experto en Pausas) + Insignia desbloqueada\n"
        "   └─ Puntaje < 200 pts:  🥉 Medalla de Bronce (Buen intento de bienestar)\n"
        "   ↓ Opciones: Jugar otra ronda | Ir a Cafetería | Volver a la sala",
        bold_prefix="Estructura del Flujo 3: "
    )

    add_h2("6.4 Flujo 4: La Cafetería & El Pasillo (Social de Baja Fricción)")
    add_body(
        "[ACCESO DESDE POST-PARTIDA O MENÚ PRINCIPAL]\n"
        "   ↓\n"
        "[LA CAFETERÍA / EL PASILLO]\n"
        "   ├─ Algoritmo de afinidad: Filtra preguntas rompehielos según etiquetas de Tu Rincón (Cine, Café, Juegos)\n"
        "   ├─ Módulo de Audio WebRTC: Botón para conectar micrófono en tiempo real con compañeros P2P\n"
        "   ├─ Síntesis de voz: Botón para escuchar al compañero virtual hablar mediante Web Speech API\n"
        "   └─ Muro de notas breves: Publicación de mensajes cortos y reacciones emoji (☕, 🍪, 👏)\n"
        "   ↓ Salida en cualquier momento\n"
        "[SALIDA SIN AVISAR CON CONFIRMACIÓN DE PRIVACIDAD]",
        bold_prefix="Estructura del Flujo 4: "
    )

    # ========================================================
    # SECCIÓN 7: HISTORIAS DE USUARIO PRIORIZADAS (MOSCOW)
    # ========================================================
    add_h1("7. Historias de Usuario Priorizadas (Metodología MoSCoW)")
    add_body(
        "Cada requerimiento se modeló con la persona arquetípica Juliana Ospina (Entregable 3), "
        "priorizado mediante MoSCoW y con criterios de aceptación en formato Gherkin (Dado-Cuando-Entonces):"
    )

    hu_data = [
        ("HU-1", "Como Juliana, quiero que la sala inicie limpia solo con mi presencia ('Tú'), para no confundirme con participantes ficticios.", "Dado que abro la app, cuando ingreso a cualquier sala, entonces solo veo mi avatar sin bots forzados.", "Must Have"),
        ("HU-2", "Como Juliana, quiero entrar a cualquier juego en un solo clic, para no requerir manuales ni asistencia técnica.", "Dado que estoy en la sala principal, cuando toco una tarjeta, entonces el juego abre inmediatamente.", "Must Have"),
        ("HU-3", "Como Juliana, quiero dibujar en un lienzo interactivo real con mouse o dedo, para una experiencia lúdica tangible.", "Dado que estoy en la Mesa de Dibujo, cuando trazo, entonces la línea responde fluidamente con el color y grosor elegido.", "Must Have"),
        ("HU-4", "Como Juliana, quiero poder limitar el tiempo de la partida (60s, 30s o libre), para controlar la duración de mi descanso.", "Dado que elijo un límite de tiempo, cuando hago el primer trazo, entonces el cronómetro inicia automáticamente.", "Should Have"),
        ("HU-5", "Como Juliana, quiero que el sistema valide que no se repitan palabras en la cadena, para mantener el juego fresco y desafiante.", "Dado que envío una palabra, cuando ya existe en la cadena previa, entonces el sistema la rechaza amablemente indicándolo.", "Must Have"),
        ("HU-6", "Como Juliana, quiero que la adivinanza en vivo corte estrictamente el loop de victoria, para no recibir puntos anómalos.", "Dado que se adivina la palabra, cuando el sistema detecta el acierto, entonces suma 10 pts una sola vez y no repite el evento.", "Must Have"),
        ("HU-7", "Como Juliana, quiero jugar una Trivia gamificada con cronómetro y medallas, para tener variedad y sentir que gano algo.", "Dado que juego trivia, cuando respondo 5 preguntas en menos de 15s, entonces gano puntos, racha y medallas de bienestar.", "Should Have"),
        ("HU-8", "Como Juliana, quiero poder activar chat de voz en la cafetería, para charlar con mis compañeros si ambos lo deseamos.", "Dado que estoy en La Cafetería, cuando pulso conectar voz, entonces el micrófono transmite por WebRTC con indicador visual.", "Could Have"),
        ("HU-9", "Como Juliana, quiero que mi perfil configure intereses y desbloquee logros, para que la app se adapte a mí y tenga utilidad.", "Dado que elijo tags y gano partidas, cuando guardo perfil, entonces veo insignias desbloqueadas y preguntas afines.", "Should Have"),
        ("HU-10", "Como Juliana, quiero salir sin avisar en cualquier instante, para no sentir culpa ni compromiso social forzado.", "Dado que toco 'Salir sin avisar', cuando salgo, entonces vuelvo a la sala con notificación de privacidad confirmada.", "Must Have")
    ]

    t4 = doc.add_table(rows=len(hu_data) + 1, cols=4)
    t4.alignment = WD_TABLE_ALIGNMENT.CENTER
    headers_t4 = ["ID", "Historia de Usuario (Persona: Juliana)", "Criterio de Aceptación (Gherkin)", "MoSCoW"]
    for col_idx, text in enumerate(headers_t4):
        cell = t4.cell(0, col_idx)
        set_cell_background(cell, "7A4E2D")
        p = cell.paragraphs[0]
        r = p.add_run(text)
        r.bold = True
        r.font.size = Pt(9.5)
        r.font.color.rgb = RGBColor(255, 255, 255)

    for row_idx, (hid, text, gherkin, moscow) in enumerate(hu_data, start=1):
        for col_idx, val in enumerate([hid, text, gherkin, moscow]):
            cell = t4.cell(row_idx, col_idx)
            set_cell_background(cell, "FFFDF9" if row_idx % 2 == 1 else "F5EFE3")
            p = cell.paragraphs[0]
            r = p.add_run(val)
            r.font.size = Pt(8.5)
            if col_idx == 0:
                r.bold = True
            if col_idx == 3:
                r.bold = True
                if val == "Must Have":
                    r.font.color.rgb = COLOR_PRIMARY
                elif val == "Should Have":
                    r.font.color.rgb = COLOR_SAGE
            r.font.color.rgb = COLOR_DARK

    # ========================================================
    # SECCIÓN 8: MATRIZ DE CAMBIOS IMPLEMENTADOS (V1 VS V4.0)
    # ========================================================
    add_h1("8. Matriz de Cambios Implementados (Versión v1 frente a v4.0)")
    add_body(
        "A continuación se presenta la trazabilidad completa entre los hallazgos de usabilidad y los cambios de ingeniería "
        "desplegados en la versión de producción v4.0 disponible en GitHub Pages:"
    )

    changes_data = [
        ("Jugadores en sala", "Sara, Tomás y Lucía fijos en el código HTML.", "Sala limpia solo con 'Tú' + toggle transparente de simulación opcional.", "R2 (SUS: 32,5)"),
        ("Lienzo de dibujo", "Simulación estática de dibujo predefinido.", "Lienzo reactivo: 8 colores, 3 grosores, borrador, deshacer y descarga PNG.", "R1 y Tarea 1"),
        ("Temporizador", "Inexistente.", "Temporizador configurable (60s, 30s, libre) que inicia al primer trazo en lienzo.", "R1 (Cita textual)"),
        ("Adivinanza y Marcador", "Inexistente.", "Chat en tiempo real, detección de palabra, confeti y marcador de sesión con corte de loop.", "R1 y Hallazgo P2P"),
        ("Rincón de palabras", "3 palabras precargadas fijas sin validación.", "Cadena asincrónica persistente con regla de última letra y validación de NO duplicados.", "R2 y Feedback usuario"),
        ("Trivia Relámpago", "Estática con aviso 'no disponible'.", "Minijuego gamificado: 18 preguntas, 15s de límite, rachas (+25 pts) y medallas Oro/Plata/Bronce.", "R5 y Feedback usuario"),
        ("La Cafetería (Post-juego)", "Texto fijo y preguntas predefinidas.", "Preguntas rompehielos afinadas a tags del perfil + chat de voz WebRTC y síntesis de voz.", "Feedback usuario"),
        ("Tu Rincón (Perfil)", "Formulario largo decorativo.", "Perfil con impacto real: personaliza rompehielos, añade barra de niveles y 4 insignias desbloqueables.", "Feedback usuario"),
        ("Salida silenciosa", "Botón presente sin confirmación.", "Salida sin culpa con toast tranquilizador de privacidad ('Nadie fue notificado').", "Ítem 9 SUS (4,8/5,0)")
    ]

    t5 = doc.add_table(rows=len(changes_data) + 1, cols=4)
    t5.alignment = WD_TABLE_ALIGNMENT.CENTER
    headers_t5 = ["Componente", "Prototipo v1 (Evaluado)", "Versión v4.0 (Implementación Final)", "Justificación UX"]
    for col_idx, text in enumerate(headers_t5):
        cell = t5.cell(0, col_idx)
        set_cell_background(cell, "7A4E2D")
        p = cell.paragraphs[0]
        r = p.add_run(text)
        r.bold = True
        r.font.size = Pt(9.5)
        r.font.color.rgb = RGBColor(255, 255, 255)

    for row_idx, crow in enumerate(changes_data, start=1):
        for col_idx, val in enumerate(crow):
            cell = t5.cell(row_idx, col_idx)
            set_cell_background(cell, "FFFDF9" if row_idx % 2 == 1 else "F5EFE3")
            p = cell.paragraphs[0]
            r = p.add_run(val)
            r.font.size = Pt(8.5)
            if col_idx == 0:
                r.bold = True
            r.font.color.rgb = COLOR_DARK

    # ========================================================
    # SECCIÓN 9: CUMPLIMIENTO DE HEURÍSTICAS DE NIELSEN
    # ========================================================
    add_h1("9. Cumplimiento de las 10 Heurísticas de Usabilidad de Jakob Nielsen")
    heuristics = [
        ("1. Visibilidad del estado del sistema: ", "Temporizadores en dibujo y trivia con avisos visuales; indicador de conexión WebRTC; notificaciones toast suaves."),
        ("2. Coincidencia con el mundo real: ", "Metáforas familiares de bienestar: 'Sala de descanso', 'La Cafetería', 'El Pasillo', 'Pausa de café'."),
        ("3. Control y libertad del usuario: ", "Botones de deshacer trazo, selector de tiempo libre, reiniciar datos y salida libre sin avisar ('ghosting amigable')."),
        ("4. Consistencia y estándares: ", "Paleta 60-30-10, jerarquía visual de botones, retícula base-8 y cuadrícula de componentes predecibles."),
        ("5. Prevención de errores: ", "Validación de letra y duplicados en palabras antes de enviar; normalización ortográfica en adivinanzas."),
        ("6. Reconocimiento antes que recuerdo: ", "Pistas de palabras, letra requerida y avatares participantes siempre visibles en el viewport."),
        ("7. Flexibilidad y eficiencia de uso: ", "Modos sincrónicos (dibujo/trivia) y asincrónicos (palabras/pasillo); soporte para teclado, mouse y pantallas táctiles."),
        ("8. Diseño estético y minimalista: ", "Eliminación de ruido visual; tipografías cálidas (Fredoka y Nunito) y generoso espacio en blanco."),
        ("9. Recuperación ante errores: ", "Mensajes explicativos y cercanos indicando la solución exacta sin culpar al usuario."),
        ("10. Ayuda y documentación: ", "Guías desplegables en cada actividad explicando reglas lúdicas y recordatorio: 'Aquí nada es obligatorio'.")
    ]
    for title, desc in heuristics:
        add_body(desc, bold_prefix=title)

    # ========================================================
    # SECCIÓN 10: CONCLUSIONES Y REFERENCIAS
    # ========================================================
    add_h1("10. Conclusiones")
    add_body(
        "1. La evaluación estandarizada SUS demostró la viabilidad del concepto de pausas activas voluntarias para teletrabajo "
        "(mediana de 92,5 y sensación de seguridad de 4,8 sobre 5,0)."
    )
    add_body(
        "2. El análisis riguroso de la dispersión permitió transformar el caso crítico del P2 (32,5) en una mejora estructural: "
        "la partida limpia de cero y la transparencia de las funciones."
    )
    add_body(
        "3. La versión v4.0 implementada y desplegada en GitHub Pages responde a la totalidad de peticiones cualitativas y requerimientos técnicos: "
        "multijugador P2P WebRTC, prevención de palabras duplicadas, trivia gamificada con medallas tangibles, chat de voz en cafetería y perfil con impacto interactivo."
    )

    add_h1("11. Referencias Bibliográficas")
    refs = [
        "Bangor, A., Kortum, P. T., & Miller, J. T. (2008). An empirical evaluation of the system usability scale. International Journal of Human-Computer Interaction, 24(6), 574-594.",
        "Brooke, J. (1986). SUS: A 'quick and dirty' usability scale. In Usability Evaluation in Industry (pp. 189-194). London: Taylor & Francis.",
        "Lewis, J. R., & Sauro, J. (2009). The factor structure of the system usability scale. In International Conference on Human Centered Design (pp. 94-103). Springer.",
        "Nielsen, J. (1994). Enhancing the explanatory power of usability heuristics. In Proceedings of the SIGCHI Conference on Human Factors in Computing Systems (pp. 152-158). ACM.",
        "Nielsen, J., & Landauer, T. K. (1993). A mathematical model of the finding of usability problems. In Proceedings of the INTERACT'93 and CHI'93 Conference (pp. 206-213). ACM.",
        "Sauro, J. (2011). A Practical Guide to the System Usability Scale: Background, Benchmarks & Best Practices. Measuring Usability LLC."
    ]
    for r in refs:
        p = doc.add_paragraph()
        p.paragraph_format.left_indent = Inches(0.25)
        p.paragraph_format.first_line_indent = Inches(-0.25)
        p.paragraph_format.space_after = Pt(3)
        run = p.add_run(r)
        run.font.size = Pt(9)
        run.font.color.rgb = COLOR_DARK

    return doc

def generate_markdown():
    """Genera la versión Markdown completa y alineada de Entregable 6."""
    md_content = """# Entregable 6: Evaluación del Prototipo PlayBreak, Diagramas de Flujo de Tareas y Plan de Implementación

**Universidad Nacional de Colombia — Facultad de Minas — Sede Medellín**  
**Departamento de Ciencias de la Computación y de la Decisión**  
**Interacción Humano-Computador (IHC)**  
**Grupo #7:**
- Edgar Fernando Vega Morales
- Hinara Pastora Sanchez Mata
- Jacobo Zapata Rojas
- Vincent David Restrepo Tangarife

**Semestre Académico 2025-1 / Febrero - Octubre 2026**  
**Medellín, Antioquia, Colombia**

---

## 1. Hoja Resumen Ejecutiva (*Executive Summary Sheet*)

| Aspecto | Resumen Ejecutivo de la Evaluación y Rediseño |
| :--- | :--- |
| **Propósito y Alcance** | Evaluar la usabilidad y adopción de PlayBreak como plataforma de micro-pausas activas no invasivas para mitigar la fatiga virtual y el aislamiento en equipos remotos. Se evaluaron 4 flujos principales con 5 participantes bajo protocolo *Think-Aloud*. |
| **Población y Muestra** | 5 participantes ($n = 5$) representativos de la persona arquetípica Juliana Ospina (profesionales de teletrabajo/híbrido). Prueba moderada con protocolo *Think-Aloud* y cuestionario estandarizado SUS. |
| **Métricas SUS Consolidadas** | • **Promedio SUS**: **77,5 / 100** (Grado B+ / Aceptable - Buena según Bangor et al., 2008)<br>• **Mediana SUS**: **92,5 / 100** (Grado A+ / Rango de Excelencia)<br>• **Sensación de Seguridad (Ítem 9)**: **4,8 / 5,0** (Máxima puntuación: valida cero presión social)<br>• **Fricción Inicial (Ítem 4)**: **2,2 / 5,0** (Punto débil corregido: desconcierto en onboarding) |
| **Gráfico Semáforo Consolidado** | 🟢 **Verde (Excelente)**: Mesa de Dibujo, Momento Post-Partida, Salida Silenciosa, Ausencia de Presión.<br>🟡 **Amarillo (Fricción Menor)**: Petición de temporizador, modos de juego y variedad lúdica.<br>🔴 **Rojo (Crítico en v1)**: Jugadores hardcodeados en código que confundieron al P2 (SUS: 32,5). |
| **Top 3 Hallazgos Críticos** | 1. **Onboarding confuso por bots ficticios fijos** (*Severidad 3: Mayor* -> Resuelto con partida limpia de cero).<br>2. **Necesidad de control en dibujo** (*Severidad 2: Menor* -> Resuelto con selector 60s/30s/libre y modos adivinar/libre).<br>3. **Deseo de mayor variedad e interacción** (*Severidad 1: Cosmético* -> Resuelto con Trivia de 18 preguntas con medallas, El Pasillo y chat de voz WebRTC en Cafetería). |
| **Estado de Implementación** | **Versión v4.0 completa desplegada en GitHub Pages**: Lienzo reactivo P2P WebRTC, prevención de palabras duplicadas, trivia con temporizador de 15s y medallas, chat de voz en tiempo real y perfil con niveles e insignias. |

---

## 2. Marco Metodológico de la Evaluación con Usuarios

Siguiendo los lineamientos metodológicos de la asignatura (*«Planificar y definir pruebas»* y *«Analizar los resultados»*):

### 2.1 Tamaño de Muestra y Representatividad ($n = 5$)
Conforme a Nielsen y Landauer (1993) y las recomendaciones del Nielsen Norman Group (diapositiva 73 de clase), una muestra de 5 evaluadores permite descubrir entre el 80% y 85% de los problemas cualitativos de usabilidad sin incurrir en costos redundantes. Los participantes fueron seleccionados por su coincidencia con la persona arquetípica del proyecto: **Juliana Ospina** (profesional remota o híbrida con menos de un año en su equipo).

### 2.2 Protocolo de Pensamiento en Voz Alta (*Think-Aloud Protocol*)
- **Fijación de Expectativas**: Se aclaró a los evaluadores que se evaluaba la interfaz y no sus capacidades personales, garantizando que expresaran dudas sin temor.
- **Rol del Evaluador**: Observación pasiva sin intervención ante tropiezos o dudas momentáneas, permitiendo registrar la conducta orgánica del usuario en un entorno realista.
- **Cierre y Reflexión**: Recolección de impresiones globales y aplicación inmediata del cuestionario estandarizado.

---

## 3. Resultados Cuantitativos del Instrumento SUS

### 3.1 Puntuación Individual y Consolidada
La transformación estándar aplica: $(X_i - 1)$ para afirmaciones impares y $(5 - X_i)$ para afirmaciones pares. La sumatoria se multiplica por 2,5.

| Participante | Fecha / Hora | SUS (0-100) | Calificación Bangor | Resumen Cualitativo |
| :--- | :--- | :--- | :--- | :--- |
| **P1** | 08/10 20:20 | **95,0** | Excelente (A+) | Elogió la mesa de dibujo. Sugirió temporizador, modos de dibujo y marcador de victorias. |
| **P2** | 08/10 23:54 | **32,5** | Deficiente (F) | Jugadores precargados (Sara, Tomás, Lucía) generaron confusión. Exigió empezar de cero. |
| **P3** | 09/10 16:09 | **70,0** | Aceptable (B) | Sin comentario; marcó posición neutral en soporte técnico y aprendizaje requerido. |
| **P4** | 11/10 13:44 | **97,5** | Excelente (A+) | Sin comentario; puntajes casi perfectos en integración, facilidad y seguridad. |
| **P5** | 12/10 16:42 | **92,5** | Excelente (A+) | Calificó la idea como hermosa; solicitó expandir cosmética, funciones y más minijuegos. |
| **Consolidado** | **Media: 77,5** | **Mediana: 92,5** | **Desv. Típica: 26,6** | **Comportamiento Bimodal: 4 casos altos (>70) vs. 1 caso crítico (32,5).** |

> **Análisis de Dispersión**: Si se tratara al Participante 2 como una anomalía matemática y se excluyera, el promedio ascendería a 88,75. No obstante, metodológicamente es un error descartarlo: su comentario fundamentó de forma precisa un fallo de onboarding que afectaba a usuarios novatos.  
> **Subescala de Usabilidad (Lewis & Sauro, 2009)**: **78,1 / 100**  
> **Subescala de Facilidad de Aprendizaje (*Learnability*)**: **75,0 / 100**

---

## 4. Análisis Cualitativo y Gráfico Semáforo (*Stoplight Chart*)

Siguiendo las diapositivas 100-110 de clase:
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

---

## 5. Diagnóstico de Usabilidad y Clasificación de Severidad de Nielsen

Para priorizar las soluciones de ingeniería se aplicó la Escala de Severidad de Usabilidad de Jakob Nielsen (1994):

| Nivel de Severidad | Problema Identificado | Impacto en el Usuario | Solución Implementada en v4.0 |
| :--- | :--- | :--- | :--- |
| **Nivel 3 · Problema Mayor** | Jugadores ficticios fijos en v1 (Sara, Tomás, Lucía). | Confusión severa en P2 (SUS: 32,5); creyó que el sistema estaba ocupado o roto. | Partida limpia de cero con solo `Tú`. Toggle transparente de simulación opcional. |
| **Nivel 2 · Problema Menor** | Falta de control temporal en dibujo y repetición de palabras en la cadena. | P1 no sabía cuánto duraría el break. En palabras se podían repetir vocablos. | Selector de 60s/30s/libre con inicio al trazar. Validador estricto de palabras ya usadas. |
| **Nivel 2 · Problema Menor** | Loop de puntuación infinita en adivinanza multijugador P2P. | Al adivinar remotamente se generaba un eco en bucle otorgando puntos infinitos (+4900 pts). | Guard estricto `State.draw.roundWon = true` y flag `broadcast = false` en eventos remotos. |
| **Nivel 1 · Cosmético** | Poca variedad de minijuegos y perfil sin impacto visible en la experiencia. | P5 solicitó expandir actividades y dar utilidad real a los gustos seleccionados. | Trivia gamificada con medallas, El Pasillo, voz WebRTC y preguntas según gustos. |

---

## 6. Diagramas de Flujo de Tareas (*Task Flows / Wireflows*)

Como señalan las diapositivas 50 a 56 de clase (*«Planificar y definir pruebas - Flujo de tareas»*), cada actividad se formaliza a través de un flujo estructurado:

### 6.1 Flujo 1: Mesa de Dibujo Sincrónica (Tiempo Real / P2P)

```mermaid
graph TD
    A[Inicio: Sala Principal] -->|Clic 'Entrar a dibujar'| B[Mesa de Dibujo: Estado Limpio]
    B --> C{Configurar Partida}
    C -->|Modo| D[Adivinar palabra secreta vs. Dibujo libre]
    C -->|Tiempo| E[Selector: 60s, 30s o Sin Límite]
    C -->|Red| F[Solitario / Bots / Sala P2P WebRTC]
    D & E & F --> G[Usuario traza en el lienzo]
    G -->|Primer trazo detectado| H[Inicio Automático de Cronómetro]
    H --> I[Adivinanzas en Chat en Tiempo Real]
    I --> J{¿Palabra Coincide?}
    J -->|No| K[Mensaje normal en chat sin sanción]
    J -->|Sí| L[>> CORTE DE LOOP << Detener tiempo + 10 pts + Confeti]
    L --> M[Momento Post-Partida: La Cafetería]
    M --> N{Decisión del Usuario}
    N -->|Seguir charlando| O[Rompehielos afín a gustos + Micrófono WebRTC]
    N -->|Jugar otra vez| B
    N -->|Salir sin avisar| P[Salida silenciosa confirmada: 'Ghosting amigable']
```

### 6.2 Flujo 2: Rincón de Palabras Asincrónico (Por Turnos)

```mermaid
graph TD
    A[Inicio: Sala Principal] -->|Clic 'Dejar jugada'| B[Rincón de Palabras]
    B --> C[Lee última palabra aportada y letra requerida]
    C --> D[Usuario redacta palabra en formulario]
    D --> E{Validaciones del Sistema}
    E -->|Longitud < 2| F[Error: 'Mínimo 2 letras']
    E -->|Palabra ya usada| G[Error de Prevención: 'Ya fue usada en esta cadena']
    E -->|Letra no coincide| H[Error Amable: 'Debe empezar con última letra previa']
    E -->|Válida| I[Guardar en LocalStorage + Confeti + Notificación toast]
    I --> J{¿Lleva >= 3 palabras?}
    J -->|Sí| K[Desbloquea Logro: 'Diccionario Ágil']
    J -->|No| L[Retorno a Sala Principal]
    K --> L
```

### 6.3 Flujo 3: Trivia Relámpago Gamificada (Minijuego de 5 Preguntas)

```mermaid
graph TD
    A[Inicio: Sala Principal] -->|Clic 'Jugar trivia'| B[Carga 5 preguntas aleatorias del banco]
    B --> C[Muestra pregunta + Inicia cronómetro 15s]
    C --> D{¿Usuario responde antes de 15s?}
    D -->|Tiempo agotado| E[Racha vuelve a 0 + Muestra dato curioso + Siguiente]
    D -->|Incorrecta| F[Botón rojo + Muestra respuesta correcta + Siguiente]
    D -->|Correcta| G[+100 pts + Bono racha + Confeti + Siguiente]
    E & F & G --> H{¿Completó las 5 preguntas?}
    H -->|No| C
    H -->|Sí| I[Pantalla de Premiación y Medallas]
    I --> J{Puntaje Obtenido}
    J -->|>= 400 pts| K[🏆 Medalla de Oro + Logro 'Mente Brillante']
    J -->|>= 200 pts| L[🥈 Medalla de Plata + Logro 'Mente Brillante']
    J -->|< 200 pts| M[🥉 Medalla de Bronce]
    K & L & M --> N[Opciones: Jugar otra vez / Ir a Cafetería / Volver a Sala]
```

### 6.4 Flujo 4: La Cafetería & El Pasillo (Social de Baja Fricción)

```mermaid
graph TD
    A[Acceso desde Post-Partida o Menú] --> B[La Cafetería / El Pasillo]
    B --> C[Algoritmo de Gustos: Pregunta rompehielos afinada al perfil]
    B --> D[Chat de Voz WebRTC: Activar micrófono en vivo P2P]
    B --> E[Síntesis de Voz: Escuchar compañero virtual vía Web Speech API]
    B --> F[Muro de Notas breves: Mensaje informal + Reacciones ☕ 🍪 👏]
    C & D & E & F --> G[Clic 'Salir sin avisar']
    G --> H[Regreso a Sala Principal: Cero presión social]
```

---

## 7. Historias de Usuario Priorizadas (Metodología MoSCoW)

| ID | Historia de Usuario (Persona: Juliana) | Criterios de Aceptación (Formato Gherkin) | MoSCoW |
| :-: | :--- | :--- | :-: |
| **HU-1** | Como Juliana, quiero que la partida empiece de cero mostrando únicamente mi presencia (`Tú`), para entender qué pasa sin confundirme. | **Dado** que entro a la sala, **cuando** abro un rincón lúdico, **entonces** solo veo mi avatar y ningún bot impuesto. | **Must Have** |
| **HU-2** | Como Juliana, quiero entrar a un juego en un solo clic, para no requerir manuales ni ayuda técnica. | **Dado** que estoy en la sala, **cuando** toco un juego, **entonces** se abre de inmediato sin diálogos de configuración obligatorios. | **Must Have** |
| **HU-3** | Como Juliana, quiero dibujar en un lienzo reactivo real, para que el juego se sienta vivo y divertido. | **Dado** que estoy en la Mesa de Dibujo, **cuando** trazo con mouse o dedo, **entonces** el trazo responde con fluidez, color y opción de deshacer. | **Must Have** |
| **HU-4** | Como Juliana, quiero poner un tiempo límite opcional al dibujo, para controlar la duración de mi pausa activa. | **Dado** que estoy en la Mesa de Dibujo, **cuando** elijo un límite (60s, 30s o libre), **entonces** el cronómetro inicia al primer trazo. | **Should Have** |
| **HU-5** | Como Juliana, quiero que el sistema valide que no se repitan palabras en la cadena, para mantener el juego fresco. | **Dado** que envío una palabra, **cuando** ya existe en la cadena previa, **entonces** el sistema la rechaza amablemente indicándolo. | **Must Have** |
| **HU-6** | Como Juliana, quiero que la adivinanza en vivo corte estrictamente el loop de victoria, para no recibir puntos anómalos. | **Dado** que se adivina la palabra, **cuando** el sistema detecta el acierto, **entonces** suma 10 pts una sola vez y no repite el evento. | **Must Have** |
| **HU-7** | Como Juliana, quiero jugar una Trivia gamificada con cronómetro y medallas, para tener variedad y sentir que gano algo. | **Dado** que juego trivia, **cuando** respondo 5 preguntas en menos de 15s, **entonces** gano puntos, racha y medallas de bienestar. | **Should Have** |
| **HU-8** | Como Juliana, quiero poder activar chat de voz en la cafetería, para charlar con mis compañeros si ambos lo deseamos. | **Dado** que estoy en La Cafetería, **cuando** pulso conectar voz, **entonces** el micrófono transmite por WebRTC con indicador visual. | **Could Have** |
| **HU-9** | Como Juliana, quiero que mi perfil configure intereses y desbloquee logros, para que la app se adapte a mí y tenga utilidad. | **Dado** que elijo tags y gano partidas, **cuando** guardo perfil, **entonces** veo insignias desbloqueadas y preguntas afines. | **Should Have** |
| **HU-10** | Como Juliana, quiero poder salir sin avisar en cualquier momento, para no sentir culpa ni compromiso social forzado. | **Dado** que deseo retirarme, **cuando** toco «Salir sin avisar», **entonces** regreso a la sala con un mensaje de privacidad confirmada. | **Must Have** |

---

## 8. Matriz de Cambios Implementados (v1 vs. v4.0 Producción)

| Componente | Prototipo v1 (Evaluado) | Versión v4.0 (Implementación Final) | Justificación UX |
| :--- | :--- | :--- | :--- |
| **Jugadores iniciales** | Sara, Tomás y Lucía fijos en el código. | Sala limpia por defecto con `Tú` + toggle transparente de simulación opcional. | R2 (SUS: 32,5) |
| **Lienzo de dibujo** | Simulación visual estática. | Lienzo completo: 8 colores, 3 grosores, borrador, deshacer (undo) y descarga PNG. | R1 y Tarea 1 |
| **Temporizador** | Inexistente. | Temporizador dinámico (60s, 30s, libre) que inicia al trazar con aviso sonoro sutil. | R1 (Pull quote) |
| **Adivinanza y Marcador** | Inexistente. | Chat interactivo con detección de aciertos, confeti, marcador y corte estricto de loop. | R1 y Hallazgo P2P |
| **Cadena de palabras** | 3 palabras precargadas fijas. | Cadena asincrónica persistente con regla de última letra y validación de NO repetidas. | R2 y Feedback usuario |
| **Trivia Relámpago** | Estática con aviso «no disponible». | Minijuego gamificado: 18 preguntas, 15s de límite, rachas (+25 pts) y medallas de bienestar. | R5 y Feedback usuario |
| **La Cafetería** | Pregunta fija predefinida. | Preguntas afinadas a tags del perfil + chat de voz WebRTC y síntesis de voz. | Feedback usuario |
| **Tu Rincón (Perfil)** | Formulario decorativo sin impacto. | Perfil interactivo: define preguntas rompehielos, añade barra de niveles y 4 insignias. | Feedback usuario |
| **Salida silenciosa** | Botón presente sin feedback. | Salida silenciosa reforzada con toast: «Saliste en silencio. Cero presión». | Ítem 9 SUS (4,8/5,0) |

---

## 9. Cumplimiento de las 10 Heurísticas de Usabilidad de Jakob Nielsen

1. **Visibilidad del estado del sistema**: Cronómetro con contador tabular y pulso visual; indicador de presencia en sala; feedback sonoro suave opcional; notificaciones toast no invasivas.
2. **Coincidencia con el mundo real**: Metáforas cotidianas de descanso («Sala de Descanso», «Mesa de Dibujo», «La Cafetería», «Pausa de café»), sin jerga técnica intimidante.
3. **Control y libertad del usuario**: Botones de deshacer trazo, limpiar lienzo, jugar sin límite de tiempo y salida libre sin avisar (*ghosting amigable*).
4. **Consistencia y estándares**: Regla de color 60-30-10, botones con jerarquía táctil estándar, iconos universales y retícula base-8 en espaciados.
5. **Prevención de errores**: Validación de la letra inicial y palabras duplicadas antes del envío; normalización de mayúsculas y acentos en adivinanzas.
6. **Reconocimiento antes que recuerdo**: Pistas de palabras, última letra encadenada y avatares participantes siempre visibles en el campo visual.
7. **Flexibilidad y eficiencia de uso**: Coexistencia de canales sincrónicos (en vivo) y asincrónicos (por turnos); atajos de teclado y soporte táctil para móviles y stylus.
8. **Diseño estético y minimalista**: Eliminación de ruido visual y elementos ficticios; tipografías Google Fonts de alta legibilidad (Fredoka y Nunito); espacio negativo armónico.
9. **Ayuda a reconocer y recuperarse de errores**: Mensajes amables que indican exactamente la regla violada sin culpabilizar al usuario.
10. **Ayuda y documentación**: Recordatorios de bajo perfil («Aquí nada es obligatorio»), subtítulos explicativos y modal para invitar colegas mediante enlace.

---

## 10. Conclusiones y Próximos Pasos

1. **Validación del Enfoque Lúdico No Obligatorio**: Con una mediana de usabilidad de **92,5** y un puntaje de seguridad de **4,8 / 5,0**, PlayBreak demostró que los descansos lúdicos voluntarios son percibidos como un entorno seguro y agradable para mitigar la fatiga laboral.
2. **Corrección Integral del Onboarding**: El rediseño hacia una partida limpia y la transparencia de las funciones eliminó de raíz la causa del valor atípico de 32,5 puntos, garantizando una curva de aprendizaje instantánea.
3. **Entrega Lista para Producción v4.0**: La aplicación web funcional cumple a cabalidad con los estándares de la materia y está disponible para despliegue público en GitHub Pages (`https://hinarasm12.github.io/PlayBreak/`).

---

## 11. Referencias Bibliográficas

- **Bangor, A., Kortum, P. T., & Miller, J. T.** (2008). *An empirical evaluation of the system usability scale*. International Journal of Human-Computer Interaction, 24(6), 574-594.
- **Brooke, J.** (1986). *SUS: A 'quick and dirty' usability scale*. In Usability Evaluation in Industry (pp. 189-194). London: Taylor & Francis.
- **Lewis, J. R., & Sauro, J.** (2009). *The factor structure of the system usability scale*. In International Conference on Human Centered Design (pp. 94-103). Springer.
- **Nielsen, J.** (1994). *Enhancing the explanatory power of usability heuristics*. In Proceedings of the SIGCHI Conference on Human Factors in Computing Systems (pp. 152-158). ACM.
- **Nielsen, J., & Landauer, T. K.** (1993). *A mathematical model of the finding of usability problems*. In Proceedings of the INTERACT'93 and CHI'93 Conference (pp. 206-213). ACM.
- **Sauro, J.** (2011). *A Practical Guide to the System Usability Scale: Background, Benchmarks & Best Practices*. Measuring Usability LLC.
"""
    return md_content

if __name__ == '__main__':
    doc = create_document()
    
    out_dir = r"D:\Escritorio\H-C\Documentación\Entregas"
    os.makedirs(out_dir, exist_ok=True)
    
    out_docx_1 = os.path.join(out_dir, "Entregable 6 - Grupo 7 - Evaluacion y cambios.docx")
    out_docx_2 = r"D:\Escritorio\H-C\Entregable_6_Grupo_7_Evaluacion_y_Cambios.docx"
    
    try:
        doc.save(out_docx_1)
        print("Saved DOCX to:", out_docx_1)
    except Exception as e:
        print("Warning saving docx 1:", e)

    try:
        doc.save(out_docx_2)
        print("Saved DOCX to:", out_docx_2)
    except Exception as e:
        print("Notice: Entregable_6_Grupo_7_Evaluacion_y_Cambios.docx está abierto en Word u otra app:", e)

    md = generate_markdown()
    out_md_1 = os.path.join(out_dir, "Entregable_6_Grupo_7_Evaluacion_y_Cambios.md")
    out_md_2 = r"D:\Escritorio\H-C\Entregable_6_Grupo_7_Evaluacion_y_Cambios.md"

    try:
        with open(out_md_1, 'w', encoding='utf-8') as f:
            f.write(md)
        print("Saved Markdown to:", out_md_1)
    except Exception as e:
        print("Warning saving md 1:", e)

    try:
        with open(out_md_2, 'w', encoding='utf-8') as f:
            f.write(md)
        print("Saved Markdown to:", out_md_2)
    except Exception as e:
        print("Warning saving md 2:", e)
