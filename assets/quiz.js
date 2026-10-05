(function () {
  'use strict';

  var D = window.IKS;
  var Q = D.questions;
  var N = Q.length;
  var KEY = 'iks_progress_v1';      // shared by home + quiz pages
  var POS = 'iks_position_v1';
  var LET = ['A', 'B', 'C', 'D', 'E', 'F'];

  var P = {};
  try { P = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { P = {}; }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(P)); } catch (e) { /* storage blocked */ } }

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  var idx = 0;
  var filter = 'all';

  /* ---------- state helpers ---------- */
  function rec(q) { return P[q.id] || (P[q.id] = {}); }
  function status(q) {
    var p = P[q.id];
    if (!p) return 'new';
    if (p.c) return p.s === q.answer ? 'ok' : 'bad';
    if (p.r) return 'seen';
    if (p.s != null) return 'sel';
    return 'new';
  }
  function isDone(s) { return s === 'ok' || s === 'bad' || s === 'seen'; }
  function counts() {
    var c = { ok: 0, bad: 0, seen: 0, sel: 0, new: 0, flag: 0 };
    for (var i = 0; i < N; i++) {
      c[status(Q[i])]++;
      if (P[Q[i].id] && P[Q[i].id].f) c.flag++;
    }
    return c;
  }

  /* ---------- question card ---------- */
  function render() {
    var q = Q[idx];
    var p = P[q.id] || {};
    var s = status(q);
    var done = isDone(s);
    var h = '';

    h += '<div class="qmeta">';
    h += '<span class="qnum">Q' + (idx + 1) + ' <span style="font-weight:400;color:var(--muted)">of ' + N + '</span></span>';
    h += '<span class="tag">' + esc(D.topicNames[q.topic] || q.topic) + '</span>';
    h += '<span class="tag type">' + esc(q.type) + '</span>';
    h += '<button type="button" class="flagbtn" id="flagBtn" aria-pressed="' + (p.f ? 'true' : 'false') + '">' + (p.f ? 'Flagged' : 'Flag') + '</button>';
    h += '</div>';

    h += '<p class="qtext" id="qtext">' + esc(q.q) + '</p>';
    h += '<ul class="choices" role="group" aria-labelledby="qtext">';
    for (var i = 0; i < q.options.length; i++) {
      var cls = 'choice', mark = '';
      if (p.c) {
        if (i === q.answer) { cls += ' right'; mark = 'Correct'; }
        else if (i === p.s) { cls += ' wrong'; mark = 'Your pick'; }
      } else if (p.r) {
        if (i === q.answer) { cls += ' right'; mark = 'Answer'; }
      } else if (p.s === i) {
        cls += ' picked';
      }
      h += '<li><button type="button" class="' + cls + '" data-i="' + i + '"' + (done ? ' disabled' : '') +
           ' aria-pressed="' + (p.s === i ? 'true' : 'false') + '">' +
           '<span class="letter">' + LET[i] + '</span><span class="ctext">' + esc(q.options[i]) + '</span>' +
           (mark ? '<span class="mark">' + mark + '</span>' : '') + '</button></li>';
    }
    h += '</ul>';

    if (!done) {
      h += '<div class="below"><button type="button" class="btn small ghost" id="showSol">Show solution</button></div>';
    } else {
      var ans = LET[q.answer] + '. ' + q.options[q.answer];
      var cls2 = s, title = 'Solution';
      if (s === 'ok') title = 'Correct';
      if (s === 'bad') title = 'Incorrect';
      h += '<div class="verdict ' + cls2 + '" role="status">';
      h += '<h3>' + title + '</h3>';
      if (s !== 'ok') h += '<p class="ans">Correct answer: ' + esc(ans) + '</p>';
      h += '<p>' + esc(q.explanation) + '</p></div>';
    }

    $('card').innerHTML = h;

    // bottom bar
    var act = $('act');
    if (done) {
      act.textContent = 'Try again';
      act.disabled = false;
    } else {
      act.textContent = 'Check answer';
      act.disabled = p.s == null;
    }
    $('prev').disabled = idx === 0;
    $('next').disabled = idx === N - 1;

    updatePalette();
    updateSummary();
  }

  /* ---------- palette ---------- */
  function buildPalette() {
    var g = $('grid');
    var h = '';
    for (var i = 0; i < N; i++) {
      h += '<button type="button" class="cell" data-n="' + i + '" aria-label="Question ' + (i + 1) + '">' + (i + 1) + '</button>';
    }
    h += '<p class="empty" id="emptyMsg" hidden>No questions match this filter.</p>';
    g.innerHTML = h;
  }
  function updatePalette() {
    var cells = $('grid').querySelectorAll('.cell');
    var shown = 0;
    for (var i = 0; i < cells.length; i++) {
      var q = Q[i], s = status(q), f = !!(P[q.id] && P[q.id].f);
      var c = cells[i];
      c.className = 'cell ' + s + (f ? ' flag' : '') + (i === idx ? ' cur' : '');
      var vis = filter === 'all' ||
        (filter === 'new' && (s === 'new' || s === 'sel')) ||
        (filter === 'bad' && s === 'bad') ||
        (filter === 'flag' && f);
      c.hidden = !vis;
      if (vis) shown++;
    }
    $('emptyMsg').hidden = shown > 0;
  }
  function updateSummary() {
    var c = counts();
    var checked = c.ok + c.bad;
    $('summary').textContent = checked + ' checked \u00b7 ' + c.ok + ' correct';
    $('meterBar').style.width = ((checked + c.seen) / N * 100) + '%';
  }

  /* ---------- navigation ---------- */
  function go(n) {
    if (n < 0) n = 0;
    if (n > N - 1) n = N - 1;
    idx = n;
    try { history.replaceState(null, '', '#q=' + (n + 1)); } catch (e) { /* ignore */ }
    try {
      var pos = JSON.parse(localStorage.getItem(POS)) || {};
      pos[D.setKey] = n;
      localStorage.setItem(POS, JSON.stringify(pos));
    } catch (e) { /* ignore */ }
    render();
    window.scrollTo(0, 0);
  }
  function openSheet() { document.body.classList.add('sheet-open'); }
  function closeSheet() { document.body.classList.remove('sheet-open'); }

  /* ---------- actions ---------- */
  function choose(i) {
    var q = Q[idx];
    if (isDone(status(q))) return;
    rec(q).s = i;
    save();
    render();
  }
  function check() {
    var q = Q[idx], p = rec(q);
    if (p.s == null || p.c || p.r) return;
    p.c = 1;
    save();
    render();
  }
  function reveal() {
    var q = Q[idx], p = rec(q);
    if (p.c || p.r) return;
    p.r = 1;
    save();
    render();
  }
  function retry() {
    var q = Q[idx], p = P[q.id];
    if (!p) return;
    var f = p.f;
    delete P[q.id];
    if (f) P[q.id] = { f: 1 };
    save();
    render();
  }
  function toggleFlag() {
    var q = Q[idx], p = rec(q);
    if (p.f) delete p.f; else p.f = 1;
    if (!Object.keys(p).length) delete P[q.id];
    save();
    render();
  }
  function resetSet() {
    if (!window.confirm('Clear all answers and flags for the ' + N + ' questions in this set?')) return;
    for (var i = 0; i < N; i++) delete P[Q[i].id];
    save();
    go(0);
  }

  /* ---------- results ---------- */
  function showResults() {
    var c = counts();
    var attempted = c.ok + c.bad;
    var acc = attempted ? Math.round(c.ok / attempted * 100) + '%' : '\u2013';
    var by = {};
    for (var i = 0; i < N; i++) {
      var q = Q[i];
      var t = by[q.topic] || (by[q.topic] = { ok: 0, bad: 0, n: 0 });
      t.n++;
      var s = status(q);
      if (s === 'ok') t.ok++;
      if (s === 'bad') t.bad++;
    }
    var h = '<h2 id="mTitle">Your results</h2>';
    h += '<div class="score"><strong>' + c.ok + ' / ' + N + '</strong><span>correct \u00b7 accuracy ' + acc + ' on attempted</span></div>';
    h += '<div class="tiles">' +
         '<div><b>' + c.ok + '</b><small>Correct</small></div>' +
         '<div><b>' + c.bad + '</b><small>Wrong</small></div>' +
         '<div><b>' + c.seen + '</b><small>Solution viewed</small></div>' +
         '<div><b>' + (c.new + c.sel) + '</b><small>Unattempted</small></div></div>';
    var topics = Object.keys(by);
    if (topics.length > 1) {
      h += '<table class="bytopic"><thead><tr><th>Topic</th><th>Correct</th></tr></thead><tbody>';
      for (var k = 0; k < topics.length; k++) {
        var tt = by[topics[k]];
        h += '<tr><td>' + esc(D.topicNames[topics[k]] || topics[k]) + '</td><td>' + tt.ok + ' / ' + tt.n + '</td></tr>';
      }
      h += '</tbody></table>';
    }
    h += '<div class="modal-actions">';
    if (c.bad > 0) h += '<button type="button" class="btn primary" id="reviewWrong">Review wrong answers</button>';
    h += '<button type="button" class="btn" id="closeModal">Close</button></div>';
    $('modalBox').innerHTML = h;
    $('modal').hidden = false;
    var first = $('reviewWrong') || $('closeModal');
    if (first) first.focus();
  }
  function closeModal() { $('modal').hidden = true; }

  function setFilter(f) {
    filter = f;
    var chips = $('filters').querySelectorAll('.chip');
    for (var i = 0; i < chips.length; i++) chips[i].classList.toggle('on', chips[i].getAttribute('data-f') === f);
    updatePalette();
  }

  /* ---------- wiring ---------- */
  $('card').addEventListener('click', function (e) {
    var t = e.target.closest('button');
    if (!t) return;
    if (t.classList.contains('choice')) choose(parseInt(t.getAttribute('data-i'), 10));
    else if (t.id === 'showSol') reveal();
    else if (t.id === 'flagBtn') toggleFlag();
  });
  $('act').addEventListener('click', function () {
    if (isDone(status(Q[idx]))) retry(); else check();
  });
  $('prev').addEventListener('click', function () { go(idx - 1); });
  $('next').addEventListener('click', function () { go(idx + 1); });
  $('openJump').addEventListener('click', openSheet);
  $('closeJump').addEventListener('click', closeSheet);
  $('scrim').addEventListener('click', closeSheet);
  $('openResults').addEventListener('click', showResults);
  $('resetSet').addEventListener('click', resetSet);
  $('grid').addEventListener('click', function (e) {
    var t = e.target.closest('.cell');
    if (!t) return;
    go(parseInt(t.getAttribute('data-n'), 10));
    closeSheet();
  });
  $('filters').addEventListener('click', function (e) {
    var t = e.target.closest('.chip');
    if (t) setFilter(t.getAttribute('data-f'));
  });
  $('jumpForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var v = parseInt($('jumpNum').value, 10);
    if (isNaN(v) || v < 1 || v > N) { $('jumpNum').focus(); return; }
    go(v - 1);
    $('jumpNum').value = '';
    closeSheet();
  });
  $('modalBox').addEventListener('click', function (e) {
    var t = e.target.closest('button');
    if (!t) return;
    if (t.id === 'closeModal') closeModal();
    if (t.id === 'reviewWrong') {
      closeModal();
      setFilter('bad');
      for (var i = 0; i < N; i++) { if (status(Q[i]) === 'bad') { go(i); break; } }
    }
  });
  $('modal').addEventListener('click', function (e) { if (e.target === $('modal')) closeModal(); });

  document.addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
    if (e.key === 'Escape') { closeModal(); closeSheet(); return; }
    if (!$('modal').hidden) return;
    if (e.key === 'ArrowRight') { go(idx + 1); }
    else if (e.key === 'ArrowLeft') { go(idx - 1); }
    else if (e.key === 'Enter' && tag !== 'BUTTON') {
      if (isDone(status(Q[idx]))) go(idx + 1); else check();
    } else {
      var k = e.key.toLowerCase(), n = -1;
      if (k >= 'a' && k <= 'd') n = k.charCodeAt(0) - 97;
      else if (k >= '1' && k <= '4') n = parseInt(k, 10) - 1;
      if (n >= 0 && n < Q[idx].options.length) choose(n);
    }
  });

  /* ---------- start ---------- */
  buildPalette();
  var start = 0;
  var m = /#q=(\d+)/.exec(location.hash);
  if (m) {
    start = parseInt(m[1], 10) - 1;
  } else {
    try {
      var saved = (JSON.parse(localStorage.getItem(POS)) || {})[D.setKey];
      if (typeof saved === 'number') start = saved;
    } catch (e) { /* ignore */ }
  }
  if (isNaN(start) || start < 0 || start >= N) start = 0;
  go(start);
})();
