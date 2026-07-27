const cardInner = document.querySelector("#card-inner");


cardInner.addEventListener('click', () => {
  cardInner.classList.toggle('is-flipped')
});
