/* Espere website — interactions & motion (vanilla JS, no dependencies)
   Modules: header · nav · menu · split text · reveal · counters · parallax · tilt ·
            accordion/faq · travelling phone · stacked cards · toc · contact form · footer */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    /(^|[#&])noanim/.test(location.hash);
  if (reduce) root.classList.add('no-motion');

  function $(sel, ctx) { return (ctx || doc).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }
  function onReady(fn) {
    if (doc.readyState !== 'loading') fn(); else doc.addEventListener('DOMContentLoaded', fn);
  }
  function raf(fn) { return window.requestAnimationFrame(fn); }
  var hasIO = 'IntersectionObserver' in window;


  /* ---- Travelling phone: one phone starts in the hero, then glides to each
         feature row (left, right, left...) and shows that row's screen ------ */
  function initTravel() {
    var slots = $$('.fly-slot');
    if (slots.length < 2 || reduce) return;
    root.classList.add('travel-on');

    var wrap = doc.createElement('div');
    wrap.className = 'traveller';
    wrap.setAttribute('aria-hidden', 'true');
    wrap.innerHTML = '<div class="phone"><div class="phone-screen tr-screens"></div></div>';
    var box = $('.tr-screens', wrap);
    var screens = slots.map(function (slot, k) {
      var s = $('.phone-screen', slot).cloneNode(true);
      s.classList.add('tr-screen');
      if (k === 0) s.classList.add('on');
      var img = $('img', s);
      if (img) {
        img.alt = '';
        img.removeAttribute('loading');
        // load a screen only when the phone is about to show it
        if (k > 1) {
          img.dataset.src = img.getAttribute('src'); img.removeAttribute('src');
          img.dataset.srcset = img.getAttribute('srcset') || ''; img.removeAttribute('srcset');
        }
      }
      box.appendChild(s);
      return s;
    });
    doc.body.insertBefore(wrap, doc.body.firstChild);
    var phone = $('.phone', wrap);
    var cur = 0, ticking = false, baseW = 300, baseH = 620;

    function measure() { baseW = phone.offsetWidth; baseH = phone.offsetHeight; }
    function center(el) {
      var r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + window.scrollY + r.height / 2, w: r.width };
    }
    function ease(t) { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); }

    // Where the phone should be for the current scroll (y in page coordinates).
    function target() {
      var sy = window.scrollY, c = sy + window.innerHeight / 2;
      var pts = slots.map(center);
      var i = 0;
      while (i < pts.length - 1 && pts[i + 1].y <= c) i++;
      var a = pts[i], b = pts[Math.min(i + 1, pts.length - 1)];
      var t = b === a ? 0 : (c - a.y) / (b.y - a.y);
      // rest with a row briefly, then glide over most of the way to the next one
      var e = ease((t - 0.12) / 0.76);
      var w = a.w + (b.w - a.w) * e;
      var arc = Math.sin(Math.PI * e);
      var dir = b.x - a.x > 20 ? 1 : (b.x - a.x < -20 ? -1 : 0);
      var tg = { x: a.x + (b.x - a.x) * e, y: a.y + (b.y - a.y) * e, s: (w / baseW) * (1 - 0.08 * arc), r: 0 };
      if (window.innerWidth < 900) {
        // phones: rows are stacked, so swing aside and shrink while passing the text
        var side = i % 2 ? -1 : 1;
        tg.x += side * arc * window.innerWidth * 0.42;
        tg.s = (w / baseW) * (1 - 0.64 * arc);
        dir = side;
      }
      tg.r = dir * arc * 7;
      tg.idx = e > 0.5 ? Math.min(i + 1, pts.length - 1) : i;
      return tg;
    }

    // The phone eases towards the target every frame, so a flick or a jump in
    // scroll never makes it snap. Its y is kept in page coordinates: while it rests
    // with a row it scrolls exactly with the page.
    var pos = null, last = 0, running = false;
    function frame(now) {
      var tg = target();
      if (!pos) pos = { x: tg.x, y: tg.y, s: tg.s, r: tg.r };
      var dt = last ? Math.min(64, now - last) : 16;
      last = now;
      var k = 1 - Math.exp(-dt / 110); // ~110 ms to cover most of the gap
      pos.x += (tg.x - pos.x) * k;
      pos.y += (tg.y - pos.y) * k;
      pos.s += (tg.s - pos.s) * k;
      pos.r += (tg.r - pos.r) * k;
      var sy = window.scrollY;
      phone.style.transform = 'translate3d(' + (pos.x - baseW / 2).toFixed(2) + 'px,' + (pos.y - sy - baseH / 2).toFixed(2) +
        'px,0) rotate(' + pos.r.toFixed(3) + 'deg) scale(' + pos.s.toFixed(4) + ')';
      if (tg.idx !== cur) {
        [tg.idx, tg.idx + 1].forEach(function (n) {
          var im = screens[n] && $('img', screens[n]);
          if (im && im.dataset.src) {
            if (im.dataset.srcset) im.setAttribute('srcset', im.dataset.srcset);
            im.setAttribute('src', im.dataset.src);
            delete im.dataset.src; delete im.dataset.srcset;
          }
        });
        screens[cur].classList.remove('on');
        screens[tg.idx].classList.add('on');
        cur = tg.idx;
      }
      var moving = Math.abs(tg.x - pos.x) > 0.2 || Math.abs(tg.y - pos.y) > 0.2 ||
        Math.abs(tg.s - pos.s) > 0.0005 || Math.abs(tg.r - pos.r) > 0.02;
      if (moving) raf(frame); else { running = false; last = 0; }
    }
    function req() {
      if (running) return;
      running = true;
      raf(frame);
    }
    // While resting, follow the page on every scroll frame (no lag).
    window.addEventListener('scroll', function () {
      if (!running && pos) {
        var sy = window.scrollY;
        phone.style.transform = 'translate3d(' + (pos.x - baseW / 2).toFixed(2) + 'px,' + (pos.y - sy - baseH / 2).toFixed(2) +
          'px,0) rotate(' + pos.r.toFixed(3) + 'deg) scale(' + pos.s.toFixed(4) + ')';
      }
      req();
    }, { passive: true });
    window.addEventListener('resize', function () { measure(); req(); });
    window.addEventListener('load', function () { measure(); req(); });
    measure();
    req();
  }

  /* ---- Stacked cards: a card shrinks a little as the next one slides over it */
  function initStack() {
    var cards = $$('.stack-card');
    if (cards.length < 2 || reduce) return;
    var ticking = false;
    function frame() {
      ticking = false;
      for (var k = 0; k < cards.length - 1; k++) {
        var a = cards[k].getBoundingClientRect(), b = cards[k + 1].getBoundingClientRect();
        // 0 while the next card is a full card-height away, 1 once it has covered this one
        var p = 1 - Math.max(0, Math.min(1, (b.top - a.top) / Math.max(1, a.height)));
        cards[k].style.setProperty('--s', (1 - 0.06 * p).toFixed(4));
      }
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; raf(frame); } }, { passive: true });
    frame();
  }

  /* ---- Pause looping animations (marquee, floating cards, glows) off screen */
  function initOffscreenPause() {
    if (!hasIO) return;
    var els = $$('.hero, .marquee, .centered-page');
    if (!els.length) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { e.target.classList.toggle('is-offscreen', !e.isIntersecting); });
    }, { rootMargin: '100px 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---- Header: scrolled state, hide on scroll down, progress bar ---------- */
  function initHeader() {
    var header = $('[data-header]');
    var bar = $('.scroll-progress');
    var lastY = window.scrollY, ticking = false;
    var darkAreas = $$('.dark, .site-footer');
    // Header colours follow whatever is behind it: dark glass over dark sections, light glass over light ones.
    function updateTone() {
      if (!header || !darkAreas.length) return;
      var probe = header.getBoundingClientRect().top + 30, dark = false;
      for (var i = 0; i < darkAreas.length; i++) {
        var r = darkAreas[i].getBoundingClientRect();
        if (r.top <= probe && r.bottom >= probe) { dark = true; break; }
      }
      var tone = dark ? 'dark' : 'light';
      if (header.dataset.tone !== tone) header.dataset.tone = tone;
    }
    function update() {
      updateTone();
      var y = window.scrollY;
      var max = doc.documentElement.scrollHeight - window.innerHeight;
      if (header) {
        header.classList.toggle('is-scrolled', y > 12);
        var goingDown = y > lastY + 6;
        var goingUp = y < lastY - 6;
        if (y > 320 && goingDown && !doc.body.classList.contains('menu-open')) header.classList.add('is-hidden');
        else if (goingUp || y < 320) header.classList.remove('is-hidden');
      }
      if (bar && max > 0) bar.style.transform = 'scaleX(' + Math.min(1, y / max).toFixed(4) + ')';
      lastY = y; ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; raf(update); }
    }, { passive: true });
    update();
  }

  /* ---- Desktop nav: sliding hover pill + accessible "Legal" dropdown -------- */
  function initNav() {
    var nav = $('.nav');
    if (!nav) return;
    var pill = $('.nav-pill', nav);
    var items = $$('.nav > a, .nav-link', nav);
    function move(el) {
      if (!pill) return;
      if (!el || el.hasAttribute('aria-current')) { pill.classList.remove('is-on'); return; }
      var nr = nav.getBoundingClientRect(), r = el.getBoundingClientRect();
      pill.style.width = r.width + 'px';
      pill.style.transform = 'translateX(' + (r.left - nr.left) + 'px)';
      pill.classList.add('is-on');
    }
    items.forEach(function (el) {
      el.addEventListener('pointerenter', function () { move(el); });
      el.addEventListener('focus', function () { move(el); });
    });
    nav.addEventListener('pointerleave', function () { move(null); });
    nav.addEventListener('focusout', function (e) { if (!nav.contains(e.relatedTarget)) move(null); });

    var drop = $('.nav-drop', nav);
    if (!drop) return;
    var btn = $('.nav-link', drop), timer;
    function set(open) {
      drop.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
    }
    btn.addEventListener('click', function () { set(!drop.classList.contains('is-open')); });
    drop.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { clearTimeout(timer); set(true); } });
    drop.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') { timer = setTimeout(function () { set(false); }, 160); } });
    drop.addEventListener('focusout', function (e) { if (!drop.contains(e.relatedTarget)) set(false); });
    doc.addEventListener('click', function (e) { if (!drop.contains(e.target)) set(false); });
    drop.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { set(false); btn.focus(); }
      if (e.key === 'ArrowDown') { e.preventDefault(); set(true); var first = $('.drop-menu a', drop); if (first) first.focus(); }
    });
  }

  /* ---- Mobile menu --------------------------------------------------------- */
  function initMenu() {
    var toggle = $('.menu-toggle');
    var menu = $('#mobile-menu');
    if (!toggle || !menu) return;
    function set(open) {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      menu.classList.toggle('is-open', open);
      doc.body.classList.toggle('menu-open', open);
      menu.setAttribute('aria-hidden', String(!open));
      if (open) { menu.removeAttribute('inert'); } else { menu.setAttribute('inert', ''); }
    }
    set(false);
    toggle.addEventListener('click', function () { set(toggle.getAttribute('aria-expanded') !== 'true'); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') set(false); });
    window.matchMedia('(min-width: 1160px)').addEventListener('change', function (e) { if (e.matches) set(false); });
  }

  /* ---- Split headline into words for the rise-in animation ----------------- */
  function initSplit() {
    $$('[data-split]').forEach(function (el) {
      if (el.dataset.splitDone) return;
      var i = 0;
      (function walk(node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (child) {
          if (child.nodeType === 3) {
            var frag = doc.createDocumentFragment();
            child.textContent.split(/(\s+)/).forEach(function (part) {
              if (!part) return;
              if (/^\s+$/.test(part)) { frag.appendChild(doc.createTextNode(' ')); return; }
              var w = doc.createElement('span'); w.className = 'sw';
              var inner = doc.createElement('span'); inner.textContent = part;
              inner.style.setProperty('--w', i++);
              w.appendChild(inner); frag.appendChild(w);
            });
            node.replaceChild(frag, child);
          } else if (child.nodeType === 1 && child.tagName !== 'BR') { walk(child); }
        });
      })(el);
      el.dataset.splitDone = '1';
      el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    });
  }

  /* ---- Scroll reveal (fade / slide / scale / mask) with stagger ------------ */
  function initReveal() {
    // [data-stagger] containers: give each child a reveal + incremental delay
    $$('[data-stagger]').forEach(function (parent) {
      var step = parseInt(parent.dataset.stagger, 10) || 90;
      var kind = parent.dataset.staggerKind || 'up';
      Array.prototype.slice.call(parent.children).forEach(function (child, i) {
        if (!child.hasAttribute('data-reveal')) child.setAttribute('data-reveal', kind);
        child.style.setProperty('--d', i * step + 'ms');
      });
    });
    $$('[data-delay]').forEach(function (el) { el.style.setProperty('--d', el.dataset.delay + 'ms'); });

    var targets = $$('[data-reveal], [data-split], [data-inview]');
    if (!hasIO || reduce) {
      targets.forEach(function (el) { el.classList.add('is-in'); el.dispatchEvent(new CustomEvent('reveal')); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        entry.target.dispatchEvent(new CustomEvent('reveal'));
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* ---- Animated counters --------------------------------------------------- */
  function initCounters() {
    var els = $$('[data-count]');
    if (!els.length) return;
    function format(n, el) {
      var dec = parseInt(el.dataset.decimals || '0', 10);
      var txt = n.toFixed(dec);
      if (el.dataset.group !== undefined) txt = Number(txt).toLocaleString('en-IN', { minimumFractionDigits: dec, maximumFractionDigits: dec });
      return (el.dataset.prefix || '') + txt + (el.dataset.suffix || '');
    }
    function run(el) {
      var to = parseFloat(el.dataset.count);
      var dur = parseInt(el.dataset.duration || '1800', 10);
      if (reduce) { el.textContent = format(to, el); return; }
      var start = null;
      function tick(ts) {
        if (start === null) start = ts;
        var p = Math.min(1, (ts - start) / dur);
        var eased = 1 - Math.pow(1 - p, 4);
        el.textContent = format(to * eased, el);
        if (p < 1) raf(tick); else el.textContent = format(to, el);
      }
      raf(tick);
    }
    els.forEach(function (el) {
      el.textContent = format(0, el);
      if (!hasIO) { run(el); return; }
    });
    if (!hasIO) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.6 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---- Parallax (GPU transforms only, only while on screen) ---------------- */
  function initParallax() {
    if (reduce) return;
    var items = $$('[data-parallax]').map(function (el) {
      return { el: el, speed: parseFloat(el.dataset.parallax) || 0.15, on: false, base: el.dataset.parallaxBase || '' };
    });
    if (!items.length) return;
    if (hasIO) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          var it = items.filter(function (x) { return x.el === e.target; })[0];
          if (it) it.on = e.isIntersecting;
        });
      }, { rootMargin: '20% 0px' });
      items.forEach(function (it) { io.observe(it.el); });
    } else { items.forEach(function (it) { it.on = true; }); }
    var ticking = false;
    function update() {
      var vh = window.innerHeight;
      var amp = window.innerWidth < 768 ? 0.5 : 1;
      items.forEach(function (it) {
        if (!it.on) return;
        var r = it.el.getBoundingClientRect();
        var center = r.top + r.height / 2 - vh / 2;
        it.el.style.transform = 'translate3d(0,' + (-center * it.speed * amp).toFixed(1) + 'px,0) ' + it.base;
      });
      ticking = false;
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; raf(update); } }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ---- Pointer tilt for the hero phone (fine pointers only) ---------------- */
  function initTilt() {
    var wrap = $('[data-tilt]');
    if (!wrap || reduce || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    var target = $('.phone', wrap) || wrap;
    var tx = 0, ty = 0, cx = 0, cy = 0, running = false;
    function loop() {
      cx += (tx - cx) * 0.08; cy += (ty - cy) * 0.08;
      target.style.transform = 'rotateY(' + (cx * 10).toFixed(2) + 'deg) rotateX(' + (-cy * 8).toFixed(2) + 'deg)';
      if (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) raf(loop); else running = false;
    }
    wrap.addEventListener('pointermove', function (e) {
      var r = wrap.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
      if (!running) { running = true; raf(loop); }
    });
    wrap.addEventListener('pointerleave', function () { tx = 0; ty = 0; if (!running) { running = true; raf(loop); } });
  }

  /* ---- Accordion (+ FAQ search & category tabs) ---------------------------- */
  function initAccordion() {
    var items = $$('.acc-item');
    if (!items.length) return;
    function setOpen(item, open) {
      item.classList.toggle('is-open', open);
      var btn = $('.acc-q', item);
      btn.setAttribute('aria-expanded', String(open));
    }
    items.forEach(function (item) {
      var btn = $('.acc-q', item);
      btn.addEventListener('click', function () {
        var willOpen = btn.getAttribute('aria-expanded') !== 'true';
        setOpen(item, willOpen);
      });
    });

    var input = $('#faq-search');
    var tabs = $$('.tab[data-cat]');
    var groups = $$('.faq-group');
    var empty = $('#faq-empty');
    var cat = 'all';
    function apply() {
      var q = input ? input.value.trim().toLowerCase() : '';
      var shown = 0;
      groups.forEach(function (g) {
        var gShown = 0;
        $$('.acc-item', g).forEach(function (it) {
          var okCat = cat === 'all' || g.dataset.cat === cat;
          var okQ = !q || it.textContent.toLowerCase().indexOf(q) !== -1;
          it.hidden = !(okCat && okQ);
          if (!it.hidden) { gShown++; shown++; }
        });
        g.hidden = gShown === 0;
      });
      if (empty) empty.hidden = shown !== 0;
    }
    if (input) input.addEventListener('input', apply);
    tabs.forEach(function (t) {
      t.addEventListener('click', function () {
        cat = t.dataset.cat;
        tabs.forEach(function (x) { x.setAttribute('aria-selected', String(x === t)); });
        apply();
      });
    });
  }





  /* ---- Table of contents scroll-spy (privacy / terms) ---------------------- */
  function initToc() {
    var links = $$('.toc a[href^="#"]');
    if (!links.length || !hasIO) return;
    var map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove('is-active'); });
        var a = map[e.target.id]; if (a) a.classList.add('is-active');
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    $$('.doc-sec[id]').forEach(function (s) { io.observe(s); });
  }

  /* ---- Feature demos (budget bar → warning, offline → synced) -------------- */
  /* Run fn once when el scrolls into view (falls back to immediately). */
  function whenVisible(el, fn) {
    if (!hasIO) { fn(); return; }
    var io = new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { io.disconnect(); fn(); }
    }, { threshold: 0.35 });
    io.observe(el);
  }


  /* ---- Contact form (same API, payload and error handling as before) ------- */
  function initContact() {
    var form = $('#contact-form');
    if (!form) return;
    var API = 'https://montra.pythonanywhere.com';
    var state = { token: '' };
    var status = $('#form-status');
    var qEl = $('#captcha-question');
    var ans = $('#captcha_answer');
    var refresh = $('#captcha-refresh');
    var submit = $('#form-submit');
    var label = $('.btn-label', submit);

    function showStatus(type, message) {
      status.innerHTML = '';
      if (!message) { status.hidden = true; return; }
      var box = doc.createElement('div');
      box.className = 'alert ' + (type === 'success' ? 'alert-ok' : 'alert-err');
      box.setAttribute('role', type === 'success' ? 'status' : 'alert');
      var icon = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
      icon.setAttribute('class', 'i'); icon.setAttribute('aria-hidden', 'true');
      var use = doc.createElementNS('http://www.w3.org/2000/svg', 'use');
      use.setAttribute('href', type === 'success' ? '#i-check' : '#i-alert');
      icon.appendChild(use);
      var span = doc.createElement('span'); span.textContent = message;
      box.appendChild(icon); box.appendChild(span);
      status.appendChild(box); status.hidden = false;
    }
    function setLoadingCaptcha(on) {
      ans.disabled = on; refresh.disabled = on;
      refresh.classList.toggle('is-spinning', on);
      submit.disabled = on || submit.dataset.sending === '1';
      qEl.textContent = on ? 'Loading...' : qEl.textContent;
    }
    function fetchCaptcha() {
      setLoadingCaptcha(true);
      return fetch(API + '/api/contact/captcha/')
        .then(function (res) { return res.ok ? res.json() : null; })
        .then(function (data) {
          if (data) { state.token = data.token; qEl.textContent = data.question; ans.value = ''; }
          else qEl.textContent = 'Unavailable';
        })
        .catch(function (err) { console.error('Failed to load captcha', err); qEl.textContent = 'Unavailable'; })
        .then(function () { setLoadingCaptcha(false); });
    }
    refresh.addEventListener('click', fetchCaptcha);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      submit.dataset.sending = '1'; submit.disabled = true; submit.setAttribute('aria-busy', 'true');
      label.textContent = 'Sending...';
      showStatus('', '');
      var payload = {
        name: form.name.value, email: form.email.value, type: form.type.value,
        message: form.message.value, captcha_answer: ans.value, captcha_token: state.token
      };
      fetch(API + '/api/contact/submit/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      })
        .then(function (res) { return res.json().then(function (data) { return { ok: res.ok, data: data }; }); })
        .then(function (r) {
          if (r.ok) {
            showStatus('success', r.data.message);
            form.reset(); fetchCaptcha();
          } else {
            var msg = r.data.error || 'Something went wrong.';
            showStatus('error', msg);
            if (r.data.error && r.data.error.toLowerCase().indexOf('captcha') !== -1) fetchCaptcha();
          }
        })
        .catch(function () { showStatus('error', 'Network error. Please try again later.'); })
        .then(function () {
          submit.dataset.sending = '0'; submit.removeAttribute('aria-busy');
          label.textContent = 'Send Message'; submit.disabled = ans.disabled;
          status.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
        });
    });
    fetchCaptcha();
  }

  /* ---- Footer year, back-to-top -------------------------------------------- */
  function initFooter() {
    $$('[data-year]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });
    $$('[data-top]').forEach(function (b) {
      b.addEventListener('click', function (e) { e.preventDefault(); window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });
    });
  }

  onReady(function () {
    initHeader(); initNav(); initMenu(); initSplit(); initReveal(); initCounters(); initParallax();
    initTilt(); initAccordion(); initTravel(); initStack(); initOffscreenPause(); initToc(); initContact(); initFooter();
  });
})();
