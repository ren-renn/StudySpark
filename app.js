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
    updateCardUI();
  }
});

prevButton.addEventListener("click", () => {
  if (currIndex > 0) {
    currIndex--;
    updateCardUI();
  }
});

const cardForm = document.querySelector("#card-form");
const userQuestion = document.querySelector("#user-question");
const userAnswer = document.querySelector("#user-answer");

cardForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const questionInput = userQuestion.value.trim();
  const answerInput = userAnswer.value.trim();

  let hasError = false;

  if (questionInput === "") {
    userQuestion.setCustomValidity("This field can't be empty!");

    hasError = true;
  } else {
    userQuestion.setCustomValidity("");
  }

  if (answerInput === "") {
    userAnswer.setCustomValidity("This field can't be empty!");

    hasError = true;
  } else {
    userAnswer.setCustomValidity("");
  }

  if (hasError) {
    userQuestion.reportValidity();
    userAnswer.reportValidity();
    return;
  }

  flashCards.push({ question: questionInput, answer: answerInput });

  currIndex = flashCards.length - 1;

  updateCardUI();

  userQuestion.value = "";
  userAnswer.value = "";
});
