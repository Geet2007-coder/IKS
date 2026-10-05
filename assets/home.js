(function () {
  'use strict';
  var H = window.IKS_HOME;
  var KEY = 'iks_progress_v1';
  var P = {};
  try { P = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { P = {}; }

  // The quiz page stores only s (selected), c (checked) and r (revealed); correctness
  // is decided against the answer key, so we load it lazily from the data attribute below.
  var answers = null;
  function loadAnswers(done) {
    if (answers) return done();
    var x = new XMLHttpRequest();
    x.open('GET', 'data/questions.json');
    x.onload = function () {
      try {
        var d = JSON.parse(x.responseText);
        answers = {};
        d.questions.forEach(function (q) { answers[q.id] = q.answer; });
      } catch (e) { answers = {}; }
      done();
    };
    x.onerror = function () { answers = {}; done(); };
    x.send();
  }

  function paint() {
    var totalChecked = 0, totalOk = 0;
    H.topics.forEach(function (t) {
      var checked = 0, ok = 0;
      t.ids.forEach(function (id) {
        var p = P[id];
        if (p && p.c) {
          checked++;
          if (answers[id] === p.s) ok++;
        }
      });
      totalChecked += checked;
      totalOk += ok;
      var btn = document.querySelector('.topic[data-topic="' + t.id + '"]');
      if (!btn) return;
      var bar = btn.querySelector('[data-bar]');
      var lab = btn.querySelector('[data-done]');
      if (bar) bar.style.width = (t.ids.length ? checked / t.ids.length * 100 : 0) + '%';
      if (lab) lab.textContent = checked ? checked + ' checked \u00b7 ' + ok + ' correct' : '';
    });
    document.getElementById('st-checked').textContent = totalChecked;
    document.getElementById('st-correct').textContent = totalOk;
    document.getElementById('st-acc').textContent = totalChecked ? Math.round(totalOk / totalChecked * 100) + '%' : '\u2013';
  }

  loadAnswers(paint);

  document.getElementById('resetAll').addEventListener('click', function () {
    if (!window.confirm('Delete all saved answers, flags and positions in this browser?')) return;
    try { localStorage.removeItem(KEY); localStorage.removeItem('iks_position_v1'); } catch (e) { /* ignore */ }
    P = {};
    paint();
  });
})();
