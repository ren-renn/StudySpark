const flashCards = [
  {
    question: "What does HTML stand for?",
    answer: "HyperText Markup Language",
  },
  {
    question: "What does CSS stand for?",
    answer: "Cascading Style Sheets",
  },
  {
    question: "What does JS stand for?",
    answer: "JavaScript",
  },
];

let currIndex = 0;

function updateCardUI() {
  const questionText = document.querySelector("#question-text");
  const questionAnswer = document.querySelector("#question-answer");
  const progress = document.querySelector("#progress");

  cardInner.classList.remove("is-flipped");

  setTimeout(() => {
    questionText.textContent = flashCards[currIndex].question;
    questionAnswer.textContent = flashCards[currIndex].answer;
    progress.textContent = `${currIndex + 1} of ${flashCards.length}`;
  }, 200);
}

const cardInner = document.querySelector("#card-inner");

cardInner.addEventListener("click", () => {
  cardInner.classList.toggle("is-flipped");
});

const prevButton = document.querySelector("#prev-btn");
const nextButton = document.querySelector("#next-btn");

nextButton.addEventListener("click", () => {
  if (currIndex < flashCards.length - 1) {
    currIndex++;
  }

  updateCardUI();
});

prevButton.addEventListener("click", () => {
  if (currIndex > 0) {
    currIndex--;
  }

  updateCardUI();
});
