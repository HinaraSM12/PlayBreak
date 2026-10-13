/**
 * PlayBreak - Lógica de Aplicación Web Completa
 * Diseñado bajo principios de Usabilidad y HCI (Facultad de Minas - Grupo #7)
 */

(function () {
  'use strict';

  // ==========================================
  // 1. ESTADO GLOBAL DE LA APLICACIÓN
  // ==========================================
  const State = {
    currentScreen: 'mapa',
    theme: localStorage.getItem('pb_theme') || 'light',
    
    // Perfil del Usuario
    profile: {
      name: localStorage.getItem('pb_name') || 'Tú',
      color: localStorage.getItem('pb_color') || '#C98B5B',
      tags: JSON.parse(localStorage.getItem('pb_tags') || '["Cine", "Café", "Música"]'),
      mode: localStorage.getItem('pb_mode') || 'texto',
      stats: JSON.parse(localStorage.getItem('pb_stats') || '{"breaks": 0, "drawings": 0, "words": 0}')
    },

    // Modo Compañeros Virtuales (Simulación transparente)
    simulatedCompanionsEnabled: localStorage.getItem('pb_sim_companions') === 'true',
    virtualFriends: [
      { id: 'f1', name: 'Sara', color: '#B79CE0', active: true, points: 0 },
      { id: 'f2', name: 'Tomás', color: '#7CC4A4', active: true, points: 0 },
      { id: 'f3', name: 'Lucía', color: '#F6C85F', active: true, points: 0 }
    ],

    // Estado de la Mesa de Dibujo
    draw: {
      mode: 'guess', // 'guess' | 'free'
      topicIndex: 0,
      customWord: '',
      secretWord: 'GATO',
      revealedHint: '',
      timeLimit: 60, // 60, 30, 90, 0 (infinito)
      timeLeft: 60,
      timerRunning: false,
      timerInterval: null,
      gameOver: false,
      currentColor: '#3A2E25',
      currentLineWidth: 4,
      drawing: false,
      history: [],
      players: [], // Nombres de jugadores adicionales en la sesión
      scores: { 'Tú': 0 },
      chat: []
    },

    // Estado del Rincón de Palabras
    words: {
      topic: 'Pausa de café y oficina',
      chain: JSON.parse(localStorage.getItem('pb_word_chain') || '[]')
    },

    // Estado de Trivia Relámpago
    trivia: {
      currentQuestionIndex: 0,
      score: 0,
      active: false,
      questions: [
        {
          q: "¿Cuál es tu bebida ideal para una pausa a media tarde?",
          options: ["Café negro bien cargado", "Té o infusión aromática", "Agua bien fría", "Jugo natural o smoothie"],
          icebreaker: "¡Dato curioso! El 64% de los remotos prefieren el café entre las 3 y 4 PM."
        },
        {
          q: "Si pudieras teletrabajar mañana desde cualquier lugar, ¿cuál elegirías?",
          options: ["Cabaña en las montañas con chimenea", "Playa con brisa y buen Wi-Fi", "Cafetería vintage en una ciudad europea", "Mi propia cama con almohadas cómodas"],
          icebreaker: "¡Excelente! La naturaleza inspira la creatividad según diversos estudios de psicología ambiental."
        },
        {
          q: "¿Cuál es tu mejor estrategia para desconectar la mente 5 minutos?",
          options: ["Estirar los brazos y caminar", "Mirar por la ventana", "Escuchar una canción relajante", "Garabatear en un papel"],
          icebreaker: "¡Totalmente válido! PlayBreak fue diseñado justamente para dar ese espacio de micro-descanso."
        }
      ]
    }
  };

  // Banco de palabras para adivinar con pistas
  const WORD_BANK = [
    { word: "GATO", hint: "Mascota peluda de cuatro patas" },
    { word: "PIZZA", hint: "Comida con queso y masa al horno" },
    { word: "BICICLETA", hint: "Vehículo ecológico de dos ruedas" },
    { word: "GUITARRA", hint: "Instrumento musical con cuerdas" },
    { word: "MONTAÑA", hint: "Elevación natural del terreno" },
    { word: "RELOJ", hint: "Mide las horas y minutos" },
    { word: "CAFÉ", hint: "Bebida caliente matutina por excelencia" },
    { word: "ÁRBOL", hint: "Tiene ramas, hojas y raíces" },
    { word: "LUNA", hint: "Astro que ilumina la noche" },
    { word: "AVIÓN", hint: "Vuela por los cielos con pasajeros" }
  ];

  // Preguntas rompehielos para el momento post-partida
  const ICEBREAKER_QUESTIONS = [
    "¿Qué fue lo más divertido o desafiante del dibujo?",
    "¿Cuál es tu canción favorita para concentrarte trabajando?",
    "Si tuvieras un superpoder para tus reuniones de trabajo, ¿cuál sería?",
    "¿Qué comida te alegra instantáneamente el día?",
    "¿Qué proyecto personal o pasatiempo te tiene emocionado últimamente?",
    "¿Película o serie favorita que recomendarías a ojos cerrados?"
  ];

  // ==========================================
  // 2. UTILIDADES DOM Y FORMATO
  // ==========================================
  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];
  const escapeHtml = (str) => {
    return String(str).replace(/[&<>"']/g, (m) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m]));
  };

  function toast(message) {
    let t = $('#globalToast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'globalToast';
      t.className = 'toast-container';
      document.body.appendChild(t);
    }
    t.innerHTML = `<span>✨</span><span>${escapeHtml(message)}</span>`;
    t.hidden = false;
    clearTimeout(t.timer);
    t.timer = setTimeout(() => { t.hidden = true; }, 3200);
  }

  // ==========================================
  // 3. ENRUTAMIENTO Y PANTALLAS
  // ==========================================
  function navigateTo(screenId) {
    if (!$(`#screen-${screenId}`)) screenId = 'mapa';

    // Detener temporizadores activos si salimos de dibujo
    if (State.currentScreen === 'dibujo' && screenId !== 'dibujo') {
      clearInterval(State.draw.timerInterval);
      State.draw.timerRunning = false;
    }

    State.currentScreen = screenId;

    // Actualizar clases activas en vistas
    $$('.screen-view').forEach(view => {
      view.classList.toggle('active', view.id === `screen-${screenId}`);
    });

    // Actualizar botones de navegación lateral
    $$('.nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.go === screenId);
    });

    // Actualizar pastillas del prototipo superior
    $$('.proto-pill').forEach(pill => {
      pill.classList.toggle('active', pill.dataset.go === screenId);
    });

    window.sounds && window.sounds.playClick();

    // Acciones de ciclo de vida de cada pantalla
    if (screenId === 'dibujo') initDrawingScreen();
    if (screenId === 'turnos') renderWordChain();
    if (screenId === 'trivia') initTriviaScreen();
    if (screenId === 'fin') renderPostGameScreen();
    if (screenId === 'perfil') renderProfileScreen();

    // Guardar hash en URL sin recargar
    try {
      history.replaceState(null, '', `#${screenId}`);
    } catch (e) {}

    const viewport = $('.viewport');
    if (viewport) viewport.scrollTop = 0;
  }

  // ==========================================
  // 4. MESA DE DIBUJO (CANVAS INTERACTIVO)
  // ==========================================
  let canvas, ctx;

  function initCanvas() {
    canvas = $('#drawCanvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');

    // Adaptar resolución de renderizado
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = (rect.width || 600) * dpr;
    canvas.height = (rect.height || 320) * dpr;
    ctx.scale(dpr, dpr);

    clearCanvasSurface();

    // Eventos Pointer para soporte universal (Mouse, Stylus, Touch)
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointercancel', handlePointerUp);
  }

  function clearCanvasSurface() {
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    saveCanvasState();
  }

  function saveCanvasState() {
    if (!canvas) return;
    State.draw.history.push(canvas.toDataURL());
    if (State.draw.history.length > 20) State.draw.history.shift();
  }

  function undoCanvas() {
    if (State.draw.history.length <= 1) {
      toast('No hay más trazos para deshacer.');
      return;
    }
    State.draw.history.pop(); // Quitar estado actual
    const prevState = State.draw.history[State.draw.history.length - 1];
    const img = new Image();
    img.src = prevState;
    img.onload = () => {
      const dpr = window.devicePixelRatio || 1;
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      ctx.restore();
      window.sounds && window.sounds.playPop();
    };
  }

  function getCanvasCoords(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  function handlePointerDown(e) {
    if (State.draw.gameOver) return;
    canvas.setPointerCapture(e.pointerId);
    State.draw.drawing = true;
    
    // Iniciar temporizador al primer trazo si no ha empezado
    if (!State.draw.timerRunning && State.draw.timeLimit > 0) {
      startTimer();
    }

    const { x, y } = getCanvasCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = State.draw.currentColor;
    ctx.lineWidth = State.draw.currentLineWidth;
    ctx.lineTo(x + 0.5, y);
    ctx.stroke();

    window.sounds && window.sounds.playClick();
  }

  function handlePointerMove(e) {
    if (!State.draw.drawing || State.draw.gameOver) return;
    const { x, y } = getCanvasCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function handlePointerUp() {
    if (!State.draw.drawing) return;
    State.draw.drawing = false;
    ctx.closePath();
    saveCanvasState();
  }

  function startTimer() {
    if (State.draw.timeLimit <= 0) return;
    clearInterval(State.draw.timerInterval);
    State.draw.timerRunning = true;
    updateTimerDisplay();

    State.draw.timerInterval = setInterval(() => {
      State.draw.timeLeft--;
      updateTimerDisplay();

      if (State.draw.timeLeft <= 0) {
        clearInterval(State.draw.timerInterval);
        State.draw.timerRunning = false;
        State.draw.gameOver = true;
        window.sounds && window.sounds.playDing();
        $('#drawStatusMsg').textContent = '¡Se acabó el tiempo! Toca «Terminar ronda» para ver el resumen.';
        $('#drawStatusMsg').className = 'feedback-msg error';
      }
    }, 1000);
  }

  function updateTimerDisplay() {
    const el = $('#drawTimerDisplay');
    if (!el) return;
    if (State.draw.timeLimit <= 0) {
      el.textContent = 'Sin límite';
      el.classList.remove('low');
      return;
    }
    const mins = Math.floor(State.draw.timeLeft / 60);
    const secs = String(State.draw.timeLeft % 60).padStart(2, '0');
    el.textContent = `${mins}:${secs}`;
    el.classList.toggle('low', State.draw.timeLeft <= 10 && State.draw.timerRunning);
  }

  function initDrawingScreen() {
    setTimeout(initCanvas, 50);

    // Configurar palabra secreta o modo libre
    if (State.draw.mode === 'guess') {
      const current = WORD_BANK[State.draw.topicIndex % WORD_BANK.length];
      State.draw.secretWord = current.word;
      $('#drawTopicTag').textContent = `Adivinar: ${current.word.length} letras`;
      $('#drawHintText').textContent = `Pista: ${current.hint}`;
      $('#guessSectionBox').hidden = false;
    } else {
      $('#drawTopicTag').textContent = 'Dibujo Libre';
      $('#drawHintText').textContent = '¡Dibuja lo que quieras! Sin reglas ni puntuación.';
      $('#guessSectionBox').hidden = true;
    }

    State.draw.gameOver = false;
    State.draw.timeLeft = State.draw.timeLimit;
    State.draw.timerRunning = false;
    clearInterval(State.draw.timerInterval);
    updateTimerDisplay();

    $('#drawStatusMsg').textContent = '';
    renderDrawingPlayers();
    renderScoreboard();
  }

  function renderDrawingPlayers() {
    const container = $('#drawPlayersList');
    if (!container) return;

    let activeList = [{ name: State.profile.name, isMe: true }];

    // Si la simulación de compañeros está activa, agregarlos
    if (State.simulatedCompanionsEnabled) {
      State.virtualFriends.forEach(f => activeList.push({ name: f.name, isMe: false, color: f.color }));
    }

    // Agregar invitados manuales
    State.draw.players.forEach(p => activeList.push({ name: p, isMe: false, manual: true }));

    container.innerHTML = activeList.map((p, idx) => `
      <span class="tag-btn" style="background:var(--sand-light)">
        ${escapeHtml(p.name)} ${p.isMe ? '(Tú)' : ''}
        ${p.manual ? `<button type="button" data-remove-player="${idx}" style="margin-left:4px;color:var(--bad)">✕</button>` : ''}
      </span>
    `).join('');
  }

  function renderScoreboard() {
    const list = $('#scoreboardList');
    if (!list) return;

    let entries = Object.entries(State.draw.scores);
    if (entries.length === 0) {
      entries = [['Tú', 0]];
    }

    list.innerHTML = entries.map(([name, pts]) => `
      <div class="scoreboard-item">
        <span>${escapeHtml(name)}</span>
        <span class="scoreboard-points">${pts} pts</span>
      </div>
    `).join('');
  }

  function handleGuessSubmit(guessText) {
    const cleanGuess = guessText.trim().toUpperCase();
    if (!cleanGuess) return;

    window.sounds && window.sounds.playPop();

    const chatBox = $('#guessMessages');
    const msgEl = document.createElement('div');
    msgEl.className = 'guess-msg';

    // Verificar si acertó
    if (cleanGuess === State.draw.secretWord.toUpperCase()) {
      msgEl.className = 'guess-msg correct';
      msgEl.innerHTML = `🎉 <b>${escapeHtml(State.profile.name)}</b> adivinó la palabra: <b>${State.draw.secretWord}</b>!`;
      
      State.draw.scores['Tú'] = (State.draw.scores['Tú'] || 0) + 10;
      State.profile.stats.drawings++;
      saveProfileStats();

      renderScoreboard();
      triggerConfetti();
      window.sounds && window.sounds.playSuccess();
      toast('¡Adivinaste la palabra correcta! +10 puntos');

      $('#drawStatusMsg').textContent = '¡Ronda ganada! Toca «Cambiar palabra» o «Terminar ronda».';
      $('#drawStatusMsg').className = 'feedback-msg success';
    } else {
      msgEl.innerHTML = `<b>${escapeHtml(State.profile.name)}:</b> ${escapeHtml(guessText)}`;
    }

    chatBox.appendChild(msgEl);
    chatBox.scrollTop = chatBox.scrollHeight;

    // Si los compañeros virtuales están activos, simular respuestas si no se ha adivinado
    if (State.simulatedCompanionsEnabled && cleanGuess !== State.draw.secretWord.toUpperCase()) {
      setTimeout(simulateCompanionGuess, 1200);
    }
  }

  function simulateCompanionGuess() {
    if (State.draw.gameOver) return;
    const friend = State.virtualFriends[Math.floor(Math.random() * State.virtualFriends.length)];
    const guesses = ["¿Será un árbol?", "¿Una mesa?", "¿Es comida?", "¿Un coche?", "¡Casi lo tengo!"];
    const guess = guesses[Math.floor(Math.random() * guesses.length)];

    const chatBox = $('#guessMessages');
    const msgEl = document.createElement('div');
    msgEl.className = 'guess-msg';
    msgEl.innerHTML = `<b>${escapeHtml(friend.name)}:</b> ${guess}`;
    chatBox.appendChild(msgEl);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  function downloadCanvasAsPNG() {
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `PlayBreak-Dibujo-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    toast('Dibujo descargado en tu equipo.');
  }

  // ==========================================
  // 5. RINCÓN DE PALABRAS (ASÍNCRONO)
  // ==========================================
  const INITIAL_CHAIN_WORDS = [
    { word: "café", author: "Tomás", time: "Ayer" },
    { word: "energía", author: "Sara", time: "Hace 2 horas" },
    { word: "alegría", author: "Lucía", time: "Hace 20 min" }
  ];

  function renderWordChain() {
    const container = $('#wordChainList');
    if (!container) return;

    let chain = State.words.chain;
    if (chain.length === 0) {
      // Si la simulación está activa o es primera vez, dar un ejemplo suave
      if (State.simulatedCompanionsEnabled) {
        chain = INITIAL_CHAIN_WORDS;
        State.words.chain = chain;
        localStorage.setItem('pb_word_chain', JSON.stringify(chain));
      }
    }

    if (chain.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <p style="font-size:18px;margin-bottom:8px">🌱 <b>La cadena está esperando su primera palabra</b></p>
          <p>Escribe cualquier palabra relacionada con el tema del día. ¡El siguiente compañero continuará desde tu última letra!</p>
        </div>
      `;
      $('#wordInput').placeholder = "Escribe la primera palabra de la sala...";
      $('#wordRuleHint').textContent = "Cualquier palabra es válida para comenzar.";
      return;
    }

    const lastWordObj = chain[chain.length - 1];
    const lastWord = lastWordObj.word.toLowerCase();
    const lastChar = lastWord.charAt(lastWord.length - 1);

    $('#wordRuleHint').innerHTML = `La siguiente palabra debe empezar con la letra: <b style="font-size:16px;color:var(--accent)">«${lastChar.toUpperCase()}»</b>`;
    $('#wordInput').placeholder = `Palabra que empiece por «${lastChar}»...`;

    container.innerHTML = chain.map((item, index) => {
      const isLast = index === chain.length - 1;
      return `
        <div class="word-card ${isLast ? 'new' : ''}">
          <div class="word-badge">${escapeHtml(item.word.toUpperCase())}</div>
          <div class="word-meta">
            <div class="word-author">${escapeHtml(item.author)}</div>
            <div class="word-time">${escapeHtml(item.time || 'Reciente')}</div>
          </div>
          ${isLast ? '<span class="status-pill" style="font-size:11px">Última aportada</span>' : ''}
        </div>
      `;
    }).join('');

    container.scrollTop = container.scrollHeight;
  }

  function handleWordSubmit(word) {
    const clean = word.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const msgEl = $('#wordFeedbackMsg');

    if (!clean) {
      msgEl.textContent = 'Por favor escribe una palabra para participar.';
      msgEl.className = 'feedback-msg error';
      return;
    }

    if (clean.length < 2) {
      msgEl.textContent = 'La palabra debe tener al menos 2 letras.';
      msgEl.className = 'feedback-msg error';
      return;
    }

    if (State.words.chain.length > 0) {
      const lastWord = State.words.chain[State.words.chain.length - 1].word.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const requiredChar = lastWord.charAt(lastWord.length - 1);

      if (clean.charAt(0) !== requiredChar) {
        msgEl.textContent = `¡Casi! Tu palabra debe empezar con la letra «${requiredChar.toUpperCase()}» (la última de «${lastWord}»).`;
        msgEl.className = 'feedback-msg error';
        window.sounds && window.sounds.playClick();
        return;
      }
    }

    // Palabra válida
    msgEl.textContent = '¡Palabra encadenada con éxito!';
    msgEl.className = 'feedback-msg success';

    State.words.chain.push({
      word: word.trim(),
      author: State.profile.name,
      time: 'Hace un momento'
    });

    localStorage.setItem('pb_word_chain', JSON.stringify(State.words.chain));
    State.profile.stats.words++;
    saveProfileStats();

    window.sounds && window.sounds.playSuccess();
    triggerConfetti();
    toast('¡Dejaste tu jugada asíncrona en el Rincón de Palabras!');

    $('#wordInput').value = '';
    renderWordChain();
  }

  // ==========================================
  // 6. TRIVIA RELÁMPAGO (MINIJUEGO SUGERIDO R5)
  // ==========================================
  function initTriviaScreen() {
    State.trivia.currentQuestionIndex = 0;
    State.trivia.score = 0;
    renderTriviaQuestion();
  }

  function renderTriviaQuestion() {
    const q = State.trivia.questions[State.trivia.currentQuestionIndex];
    if (!q) {
      renderTriviaFinish();
      return;
    }

    $('#triviaQuestionNum').textContent = `Pregunta ${State.trivia.currentQuestionIndex + 1} de ${State.trivia.questions.length}`;
    $('#triviaQuestionText').textContent = q.q;

    const optionsContainer = $('#triviaOptionsList');
    optionsContainer.innerHTML = q.options.map((opt, i) => `
      <button type="button" class="trivia-opt-btn" data-trivia-idx="${i}">
        ${escapeHtml(opt)}
      </button>
    `).join('');

    $('#triviaFactBox').hidden = true;
  }

  function handleTriviaSelect(index) {
    const q = State.trivia.questions[State.trivia.currentQuestionIndex];
    window.sounds && window.sounds.playPop();

    $$('.trivia-opt-btn').forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === index) btn.classList.add('selected');
    });

    const factBox = $('#triviaFactBox');
    factBox.textContent = q.icebreaker;
    factBox.hidden = false;

    setTimeout(() => {
      State.trivia.currentQuestionIndex++;
      renderTriviaQuestion();
    }, 2200);
  }

  function renderTriviaFinish() {
    $('#triviaQuestionNum').textContent = "¡Ronda Completada!";
    $('#triviaQuestionText').textContent = "¡Excelente pausa activa! Has compartido tus preferencias de break.";
    $('#triviaOptionsList').innerHTML = `
      <div style="text-align:center;padding:var(--s4) 0">
        <p style="font-size:16px;color:var(--soft);margin-bottom:var(--s3)">
          Estas preguntas ayudan a descubrir gustos en común con tu equipo sin reuniones forzadas.
        </p>
        <button type="button" class="btn" data-go="fin">Ir a la Cafetería Post-Partida</button>
      </div>
    `;
    $('#triviaFactBox').hidden = true;
    window.sounds && window.sounds.playSuccess();
    triggerConfetti();
  }

  // ==========================================
  // 7. MOMENTO POST-PARTIDA ("LA CAFETERÍA")
  // ==========================================
  function renderPostGameScreen() {
    State.profile.stats.breaks++;
    saveProfileStats();

    // Avatares de los que jugaron
    const avatarsContainer = $('#postgameAvatars');
    let participants = [{ name: State.profile.name, color: State.profile.color }];

    if (State.simulatedCompanionsEnabled) {
      participants.push(...State.virtualFriends);
    }
    State.draw.players.forEach(p => participants.push({ name: p, color: '#9B653C' }));

    avatarsContainer.innerHTML = participants.map(p => `
      <div class="avatar lg" style="--c:${p.color}">
        <span class="avatar-smile"></span>
        <span class="avatar-tag">${escapeHtml(p.name)}</span>
      </div>
    `).join('');

    generateRandomIcebreaker();
  }

  function generateRandomIcebreaker() {
    const q = ICEBREAKER_QUESTIONS[Math.floor(Math.random() * ICEBREAKER_QUESTIONS.length)];
    const el = $('#icebreakerQuestion');
    if (el) {
      el.textContent = `☕ Pregunta para charlar: «${q}»`;
    }
  }

  // ==========================================
  // 8. PERFIL Y PERSONALIZACIÓN ("TU RINCÓN")
  // ==========================================
  const SWATCH_COLORS = ['#C98B5B', '#D96951', '#5B9BC4', '#5F9E82', '#E5A338', '#9B653C', '#7B68EE', '#E06D8C'];
  const AVAILABLE_TAGS = ['Cine', 'Series', 'Videojuegos', 'Música', 'Senderismo', 'Cocina', 'Lectura', 'Fútbol', 'Café', 'Mascotas', 'Fotografía', 'Viajes'];

  function renderProfileScreen() {
    $('#profileNameInput').value = State.profile.name;
    
    // Avatar grande
    updateProfileAvatarPreview();

    // Paleta de colores
    const swatches = $('#colorSwatches');
    swatches.innerHTML = SWATCH_COLORS.map(c => `
      <button type="button" class="swatch-btn ${c === State.profile.color ? 'active' : ''}" 
        style="--c:${c}" data-swatch="${c}" aria-label="Color ${c}"></button>
    `).join('');

    // Nube de tags de intereses
    const tagsCloud = $('#profileTagsCloud');
    tagsCloud.innerHTML = AVAILABLE_TAGS.map(t => {
      const active = State.profile.tags.includes(t);
      return `<button type="button" class="tag-btn" data-tag="${t}" aria-pressed="${active}">${escapeHtml(t)}</button>`;
    }).join('');

    // Modo preferido
    $$('input[name="prefModo"]').forEach(radio => {
      radio.checked = radio.value === State.profile.mode;
    });

    // Estadísticas
    $('#statBreaks').textContent = State.profile.stats.breaks;
    $('#statDrawings').textContent = State.profile.stats.drawings;
    $('#statWords').textContent = State.profile.stats.words;
  }

  function updateProfileAvatarPreview() {
    const preview = $('#profileAvatarPreview');
    if (preview) {
      preview.style.setProperty('--c', State.profile.color);
    }
    const sideAv = $('#sidebarUserAvatar');
    if (sideAv) {
      sideAv.style.setProperty('--c', State.profile.color);
    }
    const sideName = $('#sidebarUserName');
    if (sideName) {
      sideName.textContent = State.profile.name;
    }
  }

  function saveProfileStats() {
    localStorage.setItem('pb_stats', JSON.stringify(State.profile.stats));
  }

  function saveProfile() {
    const name = $('#profileNameInput').value.trim() || 'Tú';
    State.profile.name = name;
    localStorage.setItem('pb_name', name);

    const mode = $('input[name="prefModo"]:checked')?.value || 'texto';
    State.profile.mode = mode;
    localStorage.setItem('pb_mode', mode);

    localStorage.setItem('pb_tags', JSON.stringify(State.profile.tags));
    localStorage.setItem('pb_color', State.profile.color);

    updateProfileAvatarPreview();
    window.sounds && window.sounds.playSuccess();
    toast('¡Perfil y preferencias guardados con éxito!');
  }

  // ==========================================
  // 9. ANIMACIÓN DE CONFETI NATIVO (CANVAS)
  // ==========================================
  function triggerConfetti() {
    const canvas = $('#confettiCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#7A4E2D', '#D96951', '#5B9BC4', '#5F9E82', '#E5A338', '#FFFFFF'];
    const particles = [];

    for (let i = 0; i < 70; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 200,
        y: canvas.height / 2 + (Math.random() - 0.5) * 100,
        vx: (Math.random() - 0.5) * 12,
        vy: -Math.random() * 10 - 4,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vr: (Math.random() - 0.5) * 10,
        opacity: 1
      });
    }

    let frames = 0;
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.3; // Gravedad
        p.rotation += p.vr;
        p.opacity -= 0.012;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(p.opacity, 0);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });

      frames++;
      if (frames < 90) {
        requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    animate();
  }

  // ==========================================
  // 10. MANEJADORES DE EVENTOS GLOBALES
  // ==========================================
  function setupEventListeners() {
    // Delegación para navegación
    document.addEventListener('click', (e) => {
      const goBtn = e.target.closest('[data-go]');
      if (goBtn) {
        navigateTo(goBtn.dataset.go);
        return;
      }

      // Acciones específicas
      const actBtn = e.target.closest('[data-act]');
      if (actBtn) {
        handleAction(actBtn.dataset.act, actBtn);
        return;
      }

      // Selección de colores en dibujo
      const colBtn = e.target.closest('[data-draw-color]');
      if (colBtn) {
        State.draw.currentColor = colBtn.dataset.drawColor;
        $$('.color-btn').forEach(b => b.classList.toggle('active', b === colBtn));
        window.sounds && window.sounds.playClick();
        return;
      }

      // Tamaño de pincel
      const brushBtn = e.target.closest('[data-brush-size]');
      if (brushBtn) {
        State.draw.currentLineWidth = parseInt(brushBtn.dataset.brushSize, 10);
        $$('.brush-btn').forEach(b => b.classList.toggle('active', b === brushBtn));
        window.sounds && window.sounds.playClick();
        return;
      }

      // Tags de perfil
      const tagBtn = e.target.closest('[data-tag]');
      if (tagBtn) {
        const tag = tagBtn.dataset.tag;
        const exists = State.profile.tags.includes(tag);
        if (exists) {
          State.profile.tags = State.profile.tags.filter(t => t !== tag);
          tagBtn.setAttribute('aria-pressed', 'false');
        } else {
          State.profile.tags.push(tag);
          tagBtn.setAttribute('aria-pressed', 'true');
        }
        window.sounds && window.sounds.playPop();
        return;
      }

      // Swatches de perfil
      const swatchBtn = e.target.closest('[data-swatch]');
      if (swatchBtn) {
        State.profile.color = swatchBtn.dataset.swatch;
        $$('.swatch-btn').forEach(b => b.classList.toggle('active', b === swatchBtn));
        updateProfileAvatarPreview();
        window.sounds && window.sounds.playClick();
        return;
      }

      // Opciones de trivia
      const triviaOpt = e.target.closest('[data-trivia-idx]');
      if (triviaOpt) {
        handleTriviaSelect(parseInt(triviaOpt.dataset.triviaIdx, 10));
        return;
      }
    });

    // Formulario de Adivinanza en Dibujo
    $('#guessForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = $('#guessInput');
      handleGuessSubmit(input.value);
      input.value = '';
    });

    // Formulario de Rincón de Palabras
    $('#wordForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = $('#wordInput');
      handleWordSubmit(input.value);
    });

    // Formulario para invitar / agregar jugador manual en dibujo
    $('#addPlayerForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = $('#addPlayerInput');
      const name = input.value.trim();
      if (!name) return;
      if (name.toLowerCase() === 'tú' || State.draw.players.some(p => p.toLowerCase() === name.toLowerCase())) {
        toast('Ese jugador ya está en la sala.');
        return;
      }
      State.draw.players.push(name);
      State.draw.scores[name] = 0;
      input.value = '';
      renderDrawingPlayers();
      renderScoreboard();
      toast(`Jugador «${name}» agregado.`);
    });

    // Toggle de Compañeros Virtuales (Simulación transparente)
    $('#toggleSimulatedCompanions')?.addEventListener('change', (e) => {
      State.simulatedCompanionsEnabled = e.target.checked;
      localStorage.setItem('pb_sim_companions', State.simulatedCompanionsEnabled);
      renderDrawingPlayers();
      renderScoreboard();
      toast(State.simulatedCompanionsEnabled ? 
        'Compañeros de prueba activados (Sara, Tomás, Lucía).' : 
        'Modo solo tú activado. La sala empieza limpia.');
    });

    // Selector de tema (Dark / Light)
    $('#themeToggleBtn')?.addEventListener('click', () => {
      State.theme = State.theme === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', State.theme);
      localStorage.setItem('pb_theme', State.theme);
      $('#themeToggleBtn').innerHTML = State.theme === 'light' ? '🌙 Modo Noche' : '☀️ Modo Cálido';
      toast(State.theme === 'light' ? 'Modo Cálido activado.' : 'Modo Café Nocturno activado.');
    });

    // Toggle de Audio Mute
    $('#soundToggleBtn')?.addEventListener('click', () => {
      const isMuted = window.sounds.toggleMute();
      $('#soundToggleBtn').innerHTML = isMuted ? '🔇 Silenciado' : '🔔 Sonido ON';
      toast(isMuted ? 'Sonidos desactivados.' : 'Sonidos relajantes activados.');
    });
  }

  function handleAction(action, btn) {
    switch (action) {
      case 'clear-canvas':
        clearCanvasSurface();
        window.sounds && window.sounds.playPop();
        toast('Lienzo limpio.');
        break;

      case 'undo-canvas':
        undoCanvas();
        break;

      case 'download-canvas':
        downloadCanvasAsPNG();
        break;

      case 'next-word':
        State.draw.topicIndex = (State.draw.topicIndex + 1) % WORD_BANK.length;
        initDrawingScreen();
        window.sounds && window.sounds.playClick();
        toast('Nueva palabra cargada.');
        break;

      case 'toggle-draw-mode':
        State.draw.mode = State.draw.mode === 'guess' ? 'free' : 'guess';
        btn.textContent = State.draw.mode === 'guess' ? 'Modo: Adivinar' : 'Modo: Dibujo Libre';
        initDrawingScreen();
        toast(State.draw.mode === 'guess' ? 'Cambiado a juego de adivinar con palabra secreta.' : 'Cambiado a dibujo libre.');
        break;

      case 'toggle-timer-limit':
        const limits = [60, 30, 90, 0];
        const nextIdx = (limits.indexOf(State.draw.timeLimit) + 1) % limits.length;
        State.draw.timeLimit = limits[nextIdx];
        btn.textContent = State.draw.timeLimit === 0 ? 'Tiempo: Libre' : `Tiempo: ${State.draw.timeLimit} s`;
        initDrawingScreen();
        toast(`Tiempo límite: ${State.draw.timeLimit === 0 ? 'Sin límite' : State.draw.timeLimit + ' segundos'}.`);
        break;

      case 'save-profile':
        saveProfile();
        break;

      case 'random-icebreaker':
        generateRandomIcebreaker();
        window.sounds && window.sounds.playClick();
        break;

      case 'ghost-exit':
        // Salir sin avisar con mensaje tranquilizador
        navigateTo('mapa');
        toast('🌿 Saliste de la sala en silencio. Nadie recibió notificación.');
        break;

      case 'share-room':
        const shareDialog = $('#shareRoomDialog');
        if (shareDialog) shareDialog.showModal();
        break;

      case 'copy-invite-link':
        navigator.clipboard?.writeText(window.location.href);
        toast('Enlace copiado. Compártelo con quien quieras.');
        $('#shareRoomDialog')?.close();
        break;

      case 'toggle-proto-bar':
        const bar = $('.top-toolbar');
        bar.hidden = !bar.hidden;
        const showBtn = $('#showProtoBtn');
        if (showBtn) showBtn.hidden = !bar.hidden;
        break;

      case 'reset-all-data':
        if (confirm('¿Restablecer datos de prueba a los valores iniciales?')) {
          localStorage.clear();
          location.reload();
        }
        break;
    }
  }

  // ==========================================
  // 11. INICIALIZACIÓN AL CARGAR LA PÁGINA
  // ==========================================
  function initApp() {
    // Aplicar tema guardado
    document.documentElement.setAttribute('data-theme', State.theme);
    const themeBtn = $('#themeToggleBtn');
    if (themeBtn) {
      themeBtn.innerHTML = State.theme === 'light' ? '🌙 Modo Noche' : '☀️ Modo Cálido';
    }

    // Estado del botón de audio
    const soundBtn = $('#soundToggleBtn');
    if (soundBtn && window.sounds) {
      soundBtn.innerHTML = window.sounds.isMuted() ? '🔇 Silenciado' : '🔔 Sonido ON';
    }

    // Toggle de simulación de compañeros
    const simToggle = $('#toggleSimulatedCompanions');
    if (simToggle) {
      simToggle.checked = State.simulatedCompanionsEnabled;
    }

    updateProfileAvatarPreview();
    setupEventListeners();

    // Navegar según hash de la URL o ir a la sala
    const initialHash = (location.hash || '').replace('#', '');
    navigateTo(initialHash || 'mapa');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

})();
