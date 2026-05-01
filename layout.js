// layout.js - shared layout builder
function getTopbarHTML() {
  return `
  <div class="topbar" id="topbar">
    <button class="topbar-toggle" id="sidebarToggle">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
      </svg>
    </button>

    <div class="topbar-search">
      <input type="text" placeholder="البحث في النظام..." id="globalSearch">
      <span class="search-icon">🔍</span>
    </div>

    <div class="topbar-actions">
      <span class="topbar-date" id="currentDateTime"></span>

      <select id="clinicSelector" style="border:1.5px solid var(--border);border-radius:50px;padding:5px 12px;font-size:0.78rem;background:var(--surface-2);color:var(--text);cursor:pointer;font-family:inherit;outline:none;">
        <option>جميع الفروع</option>
      </select>

      <button class="topbar-btn" onclick="toggleTheme()" title="تبديل المظهر">🌙</button>

      <button class="topbar-btn" onclick="window.location.href='notifications.html'" title="الإشعارات" style="position:relative;">
        🔔
        <span class="badge"></span>
      </button>
    </div>
  </div>
  <div class="sidebar-overlay" id="sidebarOverlay"></div>
  `;
}

function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme');
  html.setAttribute('data-theme', current === 'dark' ? 'light' : 'dark');
}

window.getTopbarHTML = getTopbarHTML;
window.toggleTheme = toggleTheme;
