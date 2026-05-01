// ============================================
//  نظام إدارة العيادات المتكامل - app.js
//  Clinic CRM - Main Application Logic
// ============================================

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

// ============================================
//  DATA STORE (localStorage)
// ============================================
const DB = {
  get: (key, def = null) => {
    try {
      const v = localStorage.getItem('clinic_' + key);
      return v ? JSON.parse(v) : def;
    } catch { return def; }
  },
  set: (key, val) => {
    try { localStorage.setItem('clinic_' + key, JSON.stringify(val)); return true; }
    catch { return false; }
  },
  remove: (key) => { localStorage.removeItem('clinic_' + key); }
};

// ============================================
//  INITIAL DATA SEEDING
// ============================================
function seedData() {
  // Clinics / Branches
  if (!DB.get('clinics')) {
    DB.set('clinics', [
      { id: 1, name: 'الفرع الرئيسي', address: 'شارع التحرير، القاهرة', phone: '0223456789', active: true },
      { id: 2, name: 'فرع المعادي', address: 'شارع 9، المعادي', phone: '0225678901', active: true }
    ]);
  }

  // Default Doctors
  if (!DB.get('users')) {
    DB.set('users', [
      {
        id: 1, role: 'doctor', username: 'admin', password: 'admin1234',
        name: 'د. أحمد محمد السيد', email: 'doctor@clinic.com',
        phone: '01001234567', specialty: 'طب عام', clinicId: 1,
        avatar: '', status: 'active', createdAt: new Date().toISOString()
      },
      {
        id: 2, role: 'staff', username: 'admin2', password: 'admin21234',
        name: 'سارة علي أحمد', email: 'staff@clinic.com',
        phone: '01019876543', specialty: 'سكرتيرة', clinicId: 1,
        createdBy: 1, avatar: '', status: 'active', createdAt: new Date().toISOString()
      }
    ]);
  }

  // Sample Patients
  if (!DB.get('patients')) {
    DB.set('patients', [
      {
        id: 1, name: 'محمد حسن علي', phone: '01012345678', age: 35, gender: 'ذكر',
        address: 'القاهرة', bloodType: 'A+', doctorId: 1, clinicId: 1,
        notes: 'مريض منتظم', createdAt: '2025-06-01T10:00:00Z'
      },
      {
        id: 2, name: 'فاطمة أحمد محمود', phone: '01098765432', age: 28, gender: 'أنثى',
        address: 'الجيزة', bloodType: 'O+', doctorId: 1, clinicId: 1,
        notes: '', createdAt: '2025-07-15T09:30:00Z'
      },
      {
        id: 3, name: 'خالد إبراهيم سعد', phone: '01155544433', age: 50, gender: 'ذكر',
        address: 'الإسكندرية', bloodType: 'B-', doctorId: 1, clinicId: 1,
        notes: 'يعاني من ضغط الدم', createdAt: '2025-08-10T11:00:00Z'
      }
    ]);
  }

  // Sample Appointments
  if (!DB.get('appointments')) {
    const today = new Date();
    DB.set('appointments', [
      {
        id: 1, patientId: 1, doctorId: 1, clinicId: 1,
        date: today.toISOString().split('T')[0],
        time: '09:00', duration: 30,
        type: 'كشف', status: 'confirmed', notes: '',
        createdAt: new Date().toISOString()
      },
      {
        id: 2, patientId: 2, doctorId: 1, clinicId: 1,
        date: today.toISOString().split('T')[0],
        time: '10:00', duration: 30,
        type: 'متابعة', status: 'pending', notes: '',
        createdAt: new Date().toISOString()
      }
    ]);
  }

  // Sample Sessions
  if (!DB.get('sessions')) {
    DB.set('sessions', [
      {
        id: 1, patientId: 1, doctorId: 1, clinicId: 1, appointmentId: 1,
        date: '2025-10-01', diagnosis: 'برد وكحة', prescription: 'بنادول، أموكسيسيلين',
        notes: 'المريض بحاجة إلى راحة', status: 'completed', fee: 150,
        paid: true, createdAt: '2025-10-01T10:00:00Z'
      }
    ]);
  }

  // Settings
  if (!DB.get('settings')) {
    DB.set('settings', {
      clinicName: 'عيادة الرعاية الشاملة',
      doctorName: 'د. أحمد محمد السيد',
      phone: '0223456789',
      address: 'القاهرة، مصر',
      workStart: '08:00',
      workEnd: '20:00',
      sessionDuration: 30,
      currency: 'ج.م',
      language: 'ar',
      notifyAppt: true,
      notifySMS: false,
      theme: 'light'
    });
  }
}
seedData();

