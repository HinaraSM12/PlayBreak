/**
 * PlayBreak - Lógica de Aplicación Web Completa (v4.0)
 * - Corrección de loop de victoria P2P (guard estricto contra duplicación)
 * - Prevención de palabras repetidas en Rincón de Palabras
 * - Trivia Relámpago gamificada con 18 preguntas, +100 pts, rachas y medallas
 * - Chat de voz WebRTC real + Síntesis de voz para compañeros virtuales
 * - Perfil interactivo con impacto real (preguntas por gustos, niveles y logros)
 * - Multijugador WebRTC P2P (PeerJS) y 4 Actividades Lúdicas
 */

(function () {
  'use strict';

  // ==========================================
  // 1. ESTADO GLOBAL DE LA APLICACIÓN
  // ==========================================
  const State = {
    currentScreen: 'mapa',
    theme: localStorage.getItem('pb_theme') || 'light',
    tabId: 'tab_' + Math.random().toString(36).substring(2, 9),
    
    // Perfil del Usuario y Logros
    profile: {
      name: localStorage.getItem('pb_name') || 'Tú',
      color: localStorage.getItem('pb_color') || '#5F9E82',
      tags: JSON.parse(localStorage.getItem('pb_tags') || '["Cine", "Café", "Música"]'),
      mode: localStorage.getItem('pb_mode') || 'texto',
      stats: JSON.parse(localStorage.getItem('pb_stats') || '{"breaks": 0, "drawings": 0, "words": 0, "pasillo": 0, "triviaScore": 0}'),
      achievements: JSON.parse(localStorage.getItem('pb_achievements') || '{"picasso": false, "wordsmith": false, "trivia": false, "pasillo": false}')
    },

    // Estado del Salón Espacial y Avatar
    room: {
      view: localStorage.getItem('pb_room_view') || 'spatial',
      avatarX: 50,
      avatarY: 50,
      isWalking: false,
      selectedStation: null,
      peer: {
        connected: false,
        name: 'Compañero',
        color: '#B79CE0',
        x: 38,
        y: 48,
        station: null,
        tabId: null,
        lastSeen: null
      }
    },

    // Modo Compañeros Virtuales
    simulatedCompanionsEnabled: localStorage.getItem('pb_sim_companions') !== 'false',
    virtualFriends: [
      { id: 'f1', name: 'Sara', color: '#B79CE0', active: true, points: 0 },
      { id: 'f2', name: 'Tomás', color: '#7CC4A4', active: true, points: 0 },
      { id: 'f3', name: 'Lucía', color: '#F6C85F', active: true, points: 0 }
    ],

    // Estado de la Mesa de Dibujo
    draw: {
      mode: 'guess', // 'guess' | 'free'
      role: 'drawer', // 'drawer' | 'guesser'
      topicIndex: 0,
      secretWord: 'GATO',
      hint: 'Mascota peluda de cuatro patas',
      timeLimit: 60,
      timeLeft: 60,
      timerRunning: false,
      roundWon: false, // Guardia estricta contra loops
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

    // Estado de Trivia Relámpago Gamificada
    trivia: {
      currentQuestionIndex: 0,
      score: 0,
      streak: 0,
      roundQuestions: [],
      timer: 15,
      timerInterval: null,
      active: false
    },

    // Estado de El Pasillo (Café Virtual)
    pasillo: {
      topic: "«¿Cuál es tu canción o sonido infalible para concentrarte teletrabajando?»",
      notes: JSON.parse(localStorage.getItem('pb_pasillo_notes') || '[]')
    },

    // Chat de Voz en La Cafetería
    voice: {
      enabled: false,
      isMuted: false,
      localStream: null,
      activeCall: null,
      isSpeaking: false
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

  // Banco expandido de 50 palabras para adivinar con pistas temáticas
  const WORD_BANK = [
    { word: "GATO", hint: "Mascota peluda que ronronea y caza ratones" },
    { word: "PIZZA", hint: "Comida italiana con queso y masa al horno" },
    { word: "BICICLETA", hint: "Vehículo ecológico de dos ruedas y pedales" },
    { word: "GUITARRA", hint: "Instrumento musical con cuerdas y caja de madera" },
    { word: "MONTAÑA", hint: "Gran elevación natural del terreno" },
    { word: "RELOJ", hint: "Aparato que marca las horas y minutos" },
    { word: "CAFÉ", hint: "Bebida caliente matutina favorita en la oficina" },
    { word: "ÁRBOL", hint: "Planta con tronco de madera, ramas y hojas" },
    { word: "LUNA", hint: "Satélite natural que ilumina el cielo de noche" },
    { word: "AVIÓN", hint: "Medio de transporte con alas que vuela alto" },
    { word: "TECLADO", hint: "Periférico con letras y números para escribir en la PC" },
    { word: "AURICULARES", hint: "Accesorio para escuchar música en privado" },
    { word: "PERRO", hint: "El mejor amigo del ser humano, ladra y mueve la cola" },
    { word: "HAMBURGUESA", hint: "Comida con pan, carne, queso y lechuga" },
    { word: "HELADO", hint: "Postre frío y dulce servido en cono" },
    { word: "COHETE", hint: "Vehículo espacial propulsado que viaja a las estrellas" },
    { word: "PLAYA", hint: "Lugar con arena dorada, mar, sol y olas" },
    { word: "CACTUS", hint: "Planta del desierto con espinas que almacena agua" },
    { word: "TAZA", hint: "Recipiente con asa para tomar té o café caliente" },
    { word: "PINGÜINO", hint: "Ave marina vestida de esmoquin que no vuela" },
    { word: "SOMBRILLA", hint: "Objeto que nos protege del sol o de la lluvia" },
    { word: "LÁMPARA", hint: "Artefacto que da luz en el escritorio de noche" },
    { word: "MOCHILA", hint: "Bolso con correas que se lleva en la espalda" },
    { word: "ROBOT", hint: "Máquina programable de metal con circuitos" },
    { word: "VOLCÁN", hint: "Montaña que expulsa lava y ceniza caliente" },
    { word: "FUEGO", hint: "Llama que calienta, ilumina y cocina" },
    { word: "ESTRELLA", hint: "Cuerpo celeste brillante con cinco puntas en dibujos" },
    { word: "CORAZÓN", hint: "Órgano que late y símbolo universal de afecto" },
    { word: "DELFÍN", hint: "Mamífero acuático muy inteligente y amigable" },
    { word: "DONA", hint: "Pan dulce circular con un agujero en el centro" },
    { word: "CHOCOLATE", hint: "Golosina dulce elaborada a base de cacao" },
    { word: "CASTILLO", hint: "Fortaleza medieval con murallas y torres altas" },
    { word: "PUERTA", hint: "Abertura con pomo para entrar o salir de una sala" },
    { word: "SILLA", hint: "Mueble ergonómico de oficina para sentarse a trabajar" },
    { word: "CÁMARA", hint: "Dispositivo que captura fotos y videollamadas" },
    { word: "TELÉFONO", hint: "Aparato móvil con pantalla táctil para comunicarse" },
    { word: "LIBRO", hint: "Conjunto de páginas encuadernadas para leer" },
    { word: "PINCEL", hint: "Herramienta con cerdas para aplicar pintura" },
    { word: "MANZANA", hint: "Fruta crujiente, roja o verde, muy saludable" },
    { word: "GAFAS", hint: "Lentes para mejorar la vista o protegerse del sol" },
    { word: "FANTASMA", hint: "Aparición blanca de sábana que dice ¡buu!" },
    { word: "BARCO", hint: "Embarcación flotante que navega sobre el agua" },
    { word: "ISLA", hint: "Porción de tierra rodeada de agua con palmeras" },
    { word: "MICRÓFONO", hint: "Dispositivo para hablar en reuniones virtuales" },
    { word: "SOL", hint: "Estrella gigante que da luz y calor a la Tierra" },
    { word: "CASA", hint: "Hogar acogedor con techo, paredes y ventanas" },
    { word: "SUBMARINO", hint: "Nave acuática que navega por las profundidades" },
    { word: "TREN", hint: "Transporte con vagones que viaja sobre rieles" },
    { word: "FLOR", hint: "Parte colorida de las plantas con pétalos y perfume" },
    { word: "NUBE", hint: "Masa blanca de vapor flotando en el cielo azul" }
  ];

  // Banco de 18 preguntas gamificadas para Trivia Relámpago
  const TRIVIA_BANK = [
    {
      cat: "☕ Hábitos de Café",
      q: "¿Cuál es el mejor momento biológico para tomar café y evitar el choque de cortisol?",
      options: ["Apenas abres los ojos (6:00 AM)", "Entre las 9:30 AM y las 11:30 AM", "Justo antes de almorzar (12:30 PM)", "A las 10:00 PM"],
      correct: 1,
      fact: "¡Exacto! El cortisol matutino alcanza su pico al despertar; esperar a media mañana maximiza la energía."
    },
    {
      cat: "💻 Vida Remota",
      q: "¿Cuál es la regla de oro 20-20-20 recomendada por optometristas para descansar los ojos?",
      options: ["Cada 20 min, mirar a 20 pies (6m) por 20 segundos", "Trabajar 20 min y dormir 20 min a 20°C", "Tomar 20 sorbos de agua cada 20 minutos", "Bajar el brillo de la pantalla un 20%"],
      correct: 0,
      fact: "¡Así es! La regla 20-20-20 relaja el músculo ciliar y previene la fatiga visual informática."
    },
    {
      cat: "🎵 Música & Foco",
      q: "¿Qué tipo de sonido ha demostrado mejorar la concentración al enmascarar ruidos molestos?",
      options: ["Heavy metal a máximo volumen", "Ruido marrón o lluvia constante", "Noticias de televisión de fondo", "Silencio absoluto de cámara anecoica"],
      correct: 1,
      fact: "¡Correcto! El ruido marrón tiene frecuencias graves suaves que calman la mente y bloquean distracciones."
    },
    {
      cat: "🎬 Cultura Pop",
      q: "En la serie 'The Office', ¿qué objeto pone Jim en gelatina como broma a Dwight?",
      options: ["Su grapadora", "Su taza de café", "El mouse de su computador", "Su teléfono"],
      correct: 0,
      fact: "¡Clásico! La grapadora en gelatina amarilla es una de las bromas más icónicas de la televisión."
    },
    {
      cat: "🧠 Psicología de Pausas",
      q: "¿Cuánto tiempo dura una micro-pausa óptima para reiniciar la atención según estudios ergonómicos?",
      options: ["Entre 2 y 5 minutos", "Exactamente 45 minutos", "30 segundos", "3 horas"],
      correct: 0,
      fact: "¡Brillante! Micro-pausas de 3 a 5 minutos reducen la fatiga acumulada en más de un 40%."
    },
    {
      cat: "🌍 Curiosidades",
      q: "¿En qué país se originó la tradición del 'Fika' (pausa sagrada diaria para café y charla con colegas)?",
      options: ["Italia", "Suecia", "Colombia", "Japón"],
      correct: 1,
      fact: "¡Cierto! En Suecia el 'Fika' es una institución social fundamental para la cohesión de equipos."
    },
    {
      cat: "☕ Hábitos de Café",
      q: "Si necesitas descafeinar naturalmente tu rutina por la tarde, ¿cuál es una infusión relajante ideal?",
      options: ["Espresso doble", "Manzanilla con lavanda o rooibos", "Bebida energética", "Té negro concentrado"],
      correct: 1,
      fact: "¡Excelente! El rooibos no tiene cafeína y es rico en antioxidantes para las tardes."
    },
    {
      cat: "💻 Vida Remota",
      q: "¿Qué porcentaje de la comunicación humana depende de señales no verbales y tono de voz?",
      options: ["Solo el 10%", "Alrededor del 70% al 90%", "Exactamente el 100%", "El 30%"],
      correct: 1,
      fact: "¡Exacto! Por eso los chats de solo texto a veces se sienten fríos; PlayBreak aporta calidez lúdica."
    },
    {
      cat: "🎮 Videojuegos",
      q: "¿Qué videojuego acogedor de gestión de islas se volvió un fenómeno global de teletrabajo en 2020?",
      options: ["Call of Duty", "Animal Crossing: New Horizons", "Doom Eternal", "FIFA 20"],
      correct: 1,
      fact: "¡Animal Crossing! Miles de equipos de trabajo incluso celebraron reuniones virtuales en sus islas."
    },
    {
      cat: "🌱 Bienestar",
      q: "¿Qué postura física simple ayuda a contrarrestar la joroba de computador al terminar una tarea?",
      options: ["Abrir el pecho y juntar los omóplatos hacia atrás", "Inclinarse más hacia la pantalla", "Cruzar las piernas fuertemente", "Mirar al teclado fijo"],
      correct: 0,
      fact: "¡Muy bien! Abrir el pecho durante 15 segundos alivia la tensión del cuello y trapecio."
    }
  ];

  // Preguntas rompehielos personalizadas por tags del perfil
  const ICEBREAKER_BY_TAG = {
    'Cine': [
      "¿Cuál es esa película o serie que podrías ver diez veces sin aburrirte?",
      "Si hicieran una película de tu equipo de trabajo, ¿qué actor te interpretaría?",
      "¿Cuál es el mejor final de película que has visto?"
    ],
    'Música': [
      "¿Qué álbum o canción te saca de un bloqueo mental cuando estás programando o trabajando?",
      "¿Cuál fue el último concierto o toque al que fuiste?",
      "¿Cuál es tu gusto musical culposo que pocos conocen?"
    ],
    'Café': [
      "¿Cómo preparas tu café o bebida ideal por la mañana?",
      "¿Team café filtrado artesanal o espresso fuerte?",
      "¿Cuál es el mejor acompañamiento para un café a media tarde?"
    ],
    'Videojuegos': [
      "¿Cuál es el videojuego que más horas de tu vida te ha atrapado?",
      "Si pudieras vivir dentro del universo de un juego, ¿cuál elegirías?",
      "¿Prefieres juegos cooperativos tranquilos o competitivos intensos?"
    ],
    'Senderismo': [
      "¿Cuál es el paisaje natural más impresionante que has visto en persona?",
      "¿Prefieres montaña con niebla o playa con brisa?",
      "¿Qué sendero o caminata sueñas con hacer algún día?"
    ],
    'Cocina': [
      "¿Cuál es tu plato estrella cuando te toca cocinar para otros?",
      "¿Cuál es la comida que instantáneamente te arregla un mal día?",
      "¿Dulce o salado para una pausa de media tarde?"
    ],
    'Lectura': [
      "¿Qué libro recomendarías a ojos cerrados a cualquier persona?",
      "¿Prefieres libros físicos con olor a papel o Kindle/digital?",
      "¿Qué libro te cambió la perspectiva de alguna cosa?"
    ],
    'Mascotas': [
      "Si tienes mascota, ¿cuál es la travesura más graciosa que ha hecho durante una videollamada?",
      "¿Eres team perros, team gatos o team plantas?",
      "Si tu mascota pudiera hablar 1 minuto, ¿qué crees que te diría?"
    ]
  };

  const DEFAULT_ICEBREAKERS = [
    "¿Qué fue lo más divertido o desafiante del dibujo?",
    "¿Cuál es tu estrategia infalible para desconectar la mente?",
    "Si pudieras teletransportarte a cualquier lugar en tu almuerzo, ¿dónde irías?",
    "¿Qué comida te alegra instantáneamente el día?",
    "¿Cuál ha sido la anécdota más curiosa que te ha pasado en teletrabajo?"
  ];

  // Notas iniciales para El Pasillo con hilos de conversación
  const INITIAL_PASILLO_NOTES = [
    {
      id: 1,
      author: "Sara",
      color: "#B79CE0",
      text: "¡Lofi hip hop beats de fondo siempre! Me ayuda un montón a escribir código.",
      time: "Hace 10 min",
      reactions: { "☕": 4, "🍪": 0, "👏": 1 },
      replies: [
        { id: 101, author: "Tomás", color: "#7CC4A4", text: "¡Totalmente! Las playlists de ChilledCow son clásicos.", time: "Hace 8 min" }
      ]
    },
    {
      id: 2,
      author: "Tomás",
      color: "#7CC4A4",
      text: "Sonido de lluvia en bosque con audífonos. Siento que estoy en una cabaña.",
      time: "Hace 25 min",
      reactions: { "☕": 2, "🍪": 4, "👏": 0 },
      replies: [
        { id: 102, author: "Sara", color: "#B79CE0", text: "¡Qué rico ambiente! Con una taza de té caliente queda perfecto ☕", time: "Hace 18 min" }
      ]
    }
  ];

  // ==========================================
  // 2. UTILIDADES DOM Y NOTIFICACIONES
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

  function checkAndUnlockAchievement(key) {
    if (!State.profile.achievements[key]) {
      State.profile.achievements[key] = true;
      localStorage.setItem('pb_achievements', JSON.stringify(State.profile.achievements));
      const names = {
        picasso: "🎨 ¡Logro Desbloqueado: Picasso del Break!",
        wordsmith: "🔤 ¡Logro Desbloqueado: Diccionario Ágil!",
        trivia: "⚡ ¡Logro Desbloqueado: Mente Brillante!",
        pasillo: "💬 ¡Logro Desbloqueado: Alma del Pasillo!"
      };
      toast(names[key] || "🏆 ¡Nuevo Logro Desbloqueado!");
      window.sounds && window.sounds.playSuccess();
      triggerConfetti();
      renderProfileScreen();
    }
  }

  // ==========================================
  // 3. ENRUTAMIENTO Y PANTALLAS
  // ==========================================
  function navigateTo(screenId) {
    if (!$(`#screen-${screenId}`)) screenId = 'mapa';

    if (State.currentScreen === 'dibujo' && screenId !== 'dibujo') {
      stopDrawingTimers();
    }

    State.currentScreen = screenId;

    $$('.screen-view').forEach(view => {
      view.classList.toggle('active', view.id === `screen-${screenId}`);
    });

    $$('.nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.go === screenId);
    });

    $$('.proto-pill').forEach(pill => {
      pill.classList.toggle('active', pill.dataset.go === screenId);
    });

    window.sounds && window.sounds.playClick();

    if (screenId === 'mapa') {
      State.room.selectedStation = null;
      sendPeerMessage({ type: 'peer_station', stationKey: null, stationTitle: null });
      updateRoomClock();
      updateRoomPresence();
      updateProfileAvatarPreview();
    } else {
      const stationMap = {
        dibujo: 'Mesa de Dibujo',
        turnos: 'Rincón de Palabras',
        trivia: 'Rincón de Trivia',
        pasillo: 'El Pasillo (Café)'
      };
      if (stationMap[screenId]) {
        State.room.selectedStation = screenId;
        sendPeerMessage({ type: 'peer_station', stationKey: screenId, stationTitle: stationMap[screenId] });
      }
    }
    if (screenId === 'dibujo') initDrawingScreen();
    if (screenId === 'turnos') renderWordChain();
    if (screenId === 'trivia') initTriviaScreen();
    if (screenId === 'pasillo') renderPasilloScreen();
    if (screenId === 'fin') renderPostGameScreen();
    if (screenId === 'perfil') renderProfileScreen();

    // Resaltar rincón recomendado en la Sala según modo del perfil
    updateRecommendedRoomBadge();

    try {
      history.replaceState(null, '', `#${screenId}`);
    } catch (e) {}

    const viewport = $('.viewport');
    if (viewport) viewport.scrollTop = 0;
  }

  function updateRecommendedRoomBadge() {
    const wordCard = $('.room-card.async');
    if (!wordCard) return;
    const oldBadge = $('#recommendedBadge');
    if (oldBadge) oldBadge.remove();

    if (State.profile.mode === 'turnos') {
      const badge = document.createElement('span');
      badge.id = 'recommendedBadge';
      badge.className = 'status-pill';
      badge.style.cssText = 'background:#FEF7E6;color:#8A5D12;font-size:11px;margin-bottom:6px';
      badge.innerHTML = '⭐ Recomendado según tu perfil';
      wordCard.insertBefore(badge, wordCard.children[1]);
    }
  }

  // ==========================================
  // 3.1. SALÓN VIRTUAL ESPACIAL & AVATAR INTERACTIVO
  // ==========================================
  const STATIONS_DATA = {
    trivia: {
      key: 'trivia',
      title: 'Rincón de Trivia',
      icon: '⚡',
      typeBadge: 'Rompehielos Rápido · 45s',
      desc: '5 preguntas rápidas y entretenidas sobre hábitos de café, vida remota, música y bienestar. Gana medallas de aciertos sin rankings estresantes.',
      duration: '45 segundos',
      philosophy: 'Sin presiones ni competencia tóxica',
      targetX: 30,
      targetY: 34,
      participants: [
        { name: 'Lucía', tag: 'En trivia', color: '#F6C85F', status: 'Ronda activa' },
        { name: 'Tomás', tag: 'Con café', color: '#7CC4A4', status: 'Terminó hace 2 min' }
      ]
    },
    dibujo: {
      key: 'dibujo',
      title: 'Mesa de Dibujo',
      icon: '🎨',
      typeBadge: 'En vivo · Sincrónico',
      desc: 'Lienzo interactivo en tiempo real donde trazas ideas con paleta de colores mientras tus compañeros adivinan la palabra en el chat.',
      duration: 'Ronda de 1 min',
      philosophy: 'Creatividad lúdica y colaborativa',
      targetX: 70,
      targetY: 34,
      participants: [
        { name: 'Sara', tag: 'Dibujando', color: '#B79CE0', status: 'Con pincel' },
        { name: 'Juan', tag: 'Adivinando', color: '#C98B5B', status: 'En el chat' },
        { name: 'Lucía', tag: 'Presente', color: '#F6C85F', status: 'Observando' }
      ]
    },
    pasillo: {
      key: 'pasillo',
      title: 'El Pasillo (Café Virtual)',
      icon: '💬',
      typeBadge: 'Charla Informal · Baja Fricción',
      desc: 'Encuentros espontáneos junto a la máquina de café. Comparte notas, responde al tema del día o escribe respuestas en hilos con compañeros.',
      duration: 'Flexible · 2 a 5 min',
      philosophy: 'Sin reuniones forzadas',
      targetX: 30,
      targetY: 66,
      participants: [
        { name: 'Tomás', tag: 'Café latte', color: '#7CC4A4', status: 'Tomando café' },
        { name: 'Sara', tag: 'Descansando', color: '#B79CE0', status: 'Dejó nota' }
      ]
    },
    turnos: {
      key: 'turnos',
      title: 'Rincón de Palabras',
      icon: '🔤',
      typeBadge: 'Por turnos · Asincrónico',
      desc: 'Cadena de palabras encadenadas donde la última sílaba inicia el turno siguiente. Aporta cuando tengas un minuto libre en tu jornada.',
      duration: 'Asincrónico (a tu ritmo)',
      philosophy: 'Cero interrupciones de foco',
      targetX: 70,
      targetY: 66,
      participants: [
        { name: 'Tomás', tag: 'Aportó ayer', color: '#7CC4A4', status: 'Dejó palabra' },
        { name: 'Sara', tag: 'Cadena activa', color: '#B79CE0', status: 'Esperando tu turno' }
      ]
    }
  };

  function walkAvatarTo(targetX, targetY, callback) {
    const avatar = $('#roomMyAvatar');
    if (!avatar) {
      if (typeof callback === 'function') callback();
      return;
    }

    // Limitar coordenadas dentro de la alfombra visual
    const clampedX = Math.max(18, Math.min(82, targetX));
    const clampedY = Math.max(22, Math.min(78, targetY));

    // Determinar orientación de la mirada
    if (clampedX < State.room.avatarX - 2) {
      avatar.classList.add('facing-left');
    } else if (clampedX > State.room.avatarX + 2) {
      avatar.classList.remove('facing-left');
    }

    // Efecto de onda en el piso
    triggerFloorRipple(clampedX, clampedY);

    // Activar animación de caminado
    avatar.classList.remove('arrived');
    avatar.classList.add('walking');
    State.room.isWalking = true;
    window.sounds && window.sounds.playPop();

    avatar.style.left = `${clampedX}%`;
    avatar.style.top = `${clampedY}%`;

    State.room.avatarX = clampedX;
    State.room.avatarY = clampedY;

    sendPeerMessage({ type: 'peer_walk', x: clampedX, y: clampedY });

    clearTimeout(avatar._walkTimer);
    avatar._walkTimer = setTimeout(() => {
      avatar.classList.remove('walking');
      avatar.classList.add('arrived');
      State.room.isWalking = false;

      setTimeout(() => {
        avatar.classList.remove('arrived');
      }, 350);

      if (typeof callback === 'function') {
        callback();
      }
    }, 650);
  }

  function triggerFloorRipple(xPercent, yPercent) {
    const ripple = $('#roomClickRipple');
    if (!ripple) return;
    ripple.style.left = `${xPercent}%`;
    ripple.style.top = `${yPercent}%`;
    ripple.hidden = false;
    ripple.classList.remove('room-click-ripple');
    void ripple.offsetWidth;
    ripple.classList.add('room-click-ripple');
    clearTimeout(ripple._timer);
    ripple._timer = setTimeout(() => {
      ripple.hidden = true;
    }, 550);
  }

  function handleStationClick(stationKey) {
    const station = STATIONS_DATA[stationKey];
    if (!station) return;

    State.room.selectedStation = stationKey;
    sendPeerMessage({ type: 'peer_station', stationKey, stationTitle: station.title });
    walkAvatarTo(station.targetX, station.targetY, () => {
      openStationModal(stationKey);
    });
  }

  function openStationModal(stationKey) {
    const station = STATIONS_DATA[stationKey];
    if (!station) return;

    const modal = $('#stationPreviewModal');
    if (!modal) return;

    $('#stationModalIcon').textContent = station.icon;
    $('#stationModalTypeBadge').textContent = station.typeBadge;
    $('#stationModalTitle').textContent = station.title;
    $('#stationModalDesc').textContent = station.desc;
    $('#stationModalDuration').textContent = station.duration;
    $('#stationModalPhilosophy').textContent = station.philosophy;

    const listEl = $('#stationModalParticipantsList');
    if (listEl) {
      let participants = [...station.participants];
      if (!State.simulatedCompanionsEnabled) {
        participants = [{ name: 'Mesa lista', tag: 'Espacio libre', color: '#888', status: 'Esperando que entres' }];
      }

      listEl.innerHTML = participants.map(p => `
        <div class="station-participant-card">
          <div class="avatar sm" style="width:24px;height:24px;--c:${p.color}">
            <span class="avatar-smile"></span>
          </div>
          <div style="flex:1">
            <b>${escapeHtml(p.name)}</b>
            <span style="font-size:11.5px;color:var(--soft);margin-left:6px">${escapeHtml(p.tag)}</span>
          </div>
          <span class="status-pill sm" style="font-size:11px">${escapeHtml(p.status)}</span>
        </div>
      `).join('');
    }

    const enterBtn = $('#stationModalEnterBtn');
    if (enterBtn) {
      enterBtn.onclick = () => {
        modal.close();
        navigateTo(station.key);
      };
    }

    modal.showModal();
    window.sounds && window.sounds.playDing();
  }

  function handleFloorClick(e) {
    if (e.target.closest('.station-booth') || e.target.closest('.room-user-avatar') || e.target.closest('button')) {
      return;
    }

    const floor = $('#roomFloorCanvas');
    if (!floor) return;

    const rect = floor.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    walkAvatarTo(x, y);
  }

  function setRoomView(mode) {
    State.room.view = mode;
    localStorage.setItem('pb_room_view', mode);

    const spatialView = $('#spatialRoomView');
    const gridView = $('#gridRoomsView');
    const btnSpatial = $('#btnViewSpatial');
    const btnGrid = $('#btnViewGrid');

    if (btnSpatial) btnSpatial.classList.toggle('active', mode === 'spatial');
    if (btnGrid) btnGrid.classList.toggle('active', mode === 'grid');

    if (spatialView) spatialView.hidden = (mode !== 'spatial');
    if (gridView) gridView.hidden = (mode !== 'grid');

    window.sounds && window.sounds.playClick();
  }

  function updateRoomClock() {
    const clockBadge = $('#roomClockBadge');
    if (!clockBadge) return;

    const now = new Date();
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const dayName = days[now.getDay()];
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'p. m.' : 'a. m.';
    hours = hours % 12 || 12;

    clockBadge.textContent = `${dayName}, ${hours}:${minutes} ${ampm}`;
  }

  function updateRoomPresence() {
    const colleaguesLayer = $('#roomColleaguesLayer');
    const presenceBadge = $('#roomPresenceBadge');
    const peerAvatar = $('#roomPeerAvatar');
    const peerNameEl = $('#roomPeerAvatarName');
    const peerStatusEl = $('#roomPeerAvatarStatus');

    // Los compañeros en la sala siempre visibles para mantener ambiente vivo
    if (colleaguesLayer) {
      colleaguesLayer.hidden = false;
    }

    if (State.room.peer.connected) {
      if (peerAvatar) {
        peerAvatar.hidden = false;
        peerAvatar.style.setProperty('--c', State.room.peer.color);
        peerAvatar.style.left = `${State.room.peer.x}%`;
        peerAvatar.style.top = `${State.room.peer.y}%`;
      }
      if (peerNameEl) peerNameEl.textContent = State.room.peer.name;
      if (peerStatusEl) peerStatusEl.textContent = State.room.peer.station ? `En ${State.room.peer.station}` : 'En descanso';
      
      if (presenceBadge) {
        presenceBadge.innerHTML = `🟢 2 compañeros en la sala (En vivo con ${State.room.peer.name})`;
        presenceBadge.style.background = 'rgba(95, 158, 130, 0.2)';
        presenceBadge.style.borderColor = 'var(--accent)';
      }
    } else {
      if (peerAvatar) peerAvatar.hidden = true;
      if (presenceBadge) {
        presenceBadge.style.background = '';
        presenceBadge.style.borderColor = '';
        if (State.simulatedCompanionsEnabled) {
          presenceBadge.innerHTML = `🟢 <span id="roomOnlineCount">4</span> compañeros en la sala`;
        } else {
          presenceBadge.innerHTML = `🟢 1 en la sala (Tú)`;
        }
      }
    }

    $$('.booth-avatars').forEach(box => {
      box.style.display = 'flex';
    });
  }

  function stopDrawingTimers() {
    clearInterval(State.draw.timerInterval);
    clearInterval(State.draw.botGuessInterval);
    State.draw.timerRunning = false;
  }

  // ==========================================
  // 4. MESA DE DIBUJO (CANVAS & P2P CORREGIDO)
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

    clearCanvasSurface(false);

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

    if (broadcast) {
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
    if (State.draw.gameOver || State.draw.role !== 'drawer') return;
    canvas.setPointerCapture(e.pointerId);
    State.draw.drawing = true;
    
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

    sendPeerMessage({
      type: 'draw_down',
      x, y,
      color: State.draw.currentColor,
      size: State.draw.currentLineWidth
    });

    window.sounds && window.sounds.playClick();
  }

  function handlePointerMove(e) {
    if (!State.draw.drawing || State.draw.gameOver) return;
    const { x, y } = getCanvasCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();

    sendPeerMessage({ type: 'draw_move', x, y });
  }

  function handlePointerUp() {
    if (!State.draw.drawing) return;
    State.draw.drawing = false;
    ctx.closePath();
    saveCanvasState();

    sendPeerMessage({ type: 'draw_up' });
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
        stopDrawingTimers();
        State.draw.gameOver = true;
        window.sounds && window.sounds.playDing();
        $('#drawStatusMsg').textContent = '¡Se acabó el tiempo! Toca «Terminar ronda y charlar».';
        $('#drawStatusMsg').className = 'feedback-msg error';
      }
    }, 1000);

    startActiveBotGuessingLoop();
  }

  function startActiveBotGuessingLoop() {
    clearInterval(State.draw.botGuessInterval);
    if (!State.simulatedCompanionsEnabled || State.draw.mode !== 'guess') return;

    let tickCount = 0;
    State.draw.botGuessInterval = setInterval(() => {
      if (State.draw.gameOver || !State.draw.timerRunning || State.draw.roundWon) {
        clearInterval(State.draw.botGuessInterval);
        return;
      }
      tickCount++;
      triggerSimulatedCompanionGuess(tickCount);
    }, 5000);
  }

  function triggerSimulatedCompanionGuess(tick = 1) {
    if (State.draw.gameOver || State.draw.roundWon) return;

    const friends = State.virtualFriends;
    const friend = friends[Math.floor(Math.random() * friends.length)];
    const word = State.draw.secretWord;

    const closeGuesses = {
      'GATO': ["¿Es un perro?", "¿Un conejo?", "¿Tiene orejas?", "¿Un tigre pequeño?", "¿Un animal doméstico?", "¡Parece un felino!"],
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
    const shouldWin = tick >= 4 || (State.draw.timeLeft <= 22 && State.draw.timeLeft > 8);

    if (shouldWin) {
      clearInterval(State.draw.botGuessInterval);
      executeRoundWin(friend.name, word, true);
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

  // --- SOLUCIÓN DEL BUG DE PUNTOS INFINITOS P2P ---
  function executeRoundWin(winnerName, word, broadcast = true) {
    // GUARD ESTRICTO: Si la ronda ya fue ganada, salir de inmediato sin sumar más puntos
    if (State.draw.roundWon) return;
    State.draw.roundWon = true;
    State.draw.gameOver = true;
    stopDrawingTimers();

    // Sumar exactamente 10 puntos una sola vez
    State.draw.scores[winnerName] = (State.draw.scores[winnerName] || 0) + 10;
    renderScoreboard();

    // Mensaje de victoria único en chat
    const chatBox = $('#guessMessages');
    const winMsg = document.createElement('div');
    winMsg.className = 'guess-msg correct';
    winMsg.innerHTML = `🏆 <b>${escapeHtml(winnerName)}</b> adivinó la palabra: <b>${escapeHtml(word)}</b> (+10 pts)`;
    chatBox.appendChild(winMsg);
    chatBox.scrollTop = chatBox.scrollHeight;

    // Desbloquear logro si el usuario ganó
    if (winnerName === State.profile.name) {
      checkAndUnlockAchievement('picasso');
      State.profile.stats.drawings++;
      saveProfileStats();
    }

    triggerConfetti();
    window.sounds && window.sounds.playSuccess();
    toast(`¡${winnerName} adivinó la palabra «${word}»! (+10 pts)`);

    $('#drawStatusMsg').textContent = `¡Ronda ganada por ${winnerName}! Toca «Cambiar palabra» para otra ronda o «Terminar ronda y charlar».`;
    $('#drawStatusMsg').className = 'feedback-msg success';

    // Broadcast a compañero P2P cortando el loop (el receptor no volverá a hacer broadcast)
    if (broadcast) {
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
    State.draw.roundWon = false; // Reset limpio para nueva ronda
    State.draw.timeLeft = State.draw.timeLimit;
    State.draw.timerRunning = false;
    stopDrawingTimers();
    updateTimerDisplay();

    $('#drawStatusMsg').textContent = '';
    updateDrawRoleUI();
    renderDrawingPlayers();
    renderScoreboard();
  }

  function toggleDrawRole() {
    State.draw.role = State.draw.role === 'drawer' ? 'guesser' : 'drawer';
    updateDrawRoleUI();
    sendPeerMessage({
      type: 'draw_role',
      role: State.draw.role === 'drawer' ? 'guesser' : 'drawer',
      word: State.draw.secretWord,
      hint: State.draw.hint
    });
    window.sounds && window.sounds.playClick();
    toast(State.draw.role === 'drawer' ? '🎨 Ahora eres el Dibujante. ¡Toma el pincel!' : '🔍 Ahora eres Adivinador. ¡Mira el lienzo e intenta adivinar!');
  }

  function updateDrawRoleUI() {
    const isDrawer = State.draw.role === 'drawer';
    const roleBtn = $('#toggleDrawRoleBtn');
    if (roleBtn) roleBtn.textContent = isDrawer ? '🎨 Rol: Dibujante' : '🔍 Rol: Adivinador';

    const banner = $('#drawRoleBanner');
    if (banner) banner.style.display = isDrawer ? 'none' : 'block';

    const toolbar = $('#drawingToolbar');
    if (toolbar) toolbar.style.display = isDrawer ? 'flex' : 'none';

    const nextWordBtn = $('#btnNextWord');
    if (nextWordBtn) nextWordBtn.style.display = isDrawer ? 'inline-flex' : 'none';

    const canvasEl = $('#drawCanvas');
    if (canvasEl) canvasEl.classList.toggle('read-only', !isDrawer);

    const topicTag = $('#drawTopicTag');
    const hintText = $('#drawHintText');
    const guessInput = $('#guessInput');

    if (State.draw.mode === 'guess') {
      if (isDrawer) {
        if (topicTag) topicTag.textContent = `Palabra: ${State.draw.secretWord}`;
        if (hintText) hintText.textContent = `Pista: ${State.draw.hint}`;
        if (guessInput) {
          guessInput.disabled = true;
          guessInput.placeholder = 'Tú eres el dibujante. Los demás están adivinando...';
        }
      } else {
        const masked = State.draw.secretWord ? State.draw.secretWord.replace(/[A-ZÁÉÍÓÚ]/gi, '_ ') : '_ _ _';
        if (topicTag) topicTag.textContent = `Adivina: ${State.draw.secretWord.length} letras: ${masked}`;
        if (hintText) hintText.textContent = `Pista: ${State.draw.hint}`;
        if (guessInput) {
          guessInput.disabled = false;
          guessInput.placeholder = '¿Qué crees que es? Escribe aquí...';
        }
      }
    }
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

    // Asegurar que el usuario actual tenga su nombre en el marcador
    if (State.draw.scores['Tú'] !== undefined && State.profile.name !== 'Tú') {
      State.draw.scores[State.profile.name] = (State.draw.scores[State.profile.name] || 0) + State.draw.scores['Tú'];
      delete State.draw.scores['Tú'];
    }

    let entries = Object.entries(State.draw.scores);
    list.innerHTML = entries.map(([name, pts]) => `
      <div class="scoreboard-item">
        <span>${escapeHtml(name)}</span>
        <span class="scoreboard-points">${pts} pts</span>
      </div>
    `).join('');
  }

  function handleUserGuessSubmit(guessText) {
    if (State.draw.roundWon) {
      toast('Esta ronda ya terminó. Toca «Cambiar palabra» para jugar otra.');
      return;
    }

    const cleanGuess = guessText.trim().toUpperCase();
    if (!cleanGuess) return;

    window.sounds && window.sounds.playPop();
    postChatMessage(State.profile.name, guessText, false);

    sendPeerMessage({ type: 'guess', name: State.profile.name, text: guessText });

    if (cleanGuess === State.draw.secretWord.toUpperCase()) {
      executeRoundWin(State.profile.name, State.draw.secretWord, true);
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
  // 5. RINCÓN DE PALABRAS (PREVENCIÓN DE DUPLICADOS)
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

    // Control de turno consecutivo (evitar que el mismo usuario juegue dos veces seguidas)
    const isMyTurnBlocked = lastWordObj && (lastWordObj.author.toLowerCase() === State.profile.name.toLowerCase());
    const noticeEl = $('#wordTurnNotice');
    const submitBtn = $('#wordSubmitBtn');
    const inputEl = $('#wordInput');

    if (noticeEl) {
      if (isMyTurnBlocked) {
        noticeEl.style.display = 'block';
        noticeEl.innerHTML = `
          <div style="background:var(--sand-light);border:1.5px dashed var(--wood);border-radius:var(--r1);padding:8px 12px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
            <span style="font-size:13px;color:var(--ink)">
              ⏳ Ya dejaste tu palabra («<b>${escapeHtml(lastWordObj.word.toUpperCase())}</b>»). Espera que otro compañero continúe la cadena antes de volver a jugar.
            </span>
            <button type="button" class="btn alt sm" data-act="simulate-word" style="font-size:11.5px;padding:3px 8px">🎬 Simular jugada de compañero</button>
          </div>
        `;
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.title = 'Espera el turno de un compañero';
        }
        if (inputEl) {
          inputEl.disabled = true;
          inputEl.placeholder = `Esperando que otro compañero continúe tras «${lastWordObj.word}»...`;
        }
      } else {
        noticeEl.style.display = 'none';
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.removeAttribute('title');
        }
        if (inputEl) {
          inputEl.disabled = false;
        }
      }
    }
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

    // Validación de turno consecutivo: solo se puede aportar tras otro compañero
    if (State.words.chain.length > 0) {
      const lastWordObj = State.words.chain[State.words.chain.length - 1];
      if (lastWordObj.author.toLowerCase() === State.profile.name.toLowerCase()) {
        msgEl.textContent = `⏳ Ya aportaste la última palabra («${lastWordObj.word}»). Por favor espera el turno de otro compañero antes de volver a jugar.`;
        msgEl.className = 'feedback-msg error';
        window.sounds && window.sounds.playClick();
        toast('Espera el turno de otro compañero para continuar la cadena.');
        return;
      }
    }

    // Prevención estricta de palabras ya usadas en la cadena
    const alreadyUsed = State.words.chain.some(item => {
      const w = item.word.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return w === clean;
    });

    if (alreadyUsed) {
      msgEl.textContent = `❌ La palabra «${word.trim()}» ya fue usada anteriormente en esta cadena. ¡Piensa en una nueva!`;
      msgEl.className = 'feedback-msg error';
      window.sounds && window.sounds.playClick();
      return;
    }

    // Validación de regla de última letra
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

    if (State.profile.stats.words >= 3) {
      checkAndUnlockAchievement('wordsmith');
    }

    sendPeerMessage({ type: 'word_chain', entry: newEntry });

    window.sounds && window.sounds.playSuccess();
    triggerConfetti();
    toast('¡Dejaste tu jugada en el Rincón de Palabras!');

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
      'a': ["amabilidad", "almuerzo", "armonía", "abrazo", "aire", "ánimo"],
      'b': ["bienestar", "buena onda", "brindis", "brisa"],
      'c': ["cafecito", "compañerismo", "creatividad", "calma"],
      'd': ["desconexión", "diversión", "diálogo", "descanso"],
      'e': ["energía", "entusiasmo", "empatía", "equilibrio"],
      'f': ["felicidad", "frescura", "fuerza", "foco"],
      'g': ["gratitud", "ganas", "gusto", "generosidad"],
      'h': ["humor", "harmonia", "horizonte", "hábito"],
      'i': ["inspiración", "ilusión", "ideas", "interés"],
      'j': ["juego", "jornada", "júbilo"],
      'l': ["luz", "libertad", "lectura", "logro"],
      'm': ["música", "motivación", "mañana", "mate"],
      'n': ["naturaleza", "novedad", "nube", "nobleza"],
      'o': ["optimismo", "oxígeno", "organización", "onda"],
      'p': ["pausa", "paciencia", "paz", "placer"],
      'r': ["risa", "recarga", "respiro", "recreo"],
      's': ["sonrisa", "salud", "serenidad", "sueño"],
      't': ["tranquilidad", "té", "tiempo", "tregua"],
      'u': ["unión", "universo"],
      'v': ["vitalidad", "vida", "viaje", "visión"],
      'z': ["zen", "zona libre"]
    };

    const options = dictionary[requiredChar] || ["armonía", "pausa", "sonrisa"];
    
    // Filtrar palabras que no hayan sido usadas ya
    const available = options.filter(cand => !State.words.chain.some(e => e.word.toLowerCase() === cand));
    const chosenWord = available.length > 0 ? available[Math.floor(Math.random() * available.length)] : (options[0] + " nueva");
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
  // 6. TRIVIA RELÁMPAGO (GAMIFICADA CON RECOMPENSAS)
  // ==========================================
  function initTriviaScreen() {
    State.trivia.score = 0;
    State.trivia.streak = 0;
    State.trivia.currentQuestionIndex = 0;

    // Seleccionar 5 preguntas aleatorias del banco
    const shuffled = [...TRIVIA_BANK].sort(() => 0.5 - Math.random());
    State.trivia.roundQuestions = shuffled.slice(0, 5);

    renderTriviaQuestion();
  }

  function renderTriviaQuestion() {
    clearInterval(State.trivia.timerInterval);

    const q = State.trivia.roundQuestions[State.trivia.currentQuestionIndex];
    if (!q) {
      renderTriviaFinish();
      return;
    }

    $('#triviaQuestionNum').innerHTML = `Pregunta ${State.trivia.currentQuestionIndex + 1} de 5 · <span style="color:var(--accent)">Puntos: ${State.trivia.score} pts</span> ${State.trivia.streak > 1 ? `· 🔥 Racha x${State.trivia.streak}` : ''}`;
    $('#triviaQuestionText').textContent = q.q;

    // Categoría de la pregunta
    const factBox = $('#triviaFactBox');
    factBox.hidden = true;

    const optionsContainer = $('#triviaOptionsList');
    optionsContainer.innerHTML = q.options.map((opt, i) => `
      <button type="button" class="trivia-opt-btn" data-trivia-idx="${i}">
        <span>${String.fromCharCode(65 + i)}.</span> ${escapeHtml(opt)}
      </button>
    `).join('');

    // Temporizador de 15 segundos por pregunta
    State.trivia.timer = 15;
    updateTriviaTimerUI();

    State.trivia.timerInterval = setInterval(() => {
      State.trivia.timer--;
      updateTriviaTimerUI();
      if (State.trivia.timer <= 0) {
        clearInterval(State.trivia.timerInterval);
        handleTriviaTimeout();
      }
    }, 1000);
  }

  function updateTriviaTimerUI() {
    const el = $('#triviaTimerDisplay');
    if (el) {
      el.textContent = `⏱️ ${State.trivia.timer} s`;
      el.classList.toggle('low', State.trivia.timer <= 5);
    }
  }

  function handleTriviaTimeout() {
    const q = State.trivia.roundQuestions[State.trivia.currentQuestionIndex];
    State.trivia.streak = 0;
    window.sounds && window.sounds.playDing();

    $$('.trivia-opt-btn').forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === q.correct) btn.classList.add('selected');
    });

    const factBox = $('#triviaFactBox');
    factBox.innerHTML = `⏰ ¡Tiempo agotado! La respuesta correcta era: <b>${escapeHtml(q.options[q.correct])}</b>. ${q.fact}`;
    factBox.hidden = false;

    setTimeout(() => {
      State.trivia.currentQuestionIndex++;
      renderTriviaQuestion();
    }, 2800);
  }

  function handleTriviaSelect(index) {
    clearInterval(State.trivia.timerInterval);
    const q = State.trivia.roundQuestions[State.trivia.currentQuestionIndex];
    const isCorrect = index === q.correct;

    $$('.trivia-opt-btn').forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === q.correct) {
        btn.classList.add('selected');
      } else if (idx === index) {
        btn.style.borderColor = 'var(--bad)';
        btn.style.background = '#FDE8E8';
      }
    });

    const factBox = $('#triviaFactBox');

    if (isCorrect) {
      State.trivia.streak++;
      const bonus = State.trivia.streak > 1 ? 25 : 0;
      const ptsEarned = 100 + bonus;
      State.trivia.score += ptsEarned;

      window.sounds && window.sounds.playSuccess();
      factBox.innerHTML = `✅ <b>¡Correcto! (+${ptsEarned} pts)</b> ${q.fact}`;
      factBox.style.borderColor = 'var(--sage)';
      factBox.style.background = 'var(--sage-soft)';
      triggerConfetti();
    } else {
      State.trivia.streak = 0;
      window.sounds && window.sounds.playClick();
      factBox.innerHTML = `❌ <b>Casi:</b> La opción correcta era: <i>${escapeHtml(q.options[q.correct])}</i>. ${q.fact}`;
      factBox.style.borderColor = 'var(--sand-d)';
      factBox.style.background = 'var(--sand-light)';
    }

    factBox.hidden = false;

    setTimeout(() => {
      State.trivia.currentQuestionIndex++;
      renderTriviaQuestion();
    }, 2600);
  }

  function renderTriviaFinish() {
    clearInterval(State.trivia.timerInterval);

    const finalScore = State.trivia.score;
    State.profile.stats.triviaScore = (State.profile.stats.triviaScore || 0) + finalScore;
    saveProfileStats();

    let medal = { icon: "🥉", title: "Medalla de Bronce", desc: "¡Buen intento! Cada pausa suma bienestar mental." };
    if (finalScore >= 400) {
      medal = { icon: "🏆", title: "Medalla de Oro: Maestro del Break", desc: "¡Puntaje legendario! Eres una eminencia en datos y cultura de pausas activas." };
      checkAndUnlockAchievement('trivia');
    } else if (finalScore >= 200) {
      medal = { icon: "🥈", title: "Medalla de Plata: Experto en Pausas", desc: "¡Excelente resultado! Demostraste gran conocimiento y foco." };
      checkAndUnlockAchievement('trivia');
    }

    $('#triviaQuestionNum').textContent = "¡Ronda de Trivia Completada!";
    $('#triviaQuestionText').innerHTML = `
      <div style="text-align:center;padding:var(--s2) 0">
        <div style="font-size:48px;margin-bottom:8px">${medal.icon}</div>
        <h2 style="color:var(--accent);margin-bottom:4px">${medal.title}</h2>
        <p style="font-size:22px;font-weight:800;color:var(--ink)">${finalScore} Puntos Obtenidos</p>
        <p style="color:var(--soft);font-size:14px;max-width:440px;margin:8px auto">${medal.desc}</p>
      </div>
    `;

    $('#triviaOptionsList').innerHTML = `
      <div class="actions-row center" style="margin-top:var(--s2)">
        <button type="button" class="btn" data-act="restart-trivia">🎮 Jugar otra ronda de trivia</button>
        <button type="button" class="btn alt" data-go="fin">Ir a la Cafetería</button>
        <button type="button" class="btn alt" data-go="mapa">Volver a la sala</button>
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
      const replies = Array.isArray(note.replies) ? note.replies : [];

      const repliesHtml = replies.length > 0 ? `
        <div class="pasillo-replies-list" id="repliesList-${note.id}">
          ${replies.map(r => `
            <div class="pasillo-reply-item">
              <div class="avatar sm" style="width:20px;height:20px;--c:${r.color || '#5F9E82'};flex-shrink:0">
                <span class="avatar-smile"></span>
              </div>
              <div class="pasillo-reply-bubble">
                <div class="reply-header">
                  <b>${escapeHtml(r.author)}</b>
                  <small>${escapeHtml(r.time || 'Reciente')}</small>
                </div>
                <div>${escapeHtml(r.text)}</div>
              </div>
            </div>
          `).join('')}
        </div>
      ` : '';

      return `
        <article class="pasillo-note ${isMe ? 'user' : ''}" data-note-id="${note.id}">
          <div class="pasillo-note-author">
            <div class="avatar sm" style="width:26px;height:26px;--c:${note.color || '#5F9E82'}">
              <span class="avatar-smile"></span>
            </div>
            <span>${escapeHtml(note.author)}</span>
          </div>
          <p class="pasillo-note-text">${escapeHtml(note.text)}</p>

          ${repliesHtml}

          <!-- Formulario colapsable para responder a esta nota -->
          <form class="pasillo-reply-form" id="replyForm-${note.id}" data-note-id="${note.id}" style="display:none">
            <input type="text" placeholder="Escribe tu respuesta a ${escapeHtml(note.author)}..." maxlength="100" autocomplete="off" required>
            <button type="submit" class="btn sm" style="padding:4px 10px;font-size:12px">Enviar</button>
            <button type="button" class="btn alt sm" data-cancel-reply="${note.id}" style="padding:4px 8px;font-size:12px">✕</button>
          </form>

          <div class="pasillo-note-footer">
            <span>${escapeHtml(note.time || 'Reciente')}</span>
            <div class="pasillo-reactions">
              <button type="button" class="pasillo-react-btn" data-react="☕" data-note="${note.id}">☕ ${note.reactions?.['☕'] || 0}</button>
              <button type="button" class="pasillo-react-btn" data-react="🍪" data-note="${note.id}">🍪 ${note.reactions?.['🍪'] || 0}</button>
              <button type="button" class="pasillo-react-btn" data-react="👏" data-note="${note.id}">👏 ${note.reactions?.['👏'] || 0}</button>
            </div>
            <button type="button" class="pasillo-reply-toggle-btn" data-toggle-reply="${note.id}">
              💬 Responder ${replies.length > 0 ? `(${replies.length})` : ''}
            </button>
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
      reactions: { '☕': 1, '🍪': 0, '👏': 0 },
      replies: []
    };

    State.pasillo.notes.push(newNote);
    localStorage.setItem('pb_pasillo_notes', JSON.stringify(State.pasillo.notes));
    State.profile.stats.pasillo = (State.profile.stats.pasillo || 0) + 1;
    saveProfileStats();

    checkAndUnlockAchievement('pasillo');

    sendPeerMessage({ type: 'pasillo_note', note: newNote });

    window.sounds && window.sounds.playPop();
    toast('¡Dejaste tu nota en El Pasillo!');
    $('#pasilloInput').value = '';
    renderPasilloScreen();

    // Simular que un compañero reacciona o comenta amablemente después de 2s
    if (State.simulatedCompanionsEnabled) {
      setTimeout(() => {
        simulateCompanionReactionToUser(newNote.id);
      }, 2000);
    }
  }

  function handlePasilloReply(noteId, text) {
    const clean = text.trim();
    if (!clean) return;

    if (!State.pasillo.notes || State.pasillo.notes.length === 0) {
      State.pasillo.notes = JSON.parse(JSON.stringify(INITIAL_PASILLO_NOTES));
    }

    const note = State.pasillo.notes.find(n => String(n.id) === String(noteId));
    if (!note) return;

    if (!Array.isArray(note.replies)) {
      note.replies = [];
    }

    const newReply = {
      id: Date.now(),
      author: State.profile.name,
      color: State.profile.color,
      text: clean,
      time: 'Hace un instante'
    };

    note.replies.push(newReply);
    localStorage.setItem('pb_pasillo_notes', JSON.stringify(State.pasillo.notes));
    State.profile.stats.pasillo = (State.profile.stats.pasillo || 0) + 1;
    saveProfileStats();

    checkAndUnlockAchievement('pasillo');

    sendPeerMessage({ type: 'pasillo_reply', noteId: note.id, reply: newReply });

    window.sounds && window.sounds.playPop();
    toast(`¡Respondiste a la nota de ${note.author}!`);
    renderPasilloScreen();

    // Si los compañeros están activos y no es nota propia, simular respuesta de vuelta
    if (State.simulatedCompanionsEnabled && note.author !== State.profile.name) {
      setTimeout(() => {
        simulateCompanionReplyBack(note.id, note.author);
      }, 1600);
    }
  }

  function simulateCompanionReplyBack(noteId, targetAuthor) {
    const note = State.pasillo.notes.find(n => String(n.id) === String(noteId));
    if (!note) return;

    const repliesPool = [
      `¡Totalmente de acuerdo contigo, ${State.profile.name}!`,
      `¡Buenísimo ese dato, lo voy a probar hoy mismo!`,
      `¡Jaja exacto! Me pasó tal cual esta semana.`,
      `¡Qué buena recomendación! Gracias por compartir 🙌`,
      `¡Sii! Eso cambia por completo el día de trabajo.`
    ];

    const replyText = repliesPool[Math.floor(Math.random() * repliesPool.length)];
    const friend = State.virtualFriends.find(f => f.name === targetAuthor) || State.virtualFriends[0];

    if (!Array.isArray(note.replies)) note.replies = [];

    note.replies.push({
      id: Date.now(),
      author: friend.name,
      color: friend.color,
      text: replyText,
      time: 'Hace un momento'
    });

    if (!note.reactions) note.reactions = {};
    note.reactions['☕'] = (note.reactions['☕'] || 0) + 1;

    localStorage.setItem('pb_pasillo_notes', JSON.stringify(State.pasillo.notes));
    window.sounds && window.sounds.playDing();
    toast(`💬 ${friend.name} te respondió en El Pasillo.`);
    renderPasilloScreen();
  }

  function simulateCompanionReactionToUser(noteId) {
    const note = State.pasillo.notes.find(n => String(n.id) === String(noteId));
    if (!note) return;

    const friend = State.virtualFriends[Math.floor(Math.random() * State.virtualFriends.length)];
    const emoji = ['☕', '🍪', '👏'][Math.floor(Math.random() * 3)];
    if (!note.reactions) note.reactions = {};
    note.reactions[emoji] = (note.reactions[emoji] || 0) + 1;

    localStorage.setItem('pb_pasillo_notes', JSON.stringify(State.pasillo.notes));
    window.sounds && window.sounds.playDing();
    toast(`✨ ${friend.name} reaccionó con ${emoji} a tu nota.`);
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
      "Terminé un bug que me tenía loco toda la mañana, ¡por fin respiro!",
      "Les recomiendo la playlist de Synthwave Chill para programar concentrado.",
      "¿Alguien más aquí toma agua con rodajas de limón entre tareas?",
      "¡Saluditos a todo el equipo! Recuerden estirar el cuello 5 segundos."
    ];
    const friend = State.virtualFriends[Math.floor(Math.random() * State.virtualFriends.length)];
    const text = messages[Math.floor(Math.random() * messages.length)];

    const note = {
      id: Date.now(),
      author: friend.name,
      color: friend.color,
      text: text,
      time: 'Hace un momento',
      reactions: { '☕': 2, '🍪': 1, '👏': 3 },
      replies: []
    };

    State.pasillo.notes.push(note);
    localStorage.setItem('pb_pasillo_notes', JSON.stringify(State.pasillo.notes));
    window.sounds && window.sounds.playPop();
    toast(`🎬 ${friend.name} dejó un mensaje en El Pasillo.`);
    renderPasilloScreen();
  }

  // ==========================================
  // 8. CHAT DE VOZ WEBRTC & SÍNTESIS DE VOZ
  // ==========================================
  function toggleVoiceChat() {
    if (State.voice.enabled) {
      // Desactivar voz
      stopVoiceChat();
      toast('Micrófono desactivado.');
    } else {
      // Activar voz
      startVoiceChat();
    }
  }

  function startVoiceChat() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast('Tu navegador no soporta captura de micrófono.');
      return;
    }

    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      State.voice.localStream = stream;
      State.voice.enabled = true;
      updateVoiceUI(true);
      toast('🎙️ Micrófono activado en La Cafetería.');

      // Si hay llamada P2P activa, transmitir el audio
      if (State.p2p.peer && State.p2p.connection && State.p2p.connected) {
        try {
          const remotePeerId = State.p2p.connection.peer;
          const call = State.p2p.peer.call(remotePeerId, stream);
          State.voice.activeCall = call;
          call.on('stream', (remoteStream) => {
            playRemoteAudioStream(remoteStream);
          });
        } catch (e) {
          console.error('P2P Voice error:', e);
        }
      }
    }).catch((err) => {
      console.warn('Mic access denied:', err);
      toast('Permiso de micrófono no otorgado. Puedes usar el simulador de voz.');
    });
  }

  function stopVoiceChat() {
    if (State.voice.localStream) {
      State.voice.localStream.getTracks().forEach(t => t.stop());
      State.voice.localStream = null;
    }
    State.voice.enabled = false;
    updateVoiceUI(false);
  }

  function updateVoiceUI(active) {
    const btn = $('#voiceToggleBtn');
    if (btn) {
      btn.innerHTML = active ? '🔴 Silenciar Micrófono' : '🎙️ Conectar Voz (Micrófono)';
      btn.classList.toggle('danger', active);
    }
    const indicator = $('#voiceActiveBadge');
    if (indicator) indicator.hidden = !active;

    // Halo animado en avatar propio
    const myAv = $('#postgameMyAvatar');
    if (myAv) myAv.classList.toggle('speaking', active);
  }

  function playRemoteAudioStream(stream) {
    let audioEl = $('#remoteAudioElement');
    if (!audioEl) {
      audioEl = document.createElement('audio');
      audioEl.id = 'remoteAudioElement';
      audioEl.autoplay = true;
      document.body.appendChild(audioEl);
    }
    audioEl.srcObject = stream;
    audioEl.play().catch(e => console.log('Audio autoplay blocked:', e));
    toast('🔊 Escuchando a tu compañero por voz en vivo.');
  }

  function speakSimulatedVoice(friendName, text) {
    if (!('speechSynthesis' in window)) {
      toast(`[Simulación] ${friendName}: «${text}»`);
      return;
    }

    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'es-ES';
    utter.rate = 1.05;

    // Resaltar avatar del compañero que habla
    const avatarEl = $(`[data-avatar-name="${friendName}"]`);
    if (avatarEl) avatarEl.classList.add('speaking');

    utter.onend = () => {
      if (avatarEl) avatarEl.classList.remove('speaking');
    };

    window.speechSynthesis.speak(utter);
    toast(`🔊 ${friendName} está hablando por voz simulada...`);
  }

  function playCompanionVoiceDemo() {
    const friend = State.virtualFriends[Math.floor(Math.random() * State.virtualFriends.length)];
    const responses = [
      `¡Buena partida ${State.profile.name}! Para mí tomar este descanso de cinco minutos fue genial.`,
      `¡Hola ${State.profile.name}! Me encantó cómo quedó el dibujo, ¡buen pulso!`,
      `¡Qué buena pausa! Yo voto por hacernos un buen café ahora mismo.`,
      `¡Muy divertido jugar contigo ${State.profile.name}! Descansar la mente recarga la energía.`
    ];
    const text = responses[Math.floor(Math.random() * responses.length)];
    speakSimulatedVoice(friend.name, text);
  }

  // ==========================================
  // 9. MULTIJUGADOR EN VIVO: MESH LOCAL (BROADCASTCHANNEL) + WEBRTC P2P (PEERJS)
  // ==========================================
  function initMesh() {
    if (!State.tabId) {
      State.tabId = 'tab_' + Math.random().toString(36).substring(2, 9);
    }

    // 1. BroadcastChannel: sincronización instantánea entre pestañas / ventanas en el mismo equipo
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        window.roomBroadcastChannel = new BroadcastChannel('playbreak_multiverse_v1');
        window.roomBroadcastChannel.onmessage = (event) => {
          if (event.data && event.data.senderTabId !== State.tabId) {
            handleRemotePeerData(event.data);
          }
        };
      } catch (e) {
        console.warn('BroadcastChannel error:', e);
      }
    }

    // 2. Storage event fallback para entornos restringidos
    window.addEventListener('storage', (e) => {
      if (e.key === 'pb_mesh_event' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed && parsed.senderTabId !== State.tabId) {
            handleRemotePeerData(parsed);
          }
        } catch (err) {}
      }
    });

    // 3. Anuncio inicial de presencia
    setTimeout(() => {
      sendPeerMessage({
        type: 'peer_hello',
        name: State.profile.name,
        color: State.profile.color,
        x: State.room.avatarX,
        y: State.room.avatarY,
        station: State.room.selectedStation
      });
    }, 150);

    // 4. Heartbeat periódico cada 3 segundos
    setInterval(() => {
      sendPeerMessage({
        type: 'peer_heartbeat',
        name: State.profile.name,
        color: State.profile.color,
        x: State.room.avatarX,
        y: State.room.avatarY,
        station: State.room.selectedStation
      });

      // Desconexión por inactividad si hace más de 7 segundos no hay pulso y no hay P2P activo
      if (State.room.peer.connected && State.room.peer.lastSeen && (Date.now() - State.room.peer.lastSeen > 7000) && !State.p2p.connected) {
        State.room.peer.connected = false;
        updateRoomPresence();
      }
    }, 3000);

    // 5. Despedida limpia al cerrar ventana
    window.addEventListener('beforeunload', () => {
      sendPeerMessage({ type: 'peer_bye' });
    });
  }

  function initPeerJS() {
    initMesh();

    if (typeof Peer === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get('sala');
    if (roomParam) {
      setTimeout(() => joinPeerRoom(roomParam.toUpperCase()), 600);
    } else {
      // Si no hay sala en la URL, auto-generar roomCode para compartir fácilmente
      State.p2p.roomCode = Math.floor(1000 + Math.random() * 9000);
    }
  }

  function createPeerRoom() {
    if (typeof Peer === 'undefined') {
      toast('PeerJS no disponible. La sincronización local (Mesh) está activa en este equipo.');
      return;
    }

    const code = Math.floor(1000 + Math.random() * 9000);
    const peerId = `playbreak-room-${code}`;
    State.p2p.roomCode = code;
    State.p2p.isHost = true;

    try {
      State.p2p.peer = new Peer(peerId, { debug: 1 });

      State.p2p.peer.on('open', () => {
        updateP2PStatus('waiting', `Sala: SALA-${code} (Esperando compañero)`);
        updateMultiplayerModalUI();
        $('#shareRoomDialog')?.showModal();
        toast(`Sala online creada: SALA-${code}. ¡Comparte el enlace!`);
      });

      State.p2p.peer.on('connection', (conn) => {
        setupPeerConnection(conn);
        toast(`¡Un compañero se unió a tu sala online!`);
      });

      State.p2p.peer.on('call', (call) => {
        if (State.voice.localStream) {
          call.answer(State.voice.localStream);
        } else {
          navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
            State.voice.localStream = stream;
            State.voice.enabled = true;
            updateVoiceUI(true);
            call.answer(stream);
          }).catch(() => call.answer());
        }
        call.on('stream', (remoteStream) => {
          playRemoteAudioStream(remoteStream);
        });
      });

      State.p2p.peer.on('error', (err) => {
        console.warn('Peer warning:', err);
        updateP2PStatus('solo', 'Sincronización Mesh Activa');
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

      State.p2p.peer.on('call', (call) => {
        if (State.voice.localStream) {
          call.answer(State.voice.localStream);
        } else {
          navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
            State.voice.localStream = stream;
            State.voice.enabled = true;
            updateVoiceUI(true);
            call.answer(stream);
          }).catch(() => call.answer());
        }
        call.on('stream', (remoteStream) => {
          playRemoteAudioStream(remoteStream);
        });
      });

      State.p2p.peer.on('error', () => {
        updateP2PStatus('solo', 'No se encontró sala remota');
        toast('No se encontró sala remota. La sincronización local sigue activa.');
      });
    } catch (e) {
      console.error(e);
    }
  }

  function setupPeerConnection(conn) {
    State.p2p.connection = conn;

    conn.on('open', () => {
      State.p2p.connected = true;
      State.room.peer.connected = true;
      updateP2PStatus('connected', `🟢 Conectado en vivo (SALA-${State.p2p.roomCode})`);
      window.sounds && window.sounds.playSuccess();
      toast('¡Conexión P2P en tiempo real establecida!');
      
      conn.send({
        type: 'peer_hello',
        name: State.profile.name,
        color: State.profile.color,
        x: State.room.avatarX,
        y: State.room.avatarY,
        station: State.room.selectedStation,
        senderTabId: State.tabId
      });
      updateRoomPresence();
    });

    conn.on('data', (data) => {
      handleRemotePeerData(data);
    });

    conn.on('close', () => {
      State.p2p.connected = false;
      updateP2PStatus('solo', 'Compañero desconectado');
      toast('El compañero se desconectó de la sala.');
      updateRoomPresence();
    });
  }

  function sendPeerMessage(msg) {
    const payload = {
      ...msg,
      senderTabId: State.tabId,
      _t: Date.now()
    };

    // 1. BroadcastChannel (entre ventanas y pestañas del mismo equipo)
    if (window.roomBroadcastChannel) {
      try {
        window.roomBroadcastChannel.postMessage(payload);
      } catch (e) {}
    }

    // 2. Storage event fallback
    try {
      localStorage.setItem('pb_mesh_event', JSON.stringify(payload));
    } catch (e) {}

    // 3. WebRTC PeerJS (entre diferentes ordenadores)
    if (State.p2p.connection && State.p2p.connected) {
      try {
        State.p2p.connection.send(payload);
      } catch (e) {}
    }
  }

  function handleRemotePeerData(data) {
    if (!data) return;
    if (data.senderTabId && data.senderTabId === State.tabId) return;

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
        executeRoundWin(data.winnerName, data.word, false);
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

      case 'pasillo_reply':
        const targetNote = State.pasillo.notes.find(n => String(n.id) === String(data.noteId));
        if (targetNote) {
          if (!Array.isArray(targetNote.replies)) targetNote.replies = [];
          targetNote.replies.push(data.reply);
          localStorage.setItem('pb_pasillo_notes', JSON.stringify(State.pasillo.notes));
          renderPasilloScreen();
          window.sounds && window.sounds.playDing();
          toast(`💬 ${data.reply.author} respondió a una nota en El Pasillo.`);
        }
        break;

      case 'peer_hello':
      case 'peer_heartbeat': {
        const wasDisconnected = !State.room.peer.connected;
        State.room.peer.connected = true;
        State.room.peer.lastSeen = Date.now();
        State.room.peer.tabId = data.senderTabId;

        // Si ambos usuarios tienen el nombre por defecto 'Tú', diferenciamos al compañero
        if (data.name === 'Tú' && State.profile.name === 'Tú') {
          State.room.peer.name = 'Compañero (En vivo)';
        } else {
          State.room.peer.name = data.name || 'Compañero';
        }

        // Color agradable y distintivo si ambos tienen el verde estándar
        if (data.color === State.profile.color && State.profile.color === '#5F9E82') {
          State.room.peer.color = '#B79CE0';
        } else {
          State.room.peer.color = data.color || '#B79CE0';
        }

        if (data.x != null) State.room.peer.x = data.x;
        if (data.y != null) State.room.peer.y = data.y;
        if (data.station !== undefined) State.room.peer.station = data.station;

        updateRoomPresence();

        if (data.type === 'peer_hello') {
          sendPeerMessage({
            type: 'peer_hello_back',
            name: State.profile.name,
            color: State.profile.color,
            x: State.room.avatarX,
            y: State.room.avatarY,
            station: State.room.selectedStation
          });
          if (wasDisconnected) {
            toast(`🟢 ${State.room.peer.name} está presente en la sala.`);
            window.sounds && window.sounds.playPop();
          }
        }
        break;
      }

      case 'peer_hello_back': {
        const wasDisconnected = !State.room.peer.connected;
        State.room.peer.connected = true;
        State.room.peer.lastSeen = Date.now();
        State.room.peer.tabId = data.senderTabId;

        if (data.name === 'Tú' && State.profile.name === 'Tú') {
          State.room.peer.name = 'Compañero (En vivo)';
        } else {
          State.room.peer.name = data.name || 'Compañero';
        }

        if (data.color === State.profile.color && State.profile.color === '#5F9E82') {
          State.room.peer.color = '#B79CE0';
        } else {
          State.room.peer.color = data.color || '#B79CE0';
        }

        if (data.x != null) State.room.peer.x = data.x;
        if (data.y != null) State.room.peer.y = data.y;
        if (data.station !== undefined) State.room.peer.station = data.station;

        updateRoomPresence();
        if (wasDisconnected) {
          toast(`🟢 ${State.room.peer.name} está presente en la sala.`);
          window.sounds && window.sounds.playPop();
        }
        break;
      }

      case 'peer_walk': {
        State.room.peer.connected = true;
        State.room.peer.lastSeen = Date.now();
        State.room.peer.x = data.x;
        State.room.peer.y = data.y;
        const peerAv = $('#roomPeerAvatar');
        if (peerAv) {
          peerAv.hidden = false;
          peerAv.style.left = `${data.x}%`;
          peerAv.style.top = `${data.y}%`;
          peerAv.classList.add('walking');
          setTimeout(() => peerAv.classList.remove('walking'), 650);
        }
        break;
      }

      case 'peer_station': {
        State.room.peer.connected = true;
        State.room.peer.lastSeen = Date.now();
        State.room.peer.station = data.stationTitle || data.stationKey;
        const peerStatus = $('#roomPeerAvatarStatus');
        if (peerStatus) {
          peerStatus.textContent = data.stationKey ? `En ${data.stationTitle || data.stationKey}` : 'En descanso';
        }
        break;
      }

      case 'peer_profile_update': {
        if (data.name) State.room.peer.name = data.name;
        if (data.color) State.room.peer.color = data.color;
        updateRoomPresence();
        break;
      }

      case 'draw_role':
        State.draw.role = data.role;
        if (data.word) State.draw.secretWord = data.word;
        if (data.hint) State.draw.hint = data.hint;
        updateDrawRoleUI();
        toast(State.draw.role === 'drawer' ? '🎨 Tu compañero te pasó el turno de dibujar.' : '🔍 Tu compañero tiene el pincel. ¡Intenta adivinar en el chat!');
        break;

      case 'peer_bye':
        State.room.peer.connected = false;
        updateRoomPresence();
        toast('El compañero salió de la sala.');
        break;
    }
  }

  function updateP2PStatus(status, text) {
    const el = $('#p2pStatusLabel');
    const textEl = $('#p2pStatusText');
    if (el) el.className = `p2p-status ${status}`;
    if (textEl) textEl.textContent = text;
  }

  function updateMultiplayerModalUI() {
    const banner = $('#p2pStatusBannerText');
    const shareInput = $('#shareRoomInput');
    
    if (!State.p2p.roomCode) {
      State.p2p.roomCode = Math.floor(1000 + Math.random() * 9000);
    }
    
    if (shareInput) {
      const baseUrl = window.location.origin + window.location.pathname;
      shareInput.value = `${baseUrl}?sala=${State.p2p.roomCode}`;
    }

    if (banner) {
      if (State.room.peer.connected) {
        banner.innerHTML = `🟢 <b>En vivo con:</b> ${State.room.peer.name} (${State.p2p.connected ? 'WebRTC Remoto' : 'Mesh Local Instantáneo'})`;
      } else {
        banner.innerHTML = `⚪ Esperando conexión. Abre otra ventana en este equipo para probar o comparte el enlace.`;
      }
    }
  }

  // ==========================================
  function renderPostGameScreen() {
    State.profile.stats.breaks++;
    saveProfileStats();

    const avatarsContainer = $('#postgameAvatars');
    let participants = [{ name: State.profile.name, color: State.profile.color, isMe: true }];

    if (State.simulatedCompanionsEnabled) {
      participants.push(...State.virtualFriends);
    }
    State.draw.players.forEach(p => participants.push({ name: p, color: '#9B653C' }));

    avatarsContainer.innerHTML = participants.map(p => `
      <div class="avatar lg" data-avatar-name="${escapeHtml(p.name)}" id="${p.isMe ? 'postgameMyAvatar' : ''}" style="--c:${p.color}">
        <span class="avatar-smile"></span>
        <span class="avatar-tag">${escapeHtml(p.name)}</span>
      </div>
    `).join('');

    generatePersonalizedIcebreaker();

    // Si el usuario eligió "Con voz" en su perfil, sugerir activar el micro
    if (State.profile.mode === 'voz' && !State.voice.enabled) {
      toast('💡 Tu perfil prefiere voz: Puedes activar el micrófono en la barra inferior.');
    }
  }

  function generatePersonalizedIcebreaker() {
    const userTags = State.profile.tags;
    let questionsPool = [];
    let activeTag = null;

    if (userTags && userTags.length > 0) {
      activeTag = userTags[Math.floor(Math.random() * userTags.length)];
      if (ICEBREAKER_BY_TAG[activeTag]) {
        questionsPool = ICEBREAKER_BY_TAG[activeTag];
      }
    }

    if (!questionsPool.length) {
      questionsPool = DEFAULT_ICEBREAKERS;
    }

    const q = questionsPool[Math.floor(Math.random() * questionsPool.length)];
    const el = $('#icebreakerQuestion');
    const tagBadge = $('#icebreakerTagBadge');

    if (el) {
      el.textContent = `«${q}»`;
    }
    if (tagBadge) {
      tagBadge.textContent = activeTag ? `🎯 Pregunta afinada a tus gustos (${activeTag})` : `☕ Pregunta para charlar`;
    }
  }

  // ==========================================
  // 11. PERFIL Y PERSONALIZACIÓN ("TU RINCÓN")
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

    $('input[name="prefModo"]').forEach(radio => {
      radio.checked = radio.value === State.profile.mode;
    });

    $('#statBreaks').textContent = State.profile.stats.breaks;
    $('#statDrawings').textContent = State.profile.stats.drawings;
    $('#statWords').textContent = State.profile.stats.words;

    // Nivel y barra de bienestar
    renderLevelAndAchievements();
  }

  function renderLevelAndAchievements() {
    const totalBreaks = State.profile.stats.breaks;
    let levelTitle = "Nivel 1: 🌱 Novato del Descanso";
    let progressPct = Math.min((totalBreaks / 5) * 100, 100);

    if (totalBreaks >= 10) {
      levelTitle = "Nivel 3: 🌳 Maestro Zen del Bienestar";
      progressPct = 100;
    } else if (totalBreaks >= 5) {
      levelTitle = "Nivel 2: 🌿 Amigo de las Pausas";
      progressPct = Math.min(((totalBreaks - 5) / 5) * 100, 100);
    }

    const titleEl = $('#profileLevelTitle');
    const barEl = $('#profileLevelProgressBar');
    if (titleEl) titleEl.textContent = levelTitle;
    if (barEl) barEl.style.width = `${progressPct}%`;

    // Renderizar logros
    const achList = $('#achievementsGrid');
    if (!achList) return;

    const achs = [
      { key: 'picasso', icon: '🎨', title: 'Picasso del Break', desc: 'Gana 1 ronda de dibujo', unlocked: State.profile.achievements.picasso },
      { key: 'wordsmith', icon: '🔤', title: 'Diccionario Ágil', desc: 'Aporta 3 palabras encadenadas', unlocked: State.profile.achievements.wordsmith },
      { key: 'trivia', icon: '⚡', title: 'Mente Brillante', desc: 'Gana 200+ pts en Trivia Relámpago', unlocked: State.profile.achievements.trivia },
      { key: 'pasillo', icon: '💬', title: 'Alma del Pasillo', desc: 'Deja una nota en el café', unlocked: State.profile.achievements.pasillo }
    ];

    achList.innerHTML = achs.map(a => `
      <div class="achievement-badge ${a.unlocked ? 'unlocked' : 'locked'}">
        <div class="ach-icon">${a.icon}</div>
        <div>
          <b>${escapeHtml(a.title)}</b>
          <small>${escapeHtml(a.desc)}</small>
        </div>
        <span class="ach-status">${a.unlocked ? '✅ Desbloqueado' : '🔒 Pendiente'}</span>
      </div>
    `).join('');
  }

  function updateProfileAvatarPreview() {
    const preview = $('#profileAvatarPreview');
    if (preview) preview.style.setProperty('--c', State.profile.color);
    const sideAv = $('#sidebarUserAvatar');
    if (sideAv) sideAv.style.setProperty('--c', State.profile.color);
    const sideName = $('#sidebarUserName');
    if (sideName) sideName.textContent = State.profile.name;
    const roomAv = $('#roomMyAvatar');
    if (roomAv) roomAv.style.setProperty('--c', State.profile.color);
    const roomName = $('#roomMyAvatarName');
    if (roomName) roomName.textContent = State.profile.name;
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
    updateRecommendedRoomBadge();

    window.sounds && window.sounds.playSuccess();
    toast('¡Perfil y preferencias guardados con éxito!');
  }

  function checkAndUnlockAchievement(key) {
    if (!State.profile.achievements) {
      State.profile.achievements = { picasso: false, wordsmith: false, trivia: false, pasillo: false };
    }
    if (!State.profile.achievements[key]) {
      State.profile.achievements[key] = true;
      localStorage.setItem('pb_achievements', JSON.stringify(State.profile.achievements));
      const names = {
        picasso: '🎨 Picasso del Break (Ronda ganada)',
        wordsmith: '🔤 Diccionario Ágil (3 palabras aportadas)',
        trivia: '⚡ Mente Brillante (Experto en Trivia)',
        pasillo: '💬 Alma del Pasillo (Nota en el café)'
      };
      toast(`🏆 ¡Logro desbloqueado: ${names[key] || key}!`);
      window.sounds && window.sounds.playSuccess();
      triggerConfetti();
      renderLevelAndAchievements();
    }
  }

  function updateRecommendedRoomBadge() {
    $('.recommend-badge').forEach(el => el.remove());
    $('.room-card').forEach(el => el.classList.remove('recommended'));

    const mode = State.profile.mode || 'texto';
    if (mode === 'turnos') {
      const card = $('.room-card.async');
      if (card) {
        card.classList.add('recommended');
        const b = document.createElement('div');
        b.className = 'recommend-badge';
        b.innerHTML = '✨ Recomendada para ti (Modo Asíncrono)';
        card.prepend(b);
      }
    } else if (mode === 'voz') {
      const card = $('.room-card.live');
      if (card) {
        card.classList.add('recommended');
        const b = document.createElement('div');
        b.className = 'recommend-badge';
        b.innerHTML = '🎙️ Recomendada para ti (Modo Voz)';
        card.prepend(b);
      }
    } else { // texto
      const card = $('.room-card.chat');
      if (card) {
        card.classList.add('recommended');
        const b = document.createElement('div');
        b.className = 'recommend-badge';
        b.innerHTML = '💬 Recomendada para ti (Solo Texto)';
        card.prepend(b);
      }
    }

    const sideName = $('#sidebarUserName');
    const sideAv = $('#sidebarUserAvatar');
    if (sideName) sideName.textContent = State.profile.name;
    if (sideAv) sideAv.style.setProperty('--c', State.profile.color);
  }

  // ==========================================
  // 12. CONFETI NATIVO (CANVAS)
  // ==========================================
  function triggerConfetti() {
    const cvs = $('#confettiCanvas');
    if (!cvs || !cvs.getContext) return;
    const c = cvs.getContext('2d');
    if (!c) return;
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
  // 13. MANEJADORES DE EVENTOS
  // ==========================================
  

  // 10. GESTIÓN DE EVENTOS Y ENLACES
  // ==========================================
  function setupEventListeners() {
    document.addEventListener('click', (e) => {
      const goBtn = e.target.closest('[data-go]');
      if (goBtn) {
        navigateTo(goBtn.dataset.go);
        return;
      }

      const switchViewBtn = e.target.closest('[data-act="switch-view"]');
      if (switchViewBtn) {
        setRoomView(switchViewBtn.dataset.view);
        return;
      }

      const actBtn = e.target.closest('[data-act]');
      if (actBtn) {
        handleAction(actBtn.dataset.act, actBtn);
        return;
      }

      // Estaciones espaciales en el salón
      const booth = e.target.closest('.station-booth');
      if (booth) {
        handleStationClick(booth.dataset.station);
        return;
      }

      // Tarjetas en vista cuadrícula
      const stationCard = e.target.closest('.room-card[data-station]');
      if (stationCard && State.room.view === 'grid') {
        openStationModal(stationCard.dataset.station);
        return;
      }

      const reactBtn = e.target.closest('[data-react]');
      if (reactBtn) {
        handlePasilloReaction(reactBtn.dataset.note, reactBtn.dataset.react);
        return;
      }

      // Desplegar / ocultar caja de respuesta en El Pasillo
      const toggleReplyBtn = e.target.closest('[data-toggle-reply]');
      if (toggleReplyBtn) {
        const noteId = toggleReplyBtn.dataset.toggleReply;
        const form = $(`#replyForm-${noteId}`);
        if (form) {
          const isHidden = form.style.display === 'none';
          form.style.display = isHidden ? 'flex' : 'none';
          if (isHidden) {
            const input = form.querySelector('input');
            if (input) input.focus();
          }
        }
        return;
      }

      const cancelReplyBtn = e.target.closest('[data-cancel-reply]');
      if (cancelReplyBtn) {
        const noteId = cancelReplyBtn.dataset.cancelReply;
        const form = $(`#replyForm-${noteId}`);
        if (form) form.style.display = 'none';
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

    // Clic en el suelo del salón virtual para caminar libremente
    const floorCanvas = $('#roomFloorCanvas');
    if (floorCanvas) {
      floorCanvas.addEventListener('click', handleFloorClick);
    }

    // Respuestas en hilos de El Pasillo
    document.addEventListener('submit', (e) => {
      const replyForm = e.target.closest('.pasillo-reply-form');
      if (replyForm) {
        e.preventDefault();
        const noteId = replyForm.dataset.noteId;
        const input = replyForm.querySelector('input');
        if (input && input.value.trim()) {
          handlePasilloReply(noteId, input.value.trim());
        }
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
      updateRoomPresence();
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

      case 'switch-view':
        setRoomView(btn.dataset.view);
        break;

      case 'open-multiplayer':
        updateMultiplayerModalUI();
        $('#shareRoomDialog')?.showModal();
        break;

      case 'toggle-draw-role':
        toggleDrawRole();
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
        triggerSimulatedCompanionGuess(4);
        break;

      case 'restart-trivia':
        initTriviaScreen();
        break;

      case 'toggle-voice-chat':
        toggleVoiceChat();
        break;

      case 'play-companion-voice-demo':
        playCompanionVoiceDemo();
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
        generatePersonalizedIcebreaker();
        window.sounds && window.sounds.playClick();
        break;

      case 'ghost-exit':
        stopVoiceChat();
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
  // 14. INICIALIZACIÓN
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
    updateRecommendedRoomBadge();
    setupEventListeners();
    initPeerJS();

    // Inicializar Salón Espacial (Reloj, presencia, vista y posición de avatar)
    updateRoomClock();
    setInterval(updateRoomClock, 30000);
    updateRoomPresence();
    setRoomView(State.room.view);

    const myAvatar = $('#roomMyAvatar');
    if (myAvatar) {
      myAvatar.style.left = `${State.room.avatarX}%`;
      myAvatar.style.top = `${State.room.avatarY}%`;
    }

    const initialHash = (location.hash || '').replace('#', '');
    navigateTo(initialHash || 'mapa');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

})();
