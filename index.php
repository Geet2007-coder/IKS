<?php
require __DIR__ . '/includes/data.php';
$data = iks_load();
$topics = $data['topics'];
$counts = [];
$ids = [];
$types = [];
foreach ($data['questions'] as $q) {
    $counts[$q['topic']] = ($counts[$q['topic']] ?? 0) + 1;
    $ids[$q['topic']][] = $q['id'];
    $types[$q['type']] = ($types[$q['type']] ?? 0) + 1;
}
ksort($types);
$total = count($data['questions']);
$pageTitle = 'IKS Practice Quiz';
$bodyClass = 'home';
$homeData = ['total' => $total, 'topics' => []];
foreach ($topics as $t) {
    $homeData['topics'][] = ['id' => $t['id'], 'ids' => $ids[$t['id']] ?? []];
}
$homeData['all'] = array_map(function ($q) { return $q['id']; }, $data['questions']);
require __DIR__ . '/includes/header.php';
?>
<main class="wrap">
  <header class="hero">
    <h1>IKS Practice Quiz</h1>
    <p class="lede"><?= (int)$total ?> exam-style MCQs on ancient Indian mathematics, computation, Sanskrit &amp; AI, agriculture and cattle breeds, built from your notes.</p>
    <div class="stats" id="stats" aria-live="polite">
      <div><strong id="st-checked">0</strong><span>checked</span></div>
      <div><strong id="st-correct">0</strong><span>correct</span></div>
      <div><strong id="st-acc">–</strong><span>accuracy</span></div>
    </div>
  </header>

  <form method="get" action="quiz.php" class="panel" id="startForm">
    <fieldset class="opts">
      <legend>Question order</legend>
      <label class="radio"><input type="radio" name="order" value="order" checked><span>In order</span></label>
      <label class="radio"><input type="radio" name="order" value="shuffle"><span>Shuffled</span></label>
    </fieldset>
    <label class="field">
      <span>Question type</span>
      <select name="type">
        <option value="">All types</option>
        <?php foreach ($types as $name => $n): ?>
          <option value="<?= iks_h($name) ?>"><?= iks_h($name) ?> (<?= (int)$n ?>)</option>
        <?php endforeach; ?>
      </select>
    </label>
    <button class="btn primary big" type="submit" name="topic" value="all">Start all <?= (int)$total ?> questions</button>

    <h2>Or practise one topic</h2>
    <ul class="topics">
      <?php foreach ($topics as $t): ?>
        <li>
          <button class="topic" type="submit" name="topic" value="<?= iks_h($t['id']) ?>" data-topic="<?= iks_h($t['id']) ?>">
            <span class="t-name"><?= iks_h($t['name']) ?></span>
            <span class="t-desc"><?= iks_h($t['desc']) ?></span>
            <span class="t-meta"><span class="t-count"><?= (int)($counts[$t['id']] ?? 0) ?> questions</span><span class="t-done" data-done></span></span>
            <span class="track"><i data-bar></i></span>
          </button>
        </li>
      <?php endforeach; ?>
    </ul>
  </form>

  <p class="foot">Progress is saved in this browser. <button type="button" class="link" id="resetAll">Reset all progress</button></p>
</main>
<script>window.IKS_HOME = <?= iks_json($homeData) ?>;</script>
<script src="<?= iks_h(iks_asset('assets/home.js')) ?>"></script>
<?php require __DIR__ . '/includes/footer.php'; ?>
