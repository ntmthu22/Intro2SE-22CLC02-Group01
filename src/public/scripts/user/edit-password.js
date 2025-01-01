document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("passwordForm");

  form.addEventListener("input", (e) => {
    if (e.target.tagName === "INPUT") {
      e.target.classList.remove("is-invalid");
    }
  });
});
