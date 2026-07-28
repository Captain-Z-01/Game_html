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
    const modal = document.getElementById("nameModal");
    const input = document.getElementById("nameInput");
    const btn = document.getElementById("continueBtn");

    const saved = localStorage.getItem(STORAGE_NAME);

    let games = [...defaultGames];
    if (saved && saved.trim()) {
    modal.classList.add("hide");
} else {
    input.focus();

    btn.onclick = () => {
        const name = input.value.trim();

        if (!name) {
            input.focus();
            return;
        }

        localStorage.setItem(STORAGE_NAME, name);
        modal.classList.add("hide");
        setUser();
    };
    }
    function getStoredName() {
      const saved = localStorage.getItem(STORAGE_NAME);
      return saved && saved.trim() ? saved.trim() : "Teman";
    }

    function getStoredTheme() {
      const saved = localStorage.getItem(STORAGE_THEME);
      return saved && saved.trim() ? saved.trim() : "midnight";
    }

    function setTheme(theme) {
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem(STORAGE_THEME, theme);
      activeTheme.textContent = theme.charAt(0).toUpperCase() + theme.slice(1);
      themeButtons.forEach(btn => btn.classList.toggle("active", btn.dataset.theme === theme));
    }

    function setUser() {
      const name = getStoredName();
      userNameEl.textContent = name;
      welcomeText.textContent = `Selamat datang, ${name}`;
      userInfo.textContent = `Siap main dari lobby game`;
      avatarBox.textContent = name.split(/[\s._-]+/).map(part => part[0]).join("").slice(0, 2).toUpperCase() || "G";
    }

    function renderGames(list) {
      gameGrid.innerHTML = "";
      gameCount.textContent = String(list.length);

      if (!list.length) {
        emptyState.style.display = "block";
        return;
      }

      emptyState.style.display = "none";

      list.forEach(game => {
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
              ${game.tags.map(tag => `<span>${tag}</span>`).join("")}
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
      const filtered = games.filter(game =>
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

    themeButtons.forEach(btn => {
      btn.addEventListener("click", () => setTheme(btn.dataset.theme));
    });

    shuffleBtn.addEventListener("click", () => {
      games = shuffleArray(games);
      filterGames();
    });

    resetThemeBtn.addEventListener("click", () => {
      setTheme("midnight");
    });

    searchInput.addEventListener("input", filterGames);

    setUser();
    setTheme(getStoredTheme());
    renderGames(games);
  
