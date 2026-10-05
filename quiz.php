<?php
require __DIR__ . '/includes/data.php';
$data = iks_load();

$topicId = isset($_GET['topic']) ? (string)$_GET['topic'] : 'all';
$type    = isset($_GET['type']) ? (string)$_GET['type'] : '';
$order   = (isset($_GET['order']) && $_GET['order'] === 'shuffle') ? 'shuffle' : 'order';
$seed    = isset($_GET['seed']) ? (int)$_GET['seed'] : 0;

$topics = [];
foreach ($data['topics'] as $t) { $topics[$t['id']] = $t; }
if ($topicId !== 'all' && !isset($topics[$topicId])) { $topicId = 'all'; }

$qs = [];
foreach ($data['questions'] as $q) {
    if (($topicId === 'all' || $q['topic'] === $topicId) && ($type === '' || $q['type'] === $type)) {
        $qs[] = $q;
    }
}
if (!$qs) { header('Location: index.php'); exit; }

if ($order === 'shuffle') {
    if ($seed <= 0) {
        $params = ['topic' => $topicId, 'order' => 'shuffle', 'seed' => mt_rand(1, 999999)];
        if ($type !== '') { $params['type'] = $type; }
        header('Location: quiz.php?' . http_build_query($params));
        exit;
    }
    mt_srand($seed);
    for ($i = count($qs) - 1; $i > 0; $i--) {
        $j = mt_rand(0, $i);
        $tmp = $qs[$i]; $qs[$i] = $qs[$j]; $qs[$j] = $tmp;
    }
}

$title = ($topicId === 'all') ? 'All topics' : $topics[$topicId]['name'];
$topicNames = [];
foreach ($topics as $id => $t) { $topicNames[$id] = $t['name']; }

$payload = [
    'title'      => $title,
    'setKey'     => $topicId . '|' . $type . '|' . $order . '|' . $seed,
    'topicNames' => $topicNames,
    'questions'  => $qs,
];
$pageTitle = $title . ' · IKS Practice Quiz';
$bodyClass = 'quiz';
require __DIR__ . '/includes/header.php';
?>
<div class="app" id="app">
  <header class="top">
    <a class="back" href="index.php" aria-label="Back to topics">&#8592;</a>
    <div class="top-title">
      <strong id="setTitle"><?= iks_h($title) ?></strong>
      <span id="summary" aria-live="polite"></span>
    </div>
    <button type="button" class="btn small" id="openJump" aria-controls="palette">Jump</button>
    <button type="button" class="btn small ghost" id="openResults">Results</button>
    <div class="meter" aria-hidden="true"><i id="meterBar"></i></div>
  </header>

  <main class="stage">
    <section class="card" id="card" aria-live="polite"></section>
  </main>

  <aside class="palette" id="palette" aria-label="Question navigator">
    <div class="sheet-head">
      <strong>Jump to question</strong>
      <button type="button" class="btn small ghost" id="closeJump">Close</button>
    </div>
    <form class="jumpto" id="jumpForm">
      <label for="jumpNum">Go to #</label>
      <input id="jumpNum" type="number" inputmode="numeric" min="1" placeholder="1&ndash;<?= count($qs) ?>">
      <button class="btn small primary" type="submit">Go</button>
    </form>
    <div class="chips" id="filters" role="group" aria-label="Filter questions">
      <button type="button" class="chip on" data-f="all">All</button>
      <button type="button" class="chip" data-f="new">Unattempted</button>
      <button type="button" class="chip" data-f="bad">Wrong</button>
      <button type="button" class="chip" data-f="flag">Flagged</button>
    </div>
    <div class="grid" id="grid"></div>
    <ul class="legend">
      <li><i class="sw new"></i>Not attempted</li>
      <li><i class="sw sel"></i>Selected</li>
      <li><i class="sw ok"></i>Correct</li>
      <li><i class="sw bad"></i>Wrong</li>
      <li><i class="sw seen"></i>Solution viewed</li>
    </ul>
    <button type="button" class="link" id="resetSet">Reset this set</button>
  </aside>
  <div class="scrim" id="scrim"></div>

  <nav class="navbar" aria-label="Question controls">
    <button type="button" class="btn" id="prev">&#8249; Prev</button>
    <button type="button" class="btn primary" id="act">Check answer</button>
    <button type="button" class="btn" id="next">Next &#8250;</button>
  </nav>

  <div class="modal" id="modal" role="dialog" aria-modal="true" aria-labelledby="mTitle" hidden>
    <div class="modal-box" id="modalBox"></div>
  </div>
</div>
<script>window.IKS = <?= iks_json($payload) ?>;</script>
<script src="<?= iks_h(iks_asset('assets/quiz.js')) ?>"></script>
<?php require __DIR__ . '/includes/footer.php'; ?>
