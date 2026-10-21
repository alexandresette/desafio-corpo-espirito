// Desafio Corpo e Espírito · GC Samambaia · Lagoinha Valinhos
(() => {
  'use strict';
  // versão deste arquivo (app.js?v=N), usada pra se atualizar sozinho
  const MY_V = ((document.currentScript && /[?&]v=(\d+)/.exec(document.currentScript.src)) || [])[1] || null;
  // rascunhos que sobrevivem se a tela for recriada (ex.: voltar da galeria)
  const DRAFT = { signup: null, treino: null, nome: '' };

  // ---------- regras do desafio ----------
  const TZ = 'America/Sao_Paulo';
  const START = '2026-10-19';
  const TOTAL_DAYS = 28;
  const MIN_MINUTES = 30;
  const ACTIVITIES = ['Caminhada', 'Corrida', 'Academia', 'Outro'];
  const DOUBLES = { 6: [6, 7], 13: [14, 15], 20: [22, 23] };
  const PLAN = (() => {
    const plan = [];
    let ch = 1;
    for (let d = 1; d <= TOTAL_DAYS; d++) {
      if (DOUBLES[d]) { plan.push(DOUBLES[d]); ch += 2; } else { plan.push([ch]); ch++; }
    }
    return plan;
  })();
  const nviUrl = (ch) => `https://www.bible.com/pt/bible/129/PRO.${ch}.NVI`;
  // Texto: Bíblia Livre (BLIVRE), CC BY 4.0
  let PROV = null;
  const loadProv = async () => { if (!PROV) PROV = await fetch('proverbios.json?v=1').then((r) => r.json()); return PROV; };

  // ---------- datas ----------
  const todayStr = () => new Date().toLocaleDateString('sv-SE', { timeZone: TZ });
  const toUTC = (s) => { const [y, m, d] = s.split('-').map(Number); return Date.UTC(y, m - 1, d); };
  const todayIdx = () => Math.round((toUTC(todayStr()) - toUTC(START)) / 86400000) + 1;
  const dateOf = (day) => new Date(toUTC(START) + (day - 1) * 86400000);
  const WEEK = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  const dayLabel = (day) => { const d = dateOf(day); return `${WEEK[d.getUTCDay()]}, ${d.getUTCDate()}/${MONTHS[d.getUTCMonth()]}`; };
  const shortDate = (day) => { const d = dateOf(day); return `${d.getUTCDate()}/${MONTHS[d.getUTCMonth()]}`; };
  const chaptersLabel = (day) => { const c = PLAN[day - 1]; return c.length > 1 ? `Provérbios ${c[0]} e ${c[1]}` : `Provérbios ${c[0]}`; };
  // vale marcar o dia de hoje e o de ontem
  const canMark = (day) => { const t = todayIdx(); return day >= 1 && day <= TOTAL_DAYS && (day === t || day === t - 1); };
  const currentDay = () => Math.min(Math.max(todayIdx(), 1), TOTAL_DAYS);

  // ---------- util ----------
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const app = $('#app');
  const toast = (msg) => { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 2600); };
  const sha256 = async (txt) => { const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(txt)); return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join(''); };
  const pinHash = (id, pin) => sha256(`desafio-samambaia:${id}:${pin}`);
  const onlyDigits = (el) => el.addEventListener('input', () => { el.value = el.value.replace(/\D/g, '').slice(0, 4); });
  const timeAgo = (iso) => {
    const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
    if (m < 1) return 'agora';
    if (m < 60) return `${m} min`;
    const h = Math.round(m / 60);
    if (h < 24) return `${h} h`;
    return `${Math.round(h / 24)} d`;
  };
  const avatar = (p, size = 40) => p && p.photo_url
    ? `<img class="av" src="${esc(p.photo_url)}" alt="" width="${size}" height="${size}" style="width:${size}px;height:${size}px" loading="lazy">`
    : `<span class="av" style="width:${size}px;height:${size}px;display:inline-block"></span>`;
  const ICON = {
    back: '<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>',
    book: '<svg aria-hidden="true" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#F6F1E6" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 5h6a4 4 0 0 1 4 4v11a3 3 0 0 0-3-3H2z"/><path d="M22 5h-6a4 4 0 0 0-4 4v11a3 3 0 0 1 3-3h7z"/></svg>',
    shoe: '<svg aria-hidden="true" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#F6F1E6" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 16h14a4 4 0 0 0 4-4l-5-1-3-5-3 1 1 3-4 1-4-2z"/><path d="M3 16v2h18"/></svg>',
    check: '<svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#232B1C" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
    cam: '<svg aria-hidden="true" width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#2F3A26" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>',
    send: '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#232B1C" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    out: '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6"/></svg>',
    heart: '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>',
    next: '<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>',
    share: '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3M7 8l5-5 5 5"/><path d="M5 12v8h14v-8"/></svg>',
    x: '<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>'
  };

  // reduz a foto antes de subir (máx 1080px, jpeg)
  // Tenta, em ordem: createImageBitmap, <img>, conversão de HEIC. Se nada abrir,
  // devolve o arquivo original pra pessoa não ficar travada.
  const isHeic = (f) => !f.type || /hei[cf]/i.test(f.type) || /\.hei[cf]$/i.test(f.name || '');
  const decodeImg = async (file) => {
    if (window.createImageBitmap) {
      try { return await createImageBitmap(file); } catch { /* tenta pelo <img> */ }
    }
    return new Promise((res, rej) => {
      const img = new Image(); const url = URL.createObjectURL(file);
      const t = setTimeout(() => rej(new Error('timeout')), 15000);
      img.onload = () => { clearTimeout(t); res(img); };
      img.onerror = () => { clearTimeout(t); URL.revokeObjectURL(url); rej(new Error('decode')); };
      img.src = url;
    });
  };
  let heicLib = null;
  const loadHeic = () => heicLib || (heicLib = new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js';
    s.onload = () => res(window.heic2any); s.onerror = () => { heicLib = null; rej(new Error('heic')); };
    document.head.appendChild(s);
  }));
  const canvasToBlob = (c) => new Promise((res) => c.toBlob((b) => {
    if (b) return res(b);
    const d = c.toDataURL('image/jpeg', 0.82).split(',')[1], bin = atob(d), u8 = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    res(new Blob([u8], { type: 'image/jpeg' }));
  }, 'image/jpeg', 0.82));
  const decodeAny = async (file) => {
    try { return await decodeImg(file); } catch {
      if (isHeic(file)) {
        try {
          const conv = await (await loadHeic())({ blob: file, toType: 'image/jpeg', quality: 0.85 });
          return await decodeImg(Array.isArray(conv) ? conv[0] : conv);
        } catch { /* cai no original */ }
      }
    }
    return null;
  };
  // reduz fotos enormes antes do enquadramento, pra arrastar sem travar
  const limitSize = (src, max = 2000) => {
    const k = Math.min(1, max / Math.max(src.width, src.height));
    if (k === 1) return src;
    const c = document.createElement('canvas');
    c.width = Math.round(src.width * k); c.height = Math.round(src.height * k);
    c.getContext('2d').drawImage(src, 0, 0, c.width, c.height);
    if (src.close) src.close();
    return c;
  };
  // tela de enquadramento: arrastar, zoom por controle ou pinça
  function cropImage(src, { aspect = 1, round = false, outW = 600 } = {}) {
    return new Promise((resolve) => {
      const iw = src.width, ih = src.height;
      const m = document.createElement('div'); m.className = 'cropper';
      m.innerHTML = `<div class="crop-box">
        <div class="crop-title">Ajuste a foto</div>
        <div class="crop-view${round ? ' round' : ''}"><canvas></canvas></div>
        <div class="small center">Arraste pra enquadrar. Use o controle ou dois dedos pra dar zoom.</div>
        <input type="range" class="crop-zoom" min="1" max="4" step="0.01" value="1" aria-label="Zoom">
        <div class="row"><button class="btn outline crop-cancel" type="button">Cancelar</button><button class="btn crop-ok" type="button">Usar foto</button></div>
      </div>`;
      document.body.appendChild(m);
      const view = m.querySelector('.crop-view'), cv = m.querySelector('canvas'), zoomEl = m.querySelector('.crop-zoom');
      const vw = Math.min(window.innerWidth - 64, 320), vh = Math.round(vw / aspect);
      view.style.width = vw + 'px'; view.style.height = vh + 'px';
      const dpr = window.devicePixelRatio || 1;
      cv.width = Math.round(vw * dpr); cv.height = Math.round(vh * dpr); cv.style.width = vw + 'px'; cv.style.height = vh + 'px';
      const g = cv.getContext('2d');
      const base = Math.max(vw / iw, vh / ih);
      let z = 1, cx = iw / 2, cy = ih / 2;
      const clamp = () => {
        const sc = base * z, hw = vw / 2 / sc, hh = vh / 2 / sc;
        cx = Math.min(Math.max(cx, hw), iw - hw); cy = Math.min(Math.max(cy, hh), ih - hh);
      };
      const draw = (ctx, W, H, k) => {
        const sc = base * z * k;
        ctx.fillStyle = '#EEE7D8'; ctx.fillRect(0, 0, W, H);
        ctx.drawImage(src, W / 2 - cx * sc, H / 2 - cy * sc, iw * sc, ih * sc);
      };
      const paint = () => { clamp(); draw(g, cv.width, cv.height, dpr); };
      paint();
      const pts = new Map(); let pinch0 = null;
      view.addEventListener('pointerdown', (e) => {
        view.setPointerCapture(e.pointerId); pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch0 = { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, z }; }
      });
      view.addEventListener('pointermove', (e) => {
        if (!pts.has(e.pointerId)) return;
        const p0 = pts.get(e.pointerId), dx = e.clientX - p0.x, dy = e.clientY - p0.y;
        pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (pts.size === 2 && pinch0) {
          const [a, b] = [...pts.values()];
          z = Math.min(4, Math.max(1, pinch0.z * Math.hypot(a.x - b.x, a.y - b.y) / pinch0.d)); zoomEl.value = z;
        } else if (pts.size === 1) { const sc = base * z; cx -= dx / sc; cy -= dy / sc; }
        paint();
      });
      const up = (e) => { pts.delete(e.pointerId); if (pts.size < 2) pinch0 = null; };
      view.addEventListener('pointerup', up); view.addEventListener('pointercancel', up);
      zoomEl.addEventListener('input', () => { z = Number(zoomEl.value); paint(); });
      const done = (b) => { m.remove(); resolve(b); };
      m.querySelector('.crop-cancel').onclick = () => done(null);
      m.querySelector('.crop-ok').onclick = async () => {
        const oh = Math.round(outW / aspect), c = document.createElement('canvas');
        c.width = outW; c.height = oh; draw(c.getContext('2d'), outW, oh, outW / vw);
        done(await canvasToBlob(c));
      };
    });
  }
  // escolhe, enquadra e devolve { blob, original } ou null se a pessoa cancelar
  const pickPhoto = async (file, crop) => {
    let src = await decodeAny(file);
    if (!src) {
      if (file.size > 12 * 1024 * 1024) throw new Error('Essa foto é grande demais. Tenta outra, ou tira um print dela e escolhe o print.');
      return { blob: file, original: true };
    }
    src = limitSize(src);
    const blob = await cropImage(src, crop);
    if (src.close) src.close();
    return blob ? { blob, original: false } : null;
  };
  const photoPreview = (r) => r.original
    ? '<span style="display:flex;flex-direction:column;align-items:center;gap:4px;font-size:13px;font-weight:700;color:var(--olive)">' + ICON.check.replace('#232B1C', '#2F3A26') + 'Foto escolhida</span>'
    : `<img src="${URL.createObjectURL(r.blob)}" alt="Foto escolhida">`;

  // ---------- dados ----------
  const cfg = window.CONFIG || {};
  if (!cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY) {
    app.classList.add('no-tabs');
    app.innerHTML = '<div class="stack" style="padding-top:60px"><h1 style="font-size:40px">DESAFIO CORPO E ESPÍRITO</h1><p class="sub">O app está quase no ar. Falta configurar o banco de dados (config.js).</p></div>';
    return;
  }
  const db = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
  const S = { people: [], checkins: [], comments: [], loaded: false };
  const meId = () => { try { return localStorage.getItem('desafio_me'); } catch { return null; } };
  const setMe = (id) => { try { id ? localStorage.setItem('desafio_me', id) : localStorage.removeItem('desafio_me'); } catch { /* sem storage */ } };
  const me = () => S.people.find((p) => p.id === meId());
  const person = (id) => S.people.find((p) => p.id === id);

  async function load() {
    const [p, c, m, l, tl] = await Promise.all([
      db.from('participants').select('id,name,photo_url,pin_hash,created_at').order('created_at'),
      db.from('checkins').select('*').order('created_at', { ascending: false }),
      db.from('comments').select('*').order('created_at'),
      db.from('likes').select('comment_id,participant_id'),
      db.from('checkin_likes').select('checkin_id,participant_id')
    ]);
    const err = p.error || c.error || m.error;
    if (err) throw err;
    S.people = p.data; S.checkins = c.data; S.comments = m.data; S.likes = l.error ? [] : l.data; S.tlikes = tl.error ? [] : tl.data; S.loaded = true;
  }

  // ---------- curtidas (comentários: data-like, treinos: data-tlike) ----------
  const LK = {
    c: { attr: 'like', key: 'comment_id', table: 'likes', what: 'comentário', get: () => S.likes || [], set: (v) => { S.likes = v; } },
    t: { attr: 'tlike', key: 'checkin_id', table: 'checkin_likes', what: 'treino', get: () => S.tlikes || [], set: (v) => { S.tlikes = v; } }
  };
  const likesOfK = (k, id) => LK[k].get().filter((x) => x[LK[k].key] === id);
  const likesOf = (cid) => likesOfK('c', cid);
  const likedByMeK = (k, id) => likesOfK(k, id).some((x) => x.participant_id === meId());
  const likeBtnK = (k, id) => {
    const n = likesOfK(k, id).length, on = likedByMeK(k, id);
    return `<button class="like${on ? ' on' : ''}" type="button" data-${LK[k].attr}="${id}" aria-pressed="${on}" aria-label="${on ? 'Descurtir' : 'Curtir'} ${LK[k].what}">${ICON.heart}<span>${n || ''}</span></button>`;
  };
  const likeBtn = (cid) => likeBtnK('c', cid);
  const treinoLike = (id) => likeBtnK('t', id);
  // comentário mais curtido do dia (empate: o mais antigo)
  const topComment = (day) => S.comments.filter((c) => c.day === day)
    .map((c) => ({ c, n: likesOf(c.id).length }))
    .sort((a, b) => b.n - a.n || new Date(a.c.created_at) - new Date(b.c.created_at))[0] || null;
  document.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-like],[data-tlike]'); if (!b) return;
    e.preventDefault(); e.stopPropagation();
    const mid = meId(); if (!mid) return;
    const k = b.dataset.tlike ? 't' : 'c', L = LK[k], id = b.dataset[L.attr], on = likedByMeK(k, id);
    const row = { [L.key]: id, participant_id: mid };
    const drop = () => L.set(L.get().filter((x) => !(x[L.key] === id && x.participant_id === mid)));
    const add = () => L.set([...L.get(), row]);
    const paint = () => $$(`[data-${L.attr}="${id}"]`).forEach((el) => { el.outerHTML = likeBtnK(k, id); });
    on ? drop() : add(); paint();
    const { error } = on ? await db.from(L.table).delete().match(row) : await db.from(L.table).insert(row);
    if (error && error.code !== '23505') { on ? add() : drop(); paint(); toast('Não deu pra curtir agora.'); }
  });

  async function uploadPhoto(blob, folder) {
    const type = blob.type || 'image/jpeg';
    const ext = (type.split('/')[1] || 'jpg').replace('jpeg', 'jpg').replace(/[^a-z0-9]/g, '') || 'jpg';
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await db.storage.from('fotos').upload(path, blob, { contentType: type, upsert: false });
    if (error) throw error;
    return db.storage.from('fotos').getPublicUrl(path).data.publicUrl;
  }

  const has = (pid, day, kind) => S.checkins.find((c) => c.participant_id === pid && c.day === day && c.kind === kind);
  const fullDay = (pid, day) => has(pid, day, 'leitura') && has(pid, day, 'treino');

  function scoreOf(pid) {
    const mine = S.checkins.filter((c) => c.participant_id === pid);
    const leituras = mine.filter((c) => c.kind === 'leitura').length;
    const treinos = mine.filter((c) => c.kind === 'treino').length;
    let full = 0;
    for (let d = 1; d <= TOTAL_DAYS; d++) if (fullDay(pid, d)) full++;
    // sequência: dias completos seguidos até hoje (ou até ontem, se hoje ainda está aberto)
    let streak = 0;
    let d = Math.min(todayIdx(), TOTAL_DAYS);
    if (d >= 1 && !fullDay(pid, d)) d--;
    while (d >= 1 && fullDay(pid, d)) { streak++; d--; }
    // quando chegou na pontuação atual: horário do último check-in (sem pontos = fim da fila)
    const reachedAt = mine.length ? Math.max(...mine.map((c) => new Date(c.created_at).getTime())) : Infinity;
    return { pid, total: leituras + treinos, leituras, treinos, full, streak, reachedAt };
  }
  function ranking() {
    return S.people.map((p) => scoreOf(p.id)).sort((a, b) => b.total - a.total || a.reachedAt - b.reachedAt);
  }

  // ---------- telas ----------
  const routes = {};
  const route = (name, fn) => { routes[name] = fn; };
  const go = (h) => { if (location.hash === h) render(); else location.hash = h; };

  function shell(withTabs, tab) {
    $('#tabs').hidden = !withTabs;
    app.classList.toggle('no-tabs', !withTabs);
    $$('#tabs a').forEach((a) => a.classList.toggle('on', a.dataset.tab === tab));
  }

  // --- entrar ---
  route('entrar', () => {
    shell(false);
    let picked = null;
    app.innerHTML = `
      <div class="stack" style="padding-top:44px;gap:22px">
        <div class="stack" style="gap:8px">
          <div class="kicker">GC Samambaia · Lagoinha Valinhos</div>
          <h1 style="font-size:54px">DESAFIO CORPO E ESPÍRITO</h1>
          <div class="sub">19/out a 15/nov · Provérbios + 30 min de exercício por dia</div>
        </div>
        <a class="btn" href="#/cadastro">Primeira vez? Criar meu acesso</a>
        ${S.people.length ? `
        <div class="row small"><span class="grow" style="height:1px;background:var(--line-2)"></span>já participo<span class="grow" style="height:1px;background:var(--line-2)"></span></div>
        <div class="stack" style="gap:10px">
          <div class="section-title" style="font-size:15px;margin:0">Toque na sua foto</div>
          <div class="people-grid">${S.people.map((p) => `<button class="person" data-id="${p.id}">${avatar(p, 52)}<span>${esc(p.name)}</span></button>`).join('')}</div>
        </div>
        <div id="pinBox" hidden>
          <label class="lbl" for="pin" id="pinLbl">PIN</label>
          <input class="input pin" id="pin" type="password" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" autocomplete="off" placeholder="••••">
          <div class="err" id="pinErr" hidden>PIN errado. Tenta de novo.</div>
          <div style="height:12px"></div>
          <button class="btn outline" id="enter" disabled>Entrar</button>
        </div>
        <button class="link-btn" id="forgot">Esqueci meu PIN</button>` : ''}
      </div>`;
    $$('.person').forEach((b) => b.onclick = () => {
      picked = person(b.dataset.id);
      $$('.person').forEach((x) => x.classList.toggle('on', x === b));
      $('#pinBox').hidden = false;
      $('#pinLbl').textContent = `PIN de ${picked.name}`;
      $('#pin').value = ''; $('#pinErr').hidden = true;
      $('#pin').focus();
    });
    const pin = $('#pin');
    if (!pin) return;
    onlyDigits(pin);
    const tryEnter = async () => {
      if (!picked || pin.value.length !== 4) return;
      const h = await pinHash(picked.id, pin.value);
      if (h === picked.pin_hash) { setMe(picked.id); go('#/hoje'); }
      else { $('#pinErr').hidden = false; pin.classList.add('bad'); pin.value = ''; }
    };
    pin.addEventListener('input', () => { $('#enter').disabled = pin.value.length !== 4; pin.classList.remove('bad'); if (pin.value.length === 4) tryEnter(); });
    $('#enter').onclick = tryEnter;
    $('#forgot').onclick = () => go('#/trocar-pin');
  });

  // --- cadastro ---
  route('cadastro', () => {
    shell(false);
    app.innerHTML = `
      <div class="top"><a class="icon-btn" href="#/entrar" aria-label="Voltar">${ICON.back}</a><h1>CRIAR MEU ACESSO</h1></div>
      <div class="stack" style="gap:16px;padding-top:6px">
        <div class="stack center" style="gap:8px">
          <button class="photo-pick" id="pick" aria-label="Adicionar sua foto">${ICON.cam}<span class="plus">+</span></button>
          <input type="file" id="file" accept="image/*" hidden>
          <div class="err" id="photoErr" hidden></div>
          <div style="font-size:14px;font-weight:700">Sua foto <span style="color:var(--err)">(obrigatória)</span></div>
          <div class="small" style="margin-top:-6px">Ela aparece no ranking e no calendário</div>
        </div>
        <div><label class="lbl" for="nome">Primeiro nome</label><input class="input" id="nome" maxlength="20" autocomplete="given-name" placeholder="Como o GC te chama"></div>
        <div><label class="lbl" for="p1">Crie um PIN de 4 números</label><input class="input pin" id="p1" type="password" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" autocomplete="new-password" placeholder="••••"></div>
        <div><label class="lbl" for="p2">Confirme o PIN</label><input class="input pin" id="p2" type="password" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" autocomplete="new-password" placeholder="••••"><div class="err" id="mismatch" hidden>Os dois PINs estão diferentes. Tenta de novo.</div></div>
        <button class="btn" id="save" disabled>Entrar no desafio</button>
        <div class="small center" id="missing">Falta: foto, nome e PIN.</div>
        <div class="small center">Se a galeria não abrir, abra o link direto no Chrome ou no Safari, fora do WhatsApp.</div>
      </div>`;
    const nome = $('#nome'), p1 = $('#p1'), p2 = $('#p2'), save = $('#save');
    onlyDigits(p1); onlyDigits(p2);
    if (DRAFT.signup) $('#pick').innerHTML = DRAFT.signup.prev + '<span class="plus">+</span>';
    if (DRAFT.nome) nome.value = DRAFT.nome;
    nome.addEventListener('input', () => { DRAFT.nome = nome.value; });
    const check = () => {
      const blob = DRAFT.signup && DRAFT.signup.blob;
      const mismatch = p2.value.length === 4 && p1.value !== p2.value;
      $('#mismatch').hidden = !mismatch; p2.classList.toggle('bad', mismatch);
      const falta = [];
      if (!blob) falta.push('foto');
      if (!nome.value.trim()) falta.push('nome');
      if (p1.value.length !== 4) falta.push('PIN');
      else if (p1.value !== p2.value) falta.push('confirmar o PIN');
      save.disabled = falta.length > 0;
      $('#missing').textContent = falta.length ? `Falta: ${falta.join(', ').replace(/, ([^,]*)$/, ' e $1')}.` : 'Tudo certo, pode entrar.';
    };
    [nome, p1, p2].forEach((el) => el.addEventListener('input', check));
    DRAFT.recheck = check; check();
    $('#pick').onclick = () => $('#file').click();
    $('#file').onchange = async (e) => {
      const f = e.target.files && e.target.files[0]; e.target.value = ''; if (!f) return;
      $('#photoErr').hidden = true;
      $('#pick').innerHTML = '<span class="small">Abrindo…</span>';
      try {
        const r = await pickPhoto(f, { aspect: 1, round: true, outW: 600 });
        if (r) DRAFT.signup = { blob: r.blob, prev: photoPreview(r) };
      } catch (err) {
        const pe = $('#photoErr'); if (pe) { pe.textContent = err.message; pe.hidden = false; }
      }
      // sempre pinta a tela atual, mesmo que ela tenha sido recriada nesse meio tempo
      const pk = $('#pick');
      if (pk) pk.innerHTML = (DRAFT.signup ? DRAFT.signup.prev : ICON.cam) + '<span class="plus">+</span>';
      if (DRAFT.recheck) DRAFT.recheck();
    };
    save.onclick = async () => {
      const name = nome.value.trim();
      if (S.people.some((p) => p.name.toLowerCase() === name.toLowerCase())) { toast(`Já tem um ${name} no desafio. Use o sobrenome junto.`); return; }
      save.disabled = true; save.textContent = 'Criando…';
      try {
        const id = (crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (ch) => {
          const r = (crypto.getRandomValues(new Uint8Array(1))[0] & 15); return (ch === 'x' ? r : (r & 3) | 8).toString(16);
        }));
        const photo_url = await uploadPhoto(DRAFT.signup.blob, 'perfil');
        const pin_hash = await pinHash(id, p1.value);
        const { error } = await db.from('participants').insert({ id, name, photo_url, pin_hash });
        if (error) throw error;
        setMe(id); DRAFT.signup = null; DRAFT.nome = '';
        await load();
        toast(`Bem-vindo, ${name}!`);
        go('#/hoje');
      } catch (err) {
        console.error(err);
        $('#missing').textContent = 'Não deu pra criar agora. Confere a internet e tenta de novo.' + (err && err.message ? ` (${err.message})` : '');
        save.disabled = false; save.textContent = 'Entrar no desafio';
      }
    };
  });

  // --- trocar pin ---
  route('trocar-pin', () => {
    shell(false);
    let picked = null;
    app.innerHTML = `
      <div class="top"><a class="icon-btn" href="#/entrar" aria-label="Voltar">${ICON.back}</a><h1>TROCAR MEU PIN</h1></div>
      <div class="stack" style="gap:16px;padding-top:6px">
        <div class="section-title" style="font-size:15px;margin:0">1. Toque na sua foto</div>
        <div class="people-grid">${S.people.map((p) => `<button class="person" data-id="${p.id}">${avatar(p, 46)}<span>${esc(p.name)}</span></button>`).join('')}</div>
        <div><label class="lbl" for="n1">2. Crie um PIN novo</label><input class="input pin" id="n1" type="password" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" autocomplete="new-password" placeholder="••••"></div>
        <div><label class="lbl" for="n2">Confirme o PIN novo</label><input class="input pin" id="n2" type="password" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" autocomplete="new-password" placeholder="••••"><div class="err" id="mismatch" hidden>Os dois PINs estão diferentes.</div></div>
        <button class="btn" id="save" disabled>Salvar e entrar</button>
        <div class="small center">Seus pontos e check-ins continuam todos aí.</div>
      </div>`;
    const n1 = $('#n1'), n2 = $('#n2'), save = $('#save');
    onlyDigits(n1); onlyDigits(n2);
    const check = () => {
      const mismatch = n2.value.length === 4 && n1.value !== n2.value;
      $('#mismatch').hidden = !mismatch; n2.classList.toggle('bad', mismatch);
      save.disabled = !(picked && n1.value.length === 4 && n1.value === n2.value);
    };
    [n1, n2].forEach((el) => el.addEventListener('input', check));
    $$('.person').forEach((b) => b.onclick = () => { picked = person(b.dataset.id); $$('.person').forEach((x) => x.classList.toggle('on', x === b)); check(); });
    save.onclick = async () => {
      save.disabled = true;
      try {
        const pin_hash = await pinHash(picked.id, n1.value);
        const { error } = await db.from('participants').update({ pin_hash }).eq('id', picked.id);
        if (error) throw error;
        picked.pin_hash = pin_hash; setMe(picked.id);
        toast('PIN trocado.'); go('#/hoje');
      } catch (err) { console.error(err); toast('Não deu pra salvar. Tenta de novo.'); save.disabled = false; }
    };
  });

  // --- dicas da nutri (dicas.js) ---
  const nutri = () => S.people.find((p) => /^jake/i.test(String(p.name).normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()));
  const dicasAte = (day) => (window.DICAS || []).filter((d) => d.dia <= day).sort((a, b) => b.dia - a.dia);
  const dicaCard = (d, destaque) => `
      <article class="dica${destaque ? ' nova' : ''}">
        <div class="dica-top">${avatar(nutri(), destaque ? 40 : 32)}<div class="grow"><div class="dica-quem">Nutri Jake</div><div class="small">${destaque ? 'Dica de hoje' : `Dia ${d.dia} · ${shortDate(d.dia)}`}</div></div></div>
        <div class="dica-tit">${esc(d.titulo)}</div>
        <p class="dica-txt">${esc(d.texto)}</p>
      </article>`;
  // --- hoje ---
  function taskCards(day, pid) {
    const l = has(pid, day, 'leitura'), t = has(pid, day, 'treino');
    const c = PLAN[day - 1];
    return `
      <a class="task ${l ? 'done' : ''}" href="#/leitura/${day}">
        <div class="ic">${l ? ICON.check : ICON.book}</div>
        <div class="grow"><div class="t1">ESPÍRITO · ${l ? 'FEITO' : '1 PONTO'}</div><div class="t2">${chaptersLabel(day)}</div><div class="t3">${l ? 'Leitura marcada. Toque pra ver a conversa.' : (c.length > 1 ? 'Dia de capítulo duplo' : 'Toque pra ler aqui no app')}</div></div>
        ${l ? '' : '<div class="go">Ler</div>'}
      </a>
      <a class="task ${t ? 'done' : ''}" href="#/treino/${day}">
        <div class="ic">${t ? ICON.check : ICON.shoe}</div>
        <div class="grow"><div class="t1">CORPO · ${t ? 'FEITO' : '1 PONTO'}</div><div class="t2">${t ? `${esc(t.activity)} · ${t.minutes} min` : `${MIN_MINUTES} min de exercício`}</div><div class="t3">${t ? 'Check-in com foto' : 'Caminhada, corrida, academia…'}</div></div>
        ${t ? '' : '<div class="go">Check-in</div>'}
      </a>`;
  }
  route('hoje', () => {
    shell(true, 'hoje');
    const m = me();
    const t = todayIdx();
    const sc = scoreOf(m.id);
    const pos = ranking().findIndex((r) => r.pid === m.id) + 1;
    let head, body = '';
    if (t < 1) {
      head = `<div class="sub" style="font-weight:600">Começa ${t === 0 ? 'amanhã' : `em ${1 - t} dias`}, segunda 19/out</div><h1 style="font-size:38px">QUASE LÁ</h1>`;
      body = `<div class="card stack" style="gap:8px"><div style="font-weight:700">Você já está dentro, ${esc(m.name)}.</div><div class="sub">Amanhã aparecem aqui as duas tarefas do dia: ${chaptersLabel(1)} e ${MIN_MINUTES} min de exercício. Salve este app na tela inicial do celular pra achar fácil.</div></div>`;
    } else if (t > TOTAL_DAYS) {
      head = `<div class="sub" style="font-weight:600">Desafio encerrado em 15/nov</div><h1 style="font-size:38px">CHEGAMOS</h1>`;
      body = `<div class="card stack" style="gap:8px"><div style="font-weight:700">Você fez ${sc.total} de ${TOTAL_DAYS * 2} pontos.</div><a class="btn" href="#/ranking">Ver o ranking final</a></div>`;
    } else {
      head = `<div class="sub" style="font-weight:600">${dayLabel(t)}</div><h1 style="font-size:36px">DIA ${t} DE ${TOTAL_DAYS}</h1>`;
      const y = t - 1;
      const yPending = y >= 1 && (!has(m.id, y, 'leitura') || !has(m.id, y, 'treino'));
      const done = S.people.filter((p) => fullDay(p.id, t)).length;
      body = `
        <div class="section-title">Suas tarefas de hoje</div>
        ${taskCards(t, m.id)}
        ${yPending ? `<a class="pending" href="#/dia/${y}" style="text-decoration:none;color:var(--ink)"><b>Ontem ficou faltando.</b> Ainda dá tempo de marcar até meia-noite.</a>` : ''}
        <div class="card stack" style="gap:12px">
          <div class="row"><div class="grow" style="font-weight:700">Hoje no GC</div><div class="small">${done} de ${S.people.length} fecharam o dia</div></div>
          <div class="row" style="flex-wrap:wrap;gap:8px">${S.people.map((p) => {
            const f = fullDay(p.id, t);
            return `<span title="${esc(p.name)}" style="border-radius:50%;outline:2.5px solid ${f ? 'var(--gold)' : 'transparent'};outline-offset:2px;${f ? '' : 'opacity:.45'}">${avatar(p, 34)}</span>`;
          }).join('')}</div>
        </div>
        ${(() => { const d = dicasAte(t)[0]; return d ? `<div class="section-title">Dicas da Nutri</div>${dicaCard(d, true).replace('<article', '<a href="#/nutri"').replace('</article>', '<span class="dica-mais">Ver todas as dicas</span></a>')}` : ''; })()}`;
    }
    app.innerHTML = `
      <div class="stack" style="padding-top:22px">
        <div class="row"><div class="grow stack" style="gap:4px">${head}</div>
          <button class="icon-btn" id="profile" aria-label="Minha conta" style="margin:0">${avatar(m, 44)}</button></div>
        <div class="progress" aria-label="Progresso do desafio"><div style="width:${Math.max(0, Math.min(100, (t / TOTAL_DAYS) * 100))}%"></div></div>
        <div class="stats">
          <div class="stat"><b>${sc.total}</b><span>pontos</span></div>
          <div class="stat"><b>${sc.streak}</b><span>dias seguidos</span></div>
          <div class="stat"><b>${pos}º</b><span>no ranking</span></div>
        </div>
        ${body}
      </div>`;
    $('#profile').onclick = openProfile;
  });

  // --- mural da nutri ---
  route('nutri', () => {
    shell(true, 'nutri');
    const lista = dicasAte(currentDay());
    const n = nutri();
    app.innerHTML = `
      <div class="stack" style="padding-top:22px">
        <div class="row" style="gap:14px">${avatar(n, 56)}<div class="grow stack" style="gap:2px"><h1 style="font-size:34px">NUTRI JAKE</h1><div class="sub">Uma dica nova por dia pra cuidar do corpo</div></div></div>
        ${lista.length ? lista.map((d, i) => dicaCard(d, i === 0 && d.dia === todayIdx())).join('') : '<div class="card sub">A primeira dica chega em breve.</div>'}
      </div>`;
  });

  // --- dia (atalho pra marcar ontem) ---
  route('dia', (day) => {
    shell(true, 'hoje');
    day = Number(day);
    app.innerHTML = `
      <div class="top"><a class="icon-btn" href="#/hoje" aria-label="Voltar">${ICON.back}</a><h1>DIA ${day} · ${shortDate(day).toUpperCase()}</h1></div>
      <div class="stack" style="padding-top:6px">${taskCards(day, me().id)}</div>`;
  });

  // --- leitura ---
  route('leitura', (day) => {
    shell(true, 'hoje');
    day = Number(day) || currentDay();
    const m = me();
    const done = has(m.id, day, 'leitura');
    const open = canMark(day);
    const chs = PLAN[day - 1];
    const thread = S.comments.filter((c) => c.day === day);
    app.innerHTML = `
      <div class="top"><a class="icon-btn" href="#/hoje" aria-label="Voltar">${ICON.back}</a>
        <div class="grow"><div class="kicker">DIA ${day} · ${dayLabel(day).toUpperCase()}${chs.length > 1 ? ' · DUPLO' : ''}</div><div style="font-size:18px;font-weight:700">${chaptersLabel(day)}</div></div></div>
      <div class="stack" style="padding-top:8px">
        <article class="texto" id="texto"><div class="small">Carregando o capítulo…</div></article>
        <div class="fonte">Texto: Bíblia Livre (BLIVRE), CC BY 4.0 · Prefere a NVI? ${chs.map((c) => `<a href="${nviUrl(c)}" target="_blank" rel="noopener">Provérbios ${c}</a>`).join(' e ')}</div>
        ${done
          ? `<div class="card row" style="background:var(--olive);color:var(--cream)"><span style="width:36px;height:36px;border-radius:50%;background:var(--gold);display:flex;align-items:center;justify-content:center">${ICON.check}</span><div class="grow" style="font-weight:700">Leitura marcada</div></div>`
          : open
            ? `<button class="btn" id="markRead">${chs.length > 1 ? 'Li os dois capítulos' : 'Li o capítulo'}</button>`
            : `<div class="small center">${day > todayIdx() ? 'Esse dia ainda não chegou.' : 'O prazo pra marcar esse dia já passou.'}</div>`}
        <div class="row" style="margin-top:6px"><div class="grow section-title" style="margin:0">Conversa do dia</div><div class="small">${thread.length} ${thread.length === 1 ? 'comentário' : 'comentários'}</div></div>
        <div class="stack" style="gap:10px">${thread.length ? thread.map((c) => {
          const p = person(c.participant_id);
          return `<div class="comment">${avatar(p, 32)}<div class="bubble"><b>${esc(p?.name || '?')}</b> <span class="small">· ${timeAgo(c.created_at)}</span><br>${esc(c.body)}<div class="bubble-foot">${likeBtn(c.id)}</div></div></div>`;
        }).join('') : '<div class="small">Ninguém comentou ainda. Que tal começar?</div>'}</div>
        ${day <= Math.max(todayIdx(), 0) || open ? `
        <div class="composer">
          <label class="sr" for="cm">Seu comentário</label>
          <textarea class="input grow" id="cm" rows="1" maxlength="1000" placeholder="O que falou com você hoje?"></textarea>
          <button class="send" id="send" aria-label="Enviar comentário">${ICON.send}</button>
        </div>` : ''}
      </div>`;
    const textoBox = $('#texto');
    loadProv().then((prov) => {
      const box = textoBox; if (!box || !box.isConnected || box.dataset.ready) return;
      box.dataset.ready = '1';
      box.innerHTML = chs.map((c) => `
        ${chs.length > 1 ? `<h2>Provérbios ${c}</h2>` : ''}
        <p>${(prov[c] || []).map((v, i) => `<span class="v" data-c="${c}" data-n="${i + 1}"><sup>${i + 1}</sup>${esc(v)}</span>`).join(' ')}</p>`).join('');
      setupVerseCopy(box, prov);
    }).catch(() => {
      const box = $('#texto');
      if (box) box.innerHTML = `<div class="small">Não consegui carregar o texto. Abra na NVI pelo link abaixo.</div>`;
    });
    const mark = $('#markRead');
    if (mark) mark.onclick = async () => {
      mark.disabled = true;
      const { error } = await db.from('checkins').insert({ participant_id: m.id, day, kind: 'leitura' });
      if (error && error.code !== '23505') { toast('Não deu pra marcar. Tenta de novo.'); mark.disabled = false; return; }
      await load(); toast('+1 ponto. Agora conta pra gente o que te marcou.'); render();
      setTimeout(() => $('#cm')?.focus(), 50);
    };
    const cm = $('#cm');
    if (cm) {
      // Mantém o campo visível acima do teclado enquanto o texto cresce
      const keepVisible = () => requestAnimationFrame(() => {
        const box = cm.closest('.composer') || cm;
        const vv = window.visualViewport;
        const bottom = vv ? vv.offsetTop + vv.height : window.innerHeight;
        const r = box.getBoundingClientRect();
        if (r.bottom > bottom - 12) window.scrollBy(0, r.bottom - bottom + 16);
      });
      const grow = () => { cm.style.height = 'auto'; cm.style.height = Math.min(cm.scrollHeight, 160) + 'px'; keepVisible(); };
      cm.addEventListener('input', grow);
      cm.addEventListener('focus', () => { document.body.classList.add('typing'); window.visualViewport?.addEventListener('resize', keepVisible); setTimeout(keepVisible, 300); });
      cm.addEventListener('blur', () => { document.body.classList.remove('typing'); window.visualViewport?.removeEventListener('resize', keepVisible); });
      $('#send').onclick = async () => {
        const body = cm.value.trim(); if (!body) return;
        $('#send').disabled = true;
        const { error } = await db.from('comments').insert({ participant_id: m.id, day, body });
        if (error) { toast('Não deu pra enviar.'); $('#send').disabled = false; return; }
        await load(); render();
      };
    }
  });

  // --- treino ---
  route('treino', (day) => {
    shell(true, 'hoje');
    day = Number(day) || currentDay();
    const m = me();
    const done = has(m.id, day, 'treino');
    if (done) {
      app.innerHTML = `
        <div class="top"><a class="icon-btn" href="#/hoje" aria-label="Voltar">${ICON.back}</a><h1>TREINO DO DIA ${day}</h1></div>
        <div class="post">${done.photo_url ? `<img class="ph" src="${esc(done.photo_url)}" alt="Foto do treino">` : ''}
          <div class="acts">${treinoLike(done.id)}<div class="grow"><b>${esc(done.activity)} · ${done.minutes} min</b>${done.caption ? `<br>${esc(done.caption)}` : ''}</div></div></div>`;
      return;
    }
    if (!canMark(day)) {
      app.innerHTML = `<div class="top"><a class="icon-btn" href="#/hoje" aria-label="Voltar">${ICON.back}</a><h1>TREINO</h1></div>
        <p class="sub">${day > todayIdx() ? 'Esse dia ainda não chegou.' : 'O prazo pra marcar esse dia já passou.'}</p>`;
      return;
    }
    let activity = null, minutes = MIN_MINUTES;
    if (DRAFT.treino && DRAFT.treino.day !== day) DRAFT.treino = null;
    const tblob = () => DRAFT.treino && DRAFT.treino.blob;
    app.innerHTML = `
      <div class="top"><a class="icon-btn" href="#/hoje" aria-label="Voltar">${ICON.back}</a><h1>CHECK-IN DO TREINO</h1></div>
      <div class="stack" style="padding-top:4px">
        ${day !== todayIdx() ? `<div class="pending">Marcando o dia ${day} (${shortDate(day)}).</div>` : ''}
        <button class="photo-big" id="pick">${ICON.cam}<span style="font-size:17px;font-weight:700">Tirar ou escolher foto</span><span class="small">Selfie, a esteira, o print do relógio, vale tudo</span></button>
        <input type="file" id="file" accept="image/*" hidden>
        <div class="section-title" style="font-size:15px;margin:0">O que você fez?</div>
        <div class="chips">${ACTIVITIES.map((a) => `<button class="chip" data-a="${a}">${a}</button>`).join('')}</div>
        <div class="section-title" style="font-size:15px;margin:0">Quanto tempo?</div>
        <div class="stepper"><button id="minus" aria-label="Menos 5 minutos">−</button><div><b id="min">${minutes}</b> <span class="small">min</span></div><button id="plus" aria-label="Mais 5 minutos">+</button></div>
        <div class="small" style="margin-top:-6px">Mínimo de ${MIN_MINUTES} min pra contar ponto.</div>
        <div><label class="lbl" for="cap">Legenda (opcional)</label><input class="input" id="cap" maxlength="140" placeholder="5 km no parque antes do trabalho"></div>
        <button class="btn" id="post" disabled>Postar check-in · +1 ponto</button>
      </div>`;
    const post = $('#post');
    const check = () => { post.disabled = !(tblob() && activity && minutes >= MIN_MINUTES); };
    if (DRAFT.treino) { const b0 = $('#pick'); b0.classList.toggle('has', !DRAFT.treino.original); b0.innerHTML = DRAFT.treino.prev; }
    DRAFT.recheckT = check;
    $('#pick').onclick = () => $('#file').click();
    $('#file').onchange = async (e) => {
      const f = e.target.files && e.target.files[0]; e.target.value = ''; if (!f) return;
      const b = $('#pick'); b.innerHTML = '<span class="small">Abrindo…</span>';
      try {
        const r = await pickPhoto(f, { aspect: 4 / 5, outW: 900 });
        if (r) DRAFT.treino = { day, blob: r.blob, prev: photoPreview(r), original: r.original };
        const bb = $('#pick');
        if (bb) { bb.classList.toggle('has', !!DRAFT.treino && !DRAFT.treino.original); bb.innerHTML = DRAFT.treino ? DRAFT.treino.prev : `${ICON.cam}<span style="font-size:17px;font-weight:700">Tirar ou escolher foto</span>`; }
        if (DRAFT.recheckT) DRAFT.recheckT();
      }
      catch (err) { DRAFT.treino = null; check(); b.classList.remove('has'); b.innerHTML = `${ICON.cam}<span style="font-size:15px;font-weight:700;color:var(--err);padding:0 16px;text-align:center">${esc(err.message)}</span>`; }
    };
    $$('.chip').forEach((c) => c.onclick = () => { activity = c.dataset.a; $$('.chip').forEach((x) => x.classList.toggle('on', x === c)); check(); });
    $('#minus').onclick = () => { minutes = Math.max(MIN_MINUTES, minutes - 5); $('#min').textContent = minutes; };
    $('#plus').onclick = () => { minutes = Math.min(300, minutes + 5); $('#min').textContent = minutes; };
    post.onclick = async () => {
      post.disabled = true; post.textContent = 'Enviando…';
      try {
        const photo_url = await uploadPhoto(tblob(), 'treinos');
        const { error } = await db.from('checkins').insert({ participant_id: m.id, day, kind: 'treino', activity, minutes, photo_url, caption: $('#cap').value.trim() || null });
        if (error && error.code !== '23505') throw error;
        DRAFT.treino = null;
        await load(); toast('+1 ponto. Bom treino!'); go('#/hoje');
      } catch (err) { console.error(err); toast('Não deu pra postar. Tenta de novo.'); post.disabled = false; post.textContent = 'Postar check-in · +1 ponto'; }
    };
  });

  // --- mural ---
  route('mural', (arg) => {
    shell(true, 'mural');
    const maxDay = Math.max(1, Math.min(todayIdx(), TOTAL_DAYS));
    const day = Math.min(Math.max(Number(arg) || maxDay, 1), maxDay);
    const treinos = S.checkins.filter((c) => c.kind === 'treino' && c.day === day)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const coments = S.comments.filter((c) => c.day === day)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const top = topComment(day);
    const comFotos = treinos.filter((t) => t.photo_url).length;
    const arrow = (d, label, icon, ok) => ok
      ? `<a class="icon-btn" href="#/mural/${d}" aria-label="${label}" style="margin:0">${icon}</a>`
      : `<span class="icon-btn off" aria-hidden="true" style="margin:0">${icon}</span>`;
    const comentCard = (c, destaque) => {
      const p = person(c.participant_id);
      return `<div class="card comment-card${destaque ? ' destaque' : ''}">
        ${destaque ? '<div class="kicker" style="margin-bottom:8px">COMENTÁRIO MAIS CURTIDO</div>' : ''}
        <div style="display:flex;gap:10px">${avatar(p, 36)}<div class="grow">
          <div class="row"><b class="grow">${esc(p?.name)}</b><span class="small">${timeAgo(c.created_at)}</span></div>
          <a href="#/leitura/${c.day}" class="com-body">${esc(c.body)}</a>
          <div class="bubble-foot">${likeBtn(c.id)}</div>
        </div></div></div>`;
    };
    app.innerHTML = `
      <div class="stack" style="padding-top:22px">
        <h1 style="font-size:36px">MURAL</h1>
        <div class="daybar">
          ${arrow(day - 1, 'Dia anterior', ICON.back, day > 1)}
          <div class="grow center"><div class="kicker">${day === todayIdx() ? 'HOJE · ' : ''}DIA ${day} DE ${TOTAL_DAYS}</div><b>${dayLabel(day)}</b></div>
          ${arrow(day + 1, 'Próximo dia', ICON.next, day < maxDay)}
        </div>
        ${comFotos ? `<button class="btn gold" id="shareDay" type="button">${ICON.share} Compartilhar montagem do dia</button>` : ''}
        ${top && top.n > 0 ? comentCard(top.c, true) : ''}
        <div class="section-title">Treinos <span class="small">(${treinos.length})</span></div>
        ${treinos.length ? treinos.map((it) => {
          const p = person(it.participant_id);
          return `<div class="post">
              <div class="head">${avatar(p, 36)}<div class="grow"><b>${esc(p?.name)}</b><div class="small">${esc(it.activity)} · ${it.minutes} min</div></div><span class="small">${timeAgo(it.created_at)}</span></div>
              ${it.photo_url ? `<img class="ph" src="${esc(it.photo_url)}" alt="Treino de ${esc(p?.name)}" loading="lazy">` : ''}
              <div class="acts">${treinoLike(it.id)}${it.caption ? `<div class="grow">${esc(it.caption)}</div>` : ''}</div>
            </div>`;
        }).join('') : '<div class="card sub">Ninguém postou treino nesse dia ainda.</div>'}
        <div class="section-title">Comentários da leitura <span class="small">(${coments.length})</span></div>
        <div class="small" style="margin-top:-8px">${chaptersLabel(day)} · toque no coração pra curtir</div>
        ${coments.length ? coments.map((c) => comentCard(c, false)).join('') : '<div class="card sub">Ninguém comentou a leitura desse dia ainda.</div>'}
      </div>`;
    $$('img.ph').forEach((img) => img.onclick = () => zoom(img.src));
    const sh = $('#shareDay'); if (sh) sh.onclick = () => openCollage(day, sh);
  });

  // ---------- montagem do dia ----------
  const rr = (g, x, y, w, h, r) => {
    g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
  };
  const wrap = (g, text, maxW, maxLines) => {
    const words = String(text).replace(/\s+/g, ' ').trim().split(' '), lines = [];
    let line = '';
    for (const w of words) {
      const t = line ? line + ' ' + w : w;
      if (g.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t;
    }
    if (line) lines.push(line);
    if (lines.length > maxLines) {
      const cut = lines.slice(0, maxLines); let last = cut[maxLines - 1];
      while (g.measureText(last + '…').width > maxW && last.length) last = last.slice(0, -1);
      cut[maxLines - 1] = last.trim() + '…'; return cut;
    }
    return lines;
  };
  async function makeCollage(day) {
    try { await Promise.all(['700 92px "Barlow Condensed"', '700 28px Figtree', '400 30px Figtree', '600 34px Figtree'].map((f) => document.fonts.load(f))); } catch { /* usa a fonte do sistema */ }
    const posts = S.checkins.filter((c) => c.kind === 'treino' && c.day === day && c.photo_url)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at)).slice(0, 16);
    const tiles = (await Promise.all(posts.map(async (p) => {
      try {
        const b = await fetch(p.photo_url).then((r) => { if (!r.ok) throw new Error(); return r.blob(); });
        return { img: await decodeImg(b), name: person(p.participant_id)?.name || '' };
      } catch { return null; }
    }))).filter(Boolean);
    const W = 1080, H = 1350, P = 56;
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d');
    g.fillStyle = '#F6F1E6'; g.fillRect(0, 0, W, H);
    g.textBaseline = 'alphabetic';
    g.fillStyle = '#8A5A2B'; g.font = '700 28px Figtree, sans-serif';
    g.fillText(`GC SAMAMBAIA · DIA ${day} DE ${TOTAL_DAYS}`, P, P + 26);
    g.fillStyle = '#2F3A26'; g.font = '700 92px "Barlow Condensed", sans-serif';
    g.fillText('TREINOS DO DIA', P, P + 26 + 92);
    g.fillStyle = '#5B6150'; g.font = '400 30px Figtree, sans-serif';
    g.fillText(`${dayLabel(day)} · ${tiles.length} ${tiles.length === 1 ? 'pessoa treinou' : 'pessoas treinaram'}`, P, P + 26 + 92 + 50);
    // comentário mais curtido
    const top = topComment(day);
    let boxH = 0, lines = [];
    if (top) {
      g.font = '600 34px Figtree, sans-serif';
      lines = wrap(g, `“${top.c.body}”`, W - 2 * P - 64, 4);
      boxH = 32 + 26 + 18 + lines.length * 46 + 18 + 30 + 32;
    }
    const footH = 44, gridTop = 260, gridBottom = H - P - footH - (top ? boxH + 28 : 0);
    // grade de fotos
    const n = Math.max(tiles.length, 1), cols = n <= 1 ? 1 : n <= 4 ? 2 : n <= 9 ? 3 : 4, rows = Math.ceil(n / cols), gap = 14;
    const availW = W - 2 * P, availH = gridBottom - gridTop;
    const cell = Math.floor(Math.min((availW - (cols - 1) * gap) / cols, (availH - (rows - 1) * gap) / rows));
    const gridW = cols * cell + (cols - 1) * gap, gridH = rows * cell + (rows - 1) * gap;
    const x0 = P + (availW - gridW) / 2, y0 = gridTop + (availH - gridH) / 2;
    tiles.forEach((t, i) => {
      const x = x0 + (i % cols) * (cell + gap), y = y0 + Math.floor(i / cols) * (cell + gap);
      const iw = t.img.width, ih = t.img.height, k = Math.max(cell / iw, cell / ih);
      g.save(); rr(g, x, y, cell, cell, 22); g.clip();
      g.drawImage(t.img, x + (cell - iw * k) / 2, y + (cell - ih * k) / 2, iw * k, ih * k);
      const fs = cell > 300 ? 30 : cell > 220 ? 26 : 22;
      g.font = `700 ${fs}px Figtree, sans-serif`;
      const tw = g.measureText(t.name).width, ph = fs + 18;
      g.fillStyle = 'rgba(35,43,28,.82)'; rr(g, x + 12, y + cell - ph - 12, Math.min(tw + 28, cell - 24), ph, ph / 2); g.fill();
      g.fillStyle = '#F6F1E6'; g.fillText(t.name, x + 26, y + cell - 12 - ph / 2 + fs * 0.36, cell - 52);
      g.restore();
      if (t.img.close) t.img.close();
    });
    if (top) {
      const by = gridBottom + 28, p = person(top.c.participant_id);
      g.fillStyle = '#2F3A26'; rr(g, P, by, W - 2 * P, boxH, 28); g.fill();
      let y = by + 32 + 22;
      g.fillStyle = '#E2C287'; g.font = '700 24px Figtree, sans-serif';
      g.fillText(top.n > 0 ? 'COMENTÁRIO MAIS CURTIDO' : 'DA LEITURA DO DIA', P + 32, y);
      g.fillStyle = '#F6F1E6'; g.font = '600 34px Figtree, sans-serif'; y += 18;
      lines.forEach((ln) => { y += 46; g.fillText(ln, P + 32, y); });
      y += 18 + 30;
      g.fillStyle = '#E2C287'; g.font = '700 26px Figtree, sans-serif';
      g.fillText(`${p?.name || ''} · ${chaptersLabel(day)}${top.n > 0 ? ` · ${top.n} ${top.n === 1 ? 'curtida' : 'curtidas'}` : ''}`, P + 32, y);
    }
    g.fillStyle = '#6B6F60'; g.font = '400 24px Figtree, sans-serif';
    g.fillText('Desafio Corpo e Espírito · Lagoinha Valinhos', P, H - P);
    return canvasToBlob(c);
  }
  async function openCollage(day, btn) {
    const label = btn.innerHTML; btn.disabled = true; btn.textContent = 'Montando…';
    try {
      const blob = await makeCollage(day);
      const url = URL.createObjectURL(blob);
      const file = new File([blob], `desafio-dia-${day}.jpg`, { type: 'image/jpeg' });
      const canShare = !!(navigator.canShare && navigator.canShare({ files: [file] }));
      const m = document.createElement('div'); m.className = 'cropper';
      m.innerHTML = `<div class="crop-box">
        <div class="row" style="width:100%"><div class="crop-title grow">MONTAGEM DO DIA ${day}</div><button class="icon-btn mc-close" type="button" aria-label="Fechar" style="margin:0">${ICON.x}</button></div>
        <img src="${url}" alt="Montagem dos treinos do dia ${day}" style="width:100%;border-radius:14px;max-height:60dvh;object-fit:contain;background:#fff">
        ${canShare ? '<button class="btn gold mc-share" type="button">Compartilhar</button>' : ''}
        <a class="btn ${canShare ? 'outline' : ''}" href="${url}" download="desafio-dia-${day}.jpg" style="text-decoration:none">Salvar imagem</a>
      </div>`;
      document.body.appendChild(m);
      const close = () => { m.remove(); URL.revokeObjectURL(url); };
      $('.mc-close', m).onclick = close;
      m.addEventListener('click', (e) => { if (e.target === m) close(); });
      const s2 = $('.mc-share', m);
      if (s2) s2.onclick = async () => {
        try { await navigator.share({ files: [file], title: `Desafio Corpo e Espírito · Dia ${day}` }); }
        catch (e) { if (e && e.name !== 'AbortError') toast('Não deu pra compartilhar. Use Salvar imagem.'); }
      };
    } catch (e) { console.error(e); toast('Não deu pra montar agora. Tenta de novo.'); }
    finally { btn.disabled = false; btn.innerHTML = label; }
  }

  // --- ranking ---
  route('ranking', () => {
    shell(true, 'ranking');
    const r = ranking();
    const m = me();
    const max = Math.max(0, Math.min(todayIdx(), TOTAL_DAYS)) * 2;
    const top = r.slice(0, 3);
    const order = [top[1], top[0], top[2]];
    const heights = [64, 84, 50], sizes = [52, 60, 48], labels = ['2º', '1º', '3º'];
    app.innerHTML = `
      <div class="hero">
        <div class="row"><h1 class="grow" style="font-size:36px">RANKING</h1><span class="small" style="color:var(--line-2)">máximo até hoje: ${max} pts</span></div>
        ${r.length ? `<div class="podium">${order.map((s, i) => s ? `
          <div class="p">${avatar(person(s.pid), sizes[i])}<div class="nm">${esc(person(s.pid).name)}</div>
            <div class="split">${s.leituras} ${s.leituras === 1 ? 'leitura' : 'leituras'}<br>${s.treinos} ${s.treinos === 1 ? 'treino' : 'treinos'}</div>
            <div class="base" style="height:${heights[i]}px"><b>${s.total}</b><span>${labels[i]}</span></div></div>` : '<div></div>').join('')}</div>` : ''}
      </div>
      <div class="stack" style="gap:8px;padding-top:16px">
        ${r.slice(3).map((s, i) => {
          const p = person(s.pid);
          return `<div class="rank-row ${s.pid === m.id ? 'me' : ''}"><div class="pos">${i + 4}º</div>${avatar(p, 36)}
            <div class="grow"><div style="font-weight:700">${esc(p.name)}</div><div class="small">${s.leituras} leituras · ${s.treinos} treinos</div></div><div class="pts">${s.total}</div></div>`;
        }).join('')}
        <div class="small center" style="padding-top:4px">Empate se resolve por dias completos e depois pela sequência.</div>
      </div>`;
  });

  // --- calendário ---
  route('calendario', (sel) => {
    shell(true, 'calendario');
    const t = todayIdx();
    sel = Number(sel) || currentDay();
    const n = S.people.length || 1;
    const cells = [];
    for (let d = 1; d <= TOTAL_DAYS; d++) {
      const date = dateOf(d);
      const full = S.people.filter((p) => fullDay(p.id, d)).length;
      const ratio = full / n;
      const past = d <= t;
      const lvl = !past ? '' : ratio >= 0.75 ? 'l3' : ratio >= 0.4 ? 'l2' : 'l1';
      const sub = DOUBLES[d] ? '2×' : past ? `${full}/${S.people.length}` : '';
      cells.push(`<button class="${lvl} ${d === sel ? 'sel' : ''} ${d === t ? 'today' : ''}" data-d="${d}" aria-label="Dia ${d}, ${shortDate(d)}"><b>${date.getUTCDate()}</b><i>${sub}</i></button>`);
    }
    const rows = S.people.map((p) => {
      const l = has(p.id, sel, 'leitura'), tr = has(p.id, sel, 'treino');
      return `<div class="day-row">${avatar(p, 30)}<div class="grow" style="font-weight:600;font-size:14px">${esc(p.name)}</div>
        <span class="tag ${l ? 'on' : ''}">Leitura</span>
        ${tr && tr.photo_url ? `<button class="tag on" data-ph="${esc(tr.photo_url)}">${esc(tr.activity)}</button>` : `<span class="tag ${tr ? 'on' : ''}">${tr ? esc(tr.activity) : 'Treino'}</span>`}</div>`;
    }).join('');
    const fullCount = S.people.filter((p) => fullDay(p.id, sel)).length;
    app.innerHTML = `
      <div class="stack" style="padding-top:22px;gap:12px">
        <div class="row"><h1 class="grow" style="font-size:36px">CALENDÁRIO</h1><span class="small">19/out a 15/nov</span></div>
        <div class="card stack" style="gap:10px;padding:14px">
          <div class="cal">${['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((w) => `<div class="wd">${w}</div>`).join('')}${cells.join('')}</div>
          <div class="legend"><span><i style="background:var(--olive)"></i>quase todos</span><span><i style="background:var(--sage)"></i>metade</span><span><i style="background:var(--line)"></i>poucos</span><span>2× = capítulo duplo</span></div>
        </div>
        <div class="row" style="padding-top:4px"><div class="grow" style="font-weight:700">${dayLabel(sel)} · ${chaptersLabel(sel)}</div></div>
        <div class="small" style="margin-top:-8px">${sel <= t ? `${fullCount} de ${S.people.length} completaram` : 'Ainda não chegou'}</div>
        <div class="stack" style="gap:6px">${rows || '<div class="small">Ninguém entrou ainda.</div>'}</div>
      </div>`;
    $$('.cal button').forEach((b) => b.onclick = () => go(`#/calendario/${b.dataset.d}`));
    $$('[data-ph]').forEach((b) => b.onclick = () => zoom(b.dataset.ph));
  });

  // seleção e cópia de versículos
  function verseRef(sel) {
    const byCh = {};
    sel.forEach(([c, n]) => (byCh[c] = byCh[c] || []).push(n));
    return 'Provérbios ' + Object.keys(byCh).map(Number).sort((a, b) => a - b).map((c) => {
      const ns = byCh[c].sort((a, b) => a - b), parts = [];
      let s = ns[0], p = ns[0];
      for (let i = 1; i <= ns.length; i++) {
        if (ns[i] === p + 1) { p = ns[i]; continue; }
        parts.push(s === p ? `${s}` : `${s}-${p}`); s = p = ns[i];
      }
      return `${c}:${parts.join(',')}`;
    }).join('; ');
  }
  async function copyText(txt) {
    try { await navigator.clipboard.writeText(txt); return true; } catch {
      const t = document.createElement('textarea'); t.value = txt; t.style.position = 'fixed'; t.style.opacity = '0';
      document.body.appendChild(t); t.select(); let ok = false;
      try { ok = document.execCommand('copy'); } catch { /* sem cópia */ }
      t.remove(); return ok;
    }
  }
  function setupVerseCopy(box, prov) {
    document.querySelector('.copybar')?.remove();
    const bar = document.createElement('div');
    bar.className = 'copybar'; bar.hidden = true;
    bar.innerHTML = '<span class="cb-ref"></span><button class="cb-clear" type="button">Limpar</button><button class="cb-copy" type="button">Copiar</button>';
    document.body.appendChild(bar);
    const selected = () => $$('.v.sel', box).map((el) => [Number(el.dataset.c), Number(el.dataset.n)]);
    const update = () => {
      const s = selected();
      bar.hidden = !s.length;
      if (s.length) $('.cb-ref', bar).textContent = verseRef(s);
    };
    const clear = () => { $$('.v.sel', box).forEach((el) => el.classList.remove('sel')); update(); };
    box.addEventListener('click', (e) => {
      const v = e.target.closest('.v'); if (!v) return;
      v.classList.toggle('sel'); update();
    });
    $('.cb-clear', bar).onclick = clear;
    $('.cb-copy', bar).onclick = async () => {
      const s = selected();
      const body = s.map(([c, n]) => prov[c][n - 1]).join(' ');
      const ok = await copyText(`"${body}"\n${verseRef(s)} (Bíblia Livre)`);
      toast(ok ? 'Copiado. É só colar no WhatsApp.' : 'Não deu pra copiar neste celular.');
      if (ok) clear();
    };
    window.addEventListener('hashchange', () => bar.remove(), { once: true });
  }

  // perfil: nome, foto (trocar ou reenquadrar) e sair da conta
  function openProfile() {
    const m = me(); if (!m) return;
    let blob = null;
    const el = document.createElement('div'); el.className = 'cropper';
    el.innerHTML = `<div class="crop-box" role="dialog" aria-label="Meu perfil">
      <div class="row" style="width:100%"><div class="crop-title grow">MEU PERFIL</div><button class="icon-btn pf-close" type="button" aria-label="Fechar" style="margin:0">${ICON.x}</button></div>
      <button class="photo-pick" id="pfPick" type="button" aria-label="Foto do perfil"><img src="${esc(m.photo_url)}" alt=""><span class="plus">+</span></button>
      <div class="row" style="gap:8px;flex-wrap:wrap;justify-content:center">
        <button class="tag on" id="pfAdjust" type="button">Ajustar enquadramento</button>
        <button class="tag on" id="pfNew" type="button">Escolher outra foto</button>
      </div>
      <input type="file" id="pfFile" accept="image/*" hidden>
      <div class="err" id="pfErr" hidden></div>
      <div style="width:100%"><label class="lbl" for="pfName">Primeiro nome</label><input class="input" id="pfName" maxlength="20" autocomplete="given-name" value="${esc(m.name)}"></div>
      <button class="btn" id="pfSave" type="button">Salvar</button>
      <button class="link-btn" id="pfOut" type="button">Sair da conta neste celular</button>
    </div>`;
    document.body.appendChild(el);
    const close = () => el.remove();
    const pick = $('#pfPick', el), err = $('#pfErr', el);
    const showErr = (msg) => { err.textContent = msg; err.hidden = !msg; };
    const setPreview = (r) => { pick.innerHTML = photoPreview(r) + '<span class="plus">+</span>'; };
    $('.pf-close', el).onclick = close;
    el.addEventListener('click', (e) => { if (e.target === el) close(); });
    $('#pfNew', el).onclick = () => $('#pfFile', el).click();
    pick.onclick = () => $('#pfFile', el).click();
    $('#pfFile', el).onchange = async (e) => {
      const f = e.target.files && e.target.files[0]; e.target.value = ''; if (!f) return;
      showErr('');
      try { const r = await pickPhoto(f, { aspect: 1, round: true, outW: 600 }); if (r) { blob = r.blob; setPreview(r); } }
      catch (x) { showErr(x.message); }
    };
    $('#pfAdjust', el).onclick = async () => {
      showErr('');
      try {
        const src0 = blob ? blob : await fetch(m.photo_url, { cache: 'no-store' }).then((r) => { if (!r.ok) throw new Error(); return r.blob(); });
        const src = await decodeAny(src0);
        if (!src) { showErr('Não deu pra ajustar essa foto. Escolha outra.'); return; }
        const out = await cropImage(limitSize(src), { aspect: 1, round: true, outW: 600 });
        if (out) { blob = out; setPreview({ blob: out, original: false }); }
      } catch { showErr('Não consegui abrir sua foto agora. Tenta de novo ou escolha outra.'); }
    };
    $('#pfSave', el).onclick = async () => {
      const name = $('#pfName', el).value.trim();
      if (!name) { showErr('Coloca seu nome.'); return; }
      if (S.people.some((p) => p.id !== m.id && p.name.toLowerCase() === name.toLowerCase())) { showErr(`Já tem um ${name} no desafio. Use o sobrenome junto.`); return; }
      const btn = $('#pfSave', el); btn.disabled = true; btn.textContent = 'Salvando…';
      try {
        const patch = { name };
        if (blob) patch.photo_url = await uploadPhoto(blob, 'perfil');
        const { error } = await db.from('participants').update(patch).eq('id', m.id);
        if (error) throw error;
        await load(); close(); toast('Perfil atualizado.'); render();
      } catch (x) { console.error(x); showErr('Não deu pra salvar. Tenta de novo.'); btn.disabled = false; btn.textContent = 'Salvar'; }
    };
    let armed = false;
    $('#pfOut', el).onclick = (e) => {
      if (!armed) { armed = true; e.target.textContent = `Toque de novo pra sair da conta de ${m.name}`; return; }
      setMe(null); close(); go('#/entrar');
    };
  }

  function zoom(src) {
    const m = document.createElement('div');
    m.className = 'modal'; m.innerHTML = `<img src="${esc(src)}" alt="Foto ampliada">`;
    m.onclick = () => m.remove();
    document.body.appendChild(m);
  }

  // ---------- roteador ----------
  const PUBLIC = ['entrar', 'cadastro', 'trocar-pin'];
  function render() {
    const [name = '', arg] = location.hash.replace(/^#\/?/, '').split('/');
    let target = routes[name] ? name : (me() ? 'hoje' : 'entrar');
    if (!PUBLIC.includes(target) && !me()) target = 'entrar';
    if (target === 'entrar' && me()) target = 'hoje';
    window.scrollTo(0, 0);
    routes[target](arg);
  }
  window.addEventListener('hashchange', render);
  // atualiza quando o app volta pra frente (ex.: alguém postou enquanto estava fechado)
  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState !== 'visible' || !S.loaded) return;
    // Só atualiza telas de leitura. Formulários (cadastro, treino, leitura com comentário)
    // não podem ser recriados: abrir a galeria também esconde a página.
    const name = location.hash.replace(/^#\/?/, '').split('/')[0] || 'hoje';
    const safe = ['hoje', 'mural', 'nutri', 'ranking', 'calendario'].includes(name);
    const busy = document.querySelector('.cropper') || (document.activeElement && ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName));
    if (!safe || busy || !me()) return;
    try { await load(); if (!document.querySelector('.cropper')) render(); } catch { /* sem rede */ }
  });

  // confere se saiu versão nova do app e recarrega (só fora de formulários)
  async function checkUpdate(force) {
    if (!MY_V) return false;
    try {
      const html = await fetch(location.pathname + '?u=' + Date.now(), { cache: 'no-store' }).then((r) => r.text());
      const v = (/app\.js\?v=(\d+)/.exec(html) || [])[1];
      if (v && v !== MY_V) {
        const name = location.hash.replace(/^#\/?/, '').split('/')[0] || 'hoje';
        const typing = document.activeElement && ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName);
        const formOpen = document.querySelector('.cropper') || DRAFT.signup || DRAFT.treino || ['cadastro', 'treino', 'trocar-pin'].includes(name) || (name === 'leitura' && typing);
        if (force || !formOpen) { location.replace(location.pathname + '?v=' + v + location.hash); return true; }
      }
    } catch { /* sem rede */ }
    return false;
  }
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') checkUpdate(false); });
  checkUpdate(true);

  load().then(render).catch((err) => {
    console.error(err);
    app.innerHTML = '<div class="stack" style="padding-top:60px"><h1 style="font-size:36px">SEM CONEXÃO</h1><p class="sub">Não consegui carregar o desafio. Confere a internet e recarrega a página.</p><button class="btn" onclick="location.reload()">Tentar de novo</button></div>';
  });
})();
