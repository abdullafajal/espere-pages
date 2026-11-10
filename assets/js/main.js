/* Espere website — interactions & motion (vanilla JS, no dependencies)
   Modules: header · menu · reveal · split text · counters · parallax · tilt ·
            accordion/faq · story · toc · demos · contact form · footer         */
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

  /* ---- Group settlements: sticky story with live phone screens ------------ */
  function initWalk() {
    var sec = $('.walk');
    if (!sec) return;
    var stage = $('.walk-stage', sec), wrap = $('.walk-phone', sec), phone = $('.walk-phone .phone', sec);
    var scenes = $$('.wscene'), chs = $$('.walk-ch', sec);
    var bal = $('[data-walk-bal]'), amt = $('[data-walk-amt]'), spent = $('[data-walk-spent]'), pct = $('[data-walk-pct]');
    var caption = $('.walk-caption', sec), num = $('.walk-num', sec);
    var caps = chs.map(function (b) { return $('em', b).textContent; });
    var N = scenes.length, cur = -1, target = 0, shown = 0, running = false, last = 0, manual = 0;
    var staticMode = reduce;
    if (staticMode) sec.classList.add('walk-static');

    function clamp(v) { return Math.max(0, Math.min(1, v)); }
    function layout() {
      var h = stage.clientHeight - parseFloat(getComputedStyle(stage).paddingTop);
      var reserve = window.innerWidth < 1024 ? 230 : 48;
      var sc = staticMode ? 1 : Math.max(0.5, Math.min(1, (h - reserve) / 620));
      phone.style.setProperty('--ws', sc);
      wrap.style.width = 300 * sc + 'px';
      wrap.style.height = 620 * sc + 'px';
    }
    function setCls(el, name, on) { if (el.classList.contains(name) !== on) el.classList.toggle(name, on); }
    function render(p) {
      var ch = Math.min(N - 1, Math.floor(p * N + 1e-6));
      sec.style.setProperty('--p', p.toFixed(4));
      scenes.forEach(function (sc, i) {
        var x = p * N - i, l = clamp(x / 0.8);
        sc.style.setProperty('--x', x.toFixed(4));
        sc.style.setProperty('--lp', l.toFixed(4));
        sec.style.setProperty('--x' + i, x.toFixed(4));
        if (i === 3) sc.style.setProperty('--x3', x.toFixed(4));
        setCls(sc, 's1', l > 0.2); setCls(sc, 's2', l > 0.45); setCls(sc, 's3', l > 0.7);
        if (i === 0 && amt) {
          var n = Math.min(4, Math.floor(clamp(l / 0.42) * 4.999));
          var t = n ? Number('1200'.slice(0, n)).toLocaleString('en-IN') : '0';
          if (amt.textContent !== t) amt.textContent = t;
        }
        if (i === 4 && bal) {
          var bf = clamp(l * 2.4);
          bal.textContent = '\u20b9' + (bf * 24580).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
        if (i === 3 && spent) {
          var f = clamp((l - 0.05) * 5);
          spent.textContent = Math.round(f * 14400).toLocaleString('en-IN');
          pct.textContent = Math.round(f * 72) + '%';
        }
      });
      chs.forEach(function (b, i) {
        var l = i < ch ? 1 : i > ch ? 0 : clamp(p * N - ch);
        b.style.setProperty('--lp', l.toFixed(3));
        setCls(b, 'is-active', i === ch); setCls(b, 'is-done', i < ch);
      });
      if (ch !== cur) {
        cur = ch;
        chs.forEach(function (b, i) { if (i === ch) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); });
        if (num) { num.textContent = ch < 4 ? '0' + (ch + 1) : ''; num.classList.remove('pop'); void num.offsetWidth; num.classList.add('pop'); }
        if (caption) caption.textContent = caps[ch] || '';
      }
      setCls(sec, 'is-moving', p > 0.015);
      setCls(sec, 'is-final', ch === N - 1);
    }
    function progress() {
      if (staticMode) return clamp((manual + 0.95) / N);
      var r = sec.getBoundingClientRect();
      return clamp(-r.top / (sec.offsetHeight - window.innerHeight));
    }
    // Damped follow: the scene eases toward the scroll position, so wheel steps feel fluid.
    function frame(now) {
      var dt = Math.min(64, now - last); last = now;
      var k = 1 - Math.exp(-dt / 110);
      shown += (target - shown) * k;
      if (Math.abs(target - shown) < 0.0004) { shown = target; running = false; }
      render(shown);
      if (running) requestAnimationFrame(frame);
    }
    function onScroll() {
      target = progress();
      if (staticMode) { shown = target; render(shown); return; }
      if (!running) { running = true; last = performance.now(); requestAnimationFrame(frame); }
    }
    chs.forEach(function (b, i) {
      b.addEventListener('click', function () {
        if (staticMode) { manual = i; onScroll(); return; }
        var total = sec.offsetHeight - window.innerHeight;
        var top = sec.getBoundingClientRect().top + window.pageYOffset + total * ((i + 0.62) / N);
        window.scrollTo({ top: top, behavior: 'smooth' });
      });
    });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', function () { layout(); onScroll(); });
    layout();
    target = shown = progress();
    render(shown);
  }

  function initSpot() {
    var band = $('.cta-band');
    if (!band || reduce || !window.matchMedia('(hover: hover)').matches) return;
    var ticking = false, ex = 0, ey = 0;
    band.addEventListener('pointermove', function (e) {
      var r = band.getBoundingClientRect();
      ex = e.clientX - r.left; ey = e.clientY - r.top;
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        band.style.setProperty('--mx', ex + 'px');
        band.style.setProperty('--my', ey + 'px');
        ticking = false;
      });
    });
  }

  /* One phone for the whole page. It starts as the hero phone, follows the scroll, parks at
     each feature card, then moves into the Settlements and "How it works" sections, where it
     takes over their screens. Pure transforms, no library.
     Horizontal travel, scale, tilt and the screen cross-fades are eased over time, so wheel
     steps never look jerky; the vertical position stays locked to the page while it is docked. */
  function initFly() {
    var fly = $('.fly'), heroPhone = $('.hero-visual .phone'), slots = $$('.frow-slot');
    if (!fly || !heroPhone || !slots.length || reduce) { root.classList.remove('fly-layout'); return; }
    var mq = window.matchMedia('(min-width: 1024px)');
    var flyScreen = $('.phone-screen', fly);

    // three groups of screens, each in its own wrapper so whole groups can cross-fade
    function group(name) { var g = doc.createElement('div'); g.className = 'fg fg-' + name; flyScreen.appendChild(g); return g; }
    var gFeat = group('feat'), gStory = group('story'), gWalk = group('walk');
    var scenes = $$('.fscene', fly);
    scenes.forEach(function (el) { gFeat.appendChild(el); });
    scenes[0].innerHTML = $('.phone-screen', heroPhone).innerHTML;
    $$('.hero-visual .float-card').forEach(function (card) {
      var cl = card.cloneNode(true);
      cl.removeAttribute('data-parallax');
      cl.style.transform = '';
      fly.appendChild(cl);
    });
    var groups = { feat: { el: gFeat, v: 1 }, story: { el: gStory, v: 0 }, walk: { el: gWalk, v: 0 } };

    var storySec = $('#settlements'), storyStick = $('.story-phone'), storyPhone = $('.story-sticky .phone'), storyScreens = $('.screens');
    var walkSec = $('.walk'), walkStage = $('.walk-stage'), walkWrap = $('.walk-phone'), walkScenes = $$('.wscene');
    var moved = [];
    function adopt(el, into) { moved.push({ el: el, parent: el.parentNode, next: el.nextSibling }); into.appendChild(el); }
    function release() { while (moved.length) { var m = moved.pop(); m.parent.insertBefore(m.el, m.next); } }

    var anchors = [], active = false, running = false, last = 0, snap = true, curScene = -1, curG = 'feat';
    var cur = { x: 0, s: 1, rot: 0, dy: 0, op: 1 };
    var tgt = { x: 0, s: 1, rot: 0, dy: 0, op: 1, locked: true, vy: 0 };

    function docPos(el) {
      var x = 0, y = 0, n = el;
      while (n) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
      return { cx: x + el.offsetWidth / 2, cy: y + el.offsetHeight / 2, w: el.offsetWidth };
    }
    function measure() {
      var vh = window.innerHeight;
      var fs = Math.max(0.6, Math.min(1, (vh - 150) / 620));
      document.documentElement.style.setProperty('--fs', fs.toFixed(3));
      anchors = [heroPhone].concat(slots).map(function (el, i) {
        var d = docPos(el);
        return { cx: d.cx, cy: d.cy, s: d.w / 300, rot: i === 0 ? -2 : (i % 2 ? 4 : -4), g: 'feat', scene: i, dy: 0 };
      });
      // a pinned (sticky) section = two anchors: where the pin starts and where it ends
      function sticky(name, stick, parent, slot) {
        if (!stick || !slot || !parent) return;
        var top = parseFloat(getComputedStyle(stick).top) || 0;
        var p = docPos(slot), st = docPos(stick), par = docPos(parent);
        var rel = p.cy - (st.cy - stick.offsetHeight / 2);
        var natTop = par.cy - parent.offsetHeight / 2;
        var cyIn = natTop - top + vh / 2;
        var cyOut = natTop + parent.offsetHeight - stick.offsetHeight - top + vh / 2;
        if (cyOut <= cyIn) cyOut = cyIn + 1;
        var base = { cx: p.cx, s: p.w / 300, rot: 0, g: name, scene: -1, dy: top + rel - vh / 2 };
        anchors.push(Object.assign({}, base, { cy: cyIn }));
        anchors.push(Object.assign({}, base, { cy: cyOut }));
      }
      sticky('story', storyStick, storyStick && storyStick.parentElement, storyPhone);
      // the phone must already be on the right when the (left-aligned) heading arrives
      var storyHead = $('#settlements .section-head');
      if (storyHead && anchors.length >= 2 && anchors[anchors.length - 2].g === 'story') {
        anchors[anchors.length - 2].tEnd = docPos(storyHead).cy - storyHead.offsetHeight / 2 - 340;
      }
      var wn = anchors.length;
      sticky('walk', walkStage, walkSec, walkWrap);
      if (anchors.length === wn + 2) {
        // last chapter: the phone slides to the left half, the CTA text takes the right half
        var wIn = anchors[wn], wOut = anchors[wn + 1], copy = $('.walk-copy');
        var wMid = Object.assign({}, wIn, { cy: wIn.cy + (wOut.cy - wIn.cy) * 0.8 });
        if (copy) wOut.cx = docPos(copy).cx;
        wOut.rot = -3;
        anchors.splice(wn + 1, 0, wMid);
      }
      anchors.sort(function (a, b) { return a.cy - b.cy; });
    }
    function smooth(t) { return t * t * (3 - 2 * t); }
    function lerp(a, b, t) { return a + (b - a) * t; }

    // where the phone wants to be for the current scroll position
    function aim() {
      var vh = window.innerHeight, sy = window.pageYOffset, vc = sy + vh * 0.5;
      var A = anchors, n = A.length - 1, anc;
      if (vc <= A[0].cy) {
        anc = A[0];
        tgt.x = anc.cx; tgt.s = anc.s; tgt.rot = anc.rot; tgt.dy = 0; tgt.op = 1; tgt.locked = true; tgt.vy = anc.cy - sy;
      } else if (vc >= A[n].cy) {
        anc = A[n];
        tgt.x = anc.cx; tgt.s = anc.s; tgt.rot = anc.rot; tgt.dy = 0; tgt.op = 1; tgt.locked = true; tgt.vy = anc.cy + anc.dy - sy;
      } else {
        var i = 0;
        while (i < n - 1 && vc >= A[i + 1].cy) i++;
        var a = A[i], b = A[i + 1];
        var t = (vc - a.cy) / (b.cy - a.cy);
        var e;
        if (b.tEnd) {
          // travel only inside the empty gap before the section's heading
          var ts = Math.min(a.cy + 200, b.tEnd - 160);
          e = smooth(Math.max(0, Math.min(1, (vc - ts) / (b.tEnd - ts))));
        } else e = smooth(Math.max(0, Math.min(1, (t - 0.18) / 0.64)));
        tgt.x = lerp(a.cx, b.cx, e); tgt.s = lerp(a.s, b.s, e); tgt.rot = lerp(a.rot, b.rot, e);
        tgt.dy = lerp(a.dy, b.dy, e); tgt.locked = false; tgt.vy = 0;
        // between different sections the phone thins out while it crosses the headings
        var dip = Math.abs(a.cx - b.cx) > 80 ? (a.g !== b.g ? 0.3 : 0.1) : 0;
        tgt.op = 1 - dip * Math.sin(Math.PI * e);
        anc = t < 0.5 ? a : b;
      }
      return anc;
    }
    function apply(anc) {
      var vh = window.innerHeight, sy = window.pageYOffset;
      var vy = tgt.locked ? tgt.vy : vh / 2 + cur.dy;
      fly.style.transform = 'translate3d(' + (cur.x - 150).toFixed(1) + 'px,' + (vy - 310).toFixed(1) + 'px,0) rotate(' + cur.rot.toFixed(2) + 'deg) scale(' + cur.s.toFixed(3) + ')';
      fly.style.opacity = cur.op.toFixed(3);
      fly.style.visibility = (vy + 330 * cur.s < -40 || vy - 330 * cur.s > vh + 40) ? 'hidden' : 'visible';
      if (anc.g !== curG) { curG = anc.g; fly.setAttribute('data-g', curG); }
      var sc = anc.g === 'feat' ? anc.scene : -1;
      if (sc !== curScene) {
        curScene = sc;
        scenes.forEach(function (el, k) { el.classList.toggle('is-on', k === sc); });
        fly.classList.toggle('s0', sc === 0);
      }
    }
    function frame(now) {
      if (!active || !anchors.length) { running = false; return; }
      var dt = Math.min(64, now - last); last = now;
      var anc = aim();
      var settled = true;
      var k = snap ? 1 : 1 - Math.exp(-dt / 95);
      ['x', 's', 'rot', 'dy', 'op'].forEach(function (key) {
        var d = tgt[key] - cur[key];
        if (Math.abs(d) > (key === 'x' ? 0.15 : 0.0015)) { cur[key] += d * k; settled = false; } else cur[key] = tgt[key];
      });
      // screen groups cross-fade
      var kg = snap ? 1 : 1 - Math.exp(-dt / 140);
      Object.keys(groups).forEach(function (name) {
        var g = groups[name], want = anc.g === name ? 1 : 0, d = want - g.v;
        if (Math.abs(d) > 0.004) { g.v += d * kg; settled = false; } else g.v = want;
        g.el.style.opacity = g.v.toFixed(3);
        g.el.style.visibility = g.v < 0.01 ? 'hidden' : 'visible';
      });
      apply(anc);
      snap = false;
      // keep running while the page is moving or anything is still easing
      if (!settled || Math.abs(window.pageYOffset - lastY) > 0.5) { lastY = window.pageYOffset; requestAnimationFrame(frame); } else { running = false; }
    }
    var lastY = -1;
    function request() {
      if (running || !active) return;
      running = true; last = performance.now(); requestAnimationFrame(frame);
    }
    function remeasure() { if (active) { measure(); request(); } }
    function setActive() {
      var on = mq.matches;
      if (on === active) return;
      active = on;
      document.documentElement.classList.toggle('fly-on', on);
      document.documentElement.classList.toggle('fly-layout', on);
      if (on) {
        if (storyScreens) adopt(storyScreens, gStory);
        walkScenes.forEach(function (el) { adopt(el, gWalk); });
        measure(); snap = true; running = false; request();
      } else { release(); }
    }
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', function () { setTimeout(remeasure, 60); remeasure(); });
    if (mq.addEventListener) mq.addEventListener('change', setActive);
    window.addEventListener('load', remeasure);
    setTimeout(remeasure, 700);
    setTimeout(remeasure, 2000);
    setActive();
  }

  function initStory() {
    var steps = $$('.story-step');
    var screens = $$('.screen');
    var story = $('.story');
    if (!steps.length || !screens.length) return;
    var cur = -1, userPicked = false, timer = null, modeTimer = null;
    var small = window.matchMedia('(max-width: 1023px)');

    // Screen 1: Equal / Percentage / Exact toggle (also driven by the tags on step 1)
    var modes = ['equal', 'percentage', 'exact'];
    var segs = $$('.seg [data-mode]');
    var modeBtns = $$('.ss-tags [data-mode]');
    var modeIdx = 0;
    function setMode(mode) {
      modeIdx = Math.max(0, modes.indexOf(mode));
      segs.forEach(function (s) { s.classList.toggle('on', s.dataset.mode === mode); });
      modeBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.mode === mode)); });
      $$('.members [data-' + mode + ']').forEach(function (el) { el.textContent = el.getAttribute('data-' + mode); });
    }
    function runModes() {
      clearInterval(modeTimer);
      if (reduce || userPicked) return;
      modeTimer = setInterval(function () { setMode(modes[(modeIdx + 1) % modes.length]); }, 2600);
    }
    segs.forEach(function (s) {
      s.addEventListener('click', function () { userPicked = true; clearInterval(modeTimer); setMode(s.dataset.mode); });
    });
    modeBtns.forEach(function (b) {
      b.addEventListener('click', function (e) {
        e.stopPropagation(); userPicked = true; clearInterval(modeTimer);
        stopAuto(); activate(0); setMode(b.dataset.mode);
      });
    });

    function activate(i) {
      if (i === cur) return;
      cur = i;
      steps.forEach(function (s, k) {
        s.classList.toggle('is-active', k === i);
        s.classList.toggle('is-past', k < i);
      });
      screens.forEach(function (s, k) { s.classList.toggle('is-active', k === i); });
      if (story) story.style.setProperty('--p', (i / (steps.length - 1)).toFixed(3));
      if (i === 0) runModes(); else clearInterval(modeTimer);
    }
    function pick(i) { userPicked = true; stopAuto(); activate(i); }
    setMode('equal');
    activate(0);
    steps.forEach(function (s, i) {
      s.setAttribute('tabindex', '0');
      s.addEventListener('click', function () { pick(i); });
      s.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(i); } });
    });

    // Desktop: the active step follows the scroll position
    if (hasIO) {
      var io = new IntersectionObserver(function (entries) {
        if (small.matches) return;
        entries.forEach(function (e) { if (e.isIntersecting) activate(steps.indexOf(e.target)); });
      }, { rootMargin: '-45% 0px -45% 0px' });
      steps.forEach(function (s) { io.observe(s); });
    }

    // Phones: the phone sits above the steps, so cycle them automatically while the section is visible
    function stopAuto() { clearInterval(timer); timer = null; }
    function startAuto() {
      stopAuto();
      if (!small.matches || reduce) return;
      timer = setInterval(function () { activate((cur + 1) % steps.length); }, 5200);
    }
    if (hasIO && story) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting && !userPicked) startAuto(); else stopAuto(); });
      }, { threshold: 0.25 }).observe(story);
    }
    small.addEventListener('change', stopAuto);
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

  function initDemos() {
    var budget = $('.budget-demo');
    if (budget) {
      var pct = $('.bd-pct', budget), left = $('.bd-left', budget), bar = $('.bar > i', budget);
      var hot = false;
      function set(p) {
        bar.style.setProperty('--to', p + '%'); bar.style.width = p + '%';
        pct.textContent = p + '%';
        left.textContent = p >= 98 ? '₹45.00' : '₹1,250.00';
        budget.classList.toggle('is-hot', p >= 98);
      }
      whenVisible(budget, function () {
        set(75);
        if (reduce) return;
        setInterval(function () { hot = !hot; set(hot ? 98 : 75); }, 3600);
      });
    }
    var sync = $('.sync-steps');
    if (sync) {
      var rows = $$('.sync-step', sync), card = sync.closest('.b-card');
      function cycle() {
        var i = 0;
        function step() {
          rows.forEach(function (r, k) { r.classList.toggle('is-done', k < i); r.classList.toggle('is-on', k === i); });
          if (card) card.classList.toggle('is-online', i >= 2);
          i = (i + 1) % (rows.length + 1);
        }
        step();
        if (!reduce) setInterval(step, 1500); else rows.forEach(function (r) { r.classList.add('is-done'); }); if (card) card.classList.add('is-online');
      }
      whenVisible(sync, cycle);
    }
    var swipe = $('.swipe-demo');
    if (swipe) {
      if (hasIO) {
        new IntersectionObserver(function (es) { es.forEach(function (e) { swipe.classList.toggle('is-live', e.isIntersecting); }); }).observe(swipe);
      } else swipe.classList.add('is-live');
    }
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
    initHeader(); initNav(); initMenu(); initSplit(); initDemos(); initReveal(); initCounters(); initParallax();
    initTilt(); initAccordion(); initStory(); initWalk(); initFly(); initSpot(); initToc(); initContact(); initFooter();
  });
})();
