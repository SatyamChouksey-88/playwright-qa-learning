/** Gamification (GM-*) — quality-gated streaks, badges, certificates. No leaderboards. */
(function () {
  const STREAK_KEY = 'pqa.streak.v1';
  const BADGES_KEY = 'pqa.badges.v1';

  function todayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  }

  function loadStreak() {
    try {
      return JSON.parse(localStorage.getItem(STREAK_KEY) || '{}');
    } catch {
      return { count: 0, lastDay: '', freezeUsedWeek: '' };
    }
  }

  function saveStreak(s) {
    localStorage.setItem(STREAK_KEY, JSON.stringify(s));
  }

  function loadBadges() {
    try {
      return JSON.parse(localStorage.getItem(BADGES_KEY) || '[]');
    } catch {
      return [];
    }
  }

  function saveBadges(b) {
    localStorage.setItem(BADGES_KEY, JSON.stringify(b));
  }

  function unlockBadge(id) {
    const badges = loadBadges();
    if (badges.includes(id)) return;
    badges.push(id);
    saveBadges(badges);
    window.dispatchEvent(new CustomEvent('pqa:badge-earned', { detail: { id } }));
  }

  function onQualityAction(kind) {
    const s = loadStreak();
    const today = todayKey();
    if (s.lastDay === today) return;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yKey = `${yesterday.getFullYear()}-${yesterday.getMonth() + 1}-${yesterday.getDate()}`;
    const week = `${new Date().getFullYear()}-W${Math.ceil((new Date().getDate()) / 7)}`;
    if (s.lastDay === yKey) s.count += 1;
    else if (s.freezeUsedWeek !== week && s.lastDay && s.lastDay !== yKey) {
      s.freezeUsedWeek = week;
      s.count += 1;
    } else s.count = 1;
    s.lastDay = today;
    saveStreak(s);
    if (s.count >= 7) unlockBadge('streak-7');
    if (s.count >= 30) unlockBadge('streak-30');
    void kind;
  }

  function downloadCertificate(name, title) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="560" role="img">
      <title>Certificate of completion</title>
      <desc>Awarded to ${name} for ${title}</desc>
      <rect width="800" height="560" fill="#0f1419"/>
      <rect x="40" y="40" width="720" height="480" fill="none" stroke="#3b82f6" stroke-width="4"/>
      <text x="400" y="120" text-anchor="middle" fill="#e6edf3" font-size="32" font-family="system-ui">Certificate of Completion</text>
      <text x="400" y="220" text-anchor="middle" fill="#93c5fd" font-size="24" font-family="system-ui">${title}</text>
      <text x="400" y="300" text-anchor="middle" fill="#e6edf3" font-size="28" font-family="system-ui">${name}</text>
      <text x="400" y="380" text-anchor="middle" fill="#94a3b8" font-size="14" font-family="system-ui">Playwright QA Learning · local achievement</text>
    </svg>`;
    const img = new Image();
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 560;
    const ctx = canvas.getContext('2d');
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      const a = document.createElement('a');
      a.download = `certificate-${Date.now()}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = url;
  }

  function renderBadges(root) {
    const badges = loadBadges();
    const labels = {
      'streak-7': '7-day streak',
      'streak-30': '30-day streak',
      'mx-90': 'Mock exam ≥90%',
      'sk-complete': 'All SK tracks',
    };
    root.innerHTML = badges.length
      ? badges.map((b) => `<span class="pill gm-badge">${labels[b] || b}</span>`).join(' ')
      : '<p class="muted">Earn badges through meaningful study actions.</p>';
  }

  window.Gamification = { onQualityAction, unlockBadge, downloadCertificate, loadStreak, loadBadges, renderBadges };
})();
