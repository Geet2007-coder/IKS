<?php
// Expects $pageTitle and optional $bodyClass before inclusion.
if (!isset($bodyClass)) { $bodyClass = ''; }
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="color-scheme" content="light dark">
<title><?= iks_h($pageTitle) ?></title>
<link rel="stylesheet" href="<?= iks_h(iks_asset('assets/style.css')) ?>">
</head>
<body class="<?= iks_h($bodyClass) ?>">
