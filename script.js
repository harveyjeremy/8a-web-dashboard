(function () {
  'use strict';

  var CONFIG = window.CONFIG, SCHEDULE = window.SCHEDULE;
  var ASSESSMENTS = window.ASSESSMENTS.slice().sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });
  var BY_DATE = {};
  ASSESSMENTS.forEach(function (a) { (BY_DATE[a.date] = BY_DATE[a.date] || []).push(a); });

  var TZ = 'Asia/Jakarta';
  var DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  var DAYS_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  var MONTHS_ID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  /* ---------- util waktu (selalu Asia/Jakarta) ---------- */
  var pad = function (n) { return String(n).padStart(2, '0'); };
  var partsFmt = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
  var longFmt = new Intl.DateTimeFormat('id-ID', { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  var shortFmt = new Intl.DateTimeFormat('id-ID', { timeZone: 'UTC', weekday: 'short', day: 'numeric', month: 'short' });

  function jakartaParts(d) {
    var p = {};
    partsFmt.formatToParts(d || new Date()).forEach(function (x) { p[x.type] = x.value; });
    var h = +p.hour, m = +p.minute, s = +p.second;
    return { hour: h, minute: m, second: s, dateKey: p.year + '-' + p.month + '-' + p.day, seconds: h * 3600 + m * 60 + s };
  }
  function utc(key) { var a = key.split('-').map(Number); return Date.UTC(a[0], a[1] - 1, a[2]); }
  function weekdayIndex(key) { return new Date(utc(key)).getUTCDay(); }
  function daysBetween(a, b) { return Math.round((utc(b) - utc(a)) / 86400000); }
  function addDays(key, n) { var d = new Date(utc(key) + n * 86400000); return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()); }
  function toSeconds(hhmm) { var a = hhmm.split(':').map(Number); return a[0] * 3600 + a[1] * 60; }
  function formatLong(key) { return longFmt.format(new Date(utc(key))); }
  function formatShort(key) { return shortFmt.format(new Date(utc(key))); }

  /* ---------- util DOM ---------- */
  var $ = function (id) { return document.getElementById(id); };
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function typeClass(t) { return 'dot-' + String(t).toLowerCase(); }

  /* ---------- tema ---------- */
  var ICON_SUN = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  var ICON_MOON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';

  function paintThemeButton() {
    var dark = document.documentElement.dataset.theme === 'dark';
    var b = $('themeToggle');
    b.innerHTML = dark ? ICON_SUN : ICON_MOON;
    b.setAttribute('aria-label', dark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap');
  }
  $('themeToggle').addEventListener('click', function () {
    var next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
    paintThemeButton();
  });
  paintThemeButton();

  /* ---------- header ---------- */
  $('className').textContent = CONFIG.className;
  function greeting(h) { return h < 12 ? 'Good Morning' : h < 18 ? 'Good Afternoon' : 'Good Evening'; }
  function renderHeader(p) {
    $('clock').textContent = pad(p.hour) + ':' + pad(p.minute) + ':' + pad(p.second);
    $('greeting').textContent = greeting(p.hour);
    $('date').textContent = formatLong(p.dateKey);
  }

  /* ---------- countdown bel ---------- */
  function eventsFor(key) {
    if (SCHEDULE.holidays.some(function (h) { return h.date === key; })) return [];
    var tpl = SCHEDULE.week[DAY_KEYS[weekdayIndex(key)]];
    return (SCHEDULE.templates[tpl] || []).map(function (e) {
      return { label: e.label, time: e.time, sec: toSeconds(e.time) };
    }).sort(function (a, b) { return a.sec - b.sec; });
  }
  function nextSchoolDay(key) {
    for (var i = 1; i <= 14; i++) {
      var k = addDays(key, i), ev = eventsFor(k);
      if (ev.length) return { first: ev[0], name: i === 1 ? 'Besok' : DAYS_ID[weekdayIndex(k)] };
    }
    return null;
  }
  function fmtDuration(t) { return [Math.floor(t / 3600), Math.floor((t % 3600) / 60), t % 60].map(pad).join(':'); }

  function renderCountdown(p) {
    var box = $('countdown');
    var events = eventsFor(p.dateKey);
    var holiday = SCHEDULE.holidays.filter(function (h) { return h.date === p.dateKey; })[0];
    var next = events.filter(function (e) { return e.sec > p.seconds; })[0];
    var nodes = [];

    if (next) {
      nodes.push(el('p', 'cd-kicker', 'Berikutnya'));
      nodes.push(el('h2', 'cd-title', next.label));
      nodes.push(el('div', 'cd-time', fmtDuration(next.sec - p.seconds)));
      nodes.push(el('p', 'cd-sub', 'pukul ' + next.time + ' WIB'));
    } else {
      nodes.push(el('p', 'cd-kicker', events.length ? 'Selesai' : 'Hari ini'));
      nodes.push(el('h2', 'cd-title', events.length ? 'Kegiatan sekolah hari ini telah selesai.' : holiday ? 'Libur: ' + holiday.name : 'Tidak ada kegiatan sekolah hari ini.'));
      var up = nextSchoolDay(p.dateKey);
      if (up) nodes.push(el('p', 'cd-sub', up.name + ' bel masuk pukul ' + up.first.time + ' WIB'));
    }

    if (events.length) {
      var ol = el('ol', 'cd-timeline');
      events.forEach(function (e) {
        var state = e.sec <= p.seconds ? 'past' : e === next ? 'next' : 'later';
        var li = el('li', 'cd-item is-' + state);
        li.appendChild(el('span', 'cd-dot'));
        li.appendChild(el('span', 'cd-item-time', e.time));
        li.appendChild(el('span', 'cd-item-label', e.label));
        ol.appendChild(li);
      });
      nodes.push(ol);
    }
    box.replaceChildren.apply(box, nodes);
  }

  /* ---------- pintasan ---------- */
  var ICONS = {
    google: '<svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/></svg>',
    drive: '<svg viewBox="0 0 87.3 78" aria-hidden="true"><path fill="#0066da" d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H0c0 1.55.4 3.1 1.2 4.5z"/><path fill="#00ac47" d="M43.65 25L29.9 1.2c-1.35.8-2.5 1.9-3.3 3.3L1.2 48.5c-.8 1.4-1.2 2.95-1.2 4.5h27.5z"/><path fill="#ea4335" d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5H59.8l5.85 11.5z"/><path fill="#00832d" d="M43.65 25L57.4 1.2C56.05.4 54.5 0 52.9 0H34.4c-1.6 0-3.15.45-4.5 1.2z"/><path fill="#2684fc" d="M59.8 53H27.5L13.75 76.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z"/><path fill="#ffba00" d="M73.4 26.5L60.7 4.5c-.8-1.4-1.95-2.5-3.3-3.3L43.65 25 59.8 53h27.45c0-1.55-.4-3.1-1.2-4.5z"/></svg>',
    schedule: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4M8 14h3M13 14h3M8 17.2h3"/></svg>',
    gmail: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3" stroke="#5f6368"/><path d="M3.8 7.2L12 13.2l8.2-6" stroke="#ea4335"/></svg>'
  };
  var SHORTCUTS = [
    { icon: 'google',   name: 'Google Search', url: 'https://www.google.com' },
    { icon: 'drive',    name: 'Google Drive',  url: 'https://drive.google.com' },
    { icon: 'schedule', name: 'Jadwal Kelas',  url: CONFIG.scheduleDocUrl },
    { icon: 'gmail',    name: 'Gmail',         url: CONFIG.classEmail ? 'https://mail.google.com/mail/u/' + CONFIG.classEmail + '/' : 'https://mail.google.com' }
  ];
  SHORTCUTS.forEach(function (s) {
    var a = el('a', 'shortcut');
    a.href = s.url;
    if (CONFIG.openInNewTab) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
    var ic = el('span', 'shortcut-icon');
    ic.innerHTML = ICONS[s.icon];
    a.appendChild(ic);
    a.appendChild(el('span', null, s.name));
    $('shortcutGrid').appendChild(a);
  });

  /* ---------- kalender asesmen ---------- */
  var today = jakartaParts().dateKey;
  var selected = today;
  var view = { y: +today.slice(0, 4), m: +today.slice(5, 7) };

  function selectDate(key) {
    selected = key;
    view = { y: +key.slice(0, 4), m: +key.slice(5, 7) };
    renderCalendar(); renderDetails();
  }

  function renderCalendar() {
    var y = view.y, m = view.m;
    $('calTitle').textContent = MONTHS_ID[m - 1] + ' ' + y;
    var offset = (weekdayIndex(y + '-' + pad(m) + '-01') + 6) % 7; // minggu mulai Senin
    var total = new Date(Date.UTC(y, m, 0)).getUTCDate();
    var grid = $('calGrid');
    grid.replaceChildren();
    for (var i = 0; i < offset; i++) grid.appendChild(el('span'));
    for (var d = 1; d <= total; d++) {
      var key = y + '-' + pad(m) + '-' + pad(d);
      var items = BY_DATE[key] || [];
      var b = el('button', 'day' + (key === today ? ' is-today' : '') + (key === selected ? ' is-selected' : ''));
      b.type = 'button';
      b.dataset.date = key;
      b.setAttribute('aria-pressed', key === selected ? 'true' : 'false');
      b.setAttribute('aria-label', d + ' ' + MONTHS_ID[m - 1] + (items.length ? ', ' + items.length + ' asesmen' : ''));
      b.appendChild(el('span', null, String(d)));
      var dots = el('span', 'dots'), seen = {};
      items.forEach(function (a) {
        var t = String(a.type).toLowerCase();
        if (seen[t]) return; seen[t] = true;
        dots.appendChild(el('i', 'dot ' + typeClass(a.type)));
      });
      b.appendChild(dots);
      grid.appendChild(b);
    }
  }
  $('calGrid').addEventListener('click', function (e) {
    var b = e.target.closest('.day');
    if (b) { selected = b.dataset.date; renderCalendar(); renderDetails(); }
  });
  function shiftMonth(delta) {
    var n = view.m + delta;
    view = n < 1 ? { y: view.y - 1, m: 12 } : n > 12 ? { y: view.y + 1, m: 1 } : { y: view.y, m: n };
    renderCalendar();
  }
  $('calPrev').addEventListener('click', function () { shiftMonth(-1); });
  $('calNext').addEventListener('click', function () { shiftMonth(1); });
  $('calToday').addEventListener('click', function () { selectDate(jakartaParts().dateKey); });

  function badge(text, muted) { return el('span', 'badge' + (muted ? ' badge-muted' : ''), text); }

  function renderDetails() {
    $('detailDate').textContent = formatLong(selected);
    var body = $('detailBody'), items = BY_DATE[selected] || [];
    if (!items.length) { body.replaceChildren(el('p', 'empty', 'Tidak ada asesmen pada tanggal ini.')); return; }
    var ul = el('ul', 'list');
    items.forEach(function (a) {
      var li = el('li', 'row');
      li.appendChild(el('span', 'dot ' + typeClass(a.type)));
      var div = el('div');
      div.appendChild(el('strong', null, a.subject));
      div.appendChild(badge(a.type));
      if (a.placeholder) div.appendChild(badge('Contoh', true));
      if (a.description) div.appendChild(el('p', 'muted', a.description));
      li.appendChild(div);
      ul.appendChild(li);
    });
    body.replaceChildren(ul);
  }

  function relative(n) { return n === 0 ? 'Hari ini' : n === 1 ? 'Besok' : n + ' hari lagi'; }
  function renderUpcoming() {
    var now = jakartaParts().dateKey;
    var list = ASSESSMENTS.filter(function (a) { return a.date >= now; }).slice(0, 4);
    var ul = $('upcomingList');
    if (!list.length) { ul.replaceChildren(el('li', 'empty', 'Belum ada asesmen yang dijadwalkan.')); return; }
    ul.replaceChildren.apply(ul, list.map(function (a) {
      var li = el('li');
      var b = el('button', 'row row-btn');
      b.type = 'button';
      b.appendChild(el('span', 'dot ' + typeClass(a.type)));
      var g = el('span', 'grow');
      g.appendChild(el('strong', null, a.subject));
      g.appendChild(badge(a.type));
      g.appendChild(el('span', 'muted block', formatShort(a.date)));
      b.appendChild(g);
      b.appendChild(el('span', 'rel', relative(daysBetween(now, a.date))));
      b.addEventListener('click', function () { selectDate(a.date); });
      li.appendChild(b);
      return li;
    }));
  }

  /* ---------- loop per detik ---------- */
  var lastDay = today;
  function tick() {
    var p = jakartaParts();
    renderHeader(p);
    renderCountdown(p);
    if (p.dateKey !== lastDay) { // lewat tengah malam: segarkan penanda "hari ini"
      lastDay = p.dateKey; today = p.dateKey;
      renderCalendar(); renderUpcoming();
    }
  }
  renderCalendar(); renderDetails(); renderUpcoming(); tick();
  setInterval(tick, 1000);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) tick(); });
})();