// ============================================
//  AUTH
// ============================================
const Auth = {
  login(username, password, role) {
    const users = DB.get('users', []);
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) return { ok: false, msg: 'اسم المستخدم أو كلمة المرور غير صحيحة' };
    if (role === 'doctor' && user.role !== 'doctor') return { ok: false, msg: 'هذا الحساب ليس حساب طبيب' };
    if (role === 'staff' && user.role !== 'staff') return { ok: false, msg: 'هذا الحساب ليس حساب موظف' };
    DB.set('session', { userId: user.id, role: user.role, loginTime: new Date().toISOString() });
    return { ok: true, user };
  },
  logout() {
    DB.remove('session');
    window.location.href = 'login.html';
  },
  getSession() { return DB.get('session'); },
  getCurrentUser() {
    const sess = DB.get('session');
    if (!sess) return null;
    const users = DB.get('users', []);
    return users.find(u => u.id === sess.userId) || null;
  },
  requireAuth() {
    const sess = DB.get('session');
    if (!sess) { window.location.href = 'login.html'; return null; }
    return Auth.getCurrentUser();
  }
};

// ============================================
//  UTILITIES
// ============================================
const Utils = {
  generateId(arr) {
    if (!arr || arr.length === 0) return 1;
    return Math.max(...arr.map(i => i.id || 0)) + 1;
  },
  formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
  },
  formatDateShort(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('ar-EG', { year: 'numeric', month: '2-digit', day: '2-digit' });
  },
  formatTime(timeStr) {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'م' : 'ص';
    const h12 = hour % 12 || 12;
    return `${h12}:${m} ${ampm}`;
  },
  todayStr() { return new Date().toISOString().split('T')[0]; },
  getInitials(name) {
    if (!name) return '؟';
    const words = name.trim().split(' ');
    if (words.length >= 2) return words[0][0] + words[1][0];
    return words[0][0] || '؟';
  },
  escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
};

// ============================================
//  TOAST
// ============================================
function showToast(msg, type = 'success', title = '') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = { success: '✓', error: '✗', warning: '⚠', info: 'ℹ' };
  const titles = { success: 'تمت العملية', error: 'خطأ', warning: 'تحذير', info: 'معلومة' };
  const toast = document.createElement('div');
  toast.className = `toast ${type !== 'success' ? type : ''}`;
  toast.innerHTML = `
    <div class="toast-icon">${icons[type] || icons.success}</div>
    <div class="toast-body">
      <div class="toast-title">${title || titles[type]}</div>
      <div class="toast-msg">${msg}</div>
    </div>
    <button onclick="this.parentElement.remove()" style="background:none;border:none;cursor:pointer;color:var(--text-muted);font-size:1rem;padding:0 0 0 4px;">×</button>
  `;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(-20px)'; setTimeout(() => toast.remove(), 300); }, 3500);
}

// ============================================
//  MODAL
// ============================================
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('open');
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('open');
}

// ============================================
//  SIDEBAR ACTIVE STATE
// ============================================
function initSidebar() {
  const user = Auth.getCurrentUser();
  if (!user) return;

  // Set user info in sidebar
  const nameEl = document.querySelector('.sidebar-user-name');
  const roleEl = document.querySelector('.sidebar-user-role');
  const avatarEl = document.querySelector('.sidebar-user-avatar');
  if (nameEl) nameEl.textContent = user.name;
  if (roleEl) roleEl.textContent = user.role === 'doctor' ? 'طبيب' : 'موظف';
  if (avatarEl) avatarEl.textContent = Utils.getInitials(user.name);

  // Active nav link
  const currentPage = location.pathname.split('/').pop() || 'dashboard.html';
  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    if (item.dataset.page === currentPage) item.classList.add('active');
    item.addEventListener('click', () => {
      window.location.href = item.dataset.page;
    });
  });

  // Logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', () => {
    if (confirm('هل تريد تسجيل الخروج؟')) Auth.logout();
  });

  // Mobile toggle
  const toggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (toggle && sidebar) {
    toggle.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
      if (overlay) overlay.style.display = sidebar.classList.contains('mobile-open') ? 'block' : 'none';
    });
  }
  if (overlay) {
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('mobile-open');
      overlay.style.display = 'none';
    });
  }
}

