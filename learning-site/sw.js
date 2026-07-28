/* Service worker — HTTPS / localhost only (never file://). Cache version v5. */
const CACHE = 'pw-learn-v6';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './manifest.webmanifest',
  './vendor/minisearch.js',
  './vendor/ts-fsrs.js',
  './search-index.js',
  './storage.js',
  './quiz-data.js',
  './interview-data.js',
  './interview-essentials-data.js',
  './playground-data.js',
  './miniapps-data.js',
  './section-mcq-data.js',
  './xpath-data.js',
  './xpath-widgets.js',
  './mistakes-data.js',
  './skills-practice-data.js',
  './skills-practice-widgets.js',
  './assessments-data.js',
  './practice-widgets.js',
  './hub-widgets.js',
  './bank-demo.js',
  './fsrs-app.js',
  './gap-pages-data.js',
  './gap-practice-data.js',
  './gap-practice.js',
  './stuck-data.js',
  './cases-data.js',
  './framework-data.js',
  './framework-diagrams.js',
  './framework-academy.js',
  './interviewer-data.js',
  './interviewer-diagrams.js',
  './interviewer-mode.js',
  './skills-data.js',
  './topics-data.js',
  './mock-exam-pool.js',
  './readiness-engine.js',
  './readiness-ui.js',
  './skills-modules.js',
  './mock-exam.js',
  './study-planner.js',
  './personal-knowledge.js',
  './gamification.js',
  './reading-times.js',
  './app.js',
  './ui-2026.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ).then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(req).then((cached) =>
      cached ||
      fetch(req).then((res) => {
        if (res.ok && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      }).catch(() => cached),
    ),
  );
});
