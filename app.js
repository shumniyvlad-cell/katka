(() => {
  'use strict';

  /* ---------- helpers ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const rub = (n) => Math.round(n).toLocaleString('ru-RU') + ' ₽';
  const pad = (n) => String(n).padStart(2, '0');
  const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parse = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const today = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
  const hh = (h) => pad(h % 24) + ':00';
  const at = (date, h) => { const d = parse(date); d.setHours(h); return d; };
  const DOW = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
  const DOW_FULL = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
  const MON = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  const human = (s) => { const d = parse(s); return `${d.getDate()} ${MON[d.getMonth()]}, ${DOW[d.getDay()]}`; };
  const isWeekend = (s) => [0, 6].includes(parse(s).getDay());
  const isEvening = (s, h) => isWeekend(s) || h >= 17;
  const isHappy = (s, h) => !isWeekend(s) && h < 14;
  const plural = (n, one, few, many) => n + ' ' + (n % 10 === 1 && n % 100 !== 11 ? one : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) ? few : many);
  const hours = (n) => plural(n, 'час', 'часа', 'часов');
  const points = (n) => plural(n, 'балл', 'балла', 'баллов');
  const digits = (s) => String(s).replace(/\D/g, '');
  const normPhone = (s) => { let d = digits(s); if (d.length === 11 && d[0] === '8') d = '7' + d.slice(1); if (d.length === 10) d = '7' + d; return d; };
  const fmtPhone = (d) => d.length === 11 ? `+${d[0]} ${d.slice(1, 4)} ${d.slice(4, 7)}-${d.slice(7, 9)}-${d.slice(9)}` : '+' + d;
  const hash = (str) => { let h = 2166136261; for (const c of str) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  try {
    if (new URLSearchParams(location.search).get('motion') === '1') localStorage.setItem('katka.motion', '1');
    if (localStorage.getItem('katka.motion') === '1') document.documentElement.classList.add('motion');
  } catch { /* storage off */ }

  /* ---------- catalog ---------- */
  const RES = {
    ps: {
      name: 'PlayStation 5', short: 'PS5', acc: 'приставку',  sym: '✕', color: 'var(--x)', img: 'img/ps.jpg', wide: true,
      units: ['PS5 №1', 'PS5 №2'], day: 350, eve: 450, open: 10, close: 26, guests: [1, 4],
      text: 'Телевизор 65", мягкий диван и по два геймпада на приставку. Третий и четвёртый геймпад дадим по запросу.',
      tags: ['EA FC 26', 'Mortal Kombat 1', 'Tekken 8', 'It Takes Two', 'GT7', '+30 игр'],
    },
    pc: {
      name: 'Игровой ПК', short: 'ПК', acc: 'ПК',  sym: '○', color: 'var(--o)', img: 'img/pc.jpg', wide: true,
      units: ['ПК №1', 'ПК №2'], day: 250, eve: 300, open: 10, close: 26, guests: [1, 1],
      text: 'RTX 4070 Super, 32 ГБ, монитор 27" на 240 Гц. Играть или работать: подписки на ИИ-сервисы уже оплачены.',
      tags: ['CS2', 'Dota 2', 'Valorant', 'ChatGPT', 'Claude', 'Midjourney', 'Suno'],
    },
    vr: {
      name: 'VR', short: 'VR', acc: 'VR',  sym: '△', color: 'var(--t)', img: 'img/vr.jpg',
      units: ['Quest 3'], day: 500, eve: 600, open: 10, close: 26, guests: [1, 3],
      text: 'Quest 3 и свободная площадка 3×3 м. Картинка дублируется на телевизор, чтобы друзья видели и болели.',
      tags: ['Beat Saber', 'Superhot', 'Walkabout Golf'],
    },
    lounge: {
      name: 'Гостиная', short: 'Гостиная', acc: 'гостиную',  sym: '□', color: 'var(--q)', img: 'img/lounge.jpg',
      units: ['Гостиная'], day: 800, eve: 1100, open: 10, close: 26, guests: [2, 12],
      text: 'Большой стол на 12 человек, проектор, колонка, настолки и чай. Для дня рождения, мастермайнда или киновечера.',
      tags: ['до 12 человек', 'проектор', 'настолки'],
    },
    scoot: {
      name: 'Электросамокат', short: 'Самокат', acc: 'самокат',  sym: '→', color: 'var(--amber)', img: 'img/scoot.jpg',
      units: ['Самокат №1', 'Самокат №2', 'Самокат №3', 'Самокат №4'], day: 300, eve: 300, dayPrice: 1500, open: 8, close: 22, guests: [1, 1],
      text: 'Запас хода 40 км, шлем и замок в комплекте. Выдаём по паспорту или под залог.',
      tags: ['40 км', 'шлем', 'замок'],
    },
  };
  const ORDER = ['ps', 'pc', 'vr', 'lounge', 'scoot'];

  const CODES = {
    'ПЕРВАЯКАТКА': { pct: 50, firstOnly: true, firstHour: true, label: 'первый час −50%' },
    'ДЕНЬРОЖДЕНИЯ': { pct: 20, label: '−20% именинникам' },
    'СТУДЕНТ': { pct: 15, weekdayOnly: true, label: '−15% студентам' },
  };

  const PROMOS = [
    { big: '−50%', c: 'var(--violet)', title: 'Первая катка', text: 'Первый час первой брони за полцены. Пробуй любую зону.', code: 'ПЕРВАЯКАТКА' },
    { big: '−30%', c: 'var(--t)', title: 'Счастливые часы', text: 'По будням с 10:00 до 14:00 на все зоны, кроме самокатов. Часы с зелёной точкой.', auto: true },
    { big: '−20%', c: 'var(--q)', title: 'День рождения', text: 'Всю неделю вокруг дня рождения. Паспорт покажешь на месте.', code: 'ДЕНЬРОЖДЕНИЯ' },
    { big: '−15%', c: 'var(--x)', title: 'Приведи друга', text: 'Дай другу свой код из кабинета: ему −15% на бронь, тебе 150 баллов.', ref: true },
    { big: '5%', c: 'var(--amber)', title: 'Кешбэк баллами', text: 'С каждой брони. Баллами можно оплатить до 30% следующей.', auto: true },
    { big: '−15%', c: 'var(--o)', title: 'Студентам', text: 'В будни на любое время. Студенческий покажешь на месте.', code: 'СТУДЕНТ' },
  ];

  const LEVELS = [
    { at: 0, name: 'Новичок' }, { at: 5, name: 'Игрок' }, { at: 15, name: 'Завсегдатай' }, { at: 40, name: 'Легенда катки' },
  ];

  const EVENTS = [
    { id: 'fc', dow: 5, h: 19, title: 'Турнир EA FC 26 1×1', zone: 'PS5', cap: 8, fee: 500, taken: 5, c: 'var(--x)', text: 'Олимпийка до первого поражения, матчи по 6 минут. Победитель забирает 5 часов катки бесплатно.' },
    { id: 'cs', dow: 6, h: 18, title: 'CS2: aim-дуэли', zone: 'ПК', cap: 8, fee: 400, taken: 3, c: 'var(--o)', text: 'Дуэли 1×1 на двух ПК, турнирная таблица на телевизоре. Свою мышку можно.' },
    { id: 'vr', dow: 0, h: 16, title: 'VR-вечер: рекорд Beat Saber', zone: 'VR', cap: 10, fee: 400, taken: 7, c: 'var(--t)', text: 'Каждый играет три трека, лучший счёт вечера уходит на стену славы.' },
    { id: 'ai', dow: 3, h: 11, title: 'ИИ-завтрак: бот за 2 часа', zone: 'Гостиная', cap: 8, fee: 900, taken: 2, c: 'var(--q)', text: 'Кофе, сырники и два ПК с оплаченными подписками. Собираем своего Telegram-бота без программиста.' },
    { id: 'coop', dow: 4, h: 19, title: 'Кооп-ночь: It Takes Two', zone: 'PS5', cap: 8, fee: 600, taken: 4, c: 'var(--x)', text: 'Приходи с парой или найдём тебе напарника. Кто дальше пройдёт за вечер, тот выбирает пиццу.' },
    { id: 'ride', dow: 6, h: 11, title: 'Самокат-рейд по городу', zone: 'Самокаты', cap: 4, fee: 600, taken: 1, c: 'var(--amber)', text: 'Два часа колонной с остановкой на кофе. Самокат и шлем включены.' },
  ];

  /* ---------- storage ---------- */
  const KEY = 'katka.v1';
  const fresh = () => ({ v: 1, users: {}, session: null, bookings: [], signups: {}, events: [] });
  let db = (() => {
    try { const d = JSON.parse(localStorage.getItem(KEY)); if (d && d.v === 1) return { ...fresh(), ...d }; } catch { /* empty */ }
    return fresh();
  })();
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch { /* storage off */ } };
  const me = () => (db.session && db.users[db.session]) || null;
  const myBookings = (phone) => db.bookings.filter((b) => b.phone === phone);

  function ensureUser(name, phone) {
    let u = db.users[phone];
    if (!u) {
      u = { name, phone, bonus: 0, ref: 'KATKA-' + (hash(phone).toString(36).toUpperCase().slice(0, 4)).padEnd(4, 'X'), created: Date.now() };
      db.users[phone] = u;
    } else if (name) u.name = name;
    db.session = phone;
    save();
    return u;
  }

  /* ---------- availability ---------- */
  function offline(res, unit, date, h) {
    const block = Math.floor(h / (res === 'scoot' ? 3 : 2));
    const v = hash(`${date}|${res}|${unit}|${block}`) % 100;
    const thr = res === 'lounge' ? 12 : res === 'scoot' ? 22 : isEvening(date, h) ? 36 : 15;
    return v < thr;
  }
  function online(res, unit, date, h) {
    return db.bookings.find((b) => b.status !== 'cancelled' && b.res === res && b.unit === unit && b.date === date && h >= b.start && h < b.start + b.dur);
  }
  const past = (date, h) => at(date, h + 1) <= new Date();
  const unitFree = (res, unit, date, h) => !past(date, h) && !offline(res, unit, date, h) && !online(res, unit, date, h);
  const rangeFree = (res, unit, date, s, e) => { for (let h = s; h <= e; h++) if (!unitFree(res, unit, date, h)) return false; return true; };
  const pickUnit = (res, unitPref, date, s, e) => {
    if (unitPref >= 0) return rangeFree(res, unitPref, date, s, e) ? unitPref : -1;
    return RES[res].units.findIndex((_, i) => rangeFree(res, i, date, s, e));
  };

  /* ---------- toast & modal ---------- */
  let toastT;
  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('on');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 2600);
  }
  async function copy(text) {
    try { await navigator.clipboard.writeText(text); toast(`Скопировано: ${text}`); } catch { toast(text); }
  }

  const modal = $('#modal');
  let lastFocus = null;
  function openModal(html, wide = false) {
    lastFocus = document.activeElement;
    $('#modalBody').innerHTML = html;
    modal.classList.toggle('modal--wide', wide);
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    const f = $('#modalBody input, #modalBody button') || $('.modal__x');
    f && f.focus({ preventScroll: true });
  }
  function closeModal() {
    modal.hidden = true; document.body.style.overflow = '';
    if (location.hash === '#me' || location.hash === '#admin') history.replaceState(null, '', location.pathname + location.search);
    lastFocus && lastFocus.focus && lastFocus.focus({ preventScroll: true });
  }
  modal.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hidden) closeModal(); });

  /* ---------- login ---------- */
  function login(then) {
    openModal(`
      <h3>Вход</h3>
      <p class="lead">По номеру телефона. Брони, баллы и сборы будут в одном месте.</p>
      <form id="loginForm" novalidate>
        <label class="field"><span>Имя</span><input name="name" autocomplete="given-name" required></label>
        <label class="field"><span>Телефон</span><input name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+7 900 000-00-00" required></label>
        <button class="btn btn--accent btn--lg" type="submit">Войти</button>
        <p class="sum-small">В демо-версии без кода из SMS. В боевой — придёт код в Telegram.</p>
      </form>`);
    $('#loginForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const f = e.target; const name = f.name.value.trim(); const phone = normPhone(f.phone.value);
      f.name.setAttribute('aria-invalid', !name); f.phone.setAttribute('aria-invalid', phone.length !== 11);
      if (!name || phone.length !== 11) return;
      ensureUser(name, phone);
      closeModal(); syncAccount(); prefill(); renderEvents(); renderSummary();
      toast(`Привет, ${name}!`);
      then && then();
    });
  }
  const needLogin = (fn) => (me() ? fn() : login(fn));

  function syncAccount() {
    const u = me();
    $('#accountBtn').textContent = u ? u.name.split(' ')[0] + ' · ' + u.bonus + ' б.' : 'Войти';
  }

  /* ---------- zones ---------- */
  function renderZones() {
    $('#zonesGrid').innerHTML = ORDER.map((k) => {
      const r = RES[k];
      const price = k === 'scoot' ? `${r.day} ₽<small> / час</small>` : `от ${r.day} ₽<small> / час</small>`;
      return `<article class="zone ${r.wide ? 'zone--wide' : ''}">
        <div class="zone__img"><img src="${r.img}" alt="${esc(r.name)}" loading="lazy"></div>
        <div class="zone__body">
          <span class="zone__tag mono"><i style="color:${r.color}">${r.sym}</i>${r.units.length > 1 ? r.units.length + ' шт.' : '1 шт.'}</span>
          <h3>${esc(r.name)}</h3>
          <p>${esc(r.text)}</p>
          <ul>${r.tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
          <div class="zone__foot"><span class="zone__price">${price}</span><button class="btn btn--line btn--sm" type="button" data-book="${k}">Забронировать</button></div>
        </div>
      </article>`;
    }).join('');
  }

  /* ---------- prices ---------- */
  function renderPrices() {
    const rows = ORDER.map((k) => {
      const r = RES[k];
      const note = { ps: 'до 4 игроков на приставку', pc: 'одно место', vr: 'зрители бесплатно', lounge: 'цена за всю комнату', scoot: 'сутки — 1 500 ₽, залог 3 000 ₽' }[k];
      return `<div class="pt-row">
        <span class="pt-name"><i style="color:${r.color}">${r.sym}</i>${esc(r.name)}</span>
        <span class="pt-cell" data-l="день"><b>${r.day}</b> <small>₽/ч</small></span>
        <span class="pt-cell" data-l="вечер и выходные"><b>${r.eve}</b> <small>₽/ч</small></span>
        <span class="pt-cell pt-cell--note"><small>${note}</small></span>
      </div>`;
    }).join('');
    $('#priceTable').innerHTML = `<div class="pt-row mono"><span>зона</span><span>день</span><span>вечер · выходные</span><span></span></div>${rows}`;
    $('#packs').innerHTML = `
      <div class="pack pack--hot"><span class="mono" style="color:#c8b6ff">каждый день 22–02</span><h3>Ночная катка</h3><p>Четыре часа на PS5 с 22:00 до 02:00. Выбери эти часы в брони, цена посчитается сама.</p><div class="pack__price">1 400 ₽<s>1 800</s></div></div>
      <div class="pack"><span class="mono" style="color:var(--muted)">автоматически</span><h3>От 3 часов</h3><p>Бронируешь три часа и больше на любую зону — минус 10% на всю бронь.</p><div class="pack__price">−10%</div></div>
      <div class="pack"><span class="mono" style="color:var(--muted)">на 2 месяца</span><h3>Абонемент 10 часов</h3><p>Любая зона, кроме гостиной, в любое время. Оформляется у Кати на месте.</p><div class="pack__price">3 500 ₽<s>4 500</s></div></div>`;
  }

  /* ---------- promos ---------- */
  function renderPromos() {
    $('#promoGrid').innerHTML = PROMOS.map((p) => `
      <article class="promo" style="--c:${p.c}">
        <div class="promo__big">${p.big}</div>
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.text)}</p>
        ${p.code ? `<button class="promo__code" type="button" data-copy="${p.code}">${p.code} <span aria-hidden="true">⧉</span></button>`
          : p.ref ? `<button class="promo__code" type="button" data-myref>Мой код друга →</button>`
          : `<span class="promo__auto">● работает само</span>`}
      </article>`).join('');
  }

  /* ---------- events ---------- */
  function seededEvents() {
    const t = today(); const now = new Date();
    return EVENTS.map((e) => {
      let d = new Date(t); let diff = (e.dow - d.getDay() + 7) % 7;
      d = addDays(d, diff);
      if (at(iso(d), e.h) <= now) d = addDays(d, 7);
      return { ...e, date: iso(d) };
    });
  }
  function allEvents() {
    const now = new Date();
    const user = db.events.filter((e) => at(e.date, e.h + 2) > now).map((e) => ({ ...e, user: true }));
    return [...seededEvents(), ...user].sort((a, b) => at(a.date, a.h) - at(b.date, b.h));
  }
  function renderEvents() {
    const u = me();
    $('#eventsList').innerHTML = allEvents().map((e) => {
      const list = db.signups[e.id] || [];
      const taken = (e.taken || 0) + list.length;
      const left = Math.max(0, e.cap - taken);
      const mine = u && list.includes(u.phone);
      const d = parse(e.date);
      return `<article class="ev ${e.user ? 'ev--user' : ''}" style="--c:${e.c || 'var(--violet)'}">
        ${e.user ? `<span class="ev__badge">сбор от ${esc(e.author)}</span>` : ''}
        <div class="ev__date"><span class="ev__day">${d.getDate()}</span><span class="ev__meta"><b>${MON[d.getMonth()]}, ${DOW_FULL[d.getDay()]}</b>${hh(e.h)} · ${esc(e.zone)}</span></div>
        <h3>${esc(e.title)}</h3>
        <p>${esc(e.text)}</p>
        <div class="ev__bar" role="img" aria-label="Занято ${taken} из ${e.cap}"><i style="width:${Math.min(100, (taken / e.cap) * 100)}%"></i></div>
        <div class="ev__foot">
          <span><b>${e.fee ? rub(e.fee) : 'бесплатно'}</b> · ${left ? `осталось ${left} из ${e.cap}` : 'мест нет'}</span>
          ${mine ? `<button class="btn btn--line btn--sm" type="button" data-leave="${esc(e.id)}">Ты в списке ✓</button>`
            : `<button class="btn btn--accent btn--sm" type="button" data-join="${esc(e.id)}" ${left ? '' : 'disabled'}>Иду</button>`}
        </div>
      </article>`;
    }).join('');
  }
  function join(id) {
    needLogin(() => {
      const u = me(); const list = db.signups[id] || (db.signups[id] = []);
      if (!list.includes(u.phone)) list.push(u.phone);
      save(); renderEvents(); toast('Записали! Напоминание придёт накануне.');
    });
  }
  function leave(id) {
    const u = me(); if (!u) return;
    db.signups[id] = (db.signups[id] || []).filter((p) => p !== u.phone);
    save(); renderEvents(); toast('Выписали из сбора');
  }
  function newEvent() {
    needLogin(() => {
      const min = iso(today());
      const opts = Array.from({ length: 14 }, (_, i) => i + 10).map((h) => `<option value="${h}" ${h === 19 ? 'selected' : ''}>${hh(h)}</option>`).join('');
      openModal(`
        <h3>Свой сбор</h3>
        <p class="lead">Позови друзей или найди людей в катку. Сбор увидят все на сайте.</p>
        <form id="evForm" novalidate>
          <label class="field"><span>Что делаем</span><input name="title" maxlength="60" required placeholder="Например, Mortal Kombat до утра"></label>
          <div class="row">
            <label class="field"><span>День</span><input name="date" type="date" min="${min}" value="${min}" required></label>
            <label class="field"><span>Начало</span><select name="h">${opts}</select></label>
          </div>
          <div class="row">
            <label class="field"><span>Где</span><select name="zone"><option>Гостиная</option><option>PS5</option><option>ПК</option><option>VR</option><option>Весь дом</option></select></label>
            <label class="field"><span>Сколько мест</span><input name="cap" type="number" min="2" max="12" value="6"></label>
          </div>
          <label class="field"><span>Пара слов</span><textarea name="text" maxlength="240" placeholder="Кого ждём, что взять с собой"></textarea></label>
          <button class="btn btn--accent btn--lg" type="submit">Опубликовать сбор</button>
        </form>`);
      $('#evForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const f = e.target; const title = f.title.value.trim();
        f.title.setAttribute('aria-invalid', !title);
        if (!title || !f.date.value) return;
        const u = me();
        const ev = {
          id: 'u' + uid(), title, date: f.date.value, h: +f.h.value, zone: f.zone.value,
          cap: Math.min(12, Math.max(2, +f.cap.value || 6)), fee: 0, taken: 0, c: 'var(--violet)',
          text: f.text.value.trim() || 'Собираемся своей компанией, присоединяйся.', author: u.name, owner: u.phone,
        };
        db.events.push(ev); db.signups[ev.id] = [u.phone]; save();
        renderEvents();
        const res = { 'Гостиная': 'lounge', 'PS5': 'ps', 'ПК': 'pc', 'VR': 'vr', 'Весь дом': 'lounge' }[ev.zone];
        openModal(`
          <div class="done-mark">✓</div>
          <h3>Сбор опубликован</h3>
          <p class="lead">«${esc(ev.title)}» — ${human(ev.date)}, ${hh(ev.h)}. Осталось занять место, чтобы его никто не перехватил.</p>
          <button class="btn btn--accent btn--lg" type="button" id="evBook">Забронировать ${esc(RES[res].acc)} на это время</button>`);
        $('#evBook').addEventListener('click', () => { closeModal(); openBooking(res, { date: ev.date, start: ev.h }); });
      });
    });
  }

  /* ---------- booking ---------- */
  const st = { res: 'ps', unit: -1, date: iso(today()), start: null, end: null, pending: false, guests: 1, dayMode: false };

  function openBooking(res, opts = {}) {
    st.res = res; st.unit = -1; st.dayMode = false; st.start = null; st.end = null; st.pending = false;
    st.guests = RES[res].guests[0];
    if (opts.date) st.date = opts.date;
    renderBooking();
    if (opts.start != null) {
      const s = Math.max(opts.start, RES[res].open);
      if (pickUnit(res, -1, st.date, s, s) >= 0) { st.start = s; st.end = Math.min(s + 1, RES[res].close - 1); if (pickUnit(res, -1, st.date, s, st.end) < 0) st.end = s; renderSlots(); renderSummary(); }
    }
    $('#book').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderBooking() {
    $('#resChips').innerHTML = ORDER.map((k) => `<button type="button" class="chip" role="radio" aria-checked="${st.res === k}" data-res="${k}"><i style="color:${RES[k].color}">${RES[k].sym}</i>${esc(RES[k].short)}</button>`).join('');
    const r = RES[st.res];
    $('#unitChips').innerHTML = r.units.length > 1
      ? [`<button type="button" class="chip" role="radio" aria-checked="${st.unit === -1}" data-unit="-1">Любой свободный</button>`, ...r.units.map((u, i) => `<button type="button" class="chip" role="radio" aria-checked="${st.unit === i}" data-unit="${i}">${esc(u)}</button>`)].join('')
      : '';
    const t = today();
    $('#dayChips').innerHTML = Array.from({ length: 14 }, (_, i) => {
      const d = addDays(t, i); const s = iso(d);
      const label = i === 0 ? 'сегодня' : i === 1 ? 'завтра' : DOW[d.getDay()];
      return `<button type="button" class="day ${isWeekend(s) ? 'day--we' : ''}" role="radio" aria-checked="${st.date === s}" data-date="${s}"><small>${label}</small><b>${d.getDate()}</b></button>`;
    }).join('');
    $('#dayModeWrap').hidden = st.res !== 'scoot';
    $('#dayMode').checked = st.dayMode;
    $('#guestsRow').hidden = r.guests[1] === 1;
    $('#guests').textContent = st.guests;
    renderSlots(); renderSummary();
  }

  function renderSlots() {
    const r = RES[st.res];
    const box = $('#slots');
    $('#slotHint').textContent = st.dayMode ? 'Самокат на весь день с 08:00 до 22:00. Выбери день — и всё.' : 'Нажми на час начала, потом на последний час.';
    if (st.dayMode) {
      const unit = pickUnit(st.res, st.unit, st.date, r.open, r.close - 1);
      box.innerHTML = unit >= 0 ? `<p class="sum-small" style="grid-column:1/-1">${esc(r.units[unit])} свободен весь день ✓</p>` : `<p class="sum-err" style="grid-column:1/-1">На этот день целиком свободного самоката нет, возьми по часам или выбери другой день.</p>`;
      return;
    }
    let html = '';
    for (let h = r.open; h < r.close; h++) {
      const free = st.unit >= 0 ? unitFree(st.res, st.unit, st.date, h) : r.units.some((_, i) => unitFree(st.res, i, st.date, h));
      const sel = st.start != null && h >= st.start && h <= st.end;
      const happy = st.res !== 'scoot' && isHappy(st.date, h);
      html += `<button type="button" class="slot ${sel ? 'slot--sel' : ''} ${happy ? 'slot--happy' : ''}" data-h="${h}" ${free ? '' : 'disabled'} aria-pressed="${sel}" aria-label="${hh(h)}${free ? '' : ', занято'}${happy ? ', скидка 30%' : ''}">${hh(h)}</button>`;
    }
    box.innerHTML = html;
  }

  function clickSlot(h) {
    if (st.pending && h > st.start) {
      if (pickUnit(st.res, st.unit, st.date, st.start, h) >= 0) { st.end = h; st.pending = false; }
      else { toast('Между этими часами кто-то уже сидит'); st.start = st.end = h; }
    } else { st.start = st.end = h; st.pending = true; }
    renderSlots(); renderSummary();
  }

  function quote() {
    const r = RES[st.res]; const u = me();
    const out = { lines: [], err: null };
    if (st.dayMode) { st.start = r.open; st.end = r.close - 1; }
    if (st.start == null) return null;
    const dur = st.end - st.start + 1;
    let sub = 0; let happySave = 0; let firstHour = 0;
    if (st.dayMode) sub = firstHour = r.dayPrice;
    else for (let h = st.start; h <= st.end; h++) {
      const p = isEvening(st.date, h) ? r.eve : r.day;
      if (h === st.start) firstHour = p;
      sub += p;
      if (st.res !== 'scoot' && isHappy(st.date, h)) happySave += Math.round(p * 0.3);
    }
    const cands = [];
    if (happySave) cands.push({ label: 'Счастливые часы', save: happySave });
    if (!st.dayMode && dur >= 3) cands.push({ label: 'От 3 часов −10%', save: Math.round(sub * 0.1) });
    if (st.res === 'ps' && st.start === 22 && st.end === 25) cands.push({ label: 'Ночная катка', save: sub - 1400 });

    const raw = $('#fPromo').value.trim().toUpperCase().replace(/\s+/g, '');
    let refOwner = null;
    if (raw) {
      const c = CODES[raw];
      const phone = normPhone($('#fPhone').value) || (u && u.phone);
      const owner = Object.values(db.users).find((x) => x.ref === raw);
      if (c) {
        if (c.firstOnly && phone && myBookings(phone).some((b) => b.status !== 'cancelled')) out.err = 'Этот код только для первой брони';
        else if (c.weekdayOnly && isWeekend(st.date)) out.err = 'Код студента работает только в будни';
        else cands.push({ label: `Код ${raw}`, save: Math.round((c.firstHour ? firstHour : sub) * c.pct / 100) });
      } else if (owner) {
        if (owner.phone === phone) out.err = 'Свой код друга использовать нельзя';
        else { cands.push({ label: 'Код друга −15%', save: Math.round(sub * 0.15) }); refOwner = owner.phone; }
      } else out.err = 'Такого промокода нет';
    }
    const best = cands.sort((a, b) => b.save - a.save)[0];
    if (best && best.label !== 'Код друга −15%') refOwner = null;
    const after = sub - (best ? best.save : 0);
    let bonus = 0;
    if (u && u.bonus > 0) {
      const max = Math.min(u.bonus, Math.floor(after * 0.3));
      $('#bonusWrap').hidden = max <= 0;
      $('#bonusLabel').textContent = `Списать ${points(max)} (у тебя ${u.bonus})`;
      if ($('#fBonus').checked) bonus = max;
    } else $('#bonusWrap').hidden = true;
    const total = after - bonus;
    return { dur, sub, best, bonus, total, cashback: Math.round(total * 0.05), refOwner, err: out.err };
  }

  function renderSummary() {
    const q = quote(); const r = RES[st.res]; const box = $('#summary');
    if (!q) {
      box.innerHTML = `<h3>Твоя бронь</h3><p class="sum-empty">Выбери часы — тут сразу посчитаем цену со всеми скидками.</p>
        <div class="sum-lines"><div class="sum-line"><span>Зона</span><b>${esc(r.name)}</b></div><div class="sum-line"><span>День</span><b>${human(st.date)}</b></div></div>`;
      return;
    }
    const unit = pickUnit(st.res, st.unit, st.date, st.start, st.end);
    const time = st.dayMode ? 'весь день, 08:00–22:00' : `${hh(st.start)}–${hh(st.end + 1)} · ${hours(q.dur)}`;
    box.innerHTML = `
      <h3>Твоя бронь</h3>
      <div class="sum-lines">
        <div class="sum-line"><span>Зона</span><b>${esc(r.name)}</b></div>
        <div class="sum-line"><span>Место</span><b>${unit >= 0 ? esc(r.units[unit]) : '—'}</b></div>
        <div class="sum-line"><span>День</span><b>${human(st.date)}</b></div>
        <div class="sum-line"><span>Время</span><b>${time}</b></div>
        ${r.guests[1] > 1 ? `<div class="sum-line"><span>Гостей</span><b>${st.guests}</b></div>` : ''}
        <div class="sum-line"><span>Стоимость</span><b>${rub(q.sub)}</b></div>
        ${q.best ? `<div class="sum-line sum-line--disc"><span>${esc(q.best.label)}</span><b>−${rub(q.best.save)}</b></div>` : ''}
        ${q.bonus ? `<div class="sum-line sum-line--disc"><span>Баллами</span><b>−${rub(q.bonus)}</b></div>` : ''}
      </div>
      ${q.err ? `<p class="sum-err">${esc(q.err)}</p>` : ''}
      <div class="sum-total"><span>Итого</span><b>${rub(q.total)}</b></div>
      <button class="btn btn--accent btn--lg" type="submit" form="bookForm" ${unit < 0 ? 'disabled' : ''}>Забронировать</button>
      <p class="sum-small">Платишь на месте наличными, картой или по СБП. Вернётся ${points(q.cashback)}.</p>`;
  }

  function prefill() {
    const u = me();
    if (u) { if (!$('#fName').value) $('#fName').value = u.name; if (!$('#fPhone').value) $('#fPhone').value = fmtPhone(u.phone); }
  }

  function submitBooking(e) {
    e.preventDefault();
    const q = quote();
    if (!q) { toast('Сначала выбери часы'); $('#slots').scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
    const name = $('#fName').value.trim(); const phone = normPhone($('#fPhone').value);
    $('#fName').setAttribute('aria-invalid', !name); $('#fPhone').setAttribute('aria-invalid', phone.length !== 11);
    if (!name || phone.length !== 11) { toast('Нужны имя и телефон'); (name ? $('#fPhone') : $('#fName')).focus(); return; }
    const unit = pickUnit(st.res, st.unit, st.date, st.start, st.end);
    if (unit < 0) { toast('Эти часы уже заняли, выбери другие'); renderSlots(); return; }
    const u = ensureUser(name, phone);
    const q2 = quote(); // recalc with the logged-in user (first-booking code, bonus)
    if (q2.err) { renderSummary(); toast(q2.err); return; }
    const b = {
      id: uid(), phone, name, res: st.res, unit, date: st.date, start: st.start, dur: q2.dur, dayMode: st.dayMode,
      guests: st.guests, sub: q2.sub, discount: q2.best ? q2.best.label : null, save: q2.best ? q2.best.save : 0,
      bonusUsed: q2.bonus, total: q2.total, cashback: q2.cashback, note: $('#fNote').value.trim(), status: 'new', created: Date.now(),
    };
    u.bonus = u.bonus - b.bonusUsed + b.cashback;
    if (q2.refOwner && db.users[q2.refOwner]) db.users[q2.refOwner].bonus += 150;
    db.bookings.push(b); save();
    const r = RES[b.res];
    $('#fPromo').value = ''; $('#fNote').value = ''; $('#fBonus').checked = false;
    st.start = st.end = null; st.pending = false; st.dayMode = false;
    renderBooking(); syncAccount(); renderLive();
    openModal(`
      <div class="done-mark">✓</div>
      <h3>Забронировано</h3>
      <p class="lead">${esc(name)}, ждём тебя. Адрес и как пройти Катя пришлёт в Telegram за пару часов до начала.</p>
      <div class="ticket">
        <div><span>зона</span>${esc(r.units[b.unit])}</div>
        <div><span>день</span>${human(b.date)}</div>
        <div><span>время</span>${b.dayMode ? '08:00–22:00' : `${hh(b.start)}–${hh(b.start + b.dur)}`}</div>
        <div><span>к оплате</span>${rub(b.total)}</div>
        <div><span>номер</span>#${b.id.slice(-5).toUpperCase()}</div>
        <div><span>баллы</span>+${b.cashback}</div>
      </div>
      <div class="hero__cta"><button class="btn btn--accent" type="button" id="toCab">Мои брони</button><button class="btn btn--line" type="button" data-close>Ок</button></div>`);
    $('#toCab').addEventListener('click', openCabinet);
  }

  /* ---------- live status ---------- */
  function renderLive() {
    const now = new Date(); let h = now.getHours(); let date = iso(today());
    if (h < 2) { h += 24; date = iso(addDays(today(), -1)); }
    const box = $('#live');
    if (h < 10 || h >= 26) { box.innerHTML = '<span>Сейчас закрыто, откроемся в 10:00. Бронь работает всегда.</span>'; return; }
    const pills = ['ps', 'pc', 'vr', 'lounge'].flatMap((k) => RES[k].units.map((u, i) => {
      const busy = offline(k, i, date, h) || online(k, i, date, h);
      return `<span class="live__pill ${busy ? 'live__pill--busy' : ''}">${esc(u)}</span>`;
    }));
    box.innerHTML = `<span class="live__dot" aria-hidden="true"></span><b>Сейчас свободно:</b>${pills.join('')}`;
  }

  /* ---------- cabinet ---------- */
  let cabTab = 'bookings';
  function openCabinet() {
    const u = me();
    if (!u) { login(openCabinet); return; }
    const bs = myBookings(u.phone).sort((a, b) => at(b.date, b.start) - at(a.date, a.start));
    const active = bs.filter((b) => b.status !== 'cancelled');
    const played = active.reduce((s, b) => s + b.dur, 0);
    const lvlI = LEVELS.reduce((acc, l, i) => (played >= l.at ? i : acc), 0);
    const lvl = LEVELS[lvlI]; const next = LEVELS[lvlI + 1];
    const pct = next ? ((played - lvl.at) / (next.at - lvl.at)) * 100 : 100;
    const now = new Date();
    const evs = allEvents().filter((e) => (db.signups[e.id] || []).includes(u.phone));

    const bookingsHtml = bs.length ? bs.map((b) => {
      const r = RES[b.res]; const end = at(b.date, b.start + b.dur);
      const isPast = end <= now; const cancelled = b.status === 'cancelled';
      const canCancel = !cancelled && !isPast && at(b.date, b.start) - now > 2 * 3600e3;
      const status = cancelled ? '<span class="status status--off">отменена</span>' : isPast || b.status === 'came' ? '<span class="status status--ok">была</span>' : '<span class="status status--wait">ждём</span>';
      return `<div class="item ${isPast || cancelled ? 'item--past' : ''}">
        <div class="item__main"><b>${esc(r.units[b.unit])} · ${human(b.date)}</b><span>${b.dayMode ? '08:00–22:00' : `${hh(b.start)}–${hh(b.start + b.dur)}`} · ${rub(b.total)}${b.discount ? ' · ' + esc(b.discount) : ''}</span></div>
        <div class="item__side">${status}${canCancel ? `<button class="btn btn--danger btn--sm" type="button" data-cancel="${b.id}">Отменить</button>` : ''}</div>
      </div>`;
    }).join('') : '<p class="empty">Броней пока нет. Самое время забронировать первую катку со скидкой 50%.</p>';

    const eventsHtml = evs.length ? evs.map((e) => `<div class="item"><div class="item__main"><b>${esc(e.title)}</b><span>${human(e.date)}, ${hh(e.h)} · ${esc(e.zone)}</span></div><div class="item__side"><button class="btn btn--line btn--sm" type="button" data-leave="${esc(e.id)}">Не пойду</button></div></div>`).join('')
      : '<p class="empty">Ты пока ни в одном сборе.</p>';

    const tabs = { bookings: bookingsHtml, events: eventsHtml, profile: `
      <form id="profForm" novalidate>
        <label class="field"><span>Имя</span><input name="name" value="${esc(u.name)}" required></label>
        <label class="field"><span>Телефон</span><input value="${fmtPhone(u.phone)}" disabled></label>
        <div class="hero__cta"><button class="btn btn--accent" type="submit">Сохранить</button><button class="btn btn--line" type="button" id="logout">Выйти</button></div>
      </form>` };

    openModal(`
      <div class="cab__head">
        <div class="avatar">${esc(u.name.slice(0, 1).toUpperCase())}</div>
        <div><div class="cab__name">${esc(u.name)}</div><div class="cab__lvl">${lvl.name}</div></div>
      </div>
      <div class="stats">
        <div class="stat"><b>${played}</b><span>часов в бронях</span></div>
        <div class="stat"><b>${u.bonus}</b><span>${points(u.bonus).replace(/^\d+ /, '')} = ${rub(u.bonus)}</span></div>
        <div class="stat"><b>${active.length}</b><span>броней</span></div>
      </div>
      <div class="xp">
        <div class="xp__txt"><span>${lvl.name}</span><span>${next ? `до «${next.name}» ${hours(next.at - played)}` : 'максимальный уровень'}</span></div>
        <div class="xp__bar"><i style="width:${pct}%"></i></div>
      </div>
      <div class="tabs" role="tablist">
        <button class="tab" role="tab" aria-selected="${cabTab === 'bookings'}" data-tab="bookings">Брони</button>
        <button class="tab" role="tab" aria-selected="${cabTab === 'events'}" data-tab="events">Сборы</button>
        <button class="tab" role="tab" aria-selected="${cabTab === 'profile'}" data-tab="profile">Профиль</button>
      </div>
      <div class="list">${tabs[cabTab]}</div>
      <div class="ref"><div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:8px">Код для друга: <code>${u.ref}</code><button class="promo__code" type="button" data-copy="${u.ref}">копировать</button></div><span style="color:var(--muted)">Другу −15% на бронь, тебе 150 баллов, когда он забронирует.</span></div>
      <div class="hero__cta" style="margin-top:16px"><button class="btn btn--accent" type="button" id="cabBook">Новая бронь</button></div>`, true);

    const body = $('#modalBody');
    $$('[data-tab]', body).forEach((b) => b.addEventListener('click', () => { cabTab = b.dataset.tab; openCabinet(); }));
    $('#cabBook').addEventListener('click', () => { closeModal(); openBooking(st.res); });
    const pf = $('#profForm');
    if (pf) {
      pf.addEventListener('submit', (e) => { e.preventDefault(); const n = pf.name.value.trim(); if (!n) return; u.name = n; save(); syncAccount(); toast('Сохранили'); openCabinet(); });
      $('#logout').addEventListener('click', () => { db.session = null; save(); syncAccount(); closeModal(); renderEvents(); toast('Вышли из кабинета'); });
    }
  }

  function cancelBooking(id) {
    const b = db.bookings.find((x) => x.id === id); if (!b) return;
    b.status = 'cancelled';
    const u = db.users[b.phone];
    if (u) u.bonus = Math.max(0, u.bonus + b.bonusUsed - b.cashback);
    save(); syncAccount(); renderSlots(); renderLive();
    toast('Бронь отменена, баллы вернули');
  }

  /* ---------- admin ---------- */
  let admOk = false; let admDate = iso(today());
  function openAdmin() {
    if (!admOk) {
      openModal(`
        <h3>Для Кати</h3>
        <p class="lead">Расписание, брони и выручка. Демо-PIN: 0000.</p>
        <form id="pinForm" novalidate><label class="field"><span>PIN</span><input name="pin" type="password" inputmode="numeric" maxlength="4" autocomplete="off"></label><button class="btn btn--accent btn--lg" type="submit">Открыть</button></form>`);
      $('#pinForm').addEventListener('submit', (e) => { e.preventDefault(); if (e.target.pin.value === '0000') { admOk = true; openAdmin(); } else { e.target.pin.setAttribute('aria-invalid', 'true'); toast('Неверный PIN'); } });
      return;
    }
    const day = db.bookings.filter((b) => b.date === admDate);
    const live = day.filter((b) => b.status !== 'cancelled');
    const revenue = live.reduce((s, b) => s + b.total, 0);
    const units = ORDER.flatMap((k) => RES[k].units.map((u, i) => ({ k, i, u })));
    const H = Array.from({ length: 18 }, (_, i) => i + 8);
    let busy = 0; let cells = 0;
    const rows = units.map(({ k, i, u }) => `<tr><th>${esc(u)}</th>${H.map((h) => {
      const r = RES[k];
      if (h < r.open || h >= r.close) return '<td></td>';
      cells++;
      const b = online(k, i, admDate, h);
      if (b) { busy++; return `<td class="b-on" title="${esc(b.name)} · ${fmtPhone(b.phone)}">${h === b.start ? esc(b.name.slice(0, 6)) : ''}</td>`; }
      if (offline(k, i, admDate, h)) { busy++; return '<td class="b-off" title="по телефону"></td>'; }
      return '<td></td>';
    }).join('')}</tr>`).join('');
    const list = day.sort((a, b) => a.start - b.start).map((b) => `
      <div class="item ${b.status === 'cancelled' ? 'item--past' : ''}">
        <div class="item__main"><b>${esc(b.name)} · ${fmtPhone(b.phone)}</b><span>${esc(RES[b.res].units[b.unit])} · ${hh(b.start)}–${hh(b.start + b.dur)} · ${rub(b.total)}${b.guests > 1 ? ` · ${b.guests} чел.` : ''}${b.note ? ' · «' + esc(b.note) + '»' : ''}</span></div>
        <div class="item__side">${b.status === 'cancelled' ? '<span class="status status--off">отмена</span>' : b.status === 'came' ? '<span class="status status--ok">пришёл</span>'
          : `<button class="btn btn--line btn--sm" type="button" data-came="${b.id}">Пришёл</button><button class="btn btn--danger btn--sm" type="button" data-cancel="${b.id}">Отменить</button>`}</div>
      </div>`).join('') || '<p class="empty">На этот день с сайта броней нет. Штриховка в таблице — брони по телефону.</p>';
    openModal(`
      <h3>Расписание</h3>
      <div class="adm__bar">
        <input type="date" id="admDate" value="${admDate}">
        <button class="btn btn--line btn--sm" type="button" id="admCsv">Выгрузить все брони (CSV)</button>
      </div>
      <div class="adm__stats">
        <div class="stat"><b>${live.length}</b><span>броней с сайта</span></div>
        <div class="stat"><b>${rub(revenue)}</b><span>к оплате за день</span></div>
        <div class="stat"><b>${cells ? Math.round((busy / cells) * 100) : 0}%</b><span>загрузка</span></div>
        <div class="stat"><b>${Object.keys(db.users).length}</b><span>гостей в базе</span></div>
      </div>
      <div class="tl"><table><thead><tr><th></th>${H.map((h) => `<th>${pad(h % 24)}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div>
      <div class="list">${list}</div>`, true);
    $('#admDate').addEventListener('change', (e) => { admDate = e.target.value || iso(today()); openAdmin(); });
    $('#admCsv').addEventListener('click', exportCsv);
  }
  function exportCsv() {
    const head = ['номер', 'создана', 'имя', 'телефон', 'зона', 'дата', 'начало', 'часов', 'гостей', 'сумма', 'скидка', 'баллами', 'статус', 'комментарий'];
    const rows = db.bookings.map((b) => [b.id, new Date(b.created).toLocaleString('ru-RU'), b.name, fmtPhone(b.phone), RES[b.res].units[b.unit], b.date, hh(b.start), b.dur, b.guests, b.total, b.discount || '', b.bonusUsed, b.status, b.note || '']);
    const csv = [head, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(';')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
    a.download = `katka-broni-${iso(today())}.csv`; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  /* ---------- events wiring ---------- */
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-book],[data-res],[data-unit],[data-date],[data-h],[data-g],[data-copy],[data-myref],[data-join],[data-leave],[data-cancel],[data-came]');
    if (!t) return;
    const d = t.dataset;
    if (d.book) { e.preventDefault(); if (!modal.hidden) closeModal(); openBooking(d.book); }
    else if (d.res) { st.res = d.res; st.unit = -1; st.start = st.end = null; st.pending = false; st.dayMode = false; st.guests = Math.min(Math.max(st.guests, RES[d.res].guests[0]), RES[d.res].guests[1]); renderBooking(); }
    else if (d.unit) { st.unit = +d.unit; if (st.start != null && pickUnit(st.res, st.unit, st.date, st.start, st.end) < 0) { st.start = st.end = null; st.pending = false; } renderBooking(); }
    else if (d.date) { st.date = d.date; st.start = st.end = null; st.pending = false; renderBooking(); }
    else if (d.h) clickSlot(+d.h);
    else if (d.g) { const [lo, hi] = RES[st.res].guests; st.guests = Math.min(hi, Math.max(lo, st.guests + +d.g)); $('#guests').textContent = st.guests; renderSummary(); }
    else if (d.copy) copy(d.copy);
    else if ('myref' in d) openCabinet();
    else if (d.join) join(d.join);
    else if (d.leave) { leave(d.leave); if (!modal.hidden) openCabinet(); }
    else if (d.cancel) { cancelBooking(d.cancel); if (!modal.hidden) (admOk && $('#admDate') ? openAdmin() : openCabinet()); }
    else if (d.came) { const b = db.bookings.find((x) => x.id === d.came); if (b) { b.status = 'came'; save(); openAdmin(); } }
  });
  $('#dayMode').addEventListener('change', (e) => { st.dayMode = e.target.checked; if (!st.dayMode) st.start = st.end = null; st.pending = false; renderSlots(); renderSummary(); });
  ['#fPromo', '#fPhone', '#fBonus'].forEach((s) => $(s).addEventListener('input', renderSummary));
  $('#bookForm').addEventListener('submit', submitBooking);
  $('#accountBtn').addEventListener('click', () => (me() ? openCabinet() : login(openCabinet)));
  $('#newEventBtn').addEventListener('click', newEvent);
  $('#adminLink').addEventListener('click', (e) => { e.preventDefault(); openAdmin(); });

  function route() {
    if (location.hash === '#me') openCabinet();
    else if (location.hash === '#admin') openAdmin();
  }
  window.addEventListener('hashchange', route);

  /* ---------- init ---------- */
  renderZones(); renderPrices(); renderPromos(); renderEvents(); renderBooking(); renderLive();
  syncAccount(); prefill(); route();
  setInterval(renderLive, 60e3);
})();