// ============================================
//  DATE/TIME DISPLAY
// ============================================
function updateDateTime() {
  const el = document.getElementById('currentDateTime');
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleDateString('ar-EG', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
}
updateDateTime();
setInterval(updateDateTime, 60000);

// ============================================
//  PATIENTS API
// ============================================
const Patients = {
  getAll(doctorId) {
    const all = DB.get('patients', []);
    return doctorId ? all.filter(p => p.doctorId === doctorId) : all;
  },
  get(id) { return DB.get('patients', []).find(p => p.id === id) || null; },
  add(data) {
    const patients = DB.get('patients', []);
    const patient = { id: Utils.generateId(patients), ...data, createdAt: new Date().toISOString() };
    patients.push(patient);
    DB.set('patients', patients);
    return patient;
  },
  update(id, data) {
    const patients = DB.get('patients', []);
    const idx = patients.findIndex(p => p.id === id);
    if (idx === -1) return false;
    patients[idx] = { ...patients[idx], ...data, updatedAt: new Date().toISOString() };
    DB.set('patients', patients);
    return true;
  },
  delete(id) {
    const patients = DB.get('patients', []);
    DB.set('patients', patients.filter(p => p.id !== id));
    return true;
  }
};

// ============================================
//  APPOINTMENTS API
// ============================================
const Appointments = {
  getAll(doctorId) {
    const all = DB.get('appointments', []);
    return doctorId ? all.filter(a => a.doctorId === doctorId) : all;
  },
  getToday(doctorId) {
    const today = Utils.todayStr();
    return this.getAll(doctorId).filter(a => a.date === today);
  },
  get(id) { return DB.get('appointments', []).find(a => a.id === id) || null; },
  add(data) {
    const appts = DB.get('appointments', []);
    const appt = { id: Utils.generateId(appts), ...data, createdAt: new Date().toISOString() };
    appts.push(appt);
    DB.set('appointments', appts);
    return appt;
  },
  update(id, data) {
    const appts = DB.get('appointments', []);
    const idx = appts.findIndex(a => a.id === id);
    if (idx === -1) return false;
    appts[idx] = { ...appts[idx], ...data };
    DB.set('appointments', appts);
    return true;
  },
  delete(id) {
    DB.set('appointments', DB.get('appointments', []).filter(a => a.id !== id));
    return true;
  }
};

// ============================================
//  SESSIONS API
// ============================================
const Sessions = {
  getAll(doctorId) {
    const all = DB.get('sessions', []);
    return doctorId ? all.filter(s => s.doctorId === doctorId) : all;
  },
  get(id) { return DB.get('sessions', []).find(s => s.id === id) || null; },
  add(data) {
    const sessions = DB.get('sessions', []);
    const session = { id: Utils.generateId(sessions), ...data, createdAt: new Date().toISOString() };
    sessions.push(session);
    DB.set('sessions', sessions);
    return session;
  },
  update(id, data) {
    const sessions = DB.get('sessions', []);
    const idx = sessions.findIndex(s => s.id === id);
    if (idx === -1) return false;
    sessions[idx] = { ...sessions[idx], ...data };
    DB.set('sessions', sessions);
    return true;
  },
  delete(id) {
    DB.set('sessions', DB.get('sessions', []).filter(s => s.id !== id));
    return true;
  }
};

// ============================================
//  STAFF API
// ============================================
const Staff = {
  getByDoctor(doctorId) {
    return DB.get('users', []).filter(u => u.role === 'staff' && u.createdBy === doctorId);
  },
  add(data) {
    const users = DB.get('users', []);
    if (users.find(u => u.username === data.username)) return { ok: false, msg: 'اسم المستخدم مستخدم بالفعل' };
    const user = { id: Utils.generateId(users), role: 'staff', status: 'active', ...data, createdAt: new Date().toISOString() };
    users.push(user);
    DB.set('users', users);
    return { ok: true, user };
  },
  update(id, data) {
    const users = DB.get('users', []);
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) return false;
    users[idx] = { ...users[idx], ...data };
    DB.set('users', users);
    return true;
  },
  delete(id) {
    DB.set('users', DB.get('users', []).filter(u => u.id !== id));
    return true;
  }
};

// ============================================
//  REPORTS/STATS
// ============================================
const Reports = {
  getSummary(doctorId) {
    const patients = Patients.getAll(doctorId);
    const appointments = Appointments.getAll(doctorId);
    const sessions = Sessions.getAll(doctorId);
    const todayAppts = Appointments.getToday(doctorId);
    const totalRevenue = sessions.filter(s => s.paid).reduce((sum, s) => sum + (s.fee || 0), 0);
    const pendingRevenue = sessions.filter(s => !s.paid).reduce((sum, s) => sum + (s.fee || 0), 0);
    return { patients: patients.length, appointments: appointments.length, sessions: sessions.length, todayAppts: todayAppts.length, totalRevenue, pendingRevenue };
  }
};

// Expose globally
window.DB = DB;
window.Auth = Auth;
window.Utils = Utils;
window.Patients = Patients;
window.Appointments = Appointments;
window.Sessions = Sessions;
window.Staff = Staff;
window.Reports = Reports;
window.showToast = showToast;
window.openModal = openModal;
window.closeModal = closeModal;
window.initSidebar = initSidebar;
