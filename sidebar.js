// sidebar.js - Generates the sidebar HTML
function buildSidebar(activePage) {
  const user = Auth.requireAuth();
  if (!user) return;

  const isDoctor = user.role === 'doctor';

  const navItems = [
    { page: 'dashboard.html', icon: '⊞', label: 'الرئيسية' },
    { page: 'appointments.html', icon: '📅', label: 'المواعيد', badge: 0 },
    { page: 'patients.html', icon: '👥', label: 'المرضى' },
    { page: 'sessions.html', icon: '⚕', label: 'الجلسات' },
    { page: 'reports.html', icon: '📊', label: 'التقارير', doctorOnly: true },
    { page: 'finance.html', icon: '💰', label: 'المالية', doctorOnly: true },
    { page: 'staff.html', icon: '👨‍💼', label: 'الموظفون', doctorOnly: true },
    { page: 'settings.html', icon: '⚙', label: 'الإعدادات' },
  ];

  const todayAppts = Appointments.getToday(user.id);
  const pendingCount = todayAppts.filter(a => a.status === 'pending').length;

  const navHtml = navItems
    .filter(item => !item.doctorOnly || isDoctor)
    .map(item => {
      const badge = item.page === 'appointments.html' && pendingCount > 0
        ? `<span class="nav-badge">${pendingCount}</span>` : '';
      const active = activePage === item.page ? 'active' : '';
      return `<a class="nav-item ${active}" data-page="${item.page}" href="${item.page}">
        <span class="nav-icon">${item.icon}</span>
        <span>${item.label}</span>
        ${badge}
      </a>`;
    }).join('');

  const clinics = DB.get('clinics', []);
  const clinicOptions = clinics.map(c => `<option value="${c.id}" ${c.id === user.clinicId ? 'selected' : ''}>${c.name}</option>`).join('');

  const sidebarEl = document.getElementById('sidebar');
  if (sidebarEl) {
    sidebarEl.innerHTML = `
      <div class="sidebar-logo">
        <div class="logo-icon">
          <svg viewBox="0 0 24 24"><path d="M13 8h-2v3H8v2h3v3h2v-3h3v-2h-3z"/><path d="M12 2L2 7v10l10 5 10-5V7L12 2z" fill-opacity="0.4"/></svg>
        </div>
        <div class="sidebar-logo-text">
          <span class="brand">عيادتي CRM</span>
          <span class="brand-sub">نظام إدارة العيادات</span>
        </div>
      </div>

      <div class="sidebar-user" style="cursor:pointer" onclick="window.location.href='settings.html'">
        <div class="avatar sidebar-user-avatar">${Utils.getInitials(user.name)}</div>
        <div class="sidebar-user-info">
          <div class="user-name sidebar-user-name">${Utils.escapeHtml(user.name)}</div>
          <div class="user-role sidebar-user-role">${user.role === 'doctor' ? 'طبيب' : 'موظف'}</div>
        </div>
        <div class="status-dot"></div>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-section">
          <div class="nav-section-title">القائمة الرئيسية</div>
          ${navHtml}
        </div>
      </nav>

      <div class="sidebar-bottom">
        <button class="nav-item w-full" id="logoutBtn" style="border:none;background:none;font-family:inherit;text-align:right;direction:rtl;">
          <span class="nav-icon">🚪</span>
          <span>تسجيل الخروج</span>
        </button>
      </div>
    `;
  }

  // Topbar user name
  const topbarUser = document.getElementById('topbarUserName');
  if (topbarUser) topbarUser.textContent = user.name;

  // Topbar clinic selector
  const clinicSel = document.getElementById('clinicSelector');
  if (clinicSel) clinicSel.innerHTML = clinicOptions;

  initSidebar();
  return user;
}

window.buildSidebar = buildSidebar;
