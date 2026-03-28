let books = [];
let seededBookCount = 0;
let selectedBook = null;
let currentMission = null;
let referenceImageDataUrl = "";
let referenceImageName = "";
const expandedPublishers = new Set();
function parseStoredJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.warn(`Ignoring invalid localStorage data for ${key}.`, error);
    return fallback;
  }
}

let saved = parseStoredJson("artbook_training_sessions", []);

const MANUAL_COVER_KEY = "artbook_manual_covers";
const CUSTOM_BOOKS_KEY = "artbook_custom_books";
const COVER_CACHE_KEY = "artbook_auto_covers";
const COVER_MISS_CACHE_KEY = "artbook_cover_misses";
const coverProbeCache = new Map();

const pageRanges = {
  character: [12, 58],
  creature: [22, 82],
  props: [40, 110],
  ui: [55, 135],
  environment: [48, 150],
  keyart: [90, 180]
};

const typeCopy = {
  character: "character design",
  environment: "environment work",
  props: "prop design",
  ui: "ui design",
  creature: "creature design",
  keyart: "key art"
};

const difficultyCopy = {
  easy: "easy",
  medium: "medium",
  hard: "hard"
};

const creationTypeOptions = [
  { value: "reinterpret-style", label: "Reinterpretation of style" },
  { value: "palette-inspired", label: "Original concept from the palette" },
  { value: "crossover", label: "Crossover between two worlds" },
  { value: "alt-era", label: "Alternate era / world version" },
  { value: "character-inspired", label: "Character design from the aesthetic" },
  { value: "environment-level", label: "Environment / level design" },
  { value: "ui-inspired", label: "UI / interface inspired piece" },
  { value: "lighting-color", label: "Lighting and color study" },
  { value: "stylized-fanart", label: "Stylized fan art" },
  { value: "branding-world", label: "Typography / world branding exploration" }
];

const exploreElementOptions = ["Color palette", "Composition", "Lighting", "Textures", "Perspective", "Anatomy / Figure", "Mood / Atmosphere", "Prop design", "Line art", "Special effects"];
const toolOptions = ["Photoshop", "Procreate", "Blender 3D", "Traditional illustration", "After Effects", "Figma / UI"];

const skillTemplates = {
  ui: {
    label: "UI",
    analyze: ["hierarchy", "readability", "icon language", "spacing"],
    objective: ({ book, page, notes }) => `Design a UI study inspired by page ${page} of ${book.title}. Focus on clarity first and keep the screen readable at a glance.${notes ? ` Note: ${notes}` : ""}`,
    task: ({ difficulty }) => ({
      easy: "Design 1 UI panel + 3 icons",
      medium: "Design 1 UI screen + 5 icons",
      hard: "Design 2 UI states + 6 icons"
    }[difficulty])
  },
  "character-design": {
    label: "Character Design",
    analyze: ["shape language", "proportions", "costume logic", "detail hierarchy"],
    objective: ({ book, notes }) => `Create a character concept using the visual language of ${book.title}. Push readability, role, and world fit.${notes ? ` Note: ${notes}` : ""}`,
    task: ({ difficulty }) => ({
      easy: "3 silhouettes -> 1 clean sketch",
      medium: "4 silhouettes -> 1 refined sketch -> color pass",
      hard: "5 silhouettes -> 2 variations -> 1 final render"
    }[difficulty])
  },
  sketching: {
    label: "Sketching",
    analyze: ["structure", "gesture", "big shapes", "proportion"],
    objective: ({ book, type, notes }) => `Use ${book.title} as reference for fast ${typeCopy[type]} studies. Stay loose and prioritize observation over polish.${notes ? ` Note: ${notes}` : ""}`,
    task: ({ time, difficulty }) => {
      if (time === "30 min") return "Sketch 6 fast studies (3-4 min each)";
      if (difficulty === "hard") return "Sketch 12 fast studies + 2 clean redraws";
      return "Sketch 10 fast variations";
    }
  },
  rendering: {
    label: "Rendering",
    analyze: ["materials", "light hierarchy", "edge control", "surface breakup"],
    objective: ({ book, page, notes }) => `Take one idea from page ${page} of ${book.title} and push it to a readable finish. Focus on materials and light separation.${notes ? ` Note: ${notes}` : ""}`,
    task: ({ difficulty }) => ({
      easy: "1 value study -> 1 focused material render",
      medium: "1 sketch -> 1 refined render",
      hard: "2 material studies -> 1 final render"
    }[difficulty])
  },
  composition: {
    label: "Composition",
    analyze: ["value grouping", "focal point", "depth", "large vs small shape balance"],
    objective: ({ book, notes }) => `Build a stronger composition inspired by ${book.title}. Use the reference to organize the scene before adding detail.${notes ? ` Note: ${notes}` : ""}`,
    task: ({ difficulty }) => ({
      easy: "Create 4 composition thumbnails",
      medium: "Create 6 thumbnails -> pick 1 and refine it",
      hard: "Create 8 thumbnails -> refine the strongest 2"
    }[difficulty])
  },
  color: {
    label: "Color",
    analyze: ["palette control", "temperature shifts", "focal contrast", "lighting mood"],
    objective: ({ book, page, notes }) => `Study the palette decisions from page ${page} of ${book.title} and apply them to a new image with clean color hierarchy.${notes ? ` Note: ${notes}` : ""}`,
    task: ({ difficulty }) => ({
      easy: "Create 3 palette thumbnails + 1 color study",
      medium: "Create 4 color studies -> refine 1",
      hard: "Create 5 color studies -> finish 1 strong version"
    }[difficulty])
  },
  thumbnails: {
    label: "Thumbnails",
    analyze: ["idea variety", "value read", "focal point", "silhouette clarity"],
    objective: ({ book, notes }) => `Generate quick options before committing to a direction. Use ${book.title} for visual cues, not direct copying.${notes ? ` Note: ${notes}` : ""}`,
    task: ({ time, difficulty }) => {
      if (time === "30 min") return "Create 6 thumbnails (3-4 min each)";
      if (difficulty === "hard") return "Create 10 thumbnails (3-5 min each)";
      return "Create 8 thumbnails (3-5 min each)";
    }
  },
  "animation-short": {
    label: "Animation (short)",
    analyze: ["key poses", "timing", "rhythm", "readable motion arcs"],
    objective: ({ book, notes }) => `Create a short motion study inspired by ${book.title}. Keep it simple, readable, and built around strong key poses.${notes ? ` Note: ${notes}` : ""}`,
    task: ({ difficulty }) => ({
      easy: "Create 4 key poses + 1 rough timing pass",
      medium: "Create 6 key poses + 1 short loop",
      hard: "Create 8 key poses + breakdowns + 1 short loop"
    }[difficulty])
  }
};

const skillOptions = Object.entries(skillTemplates).map(([value, item]) => ({ value, label: item.label }));

const libraryEl = document.getElementById("library");
const mobileLibraryToggle = document.getElementById("mobileLibraryToggle");
const searchInput = document.getElementById("searchInput");
const filterLibraryType = document.getElementById("filterLibraryType");
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
const manualSkillFocus = document.getElementById("manualSkillFocus");
const addBookBtn = document.getElementById("addBookBtn");
const autoFillBtn = document.getElementById("autoFillBtn");
const coverStatus = document.getElementById("coverStatus");
const addBookModal = document.getElementById("addBookModal");
const modalBackdrop = document.getElementById("modalBackdrop");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelModalBtn = document.getElementById("cancelModalBtn");
const saveBookBtn = document.getElementById("saveBookBtn");
const bookTagChips = document.getElementById("bookTagChips");
const newBookLibraryType = document.getElementById("newBookLibraryType");
const newBookTitle = document.getElementById("newBookTitle");
const newBookPublisher = document.getElementById("newBookPublisher");
const newBookInitials = document.getElementById("newBookInitials");
const newBookColor = document.getElementById("newBookColor");
const newBookIsbn13 = document.getElementById("newBookIsbn13");
const newBookIsbn10 = document.getElementById("newBookIsbn10");
const newBookCover = document.getElementById("newBookCover");
const newBookNotes = document.getElementById("newBookNotes");
const newBookImportText = document.getElementById("newBookImportText");
const parseImportBtn = document.getElementById("parseImportBtn");
const newBookPreview = document.getElementById("newBookPreview");
const missionCard = document.getElementById("missionCard");
const missionTags = document.getElementById("missionTags");
const rollBtn = document.getElementById("rollBtn");
const clearFiltersBtn = document.getElementById("clearFiltersBtn");
const creationTypeSelect = document.getElementById("creationTypeSelect");
const exploreChips = document.getElementById("exploreChips");
const toolChips = document.getElementById("toolChips");
const referenceDropZone = document.getElementById("referenceDropZone");
const referenceImageInput = document.getElementById("referenceImageInput");
const referenceCameraInput = document.getElementById("referenceCameraInput");
const pickReferenceBtn = document.getElementById("pickReferenceBtn");
const cameraReferenceBtn = document.getElementById("cameraReferenceBtn");
const clearReferenceBtn = document.getElementById("clearReferenceBtn");
const referencePreview = document.getElementById("referencePreview");
const referencePreviewImg = document.getElementById("referencePreviewImg");
const referencePreviewName = document.getElementById("referencePreviewName");
const referencePreviewMeta = document.getElementById("referencePreviewMeta");
const generateImageBriefBtn = document.getElementById("generateImageBriefBtn");
const imageBriefStatus = document.getElementById("imageBriefStatus");
const imageBriefPrompt = document.getElementById("imageBriefPrompt");

