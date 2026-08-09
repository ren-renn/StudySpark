const defaultSM2 = {
  repetition: 0,
  interval: 1,
  easeFactor: 2.5,
  nextReviewDate: new Date().toLocaleDateString("sv-SE"),
};

const flashCards = JSON.parse(localStorage.getItem("flashCards")) || [
  {
    question: "What does HTML stand for?",
    answer: "HyperText Markup Language",
    ...defaultSM2,
  },
  {
    question: "What does CSS stand for?",
    answer: "Cascading Style Sheets",
    ...defaultSM2,
  },
  {
    question: "What does JS stand for?",
    answer: "JavaScript",
    ...defaultSM2,
  },
];

let currIndex = Number(localStorage.getItem("flashCardsIndex")) || 0;

if (currIndex >= flashCards.length) {
  currIndex = 0;
}

let isEditing = false;

const cardInner = document.querySelector("#card-inner");
const questionText = document.querySelector("#question-text");
const questionAnswer = document.querySelector("#question-answer");
const progress = document.querySelector("#progress");
const prevButton = document.querySelector("#prev-btn");
const nextButton = document.querySelector("#next-btn");
const delButton = document.querySelector("#delete-btn");
const editButton = document.querySelector("#edit-btn");
const cardForm = document.querySelector("#card-form");
const userQuestion = document.querySelector("#user-question");
const userAnswer = document.querySelector("#user-answer");
const submitCardButton = document.querySelector("#submit-card");
const shuffleButton = document.querySelector("#shuffle-btn");
const ratingButtons = document.querySelector("#rating-btns");

function calculateSM2(card, quality) {
  let repetition = card.repetition || 0;
  let interval = card.interval || 1;
  let easeFactor = card.easeFactor || 2.5;

  if (quality < 3) {
    repetition = 0;
    interval = 1;
  } else {
    if (repetition === 0) {
      interval = 1;
    } else if (repetition === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetition++;
  }

  easeFactor =
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + interval);

  return {
    ...card,
    repetition,
    interval,
    easeFactor: Number(easeFactor.toFixed(2)),
    nextReviewDate: nextDate.toLocaleDateString("sv-SE"),
  };
}

function updateCardUI() {
  cardInner.classList.remove("is-flipped");
  ratingButtons.classList.remove("show");

  if (flashCards.length === 0) {
    questionText.textContent = "No flashcards left!";
    questionAnswer.textContent = "Please add flashcard first!";
    progress.textContent = "0 of 0";
  } else {
    setTimeout(() => {
      questionText.textContent = flashCards[currIndex].question;
      questionAnswer.textContent = flashCards[currIndex].answer;
      progress.textContent = `${currIndex + 1} of ${flashCards.length}`;
    }, 200);
  }
}

cardInner.addEventListener("click", () => {
  cardInner.classList.toggle("is-flipped");

  if (cardInner.classList.contains("is-flipped")) {
    ratingButtons.classList.add("show");
  } else {
    ratingButtons.classList.remove("show");
  }
});

nextButton.addEventListener("click", () => {
  if (currIndex < flashCards.length - 1) {
    currIndex++;
    localStorage.setItem("flashCardsIndex", currIndex);
    updateCardUI();
  }
});

prevButton.addEventListener("click", () => {
  if (currIndex > 0) {
    currIndex--;
    localStorage.setItem("flashCardsIndex", currIndex);
    updateCardUI();
  }
});

delButton.addEventListener("click", () => {
  flashCards.splice(currIndex, 1);

  if (currIndex >= flashCards.length) {
    currIndex = flashCards.length - 1;
  } else if (currIndex < 0) {
    currIndex = 0;
  }

  localStorage.setItem("flashCardsIndex", currIndex);
  localStorage.setItem("flashCards", JSON.stringify(flashCards));

  updateCardUI();
});

editButton.addEventListener("click", () => {
  if (flashCards.length > 0) {
    userQuestion.value = flashCards[currIndex].question;
    userAnswer.value = flashCards[currIndex].answer;
    isEditing = true;
    submitCardButton.textContent = "Save Changes";
  }

  updateCardUI();
});

shuffleButton.addEventListener("click", () => {
  for (let i = flashCards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [flashCards[i], flashCards[j]] = [flashCards[j], flashCards[i]];
  }

  currIndex = 0;

  localStorage.setItem("flashCards", JSON.stringify(flashCards));
  localStorage.setItem("flashCardsIndex", currIndex);

  updateCardUI();
});

ratingButtons.addEventListener("click", (e) => {
  const button = e.target.closest("button");
  if (!button || flashCards.length === 0) return;

  const quality = Number(button.dataset.quality);

  const updatedCard = calculateSM2(flashCards[currIndex], quality);
  flashCards[currIndex] = updatedCard;

  localStorage.setItem("flashCards",JSON.stringify(flashCards));

  if (currIndex < flashCards.length - 1) {
    currIndex++;
  } else {
    currIndex = 0;
  }

  localStorage.setItem("flashCardsIndex", currIndex);
  updateCardUI();
});

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

  if (isEditing) {
    flashCards[currIndex] = {
      ...flashCards[currIndex],
      question: questionInput,
      answer: answerInput,
    };
    isEditing = false;
    submitCardButton.textContent = "Add flashcard";
  } else {
    flashCards.push({
      question: questionInput,
      answer: answerInput,
      repetition: 0,
      interval: 1,
      easeFactor: 2.5,
      nextReviewDate: new Date().toLocaleDateString("sv-SE"),
    });
    currIndex = flashCards.length - 1;
  }

  localStorage.setItem("flashCards", JSON.stringify(flashCards));
  localStorage.setItem("flashCardsIndex", currIndex);

  updateCardUI();

  userQuestion.value = "";
  userAnswer.value = "";
});

window.addEventListener("keydown", (e) => {
  if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
    return;
  }

  if (e.code === "Space") {
    e.preventDefault();
    cardInner.click();
  } else if (e.code === "ArrowRight") {
    nextButton.click();
  } else if (e.code === "ArrowLeft") {
    prevButton.click();
  }
});

updateCardUI();
