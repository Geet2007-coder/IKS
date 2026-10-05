IKS Practice Quiz (PHP)
=======================
Requirements: PHP 7.4+ (no database, no Composer).

Run locally
  cd iks-quiz
  php -S localhost:8000
  then open http://localhost:8000

Or copy the whole folder into XAMPP/WAMP/MAMP "htdocs" (or any Apache/Nginx+PHP web root)
and open /iks-quiz/ in the browser. It also works on any shared PHP hosting.

Files
  index.php            topic picker, order (in order / shuffled) and question-type filter
  quiz.php             the quiz (jump navigator, per-question check/solution, results)
  data/questions.json  the question bank - edit/add questions here
  includes/            shared PHP helpers + header/footer
  assets/              style.css, quiz.js, home.js

Progress (answers, flags, last position) is stored in the browser's localStorage.

Adding questions: append an object to "questions" in data/questions.json:
  {"id": 204, "topic": "kerala", "type": "Fact", "q": "...",
   "options": ["A","B","C","D"], "answer": 0, "explanation": "..."}
"answer" is the 0-based index of the correct option; "id" must be unique;
"topic" must match an id in "topics".
