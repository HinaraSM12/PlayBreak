/**
 * PlayBreak - Lógica de Aplicación Web Completa (v3.8)
 * Con Multijugador Real WebRTC (PeerJS), Bots Activos en Vivo y 4 Actividades Lúdicas
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
      stats: JSON.parse(localStorage.getItem('pb_stats') || '{"breaks": 0, "drawings": 0, "words": 0, "pasillo": 0}')
    },

    // Modo Compañeros Virtuales (Simulación transparente)
    simulatedCompanionsEnabled: localStorage.getItem('pb_sim_companions') !== 'false', // Por defecto activo para experiencia inmediata
    virtualFriends: [
      { id: 'f1', name: 'Sara', color: '#B79CE0', active: true, points: 0 },
      { id: 'f2', name: 'Tomás', color: '#7CC4A4', active: true, points: 0 },
      { id: 'f3', name: 'Lucía', color: '#F6C85F', active: true, points: 0 }
    ],

    // Estado de la Mesa de Dibujo
    draw: {
      mode: 'guess', // 'guess' | 'free'
      topicIndex: 0,
      secretWord: 'GATO',
      hint: 'Mascota peluda de cuatro patas',
      timeLimit: 60, // 60, 30, 90, 0 (infinito)
      timeLeft: 60,
      timerRunning: false,
      timerInterval: null,
      botGuessInterval: null,
      gameOver: false,
      currentColor: '#3A2E25',
      currentLineWidth: 4,
      drawing: false,
      history: [],
      players: [],
      scores: { 'Tú': 0, 'Sara': 0, 'Tomás': 0, 'Lucía': 0 },
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
    },

    // Estado de El Pasillo (Café Virtual - Actividad 4)
    pasillo: {
      topic: "«¿Cuál es tu canción o sonido infalible para concentrarte teletrabajando?»",
      notes: JSON.parse(localStorage.getItem('pb_pasillo_notes') || '[]')
    },

    // Multijugador WebRTC P2P (PeerJS)
    p2p: {
      peer: null,
      connection: null,
      isHost: false,
      roomCode: null,
      connected: false
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

  // Banco de notas iniciales para El Pasillo
  const INITIAL_PASILLO_NOTES = [
    { id: 1, author: "Sara", color: "#B79CE0", text: "¡Lofi hip hop beats de fondo siempre! Me ayuda un montón a escribir código.", time: "Hace 10 min", reactions: { "☕": 3, "👏": 1 } },
    { id: 2, author: "Tomás", color: "#7CC4A4", text: "Sonido de lluvia en bosque con audífonos. Siento que estoy en una cabaña.", time: "Hace 25 min", reactions: { "☕": 2, "🍪": 4 } }
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
  // 2. UTILIDADES DOM Y TOAST
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

    // Detener temporizadores si salimos de dibujo
    if (State.currentScreen === 'dibujo' && screenId !== 'dibujo') {
      stopDrawingTimers();
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

    // Ciclo de vida por pantalla
    if (screenId === 'dibujo') initDrawingScreen();
    if (screenId === 'turnos') renderWordChain();
    if (screenId === 'trivia') initTriviaScreen();
    if (screenId === 'pasillo') renderPasilloScreen();
    if (screenId === 'fin') renderPostGameScreen();
    if (screenId === 'perfil') renderProfileScreen();

    try {
      history.replaceState(null, '', `#${screenId}`);
    } catch (e) {}

    const viewport = $('.viewport');
    if (viewport) viewport.scrollTop = 0;
  }

  function stopDrawingTimers() {
    clearInterval(State.draw.timerInterval);
    clearInterval(State.draw.botGuessInterval);
    State.draw.timerRunning = false;
  }

  // ==========================================
  // 4. MESA DE DIBUJO (CANVAS & BOTS ACTIVOS)
  // ==========================================
  let canvas, ctx;

  function initCanvas() {
    canvas = $('#drawCanvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = (rect.width || 600) * dpr;
    canvas.height = (rect.height || 320) * dpr;
    ctx.scale(dpr, dpr);

    clearCanvasSurface();

    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointercancel', handlePointerUp);
  }

  function clearCanvasSurface(broadcast = true) {
    if (!ctx) return;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    saveCanvasState();

    if (broadcast && State.p2p.connection) {
      sendPeerMessage({ type: 'clear' });
    }
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
    State.draw.history.pop();
    const prevState = State.draw.history[State.draw.history.length - 1];
    const img = new Image();
    img.src = prevState;
    img.onload = () => {
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
    
    // Iniciar temporizador y el loop de adivinanzas activas de compañeros
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

    // Broadcast por WebRTC si hay multijugador online conectado
    if (State.p2p.connection) {
      sendPeerMessage({
        type: 'draw_down',
        x, y,
        color: State.draw.currentColor,
        size: State.draw.currentLineWidth
      });
    }

    window.sounds && window.sounds.playClick();
  }

  function handlePointerMove(e) {
    if (!State.draw.drawing || State.draw.gameOver) return;
    const { x, y } = getCanvasCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();

    if (State.p2p.connection) {
      sendPeerMessage({ type: 'draw_move', x, y });
    }
  }

  function handlePointerUp() {
    if (!State.draw.drawing) return;
    State.draw.drawing = false;
    ctx.closePath();
    saveCanvasState();

    if (State.p2p.connection) {
      sendPeerMessage({ type: 'draw_up' });
    }
  }

  function startTimer() {
    if (State.draw.timeLimit <= 0) return;
    clearInterval(State.draw.timerInterval);
    State.draw.timerRunning = true;
    updateTimerDisplay();

    // Iniciar el temporizador regresivo
    State.draw.timerInterval = setInterval(() => {
      State.draw.timeLeft--;
      updateTimerDisplay();

      if (State.draw.timeLeft <= 0) {
        stopDrawingTimers();
        State.draw.gameOver = true;
        window.sounds && window.sounds.playDing();
        $('#drawStatusMsg').textContent = '¡Se acabó el tiempo! Toca «Terminar ronda y charlar».';
        $('#drawStatusMsg').className = 'feedback-msg error';
      }
    }, 1000);

    // Iniciar el bucle orgánico de adivinanzas de los compañeros mientras dibujas
    startActiveBotGuessingLoop();
  }

  function startActiveBotGuessingLoop() {
    clearInterval(State.draw.botGuessInterval);
    if (!State.simulatedCompanionsEnabled || State.draw.mode !== 'guess') return;

    let tickCount = 0;
    // Cada 4 a 6 segundos un compañero virtual hace un intento en el chat
    State.draw.botGuessInterval = setInterval(() => {
      if (State.draw.gameOver || !State.draw.timerRunning) {
        clearInterval(State.draw.botGuessInterval);
        return;
      }
      tickCount++;
      triggerSimulatedCompanionGuess(tickCount);
    }, 5000);
  }

  function triggerSimulatedCompanionGuess(tick = 1) {
    if (State.draw.gameOver) return;

    const friends = State.virtualFriends;
    const friend = friends[Math.floor(Math.random() * friends.length)];
    const word = State.draw.secretWord;

    // Banco de adivinanzas cercanas / simpáticas según la palabra secreta
    const closeGuesses = {
      'GATO': ["¿Es un perro?", "¿Un conejo?", "¿Tiene orejas?", "¿Un tigre pequeño?", "¿Un animal?", "¡Parece un minino!"],
      'PIZZA': ["¿Es un pastel?", "¿Una rueda?", "¿Comida?", "¿Un queso?", "¡Parece una tarta!", "¿Algo horneado?"],
      'BICICLETA': ["¿Una moto?", "¿Un vehículo?", "¿Tiene dos ruedas?", "¿Un triciclo?", "¡Parece un patinete!"],
      'GUITARRA': ["¿Un violín?", "¿Un instrumento?", "¿Tiene cuerdas?", "¿Un bajo?", "¡Tiene forma de guitarra!"],
      'MONTAÑA': ["¿Un triángulo?", "¿Un volcán?", "¿Es naturaleza?", "¿Una colina?", "¡Una pirámide!"],
      'RELOJ': ["¿Un círculo?", "¿Mide el tiempo?", "¿Un cronómetro?", "¿Es un reloj despertador?"],
      'CAFÉ': ["¿Una taza?", "¿Té caliente?", "¿Algo para tomar?", "¿Un pocillo?", "¡Huele a café!"],
      'ÁRBOL': ["¿Una flor?", "¿Una planta?", "¿Naturaleza?", "¿Tiene ramas?", "¡Parece un pino!"],
      'LUNA': ["¿El sol?", "¿Una esfera?", "¿Una estrella?", "¿La luna en cuarto menguante?"],
      'AVIÓN': ["¿Un pájaro?", "¿Un helicóptero?", "¿Vuela por el aire?", "¿Un ave?", "¡Tiene alas!"]
    };

    const guessesList = closeGuesses[word] || ["¿Qué será?", "¿Es un objeto?", "¿Es un animal?", "¡Casi lo tengo!"];

    // En los primeros intentos hacen deducciones; tras 4-5 intentos o si falta poco tiempo, uno de ellos adivina la palabra
    const shouldWin = tick >= 4 || (State.draw.timeLeft <= 22 && State.draw.timeLeft > 8);

    if (shouldWin) {
      // ¡El compañero adivina!
      clearInterval(State.draw.botGuessInterval);
      postChatMessage(friend.name, `¡Es un ${word}! 🎉`, false);
      handleGuessSuccess(friend.name, word);
    } else {
      const guess = guessesList[Math.floor(Math.random() * guessesList.length)];
      postChatMessage(friend.name, guess, false);
      window.sounds && window.sounds.playPop();
    }
  }

  function postChatMessage(author, text, isSystem = false) {
    const chatBox = $('#guessMessages');
    if (!chatBox) return;

    const msgEl = document.createElement('div');
    msgEl.className = 'guess-msg';

    if (isSystem) {
      msgEl.className = 'guess-msg system';
      msgEl.innerHTML = escapeHtml(text);
    } else {
      const isMe = author === State.profile.name;
      msgEl.innerHTML = `<b style="color:${isMe ? 'var(--accent)' : 'var(--ink)'}">${escapeHtml(author)}:</b> ${escapeHtml(text)}`;
    }

    chatBox.appendChild(msgEl);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  function handleGuessSuccess(winnerName, word) {
    State.draw.gameOver = true;
    stopDrawingTimers();

    // Otorgar puntos
    State.draw.scores[winnerName] = (State.draw.scores[winnerName] || 0) + 10;
    renderScoreboard();

    // Mensaje en chat
    const chatBox = $('#guessMessages');
    const winMsg = document.createElement('div');
    winMsg.className = 'guess-msg correct';
    winMsg.innerHTML = `🏆 <b>${escapeHtml(winnerName)}</b> adivinó la palabra: <b>${escapeHtml(word)}</b> (+10 pts)`;
    chatBox.appendChild(winMsg);
    chatBox.scrollTop = chatBox.scrollHeight;

    // Celebración visual y sonora
    triggerConfetti();
    window.sounds && window.sounds.playSuccess();
    toast(`¡${winnerName} adivinó la palabra «${word}»!`);

    $('#drawStatusMsg').textContent = `¡Ronda ganada por ${winnerName}! Toca «Cambiar palabra» o «Terminar ronda y charlar».`;
    $('#drawStatusMsg').className = 'feedback-msg success';

    // Broadcast a compañero P2P si está conectado
    if (State.p2p.connection) {
      sendPeerMessage({ type: 'win', winnerName, word });
    }
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
    setTimeout(initCanvas, 60);

    if (State.draw.mode === 'guess') {
      const current = WORD_BANK[State.draw.topicIndex % WORD_BANK.length];
      State.draw.secretWord = current.word;
      State.draw.hint = current.hint;
      $('#drawTopicTag').textContent = `Adivinar: ${current.word.length} letras`;
      $('#drawHintText').textContent = `Pista: ${current.hint}`;
      $('#guessSectionBox').hidden = false;
    } else {
      $('#drawTopicTag').textContent = 'Dibujo Libre';
      $('#drawHintText').textContent = '¡Dibuja lo que quieras! Sin reglas ni temporizador forzado.';
      $('#guessSectionBox').hidden = true;
    }

    State.draw.gameOver = false;
    State.draw.timeLeft = State.draw.timeLimit;
    State.draw.timerRunning = false;
    stopDrawingTimers();
    updateTimerDisplay();

    $('#drawStatusMsg').textContent = '';
    renderDrawingPlayers();
    renderScoreboard();
  }

  function renderDrawingPlayers() {
    const container = $('#drawPlayersList');
    if (!container) return;

    let activeList = [{ name: State.profile.name, isMe: true }];

    if (State.simulatedCompanionsEnabled) {
      State.virtualFriends.forEach(f => activeList.push({ name: f.name, isMe: false, color: f.color }));
    }

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
    list.innerHTML = entries.map(([name, pts]) => `
      <div class="scoreboard-item">
        <span>${escapeHtml(name)}</span>
        <span class="scoreboard-points">${pts} pts</span>
      </div>
    `).join('');
  }

  function handleUserGuessSubmit(guessText) {
    const cleanGuess = guessText.trim().toUpperCase();
    if (!cleanGuess) return;

    window.sounds && window.sounds.playPop();
    postChatMessage(State.profile.name, guessText, false);

    // Broadcast guess a P2P
    if (State.p2p.connection) {
      sendPeerMessage({ type: 'guess', name: State.profile.name, text: guessText });
    }

    // Verificar si acertó
    if (cleanGuess === State.draw.secretWord.toUpperCase()) {
      handleGuessSuccess(State.profile.name, State.draw.secretWord);
    }
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

    msgEl.textContent = '¡Palabra encadenada con éxito!';
    msgEl.className = 'feedback-msg success';

    const newEntry = {
      word: word.trim(),
      author: State.profile.name,
      time: 'Hace un momento'
    };

    State.words.chain.push(newEntry);
    localStorage.setItem('pb_word_chain', JSON.stringify(State.words.chain));
    State.profile.stats.words++;
    saveProfileStats();

    if (State.p2p.connection) {
      sendPeerMessage({ type: 'word_chain', entry: newEntry });
    }

    window.sounds && window.sounds.playSuccess();
    triggerConfetti();
    toast('¡Dejaste tu jugada asíncrona en el Rincón de Palabras!');

    $('#wordInput').value = '';
    renderWordChain();
  }

  function simulateCompanionWord() {
    if (State.words.chain.length === 0) {
      handleWordSubmit("descanso");
      return;
    }

    const lastWord = State.words.chain[State.words.chain.length - 1].word.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const requiredChar = lastWord.charAt(lastWord.length - 1);

    const dictionary = {
      'a': ["amabilidad", "almuerzo", "armonía", "abrazo"],
      'b': ["bienestar", "buena onda", "brindis"],
      'c': ["cafecito", "compañerismo", "creatividad"],
      'd': ["desconexión", "diversión", "diálogo"],
      'e': ["energía", "entusiasmo", "empatía"],
      'f': ["felicidad", "frescura", "fuerza"],
      'g': ["gratitud", "ganas", "gusto"],
      'h': ["humor", "harmonia", "horizonte"],
      'i': ["inspiración", "ilusión", "ideas"],
      'j': ["juego", "jornada", "júbilo"],
      'l': ["luz", "libertad", "lectura"],
      'm': ["música", "motivación", "mañana"],
      'n': ["naturaleza", "novedad", "nube"],
      'o': ["optimismo", "oxígeno", "organización"],
      'p': ["pausa", "paciencia", "paz"],
      'r': ["risa", "recarga", "respiro"],
      's': ["sonrisa", "salud", "serenidad"],
      't': ["tranquilidad", "té", "tiempo"],
      'u': ["unión", "universo"],
      'v': ["vitalidad", "vida", "viaje"],
      'z': ["zen", "zona libre"]
    };

    const options = dictionary[requiredChar] || ["armonía", "pausa", "sonrisa"];
    const chosenWord = options[Math.floor(Math.random() * options.length)];
    const friend = State.virtualFriends[Math.floor(Math.random() * State.virtualFriends.length)];

    const simulatedEntry = {
      word: chosenWord,
      author: friend.name,
      time: 'Hace un instante'
    };

    State.words.chain.push(simulatedEntry);
    localStorage.setItem('pb_word_chain', JSON.stringify(State.words.chain));
    window.sounds && window.sounds.playPop();
    toast(`🎬 ${friend.name} aportó «${chosenWord}» a la cadena.`);
    renderWordChain();
  }

  // ==========================================
  // 6. TRIVIA RELÁMPAGO (MINIJUEGO 3)
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
    }, 2000);
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
  // 7. EL PASILLO · CAFÉ VIRTUAL (ACTIVIDAD 4)
  // ==========================================
  function renderPasilloScreen() {
    if (State.pasillo.notes.length === 0) {
      State.pasillo.notes = INITIAL_PASILLO_NOTES;
      localStorage.setItem('pb_pasillo_notes', JSON.stringify(State.pasillo.notes));
    }

    const grid = $('#pasilloNotesGrid');
    if (!grid) return;

    grid.innerHTML = State.pasillo.notes.map((note) => {
      const isMe = note.author === State.profile.name;
      return `
        <article class="pasillo-note ${isMe ? 'user' : ''}" data-note-id="${note.id}">
          <div class="pasillo-note-author">
            <div class="avatar sm" style="width:26px;height:26px;--c:${note.color || '#C98B5B'}">
              <span class="avatar-smile"></span>
            </div>
            <span>${escapeHtml(note.author)}</span>
          </div>
          <p class="pasillo-note-text">${escapeHtml(note.text)}</p>
          <div class="pasillo-note-footer">
            <span>${escapeHtml(note.time || 'Reciente')}</span>
            <div class="pasillo-reactions">
              <button type="button" class="pasillo-react-btn" data-react="☕" data-note="${note.id}">☕ ${note.reactions?.['☕'] || 0}</button>
              <button type="button" class="pasillo-react-btn" data-react="🍪" data-note="${note.id}">🍪 ${note.reactions?.['🍪'] || 0}</button>
              <button type="button" class="pasillo-react-btn" data-react="👏" data-note="${note.id}">👏 ${note.reactions?.['👏'] || 0}</button>
            </div>
          </div>
        </article>
      `;
    }).join('');

    grid.scrollTop = grid.scrollHeight;
  }

  function handlePasilloSubmit(text) {
    const clean = text.trim();
    if (!clean) return;

    const newNote = {
      id: Date.now(),
      author: State.profile.name,
      color: State.profile.color,
      text: clean,
      time: 'Hace un instante',
      reactions: { '☕': 1, '🍪': 0, '👏': 0 }
    };

    State.pasillo.notes.push(newNote);
    localStorage.setItem('pb_pasillo_notes', JSON.stringify(State.pasillo.notes));
    State.profile.stats.pasillo = (State.profile.stats.pasillo || 0) + 1;
    saveProfileStats();

    if (State.p2p.connection) {
      sendPeerMessage({ type: 'pasillo_note', note: newNote });
    }

    window.sounds && window.sounds.playPop();
    toast('¡Dejaste tu nota en El Pasillo!');
    $('#pasilloInput').value = '';
    renderPasilloScreen();
  }

  function handlePasilloReaction(noteId, emoji) {
    const note = State.pasillo.notes.find(n => String(n.id) === String(noteId));
    if (!note) return;
    if (!note.reactions) note.reactions = {};
    note.reactions[emoji] = (note.reactions[emoji] || 0) + 1;
    localStorage.setItem('pb_pasillo_notes', JSON.stringify(State.pasillo.notes));
    window.sounds && window.sounds.playClick();
    renderPasilloScreen();
  }

  function simulateCompanionPasilloMessage() {
    const messages = [
      "¡Qué buena pausa! Yo voto por un café con canela hoy ☕",
      "Terminé un bug que me tenía loco toda la mañana, ¡por fin descanso!",
      "Les recomiendo la playlist de Synthwave Chill para programar concentrado.",
      "¿Alguien más aquí toma agua con rodajas de limón entre tareas?"
    ];
    const friend = State.virtualFriends[Math.floor(Math.random() * State.virtualFriends.length)];
    const text = messages[Math.floor(Math.random() * messages.length)];

    const note = {
      id: Date.now(),
      author: friend.name,
      color: friend.color,
      text: text,
      time: 'Hace un momento',
      reactions: { '☕': 2, '🍪': 1, '👏': 3 }
    };

    State.pasillo.notes.push(note);
    localStorage.setItem('pb_pasillo_notes', JSON.stringify(State.pasillo.notes));
    window.sounds && window.sounds.playPop();
    toast(`🎬 ${friend.name} dejó un mensaje en El Pasillo.`);
    renderPasilloScreen();
  }

  // ==========================================
  // 8. MULTIJUGADOR REAL P2P WEBRTC (PEERJS)
  // ==========================================
  function initPeerJS() {
    if (typeof Peer === 'undefined') {
      console.warn('PeerJS library not loaded, running in local/fallback mode');
      return;
    }

    // Comprobar si la URL trae un parámetro de sala: ?sala=XXXX
    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get('sala');
    if (roomParam) {
      setTimeout(() => joinPeerRoom(roomParam.toUpperCase()), 500);
    }
  }

  function createPeerRoom() {
    if (typeof Peer === 'undefined') {
      toast('PeerJS no está disponible en este momento. Usando simulación local.');
      return;
    }

    const code = Math.floor(1000 + Math.random() * 9000);
    const peerId = `playbreak-room-${code}`;
    State.p2p.roomCode = code;
    State.p2p.isHost = true;

    try {
      State.p2p.peer = new Peer(peerId, { debug: 1 });

      State.p2p.peer.on('open', (id) => {
        updateP2PStatus('waiting', `Sala creada: SALA-${code} (Esperando compañero)`);
        
        // Actualizar el enlace para compartir en el modal
        const shareInput = $('#shareRoomInput');
        if (shareInput) {
          const baseUrl = window.location.origin + window.location.pathname;
          shareInput.value = `${baseUrl}?sala=${code}`;
        }
        $('#shareRoomDialog')?.showModal();
        toast(`Sala online creada: SALA-${code}. ¡Comparte el enlace!`);
      });

      State.p2p.peer.on('connection', (conn) => {
        setupPeerConnection(conn);
        toast(`¡Un compañero se unió a tu sala online!`);
      });

      State.p2p.peer.on('error', (err) => {
        console.error('Peer error:', err);
        updateP2PStatus('solo', 'Modo Solitario');
      });
    } catch (e) {
      console.error(e);
    }
  }

  function joinPeerRoom(code) {
    if (typeof Peer === 'undefined') return;
    const cleanCode = code.replace(/[^0-9]/g, '');
    if (!cleanCode) {
      toast('Introduce un código de 4 números válido.');
      return;
    }

    const targetPeerId = `playbreak-room-${cleanCode}`;
    State.p2p.roomCode = cleanCode;
    State.p2p.isHost = false;

    updateP2PStatus('waiting', `Conectando a SALA-${cleanCode}...`);

    try {
      State.p2p.peer = new Peer({ debug: 1 });
      State.p2p.peer.on('open', () => {
        const conn = State.p2p.peer.connect(targetPeerId);
        setupPeerConnection(conn);
      });
      State.p2p.peer.on('error', (err) => {
        updateP2PStatus('solo', 'No se encontró la sala');
        toast('No se pudo conectar a la sala. Verifica el código.');
      });
    } catch (e) {
      console.error(e);
    }
  }

  function setupPeerConnection(conn) {
    State.p2p.connection = conn;

    conn.on('open', () => {
      State.p2p.connected = true;
      updateP2PStatus('connected', `🟢 Conectado en vivo (SALA-${State.p2p.roomCode})`);
      window.sounds && window.sounds.playSuccess();
      toast('¡Conexión P2P en tiempo real establecida!');

      // Enviar saludo
      conn.send({ type: 'hello', name: State.profile.name });
    });

    conn.on('data', (data) => {
      handleRemotePeerData(data);
    });

    conn.on('close', () => {
      State.p2p.connected = false;
      updateP2PStatus('solo', 'Compañero desconectado');
      toast('El compañero se desconectó de la sala.');
    });
  }

  function sendPeerMessage(msg) {
    if (State.p2p.connection && State.p2p.connected) {
      try {
        State.p2p.connection.send(msg);
      } catch (e) {}
    }
  }

  function handleRemotePeerData(data) {
    if (!data) return;

    switch (data.type) {
      case 'draw_down':
        if (!ctx) return;
        ctx.beginPath();
        ctx.moveTo(data.x, data.y);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = data.color || '#3A2E25';
        ctx.lineWidth = data.size || 4;
        ctx.lineTo(data.x + 0.5, data.y);
        ctx.stroke();
        break;

      case 'draw_move':
        if (!ctx) return;
        ctx.lineTo(data.x, data.y);
        ctx.stroke();
        break;

      case 'draw_up':
        if (!ctx) return;
        ctx.closePath();
        break;

      case 'clear':
        clearCanvasSurface(false);
        break;

      case 'guess':
        postChatMessage(data.name, data.text, false);
        window.sounds && window.sounds.playPop();
        break;

      case 'win':
        handleGuessSuccess(data.winnerName, data.word);
        break;

      case 'word_chain':
        State.words.chain.push(data.entry);
        localStorage.setItem('pb_word_chain', JSON.stringify(State.words.chain));
        renderWordChain();
        window.sounds && window.sounds.playDing();
        break;

      case 'pasillo_note':
        State.pasillo.notes.push(data.note);
        localStorage.setItem('pb_pasillo_notes', JSON.stringify(State.pasillo.notes));
        renderPasilloScreen();
        window.sounds && window.sounds.playDing();
        break;
    }
  }

  function updateP2PStatus(status, text) {
    const el = $('#p2pStatusLabel');
    const textEl = $('#p2pStatusText');
    if (!el || !textEl) return;

    el.className = `p2p-status ${status}`;
    textEl.textContent = text;
  }

  // ==========================================
  // 9. MOMENTO POST-PARTIDA ("LA CAFETERÍA")
  // ==========================================
  function renderPostGameScreen() {
    State.profile.stats.breaks++;
    saveProfileStats();

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
  // 10. PERFIL Y PERSONALIZACIÓN ("TU RINCÓN")
  // ==========================================
  const SWATCH_COLORS = ['#C98B5B', '#D96951', '#5B9BC4', '#5F9E82', '#E5A338', '#9B653C', '#7B68EE', '#E06D8C'];
  const AVAILABLE_TAGS = ['Cine', 'Series', 'Videojuegos', 'Música', 'Senderismo', 'Cocina', 'Lectura', 'Fútbol', 'Café', 'Mascotas', 'Fotografía', 'Viajes'];

  function renderProfileScreen() {
    $('#profileNameInput').value = State.profile.name;
    updateProfileAvatarPreview();

    const swatches = $('#colorSwatches');
    swatches.innerHTML = SWATCH_COLORS.map(c => `
      <button type="button" class="swatch-btn ${c === State.profile.color ? 'active' : ''}" 
        style="--c:${c}" data-swatch="${c}" aria-label="Color ${c}"></button>
    `).join('');

    const tagsCloud = $('#profileTagsCloud');
    tagsCloud.innerHTML = AVAILABLE_TAGS.map(t => {
      const active = State.profile.tags.includes(t);
      return `<button type="button" class="tag-btn" data-tag="${t}" aria-pressed="${active}">${escapeHtml(t)}</button>`;
    }).join('');

    $$('input[name="prefModo"]').forEach(radio => {
      radio.checked = radio.value === State.profile.mode;
    });

    $('#statBreaks').textContent = State.profile.stats.breaks;
    $('#statDrawings').textContent = State.profile.stats.drawings;
    $('#statWords').textContent = State.profile.stats.words;
  }

  function updateProfileAvatarPreview() {
    const preview = $('#profileAvatarPreview');
    if (preview) preview.style.setProperty('--c', State.profile.color);
    const sideAv = $('#sidebarUserAvatar');
    if (sideAv) sideAv.style.setProperty('--c', State.profile.color);
    const sideName = $('#sidebarUserName');
    if (sideName) sideName.textContent = State.profile.name;
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
  // 11. CONFETI NATIVO (CANVAS)
  // ==========================================
  function triggerConfetti() {
    const cvs = $('#confettiCanvas');
    if (!cvs) return;
    const c = cvs.getContext('2d');
    cvs.width = window.innerWidth;
    cvs.height = window.innerHeight;

    const colors = ['#7A4E2D', '#D96951', '#5B9BC4', '#5F9E82', '#E5A338', '#FFFFFF'];
    const particles = [];

    for (let i = 0; i < 75; i++) {
      particles.push({
        x: cvs.width / 2 + (Math.random() - 0.5) * 200,
        y: cvs.height / 2 + (Math.random() - 0.5) * 100,
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
      c.clearRect(0, 0, cvs.width, cvs.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.3;
        p.rotation += p.vr;
        p.opacity -= 0.012;

        c.save();
        c.translate(p.x, p.y);
        c.rotate((p.rotation * Math.PI) / 180);
        c.fillStyle = p.color;
        c.globalAlpha = Math.max(p.opacity, 0);
        c.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        c.restore();
      });

      frames++;
      if (frames < 90) {
        requestAnimationFrame(animate);
      } else {
        c.clearRect(0, 0, cvs.width, cvs.height);
      }
    }
    animate();
  }

  // ==========================================
  // 12. MANEJADORES DE EVENTOS
  // ==========================================
  function setupEventListeners() {
    document.addEventListener('click', (e) => {
      const goBtn = e.target.closest('[data-go]');
      if (goBtn) {
        navigateTo(goBtn.dataset.go);
        return;
      }

      const actBtn = e.target.closest('[data-act]');
      if (actBtn) {
        handleAction(actBtn.dataset.act, actBtn);
        return;
      }

      // Reacciones en El Pasillo
      const reactBtn = e.target.closest('[data-react]');
      if (reactBtn) {
        handlePasilloReaction(reactBtn.dataset.note, reactBtn.dataset.react);
        return;
      }

      const colBtn = e.target.closest('[data-draw-color]');
      if (colBtn) {
        State.draw.currentColor = colBtn.dataset.drawColor;
        $$('.color-btn').forEach(b => b.classList.toggle('active', b === colBtn));
        window.sounds && window.sounds.playClick();
        return;
      }

      const brushBtn = e.target.closest('[data-brush-size]');
      if (brushBtn) {
        State.draw.currentLineWidth = parseInt(brushBtn.dataset.brushSize, 10);
        $$('.brush-btn').forEach(b => b.classList.toggle('active', b === brushBtn));
        window.sounds && window.sounds.playClick();
        return;
      }

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

      const swatchBtn = e.target.closest('[data-swatch]');
      if (swatchBtn) {
        State.profile.color = swatchBtn.dataset.swatch;
        $$('.swatch-btn').forEach(b => b.classList.toggle('active', b === swatchBtn));
        updateProfileAvatarPreview();
        window.sounds && window.sounds.playClick();
        return;
      }

      const triviaOpt = e.target.closest('[data-trivia-idx]');
      if (triviaOpt) {
        handleTriviaSelect(parseInt(triviaOpt.dataset.triviaIdx, 10));
        return;
      }
    });

    $('#guessForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = $('#guessInput');
      handleUserGuessSubmit(input.value);
      input.value = '';
    });

    $('#wordForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = $('#wordInput');
      handleWordSubmit(input.value);
    });

    $('#pasilloForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = $('#pasilloInput');
      handlePasilloSubmit(input.value);
    });

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

    $('#toggleSimulatedCompanions')?.addEventListener('change', (e) => {
      State.simulatedCompanionsEnabled = e.target.checked;
      localStorage.setItem('pb_sim_companions', State.simulatedCompanionsEnabled);
      renderDrawingPlayers();
      renderScoreboard();
      toast(State.simulatedCompanionsEnabled ? 
        'Compañeros de prueba activados (Sara, Tomás, Lucía).' : 
        'Modo solo tú activado.');
    });

    $('#themeToggleBtn')?.addEventListener('click', () => {
      State.theme = State.theme === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', State.theme);
      localStorage.setItem('pb_theme', State.theme);
      $('#themeToggleBtn').innerHTML = State.theme === 'light' ? '🌙 Modo Noche' : '☀️ Modo Cálido';
      toast(State.theme === 'light' ? 'Modo Cálido activado.' : 'Modo Café Nocturno activado.');
    });

    $('#soundToggleBtn')?.addEventListener('click', () => {
      const isMuted = window.sounds.toggleMute();
      $('#soundToggleBtn').innerHTML = isMuted ? '🔇 Silenciado' : '🔔 Sonido ON';
      toast(isMuted ? 'Sonidos desactivados.' : 'Sonidos relajantes activados.');
    });
  }

  function handleAction(action, btn) {
    switch (action) {
      case 'clear-canvas':
        clearCanvasSurface(true);
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
        toast(State.draw.mode === 'guess' ? 'Modo adivinar con palabra secreta.' : 'Modo dibujo libre sin puntuación.');
        break;

      case 'toggle-timer-limit':
        const limits = [60, 30, 90, 0];
        const nextIdx = (limits.indexOf(State.draw.timeLimit) + 1) % limits.length;
        State.draw.timeLimit = limits[nextIdx];
        btn.textContent = State.draw.timeLimit === 0 ? 'Tiempo: Libre' : `Tiempo: ${State.draw.timeLimit} s`;
        initDrawingScreen();
        toast(`Tiempo límite: ${State.draw.timeLimit === 0 ? 'Sin límite' : State.draw.timeLimit + ' segundos'}.`);
        break;

      case 'force-bot-guess':
        triggerSimulatedCompanionGuess(4); // Forzar intento
        break;

      case 'create-room':
        createPeerRoom();
        break;

      case 'prompt-join-room':
        $('#joinRoomDialog')?.showModal();
        break;

      case 'confirm-join-room':
        const code = $('#joinRoomCodeInput').value.trim();
        if (code) {
          joinPeerRoom(code);
          $('#joinRoomDialog')?.close();
        }
        break;

      case 'simulate-word':
        simulateCompanionWord();
        break;

      case 'simulate-pasillo-msg':
        simulateCompanionPasilloMessage();
        break;

      case 'save-profile':
        saveProfile();
        break;

      case 'random-icebreaker':
        generateRandomIcebreaker();
        window.sounds && window.sounds.playClick();
        break;

      case 'ghost-exit':
        navigateTo('mapa');
        toast('🌿 Saliste de la sala en silencio. Nadie recibió notificación.');
        break;

      case 'share-room':
        $('#shareRoomDialog')?.showModal();
        break;

      case 'copy-invite-link':
        const link = $('#shareRoomInput')?.value || window.location.href;
        navigator.clipboard?.writeText(link);
        toast('Enlace copiado al portapapeles.');
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
  // 13. INICIALIZACIÓN
  // ==========================================
  function initApp() {
    document.documentElement.setAttribute('data-theme', State.theme);
    const themeBtn = $('#themeToggleBtn');
    if (themeBtn) themeBtn.innerHTML = State.theme === 'light' ? '🌙 Modo Noche' : '☀️ Modo Cálido';

    const soundBtn = $('#soundToggleBtn');
    if (soundBtn && window.sounds) soundBtn.innerHTML = window.sounds.isMuted() ? '🔇 Silenciado' : '🔔 Sonido ON';

    const simToggle = $('#toggleSimulatedCompanions');
    if (simToggle) simToggle.checked = State.simulatedCompanionsEnabled;

    updateProfileAvatarPreview();
    setupEventListeners();
    initPeerJS();

    const initialHash = (location.hash || '').replace('#', '');
    navigateTo(initialHash || 'mapa');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

})();