function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function pickPage(type) {
  const [min, max] = pageRanges[type] || [20, 120];
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function showStatus(message) {
  coverStatus.textContent = message;
  coverStatus.classList.remove("hidden");
}
function hideStatus() { coverStatus.classList.add("hidden"); }
function showImageBriefStatus(message, isError = false) {
  if (!imageBriefStatus) return;
  imageBriefStatus.textContent = message;
  imageBriefStatus.classList.remove("hidden");
  imageBriefStatus.style.borderColor = isError ? "rgba(255,122,198,0.38)" : "rgba(167,139,250,0.28)";
}
function hideImageBriefStatus() {
  if (!imageBriefStatus) return;
  imageBriefStatus.classList.add("hidden");
  imageBriefStatus.textContent = "";
  imageBriefStatus.style.borderColor = "";
}
function updateImageReferencePreview() {
  if (!referencePreview || !referencePreviewImg || !clearReferenceBtn || !referencePreviewName || !referencePreviewMeta) return;
  const hasImage = !!referenceImageDataUrl;
  referencePreview.classList.toggle("hidden", !hasImage);
  clearReferenceBtn.classList.toggle("hidden", !hasImage);
  if (!hasImage) {
    referencePreviewImg.removeAttribute("src");
    referencePreviewName.textContent = "Reference image ready";
    referencePreviewMeta.textContent = "Use it to generate a brief with image analysis.";
    return;
  }
  referencePreviewImg.src = referenceImageDataUrl;
  referencePreviewName.textContent = referenceImageName || "Reference image ready";
  referencePreviewMeta.textContent = "Use Generate Brief From Image to analyze this visual reference.";
}
function clearImageBriefPrompt() {
  if (!imageBriefPrompt) return;
  imageBriefPrompt.classList.add("hidden");
  imageBriefPrompt.textContent = "";
}
function showImageBriefPrompt(prompt) {
  if (!imageBriefPrompt) return;
  imageBriefPrompt.textContent = prompt;
  imageBriefPrompt.classList.remove("hidden");
}
function readImageFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Image upload failed."));
    reader.readAsDataURL(file);
  });
}
async function handleReferenceFile(file) {
  if (!file) return;
  if (!String(file.type || "").startsWith("image/")) throw new Error("Please upload an image file.");
  if (file.size > 10 * 1024 * 1024) throw new Error("Please use an image smaller than 10 MB.");
  referenceImageDataUrl = await readImageFileAsDataUrl(file);
  referenceImageName = file.name || "Reference image";
  updateImageReferencePreview();
  clearImageBriefPrompt();
  showImageBriefStatus("Reference image ready.");
}
function clearReferenceImage() {
  referenceImageDataUrl = "";
  referenceImageName = "";
  if (referenceImageInput) referenceImageInput.value = "";
  if (referenceCameraInput) referenceCameraInput.value = "";
  updateImageReferencePreview();
  clearImageBriefPrompt();
  hideImageBriefStatus();
}
function getImageBriefContext() {
  return {
    book: currentMission?.book || selectedBook || null,
    page: currentMission?.page || null,
    skillFocus: currentMission?.skillFocusLabel || manualSkillFocus?.selectedOptions?.[0]?.textContent || "Skill Focus",
    creationType: currentMission?.creationTypeLabel || getCreationTypeLabel(creationTypeSelect?.value),
    tool: currentMission?.tool || getSelectedTool(),
    type: currentMission?.type ? typeCopy[currentMission.type] : typeCopy[document.getElementById("manualType")?.value] || "visual study"
  };
}
function buildImageBriefFallbackPrompt() {
  const context = getImageBriefContext();
  const lines = [
    "Analyze the uploaded reference image and write a concise art practice brief.",
    "Return only these sections: OBJECTIVE, WHAT TO ANALYZE, TASK.",
    "Keep it short, practical, and action-oriented.",
    `Preferred skill focus: ${context.skillFocus}.`,
    `Preferred creation type: ${context.creationType}.`,
    `Preferred medium/tool: ${context.tool || "your preferred tool"}.`,
    `Piece type context: ${context.type}.`
  ];
  if (context.book) lines.push(`Related book context: ${context.book.title} by ${context.book.publisher}${context.page ? `, page ${context.page}` : ""}.`);
  lines.push("Use the image content first, and use the optional context only to make the brief more useful.");
  return lines.join("\n");
}
function renderImageGeneratedBrief(payload) {
  const context = getImageBriefContext();
  const title = payload?.title || context.book?.title || "Image-based practice";
  const publisher = payload?.publisher || context.book?.publisher || "Visual reference";
  const metaTags = [publisher, context.skillFocus, context.creationType, context.type, context.tool || "your preferred tool"]
    .filter(Boolean)
    .map(item => `<span>${item}</span>`)
    .join("");
  briefOutput.innerHTML = `
    <div class="brief-meta">
      <strong>${title}</strong>
      ${metaTags}
    </div>
    <div class="section"><small>Objective</small><p>${payload?.objective || "Use the uploaded image to define a focused visual exercise."}</p></div>
    <div class="section"><small>What to Analyze</small><p>${payload?.analyze || "Observe shape language, composition, value grouping, and the visual decisions that make the image work."}</p></div>
    <div class="section"><small>Task</small><p>${payload?.task || "Create a short practical study based on the image."}</p></div>
    <div class="actions brief-actions"><button class="btn ghost" onclick="saveCurrentBrief()" type="button">Save Session</button></div>
  `;
  window.latestBrief = {
    book: context.book || { title, publisher, company: publisher, color: "#a78bfa", initials: "IM", tags: [] },
    page: context.page || "ref",
    skillFocusLabel: context.skillFocus,
    creationTypeLabel: context.creationType,
    type: currentMission?.type || document.getElementById("manualType")?.value || "character",
    difficulty: currentMission?.difficulty || "medium",
    time: currentMission?.time || document.getElementById("manualTime")?.value || "45 min",
    tool: context.tool || "your preferred tool",
    objective: payload?.objective || "Use the uploaded image to define a focused visual exercise.",
    analyze: payload?.analyze || "Observe shape language, composition, value grouping, and the visual decisions that make the image work.",
    task: payload?.task || "Create a short practical study based on the image."
  };
}
async function generateBriefFromImage() {
  if (!referenceImageDataUrl) {
    showImageBriefStatus("Upload an image first.", true);
    return;
  }
  hideImageBriefStatus();
  clearImageBriefPrompt();
  showImageBriefStatus("Analyzing image...");
  const context = getImageBriefContext();
  const payload = {
    image: referenceImageDataUrl,
    context: {
      bookTitle: context.book?.title || "",
      publisher: context.book?.publisher || "",
      page: context.page || "",
      skillFocus: context.skillFocus,
      creationType: context.creationType,
      tool: context.tool || "",
      pieceType: context.type
    }
  };
  try {
    const response = await fetch("/api/generate-image-brief", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error(`Image brief request failed (${response.status})`);
    const data = await response.json();
    renderImageGeneratedBrief(data);
    showImageBriefStatus("Image brief generated.");
  } catch (error) {
    const prompt = buildImageBriefFallbackPrompt();
    showImageBriefPrompt(prompt);
    try { await navigator.clipboard.writeText(prompt); } catch (clipboardError) {}
    renderImageGeneratedBrief({
      title: context.book?.title || "Image-based practice",
      publisher: context.book?.publisher || "Visual reference",
      objective: `Use the uploaded image as your main reference and focus the exercise around ${context.skillFocus.toLowerCase()}.`,
      analyze: `Look for the visual decisions that support ${context.creationType.toLowerCase()}, especially in composition, shape language, and value control.`,
      task: `Create 1 focused study using ${context.tool || "your preferred tool"}. Keep it short, clear, and based on the uploaded image.`
    });
    showImageBriefStatus("Backend unavailable. A fallback prompt was prepared for ChatGPT and copied when possible.", true);
  }
}
function normalizeTitleForCompare(title) {
  return String(title || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
function formatList(items) {
  if (items.length <= 1) return items[0] || "";
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}
function getBookStyle(book) {
  return book.tags.find(tag => ["stylized", "realistic", "semi-realistic", "cartoon", "anime"].includes(tag)) || "mixed";
}
function getBookWorld(book) {
  return book.tags.find(tag => ["fantasy", "dark fantasy", "sci-fi", "modern", "historical", "horror", "superhero"].includes(tag)) || "hybrid";
}
function getRecommendedSkills(book) {
  const recommended = [];
  if (book.tags.includes("ui")) recommended.push("ui");
  if (book.tags.includes("character") || book.tags.includes("creature")) recommended.push("character-design");
  if (book.tags.includes("environment") || book.tags.includes("keyart")) recommended.push("composition");
  if (book.tags.includes("stylized") || book.tags.includes("realistic")) recommended.push("color");
  recommended.push("sketching", "thumbnails", "rendering", "animation-short");
  return [...new Set(recommended)].filter(key => skillTemplates[key]);
}
function populateSkillFocusSelect() {
  manualSkillFocus.innerHTML = skillOptions.map(option => `<option value="${option.value}">${option.label}</option>`).join("");
  manualSkillFocus.value = "character-design";
}
function populateCreationTypeSelect() {
  creationTypeSelect.innerHTML = [`<option value="">Select creation type</option>`, ...creationTypeOptions.map(option => `<option value="${option.value}">${option.label}</option>`)].join("");
}
function initPracticeOptionChips() {
  exploreChips.innerHTML = exploreElementOptions.map(label => `<button class="chip" type="button" data-explore="${label}">${label}</button>`).join("");
  toolChips.innerHTML = toolOptions.map(label => `<button class="chip" type="button" data-tool="${label}">${label}</button>`).join("");
  exploreChips.querySelectorAll("[data-explore]").forEach(chip => {
    chip.addEventListener("click", () => chip.classList.toggle("active"));
  });
  toolChips.querySelectorAll("[data-tool]").forEach(chip => {
    chip.addEventListener("click", () => {
      const isActive = chip.classList.contains("active");
      toolChips.querySelectorAll("[data-tool]").forEach(item => item.classList.remove("active"));
      if (!isActive) chip.classList.add("active");
    });
  });
}
function getSelectedExploreElements() {
  return [...exploreChips.querySelectorAll("[data-explore].active")].map(chip => chip.dataset.explore);
}
function getSelectedTool() {
  return toolChips.querySelector("[data-tool].active")?.dataset.tool || "";
}
function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
function getTagExample(tag) {
  const examples = {
    character: "Example: sketch 3 silhouette variations and push role readability.",
    environment: "Example: block 4 scene thumbnails with clear depth and focal point.",
    props: "Example: draw 6 prop variations and refine the strongest one.",
    realistic: "Example: study one focal area with controlled values, edges, and materials.",
    stylized: "Example: simplify shapes and exaggerate silhouette clarity without losing appeal.",
    ui: "Example: design 1 screen and 5 icons with clear hierarchy.",
    creature: "Example: explore 4 body-shape ideas and refine one anatomy pass.",
    keyart: "Example: create 3 poster compositions with one strong focal read.",
    fantasy: "Example: borrow mood, motifs, and shape language for a new concept.",
    "dark fantasy": "Example: push mood, contrast, and ominous shape design.",
    "sci-fi": "Example: study functional shapes, materials, and tech readability.",
    modern: "Example: focus on believable design language and grounded details.",
    historical: "Example: study costume logic, ornament, and period silhouette cues.",
    horror: "Example: exaggerate tension, asymmetry, and unsettling focal elements.",
    superhero: "Example: test bold shape language and iconic readability from far away.",
    UI: "Example: design 1 screen and 5 icons with readable hierarchy.",
    "Character Design": "Example: 3 silhouettes -> 1 refined sketch -> 1 color pass.",
    Sketching: "Example: sketch 10 fast studies to chase structure, not polish.",
    Rendering: "Example: take one sketch to a focused finish with materials and light.",
    Composition: "Example: create 6 thumbnails and refine the strongest composition.",
    Color: "Example: paint 4 color studies and pick one to push further.",
    Thumbnails: "Example: generate 8 quick options before committing to one idea.",
    "Animation (short)": "Example: create key poses and a rough short loop.",
    easy: "Keep it quick and readable. Aim for one clear result, not complexity.",
    medium: "Push one extra layer of refinement after the first readable pass.",
    hard: "Explore more options before choosing and finishing the strongest idea.",
    "30 min": "Keep it simple and focus on speed, clarity, and iteration.",
    "45 min": "Use one pass for exploration and one pass for cleanup.",
    "1 hour": "Spend time on both idea quality and one polished pass.",
    "2 hours": "Allow exploration first, then refine the best solution carefully.",
    Photoshop: "Example: use layers for iteration and render control.",
    Procreate: "Example: work with fast brush studies and quick color blocking.",
    "Blender 3D": "Example: block the main forms in 3D before paintover or design passes.",
    "Traditional illustration": "Example: keep the study tactile and focus on line confidence or values.",
    "After Effects": "Example: test timing, key poses, and motion readability.",
    "Figma / UI": "Example: focus on layout, spacing, and interface hierarchy.",
    "book of study": "This is a study-focused reference. Prioritize analysis and repetition.",
    artbook: "This is a production-art reference. Borrow ideas, not exact images."
  };
  return examples[tag] || `Use this tag as a focus lens. Example: extract one useful lesson from ${String(tag || "this reference").toLowerCase()}.`;
}
function makeTooltipTag(label, className = "", example = "") {
  const safeLabel = escapeHtml(label);
  const safeExample = escapeHtml(example || getTagExample(label));
  const classes = ["tag", className].filter(Boolean).join(" ");
  return `<span class="${classes}" data-tooltip="${safeExample}" title="${safeExample}">${safeLabel}</span>`;
}
function getCreationTypeLabel(value) {
  return creationTypeOptions.find(option => option.value === value)?.label || "Open exploration";
}
function getLibraryGroupLabel(book) {
  return book.company || book.group || book.publisher || "Unknown";
}
async function loadBooks() {
  const response = await fetch("./data/books.json", { cache: "no-store" });
  if (!response.ok) throw new Error(`Unable to load books.json (${response.status})`);
  const seededBooks = await response.json();
  if (!Array.isArray(seededBooks)) throw new Error("books.json must contain an array of books.");
  seededBookCount = seededBooks.length;
  books = seededBooks.map(book => ({ ...book, originalCover: book.cover || "" }));
  const customBooks = parseStoredJson(CUSTOM_BOOKS_KEY, []);
  if (customBooks.length) books.push(...customBooks.map(book => ({ ...book, originalCover: book.originalCover || book.cover || "" })));
  const persistedCovers = parseStoredJson(COVER_CACHE_KEY, {});
  const manualCovers = parseStoredJson(MANUAL_COVER_KEY, {});
  books.forEach(book => {
    book.company = book.company || book.group || book.publisher;
    if (manualCovers[book.id]) {
      book.cover = manualCovers[book.id];
      return;
    }
    if (!book.cover && persistedCovers[book.id]) book.cover = persistedCovers[book.id];
  });
}
function initBookTags() {
  const tagPool = ["character", "environment", "props", "ui", "creature", "keyart", "stylized", "realistic", "semi-realistic", "cartoon", "anime", "fantasy", "dark fantasy", "sci-fi", "modern", "historical", "horror", "superhero"];
  bookTagChips.innerHTML = `<div class="tag-picker">${tagPool.map(tag => `<button class="chip" type="button" data-book-tag="${tag}">${tag}</button>`).join("")}</div>`;
  bookTagChips.querySelectorAll("[data-book-tag]").forEach(chip => {
    chip.addEventListener("click", () => {
      chip.classList.toggle("active");
      updateNewBookPreview();
    });
  });
}
function getSelectedBookTags() { return [...bookTagChips.querySelectorAll("[data-book-tag].active")].map(el => el.dataset.bookTag); }
function setSelectedBookTags(tags = []) {
  const wanted = new Set(tags);
  bookTagChips.querySelectorAll("[data-book-tag]").forEach(chip => {
    chip.classList.toggle("active", wanted.has(chip.dataset.bookTag));
  });
}
function pickColorForBook(publisher, title, tags = []) {
  const source = `${publisher} ${title} ${tags.join(" ")}`.toLowerCase();
  if (source.includes("eyrolles")) return "#a67cf0";
  if (source.includes("3dtotal")) return "#58c18f";
  if (source.includes("daimon") || source.includes("spring") || source.includes("hart")) return "#6ea8ff";
  if (source.includes("taco")) return "#ff7ac6";
  if (source.includes("fantasy")) return "#58c18f";
  return "#a78bfa";
}
function buildInitials(text) {
  const parts = String(text || "").split(/[^A-Za-z0-9]+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  if (parts.length === 1) return parts[0].slice(0, 3).toUpperCase();
  return "AB";
}
function inferTagsFromText(text) {
  const source = String(text || "").toLowerCase();
  const tags = new Set(["character", "study", "anatomy", "morphology"]);
  if (source.includes("fantasy")) tags.add("fantasy");
  if (source.includes("stylized") || source.includes("artwork")) tags.add("stylized");
  if (source.includes("realistic") || source.includes("anatom")) tags.add("realistic");
  if (source.includes("clothing") || source.includes("vetement") || source.includes("plis")) tags.add("props");
  if (source.includes("superhero") || source.includes("bodybuild")) tags.add("superhero");
  return [...tags];
}
function buildCoverFromIsbn(isbn13, isbn10) {
  const isbn = String(isbn13 || isbn10 || "").trim();
  return isbn ? `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg` : "";
}
function parseImportedBookText(rawText) {
  const lines = String(rawText || "")
    .split(/\r?\n/)
    .map(line => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  if (!lines.length) return null;
  const isbnMatches = [...String(rawText || "").matchAll(/\b(?:97[89]\d{10}|\d{9}[\dXx])\b/g)].map(match => match[0]);
  const isbn13 = isbnMatches.find(value => value.length === 13) || "";
  const isbn10 = isbnMatches.find(value => value.length === 10) || "";
  const contentLines = lines.filter(line => !/\b(?:97[89]\d{10}|\d{9}[\dXx])\b/.test(line) && !/\$\s*\d/.test(line));
  let title = "";
  let publisher = "";
  if (contentLines.length >= 2) {
    title = contentLines.slice(1).sort((a, b) => b.length - a.length)[0] || contentLines[0];
    publisher = contentLines.find(line => line !== title && line.length <= 40) || contentLines[0];
  } else {
    title = contentLines[0] || "";
  }
  if (!publisher && contentLines.length) publisher = contentLines[0];
  const tags = inferTagsFromText(`${rawText} ${title} ${publisher}`);
  return {
    title: title.trim(),
    publisher: publisher.trim(),
    isbn13,
    isbn10,
    cover: buildCoverFromIsbn(isbn13, isbn10),
    initials: buildInitials(publisher || title),
    color: pickColorForBook(publisher, title, tags),
    tags
  };
}
function applyImportedBookData(parsed) {
  if (!parsed) return;
  newBookTitle.value = parsed.title || "";
  newBookPublisher.value = parsed.publisher || "";
  newBookInitials.value = parsed.initials || "";
  newBookColor.value = parsed.color || "#a78bfa";
  newBookIsbn13.value = parsed.isbn13 || "";
  newBookIsbn10.value = parsed.isbn10 || "";
  newBookCover.value = parsed.cover || "";
  setSelectedBookTags(parsed.tags || []);
  updateNewBookPreview();
}
function readManualCovers() { return parseStoredJson(MANUAL_COVER_KEY, {}); }
function writeManualCovers(covers) { localStorage.setItem(MANUAL_COVER_KEY, JSON.stringify(covers)); }
function getCurrentBookById(id) { return books.find(book => book.id === id) || null; }
function applyBookCoverById(bookId, coverUrl) {
  const book = getCurrentBookById(bookId);
  if (!book) return;
  book.cover = coverUrl;
  if (selectedBook?.id === bookId) selectedBook = book;
  if (currentMission?.book?.id === bookId) currentMission.book = book;
  renderLibrary();
  renderSelectedBook();
  if (currentMission?.book?.id === bookId) renderMission(currentMission);
}
function applySelectedBookCover(coverUrl) {
  if (!selectedBook) return;
  applyBookCoverById(selectedBook.id, coverUrl);
}
function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Image upload failed."));
    reader.readAsDataURL(file);
  });
}
async function handleBookCoverUpload(bookId, file) {
  if (!bookId || !file) return;
  if (!file.type.startsWith("image/")) {
    alert("Please upload an image file.");
    return;
  }
  if (file.size > 2 * 1024 * 1024) {
    alert("Please use an image smaller than 2 MB so it can be stored safely in the browser.");
    return;
  }
  const imageDataUrl = await readFileAsDataUrl(file);
  const manualCovers = readManualCovers();
  manualCovers[bookId] = imageDataUrl;
  writeManualCovers(manualCovers);
  applyBookCoverById(bookId, imageDataUrl);
}
async function handleSelectedCoverUpload(file) {
  if (!selectedBook) return;
  await handleBookCoverUpload(selectedBook.id, file);
}
function canUseImageUrl(url) {
  const normalized = normalizeCoverUrl(url);
  if (!normalized) return Promise.resolve(false);
  return new Promise(resolve => {
    const image = new Image();
    let settled = false;
    const finish = result => {
      if (settled) return;
      settled = true;
      resolve(result);
    };
    const timeoutId = setTimeout(() => finish(false), 8000);
    image.onload = () => { clearTimeout(timeoutId); finish(true); };
    image.onerror = () => { clearTimeout(timeoutId); finish(false); };
    image.referrerPolicy = "no-referrer";
    image.src = normalized;
  });
}
async function handleBookCoverUrl(bookId, url) {
  if (!bookId) return;
  const normalized = normalizeCoverUrl(url);
  if (!normalized) {
    alert("Please paste a valid image URL.");
    return;
  }
  const canUse = await canUseImageUrl(normalized);
  if (!canUse) {
    alert("That image URL could not be loaded. Try a direct image link that ends in .jpg, .png, or .webp.");
    return;
  }
  const manualCovers = readManualCovers();
  manualCovers[bookId] = normalized;
  writeManualCovers(manualCovers);
  applyBookCoverById(bookId, normalized);
}
async function handleSelectedCoverUrl(url) {
  if (!selectedBook) return;
  await handleBookCoverUrl(selectedBook.id, url);
}
function removeSelectedBookCustomCover() {
  if (!selectedBook) return;
  const manualCovers = readManualCovers();
  delete manualCovers[selectedBook.id];
  writeManualCovers(manualCovers);
  const book = getCurrentBookById(selectedBook.id);
  if (!book) return;
  const autoCovers = parseStoredJson(COVER_CACHE_KEY, {});
  book.cover = book.originalCover || autoCovers[book.id] || "";
  selectedBook = book;
  renderLibrary();
  renderSelectedBook();
}
function isMobileLibraryLayout() {
  return window.matchMedia("(max-width: 860px)").matches;
}
function setMobileLibraryCollapsed(collapsed) {
  if (!libraryEl || !mobileLibraryToggle) return;
  if (!isMobileLibraryLayout()) {
    libraryEl.classList.remove("mobile-collapsed");
    mobileLibraryToggle.setAttribute("aria-expanded", "true");
    return;
  }
  libraryEl.classList.toggle("mobile-collapsed", collapsed);
  mobileLibraryToggle.setAttribute("aria-expanded", collapsed ? "false" : "true");
}
function syncMobileLibraryState() {
  if (!libraryEl || !mobileLibraryToggle) return;
  if (isMobileLibraryLayout()) {
    const isExpanded = mobileLibraryToggle.getAttribute("aria-expanded") === "true";
    setMobileLibraryCollapsed(!isExpanded);
  } else {
    setMobileLibraryCollapsed(false);
  }
}
function clearFilters() {
  searchInput.value = "";
  filterLibraryType.value = "";
  filterType.value = "";
  filterStyle.value = "";
  filterWorld.value = "";
  expandedPublishers.clear();
  renderLibrary();
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
  const libraryType = filterLibraryType.value;
  const type = filterType.value;
  const style = filterStyle.value;
  const world = filterWorld.value;
  const items = books.filter(book => {
    const haystack = `${book.title} ${book.publisher} ${getLibraryGroupLabel(book)} ${book.tags.join(" ")}`.toLowerCase();
    return (!q || haystack.includes(q)) && (!libraryType || book.libraryType === libraryType) && (!type || book.tags.includes(type)) && (!style || book.tags.includes(style)) && (!world || book.tags.includes(world));
  });
  libraryEl.innerHTML = "";
  let visibleBookCount = 0;
  if (mobileLibraryToggle) mobileLibraryToggle.textContent = `Browse Library (${items.length})`;
  if (!items.length) {
    libraryEl.innerHTML = `<div class="mini-card"><h4>No results</h4><p>Try another filter or search term.</p></div>`;
    return;
  }
  const grouped = items.reduce((map, book) => {
    const groupLabel = getLibraryGroupLabel(book);
    if (!map.has(groupLabel)) map.set(groupLabel, []);
    map.get(groupLabel).push(book);
    return map;
  }, new Map());
  const orderedGroups = [...grouped.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  const forceOpenSelected = selectedBook ? getLibraryGroupLabel(selectedBook) : "";
  const useDefaultOpen = expandedPublishers.size === 0 && !forceOpenSelected && !q && !libraryType && !type && !style && !world;
  orderedGroups.forEach(([groupLabel, groupedBooks], index) => {
    visibleBookCount += groupedBooks.length;
    const group = document.createElement("details");
    group.className = "library-group";
    group.dataset.publisher = groupLabel;
    group.open = expandedPublishers.has(groupLabel) || groupLabel === forceOpenSelected || (useDefaultOpen && index < 2);
    const summary = document.createElement("summary");
    summary.className = "library-group-summary";
    summary.innerHTML = `<span class="library-group-name">${groupLabel}</span><span class="library-group-count">${groupedBooks.length}</span>`;
    summary.addEventListener("click", () => {
      requestAnimationFrame(() => {
        if (group.open) expandedPublishers.add(groupLabel);
        else expandedPublishers.delete(groupLabel);
      });
    });
    const list = document.createElement("div");
    list.className = "library-group-list";
    groupedBooks.sort((a, b) => a.title.localeCompare(b.title)).forEach(book => {
      const item = document.createElement("button");
      item.className = `book${selectedBook?.id === book.id ? " active" : ""}`;
      item.type = "button";
      item.innerHTML = `${makeThumbMarkup(book)}<div class="book-meta"><div class="book-title">${book.title}</div><div class="book-sub">${book.libraryType === "study" ? "book of study" : "artbook"} / ${book.tags.slice(0, 2).join(" / ")}</div></div>`;
      item.addEventListener("click", () => selectBook(book.id));
      list.appendChild(item);
    });
    group.appendChild(summary);
    group.appendChild(list);
    libraryEl.appendChild(group);
  });
  if (mobileLibraryToggle) mobileLibraryToggle.textContent = `Browse Library (${visibleBookCount})`;
}
function selectBook(id) {
  selectedBook = books.find(book => book.id === id) || null;
  if (selectedBook) {
    expandedPublishers.add(getLibraryGroupLabel(selectedBook));
    const recommendations = getRecommendedSkills(selectedBook);
    if (recommendations.length) manualSkillFocus.value = recommendations[0];
  }
  renderLibrary();
  renderSelectedBook();
  if (selectedBook) {
    document.getElementById("headerEyebrow").textContent = getLibraryGroupLabel(selectedBook);
    document.getElementById("headerTitle").textContent = selectedBook.title;
    document.getElementById("headerDesc").textContent = "Use this book for focused daily practice.";
  }
}
function getBookStrength(book) {
  if (book.tags.includes("ui")) return "Strong for interface studies and readable shape systems.";
  if (book.tags.includes("character")) return "Useful for silhouette, costume, and role clarity.";
  if (book.tags.includes("environment")) return "Useful for depth, layout, and focal hierarchy.";
  if (book.tags.includes("realistic")) return "Useful for materials, finish, and value control.";
  return "Good for fast studies, idea generation, and visual analysis.";
}
function renderSelectedBook() {
  if (!selectedBook) {
    selectedBookCard.innerHTML = `<div class="mini-card"><h4>No book selected</h4><p>Choose a book from the library to start.</p></div>`;
    return;
  }
  const hasManualCover = !!readManualCovers()[selectedBook.id];
  const googleCoverSearchUrl = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(`${selectedBook.title} ${selectedBook.publisher} book cover`)}`;
  const isbnLines = [
    selectedBook.isbn13 ? `<span><strong style="color:var(--text)">ISBN-13:</strong> ${selectedBook.isbn13}</span>` : "",
    selectedBook.isbn10 ? `<span><strong style="color:var(--text)">ISBN-10:</strong> ${selectedBook.isbn10}</span>` : ""
  ].filter(Boolean).join("<br>");
  const suggestions = getRecommendedSkills(selectedBook).slice(0, 3).map(key => skillTemplates[key].label).join(" / ");
  selectedBookCard.innerHTML = `
    <div class="mini-card">
      <div style="display:flex; gap:12px; align-items:center; margin-bottom:10px;">
        ${makeThumbMarkup(selectedBook, 64, 84)}
        <div>
          <h4 style="margin:0 0 4px; font-size:15px;">${selectedBook.title}</h4>
          <p><strong style="color:var(--text)">${selectedBook.publisher}</strong><br>${getLibraryGroupLabel(selectedBook)} / ${selectedBook.libraryType === "study" ? "Book of Study" : "Artbook"} / ${selectedBook.tags.join(" / ")}${isbnLines ? `<br><br>${isbnLines}` : ""}</p>
        </div>
      </div>
      <div class="actions" style="margin-top:12px;">
        <button class="btn" data-upload-cover-btn type="button">Upload Cover</button>
        <button class="btn ghost" data-cover-url-btn type="button">Set Cover URL</button>
        <a class="btn ghost" href="${googleCoverSearchUrl}" target="_blank" rel="noreferrer">Search on Google</a>
        <button class="btn ghost" data-remove-cover-btn type="button" ${hasManualCover ? "" : "disabled"}>Remove Custom Cover</button>
        <input class="hidden" data-cover-upload-input type="file" accept="image/*" />
      </div>
    </div>
    <div class="mini-card">
      <h4>Recommended Use</h4>
      <p>${getBookStrength(selectedBook)}${suggestions ? `<br><br>Good skill focus: ${suggestions}` : ""}</p>
    </div>
  `;
}
function getAnalyzeText(book, template, type, exploreElements = []) {
  const dynamicPoints = [...exploreElements, ...template.analyze];
  const style = getBookStyle(book);
  const world = getBookWorld(book);
  if (!dynamicPoints.includes(style)) dynamicPoints.push(`${style} style decisions`);
  if (!dynamicPoints.includes(world)) dynamicPoints.push(`${world} world cues`);
  if (type === "character") dynamicPoints.push("silhouette readability");
  if (type === "environment") dynamicPoints.push("depth grouping");
  if (type === "props") dynamicPoints.push("function and material choices");
  if (type === "ui") dynamicPoints.push("information priority");
  if (type === "creature") dynamicPoints.push("anatomy exaggeration");
  if (type === "keyart") dynamicPoints.push("hero focal hierarchy");
  return `Look for ${formatList(dynamicPoints.slice(0, 4))} in ${book.title}. Extract patterns you can reuse without copying the original image.`;
}
function createBrief({ book, page, type, difficulty, time, skillFocus, creationType, exploreElements, tool, notes, mode }) {
  const template = skillTemplates[skillFocus] || skillTemplates["character-design"];
  const creationTypeLabel = getCreationTypeLabel(creationType);
  const toolLabel = tool || "your preferred tool";
  const objectiveBase = template.objective({ book, page, type, difficulty, time, notes });
  const taskBase = template.task({ book, page, type, difficulty, time, notes });
  return {
    id: Date.now(),
    mode,
    book,
    page,
    type,
    difficulty,
    time,
    notes,
    skillFocus,
    creationType,
    creationTypeLabel,
    exploreElements,
    tool: toolLabel,
    skillFocusLabel: template.label,
    objective: `${objectiveBase} Approach: ${creationTypeLabel}.`,
    analyze: getAnalyzeText(book, template, type, exploreElements),
    task: `${taskBase}${tool ? ` Use ${toolLabel}.` : ""}${exploreElements.length ? ` Prioritize ${formatList(exploreElements.slice(0, 3)).toLowerCase()}.` : ""}`
  };
}
function renderBrief(brief) {
  briefOutput.innerHTML = `
    <div class="brief-meta">
      <strong>${brief.book.title}</strong>
      <span>${brief.book.publisher}</span>
      <span>${getLibraryGroupLabel(brief.book)}</span>
      <span>page ${brief.page}</span>
      <span>${brief.skillFocusLabel}</span>
      <span>${brief.creationTypeLabel}</span>
      <span>${typeCopy[brief.type]}</span>
      <span>${difficultyCopy[brief.difficulty]}</span>
      <span>${brief.time}</span>
      <span>${brief.tool}</span>
    </div>
    <div class="section"><small>Objective</small><p>${brief.objective}</p></div>
    <div class="section"><small>What to Analyze</small><p>${brief.analyze}</p></div>
    <div class="section"><small>Task</small><p>${brief.task}</p></div>
    <div class="actions brief-actions"><button class="btn ghost" onclick="saveCurrentBrief()" type="button">Save Session</button></div>
  `;
  window.latestBrief = brief;
}
function filteredBooksForTraining() {
  const libraryType = filterLibraryType.value;
  const type = filterType.value;
  const style = filterStyle.value;
  const world = filterWorld.value;
  return books.filter(book => (!libraryType || book.libraryType === libraryType) && (!type || book.tags.includes(type)) && (!style || book.tags.includes(style)) && (!world || book.tags.includes(world)));
}
function getRandomTypeForBook(book) {
  const typeCandidates = ["character", "environment", "props", "ui", "creature", "keyart"].filter(type => book.tags.includes(type) || type === "keyart");
  return pickRandom(typeCandidates.length ? typeCandidates : ["character"]);
}
function getRandomSkillForBook(book, type) {
  const recommendations = getRecommendedSkills(book);
  if (type === "ui") return "ui";
  if (type === "character" || type === "creature") return pickRandom(["character-design", "sketching", "rendering"]);
  if (type === "environment" || type === "keyart") return pickRandom(["composition", "color", "thumbnails"]);
  return pickRandom(recommendations.length ? recommendations : skillOptions.map(option => option.value));
}
function generateManualBrief() {
  if (!selectedBook) {
    alert("Select a book first.");
    return;
  }
  const type = document.getElementById("manualType").value;
  const difficulty = document.getElementById("manualDifficulty").value;
  const time = document.getElementById("manualTime").value;
  const page = Number(document.getElementById("manualPage").value) || pickPage(type);
  const notes = document.getElementById("manualNotes").value.trim();
  const skillFocus = manualSkillFocus.value || "character-design";
  const creationType = creationTypeSelect.value;
  const exploreElements = getSelectedExploreElements();
  const tool = getSelectedTool();
  renderBrief(createBrief({ book: selectedBook, page, type, difficulty, time, skillFocus, creationType, exploreElements, tool, notes, mode: "manual" }));
}
function suggestPageForSelected() {
  if (!selectedBook) return;
  const type = document.getElementById("manualType").value;
  document.getElementById("manualPage").value = pickPage(type);
}
function renderMission(brief) {
  const bookTags = Array.isArray(brief.book.tags) ? brief.book.tags.slice(0, 4) : [];
  const bookTagMarkup = bookTags.length
    ? `<div class="mission-book-tags">${bookTags.map(tag => makeTooltipTag(tag, "book-tag")).join("")}</div>`
    : "";
  missionCard.innerHTML = `
    <div class="mission-top">
      <div class="mission-book">
        <div class="mission-thumb-stack">
          <button class="mission-thumb-button" data-mission-cover-menu-btn type="button" title="Change book cover">
            ${makeThumbMarkup(brief.book, 54, 72)}
          </button>
          <div class="mission-cover-actions hidden" data-mission-cover-actions>
            <button class="btn ghost mission-cover-btn" data-mission-cover-upload type="button">Upload</button>
            <button class="btn ghost mission-cover-btn" data-mission-cover-url type="button">Paste URL</button>
            <input class="hidden" data-mission-cover-input type="file" accept="image/*" />
          </div>
        </div>
        <div>
          <h3 class="mission-title">${brief.book.title}</h3>
          <div class="mission-sub">${brief.book.publisher} / ${brief.skillFocusLabel} / ${typeCopy[brief.type]}</div>
          ${bookTagMarkup}
        </div>
      </div>
      <div class="mission-page">
        <strong>${brief.page}</strong>
        <span>page</span>
      </div>
    </div>
    <div class="mission-objective">
      <small>Objective</small>
      <p>${brief.objective}</p>
    </div>
  `;
  missionTags.innerHTML = [
    makeTooltipTag(brief.skillFocusLabel, "goal"),
    makeTooltipTag(brief.creationTypeLabel, "type"),
    makeTooltipTag(difficultyCopy[brief.difficulty]),
    makeTooltipTag(brief.time),
    makeTooltipTag(brief.tool),
    makeTooltipTag(getLibraryGroupLabel(brief.book), brief.book.libraryType === "study" ? "style" : "world", getTagExample(brief.book.libraryType === "study" ? "book of study" : "artbook"))
  ].join("");
}
function launchTraining() {
  rollBtn.disabled = true;
  rollBtn.textContent = "Rolling...";
  missionCard.classList.add("rolling");
  missionTags.innerHTML = "";
  let spins = 0;
  const spinPool = filteredBooksForTraining();
  const displayPool = spinPool.length ? spinPool : books;
  const spinInterval = setInterval(() => {
    spins += 1;
    const fakeBook = pickRandom(displayPool);
    missionCard.innerHTML = `<div style="display:flex; align-items:center; justify-content:center; min-height:118px; text-align:center; font-size:18px; color:var(--accent-2); opacity:0.84;">${fakeBook.title}</div>`;
    if (spins >= 10) {
      clearInterval(spinInterval);
      const book = pickRandom(displayPool);
      const type = getRandomTypeForBook(book);
      const difficulty = pickRandom(["easy", "medium", "hard"]);
      const time = pickRandom(["30 min", "45 min", "1 hour", "2 hours"]);
      const page = pickPage(type);
      const skillFocus = getRandomSkillForBook(book, type);
      const creationType = creationTypeSelect.value || pickRandom(creationTypeOptions).value;
      const exploreElements = getSelectedExploreElements();
      const tool = getSelectedTool();
      currentMission = createBrief({ book, page, type, difficulty, time, skillFocus, creationType, exploreElements, tool, notes: "", mode: "random" });
      renderMission(currentMission);
      renderBrief(currentMission);
      rollBtn.disabled = false;
      rollBtn.textContent = "Start Training";
      missionCard.classList.remove("rolling");
    }
  }, 120);
}
function rerollBook() {
  if (!currentMission) {
    launchTraining();
    return;
  }
  const similar = filteredBooksForTraining().filter(book => book.id !== currentMission.book.id);
  const nextBook = pickRandom(similar.length ? similar : books);
  currentMission = createBrief({
    book: nextBook,
    page: pickPage(currentMission.type),
    type: currentMission.type,
    difficulty: currentMission.difficulty,
    time: currentMission.time,
    skillFocus: getRandomSkillForBook(nextBook, currentMission.type),
    creationType: currentMission.creationType,
    exploreElements: currentMission.exploreElements,
    tool: currentMission.tool,
    notes: currentMission.notes,
    mode: currentMission.mode
  });
  renderMission(currentMission);
  renderBrief(currentMission);
}
function rerollFocus() {
  if (!currentMission) {
    launchTraining();
    return;
  }
  const available = getRecommendedSkills(currentMission.book).filter(skill => skill !== currentMission.skillFocus);
  const nextSkill = pickRandom(available.length ? available : skillOptions.map(option => option.value));
  currentMission = createBrief({
    book: currentMission.book,
    page: currentMission.page,
    type: currentMission.type,
    difficulty: currentMission.difficulty,
    time: currentMission.time,
    skillFocus: nextSkill,
    creationType: currentMission.creationType,
    exploreElements: currentMission.exploreElements,
    tool: currentMission.tool,
    notes: currentMission.notes,
    mode: currentMission.mode
  });
  renderMission(currentMission);
  renderBrief(currentMission);
}
function restoreSavedSession(sessionId) {
  const session = saved.find(item => String(item.id) === String(sessionId));
  if (!session?.brief) return;
  const liveBook = getCurrentBookById(session.brief.book?.id) || session.brief.book || null;
  const restoredBrief = { ...session.brief, book: liveBook };
  window.latestBrief = restoredBrief;
  selectedBook = liveBook;
  currentMission = restoredBrief.mode === "random" ? restoredBrief : null;
  if (restoredBrief.mode === "manual") {
    manualSkillFocus.value = restoredBrief.skillFocus || manualSkillFocus.value;
    creationTypeSelect.value = restoredBrief.creationType || creationTypeSelect.value;
    document.getElementById("manualType").value = restoredBrief.type || document.getElementById("manualType").value;
    document.getElementById("manualDifficulty").value = restoredBrief.difficulty || document.getElementById("manualDifficulty").value;
    document.getElementById("manualTime").value = restoredBrief.time || document.getElementById("manualTime").value;
    document.getElementById("manualPage").value = restoredBrief.page || document.getElementById("manualPage").value;
  }
  setMode(restoredBrief.mode === "manual" ? "manual" : "random");
  renderLibrary();
  renderSelectedBook();
  if (restoredBrief.mode === "random") renderMission(restoredBrief);
  renderBrief(restoredBrief);
}
function renderSaved() {
  if (!saved.length) {
    savedSessions.innerHTML = `<div class="mini-card"><h4>No saved sessions</h4><p>Your latest practice runs will appear here.</p></div>`;
    return;
  }
  savedSessions.innerHTML = saved.slice(0, 12).map(item => `<button class="session-item" data-session-id="${item.id}" type="button"><strong>${item.title}</strong><span>${item.date} / ${item.mode} / ${item.skillFocusLabel || item.type}</span></button>`).join("");
}
function saveCurrentBrief() {
  if (!window.latestBrief) return;
  saved.unshift({
    id: Date.now(),
    date: new Date().toLocaleDateString("en-US"),
    title: `${window.latestBrief.book.title} / p.${window.latestBrief.page}`,
    mode: window.latestBrief.mode,
    type: window.latestBrief.type,
    skillFocus: window.latestBrief.skillFocus,
    skillFocusLabel: window.latestBrief.skillFocusLabel,
    difficulty: window.latestBrief.difficulty,
    summary: window.latestBrief.objective,
    brief: JSON.parse(JSON.stringify(window.latestBrief))
  });
  localStorage.setItem("artbook_training_sessions", JSON.stringify(saved));
  renderSaved();
}
function downloadJsonFile(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
function exportSessions() { downloadJsonFile("artbook-training-sessions.json", saved); }
function exportLibraryData() {
  const exportBooks = books.map(book => {
    const cleanBook = { ...book };
    delete cleanBook.originalCover;
    return cleanBook;
  });
  downloadJsonFile("books.json", exportBooks);
  alert("Library JSON exported. Replace data/books.json in the repo with the downloaded file, then commit and push it to keep your covers online.");
}
function clearSessions() {
  if (!confirm("Clear all saved history?")) return;
  saved = [];
  localStorage.setItem("artbook_training_sessions", JSON.stringify(saved));
  renderSaved();
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
  const title = newBookTitle.value.trim() || "Artbook title";
  const publisher = newBookPublisher.value.trim() || "Publisher / Studio";
  const initials = (newBookInitials.value.trim() || title.slice(0, 2) || "AB").toUpperCase().slice(0, 3);
  const color = newBookColor.value || "#a78bfa";
  const isbn13 = newBookIsbn13.value.trim();
  const isbn10 = newBookIsbn10.value.trim();
  const cover = newBookCover.value.trim();
  const tags = getSelectedBookTags();
  const notes = newBookNotes.value.trim();
  newBookPreview.innerHTML = `<h4>Preview</h4><div style="display:flex; gap:12px; align-items:center; margin-bottom:10px;">${makeThumbMarkup({ initials, color, cover }, 52, 70)}<div><div style="color:var(--text); font-weight:700;">${title}</div><div style="color:var(--muted); font-size:12px;">${publisher}</div></div></div><p>${tags.length ? tags.join(" / ") : "No tags selected yet."}${(isbn13 || isbn10) ? `<br><br>${isbn13 ? `ISBN-13: ${isbn13}` : ""}${isbn13 && isbn10 ? `<br>` : ""}${isbn10 ? `ISBN-10: ${isbn10}` : ""}` : ""}${notes ? `<br><br>${notes}` : ""}</p>`;
}
function findPotentialDuplicate(title) {
  const normalizedTitle = normalizeTitleForCompare(title);
  return books.find(book => normalizeTitleForCompare(book.title) === normalizedTitle) || null;
}
function saveNewBook() {
  const title = newBookTitle.value.trim();
  const publisher = newBookPublisher.value.trim();
  const initials = (newBookInitials.value.trim() || title.slice(0, 2) || "AB").toUpperCase().slice(0, 3);
  const color = newBookColor.value || "#a78bfa";
  const isbn13 = newBookIsbn13.value.trim();
  const isbn10 = newBookIsbn10.value.trim();
  const cover = newBookCover.value.trim();
  const tags = getSelectedBookTags();
  if (!title || !publisher) {
    alert("Fill in at least the title and the publisher or studio.");
    return;
  }
  const duplicate = findPotentialDuplicate(title);
  if (duplicate) {
    const keepGoing = confirm(`This book already seems to exist in your library:\n\n#${duplicate.id} / ${duplicate.title}\n\nIf you continue, it will still be added as a new entry. Do you want to keep going?`);
    if (!keepGoing) return;
  }
  const nextId = Math.max(...books.map(book => book.id), 0) + 1;
  const newBook = { id: nextId, title, publisher, initials, color, cover, originalCover: cover, isbn13, isbn10, libraryType: newBookLibraryType.value || "artbook", tags };
  books.push(newBook);
  const existingCustom = parseStoredJson(CUSTOM_BOOKS_KEY, []);
  existingCustom.push(newBook);
  localStorage.setItem(CUSTOM_BOOKS_KEY, JSON.stringify(existingCustom));
  closeAddBookModal();
  newBookLibraryType.value = "artbook";
  newBookTitle.value = "";
  newBookPublisher.value = "";
  newBookInitials.value = "";
  newBookColor.value = "#a78bfa";
  newBookIsbn13.value = "";
  newBookIsbn10.value = "";
  newBookCover.value = "";
  newBookNotes.value = "";
  newBookImportText.value = "";
  bookTagChips.querySelectorAll("[data-book-tag].active").forEach(el => el.classList.remove("active"));
  updateNewBookPreview();
  selectBook(nextId);
  renderLibrary();
}
function getGoogleBookThumb(item) {
  const links = item?.volumeInfo?.imageLinks;
  return links?.thumbnail || links?.smallThumbnail || links?.small || links?.medium || links?.large || links?.extraLarge || "";
}
function normalizeCoverUrl(url) {
  return String(url || "").trim().replace(/^http:\/\//i, "https://").replace(/\&zoom=\d+/i, "&zoom=2");
}
function readCoverCache() { return parseStoredJson(COVER_CACHE_KEY, {}); }
function writeCoverCache(cache) { localStorage.setItem(COVER_CACHE_KEY, JSON.stringify(cache)); }
function readCoverMisses() { return parseStoredJson(COVER_MISS_CACHE_KEY, {}); }
function writeCoverMisses(misses) { localStorage.setItem(COVER_MISS_CACHE_KEY, JSON.stringify(misses)); }
function buildCoverLookupKeys(book) {
  return [book.id != null ? String(book.id) : "", book.id != null ? `id:${book.id}` : "", book.isbn13 ? `isbn13:${book.isbn13}` : "", book.isbn10 ? `isbn10:${book.isbn10}` : "", `title:${normalizeTitleForCompare(book.title)}|publisher:${normalizeTitleForCompare(book.publisher)}`].filter(Boolean);
}
function getCachedCover(book, cache = readCoverCache()) {
  for (const key of buildCoverLookupKeys(book)) {
    if (cache[key]) return cache[key];
  }
  return "";
}
function cacheCover(book, cover, cache = readCoverCache()) {
  const normalized = normalizeCoverUrl(cover);
  if (!normalized) return "";
  buildCoverLookupKeys(book).forEach(key => { cache[key] = normalized; });
  writeCoverCache(cache);
  return normalized;
}
function getMissCount(book, misses = readCoverMisses()) {
  for (const key of buildCoverLookupKeys(book)) {
    if (misses[key]) return Number(misses[key]) || 0;
  }
  return 0;
}
function markCoverMiss(book, misses = readCoverMisses()) {
  const nextCount = getMissCount(book, misses) + 1;
  buildCoverLookupKeys(book).forEach(key => { misses[key] = nextCount; });
  writeCoverMisses(misses);
}
function clearCoverMiss(book, misses = readCoverMisses()) {
  buildCoverLookupKeys(book).forEach(key => { delete misses[key]; });
  writeCoverMisses(misses);
}
async function isImageReachable(url) {
  const normalized = normalizeCoverUrl(url);
  if (!normalized) return false;
  if (coverProbeCache.has(normalized)) return coverProbeCache.get(normalized);
  const probe = (async () => {
    try {
      const response = await fetch(normalized, { method: "HEAD", cache: "no-store" });
      const type = response.headers.get("content-type") || "";
      if (response.ok && type.includes("image")) return true;
    } catch (error) {
    }
    try {
      const response = await fetch(normalized, { method: "GET", cache: "no-store" });
      const type = response.headers.get("content-type") || "";
      return response.ok && type.includes("image");
    } catch (error) {
      return false;
    }
  })();
  coverProbeCache.set(normalized, probe);
  const ok = await probe;
  if (!ok) coverProbeCache.delete(normalized);
  return ok;
}
function scoreBookMatch(book, candidateTitle = "", candidatePublisher = "") {
  const wantedTitle = normalizeTitleForCompare(book.title);
  const wantedPublisher = normalizeTitleForCompare(book.publisher);
  const title = normalizeTitleForCompare(candidateTitle);
  const publisher = normalizeTitleForCompare(candidatePublisher);
  let score = 0;
  if (title === wantedTitle) score += 12;
  else if (title.includes(wantedTitle) || wantedTitle.includes(title)) score += 8;
  if (publisher && wantedPublisher && publisher.includes(wantedPublisher)) score += 4;
  if (String(candidateTitle).toLowerCase().includes("art")) score += 1;
  return score;
}
async function fetchGoogleBooksCover(book, query) {
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5&projection=lite&printType=books`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const items = Array.isArray(data?.items) ? data.items : [];
  if (!items.length) return "";
  const ranked = items.map(item => ({ item, score: scoreBookMatch(book, item?.volumeInfo?.title || "", item?.volumeInfo?.publisher || "") + ((item?.volumeInfo?.industryIdentifiers || []).some(identifier => identifier.identifier === book.isbn13 || identifier.identifier === book.isbn10) ? 20 : 0) })).sort((a, b) => b.score - a.score);
  for (const entry of ranked) {
    const thumb = normalizeCoverUrl(getGoogleBookThumb(entry.item));
    if (thumb && await isImageReachable(thumb)) return thumb;
  }
  return "";
}
async function fetchOpenLibraryCoverByIsbn(isbn) {
  if (!isbn) return "";
  const candidates = [`https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`, `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg?default=false`];
  for (const candidate of candidates) {
    if (await isImageReachable(candidate)) return normalizeCoverUrl(candidate);
  }
  return "";
}
async function fetchOpenLibraryCover(book) {
  const params = new URLSearchParams({ title: book.title, publisher: book.publisher, limit: "5" });
  const res = await fetch(`https://openlibrary.org/search.json?${params.toString()}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const docs = Array.isArray(data?.docs) ? data.docs : [];
  const best = docs.filter(doc => doc?.cover_i).map(doc => ({ doc, score: scoreBookMatch(book, doc?.title || "", Array.isArray(doc?.publisher) ? doc.publisher[0] : "") + (((doc?.isbn || []).includes(book.isbn13) || (doc?.isbn || []).includes(book.isbn10)) ? 20 : 0) })).sort((a, b) => b.score - a.score)[0];
  if (!best?.doc?.cover_i) return "";
  const candidates = [`https://covers.openlibrary.org/b/id/${best.doc.cover_i}-L.jpg?default=false`, `https://covers.openlibrary.org/b/id/${best.doc.cover_i}-M.jpg?default=false`];
  for (const candidate of candidates) {
    if (await isImageReachable(candidate)) return normalizeCoverUrl(candidate);
  }
  return "";
}
async function fetchGoogleBooksFallbackByTitle(book) {
  const query = `${book.title} ${book.publisher}`.trim();
  if (!query) return "";
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10&projection=lite&printType=books`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const items = Array.isArray(data?.items) ? data.items : [];
  const ranked = items.map(item => ({ item, score: scoreBookMatch(book, item?.volumeInfo?.title || "", item?.volumeInfo?.publisher || "") })).sort((a, b) => b.score - a.score);
  for (const entry of ranked) {
    const thumb = normalizeCoverUrl(getGoogleBookThumb(entry.item));
    if (thumb && await isImageReachable(thumb)) return thumb;
  }
  return "";
}
async function fetchInternetArchiveCover(book) {
  const isbn = String(book.isbn13 || book.isbn10 || "").trim();
  if (!isbn) return "";
  const candidates = [`https://archive.org/download/isbn_${isbn}/isbn_${isbn}_L.jpg`, `https://archive.org/download/isbn_${isbn}/isbn_${isbn}_M.jpg`];
  for (const candidate of candidates) {
    if (await isImageReachable(candidate)) return normalizeCoverUrl(candidate);
  }
  return "";
}
async function fetchCoverForBook(book) {
  const cached = getCachedCover(book);
  if (cached && await isImageReachable(cached)) return cached;
  if (getMissCount(book) >= 3) return "";
  const isbns = [book.isbn13, book.isbn10].filter(Boolean);
  for (const isbn of isbns) {
    try {
      const cover = await fetchGoogleBooksCover(book, `isbn:${isbn}`);
      if (cover) return cacheCover(book, cover);
    } catch (error) {
    }
  }
  for (const isbn of isbns) {
    try {
      const cover = await fetchOpenLibraryCoverByIsbn(isbn);
      if (cover) return cacheCover(book, cover);
    } catch (error) {
    }
  }
  for (const isbn of isbns) {
    try {
      const cover = await fetchInternetArchiveCover({ isbn13: isbn, isbn10: isbn });
      if (cover) return cacheCover(book, cover);
    } catch (error) {
    }
  }
  for (const query of [`intitle:${book.title} inpublisher:${book.publisher}`, `intitle:${book.title}`, `${book.title} ${book.publisher}`]) {
    try {
      const cover = await fetchGoogleBooksCover(book, query);
      if (cover) return cacheCover(book, cover);
    } catch (error) {
    }
  }
  try {
    const cover = await fetchOpenLibraryCover(book);
    if (cover) return cacheCover(book, cover);
  } catch (error) {
  }
  try {
    const cover = await fetchGoogleBooksFallbackByTitle(book);
    if (cover) return cacheCover(book, cover);
  } catch (error) {
  }
  markCoverMiss(book);
  return "";
}
async function autoFillCovers() {
  autoFillBtn.disabled = true;
  showStatus("Searching for covers...");
  const coverStore = readCoverCache();
  const toProcess = books.filter(book => !book.cover);
  let found = 0;
  let checked = 0;
  for (const book of toProcess) {
    try {
      const cover = await fetchCoverForBook(book);
      checked += 1;
      if (cover) {
        book.cover = cover;
        cacheCover(book, cover, coverStore);
        clearCoverMiss(book);
        found += 1;
      }
      showStatus(`Searching covers... ${checked}/${toProcess.length} / found ${found}`);
      renderLibrary();
      if (selectedBook && selectedBook.id === book.id) renderSelectedBook();
    } catch (error) {
      checked += 1;
      showStatus(`Searching covers... ${checked}/${toProcess.length} / found ${found}`);
    }
    await new Promise(resolve => setTimeout(resolve, 120));
  }
  writeCoverCache(coverStore);
  showStatus(`Finished: ${found} cover(s) found for ${toProcess.length} book(s).`);
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
filterLibraryType.addEventListener("change", renderLibrary);
filterType.addEventListener("change", renderLibrary);
filterStyle.addEventListener("change", renderLibrary);
filterWorld.addEventListener("change", renderLibrary);
clearFiltersBtn.addEventListener("click", clearFilters);
mobileLibraryToggle?.addEventListener("click", () => {
  const expanded = mobileLibraryToggle.getAttribute("aria-expanded") === "true";
  setMobileLibraryCollapsed(expanded);
});
window.addEventListener("resize", syncMobileLibraryState);
manualModeBtn.addEventListener("click", () => setMode("manual"));
randomModeBtn.addEventListener("click", () => setMode("random"));
document.getElementById("generateManualBtn").addEventListener("click", generateManualBrief);
document.getElementById("useSelectedPageBtn").addEventListener("click", suggestPageForSelected);
rollBtn.addEventListener("click", launchTraining);
document.getElementById("rerollBookBtn").addEventListener("click", rerollBook);
document.getElementById("rerollTwistBtn").addEventListener("click", rerollFocus);
document.getElementById("saveSessionBtn").addEventListener("click", saveCurrentBrief);
document.getElementById("exportBtn").addEventListener("click", exportSessions);
document.getElementById("exportLibraryBtn").addEventListener("click", exportLibraryData);
document.getElementById("clearBtn").addEventListener("click", clearSessions);
savedSessions.addEventListener("click", event => {
  const item = event.target.closest("[data-session-id]");
  if (!item) return;
  restoreSavedSession(item.getAttribute("data-session-id"));
});
addBookBtn.addEventListener("click", openAddBookModal);
missionCard.addEventListener("click", async event => {
  const menuBtn = event.target.closest("[data-mission-cover-menu-btn]");
  const uploadBtn = event.target.closest("[data-mission-cover-upload]");
  const urlBtn = event.target.closest("[data-mission-cover-url]");
  const actions = missionCard.querySelector("[data-mission-cover-actions]");
  if (!menuBtn && !uploadBtn && !urlBtn && actions) actions.classList.add("hidden");
  if (menuBtn) {
    actions?.classList.toggle("hidden");
    return;
  }
  if (uploadBtn) {
    const input = missionCard.querySelector("[data-mission-cover-input]");
    if (input) input.click();
    return;
  }
  if (urlBtn) {
    const missionBook = currentMission?.book;
    if (!missionBook) return;
    const currentManualCover = readManualCovers()[missionBook.id] || "";
    const suggestedUrl = currentManualCover && !currentManualCover.startsWith("data:") ? currentManualCover : (missionBook.cover && !String(missionBook.cover).startsWith("data:") ? missionBook.cover : "");
    const pastedUrl = window.prompt("Paste the direct image URL for this book cover.", suggestedUrl);
    if (pastedUrl === null) return;
    try {
      await handleBookCoverUrl(missionBook.id, pastedUrl);
      missionCard.querySelector("[data-mission-cover-actions]")?.classList.add("hidden");
    } catch (error) {
      alert("That cover URL could not be saved.");
    }
  }
});
missionCard.addEventListener("change", async event => {
  const input = event.target.closest("[data-mission-cover-input]");
  if (!input || !input.files || !input.files[0] || !currentMission?.book) return;
  try {
    await handleBookCoverUpload(currentMission.book.id, input.files[0]);
    missionCard.querySelector("[data-mission-cover-actions]")?.classList.add("hidden");
  } catch (error) {
    alert("The selected image could not be used as a cover.");
  } finally {
    input.value = "";
  }
});
selectedBookCard.addEventListener("click", async event => {
  const uploadBtn = event.target.closest("[data-upload-cover-btn]");
  const coverUrlBtn = event.target.closest("[data-cover-url-btn]");
  const removeBtn = event.target.closest("[data-remove-cover-btn]");
  if (uploadBtn) {
    const input = selectedBookCard.querySelector("[data-cover-upload-input]");
    if (input) input.click();
    return;
  }
  if (coverUrlBtn) {
    const currentManualCover = readManualCovers()[selectedBook?.id] || "";
    const suggestedUrl = currentManualCover && !currentManualCover.startsWith("data:") ? currentManualCover : (selectedBook?.cover && !String(selectedBook.cover).startsWith("data:") ? selectedBook.cover : "");
    const pastedUrl = window.prompt("Paste the direct image URL for this book cover.", suggestedUrl);
    if (pastedUrl === null) return;
    try {
      await handleSelectedCoverUrl(pastedUrl);
    } catch (error) {
      alert("That cover URL could not be saved.");
    }
    return;
  }
  if (removeBtn && !removeBtn.hasAttribute("disabled")) removeSelectedBookCustomCover();
});
selectedBookCard.addEventListener("change", async event => {
  const input = event.target.closest("[data-cover-upload-input]");
  if (!input || !input.files || !input.files[0]) return;
  try {
    await handleSelectedCoverUpload(input.files[0]);
  } catch (error) {
    alert("The selected image could not be used as a cover.");
  } finally {
    input.value = "";
  }
});
pickReferenceBtn?.addEventListener("click", () => referenceImageInput?.click());
cameraReferenceBtn?.addEventListener("click", () => referenceCameraInput?.click());
clearReferenceBtn?.addEventListener("click", clearReferenceImage);
generateImageBriefBtn?.addEventListener("click", generateBriefFromImage);
referenceImageInput?.addEventListener("change", async event => {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    await handleReferenceFile(file);
  } catch (error) {
    showImageBriefStatus(error.message || "Image upload failed.", true);
  } finally {
    event.target.value = "";
  }
});
referenceCameraInput?.addEventListener("change", async event => {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    await handleReferenceFile(file);
  } catch (error) {
    showImageBriefStatus(error.message || "Image upload failed.", true);
  } finally {
    event.target.value = "";
  }
});
referenceDropZone?.addEventListener("click", event => {
  if (event.target.closest("button")) return;
  referenceImageInput?.click();
});
referenceDropZone?.addEventListener("keydown", event => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    referenceImageInput?.click();
  }
});
referenceDropZone?.addEventListener("dragover", event => {
  event.preventDefault();
  referenceDropZone.classList.add("is-dragover");
});
referenceDropZone?.addEventListener("dragleave", () => referenceDropZone.classList.remove("is-dragover"));
referenceDropZone?.addEventListener("drop", async event => {
  event.preventDefault();
  referenceDropZone.classList.remove("is-dragover");
  const file = event.dataTransfer?.files?.[0];
  if (!file) return;
  try {
    await handleReferenceFile(file);
  } catch (error) {
    showImageBriefStatus(error.message || "Image upload failed.", true);
  }
});
modalBackdrop.addEventListener("click", closeAddBookModal);
closeModalBtn.addEventListener("click", closeAddBookModal);
cancelModalBtn.addEventListener("click", closeAddBookModal);
saveBookBtn.addEventListener("click", saveNewBook);
parseImportBtn.addEventListener("click", () => {
  const parsed = parseImportedBookText(newBookImportText.value);
  if (!parsed || !parsed.title) {
    alert("I could not extract enough information from that pasted text. Try pasting a larger Libib block.");
    return;
  }
  applyImportedBookData(parsed);
});
[newBookTitle, newBookPublisher, newBookInitials, newBookColor, newBookIsbn13, newBookIsbn10, newBookCover, newBookNotes].forEach(el => el.addEventListener("input", updateNewBookPreview));
newBookLibraryType.addEventListener("change", updateNewBookPreview);
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !addBookModal.classList.contains("hidden")) closeAddBookModal();
});
function runTests() {
  console.assert(typeof fetchCoverForBook === "function", "fetchCoverForBook should exist");
  console.assert(typeof autoFillCovers === "function", "autoFillCovers should exist");
  console.assert(Array.isArray(books) && books.length > 0, "books should be a non-empty array");
  console.assert(seededBookCount > 0, "seeded library should load from books.json");
  console.assert(books.every(book => book.libraryType === "study" || book.libraryType === "artbook"), "each book should include a valid libraryType");
  console.assert(Object.keys(skillTemplates).length === 8, "skill templates should match the new skill focus set");
}
async function initApp() {
  try {
    populateSkillFocusSelect();
    populateCreationTypeSelect();
    initPracticeOptionChips();
    await loadBooks();
    initBookTags();
    renderLibrary();
    renderSelectedBook();
    renderSaved();
    updateImageReferencePreview();
    setMode("random");
    hideStatus();
    runTests();
  } catch (error) {
    console.error(error);
    libraryEl.innerHTML = `<div class="mini-card"><h4>Library Unavailable</h4><p>${error?.message || "The library could not be initialized."}</p></div>`;
    selectedBookCard.innerHTML = `<div class="mini-card"><h4>Data Error</h4><p>The app could not initialize the book library.</p></div>`;
  }
}
initApp();
window.saveCurrentBrief = saveCurrentBrief;









