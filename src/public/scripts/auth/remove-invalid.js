document.addEventListener("DOMContentLoaded", function () {
  const inputs = document.querySelectorAll("form input");

  const errorMessage = document.querySelector(".error-message");
  console.log(errorMessage);
  const successMessage = document.querySelector(".success-message");
  console.log(successMessage);

  if (errorMessage) {
    setTimeout(() => {
      errorMessage.classList.add("hidden");
    }, 2500);
  }

  if (successMessage) {
    setTimeout(() => {
      successMessage.classList.add("hidden");
    }, 2500);
  }

  inputs.forEach((input) => {
    input.addEventListener("focus", function () {
      input.classList.remove("invalid");
      const label = document.querySelector(`label[for="${input.id}"]`);
      if (label) {
        label.classList.remove("invalid");
      }
    });
  });
});
