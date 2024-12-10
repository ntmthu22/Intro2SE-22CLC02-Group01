const cardHeader = document.querySelector(".card-header");
const allCardBodies = document.querySelectorAll(".paragraph");

cardHeader.addEventListener("click", function (event) {
  if (!event.target.classList.contains("nav-link")) {
    return;
  }
  const cardId = event.target.dataset.cardId;
  allCardBodies.forEach((card) => {
    card.classList.add("d-none");
  });
  document.getElementById(`card-${cardId}`).classList.remove("d-none");
  document.querySelector(".nav-link.active").classList.remove("active");
  document.getElementById(`nav-link-${cardId}`).classList.add("active");
});
