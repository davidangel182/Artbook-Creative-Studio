const SUPABASE_URL = "https://ebaoynyborwhdznwofnl.supabase.co";
const SUPABASE_KEY = "sb_publishable_DcFwWEEUX_pAF7IItRYzkA_JD7u0W6K";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const authScreen = document.getElementById("authScreen");
const app = document.getElementById("protectedApp");

const email = document.getElementById("authEmail");
const password = document.getElementById("authPassword");
const status = document.getElementById("authStatus");

const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const logoutBtn = document.getElementById("logoutBtn");

function showApp() {
  authScreen.classList.add("hidden");
  app.classList.remove("hidden");
}

function showLogin() {
  app.classList.add("hidden");
  authScreen.classList.remove("hidden");
}

loginBtn.onclick = async () => {
  const { error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value
  });

  if (error) {
    status.textContent = error.message;
  } else {
    showApp();
  }
};

signupBtn.onclick = async () => {
  const { error } = await supabase.auth.signUp({
    email: email.value,
    password: password.value
  });

  status.textContent = error ? error.message : "Cuenta creada";
};

logoutBtn.onclick = async () => {
  await supabase.auth.signOut();
  showLogin();
};

(async () => {
  const { data } = await supabase.auth.getSession();
  if (data.session) showApp();
})();

    const books = [
      {id:1,publisher:"SQUARE ENIX",title:"A Realm Reborn: The Art of Eorzea",color:"#c8a96e",cover:"",initials:"SE",tags:["character","environment","keyart","semi-realistic","fantasy"]},
      {id:2,publisher:"SQUARE ENIX",title:"Final Fantasy XIV: Heavensward",color:"#c8a96e",cover:"",initials:"SE",tags:["character","environment","keyart","semi-realistic","fantasy"]},
      {id:3,publisher:"SQUARE ENIX",title:"Final Fantasy XIV: Stormblood",color:"#c8a96e",cover:"",initials:"SE",tags:["character","environment","keyart","semi-realistic","fantasy"]},
      {id:4,publisher:"SQUARE ENIX",title:"Final Fantasy XIV: Shadowbringers",color:"#c8a96e",cover:"",initials:"SE",tags:["character","environment","keyart","semi-realistic","fantasy"]},
      {id:5,publisher:"SQUARE ENIX",title:"Final Fantasy XIV: Endwalker",color:"#c8a96e",cover:"",initials:"SE",tags:["character","environment","keyart","semi-realistic","fantasy"]},
      {id:6,publisher:"SQUARE ENIX",title:"Final Fantasy XII Art Collection",color:"#c8a96e",cover:"",initials:"SE",tags:["environment","character","stylized","fantasy"]},
      {id:7,publisher:"SQUARE ENIX",title:"Final Fantasy Advent Children",color:"#c8a96e",cover:"",initials:"SE",tags:["character","keyart","semi-realistic","fantasy","sci-fi"]},
      {id:8,publisher:"SQUARE ENIX",title:"Bravely Default",color:"#c8a96e",cover:"",initials:"SE",tags:["character","stylized","fantasy"]},
      {id:9,publisher:"ARENA NET",title:"Art of Guild Wars Book 2",color:"#c8a96e",cover:"",initials:"AN",tags:["character","creature","environment","fantasy","semi-realistic"]},
      {id:10,publisher:"BLIZZARD",title:"World of Warcraft: Mists of Pandaria",color:"#ff7e3e",cover:"",initials:"BL",tags:["character","creature","environment","stylized","fantasy"]},
      {id:11,publisher:"BLIZZARD",title:"World of Warcraft: Cataclysm",color:"#ff7e3e",cover:"",initials:"BL",tags:["character","creature","environment","stylized","fantasy"]},
      {id:12,publisher:"BLIZZARD",title:"Art des cinématiques de World of Warcraft",color:"#ff7e3e",cover:"",initials:"BL",tags:["character","keyart","environment","stylized","fantasy"]},
      {id:13,publisher:"BLIZZARD",title:"The Art of Starcraft: Heart of the Swarm",color:"#ff7e3e",cover:"",initials:"BL",tags:["character","creature","props","sci-fi","stylized"]},
      {id:14,publisher:"BLIZZARD",title:"Diablo III Images",color:"#ff7e3e",cover:"",initials:"BL",tags:["character","creature","environment","dark fantasy","realistic"]},
      {id:15,publisher:"BLIZZARD",title:"Diablo III Reaper of Souls",color:"#ff7e3e",cover:"",initials:"BL",tags:["character","creature","environment","dark fantasy","realistic"]},
      {id:16,publisher:"BLIZZARD",title:"Tout l’art de Blizzard",color:"#ff7e3e",cover:"",initials:"BL",tags:["character","environment","props","stylized","fantasy"]},
      {id:17,publisher:"BLIZZARD",title:"Art of Hearthstone",color:"#ff7e3e",cover:"",initials:"BL",tags:["character","props","ui","stylized","fantasy"]},
      {id:18,publisher:"FROM SOFTWARE",title:"Elden Ring Vol.1",color:"#6ea8ff",cover:"",initials:"FS",tags:["character","creature","environment","dark fantasy","realistic"]},
      {id:19,publisher:"FROM SOFTWARE",title:"Elden Ring Vol.2",color:"#6ea8ff",cover:"",initials:"FS",tags:["character","creature","environment","dark fantasy","realistic"]},
      {id:20,publisher:"FROM SOFTWARE",title:"Bloodborne",color:"#6ea8ff",cover:"",initials:"FS",tags:["character","creature","environment","dark fantasy","horror"]},
      {id:21,publisher:"THQ",title:"The Art of Darksiders II",color:"#8e8e8e",cover:"",initials:"TH",tags:["character","creature","stylized","dark fantasy"]},
      {id:22,publisher:"ELECTRONIC ARTS",title:"Warhammer Online",color:"#58c18f",cover:"",initials:"EA",tags:["character","creature","dark fantasy","stylized"]},
      {id:23,publisher:"SABOTAGE STUDIO",title:"Sea of Stars",color:"#58c18f",cover:"",initials:"SS",tags:["character","environment","stylized","fantasy"]},
      {id:24,publisher:"NINTENDO",title:"Zelda: Tears of the Kingdom",color:"#e06d6d",cover:"",initials:"NI",tags:["environment","character","stylized","fantasy"]},
      {id:25,publisher:"BLIZZARD",title:"The Art of Overwatch",color:"#ff7e3e",cover:"",initials:"BL",tags:["character","props","ui","stylized","sci-fi"]},
      {id:26,publisher:"SUPERCELL",title:"The Art of Supercell",color:"#58c18f",cover:"",initials:"SC",tags:["character","props","ui","cartoon","stylized"]},
      {id:27,publisher:"miHoYo",title:"Genshin Impact Vol.1",color:"#c8a96e",cover:"",initials:"GI",tags:["character","environment","anime","stylized","fantasy"]},
      {id:28,publisher:"ARC SYSTEM WORKS",title:"Guilty Gear Xrd",color:"#e06d6d",cover:"",initials:"AW",tags:["character","anime","stylized"]},
      {id:29,publisher:"CARTOON NETWORK",title:"Rick and Morty",color:"#ff7e3e",cover:"",initials:"CN",tags:["character","environment","cartoon","sci-fi"]},
      {id:30,publisher:"SHIRO GAMES",title:"The Art of Northgard",color:"#e06d6d",cover:"",initials:"SG",tags:["environment","stylized","fantasy"]},
      {id:31,publisher:"GORILLAZ",title:"Jamie Hewlett",color:"#58c18f",cover:"",initials:"GZ",tags:["character","stylized","cartoon"]},
      {id:32,publisher:"NAUGHTY DOG",title:"The Art of The Last of Us",color:"#58c18f",cover:"",initials:"ND",tags:["character","environment","realistic","modern"]},
      {id:33,publisher:"NAUGHTY DOG",title:"The Art of The Last of Us Part II",color:"#58c18f",cover:"",initials:"ND",tags:["character","environment","realistic","modern"]},
      {id:34,publisher:"SANTA MONICA",title:"God of War",color:"#e06d6d",cover:"",initials:"SM",tags:["character","environment","creature","semi-realistic","fantasy"]},
      {id:35,publisher:"CRYSTAL DYNAMICS",title:"Tomb Raider",color:"#c8a96e",cover:"",initials:"CD",tags:["character","environment","realistic","modern"]},
      {id:36,publisher:"KOJIMA",title:"Metal Gear Solid V",color:"#d9bf68",cover:"",initials:"KJ",tags:["character","props","realistic","modern"]},
      {id:37,publisher:"EIDOS",title:"Marvel’s Guardians of the Galaxy",color:"#a67cf0",cover:"",initials:"EI",tags:["character","props","sci-fi","stylized"]},
      {id:38,publisher:"INSOMNIAC",title:"Spider-Man",color:"#58c18f",cover:"",initials:"IN",tags:["character","superhero","realistic"]},
      {id:39,publisher:"ROCKSTEADY",title:"Batman Arkham Knight",color:"#a67cf0",cover:"",initials:"RS",tags:["character","props","superhero","realistic"]},
      {id:40,publisher:"ROCKSTEADY",title:"Batman Arkham Origins",color:"#a67cf0",cover:"",initials:"RS",tags:["character","props","superhero","realistic"]},
      {id:41,publisher:"ROCKSTEADY",title:"Batman Arkham City",color:"#a67cf0",cover:"",initials:"RS",tags:["character","props","superhero","realistic"]},
      {id:42,publisher:"ROCKSTEADY",title:"Tout l’art de Batman",color:"#a67cf0",cover:"",initials:"RS",tags:["character","props","superhero","realistic"]},
      {id:43,publisher:"UBISOFT",title:"Assassin’s Creed Shadows",color:"#e06d6d",cover:"",initials:"UB",tags:["character","environment","historical","realistic"]},
      {id:44,publisher:"UBISOFT",title:"Assassin’s Creed Valhalla",color:"#e06d6d",cover:"",initials:"UB",tags:["character","environment","historical","realistic"]},
      {id:45,publisher:"UBISOFT",title:"Assassin’s Creed Origins",color:"#e06d6d",cover:"",initials:"UB",tags:["character","environment","historical","realistic"]},
      {id:46,publisher:"UBISOFT",title:"Assassin’s Creed III",color:"#e06d6d",cover:"",initials:"UB",tags:["character","environment","historical","realistic"]},
      {id:47,publisher:"UBISOFT",title:"Assassin’s Creed IV Black Flag",color:"#e06d6d",cover:"",initials:"UB",tags:["character","environment","historical","realistic"]},
      {id:48,publisher:"UBISOFT",title:"Assassin’s Creed Unity",color:"#e06d6d",cover:"",initials:"UB",tags:["character","environment","historical","realistic"]},
      {id:49,publisher:"UBISOFT",title:"Assassin’s Creed Syndicate",color:"#e06d6d",cover:"",initials:"UB",tags:["character","environment","historical","realistic"]},
      {id:50,publisher:"UBISOFT",title:"Assassin’s Creed Revelations",color:"#e06d6d",cover:"",initials:"UB",tags:["character","environment","historical","realistic"]},
      {id:51,publisher:"ELECTRONIC ARTS",title:"The Art of Dead Space",color:"#58c18f",cover:"",initials:"EA",tags:["character","creature","props","sci-fi","horror"]},
      {id:52,publisher:"KOJIMA",title:"The Art of Death Stranding",color:"#d9bf68",cover:"",initials:"KJ",tags:["character","environment","props","sci-fi","realistic"]},
      {id:53,publisher:"UBISOFT",title:"The Art of Watch Dogs",color:"#e06d6d",cover:"",initials:"UB",tags:["character","ui","props","modern","sci-fi"]},
      {id:54,publisher:"UBISOFT",title:"Watch Dogs Dedsec Edition",color:"#e06d6d",cover:"",initials:"UB",tags:["character","ui","props","modern","sci-fi"]},
      {id:55,publisher:"UBISOFT",title:"Tout l’art de Watch Dogs",color:"#e06d6d",cover:"",initials:"UB",tags:["character","ui","props","modern","sci-fi"]},
      {id:56,publisher:"CROTEAM",title:"The Art of Talos Principle II",color:"#6ea8ff",cover:"",initials:"CT",tags:["environment","props","sci-fi"]},
      {id:57,publisher:"ABLAZE",title:"Indie Games",color:"#58c18f",cover:"",initials:"AB",tags:["environment","stylized"]},
      {id:58,publisher:"GAMELOFT",title:"Gameloft 20 Years",color:"#a67cf0",cover:"",initials:"GL",tags:["environment","stylized"]},
      {id:59,publisher:"MICROSOFT",title:"Forza Motorsport 4",color:"#6ea8ff",cover:"",initials:"MS",tags:["props","realistic","modern"]},
      {id:60,publisher:"KONAMI",title:"Castlevania Lords of Shadow 2",color:"#6ea8ff",cover:"",initials:"KO",tags:["character","environment","dark fantasy"]},
      {id:61,publisher:"KONAMI",title:"Castlevania Animated Series",color:"#6ea8ff",cover:"",initials:"KO",tags:["character","environment","dark fantasy"]},
      {id:62,publisher:"3dtotal Publishing",title:"Dessin Fantasy : le manuel du débutant",color:"#58c18f",cover:"",initials:"3DT",tags:["character","stylized","study","anatomy","morphology"]},
      {id:63,publisher:"3dtotal Publishing",title:"Sketching from the Imagination: Characters",color:"#58c18f",cover:"",initials:"3DT",tags:["character","study","anatomy","morphology"]},
      {id:64,publisher:"Christopher Hart",title:"Figure It Out! Human Proportions: Draw the Head and Figure Right Every Time",color:"#6ea8ff",cover:"",initials:"CH",tags:["character","study","anatomy","morphology","realistic"]},
      {id:65,publisher:"DAIMON",title:"Dibujo anatómico de la figura humana",color:"#6ea8ff",cover:"",initials:"DA",tags:["character","study","anatomy","morphology","realistic"]},
      {id:66,publisher:"EYROLLES",title:"Morpho : Anatomie artistique",color:"#a67cf0",cover:"",initials:"ML",tags:["character","study","anatomy","morphology","realistic"]},
      {id:67,publisher:"EYROLLES",title:"Morpho : Anatomie des plis de vêtements",color:"#a67cf0",cover:"",initials:"ML",tags:["character","props","study","anatomy","morphology"]},
      {id:68,publisher:"EYROLLES",title:"Morpho Formes articulaires, fonctions musculaires",color:"#a67cf0",cover:"",initials:"ML",tags:["character","study","anatomy","morphology","realistic"]},
      {id:69,publisher:"EYROLLES",title:"Morpho Formes synthétiques",color:"#a67cf0",cover:"",initials:"ML",tags:["character","study","anatomy","morphology"]},
      {id:70,publisher:"EYROLLES",title:"Morpho : Mains et pieds",color:"#a67cf0",cover:"",initials:"ML",tags:["character","study","anatomy","morphology"]},
      {id:71,publisher:"EYROLLES",title:"Morpho XXL corps bodybuildés: Morpho : anatomie artistique",color:"#a67cf0",cover:"",initials:"ML",tags:["character","study","anatomy","morphology","realistic"]},
      {id:72,publisher:"EYROLLES",title:"Squelette, repères osseux",color:"#a67cf0",cover:"",initials:"ML",tags:["character","study","anatomy","morphology","realistic"]},
      {id:73,publisher:"TACO",title:"포인트 캐릭터 드로잉 세트(전2권)",color:"#ff7ac6",cover:"",initials:"TC",tags:["character","study","anatomy","morphology","stylized"]},
      {id:74,publisher:"7fallen",title:"Legendary Artworks 7 Fallen",color:"#ff7ac6",cover:"",initials:"7F",tags:["character","environment","stylized","fantasy"]},
      {id:75,publisher:"AWAKEN REALMS",title:"Labyrinth Artbook",color:"#6ea8ff",cover:"",initials:"AR",tags:["environment","props","dark fantasy"]},
      {id:76,publisher:"SUMO SHEFFIELD",title:"The Art of Sackboy, A Big Adventure",color:"#58c18f",cover:"",initials:"SS",tags:["character","environment","stylized","cartoon"]},
      {id:77,publisher:"UBISOFT",title:"Art de Far Cry 6",color:"#e06d6d",cover:"",initials:"UB",tags:["character","environment","realistic","modern"]},
      {id:78,publisher:"CRYSTAL DYNAMICS",title:"Shadow of the Tomb Raider: The Official Art Book",color:"#c8a96e",cover:"",initials:"CD",tags:["character","environment","realistic","modern"]},
      {id:79,publisher:"UBISOFT",title:"Art de Assassin's Creed Shadows - Artbook officiel",color:"#e06d6d",cover:"",initials:"UB",tags:["character","environment","historical","realistic"]}
    ];

    const goals = ["silueta", "color", "composición", "render", "storytelling visual", "diseño funcional", "mood", "claridad comercial", "worldbuilding", "ui thinking"];
    const goalExamples = {
      "silueta": "Ejemplo: un personaje debe leerse en negro sólido y seguir siendo reconocible por pose, volumen y accesorios principales.",
      "color": "Ejemplo: usa una paleta dominante de 3 colores y un acento para separar foco, fondo y secundarios.",
      "composición": "Ejemplo: organiza la imagen en una gran masa dominante, una secundaria y una zona de respiro visual.",
      "render": "Ejemplo: enfócate en un material protagonista como metal gastado, cuero o tela y diferencia bien bordes duros y suaves.",
      "storytelling visual": "Ejemplo: el diseño debe insinuar pasado, rol y conflicto sin texto, solo con forma, desgaste y detalles.",
      "diseño funcional": "Ejemplo: cada pieza del vestuario o prop debe parecer útil y tener lógica de uso dentro del universo.",
      "mood": "Ejemplo: prioriza atmósfera con luz, escala y niebla antes que detalle fino.",
      "claridad comercial": "Ejemplo: la pieza debe entenderse rápido, con un punto focal fuerte y lectura limpia incluso en miniatura.",
      "worldbuilding": "Ejemplo: agrega señales del mundo como símbolos, arquitectura, materiales o costumbres visuales coherentes.",
      "ui thinking": "Ejemplo: diseña una interfaz donde jerarquía, iconos y contraste permitan leer todo en segundos."
    };
    const typePrompts = {
      character: "diseñar un personaje nuevo inspirado en las reglas visuales de la referencia",
      environment: "crear un entorno o escena usando la atmósfera y el lenguaje visual del libro",
      props: "diseñar un objeto o set de props que parezcan pertenecer a ese universo",
      ui: "proponer una interfaz, HUD o set de iconos coherente con esa dirección de arte",
      creature: "diseñar una criatura con historia visible en su forma y materiales",
      keyart: "componer una imagen hero o key art con foco claro y lectura comercial"
    };
    const styleTwists = [
      "cambiando completamente el rol del sujeto",
      "llevado a un contexto latinoamericano",
      "con una paleta de solo 3 colores dominantes",
      "mezclando claridad Blizzard con drama cinematográfico",
      "con silueta más simple y lectura inmediata",
      "pensado como pieza de portafolio comercial",
      "reinterpretado para mobile game premium",
      "con una narrativa de decadencia o desgaste",
      "con contraste fuerte entre lo orgánico y lo artificial",
      "evitando cualquier copia directa de composición"
    ];
    const difficultyRules = {
      "fácil": "Haz una sola dirección clara y prioriza legibilidad sobre detalle.",
      "media": "Genera 2 thumbnails y elige una versión final con pequeño giro narrativo.",
      "alta": "Haz 3 thumbnails, mezcla dos influencias del mismo libro y añade una restricción formal fuerte."
    };
    const pageRanges = {
      character: [12, 58],
      creature: [22, 82],
      props: [40, 110],
      ui: [55, 135],
      environment: [48, 150],
      keyart: [90, 180]
    };

    let selectedBook = null;
    let currentMission = null;
    let saved = JSON.parse(localStorage.getItem("artbook_training_sessions") || "[]");
    const customBooks = JSON.parse(localStorage.getItem("artbook_custom_books") || "[]");
    if (customBooks.length) books.push(...customBooks);
    const persistedCovers = JSON.parse(localStorage.getItem("artbook_auto_covers") || "{}");
    books.forEach(book => {
      if (!book.cover && persistedCovers[book.id]) book.cover = persistedCovers[book.id];
    });

    const hasSupabaseConfig = !SUPABASE_URL.includes("TU_") && !SUPABASE_PUBLISHABLE_KEY.includes("TU_");
    const supabaseClient = hasSupabaseConfig ? window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY) : null;

    const protectedApp = document.getElementById("protectedApp");
    const authEmail = document.getElementById("authEmail");
    const authPassword = document.getElementById("authPassword");
    const authStatus = document.getElementById("authStatus");
    const loginBtn = document.getElementById("loginBtn");
    const signupBtn = document.getElementById("signupBtn");
    const logoutBtn = document.getElementById("logoutBtn");

    const libraryEl = document.getElementById("library");
    const searchInput = document.getElementById("searchInput");
    const filterType = document.getElementById("filterType");
    const filterStyle = document.getElementById("filterStyle");
    const filterWorld = document.getElementById("filterWorld");
    const selectedBookCard = document.getElementById("selectedBookCard");
    const briefOutput = document.getElementById("briefOutput");
    const savedSessions = document.getElementById("savedSessions");
    const manualMode = document.getElementById("manualMode");
    const randomMode = document.getElementById("randomMode");
    const manualModeBtn = document.getElementById("manualModeBtn");
    const randomModeBtn = document.getElementById("randomModeBtn");
    const goalChips = document.getElementById("goalChips");
    const addBookBtn = document.getElementById("addBookBtn");
    const autoFillBtn = document.getElementById("autoFillBtn");
    const coverStatus = document.getElementById("coverStatus");
    const addBookModal = document.getElementById("addBookModal");
    const modalBackdrop = document.getElementById("modalBackdrop");
    const closeModalBtn = document.getElementById("closeModalBtn");
    const cancelModalBtn = document.getElementById("cancelModalBtn");
    const saveBookBtn = document.getElementById("saveBookBtn");
    const bookTagChips = document.getElementById("bookTagChips");
    const newBookTitle = document.getElementById("newBookTitle");
    const newBookPublisher = document.getElementById("newBookPublisher");
    const newBookInitials = document.getElementById("newBookInitials");
    const newBookColor = document.getElementById("newBookColor");
    const newBookCover = document.getElementById("newBookCover");
    const newBookNotes = document.getElementById("newBookNotes");
    const newBookPreview = document.getElementById("newBookPreview");
    const missionCard = document.getElementById("missionCard");
    const rollBtn = document.getElementById("rollBtn");

    function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
    function pickPage(type) {
      const [min, max] = pageRanges[type] || [20, 120];
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    function inferPrimaryGoal(book, type) {
      if (type === "ui") return "ui thinking";
      if (type === "environment") return "mood";
      if (type === "keyart") return "composición";
      if (book.tags.includes("stylized")) return "claridad comercial";
      if (book.tags.includes("realistic")) return "render";
      return "silueta";
    }
    function setAuthStatus(message, isError = false) {
      authStatus.textContent = message;
      authStatus.classList.remove("hidden");
      authStatus.style.borderColor = isError ? "rgba(255,107,138,0.35)" : "rgba(255,255,255,0.1)";
      authStatus.style.color = isError ? "#ffd5dd" : "var(--muted)";
    }

    function clearAuthStatus() {
      authStatus.classList.add("hidden");
      authStatus.textContent = "";
    }

    function showApp() {
      authScreen.classList.add("hidden");
      protectedApp.classList.remove("hidden");
    }

    function showLogin() {
      protectedApp.classList.add("hidden");
      authScreen.classList.remove("hidden");
    }

    async function restoreSession() {
      if (!supabaseClient) {
        showLogin();
        setAuthStatus("Configura Supabase para activar el acceso real.", true);
        return;
      }
      const { data, error } = await supabaseClient.auth.getSession();
      if (error) {
        showLogin();
        setAuthStatus(error.message, true);
        return;
      }
      if (data.session) {
        showApp();
      } else {
        showLogin();
      }
    }

    async function handleLogin() {
      if (!supabaseClient) {
        setAuthStatus("Falta configurar Supabase.", true);
        return;
      }
      clearAuthStatus();
      const email = authEmail.value.trim();
      const password = authPassword.value;
      if (!email || !password) {
        setAuthStatus("Escribe email y contraseña.", true);
        return;
      }
      loginBtn.disabled = true;
      try {
        const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) {
          setAuthStatus(error.message, true);
          return;
        }
        showApp();
      } finally {
        loginBtn.disabled = false;
      }
    }

    async function handleSignup() {
      if (!supabaseClient) {
        setAuthStatus("Falta configurar Supabase.", true);
        return;
      }
      clearAuthStatus();
      const email = authEmail.value.trim();
      const password = authPassword.value;
      if (!email || !password) {
        setAuthStatus("Escribe email y contraseña.", true);
        return;
      }
      signupBtn.disabled = true;
      try {
        const { error } = await supabaseClient.auth.signUp({ email, password });
        if (error) {
          setAuthStatus(error.message, true);
          return;
        }
        setAuthStatus("Cuenta creada. Revisa tu email si tienes confirmación activada.");
      } finally {
        signupBtn.disabled = false;
      }
    }

    async function handleLogout() {
      if (!supabaseClient) return;
      await supabaseClient.auth.signOut();
      showLogin();
      clearAuthStatus();
      authPassword.value = "";
    }

    function showStatus(message) {
      coverStatus.textContent = message;
      coverStatus.classList.remove("hidden");
    }
    function hideStatus() {
      coverStatus.classList.add("hidden");
    }

    function initGoals() {
      goalChips.innerHTML = goals.map(goal => `
        <div class="chip-wrap">
          <button class="chip" data-goal="${goal}" type="button">${goal}</button>
          <div class="chip-tip" role="tooltip">
            <h5>${goal}</h5>
            <p>${goalExamples[goal]}</p>
          </div>
        </div>
      `).join("");
      goalChips.querySelectorAll(".chip").forEach(chip => {
        chip.addEventListener("click", () => chip.classList.toggle("active"));
      });
    }

    function initBookTags() {
      const tagPool = ["character","environment","props","ui","creature","keyart","stylized","realistic","semi-realistic","cartoon","anime","fantasy","dark fantasy","sci-fi","modern","historical","horror","superhero"];
      bookTagChips.innerHTML = `<div class="tag-picker">${tagPool.map(tag => `<button class="chip" type="button" data-book-tag="${tag}">${tag}</button>`).join("")}</div>`;
      bookTagChips.querySelectorAll("[data-book-tag]").forEach(chip => {
        chip.addEventListener("click", () => {
          chip.classList.toggle("active");
          updateNewBookPreview();
        });
      });
    }

    function getSelectedGoals() {
      return [...goalChips.querySelectorAll(".chip.active")].map(chip => chip.dataset.goal);
    }
    function getSelectedBookTags() {
      return [...bookTagChips.querySelectorAll("[data-book-tag].active")].map(el => el.dataset.bookTag);
    }

    function makeThumbStyle(color) {
      return `linear-gradient(160deg, ${color}88, rgba(255,255,255,0.04) 40%, rgba(10,12,22,0.28)), radial-gradient(circle at 30% 20%, rgba(255,255,255,0.18), transparent 28%)`;
    }
    function makeThumbMarkup(book, width = 56, height = 72) {
      const hasCover = !!book.cover;
      const safeCover = hasCover ? String(book.cover).replace(/'/g, "%27") : "";
      const style = hasCover
        ? `background-image: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(0,0,0,0.08)), url('${safeCover}'); width:${width}px; height:${height}px;`
        : `background:${makeThumbStyle(book.color)}; width:${width}px; height:${height}px;`;
      return `<div class="book-thumb${hasCover ? " has-cover" : ""}" style="${style}"><span>${book.initials}</span></div>`;
    }

    function renderLibrary() {
      const q = searchInput.value.trim().toLowerCase();
      const type = filterType.value;
      const style = filterStyle.value;
      const world = filterWorld.value;

      const items = books.filter(book => {
        const haystack = `${book.title} ${book.publisher} ${book.tags.join(" ")}`.toLowerCase();
        return (!q || haystack.includes(q)) && (!type || book.tags.includes(type)) && (!style || book.tags.includes(style)) && (!world || book.tags.includes(world));
      });

      libraryEl.innerHTML = "";
      if (!items.length) {
        libraryEl.innerHTML = `<div class="mini-card"><h4>Sin resultados</h4><p>Prueba con otro filtro o búsqueda.</p></div>`;
        return;
      }

      items.forEach(book => {
        const node = document.createElement("button");
        node.type = "button";
        node.className = `book${selectedBook && selectedBook.id === book.id ? " active" : ""}`;
        const tags = book.tags.slice(0, 2).join(" · ");
        node.innerHTML = `${makeThumbMarkup(book)}<div class="book-meta"><div class="book-title">${book.title}</div><div class="book-sub">${book.publisher} · ${tags}</div></div>`;
        node.addEventListener("click", () => selectBook(book.id));
        libraryEl.appendChild(node);
      });
    }

    function selectBook(id) {
      selectedBook = books.find(b => b.id === id) || null;
      renderLibrary();
      renderSelectedBook();
      if (selectedBook) {
        document.getElementById("headerEyebrow").textContent = selectedBook.publisher;
        document.getElementById("headerTitle").textContent = selectedBook.title;
        document.getElementById("headerDesc").textContent = `Tags: ${selectedBook.tags.join(", ")}. Puedes usar este libro como base para un ejercicio manual o pedir una sugerencia de página plausible.`;
      }
    }

    function getBookStrength(book) {
      if (book.tags.includes("ui")) return "Muy útil para UI, iconografía, diseño funcional y ejercicios con constraints claros.";
      if (book.tags.includes("dark fantasy")) return "Excelente para storytelling visual, silueta rota, materiales envejecidos y atmósfera.";
      if (book.tags.includes("stylized")) return "Perfecto para claridad comercial, appeal de personaje y lenguaje visual fuerte.";
      if (book.tags.includes("realistic")) return "Ideal para credibilidad de materiales, composición cinematográfica y portafolio profesional.";
      return "Buen libro para exploración visual general y ejercicios de reinterpretación.";
    }

    function renderSelectedBook() {
      if (!selectedBook) {
        selectedBookCard.innerHTML = `<div class="mini-card"><h4>Sin libro seleccionado</h4><p>Selecciona un artbook en la columna izquierda. Luego podrás generar un ejercicio manual a partir de ese libro.</p></div>`;
        return;
      }
      selectedBookCard.innerHTML = `
        <div class="mini-card">
          <div style="display:flex; gap:12px; align-items:center; margin-bottom:10px;">
            ${makeThumbMarkup(selectedBook, 64, 84)}
            <div>
              <h4 style="margin:0 0 4px; font-size:15px;">${selectedBook.title}</h4>
              <p><strong style="color:var(--text)">${selectedBook.publisher}</strong><br>${selectedBook.tags.join(" · ")}</p>
            </div>
          </div>
        </div>
        <div class="mini-card">
          <h4>Uso recomendado</h4>
          <p>${getBookStrength(selectedBook)}</p>
        </div>
      `;
    }

    function buildConcept(book, type, goal, twist) {
      return `Vas a ${typePrompts[type]}. El foco principal será ${goal}. La referencia debe servirte para extraer reglas visuales del universo de ${book.title}, no para copiar literalmente, ${twist}.`;
    }
    function buildAnalysis(book, type) {
      const style = book.tags.find(t => ["stylized","realistic","semi-realistic","cartoon","anime"].includes(t)) || "estilo mixto";
      const world = book.tags.find(t => ["fantasy","dark fantasy","sci-fi","modern","historical","horror","superhero"].includes(t)) || "universo híbrido";
      const lines = [`Observa cómo ${book.title} maneja un lenguaje ${style} dentro de un universo ${world}.`];
      if (type === "character") lines.push("Fíjate en silueta, jerarquía de detalle, vestuario y punto focal en rostro/manos.");
      if (type === "environment") lines.push("Analiza profundidad, agrupación de masas, luz dominante y lectura a distancia.");
      if (type === "props") lines.push("Mira proporciones, materiales, desgaste y función del objeto dentro del mundo.");
      if (type === "ui") lines.push("Observa legibilidad, iconografía, contraste, modularidad y ritmo de la interfaz.");
      if (type === "creature") lines.push("Busca qué partes cuentan la historia: anatomía alterada, materiales, peso y amenaza.");
      if (type === "keyart") lines.push("Analiza foco, gesto general, recorrido visual y relación entre figura y fondo.");
      return lines.join(" ");
    }
    function buildChallenge(book, type, difficulty, goal, twist) {
      return `Tu reto es resolver un ejercicio de ${type} útil para portafolio, entrenando ${goal}. Nivel ${difficulty}: ${difficultyRules[difficulty]} Además: ${twist}. Evita calcar pose, composición o diseño existente; traduce principios, no resultados.`;
    }
    function buildSteps(type, difficulty, time) {
      return [
        "Haz una lectura rápida de la referencia en 30 segundos y anota 3 reglas visuales clave.",
        difficulty === "alta" ? "Genera 3 thumbnails con enfoques distintos y fuerza una variación radical en al menos uno." : "Genera 2 thumbnails pequeños antes de comprometerte con una sola dirección.",
        `Desarrolla la opción con mejor lectura para ${type}, adaptándola al tiempo disponible (${time}).`,
        "Refuerza el punto focal con contraste, jerarquía de detalle y una silueta clara.",
        "Termina con una mini revisión escrita: qué tomaste del libro y qué transformaste."
      ];
    }
    function buildDeliverable(type, difficulty, time) {
      const thumbs = difficulty === "fácil" ? 1 : difficulty === "media" ? 2 : 3;
      return `Entrega: ${thumbs} thumbnail(s), 1 pieza principal de tipo ${type}, y 3 notas de aprendizaje. Escala el acabado al tiempo de ${time}.`;
    }
    function buildSuccessCriteria(type, goal) {
      return [
        `La pieza se entiende rápido incluso sin explicar el contexto (${type}).`,
        `Se percibe una intención clara de ${goal} y no parece una copia del original.`,
        "Tiene suficiente personalidad para funcionar como estudio sólido o base de portafolio."
      ];
    }
    function buildChatGPTPrompt(book, page, type, difficulty, time, goals, notes, twist) {
      return `Modo entrenamiento. Libro #${book.id}: ${book.title}. Página ${page}. Tipo: ${type}. Dificultad: ${difficulty}. Tiempo: ${time}. Objetivos: ${goals.join(", ") || "ninguno especificado"}. Giro: ${twist}. Notas: ${notes || "ninguna"}. Dame un brief más profundo con análisis visual, restricciones, pasos y criterios de éxito.`;
    }
    function buildBrief({ book, page, type, difficulty, time, goals, notes, mode, twist }) {
      const mainGoal = goals[0] || inferPrimaryGoal(book, type);
      return {
        book, page, type, difficulty, time, goals, notes, mode, twist,
        concept: buildConcept(book, type, mainGoal, twist),
        analysis: buildAnalysis(book, type),
        challenge: buildChallenge(book, type, difficulty, mainGoal, twist),
        steps: buildSteps(type, difficulty, time),
        deliverable: buildDeliverable(type, difficulty, time),
        success: buildSuccessCriteria(type, mainGoal),
        prompt: buildChatGPTPrompt(book, page, type, difficulty, time, goals, notes, twist)
      };
    }

    function renderBrief(brief) {
      const goalsText = brief.goals.length ? brief.goals.join(" · ") : "objetivo automático";
      briefOutput.innerHTML = `
        <h3>${brief.mode === "random" ? "Misión generada" : "Brief personalizado"}</h3>
        <div class="section">
          <small>Referencia</small>
          <p><strong style="color:var(--text)">#${brief.book.id} · ${brief.book.title}</strong><br>${brief.book.publisher} · página ${brief.page} · ${brief.type} · dificultad ${brief.difficulty} · ${brief.time}</p>
        </div>
        <div class="section"><small>Objetivo</small><p>${brief.concept}</p></div>
        <div class="section"><small>Qué analizar</small><p>${brief.analysis}</p></div>
        <div class="section"><small>Desafío</small><p>${brief.challenge}</p></div>
        <div class="section"><small>Pasos</small><ul>${brief.steps.map(step => `<li>${step}</li>`).join("")}</ul></div>
        <div class="section"><small>Entregable</small><p>${brief.deliverable}</p></div>
        <div class="section"><small>Criterios de éxito</small><ul>${brief.success.map(item => `<li>${item}</li>`).join("")}</ul></div>
        <div class="section"><small>Objetivos activos</small><p>${goalsText}</p></div>
        <div class="section">
          <small>Prompt para traer a ChatGPT</small>
          <textarea readonly id="promptBox">${brief.prompt}</textarea>
          <div class="actions" style="margin-top:10px;">
            <button class="btn" onclick="copyPrompt()" type="button">Copiar prompt</button>
            <button class="btn ghost" onclick="saveCurrentBrief()" type="button">Guardar sesión</button>
          </div>
        </div>
      `;
      window.latestBrief = brief;
    }

    function filteredBooksForTraining() {
      const type = filterType.value;
      const style = filterStyle.value;
      const world = filterWorld.value;
      return books.filter(book => (!type || book.tags.includes(type)) && (!style || book.tags.includes(style)) && (!world || book.tags.includes(world)));
    }

    function renderMission(brief) {
      missionCard.classList.remove("rolling");
      missionCard.innerHTML = `
        <div class="mission-top">
          <div class="mission-book">
            ${makeThumbMarkup(brief.book, 58, 78)}
            <div>
              <h3 class="mission-title">#${brief.book.id} · ${brief.book.title}</h3>
              <div class="mission-sub">${brief.book.publisher}</div>
            </div>
          </div>
          <div class="mission-page"><strong>${brief.page}</strong><span>página</span></div>
        </div>
        <div class="mission-sub" style="margin-bottom:12px; color:var(--text)">Crea un ${brief.type} inspirado en este libro, ${brief.twist}.</div>
        <div class="tags">
          <span class="tag type">${brief.type}</span>
          <span class="tag style">${brief.book.tags.find(t => ["stylized","realistic","semi-realistic","cartoon","anime"].includes(t)) || "mixed"}</span>
          <span class="tag world">${brief.book.tags.find(t => ["fantasy","dark fantasy","sci-fi","modern","historical","horror","superhero"].includes(t)) || "world"}</span>
          <span class="tag goal">${brief.goals[0]}</span>
        </div>
      `;
    }

    function generateManualBrief() {
      if (!selectedBook) {
        alert("Selecciona primero un artbook.");
        return;
      }
      const type = document.getElementById("manualType").value;
      const difficulty = document.getElementById("manualDifficulty").value;
      const time = document.getElementById("manualTime").value;
      const page = Number(document.getElementById("manualPage").value) || pickPage(type);
      const notes = document.getElementById("manualNotes").value.trim();
      const goals = getSelectedGoals();
      renderBrief(buildBrief({ book: selectedBook, page, type, difficulty, time, goals, notes, mode: "manual", twist: pickRandom(styleTwists) }));
    }
    function suggestPageForSelected() {
      if (!selectedBook) return;
      const type = document.getElementById("manualType").value;
      document.getElementById("manualPage").value = pickPage(type);
    }

    function launchTraining() {
      rollBtn.disabled = true;
      rollBtn.textContent = "🎲 Lanzando...";
      missionCard.classList.add("rolling");
      let spins = 0;
      const spinInterval = setInterval(() => {
        spins += 1;
        const fakeBook = pickRandom(books);
        missionCard.innerHTML = `<div style="display:flex; align-items:center; justify-content:center; min-height:118px; text-align:center; font-size:18px; color:var(--accent-2); opacity:0.84;">🎲 ${fakeBook.title}</div>`;
        if (spins >= 10) {
          clearInterval(spinInterval);
          const pool = filteredBooksForTraining();
          const book = pickRandom(pool.length ? pool : books);
          const typeCandidates = ["character","environment","props","ui","creature","keyart"].filter(t => book.tags.includes(t) || t === "keyart");
          const type = pickRandom(typeCandidates.length ? typeCandidates : ["character"]);
          const difficulty = pickRandom(["fácil","media","alta"]);
          const time = pickRandom(["30 min","45 min","1 hora","2 horas"]);
          const page = pickPage(type);
          const twist = pickRandom(styleTwists);
          const goals = [inferPrimaryGoal(book, type)];
          currentMission = buildBrief({ book, page, type, difficulty, time, goals, notes: "", mode: "random", twist });
          renderMission(currentMission);
          renderBrief(currentMission);
          rollBtn.disabled = false;
          rollBtn.textContent = "🎲 Lanzar entrenamiento";
        }
      }, 120);
    }

    function rerollBook() {
      if (!currentMission) return launchTraining();
      const similar = filteredBooksForTraining().filter(b => b.id !== currentMission.book.id);
      const nextBook = pickRandom(similar.length ? similar : books);
      currentMission = buildBrief({
        book: nextBook,
        page: pickPage(currentMission.type),
        type: currentMission.type,
        difficulty: currentMission.difficulty,
        time: currentMission.time,
        goals: [inferPrimaryGoal(nextBook, currentMission.type)],
        notes: currentMission.notes,
        mode: currentMission.mode,
        twist: currentMission.twist
      });
      renderMission(currentMission);
      renderBrief(currentMission);
    }

    function rerollTwist() {
      if (!currentMission) return launchTraining();
      currentMission = buildBrief({
        book: currentMission.book,
        page: currentMission.page,
        type: currentMission.type,
        difficulty: currentMission.difficulty,
        time: currentMission.time,
        goals: currentMission.goals,
        notes: currentMission.notes,
        mode: currentMission.mode,
        twist: pickRandom(styleTwists)
      });
      renderMission(currentMission);
      renderBrief(currentMission);
    }

    function renderSaved() {
      if (!saved.length) {
        savedSessions.innerHTML = `<div class="mini-card"><h4>Sin sesiones guardadas</h4><p>Cuando generes un brief podrás guardarlo aquí.</p></div>`;
        return;
      }
      savedSessions.innerHTML = saved.slice(0, 12).map(item => `
        <div class="session-item">
          <strong>${item.title}</strong>
          <span>${item.date} · ${item.mode} · ${item.type} · ${item.difficulty}</span>
        </div>
      `).join("");
    }

    function saveCurrentBrief() {
      if (!window.latestBrief) return;
      saved.unshift({
        id: Date.now(),
        date: new Date().toLocaleDateString("es-ES"),
        title: `${window.latestBrief.book.title} · p.${window.latestBrief.page}`,
        mode: window.latestBrief.mode,
        type: window.latestBrief.type,
        difficulty: window.latestBrief.difficulty,
        summary: window.latestBrief.concept
      });
      localStorage.setItem("artbook_training_sessions", JSON.stringify(saved));
      renderSaved();
    }

    function exportSessions() {
      const blob = new Blob([JSON.stringify(saved, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "artbook-training-sessions.json";
      a.click();
      URL.revokeObjectURL(url);
    }

    function clearSessions() {
      if (!confirm("¿Borrar todo el historial guardado?")) return;
      saved = [];
      localStorage.setItem("artbook_training_sessions", JSON.stringify(saved));
      renderSaved();
    }

    function copyPrompt() {
      const box = document.getElementById("promptBox");
      if (!box) return;
      navigator.clipboard.writeText(box.value);
    }

    function openAddBookModal() {
      addBookModal.classList.remove("hidden");
      addBookModal.setAttribute("aria-hidden", "false");
      updateNewBookPreview();
      setTimeout(() => newBookTitle.focus(), 30);
    }
    function closeAddBookModal() {
      addBookModal.classList.add("hidden");
      addBookModal.setAttribute("aria-hidden", "true");
    }
    function updateNewBookPreview() {
      const title = newBookTitle.value.trim() || "Título del artbook";
      const publisher = newBookPublisher.value.trim() || "Editorial / Estudio";
      const initials = (newBookInitials.value.trim() || title.slice(0, 2) || "AB").toUpperCase().slice(0, 3);
      const color = newBookColor.value || "#a78bfa";
      const cover = newBookCover.value.trim();
      const tags = getSelectedBookTags();
      const notes = newBookNotes.value.trim();
      newBookPreview.innerHTML = `
        <h4>Vista previa</h4>
        <div style="display:flex; gap:12px; align-items:center; margin-bottom:10px;">
          ${makeThumbMarkup({ initials, color, cover }, 52, 70)}
          <div>
            <div style="color:var(--text); font-weight:700;">${title}</div>
            <div style="color:var(--muted); font-size:12px;">${publisher}</div>
          </div>
        </div>
        <p>${tags.length ? tags.join(" · ") : "Sin tags seleccionados todavía."}${notes ? `<br><br>${notes}` : ""}</p>
      `;
    }

    function normalizeTitleForCompare(title) {
      return String(title || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
    }

    function findPotentialDuplicate(title) {
      const normalizedNew = normalizeTitleForCompare(title);
      if (!normalizedNew) return null;
      return books.find(book => {
        const normalizedExisting = normalizeTitleForCompare(book.title);
        return normalizedExisting === normalizedNew ||
          normalizedExisting.includes(normalizedNew) ||
          normalizedNew.includes(normalizedExisting);
      }) || null;
    }

    function saveNewBook() {
      const title = newBookTitle.value.trim();
      const publisher = newBookPublisher.value.trim();
      const initials = (newBookInitials.value.trim() || title.slice(0, 2) || "AB").toUpperCase().slice(0, 3);
      const color = newBookColor.value || "#a78bfa";
      const cover = newBookCover.value.trim();
      const tags = getSelectedBookTags();
      if (!title || !publisher) {
        alert("Completa al menos el título y la editorial/estudio.");
        return;
      }

      const duplicate = findPotentialDuplicate(title);
      if (duplicate) {
        const keepGoing = confirm(`Parece que este libro ya existe en tu base:\n\n#${duplicate.id} · ${duplicate.title}\n\nSi continúas, se añadirá igualmente como una entrada nueva. ¿Quieres seguir?`);
        if (!keepGoing) return;
      }

      const nextId = Math.max(...books.map(b => b.id), 0) + 1;
      const newBook = { id: nextId, title, publisher, initials, color, cover, tags };
      books.push(newBook);
      const existingCustom = JSON.parse(localStorage.getItem("artbook_custom_books") || "[]");
      existingCustom.push(newBook);
      localStorage.setItem("artbook_custom_books", JSON.stringify(existingCustom));
      closeAddBookModal();
      newBookTitle.value = "";
      newBookPublisher.value = "";
      newBookInitials.value = "";
      newBookColor.value = "#a78bfa";
      newBookCover.value = "";
      newBookNotes.value = "";
      bookTagChips.querySelectorAll("[data-book-tag].active").forEach(el => el.classList.remove("active"));
      updateNewBookPreview();
      selectBook(nextId);
      renderLibrary();
    }

    async function fetchCoverForBook(book) {
      const query = `intitle:${book.title} inpublisher:${book.publisher}`;
      const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=1&projection=lite&printType=books`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const thumb = data?.items?.[0]?.volumeInfo?.imageLinks?.thumbnail || data?.items?.[0]?.volumeInfo?.imageLinks?.smallThumbnail || "";
      return thumb ? thumb.replace(/^http:/, "https:") : "";
    }

    async function autoFillCovers() {
      autoFillBtn.disabled = true;
      showStatus("Buscando portadas automáticamente...");
      const coverStore = JSON.parse(localStorage.getItem("artbook_auto_covers") || "{}");
      const toProcess = books.filter(book => !book.cover);
      let found = 0;
      let checked = 0;

      for (const book of toProcess) {
        try {
          const cover = await fetchCoverForBook(book);
          checked += 1;
          if (cover) {
            book.cover = cover;
            coverStore[book.id] = cover;
            found += 1;
          }
          showStatus(`Buscando portadas... ${checked}/${toProcess.length} · encontradas ${found}`);
          renderLibrary();
          if (selectedBook && selectedBook.id === book.id) renderSelectedBook();
        } catch (err) {
          checked += 1;
          showStatus(`Buscando portadas... ${checked}/${toProcess.length} · encontradas ${found}`);
        }
        await new Promise(resolve => setTimeout(resolve, 120));
      }

      localStorage.setItem("artbook_auto_covers", JSON.stringify(coverStore));
      showStatus(`Proceso terminado: ${found} portada(s) encontradas de ${toProcess.length} libro(s) sin cover.`);
      autoFillBtn.disabled = false;
    }

    function setMode(mode) {
      const manualActive = mode === "manual";
      manualMode.classList.toggle("hidden", !manualActive);
      randomMode.classList.toggle("hidden", manualActive);
      manualMode.classList.toggle("active", manualActive);
      randomMode.classList.toggle("active", !manualActive);
      manualModeBtn.classList.toggle("active", manualActive);
      randomModeBtn.classList.toggle("active", !manualActive);
    }

    searchInput.addEventListener("input", renderLibrary);
    filterType.addEventListener("change", renderLibrary);
    filterStyle.addEventListener("change", renderLibrary);
    filterWorld.addEventListener("change", renderLibrary);
    manualModeBtn.addEventListener("click", () => setMode("manual"));
    randomModeBtn.addEventListener("click", () => setMode("random"));
    document.getElementById("generateManualBtn").addEventListener("click", generateManualBrief);
    document.getElementById("useSelectedPageBtn").addEventListener("click", suggestPageForSelected);
    rollBtn.addEventListener("click", launchTraining);
    document.getElementById("rerollBookBtn").addEventListener("click", rerollBook);
    document.getElementById("rerollTwistBtn").addEventListener("click", rerollTwist);
    document.getElementById("saveSessionBtn").addEventListener("click", saveCurrentBrief);
    document.getElementById("exportBtn").addEventListener("click", exportSessions);
    document.getElementById("clearBtn").addEventListener("click", clearSessions);
    addBookBtn.addEventListener("click", openAddBookModal);
    autoFillBtn.addEventListener("click", autoFillCovers);
    modalBackdrop.addEventListener("click", closeAddBookModal);
    closeModalBtn.addEventListener("click", closeAddBookModal);
    cancelModalBtn.addEventListener("click", closeAddBookModal);
    saveBookBtn.addEventListener("click", saveNewBook);
    [newBookTitle, newBookPublisher, newBookInitials, newBookColor, newBookCover, newBookNotes].forEach(el => el.addEventListener("input", updateNewBookPreview));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !addBookModal.classList.contains("hidden")) closeAddBookModal();
    });

    function runTests() {
      console.assert(typeof fetchCoverForBook === "function", "fetchCoverForBook should exist");
      console.assert(fetchCoverForBook.constructor.name === "AsyncFunction", "fetchCoverForBook should be async");
      console.assert(typeof autoFillCovers === "function", "autoFillCovers should exist");
      console.assert(autoFillCovers.constructor.name === "AsyncFunction", "autoFillCovers should be async");
      console.assert(Array.isArray(books) && books.length > 0, "books should be a non-empty array");
      console.assert(books[books.length - 1].id === 79, "last seeded book id should be 79");
      console.assert(typeof handleLogin === "function", "handleLogin should exist");
      console.assert(typeof handleSignup === "function", "handleSignup should exist");
    }

    if (supabaseClient) {
      supabaseClient.auth.onAuthStateChange((event, session) => {
        if (session) {
          showApp();
        } else if (event === "SIGNED_OUT") {
          showLogin();
        }
      });
    }

    loginBtn.addEventListener("click", handleLogin);
    signupBtn.addEventListener("click", handleSignup);
    logoutBtn.addEventListener("click", handleLogout);
    authPassword.addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleLogin();
    });

    initGoals();
    initBookTags();
    updateNewBookPreview();
    renderLibrary();
    renderSelectedBook();
    renderSaved();
    runTests();
    restoreSession();

    window.copyPrompt = copyPrompt;
    window.saveCurrentBrief = saveCurrentBrief;
