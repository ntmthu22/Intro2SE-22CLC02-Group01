document.addEventListener("DOMContentLoaded", function () {
  const inputs = document.querySelectorAll("form input");

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
