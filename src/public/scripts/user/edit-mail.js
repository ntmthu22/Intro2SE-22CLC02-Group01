document.addEventListener("DOMContentLoaded", () => {
  const nameInput = document.getElementById("email");
  const originalEmail = document.getElementById("originalEmail");
  const submitButton = document.querySelector('button.btn[type="submit"]');
  const helper = document.getElementById("emailHelp");

  const initialValue = originalEmail.value;

  nameInput.addEventListener("input", () => {
    helper.innerText = "";
    nameInput.classList.remove("is-invalid");
    if (nameInput.value.trim() !== initialValue.trim()) {
      submitButton.disabled = false;
    } else {
      submitButton.disabled = true;
    }
  });

  submitButton.addEventListener("click", (e) => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nameInput.value.trim())) {
      helper.innerText = "Please fill in a valid email address.";
      e.preventDefault();
      nameInput.classList.add("is-invalid");
    }
  });
});
