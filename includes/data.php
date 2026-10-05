<?php
// Loads the question bank (data/questions.json) once per request.
function iks_load() {
    static $data = null;
    if ($data !== null) {
        return $data;
    }
    $file = __DIR__ . '/../data/questions.json';
    $raw = is_readable($file) ? file_get_contents($file) : false;
    $data = $raw === false ? null : json_decode($raw, true);
    if (!is_array($data) || empty($data['questions'])) {
        http_response_code(500);
        exit('Could not read data/questions.json. Check that the file exists and is valid JSON.');
    }
    return $data;
}

function iks_h($s) {
    return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8');
}

function iks_json($v) {
    return json_encode($v, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);
}

function iks_asset($path) {
    $f = __DIR__ . '/../' . $path;
    return $path . (is_file($f) ? '?v=' . filemtime($f) : '');
}
