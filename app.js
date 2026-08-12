const defaultSM2 = {
  repetition: 0,
  interval: 1,
  easeFactor: 2.5,
  nextReviewDate: new Date().toLocaleDateString("sv-SE"),
};

const flashCards = JSON.parse(localStorage.getItem("flashCards")) || [
  {
    id: 1,
    question: "What does HTML stand for?",
    answer: "HyperText Markup Language",
    ...defaultSM2,
  },
  {
    id: 2,
    question: "What does CSS stand for?",
    answer: "Cascading Style Sheets",
    ...defaultSM2,
  },
  {
    id: 3,
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
const generateBtn = document.querySelector("#generate-btn");

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

function getDueCards() {
  const today = new Date().toLocaleDateString("sv-SE");

  return flashCards.filter((card) => card.nextReviewDate <= today);
}

function updateCardUI() {
  cardInner.classList.remove("is-flipped");
  ratingButtons.classList.remove("show");

  const dueCards = getDueCards();

  if (dueCards.length === 0) {
    questionText.textContent = "All caught up!";
    questionAnswer.textContent = "No cards due for review today!";
    progress.textContent = "0 of 0";
    return;
  }

  if (currIndex >= dueCards.length) {
    currIndex = 0;
  }

  setTimeout(() => {
    questionText.textContent = dueCards[currIndex].question;
    questionAnswer.textContent = dueCards[currIndex].answer;
    progress.textContent = `${currIndex + 1} of ${dueCards.length}`;
  }, 200);
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
  const dueCards = getDueCards();

  if (currIndex < dueCards.length - 1) {
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
  const dueCards = getDueCards();

  if (dueCards.length === 0) return;

  const currentCard = dueCards[currIndex];
  const mainIndex = flashCards.findIndex((c) =>
    c.id ? c.id === currentCard.id : c.question === currentCard.question,
  );

  if (mainIndex !== -1) {
    flashCards.splice(mainIndex, 1);
  }

  if (currIndex >= getDueCards().length) {
    currIndex = Math.max(0, getDueCards().length - 1);
  }

  localStorage.setItem("flashCardsIndex", currIndex);
  localStorage.setItem("flashCards", JSON.stringify(flashCards));

  updateCardUI();
});

editButton.addEventListener("click", () => {
  const dueCards = getDueCards();

  if (dueCards.length > 0) {
    userQuestion.value = dueCards[currIndex].question;
    userAnswer.value = dueCards[currIndex].answer;
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
  const dueCards = getDueCards();

  if (!button || dueCards.length === 0) return;

  const quality = Number(button.dataset.quality);
  const currentCard = dueCards[currIndex];

  const updatedCard = calculateSM2(currentCard, quality);

  const mainIndex = flashCards.findIndex((c) =>
    c.id ? c.id === currentCard.id : c.question === currentCard.question,
  );

  if (mainIndex !== -1) {
    flashCards[mainIndex] = updatedCard;
  }

  localStorage.setItem("flashCards", JSON.stringify(flashCards));

  const remainingDue = getDueCards();

  if (currIndex >= remainingDue.length) {
    currIndex = 0;
  }

  localStorage.setItem("flashCardsIndex", currIndex);
  updateCardUI();
});

generateBtn.addEventListener("click", async () => {
  const promptInput = document.querySelector("#ai-prompt-input");
  const apiKeyInput = document.querySelector("#api-key-input");

  const promptText = promptInput.value.trim();
  const apiKey = apiKeyInput.value.trim();

  if (!promptText || !apiKey) {
    alert("Please enter both an API key and a topic/notes!");
    return;
  }

  generateBtn.disabled = true;
  const originalTextBtn = generateBtn.textContent;
  generateBtn.textContent = "Generating cards...";

  try {
    const newCards = await generateFlashcardsWithAI(promptText, apiKey);

    const today = new Date().toLocaleDateString("sv-SE");

    const formattedCards = newCards.map((card) => ({
      ...card,
      id: Date.now() + Math.random(),
      repetition: 0,
      interval: 1,
      easeFactor: 2.5,
      nextReviewDate: today,
    }));

    flashCards.push(...formattedCards);

    localStorage.setItem("flashCards", JSON.stringify(flashCards));

    updateCardUI();

    promptInput.value = "";

    alert(`Successfully added ${newCards.length} AI cards!`);
  } catch (error) {
    console.error(error);
    alert("Failed to generate cards. Please check your API key and try again.");
  } finally {
    generateBtn.disabled = false;
    generateBtn.textContent = originalTextBtn;
  }
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
    const dueCards = getDueCards();
    const currentCard = dueCards[currIndex];
    const mainIndex = flashCards.findIndex((c) =>
      c.id ? c.id === currentCard.id : c.question === currentCard.question,
    );

    if (mainIndex !== -1) {
      flashCards[mainIndex] = {
        ...flashCards[mainIndex],
        question: questionInput,
        answer: answerInput,
      };
    }
    isEditing = false;
    submitCardButton.textContent = "Add flashcard";
  } else {
    flashCards.push({
      id: Date.now() + Math.random(),
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

async function generateFlashcardsWithAI(userText, apiKey) {
  const prompt = `
    Generate 5 flashcards based on the following text or topic:
    "${userText}"

    Respond ONLY with a valid JSON array of objects. Do NOT wrap in markdown or backticks.
    Format:
    [
      { "question": "Question text here", "answer": "Answer text here" }
    ]
  `;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    },
  );

  const data = await response.json();
  const rawText = data.candidates[0].content.parts[0].text;

  return JSON.parse(rawText.replace(/```json|```/g, "").trim());
}

updateCardUI();
