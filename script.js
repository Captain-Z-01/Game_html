function svgDataUri(svg) {
  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg.trim());
}

function bannerSvg({ title, subtitle, accent, accent2, icon, pattern }) {
  return svgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 700" role="img" aria-label="${title}">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${accent}" />
          <stop offset="100%" stop-color="${accent2}" />
        </linearGradient>
        <radialGradient id="r" cx="30%" cy="25%" r="90%">
          <stop offset="0%" stop-color="rgba(255,255,255,.28)" />
          <stop offset="100%" stop-color="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>
      <rect width="1200" height="700" fill="url(#g)"/>
      <rect width="1200" height="700" fill="url(#r)"/>
      <circle cx="200" cy="150" r="130" fill="rgba(255,255,255,.12)"/>
      <circle cx="980" cy="120" r="170" fill="rgba(255,255,255,.08)"/>
      <circle cx="1040" cy="560" r="220" fill="rgba(255,255,255,.08)"/>
      <path d="${pattern}" fill="rgba(255,255,255,.10)"/>
      <g transform="translate(78 110)">
        <rect x="0" y="0" width="190" height="66" rx="22" fill="rgba(0,0,0,.24)" stroke="rgba(255,255,255,.18)"/>
        <text x="95" y="42" text-anchor="middle" font-size="28" font-family="Arial, sans-serif" fill="#fff">${subtitle}</text>
      </g>
      <g transform="translate(78 185)">
        <text x="0" y="0" font-size="64" font-family="Arial, sans-serif" font-weight="800" fill="#fff">${title}</text>
        <text x="0" y="62" font-size="28" font-family="Arial, sans-serif" fill="rgba(255,255,255,.92)">HTML Game Lobby</text>
      </g>
      <g transform="translate(860 170)">
        <rect x="0" y="0" width="250" height="250" rx="58" fill="rgba(255,255,255,.16)" stroke="rgba(255,255,255,.22)"/>
        <text x="125" y="160" text-anchor="middle" font-size="120" font-family="Arial, sans-serif">${icon}</text>
      </g>
      <g transform="translate(80 510)">
        <rect x="0" y="0" width="520" height="88" rx="28" fill="rgba(0,0,0,.22)" stroke="rgba(255,255,255,.16)"/>
        <text x="34" y="56" font-size="30" font-family="Arial, sans-serif" fill="#fff">Modern • Elegant • Responsive</text>
      </g>
    </svg>
  `);
}

const STORAGE_THEME = "Captain_Z-MD.theme";
const STORAGE_NAME = "User.Captain_Z";
const NAME_MIN = 3;
const NAME_MAX = 20;

const gameGrid = document.getElementById("gameGrid");
const emptyState = document.getElementById("emptyState");
const searchInput = document.getElementById("searchInput");
const welcomeText = document.getElementById("welcomeText");
const userNameEl = document.getElementById("userName");
const avatarBox = document.getElementById("avatarBox");
const userInfo = document.getElementById("userInfo");
const gameCount = document.getElementById("gameCount");
const activeTheme = document.getElementById("activeTheme");
const themeButtons = [...document.querySelectorAll(".theme-btn")];
const shuffleBtn = document.getElementById("shuffleBtn");
const resetThemeBtn = document.getElementById("resetThemeBtn");

const bannedNames = new Set([
  "admin",
  "administrator",
  "owner",
  "system",
  "root",
  "moderator",
  "null",
  "undefined",
  "superuser",
  "guest"
]);

const sourceGames = typeof defaultGames !== "undefined" ? defaultGames : [];
let games = [...sourceGames];

function injectNameGateStyle() {
  if (document.getElementById("nameGateStyle")) return;

  const style = document.createElement("style");
 
  document.head.appendChild(style);
}

function ensureNameModal() {
  let modal = document.getElementById("nameModal");
  if (modal) return modal;

  modal = document.createElement("div");
  modal.id = "nameModal";
  modal.className = "name-modal";
  modal.innerHTML = `
    <div class="name-box" role="dialog" aria-modal="true" aria-labelledby="nameTitle">
      <div class="name-badge">🔒 Nama wajib diisi</div>
      <h2 id="nameTitle">Masukkan Nama</h2>
      <p>Isi nama dulu untuk membuka lobby.</p>
      <input
        id="nameInput"
        class="name-field"
        type="text"
        placeholder="Nama kamu"
        maxlength="${NAME_MAX}"
        autocomplete="off"
        autocapitalize="words"
        spellcheck="false"
      />
      <p id="nameError" class="name-error" aria-live="polite"></p>
      <button id="continueBtn" class="name-continue" type="button">Lanjut</button>
    </div>
  `;
  document.body.appendChild(modal);
  return modal;
}

function getStoredTheme() {
  const saved = localStorage.getItem(STORAGE_THEME);
  return saved && saved.trim() ? saved.trim() : "midnight";
}

function parseLegacyName(raw) {
  if (!raw) return "";

  const trimmed = raw.trim();
  if (!trimmed) return "";

  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === "object" && typeof parsed.name === "string") {
      return parsed.name.trim();
    }
  } catch {
    // Bukan JSON, lanjut pakai teks biasa
  }

  return trimmed;
}

function getStoredName() {
  return parseLegacyName(localStorage.getItem(STORAGE_NAME));
}

function saveStoredName(name) {
  localStorage.setItem(STORAGE_NAME, name);
}

function validateName(name) {
  const value = name.trim();

  if (value.length < NAME_MIN) {
    return `Nama minimal ${NAME_MIN} karakter.`;
  }

  if (value.length > NAME_MAX) {
    return `Nama maksimal ${NAME_MAX} karakter.`;
  }

  if (/^\d+$/.test(value)) {
    return "Nama tidak boleh hanya angka.";
  }

  if (!/^[a-zA-Z0-9 _.-]+$/.test(value)) {
    return "Hanya boleh huruf, angka, spasi, titik, underscore, dan strip.";
  }

  if (bannedNames.has(value.toLowerCase())) {
    return "Nama tersebut tidak diperbolehkan.";
  }

  return "";
}

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(STORAGE_THEME, theme);
  activeTheme.textContent = theme.charAt(0).toUpperCase() + theme.slice(1);
  themeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.theme === theme);
  });
}

function setUser() {
  const name = getStoredName() || "Teman";
  userNameEl.textContent = name;
  welcomeText.textContent = `Selamat datang, ${name}`;
  userInfo.textContent = "Siap main dari lobby game";
  avatarBox.textContent =
    name
      .split(/[\s._-]+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "G";
}

function renderGames(list) {
  gameGrid.innerHTML = "";
  gameCount.textContent = String(list.length);

  if (!list.length) {
    emptyState.style.display = "block";
    return;
  }

  emptyState.style.display = "none";

  list.forEach((game) => {
    const card = document.createElement("article");
    card.className = "game-card";
    card.innerHTML = `
      <div class="thumb">
        <img src="${game.image}" alt="${game.name} banner" />
        <div class="tag">${game.theme}</div>
        <div class="icon">${game.icon}</div>
      </div>
      <div class="game-body">
        <h4>${game.name}</h4>
        <p>${game.desc}</p>
        <div class="meta">
          ${game.tags.map((tag) => `<span>${tag}</span>`).join("")}
        </div>
        <div class="card-actions">
          <a class="action-btn primary" href="${game.file}">Mainkan</a>
        </div>
      </div>
    `;
    gameGrid.appendChild(card);
  });
}

function filterGames() {
  const q = searchInput.value.trim().toLowerCase();
  const filtered = games.filter((game) =>
    [game.name, game.theme, game.desc, ...game.tags]
      .join(" ")
      .toLowerCase()
      .includes(q)
  );
  renderGames(filtered);
}

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function initNameGate() {
  injectNameGateStyle();
  const modal = ensureNameModal();
  const input = document.getElementById("nameInput");
  const btn = document.getElementById("continueBtn");
  const errorText = document.getElementById("nameError");

  const finish = () => {
    modal.classList.add("hide");
    document.body.style.overflow = "";
    setUser();
  };

  const submit = () => {
    const name = input.value.trim();
    const error = validateName(name);

    if (error) {
      errorText.textContent = error;
      input.focus();
      return;
    }

    errorText.textContent = "";
    saveStoredName(name);
    finish();
  };

  input.addEventListener("input", () => {
    errorText.textContent = "";
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    }
  });

  btn.addEventListener("click", submit);

  const savedName = getStoredName();
  if (savedName) {
    modal.classList.add("hide");
    document.body.style.overflow = "";
    setUser();
    return;
  }

  modal.classList.remove("hide");
  document.body.style.overflow = "hidden";
  input.value = "";
  errorText.textContent = "";
  setUser();
  setTimeout(() => input.focus(), 0);
}

themeButtons.forEach((button) => {
  button.addEventListener("click", () => setTheme(button.dataset.theme));
});

shuffleBtn.addEventListener("click", () => {
  games = shuffleArray(games);
  filterGames();
});

resetThemeBtn.addEventListener("click", () => {
  setTheme("midnight");
});

searchInput.addEventListener("input", filterGames);

initNameGate();
setTheme(getStoredTheme());
renderGames(games);