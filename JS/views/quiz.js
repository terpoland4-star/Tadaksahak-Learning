import { I18n } from '../services/i18n.js';
import { Store } from '../core/store.js';
import { escapeHtml } from '../core/utils.js';

let currentQuiz = { questions: [], index: 0, score: 0 };

export async function render() {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <section id="quiz">
      <h2 data-i18n="quiz_title">❓ Quiz Culturel</h2>
      <div id="quizContainer"><button id="startQuizBtn" class="btn" data-i18n="quiz_start">Commencer</button></div>
    </section>
  `;
  I18n.translatePage();
  const quizData = Store.state.quiz;
  document.getElementById('startQuizBtn').addEventListener('click', () => startQuiz(quizData));
}

function startQuiz(quizData) {
  const lang = Store.state.lang;
  const questions = quizData[lang] || quizData['fr'] || [];
  currentQuiz = { questions, index: 0, score: 0 };
  showQuestion();
}

function showQuestion() { /* ... affichage et gestion des réponses ... */ }
