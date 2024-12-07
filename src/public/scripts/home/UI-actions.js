const logoutForm = document.getElementById("logout-form");

if (logoutForm) {
  logoutForm.addEventListener("submit", function (event) {
    event.preventDefault();
    Swal.fire({
      title: "Are you sure?",
      text: "You can't generate without logging in!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, log out!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        logoutForm.submit();
      }
    });
  });
}
