document.addEventListener("DOMContentLoaded", () => {
  const nameInput = document.getElementById("name");
  const originalName = document.getElementById("originalName");
  const submitButton = document.querySelector('button.btn[type="submit"]');

  const initialValue = originalName.value;

  nameInput.addEventListener("input", () => {
    nameInput.classList.remove("is-invalid");
    if (nameInput.value.trim() !== initialValue.trim()) {
      submitButton.disabled = false;
    } else {
      submitButton.disabled = true;
    }
  });

  submitButton.addEventListener("click", (e) => {
    if (nameInput.value.trim() === "") {
      document.getElementById("nameHelp").innerText =
        "Your name shouldn't be blank.";
      e.preventDefault();
      nameInput.classList.add("is-invalid");
    }
  });
});
