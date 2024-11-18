const logoutForm = document.getElementById("logout-form");

logoutForm.addEventListener("submit", function (event) {
  const confirmed = confirm("Are you sure you want to log out?");
  if (!confirmed) {
    event.preventDefault();
  }
});
