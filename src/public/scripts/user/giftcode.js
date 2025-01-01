document.addEventListener("DOMContentLoaded", () => {
  const giftcodeInput = document.getElementById("giftcode");
  const submitButton = document.querySelector('button.btn[type="submit"]');

  giftcodeInput.addEventListener("input", () => {
    giftcodeInput.classList.remove("is-invalid");
  });

  submitButton.addEventListener("click", (e) => {
    if (giftcodeInput.value.trim() === "") {
      document.getElementById("giftcodeHelp").innerText =
        "Your giftcode shouldn't be blank.";
      e.preventDefault();
      giftcodeInput.classList.add("is-invalid");
    }
  });
});
