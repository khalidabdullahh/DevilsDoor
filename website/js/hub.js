/**
 * DIGITAL GAME MARKETPLACE 2.0 — GAMING HUB CONTROLLER
 * Architecture: Curated Studio Releases + User Uploads Engine
 * Featured Games:
 * 1. Shadow Assassin: Descent of Shinobi (Flagship 2.5D Action Platformer)
 * 2. Spider-Man: Legacy Mobile (Unreal Engine 3D Superhero Beta)
 */
(function () {
  'use strict';

  // Official Studio Games
  const OFFICIAL_GAMES = [
    {
      id: 'devils-door',
      title: "Shadow Assassin: Descent of Shinobi",
      subtitle: "Devil's Door Flagship Edition",
      genre: "Endless 2.5D Action Platformer",
      category: "dark-fantasy",
      author: "Khalid Abdullah",
      rating: "4.9",
      players: "18.4K",
      badge: "Official Flagship",
      badgeClass: "badge-featured",
      status: "PLAY NOW",
      desc: "An endless dark fantasy 2.5D action-platformer. Procedural realm generation, 4 legendary shinobi heroes, 10 dynamic atmospheric realms, and brutal shadow combat.",
      thumb: "/src/assets/branding/master_cover.jpg",
      playUrl: "/game",
      isOfficial: true,
      type: "web"
    },
    {
      id: 'spiderman-legacy',
      title: "Spider-Man: Legacy",
      subtitle: "3D Manhattan Web-Swinging",
      genre: "3D Superhero Action Adventure",
      category: "action",
      author: "Khalid Abdullah",
      rating: "4.9",
      players: "1 Player (Web 3D + APK)",
      badge: "Playable Web 3D",
      badgeClass: "badge-hot",
      status: "PLAY NOW",
      desc: "High-octane 3D web-slinging superhero action. Experience dynamic pendulum physics, acrobatic aerial dives, and open Manhattan exploration directly in your browser or on Android.",
      thumb: "/src/assets/web/spiderman-icon.png",
      playUrl: "/spiderman.html",
      downloadUrl: "/spiderman-legacy.apk",
      apkSize: "183.1 MB",
      isOfficial: true,
      type: "html5"
    }
  ];

  // State
  let currentCategory = 'all';
  let searchQuery = '';
  let customGames = [];

  // Load Custom Games uploaded by user
  function loadCustomGames() {
    try {
      const data = localStorage.getItem('dd_hub_custom_games');
      if (data) customGames = JSON.parse(data);
    } catch (e) {
      console.warn('Could not read custom games:', e);
      customGames = [];
    }
  }

  function saveCustomGames() {
    try {
      localStorage.setItem('dd_hub_custom_games', JSON.stringify(customGames));
    } catch (e) {
      console.error('Could not save custom games:', e);
    }
  }

  function getAllGames() {
    return [...OFFICIAL_GAMES, ...customGames];
  }

  // DOM Elements
  const catalogGrid = document.getElementById('catalog-grid');
  const userUploadsGrid = document.getElementById('user-uploads-grid');
  const countBadge = document.getElementById('games-count-badge');
  const searchInput = document.getElementById('search-input');
  const filterChips = document.querySelectorAll('.hub-chip');

  // Modals
  const theatreModal = document.getElementById('theatre-modal');
  const theatreFrame = document.getElementById('theatre-iframe');
  const theatreTitle = document.getElementById('theatre-game-title');
  const theatreClose = document.getElementById('theatre-close');
  const theatreReload = document.getElementById('theatre-reload');
  const theatreFullscreen = document.getElementById('theatre-fullscreen');

  const spidermanModal = document.getElementById('spiderman-modal');
  const spidermanClose = document.getElementById('spiderman-close');

  const uploadModal = document.getElementById('upload-modal');
  const uploadBtn = document.getElementById('btn-upload-game');
  const uploadClose = document.getElementById('upload-close');
  const uploadForm = document.getElementById('upload-form');
  const gameFileInput = document.getElementById('game-file-input');
  const coverFileInput = document.getElementById('cover-file-input');

  // Hero Reel Items
  const heroBanner = document.getElementById('hero-banner');
  const reelItems = document.querySelectorAll('.hub-reel-item');

  reelItems.forEach(item => {
    item.addEventListener('click', () => {
      reelItems.forEach(r => r.classList.remove('active'));
      item.classList.add('active');
      const bg = item.getAttribute('data-bg');
      if (heroBanner && bg) {
        heroBanner.style.backgroundImage = `url('${bg}')`;
      }
    });
  });

  // Render Marketplace Cards
  function renderMarketplace() {
    const all = getAllGames();

    // Filter games
    const filtered = all.filter(g => {
      if (currentCategory !== 'all') {
        if (currentCategory === 'custom' && !g.isCustom) return false;
        if (currentCategory !== 'custom' && g.category !== currentCategory) return false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = g.title.toLowerCase().includes(q);
        const matchesGenre = g.genre.toLowerCase().includes(q);
        const matchesAuthor = g.author.toLowerCase().includes(q);
        if (!matchesTitle && !matchesGenre && !matchesAuthor) return false;
      }
      return true;
    });

    if (countBadge) countBadge.textContent = `${filtered.length} TITLES`;

    // Render Main Catalog Grid
    if (catalogGrid) {
      if (filtered.length === 0) {
        catalogGrid.innerHTML = `
          <div style="grid-column:1/-1;text-align:center;padding:50px 20px;color:var(--text-tertiary);">
            <p style="font-size:16px;font-weight:700;margin-bottom:6px;">No matching games found</p>
            <p style="font-size:13px;">Upload your own game using "+ Upload Game" or clear your search.</p>
          </div>
        `;
      } else {
        catalogGrid.innerHTML = filtered.map(game => createCardHtml(game)).join('');
      }
    }

    // Render User Uploads Section
    if (userUploadsGrid) {
      const userList = customGames;
      let html = '';

      // Upload Drop Card
      html += `
        <div class="hub-upload-drop-card" onclick="document.getElementById('upload-modal').classList.add('open')">
          <div class="hub-upload-icon-circle">&#43;</div>
          <h4 style="font-size:15px;font-weight:800;margin-bottom:6px;">Upload a New Game</h4>
          <p style="font-size:12px;color:var(--text-tertiary);max-width:200px;">HTML5 game files (.html) or playable web links supported.</p>
        </div>
      `;

      if (userList.length > 0) {
        html += userList.map(game => createCardHtml(game, true)).join('');
      }

      userUploadsGrid.innerHTML = html;
    }

    // Attach Click Handlers to all rendered cards
    document.querySelectorAll('.hub-card[data-id]').forEach(card => {
      card.addEventListener('click', (e) => {
        // If delete button was clicked
        if (e.target.closest('.btn-delete-game')) {
          e.stopPropagation();
          const id = card.getAttribute('data-id');
          deleteGame(id);
          return;
        }
        const id = card.getAttribute('data-id');
        const game = all.find(g => g.id === id);
        if (!game) return;

        launchGame(game);
      });
    });
  }

  function createCardHtml(game, isUserSection = false) {
    const isSpiderman = game.id === 'spiderman-legacy';
    return `
      <div class="hub-card" data-id="${game.id}">
        <div class="hub-card-thumb-wrap">
          <img class="hub-card-img" src="${game.thumb}" alt="${game.title}" loading="lazy" onerror="this.src='/src/assets/branding/master_cover.jpg'" style="${isSpiderman ? 'object-fit:contain;background:#0d0406;padding:12px;' : ''}" />
          <div class="hub-card-badges">
            <span class="hub-tag-sm ${game.badgeClass || 'badge-featured'}">${game.badge || 'Game'}</span>
          </div>
          <div class="hub-card-play-overlay">
            <div class="hub-circle-play">&#9658;</div>
          </div>
        </div>
        <div class="hub-card-content">
          <div class="hub-card-header">
            <h3 class="hub-card-name">${game.title}</h3>
            <span class="hub-card-score">&#9733; ${game.rating || '5.0'}</span>
          </div>
          <p class="hub-card-genre">${game.genre}</p>
          <div class="hub-card-bottom">
            <span class="hub-card-author">By ${game.author}</span>
            <div style="display:flex;align-items:center;gap:8px;">
              <span class="hub-card-status">${game.status || 'PLAY'}</span>
              ${game.isCustom ? `<button class="btn-delete-game" title="Delete Game" style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:14px;">&times;</button>` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function deleteGame(id) {
    if (!confirm('Are you sure you want to remove this uploaded game?')) return;
    customGames = customGames.filter(g => g.id !== id);
    saveCustomGames();
    renderMarketplace();
  }

  // Open Spider-Man Showcase Modal
  function openSpidermanModal() {
    if (spidermanModal) spidermanModal.classList.add('open');
  }

  function closeSpidermanModal() {
    if (spidermanModal) spidermanModal.classList.remove('open');
  }

  // Launch Game in In-Hub Theatre Player
  function launchGame(game) {
    if (!theatreModal || !theatreFrame) return;
    theatreTitle.textContent = game.title;
    theatreFrame.src = game.playUrl;
    theatreModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeTheatre() {
    if (!theatreModal || !theatreFrame) return;
    theatreFrame.src = 'about:blank';
    theatreModal.classList.remove('open');
    document.body.style.overflow = '';
  }

  // Filter Chips
  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentCategory = chip.getAttribute('data-cat') || 'all';
      renderMarketplace();
    });
  });

  // Search Input
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      renderMarketplace();
    });
  }

  // Keyboard shortcut Ctrl+K / Cmd+K
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      if (searchInput) searchInput.focus();
    }
  });

  // Theatre Controls
  if (theatreClose) theatreClose.addEventListener('click', closeTheatre);
  if (theatreReload) {
    theatreReload.addEventListener('click', () => {
      if (theatreFrame.src && theatreFrame.src !== 'about:blank') {
        const cur = theatreFrame.src;
        theatreFrame.src = 'about:blank';
        setTimeout(() => { theatreFrame.src = cur; }, 80);
      }
    });
  }
  if (theatreFullscreen) {
    theatreFullscreen.addEventListener('click', () => {
      const el = document.getElementById('theatre-window');
      if (el) {
        if (!document.fullscreenElement) {
          el.requestFullscreen().catch(err => console.warn(err));
        } else {
          document.exitFullscreen().catch(err => console.warn(err));
        }
      }
    });
  }

  if (theatreModal) {
    theatreModal.addEventListener('click', (e) => {
      if (e.target === theatreModal) closeTheatre();
    });
  }

  // Spider-Man Modal Controls
  if (spidermanClose) spidermanClose.addEventListener('click', closeSpidermanModal);
  if (spidermanModal) {
    spidermanModal.addEventListener('click', (e) => {
      if (e.target === spidermanModal) closeSpidermanModal();
    });
  }
  const btnSpidermanPlayWeb = document.getElementById('btn-spiderman-play-web');
  if (btnSpidermanPlayWeb) {
    btnSpidermanPlayWeb.addEventListener('click', () => {
      closeSpidermanModal();
      launchGame(OFFICIAL_GAMES[1]);
    });
  }

  // Upload Modal Open/Close
  if (uploadBtn) {
    uploadBtn.addEventListener('click', () => {
      if (uploadModal) uploadModal.classList.add('open');
    });
  }
  if (uploadClose) {
    uploadClose.addEventListener('click', () => {
      if (uploadModal) uploadModal.classList.remove('open');
    });
  }
  if (uploadModal) {
    uploadModal.addEventListener('click', (e) => {
      if (e.target === uploadModal) uploadModal.classList.remove('open');
    });
  }

  function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  // Handle Game Upload Form Submit
  if (uploadForm) {
    uploadForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const title = document.getElementById('game-title').value.trim();
      const genre = document.getElementById('game-genre').value.trim();
      const category = document.getElementById('game-category').value;
      const author = document.getElementById('game-author').value.trim() || 'Khalid Abdullah';
      const desc = document.getElementById('game-desc').value.trim();
      let playUrl = document.getElementById('game-url').value.trim();
      let thumbUrl = document.getElementById('game-thumb-preset').value;

      // Custom cover image upload
      if (coverFileInput && coverFileInput.files && coverFileInput.files[0]) {
        try {
          thumbUrl = await readFileAsDataURL(coverFileInput.files[0]);
        } catch (err) {
          console.warn('Cover read failed, using preset', err);
        }
      }

      // Uploaded HTML5 game file
      if (gameFileInput && gameFileInput.files && gameFileInput.files[0]) {
        const file = gameFileInput.files[0];
        try {
          const htmlContent = await readFileAsText(file);
          const blob = new Blob([htmlContent], { type: 'text/html' });
          playUrl = URL.createObjectURL(blob);
        } catch (err) {
          alert('Could not process the uploaded game file: ' + err.message);
          return;
        }
      }

      if (!playUrl) {
        alert('Please provide either an HTML5 game file or a playable Web URL!');
        return;
      }

      const newGame = {
        id: 'user-game-' + Date.now(),
        title,
        genre,
        category,
        author,
        rating: '5.0',
        players: '1',
        badge: 'Community',
        badgeClass: 'badge-free',
        status: 'FREE TO PLAY',
        desc: desc || 'Custom game hosted on Digital Game Marketplace 2.0.',
        thumb: thumbUrl,
        playUrl: playUrl,
        isCustom: true
      };

      customGames.unshift(newGame);
      saveCustomGames();
      renderMarketplace();

      uploadForm.reset();
      if (uploadModal) uploadModal.classList.remove('open');
      alert(`"${title}" has been uploaded successfully! You can now play it in the marketplace.`);
    });
  }

  // Hero Play Buttons
  const heroInstantPlay = document.getElementById('hero-instant-play');
  if (heroInstantPlay) {
    heroInstantPlay.addEventListener('click', () => {
      launchGame(OFFICIAL_GAMES[0]);
    });
  }

  // Export Catalog JSON
  const exportBtn = document.getElementById('btn-export-catalog');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(getAllGames(), null, 2));
      const a = document.createElement('a');
      a.setAttribute("href", dataStr);
      a.setAttribute("download", "devils_door_marketplace_catalog.json");
      document.body.appendChild(a);
      a.click();
      a.remove();
    });
  }

  // Initial Load
  loadCustomGames();
  renderMarketplace();

  window.DDMarketplace = {
    getAllGames,
    launchGame,
    openSpidermanModal,
    renderMarketplace
  };
})();
