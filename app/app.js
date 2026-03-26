let books = [];
let seededBookCount = 0;
    const goals = ["silhouette", "color", "composition", "render", "visual storytelling", "functional design", "mood", "commercial clarity", "worldbuilding", "ui thinking"];
    const goalExamples = {
      "silhouette": "Example: a character should read clearly as a solid black shape and still be recognizable through pose, volume, and key accessories.",
      "color": "Example: use a dominant 3-color palette and one accent to separate focal point, background, and secondary elements.",
      "composition": "Example: organize the image into one dominant mass, one secondary mass, and one area of visual breathing room.",
      "render": "Example: focus on a hero material such as worn metal, leather, or cloth and clearly separate hard and soft edges.",
      "visual storytelling": "Example: the design should suggest background, role, and conflict without text, using only shape, wear, and detail.",
      "functional design": "Example: each costume piece or prop should feel useful and believable inside the world.",
      "mood": "Example: prioritize atmosphere with light, scale, and fog before fine detail.",
      "commercial clarity": "Example: the piece should read quickly, with a strong focal point and clean readability even at thumbnail size.",
      "worldbuilding": "Example: add signs of the world such as symbols, architecture, materials, or consistent visual customs.",
      "ui thinking": "Example: design an interface where hierarchy, icons, and contrast make everything readable in seconds."
    };
    const typePrompts = {
      character: "design a new character inspired by the visual rules of the reference",
      environment: "create an environment or scene using the atmosphere and visual language of the book",
      props: "design an object or set of props that feels native to that universe",
      ui: "propose an interface, HUD, or icon set that matches that art direction",
      creature: "design a creature with visible story in its form and materials",
      keyart: "compose a hero image or key art piece with clear focus and commercial readability"
    };
    const styleTwists = [
      "completely changing the role of the subject",
      "set in a Latin American context",
      "using only 3 dominant colors",
      "mixing Blizzard-style clarity with cinematic drama",
      "with a simpler silhouette and instant readability",
      "designed as a commercial portfolio piece",
      "reimagined for a premium mobile game",
      "with a narrative of decay or wear",
      "with strong contrast between organic and artificial elements",
      "avoiding any direct composition copy"
    ];
    const difficultyRules = {
      "easy": "Create one clear direction and prioritize readability over detail.",
      "medium": "Generate 2 thumbnails and choose one final version with a small narrative twist.",
      "hard": "Create 3 thumbnails, mix two influences from the same book, and add a strong formal constraint."
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
    const expandedPublishers = new Set();
    let saved = JSON.parse(localStorage.getItem("artbook_training_sessions") || "[]");

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
    const newBookIsbn13 = document.getElementById("newBookIsbn13");
    const newBookIsbn10 = document.getElementById("newBookIsbn10");
    const newBookCover = document.getElementById("newBookCover");
    const newBookNotes = document.getElementById("newBookNotes");
    const newBookImportText = document.getElementById("newBookImportText");
    const parseImportBtn = document.getElementById("parseImportBtn");
    const newBookPreview = document.getElementById("newBookPreview");
    const missionCard = document.getElementById("missionCard");
    const rollBtn = document.getElementById("rollBtn");
    const clearFiltersBtn = document.getElementById("clearFiltersBtn");

    async function loadBooks() {
      const response = await fetch("./data/books.json", { cache: "no-store" });
      if (!response.ok) throw new Error(`Unable to load books.json (${response.status})`);

      const seededBooks = await response.json();
      if (!Array.isArray(seededBooks)) throw new Error("books.json must contain an array of books.");

      seededBookCount = seededBooks.length;
      books = seededBooks.map(book => ({ ...book }));

      const customBooks = JSON.parse(localStorage.getItem("artbook_custom_books") || "[]");
      if (customBooks.length) books.push(...customBooks);

      const persistedCovers = JSON.parse(localStorage.getItem("artbook_auto_covers") || "{}");
      books.forEach(book => {
        if (!book.cover && persistedCovers[book.id]) book.cover = persistedCovers[book.id];
      });
    }


    function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
    function pickPage(type) {
      const [min, max] = pageRanges[type] || [20, 120];
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    function inferPrimaryGoal(book, type) {
      if (type === "ui") return "ui thinking";
      if (type === "environment") return "mood";
      if (type === "keyart") return "composition";
      if (book.tags.includes("stylized")) return "commercial clarity";
      if (book.tags.includes("realistic")) return "render";
      return "silhouette";
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
      if (source.includes("clothing") || source.includes("vêtement") || source.includes("plis")) tags.add("props");
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
      const contentLines = lines.filter(line => !/\b(?:97[89]\d{10}|\d{9}[\dXx])\b/.test(line) && !/[¤$€£]\s*\d/.test(line));

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
    function clearFilters() {
      searchInput.value = "";
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
      const type = filterType.value;
      const style = filterStyle.value;
      const world = filterWorld.value;

      const items = books.filter(book => {
        const haystack = `${book.title} ${book.publisher} ${book.tags.join(" ")}`.toLowerCase();
        return (!q || haystack.includes(q)) && (!type || book.tags.includes(type)) && (!style || book.tags.includes(style)) && (!world || book.tags.includes(world));
      });

      libraryEl.innerHTML = "";
      if (!items.length) {
        libraryEl.innerHTML = `<div class="mini-card"><h4>No results</h4><p>Try another filter or search term.</p></div>`;
        return;
      }

      const grouped = items.reduce((map, book) => {
        if (!map.has(book.publisher)) map.set(book.publisher, []);
        map.get(book.publisher).push(book);
        return map;
      }, new Map());

      const orderedGroups = [...grouped.entries()].sort((a, b) => a[0].localeCompare(b[0]));
      const forceOpenSelected = selectedBook ? selectedBook.publisher : "";
      const useDefaultOpen = expandedPublishers.size === 0 && !forceOpenSelected && !q && !type && !style && !world;

      orderedGroups.forEach(([publisher, publisherBooks], index) => {
        const group = document.createElement("details");
        group.className = "library-group";
        group.dataset.publisher = publisher;
        group.open = expandedPublishers.has(publisher) || publisher === forceOpenSelected || (useDefaultOpen && index < 2);

        const summary = document.createElement("summary");
        summary.className = "library-group-summary";
        summary.innerHTML = `<span class="library-group-name">${publisher}</span><span class="library-group-count">${publisherBooks.length}</span>`;
        group.appendChild(summary);

        const list = document.createElement("div");
        list.className = "library-group-list";

        publisherBooks.forEach(book => {
          const node = document.createElement("button");
          node.type = "button";
          node.className = `book${selectedBook && selectedBook.id === book.id ? " active" : ""}`;
          const tags = book.tags.slice(0, 2).join(" • ");
          node.innerHTML = `${makeThumbMarkup(book)}<div class="book-meta"><div class="book-title">${book.title}</div><div class="book-sub">${tags}</div></div>`;
          node.addEventListener("click", () => selectBook(book.id));
          list.appendChild(node);
        });

        group.appendChild(list);
        group.addEventListener("toggle", () => {
          if (group.open) expandedPublishers.add(publisher);
          else expandedPublishers.delete(publisher);
        });
        libraryEl.appendChild(group);
      });
    }

    function selectBook(id) {
      selectedBook = books.find(b => b.id === id) || null;
      if (selectedBook) expandedPublishers.add(selectedBook.publisher);
      renderLibrary();
      renderSelectedBook();
      if (selectedBook) {
        document.getElementById("headerEyebrow").textContent = selectedBook.publisher;
        document.getElementById("headerTitle").textContent = selectedBook.title;
        document.getElementById("headerDesc").textContent = `Tags: ${selectedBook.tags.join(", ")}. You can use this book as the base for a manual exercise or ask for a plausible page suggestion.`;
      }
    }

    function getBookStrength(book) {
      if (book.tags.includes("ui")) return "Very useful for UI, iconography, functional design, and exercises with clear constraints.";
      if (book.tags.includes("dark fantasy")) return "Excellent for visual storytelling, broken silhouettes, aged materials, and atmosphere.";
      if (book.tags.includes("stylized")) return "Perfect for commercial clarity, character appeal, and strong visual language.";
      if (book.tags.includes("realistic")) return "Ideal for believable materials, cinematic composition, and professional portfolio work.";
      return "A strong book for general visual exploration and reinterpretation exercises.";
    }

    function renderSelectedBook() {
      if (!selectedBook) {
        selectedBookCard.innerHTML = `<div class="mini-card"><h4>No book selected</h4><p>Select an artbook in the left column. Then you can generate a manual exercise from that book.</p></div>`;
        return;
      }
      const isbnLines = [
        selectedBook.isbn13 ? `<span><strong style="color:var(--text)">ISBN-13:</strong> ${selectedBook.isbn13}</span>` : "",
        selectedBook.isbn10 ? `<span><strong style="color:var(--text)">ISBN-10:</strong> ${selectedBook.isbn10}</span>` : ""
      ].filter(Boolean).join("<br>");

      selectedBookCard.innerHTML = `
        <div class="mini-card">
          <div style="display:flex; gap:12px; align-items:center; margin-bottom:10px;">
            ${makeThumbMarkup(selectedBook, 64, 84)}
            <div>
              <h4 style="margin:0 0 4px; font-size:15px;">${selectedBook.title}</h4>
              <p><strong style="color:var(--text)">${selectedBook.publisher}</strong><br>${selectedBook.tags.join(" • ")}${isbnLines ? `<br><br>${isbnLines}` : ""}</p>
            </div>
          </div>
        </div>
        <div class="mini-card">
          <h4>Recommended Use</h4>
          <p>${getBookStrength(selectedBook)}</p>
        </div>
      `;
    }

    function buildConcept(book, type, goal, twist) {
      return `You are going to ${typePrompts[type]}. The main focus will be ${goal}. The reference should help you extract visual rules from the world of ${book.title}, not copy it literally, ${twist}.`;
    }
    function buildAnalysis(book, type) {
      const style = book.tags.find(t => ["stylized","realistic","semi-realistic","cartoon","anime"].includes(t)) || "mixed style";
      const world = book.tags.find(t => ["fantasy","dark fantasy","sci-fi","modern","historical","horror","superhero"].includes(t)) || "hybrid universe";
      const lines = [`Observe how ${book.title} handles a ${style} visual language within a ${world} setting.`];
      if (type === "character") lines.push("Study silhouette, detail hierarchy, costume design, and focal points around the face and hands.");
      if (type === "environment") lines.push("Analyze depth, mass grouping, dominant light, and long-distance readability.");
      if (type === "props") lines.push("Look at proportions, materials, wear, and object function within the world.");
      if (type === "ui") lines.push("Observe readability, iconography, contrast, modularity, and interface rhythm.");
      if (type === "creature") lines.push("Identify which parts tell the story: altered anatomy, materials, weight, and threat.");
      if (type === "keyart") lines.push("Analyze focal point, overall gesture, visual flow, and the relationship between figure and background.");
      return lines.join(" ");
    }
    function buildChallenge(book, type, difficulty, goal, twist) {
      return `Your challenge is to solve a ${type} exercise useful for portfolio work while training ${goal}. ${difficulty} level: ${difficultyRules[difficulty]} Also: ${twist}. Avoid tracing pose, composition, or an existing design; translate principles, not results.`;
    }
    function buildSteps(type, difficulty, time) {
      return [
        "Do a quick 30-second read of the reference and write down 3 key visual rules.",
        difficulty === "hard" ? "Generate 3 thumbnails with different approaches and force a radical variation in at least one of them." : "Generate 2 small thumbnails before committing to a single direction.",
        `Develop the option with the clearest read for ${type}, adapting it to the available time (${time}).`,
        "Reinforce the focal point with contrast, detail hierarchy, and a clear silhouette.",
        "Finish with a short written review: what you took from the book and what you transformed."
      ];
    }
    function buildDeliverable(type, difficulty, time) {
      const thumbs = difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 3;
      return `Deliverable: ${thumbs} thumbnail(s), 1 main ${type} piece, and 3 learning notes. Scale the finish to the available time (${time}).`;
    }
    function buildSuccessCriteria(type, goal) {
      return [
        `The piece reads quickly even without explaining the context (${type}).`,
        `A clear intention around ${goal} is visible and it does not feel like a copy of the original.`,
        "It has enough personality to work as a strong study or portfolio foundation."
      ];
    }
    function buildChatGPTPrompt(book, page, type, difficulty, time, goals, notes, twist) {
      return `Training mode. Book #${book.id}: ${book.title}. Page ${page}. Type: ${type}. Difficulty: ${difficulty}. Time: ${time}. Goals: ${goals.join(", ") || "none specified"}. Twist: ${twist}. Notes: ${notes || "none"}. Give me a deeper brief with visual analysis, constraints, steps, and success criteria.`;
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
      const goalsText = brief.goals.length ? brief.goals.join(" • ") : "automatic goal";
      briefOutput.innerHTML = `
        <h3>${brief.mode === "random" ? "Generated Mission" : "Custom Brief"}</h3>
        <div class="section">
          <small>Reference</small>
          <p><strong style="color:var(--text)">#${brief.book.id} • ${brief.book.title}</strong><br>${brief.book.publisher} • page ${brief.page} • ${brief.type} • difficulty ${brief.difficulty} • ${brief.time}</p>
        </div>
        <div class="section"><small>Objective</small><p>${brief.concept}</p></div>
        <div class="section"><small>What to Analyze</small><p>${brief.analysis}</p></div>
        <div class="section"><small>Challenge</small><p>${brief.challenge}</p></div>
        <div class="section"><small>Steps</small><ul>${brief.steps.map(step => `<li>${step}</li>`).join("")}</ul></div>
        <div class="section"><small>Deliverable</small><p>${brief.deliverable}</p></div>
        <div class="section"><small>Success Criteria</small><ul>${brief.success.map(item => `<li>${item}</li>`).join("")}</ul></div>
        <div class="section"><small>Active Goals</small><p>${goalsText}</p></div>
        <div class="section">
          <small>Prompt to Bring into ChatGPT</small>
          <textarea readonly id="promptBox">${brief.prompt}</textarea>
          <div class="actions" style="margin-top:10px;">
            <button class="btn" onclick="copyPrompt()" type="button">Copy Prompt</button>
            <button class="btn ghost" onclick="saveCurrentBrief()" type="button">Save Session</button>
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
              <h3 class="mission-title">#${brief.book.id} • ${brief.book.title}</h3>
              <div class="mission-sub">${brief.book.publisher}</div>
            </div>
          </div>
          <div class="mission-page"><strong>${brief.page}</strong><span>page</span></div>
        </div>
        <div class="mission-sub" style="margin-bottom:12px; color:var(--text)">Create a ${brief.type} inspired by this book, ${brief.twist}.</div>
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
        alert("Select an artbook first.");
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
      rollBtn.textContent = "Rolling...";
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
          const difficulty = pickRandom(["easy","medium","hard"]);
          const time = pickRandom(["30 min","45 min","1 hour","2 hours"]);
          const page = pickPage(type);
          const twist = pickRandom(styleTwists);
          const goals = [inferPrimaryGoal(book, type)];
          currentMission = buildBrief({ book, page, type, difficulty, time, goals, notes: "", mode: "random", twist });
          renderMission(currentMission);
          renderBrief(currentMission);
          rollBtn.disabled = false;
          rollBtn.textContent = "🎲 Start Training";
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
        savedSessions.innerHTML = `<div class="mini-card"><h4>No saved sessions</h4><p>When you generate a brief, you can save it here.</p></div>`;
        return;
      }
      savedSessions.innerHTML = saved.slice(0, 12).map(item => `
        <div class="session-item">
          <strong>${item.title}</strong>
          <span>${item.date} • ${item.mode} • ${item.type} • ${item.difficulty}</span>
        </div>
      `).join("");
    }

    function saveCurrentBrief() {
      if (!window.latestBrief) return;
      saved.unshift({
        id: Date.now(),
        date: new Date().toLocaleDateString("en-US"),
        title: `${window.latestBrief.book.title} • p.${window.latestBrief.page}`,
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
      if (!confirm("Clear all saved history?")) return;
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
      const title = newBookTitle.value.trim() || "Artbook title";
      const publisher = newBookPublisher.value.trim() || "Publisher / Studio";
      const initials = (newBookInitials.value.trim() || title.slice(0, 2) || "AB").toUpperCase().slice(0, 3);
      const color = newBookColor.value || "#a78bfa";
      const isbn13 = newBookIsbn13.value.trim();
      const isbn10 = newBookIsbn10.value.trim();
      const cover = newBookCover.value.trim();
      const tags = getSelectedBookTags();
      const notes = newBookNotes.value.trim();
      newBookPreview.innerHTML = `
        <h4>Preview</h4>
        <div style="display:flex; gap:12px; align-items:center; margin-bottom:10px;">
          ${makeThumbMarkup({ initials, color, cover }, 52, 70)}
          <div>
            <div style="color:var(--text); font-weight:700;">${title}</div>
            <div style="color:var(--muted); font-size:12px;">${publisher}</div>
          </div>
        </div>
        <p>${tags.length ? tags.join(" • ") : "No tags selected yet."}${(isbn13 || isbn10) ? `<br><br>${isbn13 ? `ISBN-13: ${isbn13}` : ""}${isbn13 && isbn10 ? `<br>` : ""}${isbn10 ? `ISBN-10: ${isbn10}` : ""}` : ""}${notes ? `<br><br>${notes}` : ""}</p>
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
        const keepGoing = confirm(`This book already seems to exist in your library:\n\n#${duplicate.id} • ${duplicate.title}\n\nIf you continue, it will still be added as a new entry. Do you want to keep going?`);
        if (!keepGoing) return;
      }

      const nextId = Math.max(...books.map(b => b.id), 0) + 1;
      const newBook = { id: nextId, title, publisher, initials, color, cover, isbn13, isbn10, tags };
      books.push(newBook);
      const existingCustom = JSON.parse(localStorage.getItem("artbook_custom_books") || "[]");
      existingCustom.push(newBook);
      localStorage.setItem("artbook_custom_books", JSON.stringify(existingCustom));
      closeAddBookModal();
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
      return links?.thumbnail || links?.smallThumbnail || links?.small || links?.medium || links?.large || "";
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

      const best = items
        .map(item => ({
          item,
          score: scoreBookMatch(
            book,
            item?.volumeInfo?.title || "",
            (item?.volumeInfo?.publisher || "")
          ) + ((item?.volumeInfo?.industryIdentifiers || []).some(identifier => identifier.identifier === book.isbn13 || identifier.identifier === book.isbn10) ? 20 : 0)
        }))
        .sort((a, b) => b.score - a.score)
        .find(entry => getGoogleBookThumb(entry.item));

      const thumb = best ? getGoogleBookThumb(best.item) : "";
      return thumb ? thumb.replace(/^http:/, "https:") : "";
    }

    async function fetchOpenLibraryCoverByIsbn(isbn) {
      if (!isbn) return "";
      const res = await fetch(`https://openlibrary.org/isbn/${isbn}.json`);
      if (!res.ok) return `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
      return `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
    }

    async function fetchOpenLibraryCover(book) {
      const params = new URLSearchParams({
        title: book.title,
        publisher: book.publisher,
        limit: "5"
      });
      const res = await fetch(`https://openlibrary.org/search.json?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const docs = Array.isArray(data?.docs) ? data.docs : [];
      const best = docs
        .filter(doc => doc?.cover_i)
        .map(doc => ({
          doc,
          score: scoreBookMatch(book, doc?.title || "", Array.isArray(doc?.publisher) ? doc.publisher[0] : "") + (((doc?.isbn || []).includes(book.isbn13) || (doc?.isbn || []).includes(book.isbn10)) ? 20 : 0)
        }))
        .sort((a, b) => b.score - a.score)[0];

      if (!best?.doc?.cover_i) return "";
      return `https://covers.openlibrary.org/b/id/${best.doc.cover_i}-L.jpg`;
    }

    async function fetchCoverForBook(book) {
      const isbns = [book.isbn13, book.isbn10].filter(Boolean);
      for (const isbn of isbns) {
        try {
          const cover = await fetchGoogleBooksCover(book, `isbn:${isbn}`);
          if (cover) return cover;
        } catch (err) {
        }
      }

      for (const isbn of isbns) {
        try {
          const cover = await fetchOpenLibraryCoverByIsbn(isbn);
          if (cover) return cover;
        } catch (err) {
        }
      }

      const queries = [
        `intitle:${book.title} inpublisher:${book.publisher}`,
        `intitle:${book.title}`,
        `${book.title} ${book.publisher}`
      ];

      for (const query of queries) {
        try {
          const cover = await fetchGoogleBooksCover(book, query);
          if (cover) return cover;
        } catch (err) {
        }
      }

      try {
        return await fetchOpenLibraryCover(book);
      } catch (err) {
        return "";
      }
    }

    async function autoFillCovers() {
      autoFillBtn.disabled = true;
      showStatus("Searching for covers automatically...");
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
          showStatus(`Searching covers... ${checked}/${toProcess.length} • found ${found}`);
          renderLibrary();
          if (selectedBook && selectedBook.id === book.id) renderSelectedBook();
        } catch (err) {
          checked += 1;
          showStatus(`Searching covers... ${checked}/${toProcess.length} • found ${found}`);
        }
        await new Promise(resolve => setTimeout(resolve, 120));
      }

      localStorage.setItem("artbook_auto_covers", JSON.stringify(coverStore));
      showStatus(`Finished: ${found} cover(s) found for ${toProcess.length} book(s) without a cover.`);
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
    clearFiltersBtn.addEventListener("click", clearFilters);
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
    parseImportBtn.addEventListener("click", () => {
      const parsed = parseImportedBookText(newBookImportText.value);
      if (!parsed || !parsed.title) {
        alert("I could not extract enough information from that pasted text. Try pasting a larger Libib block.");
        return;
      }
      applyImportedBookData(parsed);
    });
    [newBookTitle, newBookPublisher, newBookInitials, newBookColor, newBookIsbn13, newBookIsbn10, newBookCover, newBookNotes].forEach(el => el.addEventListener("input", updateNewBookPreview));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !addBookModal.classList.contains("hidden")) closeAddBookModal();
    });

    function runTests() {
      console.assert(typeof fetchCoverForBook === "function", "fetchCoverForBook should exist");
      console.assert(fetchCoverForBook.constructor.name === "AsyncFunction", "fetchCoverForBook should be async");
      console.assert(typeof autoFillCovers === "function", "autoFillCovers should exist");
      console.assert(autoFillCovers.constructor.name === "AsyncFunction", "autoFillCovers should be async");
      console.assert(Array.isArray(books) && books.length > 0, "books should be a non-empty array");
      console.assert(seededBookCount > 0, "seeded library should load from books.json");
      console.assert(books.slice(0, seededBookCount).every(book => book.isbn13 || book.isbn10), "each seeded book should include an ISBN for cover lookup");
    }

    async function initApp() {
      try {
        await loadBooks();
        initGoals();
        initBookTags();
        updateNewBookPreview();
        renderLibrary();
        renderSelectedBook();
        renderSaved();
        runTests();
      } catch (error) {
        console.error(error);
        libraryEl.innerHTML = `<div class="mini-card"><h4>Library Unavailable</h4><p>books.json could not be loaded. Check the data file path or local server.</p></div>`;
        selectedBookCard.innerHTML = `<div class="mini-card"><h4>Data Error</h4><p>The app could not initialize the book library.</p></div>`;
      }
    }

    initApp();

    window.copyPrompt = copyPrompt;
    window.saveCurrentBrief = saveCurrentBrief;























